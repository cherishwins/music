# White Tiger - AI Agent Instructions

> **Brand**: White Tiger (Cyberpunk Purple)
> **Bot**: [@MSUCOBot](https://t.me/MSUCOBot)
> **App**: https://creative-hub-virid.vercel.app
> **Last Updated**: December 30, 2025

---

## Human-AI Workflow

**Pattern**: Human does human stuff, Claude does machine stuff.

### Key Files
- **`HUMAN_TODOS.md`** - Master checklist for human tasks (Claude maintains this)
- **`docs/STATUS_2025-12-30.md`** - Latest status and what's built

### How It Works
1. Claude adds tasks to `HUMAN_TODOS.md` when human action needed
2. Human checks items off as completed
3. Claude reads this at session start to know what's done
4. Anything requiring accounts, forms, API keys → goes to HUMAN_TODOS.md

### Quick Commands for Human
```bash
# See what you need to do
cat HUMAN_TODOS.md

# Push schema changes
pnpm exec drizzle-kit push

# Deploy
git add . && git commit -m "update" && git push
```

---

## Project Overview

White Tiger is a **Telegram Mini App** for AI-powered music creation targeting **meme coin creators** and **hip hop artists**. Users pay with **5 different payment rails** to generate viral-optimized music, album art, and brand packages.

### Core Features
- **AI Music Generation** (ElevenLabs) - x402 protected, $0.50/track
- **Album Art Generation** (Gemini) - x402 protected, $0.10/image
- **Brand Package Generation** - x402 protected, $0.25/package
- **Hip Hop Viral Intelligence** - 4,832 tracks analyzed for viral patterns
- **Multi-Rail Payments** (Stars, TON, USDC, Card, Onramp)

### Viral Intelligence (NEW - Dec 30)
- **Collection**: `hiphop_viral` in Qdrant (4,832 vectors)
- **Hypothesis**: "Loop-First Lyric Design" - optimized for TikTok virality
- **Key Finding**: Viral tracks have 3x repetition, 150x more hooks
- **Status**: Research complete, ready to wire into generation

---

## Brand Assets

**Location**: `creative-hub/public/assets/brand/`

### Logos
- `logo-primary.jpg` - Main logo (White Tiger with soundwave)
- `logo-friendly.jpg` - Friendly/cub variant
- `logo-aggressive.jpg` - Roaring/aggressive variant
- `logo-city.jpg` - City background variant
- `logo-dj-vinyl.jpg` - DJ/vinyl variant

### PWA Icons
`/assets/brand/icons/`
- icon-72x72.png through icon-512x512.png
- apple-touch-icon.png
- favicon-16x16.png, favicon-32x32.png, favicon-48x48.png

### Social Media
`/assets/brand/social/`
- profile-400x400.jpg, profile-200x200.jpg
- twitter-header-1500x500.jpg
- facebook-cover-820x312.jpg
- og-image-1200x630.jpg
- telegram-channel-640x640.jpg

### Marketing
- hero-cosmic-disco.jpg
- hero-mech-wings.jpg
- hero-dj-party.jpg
- hero-laser-eyes.jpg

### Videos
- lfg.mp4
- peppanda.mp4
- video-grok-tiger.mp4

---

## Color Palette

```css
/* Primary - Cyberpunk Purple */
--color-tiger: #8B5CF6;
--color-tiger-muted: #6D28D9;
--color-tiger-light: #A78BFA;
--color-tiger-glow: #C4B5FD;

/* Accent - Neon */
--color-neon-cyan: #22D3EE;
--color-neon-pink: #F472B6;

/* Background */
--color-obsidian: #0A0A0A;
--color-crucible: #1A1A1A;
```

---

## Current Status (December 30, 2025)

### What's LIVE
- **@MSUCOBot** - Telegram bot with Mini App menu button
- **5 Payment Rails** - Stars, TON, x402 USDC, Coinbase Onramp, Stripe
- **Qdrant** - 4,832 hip hop vectors in `hiphop_viral` collection
- **Turso** - 8 tables (users, tracks, transactions, etc.)
- **x402 Protected APIs** - Music ($0.50), Album Art ($0.10), Brand ($0.25)
- **Daily Keep-Alive Cron** - Prevents Qdrant free tier auto-delete
- **Health Check** - `/api/health` monitors all services

### Viral Intelligence Status
- **Data**: 4,832 pure hip hop tracks (ABBA garbage deleted)
- **Collection**: `hiphop_viral` (NOT `lyric_patterns`)
- **Features tracked**: viral_score, hook_score, repetition_ratio, adlib_density, phonk_score
- **Hypothesis**: "Loop-First Lyric Design" ready to implement

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
XAI_API_KEY=xai-4p68...  # Voice cloning & realtime voice
```

---

## Architecture

```
creative-hub/
├── vercel.json                     # Cron config (daily keep-alive)
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── cron/
│   │       │   └── keep-alive/route.ts  # Daily ping to keep Qdrant alive
│   │       ├── health/route.ts          # Full health check
│   │       ├── generate/
│   │       │   ├── music/route.ts       # x402 protected, $0.50
│   │       │   ├── album-art/route.ts   # x402 protected, $0.10
│   │       │   └── brand/route.ts       # x402 protected, $0.25
│   │       ├── payments/
│   │       │   └── verify-ton/route.ts  # TON payment verification
│   │       └── telegram/
│   │           └── webhook/route.ts     # Stars payment webhook
│   ├── lib/
│   │   ├── x402.ts                 # HTTP 402 payment middleware
│   │   ├── ton.ts                  # TON Connect integration
│   │   ├── telegram-native.ts      # Telegram Mini App SDK
│   │   └── telegram.ts             # Stars payments
│   ├── hooks/
│   │   └── useTelegram.ts          # Telegram React hooks
│   └── components/payments/
│       └── multi-rail-checkout.tsx # Universal checkout UI
├── scripts/lyric-pipeline/         # Intelligence engine
│   ├── embed_hiphop_viral.py       # Hip hop + viral features
│   ├── upload_hiphop_qdrant.py     # Upload to hiphop_viral
│   └── hiphop_embeddings/          # 4,832 vectors + metadata
├── public/
│   ├── manifest.json               # White Tiger PWA manifest
│   ├── tonconnect-manifest.json    # White Tiger TON branding
│   └── assets/brand/               # All brand assets
│       ├── icons/                  # PWA icons
│       └── social/                 # Social media assets
└── skills/                         # Documentation
    ├── INDEX.md                    # Master skill index
    ├── BRAND_KIT_MASTER.skill.md
    ├── PAYMENT_EMPIRE.skill.md
    └── research/
        └── VIRAL_HYPOTHESIS.md     # Loop-First Lyric Design
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

---

## Development

```bash
# Install
pnpm install

# Run locally
pnpm dev

# Build
pnpm build

# Deploy (auto via Vercel)
git push origin main
```

---

## Code Style

- TypeScript strict mode
- Tailwind with tokens (`tiger-*`, `neon-*`, `obsidian`, `crucible`)
- Framer Motion for animations
- Use `glass`, `glass-tiger`, `glass-neon` CSS classes
- API routes in `src/app/api/`
