# White Tiger - AI Agent Instructions

> **Brand**: White Tiger (Cyberpunk Purple)
> **Bot**: [@MSUCOBot](https://t.me/MSUCOBot)
> **App**: https://creative-hub-virid.vercel.app

---

## Project Overview

White Tiger is a **Telegram Mini App** for AI-powered music creation targeting **meme coin creators**. Users pay with **5 different payment rails** to generate music, album art, and brand packages.

### Core Features
- AI music generation (ElevenLabs)
- Album art generation (Gemini)
- Brand package generation
- Lyric intelligence with pattern analysis
- Multi-rail payments (Stars, TON, USDC, Card, Onramp)

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

## Current Status (December 2025)

### What's LIVE
- **@MSUCOBot** - Telegram bot with Mini App menu button
- **5 Payment Rails** - Stars, TON, x402 USDC, Coinbase Onramp, Stripe
- **Qdrant** - 1000 lyric vectors in `lyric_patterns` collection
- **Turso** - 8 tables (users, tracks, transactions, etc.)
- **x402 Protected APIs** - Music ($0.50), Album Art ($0.10), Brand ($0.25)
- **Canva MCP** - Connected for brand asset generation

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
│   │   ├── telegram-native.ts      # Telegram Mini App SDK
│   │   └── telegram.ts             # Stars payments
│   ├── hooks/
│   │   └── useTelegram.ts          # Telegram React hooks
│   └── components/payments/
│       └── multi-rail-checkout.tsx # Universal checkout UI
├── scripts/lyric-pipeline/         # Intelligence engine
├── public/
│   ├── manifest.json               # White Tiger PWA manifest
│   ├── tonconnect-manifest.json    # White Tiger TON branding
│   └── assets/brand/               # All brand assets
│       ├── icons/                  # PWA icons
│       └── social/                 # Social media assets
└── skills/                         # Documentation
    ├── INDEX.md
    ├── BRAND_KIT_MASTER.skill.md
    └── PAYMENT_EMPIRE.skill.md
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
