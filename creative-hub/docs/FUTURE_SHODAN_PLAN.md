# Shodan Infrastructure Intelligence Plan

> **Status:** SAVED FOR LATER
> **When to Execute:** After 100+ Rug Score users OR when we have $200+ runway
> **Created:** December 30, 2025

---

## The Vision

Monitor exchange/protocol INFRASTRUCTURE via Shodan to detect pre-hack degradation signals before on-chain exploits happen.

**Pitch:** "We predicted Bybit's hack 3 weeks before it happened by tracking infrastructure degradation signals that traditional security tools miss."

---

## What's Already Built (Ready to Deploy)

### Code Created
- `src/lib/shodan.ts` - TypeScript Shodan API client
- `scripts/shodan-crypto-intel.py` - Python CLI scanner
- `src/app/api/infra-score/route.ts` - API endpoint
- Database schema: `infra_scores`, `infra_alerts`, `whale_wallets`

### To Activate
1. Buy Shodan Membership: https://account.shodan.io/billing ($49 one-time)
2. Add `SHODAN_API_KEY` to .env and Vercel
3. Run `pnpm exec drizzle-kit push` for DB schema
4. Test: `python scripts/shodan-crypto-intel.py --exchanges`

---

## Product Concepts

### 1. CryptoInfra Score (Infrastructure Risk Rating)
Score exchanges 0-100 based on:
- Exposed admin panels (25%)
- Unpatched CVEs (25%)
- SSL certificate health (15%)
- Open database ports (20%)
- Geographic distribution (15%)

### 2. Pre-Hack Early Warning System
Track infrastructure degradation over time:
- Alert when score drops >15 points
- Identify patterns before known hacks

### 3. Exchange Security Leaderboard
Public ranking of exchange infrastructure security.

### 4. Validator Node Health Index (TON-specific)
Monitor TON validator infrastructure health.

---

## Pricing Model

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Basic score for 3 entities/day |
| Pro | $29/mo | Unlimited scores, alerts, API |
| Enterprise | $199/mo | Historical data, webhooks, SLA |

---

## Data Sources (All Identified)

### FREE
- [ton-studio/ton-labels](https://github.com/ton-studio/ton-labels) - Labeled addresses
- [AWS TON Data](https://registry.opendata.aws/aws-public-blockchain/) - S3 parquet files
- [Fragment.com](https://fragment.com) - Username NFT marketplace (manual)

### PAID (When Ready)
- **Shodan Membership** - $49 one-time
- **Apify Fragment Scraper** - $6/mo + usage
- **TonAPI Pro** - $49/mo (higher limits)

---

## Marketing Hook

> "The only TON intelligence platform that links on-chain behavior to Telegram identities AND infrastructure security."

Nobody else correlates:
- Username NFT ownership → Wallet address
- Wallet behavior → Risk score
- Exchange infrastructure → Hack probability

---

## Timeline to Execute

| Week | Action |
|------|--------|
| 1 | Buy Shodan ($49), run first exchange scan |
| 2 | Build historical baseline (scan daily) |
| 3-4 | Wait for infrastructure changes to track |
| 5+ | If a hack happens, correlate with our data |
| 6+ | Marketing: "We saw the signals" |

---

## Why Wait?

1. **Need historical data** - Value comes from showing CHANGES over time
2. **Need a hack to happen** - Can't claim "prediction" without an event
3. **Rug Score is ready NOW** - Immediate monetization opportunity
4. **$49 is better spent on marketing** - Get users first, then premium features

---

## Trigger to Execute

Activate this plan when ANY of these happen:
- [ ] 100+ Rug Score users
- [ ] $500+ monthly revenue
- [ ] Major exchange hack (opportunity to say "we track this")
- [ ] B2B inquiry for infrastructure intelligence

---

*Saved for the right moment. Focus on Rug Score monetization first.* 🐯
