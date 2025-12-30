#!/usr/bin/env python3
"""
Build TON Labels Lookup Database
================================

Extracts all labeled addresses from ton-labels repo into a single JSON
for fast lookup in the Rug Score API.

Usage:
    python scripts/build-ton-labels.py

Output:
    data/ton-labels-compiled.json
"""

import json
import os
from pathlib import Path
from collections import defaultdict

# Paths
LABELS_DIR = Path(__file__).parent.parent / "data" / "ton-labels" / "assets"
OUTPUT_FILE = Path(__file__).parent.parent / "data" / "ton-labels-compiled.json"

def main():
    print("🏷️  Building TON Labels Lookup Database")
    print("=" * 50)

    # Collect all addresses by category
    addresses = {}  # address -> {category, label, tags, description, ...}
    stats = defaultdict(int)

    # Walk through all category folders
    for category_dir in LABELS_DIR.iterdir():
        if not category_dir.is_dir():
            continue

        category = category_dir.name
        print(f"\n📁 Processing: {category}")

        # Process each JSON file in category
        for json_file in category_dir.glob("*.json"):
            try:
                with open(json_file, 'r') as f:
                    data = json.load(f)

                metadata = data.get("metadata", {})
                label = metadata.get("label", json_file.stem)
                subcategory = metadata.get("subcategory", "")
                description = metadata.get("description", "")
                website = metadata.get("website", "")
                organization = metadata.get("organization", "")

                for addr_entry in data.get("addresses", []):
                    address = addr_entry.get("address", "")
                    if not address:
                        continue

                    # Store address info
                    addresses[address] = {
                        "category": category,
                        "subcategory": subcategory,
                        "label": label,
                        "description": description,
                        "organization": organization,
                        "website": website,
                        "comment": addr_entry.get("comment", ""),
                        "tags": addr_entry.get("tags", []),
                        "source": addr_entry.get("source", ""),
                        "submittedBy": addr_entry.get("submittedBy", ""),
                    }
                    stats[category] += 1

            except Exception as e:
                print(f"   ⚠️  Error in {json_file.name}: {e}")

    # Print stats
    print("\n\n📊 STATISTICS")
    print("=" * 50)
    total = 0
    for category, count in sorted(stats.items(), key=lambda x: -x[1]):
        print(f"  {category:20s} {count:5d} addresses")
        total += count
    print(f"  {'TOTAL':20s} {total:5d} addresses")

    # Highlight dangerous categories
    dangerous = stats.get("scammer", 0)
    print(f"\n⚠️  SCAMMER ADDRESSES: {dangerous}")

    # Build output
    output = {
        "version": "1.0",
        "generated": str(Path(__file__).name),
        "source": "https://github.com/ton-studio/ton-labels",
        "stats": dict(stats),
        "total": total,
        "addresses": addresses,
    }

    # Write output
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Saved to: {OUTPUT_FILE}")
    print(f"   File size: {OUTPUT_FILE.stat().st_size / 1024:.1f} KB")

    # Also create a scammer-only file for faster lookups
    scammer_file = OUTPUT_FILE.parent / "scammer-addresses.json"
    scammers = {
        addr: info for addr, info in addresses.items()
        if info["category"] == "scammer"
    }
    with open(scammer_file, 'w') as f:
        json.dump(scammers, f, indent=2)
    print(f"   Scammer file: {scammer_file}")

if __name__ == "__main__":
    main()
