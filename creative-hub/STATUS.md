# MSUCO - Project Status

> **Last Updated**: December 28, 2025
> **Bot**: [@MSUCOBot](https://t.me/MSUCOBot)
> **App**: https://creative-hub-virid.vercel.app

---

## What's Live & Working

### Telegram Bot
- **Username**: @MSUCOBot
- **Token**: Configured in `.env`
- **Menu Button**: Opens Mini App
- **Branding**: Purple tiger crown logo

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
| **Qdrant** | 1000 vectors | `lyric_patterns` collection |
| **Turso** | 8 tables | users, tracks, transactions, etc. |

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

### What's Been Run
```bash
# 1000 songs embedded and clustered
python embed_lyrics.py --hf-dataset vishnupriyavr/spotify-million-song-dataset --max-samples 1000
python cluster_lyrics.py --input ./lyric_embeddings --clusters 12
python theme_classifier.py --corpus ./lyric_embeddings
python upload_to_qdrant.py --input ./lyric_embeddings
```

### Results Stored
- `lyric_embeddings/embeddings.npy` - 1000 x 384 vectors
- `lyric_embeddings/cluster_analysis.json` - 12 pattern clusters
- `lyric_embeddings/theme_classification.json` - Hit theme mapping
- **Qdrant**: `lyric_patterns` collection (1000 vectors, status: green)

### Theme Distribution Found
```
breakup         17.1%  ← Always works
loss            16.9%
desire          15.6%
escapism         9.8%
inspiration      6.4%
```

---

## File Structure

```
creative-hub/
├── .env                          # All credentials
├── src/
│   ├── app/
│   │   └── api/
│   │       └── generate/
│   │           ├── music/route.ts      # x402 protected
│   │           ├── album-art/route.ts  # x402 protected
│   │           └── brand/route.ts      # x402 protected
│   ├── lib/
│   │   ├── x402.ts              # Payment middleware
│   │   ├── ton.ts               # TON Connect integration
│   │   ├── coinbase.ts          # Onramp integration
│   │   └── telegram.ts          # Stars payments
│   └── components/
│       └── payments/
│           └── multi-rail-checkout.tsx  # Universal checkout
├── scripts/
│   └── lyric-pipeline/          # Intelligence engine
│       ├── embed_lyrics.py
│       ├── cluster_lyrics.py
│       ├── theme_classifier.py
│       └── upload_to_qdrant.py
├── public/
│   ├── tonconnect-manifest.json # MSUCO branding
│   └── assets/
│       ├── msislogo.jpg         # Logo variant 1
│       └── musiclogo2.jpg       # Logo variant 2 (main)
└── skills/                      # Documentation
    ├── INDEX.md
    ├── PAYMENT_EMPIRE.skill.md
    └── ...
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
- [ ] Scale to 10K+ lyrics
- [ ] CLAP audio embeddings

---

## External Dashboards

- **Vercel**: https://vercel.com/jessepimmel/creative-hub
- **Qdrant**: https://cloud.qdrant.io
- **Turso**: https://turso.tech/app
- **Telegram BotFather**: @BotFather → /mybots → @MSUCOBot
