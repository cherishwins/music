# JPANDA ECOSYSTEM - MASTER BRAIN
## Complete Knowledge Base & Memory Backup

**Last Updated:** December 30, 2025
**Purpose:** If you lose memory, read this to understand EVERYTHING

---

## TL;DR - WHAT WE'RE BUILDING

You're building **infrastructure for the degen economy on TON** - 5 interconnected products that create a flywheel:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      JPANDA ECOSYSTEM                                │
│                   "Winning All The Marbles"                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ WHITE TIGER  │  │  RUG SCORE   │  │ BRAND FORGE  │               │
│  │   STUDIO     │  │  (MemeScan)  │  │              │               │
│  │              │  │              │  │              │               │
│  │ AI Music     │  │ Credit Score │  │ Meme Coin    │               │
│  │ Generation   │  │ for Minters  │  │ Branding     │               │
│  │ $0.50/track  │  │ "Equifax"    │  │ $0.25/pkg    │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                 │                        │
│         └────────────┬────┴────────────────┘                        │
│                      │                                               │
│              ┌───────▼───────┐                                       │
│              │   MEMESEAL    │ ← PROOF LAYER                        │
│              │ Timestamps &  │                                       │
│              │ Verification  │                                       │
│              └───────┬───────┘                                       │
│                      │                                               │
│              ┌───────▼───────┐                                       │
│              │   SEALBET     │ ← PREDICTION MARKETS                 │
│              │ "Will it rug?"│                                       │
│              │ Settled by    │                                       │
│              │ Rug Score     │                                       │
│              └───────────────┘                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Why this wins:** 900M Telegram users, no real competition on TON, everything is interconnected.

---

## THE 5 PILLARS

### 1. WHITE TIGER STUDIO (LIVE)
**Status:** PRODUCTION - Deployed at https://creative-hub-virid.vercel.app
**Bot:** @MSUCOBot

**What it does:**
- AI music generation (ElevenLabs API)
- AI album art generation (xAI Grok-2)
- AI brand text generation (xAI Grok)
- Voice cloning
- Lyric intelligence (4,832 hip-hop vectors in Qdrant)

**Revenue:** x402 paywall
- Music: $0.50/track
- Album Art: $0.10/image
- Brand Package: $0.25

**Key Files:**
- `/src/app/api/generate/music/route.ts`
- `/src/app/api/generate/album-art/route.ts`
- `/src/lib/music.ts` - ElevenLabs integration
- `/src/lib/images.ts` - xAI image generation

---

### 2. RUG SCORE / MINTER CREDIT SCORE (LIVE ✅)
**Status:** PRODUCTION - FULLY OPERATIONAL
**Endpoint:** `https://creative-hub-virid.vercel.app/api/minter-score/{address}`
**Page:** /rug-score

**What it does:**
- Analyzes TON wallet addresses and token contracts
- Calculates Minter Credit Score (0-1000)
- Tracks minter history, token safety, behavior
- "Equifax of Memecoins"

**Test it:**
```bash
curl https://creative-hub-virid.vercel.app/api/minter-score/UQBZenh5TFhBoxH4VPv1HDS16XcZ9_2XVZcUSMhmnzxTJUxf
```

**Scoring Algorithm:**
| Component | Weight | What It Measures |
|-----------|--------|------------------|
| **History** | 35% | Survival rate, rug rate, avg lifespan |
| **Safety** | 40% | Mint/freeze authority, LP lock, honeypot |
| **Behavior** | 25% | Wallet age, patterns, diversification |

**Key Files:**
- `/src/lib/minter-score.ts` - Main scoring algorithm
- `/src/lib/dyor-api.ts` - DYOR.io integration (free tier, no key needed)
- `/src/lib/tonapi.ts` - TonAPI integration
- `/src/app/api/minter-score/[address]/route.ts` - API endpoint

**API Keys (CONFIGURED ✅):**
- `TONAPI_KEY` - ✅ Configured in Vercel
- `DYOR.io` - ✅ Using free tier (no key needed)

---

### 3. BRAND FORGE (LIVE)
**Status:** PRODUCTION
**Page:** /brand

**What it does:**
- Generates complete meme coin brand packages
- Name, ticker, tagline, color palette
- Logo, banner, social media kit
- Anthem (via ElevenLabs)

**Revenue:** $0.25/package via x402

**Key Files:**
- `/src/app/api/generate/brand/route.ts`
- `/src/app/brand/page.tsx`

---

### 4. MEMESEAL (MVP LIVE)
**Status:** PRODUCTION - API deployed
**API:** `/api/seal`

**What it does:**
- Timestamps predictions with cryptographic hashes
- Creates verifiable proof of calls before outcomes
- "Trust Me" → "Prove It"
- Powers SealBet oracle
- Builds predictor reputation over time

**API Endpoints:**
```
POST /api/seal           - Create a new prediction seal
GET  /api/seal?id=xxx    - Get seal by ID
GET  /api/seal?creator=xxx - Get seals by creator
GET  /api/seal?target=xxx  - Get seals about a token
POST /api/seal/verify    - Verify seal authenticity
GET  /api/seal/verify?creator=xxx - Get predictor reputation
POST /api/seal/resolve   - Resolve prediction outcome (oracle)
```

**Prediction Types:**
- `rug_pull` - Will this token rug?
- `price_target` - Will token hit price X?
- `launch_success` - Will launch succeed?
- `whale_dump` - Will whale dump?
- `custom` - Free-form prediction

**Reputation System:**
- Novice → Apprentice → Expert → Oracle
- Badges for streaks and accuracy
- Public leaderboard potential

**Key Files:**
- `/src/lib/memeseal.ts` - Core sealing logic + Tact contract template
- `/src/app/api/seal/route.ts` - Create/get seals
- `/src/app/api/seal/verify/route.ts` - Verification + reputation
- `/src/app/api/seal/resolve/route.ts` - Oracle resolution

**Integration with Other Pillars:**
- Rug Score predictions get sealed
- Accurate predictors build reputation
- Reputation unlocks SealBet privileges
- On-chain storage via Tact smart contract (template ready)

---

### 5. SEALBET (CONCEPT)
**Status:** DECK COMPLETE - Ready for development

**What it does:**
- Prediction markets on TON
- "Will $TOKEN rug within 30 days?"
- Non-custodial, oracle-settled
- Uses Rug Score as data source

**Architecture:**
- Azuro-style bonding curves
- Singleton liquidity pools per market
- Multi-source oracles (Pyth, Chainlink, YOUR Rug Score)
- 0.5% winning fee, 10% LP share

**Key Innovation:**
- Predictions settled by YOUR proprietary Minter Credit Score
- Creates moat - competitors can't replicate your data
- MemeSeal timestamps predictions for social proof

**Deck Location:**
- `/home/jesse/dev/projects/personal/music/SealBet_ Trustless Prediction Protocol on TON/`
- `/home/jesse/dev/projects/personal/music/SealBet_ Telegram's First Trustless Prediction Market/`

---

## TECH STACK

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + custom tokens
- **Animations:** Framer Motion
- **3D:** Three.js / React Three Fiber

### Backend
- **Runtime:** Vercel Edge Functions
- **Database:** Turso (libSQL) - `libsql://msuco-lyrics-db-jpanda.aws-us-east-1.turso.io`
- **Vector DB:** Qdrant - `hiphop_viral` collection (4,832 vectors)
- **Blob Storage:** Vercel Blob

### AI Services
| Service | Purpose | Env Var |
|---------|---------|---------|
| ElevenLabs | Music generation, voice cloning | `ELEVENLABS_API_KEY` |
| xAI Grok | Image generation, text | `XAI_API_KEY` |
| Anthropic Claude | AI text (backup) | `ANTHROPIC_API_KEY` |
| Replicate | MusicGen (backup) | `REPLICATE_API_TOKEN` |

### Blockchain
| Service | Purpose | Env Var |
|---------|---------|---------|
| TON Connect | Wallet integration | Built-in |
| TonAPI | Blockchain data | `TONAPI_KEY` |
| DYOR.io | Trust scores | `DYOR_API_KEY` |

### Payments
| Rail | Status | Integration |
|------|--------|-------------|
| x402 USDC | LIVE | `/src/lib/x402.ts` |
| Telegram Stars | LIVE | Bot API |
| TON Connect | LIVE | `/src/lib/ton.ts` |
| Coinbase Onramp | Ready | Needs `COINBASE_PROJECT_ID` |
| Stripe | Ready | Needs `STRIPE_SECRET_KEY` |

---

## UNIT ECONOMICS

### Costs Per Generation
| Service | Cost |
|---------|------|
| Music (ElevenLabs) | ~$0.08/min |
| Image (xAI) | ~$0.01-0.03/image |
| Text (Claude Haiku) | ~$0.001/request |
| Storage (Vercel) | ~$0.01/track |
| **Total Per Track** | ~$0.23 |

### Revenue Per Generation
| Product | Price | Margin |
|---------|-------|--------|
| Music | $0.50 | 54% |
| Album Art | $0.10 | 70%+ |
| Brand Package | $0.25 | 80%+ |

### Monthly Fixed Costs
| Service | Cost |
|---------|------|
| ElevenLabs Creator | $22/mo |
| Turso | Free tier |
| Qdrant | Free tier |
| Vercel | Free tier |
| **Total Fixed** | ~$22/mo |

### Break-Even
- At $0.50/track with $0.23 cost = $0.27 profit
- 22 / 0.27 = **~82 tracks/month to break even**

---

## IMPORTANT FILES

### Core Config
| File | Purpose |
|------|---------|
| `.env` | All API keys and secrets |
| `CLAUDE.md` | Agent instructions |
| `HUMAN_TODOS.md` | Human task list |

### Documentation
| File | Purpose |
|------|---------|
| `docs/MASTER_BRAIN.md` | THIS FILE - Complete knowledge |
| `docs/TON_ECOSYSTEM_BIBLE.md` | All TON APIs and services |
| `docs/UNIT_ECONOMICS.md` | Cost breakdown |
| `docs/RUG_SCORE_RESEARCH.md` | Credit scoring research |
| `docs/STATUS_2025-12-30.md` | Current status |

### Research (Parent Directory)
| File | Purpose |
|------|---------|
| `../MINTER_CREDIT_SCORING_RESEARCH.md` | Full credit score research |
| `../IMPLEMENTATION_GUIDE.md` | Technical implementation |
| `../Meme Coin Creation Mini App Research.md` | Market research |
| `../SealBet_*/` | Prediction market decks (2 versions) |

---

## API ENDPOINTS

### Generation APIs (x402 Protected)
```
POST /api/generate/music      - $0.50 - Generate music track
POST /api/generate/album-art  - $0.10 - Generate album artwork
POST /api/generate/brand      - $0.25 - Generate brand package
```

### Minter Score API (Free)
```
GET  /api/minter-score/[address]  - Analyze wallet/token
POST /api/minter-score/[address]  - Batch analysis
```

### MemeSeal API (Free)
```
POST /api/seal              - Create prediction seal
GET  /api/seal?id=xxx       - Get seal by ID
GET  /api/seal?creator=xxx  - Get seals by creator
POST /api/seal/verify       - Verify seal authenticity
GET  /api/seal/verify?creator=xxx - Get predictor reputation
POST /api/seal/resolve      - Resolve prediction (oracle)
```

### Internal APIs
```
POST /api/funnel/track     - Track user events
GET  /api/admin/costs      - Cost monitoring
GET  /api/health           - Health check
POST /api/telegram/webhook - Telegram payments
```

### Command Center Dashboard
**URL:** `/command`

Real-time ecosystem monitoring dashboard with:
- Live market data ticker (TON, SOL from CoinGecko)
- System health monitoring with latency visualization
- All 5 ecosystem pillar status indicators
- Persona cards with TAM metrics (Degen Dave, Producer Pete, Dev Dana)
- MemeSeal prediction statistics
- User acquisition funnel visualization
- Three tabs: System, Intel, Growth

**Key File:** `/src/app/command/page.tsx`

---

## CREDENTIALS LOCATION

All credentials are in `/home/jesse/dev/projects/personal/music/creative-hub/.env`

**DO NOT SHARE THESE. Rotate if exposed.**

Key credentials:
- `TELEGRAM_BOT_TOKEN` - @MSUCOBot
- `NEXT_PUBLIC_TON_WALLET_ADDRESS` - Your TON wallet
- `X402_PAYMENT_ADDRESS` - USDC wallet (Base)
- `XAI_API_KEY` - xAI/Grok
- `ELEVENLABS_API_KEY` - Music generation
- `ANTHROPIC_API_KEY` - Claude
- `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` - Database

---

## COMPETITIVE LANDSCAPE

### TON Ecosystem Gaps We Fill
| Gap | Our Solution | Competition |
|-----|--------------|-------------|
| Meme coin trust scores | Rug Score | DYOR.io (we can use their data + add more) |
| Music NFTs | White Tiger | None on TON |
| Prediction markets | SealBet | None on TON (126 gambling apps, 0 prediction protocols) |
| Brand generation | Brand Forge | None |
| Proof of prediction | MemeSeal | None |

### Why We Win
1. **First mover** on TON prediction markets
2. **Proprietary data** - Minter Credit Score is ours
3. **Integrated ecosystem** - All products feed each other
4. **900M distribution** - Telegram built-in

---

## ROADMAP

### DONE (December 2025)
- [x] White Tiger Studio MVP
- [x] Music generation (ElevenLabs)
- [x] Album art generation (xAI)
- [x] Brand generation
- [x] 5 payment rails
- [x] Minter Credit Score API
- [x] Rug Score page wired to real API
- [x] Funnel tracking
- [x] Homepage redesign (legendary)
- [x] **TonAPI integration LIVE** (Dec 30)
- [x] **DYOR.io integration LIVE** (Dec 30, free tier)
- [x] **Minter Score API deployed to production** (Dec 30)
- [x] **Edge runtime bugs fixed** (limit, endpoint, env vars)
- [x] **MemeSeal MVP LIVE** (Dec 30) - Prediction sealing API
- [x] **MinterScoreCard React component** (Dec 30)
- [x] **TON Ecosystem Bible documented** (Dec 30)
- [x] **Tact smart contract template** for on-chain seals (Dec 30)

### IN PROGRESS
- [ ] Directory submissions (human task)
- [ ] Enhance scoring with TON MCP real-time data
- [ ] Wire MinterScoreCard into Rug Score page

### NEXT (January 2026)
- [ ] MemeSeal on-chain deployment (Tact contract)
- [ ] SealBet MVP - One market type ("Will it rug?")
- [ ] Predictor leaderboard UI
- [ ] Product Hunt launch

### FUTURE (Q1 2026)
- [ ] SealBet full launch
- [ ] Governance token
- [ ] Signal group partnerships
- [ ] B2B API licensing

---

## QUICK START FOR NEW SESSION

If you're reading this fresh, here's what to do:

### 1. Check Status
```bash
cd /home/jesse/dev/projects/personal/music/creative-hub
cat HUMAN_TODOS.md  # See what human needs to do
cat docs/STATUS_2025-12-30.md  # Latest status
```

### 2. Run Locally
```bash
pnpm dev
# Visit http://localhost:3000
```

### 3. Deploy
```bash
git add . && git commit -m "update" && git push
# Auto-deploys to Vercel
```

### 4. Test APIs
```bash
# Minter Score (free)
curl "https://creative-hub-virid.vercel.app/api/minter-score/EQBZenh5TFhBoxH4VPv1HDS16XcZ9_2XVZcUSMhmnzxTJUxf"

# Health check
curl "https://creative-hub-virid.vercel.app/api/health"
```

---

## THE VISION

**Short-term (3 months):**
- Be THE trust layer for TON meme coins
- 10K+ Minter Score lookups/month
- Product Hunt top 5

**Medium-term (6 months):**
- SealBet live with $100K+ in prediction volume
- 100K+ MAU across all products
- B2B API customers

**Long-term (12 months):**
- Governance token launch
- Protocol-owned liquidity
- "Polymarket of TON" status

---

## CRITICAL REMINDERS

1. **$500 left** - Every dollar counts. Track costs weekly.
2. **Rug Score API is LIVE** - TonAPI and DYOR.io integrated (Dec 30, 2025)
3. **US geo-block** - SealBet must block US users for legal safety
4. **x402 is live** - Generation APIs require payment
5. **Don't share .env** - Rotate keys if exposed
6. **TON price** - $1.61 (as of Dec 30, 2025)

---

## DOCUMENT INDEX

| Document | Location | Purpose |
|----------|----------|---------|
| **MASTER_BRAIN.md** | `docs/` | THIS FILE |
| **TON_ECOSYSTEM_BIBLE.md** | `docs/` | All TON APIs/services |
| **UNIT_ECONOMICS.md** | `docs/` | Cost breakdown |
| **RUG_SCORE_RESEARCH.md** | `docs/` | Credit scoring |
| **HUMAN_TODOS.md** | root | Human tasks |
| **CLAUDE.md** | root | Agent instructions |
| **MINTER_CREDIT_SCORING_RESEARCH.md** | parent | Full research |
| **IMPLEMENTATION_GUIDE.md** | parent | Tech details |
| **Meme Coin Research.md** | parent | Market research |
| **SealBet decks** | parent | Prediction market concept |

---

*"If you're reading this, you're ready to win. LFG."* 🐯🚀
