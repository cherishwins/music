# White Tiger (MSUCO) - Project Status

> **Last Updated**: December 30, 2025
> **Bot**: [@MSUCOBot](https://t.me/MSUCOBot)
> **App**: https://creative-hub-virid.vercel.app
> **Brand**: White Tiger (Cyberpunk Purple)

---

## What's Live & Working

### Telegram Bot
- **Username**: @MSUCOBot
- **Token**: Configured in `.env`
- **Menu Button**: Opens Mini App
- **Branding**: White Tiger / Cyberpunk Purple

### Payment Rails (5 methods)

| Method | Status | Who Uses It |
|--------|--------|-------------|
| **Telegram Stars** | Ready | TG Mini App users |
| **TON Connect** | Ready | Crypto-native TG users |
| **x402 USDC** | Ready | Web3 users, AI agents |
| **Coinbase Onramp** | Needs `COINBASE_PROJECT_ID` | Fiat-to-crypto |
| **Stripe** | Needs `STRIPE_SECRET_KEY` | Card payments |

### Databases

| Service | Status | Contents |
|---------|--------|----------|
| **Qdrant** | 4,832 vectors | `hiphop_viral` collection (HIP HOP ONLY) |
| **Turso** | 8 tables | users, tracks, transactions, etc. |

### Infrastructure Health

| Endpoint | Purpose | Schedule |
|----------|---------|----------|
| `/api/health` | Full health check | On-demand |
| `/api/cron/keep-alive` | Prevent Qdrant auto-delete | Daily 8am UTC |

### API Endpoints (x402 Protected)

| Endpoint | Price | What It Does |
|----------|-------|--------------|
| `/api/generate/music` | $0.50 | Generate AI music track |
| `/api/generate/album-art` | $0.10 | Generate album artwork |
| `/api/generate/brand` | $0.25 | Full brand package |

---

## Credentials Location

All in `/home/jesse/dev/projects/personal/music/creative-hub/.env`:

```
TELEGRAM_BOT_TOKEN=7715188456:AAH...  (MSUCOBot)
NEXT_PUBLIC_TON_WALLET_ADDRESS=UQBZenh5TFhBoxH4VPv1HDS16XcZ9_2XVZcUSMhmnzxTJUxf

TURSO_DATABASE_URL=libsql://msuco-lyrics-db-jpanda.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQS...

QDRANT_URL=https://fd0f714a-fc22-4577-a32a-19f0980f6f2d.us-east4-0.gcp.cloud.qdrant.io:6333
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIs...

X402_ENABLED=true
X402_PAYMENT_ADDRESS=0x14E6076eAC2420e56b4E2E18c815b2DD52264D54  (Base USDC)

ELEVENLABS_API_KEY=sk_14e8...
ANTHROPIC_API_KEY=sk-ant-api03-Kc2f...
REPLICATE_API_TOKEN=r8_8UlA5...
```

---

## Lyric Intelligence Pipeline

**Location**: `scripts/lyric-pipeline/`

### Current State: HIP HOP VIRAL INTELLIGENCE (4,832 tracks)

**OLD DATA DELETED**: ABBA, Alabama, Air Supply garbage is GONE.

**NEW DATA**: Pure hip hop from `Cropinky/rap_lyrics_english` HuggingFace dataset.

### What's Been Run
```bash
# Hip Hop Viral Pipeline (December 30, 2025)
python embed_hiphop_viral.py --max-samples 5000 --output ./hiphop_embeddings
python upload_hiphop_qdrant.py --input ./hiphop_embeddings --replace --delete-old
```

### Results Stored
- `hiphop_embeddings/embeddings.npy` - 4,832 x 384 vectors
- `hiphop_embeddings/metadata.jsonl` - Track metadata + viral features
- `hiphop_embeddings/stats.json` - Viral score distribution
- **Qdrant**: `hiphop_viral` collection (4,832 vectors, status: green)

### Viral Score Distribution (0-100)
```
0-20:    4,132 tracks (85.5%)  ← Most rap is NOT viral
20-40:     328 tracks (6.8%)
40-60:     104 tracks (2.2%)
60-80:      70 tracks (1.4%)
80-100:    198 tracks (4.1%)   ← THESE are the patterns we want
```

### Viral Features Tracked Per Track
- `viral_score` - Overall 0-100 score
- `hook_score` - Repeated phrase count
- `repetition_ratio` - % of words that repeat
- `adlib_density` - "yeah", "skrt", "sheesh" per word
- `short_line_ratio` - Lines ≤6 words
- `phonk_score` - Dark/phonk vocabulary match
- `first_line_punch` - Does opening line hit?
- `top_hooks` - Most repeated phrases

---

## File Structure

```
creative-hub/
├── .env                          # All credentials
├── vercel.json                   # Cron job config (daily keep-alive)
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── cron/
│   │       │   └── keep-alive/route.ts  # Daily ping to keep Qdrant alive
│   │       ├── health/route.ts          # Full health check endpoint
│   │       ├── generate/
│   │       │   ├── music/route.ts       # x402 protected $0.50
│   │       │   ├── album-art/route.ts   # x402 protected $0.10
│   │       │   └── brand/route.ts       # x402 protected $0.25
│   │       ├── payments/
│   │       │   └── verify-ton/route.ts  # TON payment verification
│   │       └── telegram/
│   │           └── webhook/route.ts     # Stars payment webhook
│   ├── lib/
│   │   ├── x402.ts              # Payment middleware
│   │   ├── ton.ts               # TON Connect integration
│   │   ├── coinbase.ts          # Onramp integration
│   │   ├── telegram.ts          # Stars payments
│   │   └── telegram-native.ts   # TG Mini App SDK wrapper
│   └── components/
│       └── payments/
│           └── multi-rail-checkout.tsx  # Universal checkout
├── scripts/
│   └── lyric-pipeline/          # Intelligence engine
│       ├── embed_hiphop_viral.py    # NEW: Hip hop viral embeddings
│       ├── upload_hiphop_qdrant.py  # NEW: Upload to hiphop_viral
│       ├── embed_lyrics.py          # OLD: Generic lyrics
│       ├── cluster_lyrics.py
│       ├── theme_classifier.py
│       ├── generation_optimizer.py
│       ├── hiphop_embeddings/       # 4,832 hip hop vectors
│       └── lyric_embeddings/        # OLD: 1000 generic (archived)
├── public/
│   ├── tonconnect-manifest.json # White Tiger branding
│   └── assets/brand/            # All brand assets
│       ├── icons/               # PWA icons
│       └── social/              # Social media assets
└── skills/                      # Documentation
    ├── INDEX.md
    ├── PAYMENT_EMPIRE.skill.md
    └── research/
        ├── LYRIC_INTELLIGENCE.md
        └── LYRICS_INTELLIGENCE_ENGINE.md
```

---

## Quick Commands

### Run Locally
```bash
cd /home/jesse/dev/projects/personal/music/creative-hub
pnpm dev
# Opens at http://localhost:3000
```

### Scale Lyric Pipeline
```bash
cd scripts/lyric-pipeline
python embed_lyrics.py --hf-dataset vishnupriyavr/spotify-million-song-dataset --max-samples 10000
python cluster_lyrics.py --input ./lyric_embeddings --clusters 20
python upload_to_qdrant.py --input ./lyric_embeddings
```

### Deploy
```bash
git push origin main  # Auto-deploys to Vercel
```

### Test Databases
```bash
pnpm tsx scripts/test-db.ts
```

---

## What's NOT Done Yet

- [ ] Coinbase Onramp (needs `COINBASE_PROJECT_ID`)
- [ ] Stripe (needs keys)
- [ ] MCP Server deployment (`/mcp-server/`)
- [ ] x402 Facilitator deployment (`/facilitator/`)
- [ ] Wire viral hypothesis into generation prompts
- [ ] Scale to 10K+ hip hop lyrics
- [ ] CLAP audio embeddings

## Viral Hypothesis (Ready to Implement)

**"Loop-First Lyric Design"** - Generate lyrics optimized for TikTok virality:

1. **First 8 words must SLAP** - TikTok scroll = instant hook or death
2. **Contiguous repetition** - Stack repeats (not spread out)
3. **Short punchy lines** - 70%+ ≤6 words
4. **Ad-lib density** - 3-5% "yeah", "sheesh", "let's go"
5. **ONE memorable hook** - Repeat 4+ times

**Research Findings**:
- High viral tracks: 49.5% repetition vs 15.9% low viral (3x)
- Hook score: 8.0 high viral vs 0.05 low viral (150x)
- 84% of Billboard Global 200 went viral on TikTok first
- Phonk: 31B TikTok views, "built for looping"

---

## External Dashboards

- **Vercel**: https://vercel.com/jessepimmel/creative-hub
- **Qdrant**: https://cloud.qdrant.io
- **Turso**: https://turso.tech/app
- **Telegram BotFather**: @BotFather → /mybots → @MSUCOBot
