# MSUCO - AI Agent Instructions

> **Brand**: MSUCO (Purple Tiger Crown)
> **Bot**: [@MSUCOBot](https://t.me/MSUCOBot)
> **App**: https://creative-hub-virid.vercel.app

---

## Project Overview

MSUCO is a **Telegram Mini App** for AI-powered music creation. Users pay with **5 different payment rails** to generate music, album art, and brand packages.

### Core Features
- AI music generation (ElevenLabs)
- Album art generation (Gemini)
- Brand package generation
- Lyric intelligence with pattern analysis
- Multi-rail payments (Stars, TON, USDC, Card, Onramp)

---

## Current Status (December 2025)

### What's LIVE
- **@MSUCOBot** - Telegram bot with Mini App menu button
- **5 Payment Rails** - Stars, TON, x402 USDC, Coinbase Onramp, Stripe
- **Qdrant** - 1000 lyric vectors in `lyric_patterns` collection
- **Turso** - 8 tables (users, tracks, transactions, etc.)
- **x402 Protected APIs** - Music ($0.50), Album Art ($0.10), Brand ($0.25)

### Credentials (all in `.env`)
```bash
# Telegram
TELEGRAM_BOT_TOKEN=7715188456:AAH...  # @MSUCOBot

# Wallets
NEXT_PUBLIC_TON_WALLET_ADDRESS=UQBZenh5TFhBoxH4VPv1HDS16XcZ9_2XVZcUSMhmnzxTJUxf
X402_PAYMENT_ADDRESS=0x14E6076eAC2420e56b4E2E18c815b2DD52264D54  # Base USDC

# Databases
TURSO_DATABASE_URL=libsql://msuco-lyrics-db-jpanda.aws-us-east-1.turso.io
QDRANT_URL=https://fd0f714a-fc22-4577-a32a-19f0980f6f2d.us-east4-0.gcp.cloud.qdrant.io:6333

# AI Services
ELEVENLABS_API_KEY=sk_14e8...
ANTHROPIC_API_KEY=sk-ant-api03-Kc2f...
REPLICATE_API_TOKEN=r8_8UlA5...
```

---

## Architecture

```
creative-hub/
├── src/
│   ├── app/
│   │   └── api/generate/
│   │       ├── music/route.ts      # x402 protected, $0.50
│   │       ├── album-art/route.ts  # x402 protected, $0.10
│   │       └── brand/route.ts      # x402 protected, $0.25
│   ├── lib/
│   │   ├── x402.ts                 # HTTP 402 payment middleware
│   │   ├── ton.ts                  # TON Connect integration
│   │   ├── coinbase.ts             # Onramp integration
│   │   └── telegram.ts             # Stars payments
│   └── components/payments/
│       └── multi-rail-checkout.tsx # Universal checkout UI
├── scripts/lyric-pipeline/         # Intelligence engine
│   ├── embed_lyrics.py             # Vectorize lyrics
│   ├── cluster_lyrics.py           # Find patterns
│   ├── theme_classifier.py         # Hit theme analysis
│   └── upload_to_qdrant.py         # Store vectors
├── public/
│   ├── tonconnect-manifest.json    # MSUCO branding
│   └── assets/
│       └── musiclogo2.jpg          # Main logo
└── skills/                         # Documentation
    ├── INDEX.md
    ├── PAYMENT_EMPIRE.skill.md
    └── ...
```

---

## Payment Rails

| Rail | Status | Config Needed |
|------|--------|---------------|
| **Telegram Stars** | Ready | `TELEGRAM_BOT_TOKEN` |
| **TON Connect** | Ready | `NEXT_PUBLIC_TON_WALLET_ADDRESS` |
| **x402 USDC** | Ready | `X402_PAYMENT_ADDRESS` (Base network) |
| **Coinbase Onramp** | Needs setup | `COINBASE_PROJECT_ID` |
| **Stripe** | Needs setup | `STRIPE_SECRET_KEY` |

### x402 Pricing (in `src/lib/x402.ts`)
```typescript
export const ENDPOINT_PRICING = {
  "/api/generate/music": { price: "$0.50" },
  "/api/generate/album-art": { price: "$0.10" },
  "/api/generate/brand": { price: "$0.25" },
};
```

---

## Lyric Intelligence

**Location**: `scripts/lyric-pipeline/`

### Current State
- 1000 songs embedded (384-dim vectors)
- 12 pattern clusters identified
- Theme distribution: breakup (17%), loss (17%), desire (16%)
- Stored in Qdrant `lyric_patterns` collection

### Run Pipeline
```bash
cd scripts/lyric-pipeline
pip install -r requirements.txt

# Embed lyrics
python embed_lyrics.py --hf-dataset vishnupriyavr/spotify-million-song-dataset --max-samples 1000

# Cluster patterns
python cluster_lyrics.py --input ./lyric_embeddings --clusters 12

# Classify themes
python theme_classifier.py --corpus ./lyric_embeddings

# Upload to Qdrant
python upload_to_qdrant.py --input ./lyric_embeddings
```

---

## Development

```bash
# Install
pnpm install

# Run locally
pnpm dev

# Test databases
pnpm tsx scripts/test-db.ts

# Deploy (auto via Vercel)
git push origin main
```

---

## Key Files

| File | Purpose |
|------|---------|
| `.env` | All credentials |
| `src/lib/x402.ts` | Payment middleware |
| `src/lib/ton.ts` | TON wallet integration |
| `src/components/payments/multi-rail-checkout.tsx` | Checkout UI |
| `public/tonconnect-manifest.json` | MSUCO branding for TON |
| `scripts/lyric-pipeline/` | Intelligence engine |
| `skills/PAYMENT_EMPIRE.skill.md` | Payment strategy docs |

---

## External Dashboards

- **Vercel**: https://vercel.com/jessepimmel/creative-hub
- **Qdrant**: https://cloud.qdrant.io
- **Turso**: https://turso.tech/app
- **BotFather**: @BotFather → /mybots → @MSUCOBot

---

## Next Steps

1. [ ] Scale lyric pipeline to 10K+ songs
2. [ ] Set up Coinbase Onramp (`COINBASE_PROJECT_ID`)
3. [ ] Deploy MCP server (`/mcp-server/`)
4. [ ] Deploy x402 facilitator (`/facilitator/`)
5. [ ] Build CLAP audio embeddings
6. [ ] Wire generation to use lyric patterns

---

## Code Style

- TypeScript strict mode
- Tailwind with existing tokens (`gold-*`, `cosmic-*`)
- Framer Motion for animations
- Use `glass` and `glass-gold` CSS classes
- API routes in `src/app/api/`
