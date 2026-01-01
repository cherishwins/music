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

## Current Duplication (WASTE)

| Feature | creative-hub | notaryton | Winner |
|---------|--------------|-----------|--------|
| Rug Score | minter-score.ts + ton-labels | rugscore + crawler | notaryton (has crawler) |
| Token Data | Static JSON | PostgreSQL + live crawler | notaryton |
| Whale Watch | None | holder_snapshots + detection | notaryton |
| KOL Tracking | None | Full system | notaryton |
| User Auth | Turso (separate) | PostgreSQL | notaryton |
| Payments | 5 rails (Turso) | Stars + TON (PostgreSQL) | Merge both |

---

## Quick Wins (Can Do Today)

1. **Populate known_wallets** in notaryton with ton-labels data
   ```python
   # One-time migration script
   for label in ton_labels:
       await db.wallets.label_wallet(
           address=label['address'],
           label=label['category'],
           owner_name=label['name']
       )
   ```

2. **Point creative-hub to notaryton** for token safety
   ```typescript
   const NOTARYTON_API = "https://notaryton.com/api/v1";
   const score = await fetch(`${NOTARYTON_API}/rugscore/${address}`);
   ```

3. **Share user context** via Telegram user ID
   - Both apps run as Mini Apps
   - Use same `initData` to identify user
   - notaryton is source of truth for subscriptions

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

## Next Steps

1. [ ] Add ton-labels to notaryton known_wallets (Script)
2. [ ] Update creative-hub to call notaryton API
3. [ ] Share Telegram user auth between apps
4. [ ] Wire casino to real notaryton payments
5. [ ] Launch unified referral program

---

*"One backend to rule them all, one database to find them, one API to bring them all, and in the ecosystem bind them."*
