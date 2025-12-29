# Creative Hub

> AI Music Production + Payment Empire + Music Intelligence

**Live**: [creative-hub-virid.vercel.app](https://creative-hub-virid.vercel.app)
**Bot**: [@MSUCOBot](https://t.me/MSUCOBot)

## What Is This?

A Telegram Mini App that generates hit songs using AI, with built-in payments (Stars, TON, USDC) and a music intelligence system that learns what makes songs successful.

## Current Status (Dec 2025)

| System | Status |
|--------|--------|
| **Turso DB** | ✅ 8 tables (users, tracks, payments) |
| **Qdrant** | ✅ 1000 lyric patterns loaded |
| **@MSUCOBot** | ✅ Menu button configured |
| **Payments** | ✅ Stars, TON, x402 (USDC) ready |

See `docs/STATUS_2025-12-28.md` for full details.

## The Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    MUSIC INTELLIGENCE                        │
│  Qdrant vectors → 12 hit themes → Pattern extraction         │
│  "What makes songs successful? Learn it. Use it."            │
├─────────────────────────────────────────────────────────────┤
│                    PAYMENT EMPIRE                            │
│  Telegram Stars │ TON Connect │ x402 (USDC) │ Coinbase       │
│  "Meet users wherever they want to pay"                      │
├─────────────────────────────────────────────────────────────┤
│                    GENERATION ENGINE                         │
│  ElevenLabs Music API → /v1/music/plan (FREE iteration)     │
│  Hit DNA enrichment → Better prompts → Better songs          │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Install
pnpm install

# Set up databases (see docs/SETUP_GUIDE.md)
# Then run migrations
pnpm drizzle-kit push

# Dev
pnpm dev
```

## Key Files

| What | Where |
|------|-------|
| Database schema | `src/lib/db/schema.ts` |
| Vector operations | `src/lib/vectors/index.ts` |
| Payments (x402) | `src/lib/x402.ts` |
| Lyric pipeline | `scripts/lyric-pipeline/` |
| Skills/docs | `skills/INDEX.md` |
| Status | `docs/STATUS_2025-12-28.md` |

## Lyric Intelligence

We analyze lyrics to find hit patterns:

```bash
cd scripts/lyric-pipeline

# Embed 10K songs
python embed_lyrics.py --hf-dataset vishnupriyavr/spotify-million-song-dataset --max-samples 10000

# Find patterns
python cluster_lyrics.py --input ./lyric_embeddings --clusters 20

# Classify by 12 proven hit themes
python theme_classifier.py --corpus ./lyric_embeddings

# Upload to Qdrant
python upload_to_qdrant.py --input ./lyric_embeddings

# Generate optimized prompts
python generation_optimizer.py --patterns ./lyric_embeddings --theme breakup --region KR
```

### The 12 Hit Themes (73.4% Billboard accuracy)

| Primary | Secondary |
|---------|-----------|
| Breakup (always works) | Nostalgia |
| Loss | Rebellion |
| Desire | **Cynicism (50% of 2020s!)** |
| Pain | Desperation |
| Aspiration | Escapism |
| Inspiration | Confusion |

## Payments

Three rails, no KYC:

```typescript
// Telegram Stars (1B+ users)
window.Telegram.WebApp.openInvoice(invoiceUrl);

// TON (87M wallets)
await tonConnectUI.sendTransaction({ ... });

// x402 USDC (agents + web)
// Automatic via middleware
```

## Environment Variables

```env
# Telegram
TELEGRAM_BOT_TOKEN=xxx

# Databases
TURSO_DATABASE_URL=libsql://xxx.turso.io
TURSO_AUTH_TOKEN=xxx
QDRANT_URL=https://xxx.qdrant.io:6333
QDRANT_API_KEY=xxx

# AI
ELEVENLABS_API_KEY=xxx
ANTHROPIC_API_KEY=xxx

# Payments
NEXT_PUBLIC_TON_WALLET_ADDRESS=xxx
X402_PAYMENT_ADDRESS=xxx
```

## Documentation

| Doc | Purpose |
|-----|---------|
| `docs/STATUS_2025-12-28.md` | **Read this first** - what's live |
| `docs/SETUP_GUIDE.md` | Database setup |
| `docs/HIT_DNA_ARCHITECTURE.md` | Music intelligence deep dive |
| `docs/MONETIZATION_ARCHITECTURE.md` | Business model |
| `docs/UNIT_ECONOMICS.md` | Cost tracking |
| `skills/INDEX.md` | Production techniques |

## The Moat

What we have that nobody else does:

1. **Pattern data** - 1000+ songs analyzed, scaling to 100K
2. **12 proven themes** - Mapped from 50 years of Billboard #1s
3. **Learning loop** - System gets smarter from usage
4. **Multi-rail payments** - Stars + TON + USDC + fiat
5. **Regional optimization** - US, KR, BR, UK, MX prompts

## Related Bots

| Bot | Purpose |
|-----|---------|
| @MSUCOBot | Creative Hub (this app) |
| @MemeScanTON_bot | Token scanner |
| @MemeSealTON_bot | Meme coins |
| @Alchemy_Studio_Bot | TBD |
| @NotaryTON_bot | TBD |

---

*"Skills in, hits out, payments flowing."*
