<p align="center">
  <img src="https://creative-hub-virid.vercel.app/assets/brand/social/og-image-1200x630.jpg" alt="White Tiger Studio" width="100%">
</p>

<h1 align="center">White Tiger Studio</h1>

<p align="center">
  <strong>AI-Powered Music & Brand Generation for the TON Ecosystem</strong>
</p>

<p align="center">
  <a href="https://t.me/MSUCOBot"><img src="https://img.shields.io/badge/Telegram-Bot-blue?style=for-the-badge&logo=telegram" alt="Telegram Bot"></a>
  <a href="https://creative-hub-virid.vercel.app"><img src="https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo"></a>
  <a href="https://ton.org"><img src="https://img.shields.io/badge/Built%20on-TON-0088cc?style=for-the-badge" alt="Built on TON"></a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-live-demo">Demo</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-architecture">Architecture</a>
</p>

---

## The Problem

Meme coin creators on TON need:
- **Professional branding** (but can't afford designers)
- **Viral music/anthems** (but aren't musicians)
- **Trust verification** (to prove they won't rug)

**White Tiger solves all three.**

---

## Features

### AI Music Generation
Generate custom tracks for your token launch in seconds using ElevenLabs' music API.

<img src="https://creative-hub-virid.vercel.app/assets/brand/hero-dj-party.jpg" alt="Music Generation" width="400">

- Custom genre, mood, and tempo
- Voice cloning support
- Viral-optimized for TikTok (140 BPM, hook-first)
- **$0.50 per track**

---

### Minter Credit Score (RUG SCORE)
**"The Equifax of Memecoins"** - Know before you ape.

<img src="https://creative-hub-virid.vercel.app/assets/brand/hero-laser-eyes.jpg" alt="Rug Score" width="400">

Analyzes any TON wallet or token and returns:
- **Score (0-1000)** with letter grade (A+ to F)
- **Risk Level** (LOW / MEDIUM / HIGH / CRITICAL)
- **Component Breakdown:**
  - History (35%) - Minter's track record
  - Safety (40%) - Mint authority, LP locks, honeypot detection
  - Behavior (25%) - Wallet age, patterns

**Live API:**
```bash
curl https://creative-hub-virid.vercel.app/api/minter-score/EQBZenh5TFhBoxH4VPv1HDS16XcZ9_2XVZcUSMhmnzxTJUxf
```

---

### Brand Forge
Complete meme coin brand package in one click.

- Token name & ticker generation
- Color palette & visual identity
- Logo concept prompts
- Social media templates
- Bio copy for Twitter/TG
- **$0.25 per package**

---

### 5 Payment Rails

| Rail | Status | Network |
|------|--------|---------|
| **Telegram Stars** | Live | Telegram |
| **TON Connect** | Live | TON |
| **x402 USDC** | Live | Base |
| **Coinbase Onramp** | Ready | Multi-chain |
| **Stripe** | Ready | Fiat |

---

## Live Demo

| Product | Link |
|---------|------|
| **Telegram Bot** | [@MSUCOBot](https://t.me/MSUCOBot) |
| **Web App** | [creative-hub-virid.vercel.app](https://creative-hub-virid.vercel.app) |
| **Rug Score** | [/rug-score](https://creative-hub-virid.vercel.app/rug-score) |
| **Brand Forge** | [/brand](https://creative-hub-virid.vercel.app/brand) |

---

## Tech Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animations-ff69b4?style=flat-square)

### Backend & AI
![Vercel](https://img.shields.io/badge/Vercel-Edge_Functions-black?style=flat-square&logo=vercel)
![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Music_AI-purple?style=flat-square)
![xAI](https://img.shields.io/badge/xAI-Grok_Vision-orange?style=flat-square)
![Anthropic](https://img.shields.io/badge/Anthropic-Claude-tan?style=flat-square)

### Blockchain
![TON](https://img.shields.io/badge/TON-Connect-0088cc?style=flat-square)
![TonAPI](https://img.shields.io/badge/TonAPI-Blockchain_Data-blue?style=flat-square)
![DYOR](https://img.shields.io/badge/DYOR.io-Trust_Scores-green?style=flat-square)

### Database
![Turso](https://img.shields.io/badge/Turso-libSQL-4ff8d2?style=flat-square)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-dc382d?style=flat-square)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        WHITE TIGER STUDIO                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   TELEGRAM   │  │   WEB APP    │  │   API        │          │
│  │   Mini App   │  │   Next.js    │  │   Routes     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────────┬────┴────────────────┘                   │
│                      │                                          │
│              ┌───────▼───────┐                                  │
│              │  PAYMENT HUB  │                                  │
│              │  Stars │ TON  │                                  │
│              │  x402  │ Card │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
│    ┌─────────────────┼─────────────────┐                       │
│    │                 │                 │                        │
│    ▼                 ▼                 ▼                        │
│ ┌──────┐       ┌──────────┐      ┌──────────┐                  │
│ │Music │       │Rug Score │      │Brand     │                  │
│ │Gen   │       │API       │      │Forge     │                  │
│ └──┬───┘       └────┬─────┘      └────┬─────┘                  │
│    │                │                 │                         │
│    ▼                ▼                 ▼                         │
│ ElevenLabs     TonAPI +          xAI Grok +                    │
│                DYOR.io           Claude                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/cherishwins/music.git
cd music/creative-hub

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Add your API keys (see .env.example for required keys)

# Run locally
pnpm dev

# Open http://localhost:3000
```

### Required API Keys

| Service | Purpose | Get it at |
|---------|---------|-----------|
| `ELEVENLABS_API_KEY` | Music generation | [elevenlabs.io](https://elevenlabs.io) |
| `TONAPI_KEY` | Blockchain data | [tonconsole.com](https://tonconsole.com) |
| `XAI_API_KEY` | Image generation | [x.ai](https://x.ai) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot | [@BotFather](https://t.me/BotFather) |

---

## Roadmap

### Completed (December 2025)
- [x] AI Music Generation (ElevenLabs)
- [x] Minter Credit Score API
- [x] Brand Forge
- [x] 5 Payment Rails (Stars, TON, x402, Onramp, Stripe)
- [x] Voice Cloning
- [x] Viral Intelligence (4,832 hip-hop vectors)
- [x] TonAPI + DYOR.io Integration

### In Progress
- [ ] MemeSeal - On-chain proof of predictions
- [ ] SealBet - Prediction markets ("Will it rug?")
- [ ] Insurance Products

### Future
- [ ] Governance Token
- [ ] B2B API Licensing
- [ ] Multi-chain Expansion

---

## The Vision

**Short-term:** Be THE trust layer for TON meme coins

**Medium-term:** Prediction markets settled by our proprietary Minter Credit Score

**Long-term:** "Polymarket of TON" with integrated music/brand creation

---

## Repository Structure

```
music/
├── creative-hub/          # Main Next.js application
│   ├── src/
│   │   ├── app/           # Pages + API routes
│   │   ├── lib/           # Core integrations
│   │   │   ├── minter-score.ts   # Credit scoring algorithm
│   │   │   ├── tonapi.ts         # TON blockchain client
│   │   │   ├── dyor-api.ts       # Trust score integration
│   │   │   ├── music.ts          # ElevenLabs music gen
│   │   │   └── x402.ts           # Payment middleware
│   │   └── components/    # React components
│   ├── scripts/           # Lyric intelligence pipeline
│   └── docs/              # Technical documentation
│
├── CLAUDE.md              # AI assistant instructions
└── README.md              # You are here
```

---

## Links

| Resource | URL |
|----------|-----|
| **Live App** | [creative-hub-virid.vercel.app](https://creative-hub-virid.vercel.app) |
| **Telegram** | [@MSUCOBot](https://t.me/MSUCOBot) |
| **API Docs** | [/api/health](https://creative-hub-virid.vercel.app/api/health) |

---

## Support & Grants

This project is supported by the TON ecosystem. We're actively seeking:
- **STON.fi Grant Program** - Applied
- **TON Foundation Grants**
- **Strategic Partnerships**

---

<p align="center">
  <img src="https://creative-hub-virid.vercel.app/assets/brand/social/profile-200x200.jpg" alt="White Tiger" width="80">
  <br>
  <strong>Built with by the White Tiger team</strong>
  <br>
  <sub>Making meme coins less ruggable, one score at a time.</sub>
</p>
