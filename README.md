# White Tiger 808

> AI-powered meme coin branding & anthem generation platform

**Status**: Active Development
**Stack**: Next.js 14, TypeScript, Telegram Mini App
**Live**: [@MSUCOBot](https://t.me/MSUCOBot) | [creative-hub-virid.vercel.app](https://creative-hub-virid.vercel.app)

---

## What is this?

One-stop shop for meme coin creators:
- **Brand Forge** - Name, ticker, colors, logo prompt
- **Anthem Generator** - AI voice + custom track for your coin
- **Album Art** - Cover art, PFPs, banners
- **Social Kit** - Twitter/TG templates, bios

Pay with Telegram Stars, TON, or USDC.

---

## Repository Structure

```
music/
├── creative-hub/          # Main Next.js app (THE PRODUCT)
│   ├── src/app/           # Pages and API routes
│   ├── src/lib/           # Integrations (payments, AI, db)
│   ├── src/components/    # React components
│   ├── scripts/           # Lyric intelligence pipeline
│   ├── skills/            # AI prompt engineering docs
│   └── docs/              # Technical documentation
│
├── docs/                  # Project-level docs
│   ├── ARCHITECTURE.md    # System design
│   └── BUSINESS.md        # Financial tracking
│
├── _archive/              # Deprecated/experimental code
│   ├── ThreadToHitRemix/  # Legacy Python pipeline
│   ├── mcp-server/        # Claude MCP integration (future)
│   └── facilitator/       # x402 payment service (future)
│
└── CLAUDE.md              # AI assistant instructions
```

---

## Quick Start

```bash
cd creative-hub
pnpm install
cp .env.example .env  # Add your API keys
pnpm dev
```

---

## Documentation

| Doc | Description |
|-----|-------------|
| [CLAUDE.md](./CLAUDE.md) | AI assistant context |
| [creative-hub/STATUS.md](./creative-hub/STATUS.md) | What's live now |
| [creative-hub/SETUP.md](./creative-hub/SETUP.md) | Setup guide |
| [creative-hub/skills/](./creative-hub/skills/) | AI generation skills |

---

## Links

- **Telegram Bot**: [@MSUCOBot](https://t.me/MSUCOBot)
- **Vercel**: [of8/creative-hub](https://vercel.com/of8/creative-hub)
- **GitHub**: [cherishwins/music](https://github.com/cherishwins/music)
