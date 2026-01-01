# Hub-and-Spoke Architecture Plan

> **Status:** READY TO IMPLEMENT
> **Created:** December 31, 2025
> **Goal:** Consolidate 7+ disjointed products into unified ecosystem

---

## The Discovery

You have a MASSIVE backend already built and running on Render - **notaryton-bot** - with:
- 4,662 lines of Python
- PostgreSQL database (15+ tables)
- 40+ REST API endpoints
- Token crawler (THE DATA MOAT)
- KOL tracking system
- Whale detection
- Lottery + Casino
- TON ID authentication
- Multi-language support (EN/RU/ZH)

**Problem:** creative-hub is duplicating this functionality with its own minter-score.ts

---

## 🚨 CRITICAL FINDING (January 1, 2026)

**Testing revealed creative-hub's scoring is SUPERIOR to notaryton's:**

| Test | notaryton.com | creative-hub | Winner |
|------|---------------|--------------|--------|
| Known Scammer | Score 70 (yellow) | Score 0, Grade F, CRITICAL | **creative-hub** |
| CEX (weex) | "Could not analyze" | Score 812, Grade A, entity info | **creative-hub** |
| Entity Detection | None | Full ton-labels (2,958 addresses) | **creative-hub** |
| Grade System | 0-100 simple | 0-1000 with A+-F grades | **creative-hub** |
| Component Breakdown | None | History/Safety/Behavior with weights | **creative-hub** |

**New Recommendation:** Port creative-hub's minter-score.ts logic TO notaryton, not the reverse.

### What creative-hub has that notaryton needs:
1. **ton-labels integration** (2,958 labeled addresses including 112 scammers)
2. **Entity detection** (CEX, DEX, validators, scammers, bridges, etc.)
3. **Sophisticated scoring** (letter grades, risk levels, component breakdown)
4. **Scammer detection** (instant F grade with detailed warnings)
5. **Trust flags** (verified badges, website links)

---

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │           notaryton-bot (HUB)           │
                    │         Render - Python/FastAPI         │
                    │                                          │
                    │  PostgreSQL Database:                    │
                    │  • users, subscriptions, referrals       │
                    │  • tracked_tokens (safety scores)        │
                    │  • holder_snapshots (whale tracking)     │
                    │  • known_wallets (labels)                │
                    │  • kols, kol_calls, kol_wallets          │
                    │  • lottery_entries                       │
                    │  • verified_users (TON ID)               │
                    │                                          │
                    │  Background Jobs:                        │
                    │  • Token Crawler (60s interval)          │
                    │  • Whale Detection                       │
                    │  • Sunday Lottery Draw                   │
                    │  • Twitter Auto-Poster                   │
                    └─────────────────┬───────────────────────┘
                                      │
                                      │ REST API
                                      │
        ┌─────────────────┬───────────┼───────────┬─────────────────┐
        │                 │           │           │                 │
        ▼                 ▼           ▼           ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ creative-hub  │ │ memescan-     │ │ memeseal-     │ │ 1929-world    │
│   (Vercel)    │ │ astro         │ │ casino        │ │   (Vercel)    │
│               │ │   (Vercel)    │ │   (Vercel)    │ │               │
│ • Rug Score   │ │               │ │               │ │ • Dashboard   │
│ • Music Gen   │ │ • Token Scan  │ │ • Slots       │ │ • Financial   │
│ • Album Art   │ │ • Trending    │ │ • Crash       │ │   Charts      │
│ • Brand Gen   │ │ • Whale Watch │ │ • Roulette    │ │               │
└───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
```

---

## notaryton-bot API Endpoints (Already Live!)

### Rug Score / Token Analysis
```
GET  /api/v1/rugscore/{address}      # Token safety score (0-100)
GET  /api/v1/tokens/stats            # Tracking statistics
GET  /api/v1/tokens/recent           # Recently tracked tokens
GET  /api/v1/tokens/rugged           # Known rugged tokens
GET  /api/v1/tokens/live             # Live token feed
```

### MemeScan
```
GET  /api/v1/memescan/trending       # Trending meme coins
GET  /api/v1/memescan/new            # New launches
GET  /api/v1/memescan/check/{addr}   # Check token safety
GET  /api/v1/memescan/pools          # Liquidity pools
```

### KOL Intelligence
```
GET  /api/v1/kols                    # List all KOLs
GET  /api/v1/kols/leaderboard        # Top performers
GET  /api/v1/kols/stats              # KOL statistics
GET  /api/v1/kols/{kol_id}           # Specific KOL details
GET  /api/v1/kols/calls/recent       # Recent token calls
GET  /api/v1/kols/calls/token/{addr} # Calls for token
GET  /api/v1/kols/wallet/{addr}      # KOL by wallet
GET  /api/v1/kols/by-language/{lang} # Filter by language
GET  /api/v1/kols/by-category/{cat}  # Filter by category
```

### TON ID Auth
```
GET  /auth/tonid/start               # Start OAuth flow
GET  /auth/tonid/callback            # OAuth callback
GET  /api/v1/verified/{telegram_id}  # Check verified user
POST /api/v1/verified/link-kol       # Link KOL to user
```

### Lottery & Casino
```
GET  /api/v1/lottery/pot             # Current pot size
GET  /api/v1/lottery/tickets/{uid}   # User's tickets
POST /api/v1/casino/bet              # Place a bet
```

### Notarization (Core Product)
```
POST /api/v1/notarize                # Create seal
GET  /api/v1/verify/{hash}           # Verify seal
POST /api/v1/batch                   # Batch seals
```

---

## Integration Plan

### Phase 1: Connect creative-hub to notaryton (THIS WEEK)

**Option A: Proxy through notaryton**
```typescript
// creative-hub/src/app/api/minter-score/[address]/route.ts
export async function GET(request: Request, { params }: { params: { address: string } }) {
  // Proxy to notaryton backend
  const response = await fetch(
    `https://notaryton.com/api/v1/rugscore/${params.address}`
  );
  return response;
}
```

**Option B: Add ton-labels to notaryton**
```python
# notaryton-bot/ton_labels.py
# Add the 2,958 labeled addresses to known_wallets table
# Then rugscore endpoint automatically uses them
```

I recommend **Option B** because:
1. Single source of truth
2. notaryton's TokenCrawler can use labels for better scoring
3. No duplicate data

### Phase 2: Shared User Authentication

notaryton already has:
- TON ID OAuth integration
- User subscriptions (Stars + TON)
- Referral system
- Lottery entries

creative-hub should:
1. Check if user is verified via `/api/v1/verified/{telegram_id}`
2. Use notaryton's subscription status
3. Feed into shared referral system

### Phase 3: Unified Revenue

All products feed into ONE pot:
- Music generation fees → notaryton lottery
- Rug Score premium → notaryton subscriptions
- Casino bets → notaryton pot

---

## Current Duplication (REVISED)

| Feature | creative-hub | notaryton | Winner |
|---------|--------------|-----------|--------|
| Rug Score Logic | minter-score.ts + ton-labels | Basic rugscore | **creative-hub** (better scoring) |
| Token Crawler | None | PostgreSQL + live crawler | **notaryton** (data moat) |
| Entity Labels | 2,958 addresses (ton-labels) | None | **creative-hub** |
| Whale Watch | None | holder_snapshots + detection | **notaryton** |
| KOL Tracking | None | Full system | **notaryton** |
| User Auth | Turso (separate) | PostgreSQL | **notaryton** |
| Payments | 5 rails (Turso) | Stars + TON (PostgreSQL) | **Merge both** |

**The Path Forward:** Merge creative-hub's scoring intelligence INTO notaryton's data infrastructure.

---

## Quick Wins (REVISED)

### 1. Migrate ton-labels to notaryton (DO THIS FIRST)
```python
# notaryton-bot/scripts/import_ton_labels.py
import json
import asyncio
from database import db

async def import_labels():
    with open('ton-labels-compiled.json') as f:
        data = json.load(f)

    for address, info in data['addresses'].items():
        await db.wallets.label_wallet(
            address=address,
            label=info['category'],
            owner_name=info.get('label', info.get('organization', '')),
            metadata={
                'website': info.get('website'),
                'subcategory': info.get('subcategory'),
                'tags': info.get('tags', [])
            }
        )
    print(f"Imported {len(data['addresses'])} labels")
```

### 2. Port scoring logic to notaryton
```python
# notaryton-bot/scoring.py
ENTITY_SCORES = {
    'cex': 850,      # Grade A
    'dex': 800,      # Grade A
    'validator': 900, # Grade A+
    'bridge': 750,   # Grade B+
    'scammer': 0,    # Grade F (CRITICAL)
}

async def calculate_minter_score(address: str) -> dict:
    # Check entity labels first
    label = await db.wallets.get_label(address)
    if label:
        if label['category'] == 'scammer':
            return {'score': 0, 'grade': 'F', 'riskLevel': 'CRITICAL'}
        return {
            'score': ENTITY_SCORES.get(label['category'], 600),
            'grade': score_to_grade(score),
            'entityInfo': label
        }
    # Fall back to token analysis
    ...
```

### 3. creative-hub proxies to notaryton (after migration)
Once notaryton has the scoring logic, creative-hub simply proxies:
```typescript
// Keep local scoring for now, switch to notaryton after migration
const NOTARYTON_API = process.env.NOTARYTON_API || "https://notaryton.com/api/v1";
```

---

## Revenue Flow (Unified)

```
User pays anywhere
       │
       ▼
┌──────────────────┐
│ notaryton-bot    │
│ PostgreSQL       │
├──────────────────┤
│ 80% → Creator    │
│ 15% → Lottery    │
│  5% → Referrer   │
└──────────────────┘
```

---

## Deployment Map

| Service | Platform | URL | Status |
|---------|----------|-----|--------|
| notaryton-bot | Render | notaryton.com | LIVE |
| creative-hub | Vercel | creative-hub-virid.vercel.app | LIVE |
| memescan-astro | Vercel | memescan.ton.dev | WIP |
| memeseal-casino | Vercel | memeseal.com | Demo only |
| 1929-world | Vercel | 1929.world | LIVE |

---

## Next Steps (REVISED ORDER)

1. [x] Test both APIs to compare scoring quality - **DONE (creative-hub wins)**
2. [ ] Copy `ton-labels-compiled.json` to notaryton-bot
3. [ ] Create Python import script (see Quick Win #1)
4. [ ] Run migration to populate notaryton's known_wallets table
5. [ ] Port creative-hub's scoring logic to Python (see Quick Win #2)
6. [ ] Update notaryton's `/api/v1/rugscore` to use new scoring
7. [ ] Test notaryton with same addresses (should now match creative-hub)
8. [ ] Switch creative-hub to proxy to notaryton (or keep both)
9. [ ] Share Telegram user auth between apps
10. [ ] Wire casino to real notaryton payments
11. [ ] Launch unified referral program

---

*"One backend to rule them all, one database to find them, one API to bring them all, and in the ecosystem bind them."*

---

## Test Results (January 1, 2026)

### Scammer Detection Test
```bash
# creative-hub (CORRECT)
curl https://creative-hub-virid.vercel.app/api/minter-score/EQBe-OxgGw8mHgBpbafhc652p7eLgp8dqEwFU8mKh5vsL3a8
# → score: 0, grade: F, riskLevel: CRITICAL, "🚨 CONFIRMED SCAMMER"

# notaryton (WRONG)
curl https://notaryton.com/api/v1/rugscore/EQBe-OxgGw8mHgBpbafhc652p7eLgp8dqEwFU8mKh5vsL3a8
# → score: 70, badge: yellow, verdict: WARNING (NOT detecting scammer!)
```

### CEX Detection Test
```bash
# creative-hub (CORRECT)
curl https://creative-hub-virid.vercel.app/api/minter-score/EQB4XClemsAbLvlDjobh-VjUn7oEy9CITWPoG9WkTO2qRx_m
# → score: 812, grade: A, "✅ VERIFIED EXCHANGE - weex"

# notaryton (WRONG)
curl https://notaryton.com/api/v1/rugscore/EQB4XClemsAbLvlDjobh-VjUn7oEy9CITWPoG9WkTO2qRx_m
# → score: 70, "Could not analyze token" (NOT recognizing CEX!)
```
