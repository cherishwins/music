#!/usr/bin/env python3
"""
Shodan Crypto Infrastructure Intelligence
==========================================

Novel approach: Monitor exchange/protocol INFRASTRUCTURE to detect
pre-hack degradation signals before on-chain exploits happen.

Usage:
    pip install shodan python-dotenv tabulate
    export SHODAN_API_KEY=your_key_here
    python shodan-crypto-intel.py

Or run specific commands:
    python shodan-crypto-intel.py --info           # Check API credits
    python shodan-crypto-intel.py --exchanges      # Scan all exchanges
    python shodan-crypto-intel.py --exchange binance  # Scan specific exchange
    python shodan-crypto-intel.py --ton            # Scan TON infrastructure
    python shodan-crypto-intel.py --bitcoin        # Scan Bitcoin nodes
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path

try:
    import shodan
    from tabulate import tabulate
except ImportError:
    print("Installing required packages...")
    os.system("pip install shodan python-dotenv tabulate")
    import shodan
    from tabulate import tabulate

# Load .env if exists
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)

# Configuration
SHODAN_API_KEY = os.getenv("SHODAN_API_KEY", "")

# Major crypto exchanges to monitor
EXCHANGES = {
    "binance": {"name": "Binance", "org": "Binance"},
    "coinbase": {"name": "Coinbase", "org": "Coinbase"},
    "kraken": {"name": "Kraken", "org": "Payward"},
    "bybit": {"name": "Bybit", "org": "Bybit"},
    "okx": {"name": "OKX", "org": "OKX"},
    "kucoin": {"name": "KuCoin", "org": "KuCoin"},
    "gateio": {"name": "Gate.io", "org": "Gate"},
    "huobi": {"name": "Huobi", "org": "Huobi"},
    "bitfinex": {"name": "Bitfinex", "org": "iFinex"},
    "gemini": {"name": "Gemini", "org": "Gemini"},
    "crypto_com": {"name": "Crypto.com", "org": "Crypto.com"},
    "mexc": {"name": "MEXC", "org": "MEXC"},
}

# TON-specific queries
TON_QUERIES = {
    "liteserver": 'port:4924',
    "http_api": 'http.title:"TON"',
    "toncenter": 'hostname:toncenter',
}

# Risk-indicating ports
RISKY_PORTS = {
    "databases": [3306, 5432, 27017, 6379, 9200],
    "admin": [8080, 8443, 9090, 8888],
    "debug": [5000, 5001, 9229],
}


def get_api():
    """Initialize Shodan API client"""
    if not SHODAN_API_KEY:
        print("\n❌ SHODAN_API_KEY not set!")
        print("\nTo get started:")
        print("  1. Buy membership: https://account.shodan.io/billing ($49 one-time)")
        print("  2. Get API key: https://account.shodan.io")
        print("  3. Set it: export SHODAN_API_KEY=your_key_here")
        print("  4. Or add to .env file: SHODAN_API_KEY=your_key_here")
        sys.exit(1)
    return shodan.Shodan(SHODAN_API_KEY)


def check_api_info():
    """Check API credits and plan info"""
    api = get_api()
    info = api.info()

    print("\n🔑 SHODAN API STATUS")
    print("=" * 40)
    print(f"Plan: {info.get('plan', 'Unknown')}")
    print(f"Query Credits: {info.get('query_credits', 0)}")
    print(f"Scan Credits: {info.get('scan_credits', 0)}")
    print(f"Monitored IPs: {info.get('monitored_ips', 0)}")

    return info


def calculate_infra_score(api, name, org):
    """
    Calculate infrastructure security score for an entity

    Factors:
    - Exposed services (fewer = better)
    - Vulnerable hosts (CVEs)
    - SSL certificate health
    - Admin panel exposure
    - Database port exposure
    """
    print(f"\n🔍 Scanning {name}...")

    factors = {
        "exposed_services": 100,
        "vulnerabilities": 100,
        "ssl_health": 100,
        "admin_panels": 100,
        "database_exposure": 100,
    }
    risks = []

    try:
        # 1. Total exposure
        total = api.count(f'org:"{org}"')["total"]
        print(f"   📊 Total exposed services: {total}")

        if total > 100:
            penalty = min(30, total // 10)
            factors["exposed_services"] -= penalty
            risks.append(f"High exposure: {total} services")

        # 2. Admin panels
        admin_count = api.count(f'org:"{org}" http.title:admin')["total"]
        admin_count += api.count(f'org:"{org}" http.title:dashboard')["total"]
        print(f"   🔐 Admin panels exposed: {admin_count}")

        if admin_count > 0:
            factors["admin_panels"] -= min(50, admin_count * 10)
            risks.append(f"{admin_count} admin panels exposed")

        # 3. Database ports
        db_ports = ",".join(str(p) for p in RISKY_PORTS["databases"])
        db_count = api.count(f'org:"{org}" port:{db_ports}')["total"]
        print(f"   🗄️  Database ports exposed: {db_count}")

        if db_count > 0:
            factors["database_exposure"] -= min(60, db_count * 15)
            risks.append(f"{db_count} database ports exposed")

        # 4. Known vulnerabilities
        try:
            vuln_count = api.count(f'org:"{org}" vuln:*')["total"]
            print(f"   ⚠️  Hosts with CVEs: {vuln_count}")

            if vuln_count > 0:
                factors["vulnerabilities"] -= min(50, vuln_count * 5)
                risks.append(f"{vuln_count} hosts with known CVEs")
        except:
            print("   ⚠️  Vulnerability filter requires higher plan")

        # 5. Expired SSL
        try:
            ssl_expired = api.count(f'org:"{org}" ssl.cert.expired:true')["total"]
            print(f"   🔒 Expired SSL certs: {ssl_expired}")

            if ssl_expired > 0:
                factors["ssl_health"] -= min(40, ssl_expired * 10)
                risks.append(f"{ssl_expired} expired SSL certificates")
        except:
            pass

    except shodan.APIError as e:
        print(f"   ❌ API Error: {e}")
        risks.append("Scan incomplete")

    # Calculate weighted score
    weights = {
        "exposed_services": 0.15,
        "vulnerabilities": 0.30,
        "ssl_health": 0.15,
        "admin_panels": 0.20,
        "database_exposure": 0.20,
    }

    score = sum(factors[k] * weights[k] for k in factors)
    score = max(0, min(100, round(score)))

    # Grade
    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    elif score >= 70:
        grade = "C"
    elif score >= 60:
        grade = "D"
    else:
        grade = "F"

    return {
        "name": name,
        "org": org,
        "score": score,
        "grade": grade,
        "factors": factors,
        "risks": risks,
        "scanned_at": datetime.now().isoformat(),
    }


def scan_all_exchanges():
    """Scan all major exchanges and create leaderboard"""
    api = get_api()
    results = []

    print("\n🏦 CRYPTO EXCHANGE INFRASTRUCTURE SCAN")
    print("=" * 50)

    for key, exchange in EXCHANGES.items():
        try:
            result = calculate_infra_score(api, exchange["name"], exchange["org"])
            results.append(result)
        except Exception as e:
            print(f"   ❌ Failed: {e}")

    # Sort by score
    results.sort(key=lambda x: x["score"], reverse=True)

    # Print leaderboard
    print("\n\n🏆 EXCHANGE SECURITY LEADERBOARD")
    print("=" * 50)

    table_data = []
    for i, r in enumerate(results, 1):
        grade_emoji = {"A": "🟢", "B": "🟡", "C": "🟠", "D": "🔴", "F": "💀"}[r["grade"]]
        table_data.append([
            i,
            r["name"],
            f"{r['score']}/100",
            f"{grade_emoji} {r['grade']}",
            ", ".join(r["risks"][:2]) if r["risks"] else "No major risks"
        ])

    print(tabulate(table_data, headers=["Rank", "Exchange", "Score", "Grade", "Top Risks"]))

    # Save results
    output_path = Path(__file__).parent / "exchange_scores.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n💾 Results saved to {output_path}")

    return results


def scan_single_exchange(exchange_key):
    """Scan a specific exchange in detail"""
    api = get_api()

    if exchange_key not in EXCHANGES:
        print(f"❌ Unknown exchange: {exchange_key}")
        print(f"Available: {', '.join(EXCHANGES.keys())}")
        return

    exchange = EXCHANGES[exchange_key]
    result = calculate_infra_score(api, exchange["name"], exchange["org"])

    print(f"\n\n📊 {result['name']} INFRASTRUCTURE REPORT")
    print("=" * 50)
    print(f"Score: {result['score']}/100 ({result['grade']})")
    print(f"\nFactor Breakdown:")
    for factor, value in result["factors"].items():
        bar = "█" * (value // 5) + "░" * (20 - value // 5)
        print(f"  {factor:20s} [{bar}] {value}/100")

    if result["risks"]:
        print(f"\n⚠️  Identified Risks:")
        for risk in result["risks"]:
            print(f"  • {risk}")

    # Get sample hosts
    print(f"\n📍 Sample Exposed Services:")
    try:
        hosts = api.search(f'org:"{exchange["org"]}"', limit=5)
        for match in hosts["matches"][:5]:
            product = match.get("product", "Unknown")
            port = match.get("port", "?")
            country = match.get("location", {}).get("country_code", "??")
            print(f"  • {match['ip_str']}:{port} - {product} ({country})")
    except:
        print("  (Requires query credits)")

    return result


def scan_ton_infrastructure():
    """Scan TON blockchain infrastructure"""
    api = get_api()

    print("\n💎 TON BLOCKCHAIN INFRASTRUCTURE SCAN")
    print("=" * 50)

    results = {}

    for query_name, query in TON_QUERIES.items():
        try:
            count = api.count(query)["total"]
            print(f"  {query_name}: {count} hosts found")
            results[query_name] = count
        except Exception as e:
            print(f"  {query_name}: Error - {e}")

    # Get geographic distribution
    print("\n🌍 Geographic Distribution:")
    try:
        facets = api.count(TON_QUERIES["liteserver"], facets=["country:10"])
        for country in facets.get("facets", {}).get("country", []):
            print(f"  {country['value']}: {country['count']} nodes")
    except:
        print("  (Requires query credits for facets)")

    return results


def scan_bitcoin_nodes():
    """Scan Bitcoin network infrastructure"""
    api = get_api()

    print("\n₿ BITCOIN NODE INFRASTRUCTURE SCAN")
    print("=" * 50)

    try:
        count = api.count("bitcoin port:8333")["total"]
        print(f"  Total Bitcoin nodes: {count}")

        # Geographic distribution
        print("\n🌍 Top Countries:")
        facets = api.count("bitcoin port:8333", facets=["country:10"])
        for country in facets.get("facets", {}).get("country", []):
            print(f"  {country['value']}: {country['count']} nodes")

        # Version distribution
        print("\n📦 Version Distribution:")
        facets = api.count("bitcoin port:8333", facets=["bitcoin.version:5"])
        for version in facets.get("facets", {}).get("bitcoin.version", []):
            print(f"  v{version['value']}: {version['count']} nodes")

    except Exception as e:
        print(f"  Error: {e}")


def demo_mode():
    """Run without API key - show what WOULD be searched"""
    print("\n🎭 DEMO MODE (No API Key)")
    print("=" * 50)
    print("\nThis is what we WOULD search with a Shodan API key:\n")

    print("📊 Exchange Infrastructure Queries:")
    for key, ex in list(EXCHANGES.items())[:3]:
        print(f'  org:"{ex["org"]}"')
        print(f'  org:"{ex["org"]}" http.title:admin')
        print(f'  org:"{ex["org"]}" port:3306,5432,27017')
        print()

    print("💎 TON Infrastructure Queries:")
    for name, query in TON_QUERIES.items():
        print(f"  {name}: {query}")

    print("\n₿ Bitcoin Queries:")
    print("  bitcoin port:8333")
    print("  bitcoin port:8333 country:US")

    print("\n💡 To get started:")
    print("  1. Buy membership: https://account.shodan.io/billing ($49)")
    print("  2. Get API key: https://account.shodan.io")
    print("  3. export SHODAN_API_KEY=your_key")
    print("  4. python shodan-crypto-intel.py --exchanges")


def main():
    parser = argparse.ArgumentParser(description="Crypto Infrastructure Intelligence via Shodan")
    parser.add_argument("--info", action="store_true", help="Check API credits")
    parser.add_argument("--exchanges", action="store_true", help="Scan all exchanges")
    parser.add_argument("--exchange", type=str, help="Scan specific exchange")
    parser.add_argument("--ton", action="store_true", help="Scan TON infrastructure")
    parser.add_argument("--bitcoin", action="store_true", help="Scan Bitcoin nodes")
    parser.add_argument("--demo", action="store_true", help="Demo mode (no API key)")

    args = parser.parse_args()

    print("\n🐯 CRYPTO INFRASTRUCTURE INTELLIGENCE")
    print("    Powered by Shodan + White Tiger")
    print("=" * 50)

    if args.demo or not SHODAN_API_KEY:
        demo_mode()
        return

    if args.info:
        check_api_info()
    elif args.exchanges:
        scan_all_exchanges()
    elif args.exchange:
        scan_single_exchange(args.exchange)
    elif args.ton:
        scan_ton_infrastructure()
    elif args.bitcoin:
        scan_bitcoin_nodes()
    else:
        check_api_info()
        print("\n📖 Usage:")
        print("  --info       Check API credits")
        print("  --exchanges  Scan all major exchanges")
        print("  --exchange X Scan specific exchange (binance, coinbase, etc)")
        print("  --ton        Scan TON blockchain infrastructure")
        print("  --bitcoin    Scan Bitcoin node network")


if __name__ == "__main__":
    main()
