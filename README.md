# ALCHEMY - Transmute Noise into Gold

AI-powered audio production platform. Turn community threads into polished tracks.

## Repository Structure

```
music/
├── creative-hub/           # Main web application (Next.js 14)
│   ├── src/
│   │   ├── app/            # Pages & API routes
│   │   │   ├── api/        # BACKEND - API endpoints
│   │   │   │   ├── generate/
│   │   │   │   │   ├── thread-to-hit/   # Thread → Song pipeline
│   │   │   │   │   ├── voice/           # ElevenLabs TTS
│   │   │   │   │   ├── slides/          # Presentation generator
│   │   │   │   │   └── video-prompt/    # Video prompt generator
│   │   │   │   └── payments/            # Telegram Stars + TON
│   │   │   ├── create/     # Creation wizard page
│   │   │   ├── dashboard/  # User dashboard page
│   │   │   └── page.tsx    # Landing page
│   │   ├── components/     # FRONTEND - React components
│   │   │   ├── sections/   # Landing page sections
│   │   │   ├── three/      # Three.js 3D scenes
│   │   │   ├── payments/   # Payment UI
│   │   │   └── video/      # Video player
│   │   └── lib/            # BACKEND - Core logic
│   │       ├── ai.ts       # Claude API integration
│   │       ├── music.ts    # Suno music generation
│   │       ├── voice.ts    # ElevenLabs integration
│   │       ├── telegram.ts # Telegram Stars payments
│   │       └── store.ts    # Zustand state
│   └── public/             # Static assets
│       └── assets/         # Brand logos
│
├── ThreadToHitRemix/       # Brand assets & original concept
│   └── *.png, *.svg        # Logo files
│
└── CLAUDE.md               # AI agent instructions
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind CSS, Framer Motion |
| 3D | Three.js, React Three Fiber, Drei |
| Backend | Next.js API Routes |
| AI | Claude (Anthropic), Suno, ElevenLabs |
| Payments | Telegram Stars, TON Connect |
| State | Zustand |
| Hosting | Vercel |

## Quick Start

```bash
cd creative-hub
pnpm install
pnpm dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
TELEGRAM_BOT_TOKEN=       # From @BotFather
ANTHROPIC_API_KEY=        # From console.anthropic.com
SUNO_API_KEY=             # From sunoapi.org
ELEVENLABS_API_KEY=       # From elevenlabs.io (optional)
NEXT_PUBLIC_TON_WALLET_ADDRESS=  # Your TON wallet
```

## Live URLs

- **App**: https://creative-hub-of8.vercel.app
- **Telegram Bot**: @Alchemy_Studio_Bot

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/ai.ts` | Claude API - lyrics, slides, prompts |
| `src/lib/music.ts` | Suno API - Thread-to-Hit pipeline |
| `src/lib/voice.ts` | ElevenLabs - voice synthesis |
| `src/lib/telegram.ts` | Telegram Stars payments |
| `src/app/api/generate/*` | API endpoints for all features |
