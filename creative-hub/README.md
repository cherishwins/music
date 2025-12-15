# Creative Hub

> Your Multiverse Creative Platform - Transform threads into hits, generate quantum slide decks, and monetize your creative content.

## Overview

Creative Hub is a B2C SaaS platform for digital creators, built with Next.js 14, Three.js, and Telegram Mini App integration. It combines AI-powered content creation tools with blockchain payments via Telegram Stars and TON.

## Features

### Creative Tools

- **Thread to Hit** - Transform community threads into polished songs using Claude, MusicGen, and RVC voice conversion
- **Quantum Slide Decks** - Generate reality-bending presentations with AI
- **Multiverse Videos** - Create videos with Runway ML integration
- **Voice Studio** - Clone and transform voices with ElevenLabs

### Technical Highlights

- **Stunning UX** - Three.js cosmic scene with WebGL effects, video backgrounds via Mux, smooth transitions
- **Telegram Integration** - Native Mini App support with Stars and TON payments (no KYC)
- **Social Automation** - n8n workflow integration for multi-platform distribution (Instagram, Facebook, X, VK, WeChat, etc.)
- **Performance Optimized** - Video preloading while Three.js loads, lazy loading, code splitting

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS, Framer Motion
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Video**: Mux Player
- **Payments**: Telegram Stars API, TON Connect
- **State**: Zustand
- **Automation**: n8n webhooks

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
cd creative-hub
npm install
```

### Environment Setup

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Telegram Bot (for Stars payments)
TELEGRAM_BOT_TOKEN=your_bot_token

# TON Wallet (for crypto payments)
NEXT_PUBLIC_TON_WALLET_ADDRESS=your_wallet

# Mux Video
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret

# n8n Webhooks
NEXT_PUBLIC_N8N_SOCIAL_DISTRIBUTE_WEBHOOK=https://your-n8n/webhook/...
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
creative-hub/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes (payments, etc.)
│   │   ├── dashboard/         # User dashboard
│   │   ├── create/            # Content creation interface
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── three/             # Three.js scenes
│   │   ├── video/             # Video components (Mux)
│   │   ├── payments/          # Telegram Stars & TON
│   │   └── sections/          # Page sections
│   └── lib/
│       ├── store.ts           # Zustand state management
│       └── n8n.ts             # n8n webhook integration
├── public/
│   └── tonconnect-manifest.json
└── package.json
```

## Payment Integration

### Telegram Stars

Stars are Telegram's in-app currency for digital goods. Integration:

```typescript
// In Telegram Mini App context
window.Telegram.WebApp.openInvoice(invoiceUrl, (status) => {
  if (status === "paid") {
    // Grant access/credits
  }
});
```

### TON Connect

For crypto payments:

```typescript
import { useTonConnectUI } from "@tonconnect/ui-react";

const [tonConnectUI] = useTonConnectUI();

await tonConnectUI.sendTransaction({
  validUntil: Math.floor(Date.now() / 1000) + 300,
  messages: [{ address: walletAddress, amount: "1000000000" }], // 1 TON
});
```

## Social Media Automation

The platform uses n8n webhooks for content distribution:

```typescript
import { distributeToSocialMedia } from "@/lib/n8n";

await distributeToSocialMedia({
  content: "Check out my new creation!",
  platforms: ["instagram", "twitter", "telegram"],
  mediaUrls: ["https://..."],
});
```

Supported platforms: Instagram, Facebook, X/Twitter, TikTok, LinkedIn, VK, Odnoklassniki, WeChat, Telegram

## Architecture Decisions

### Video + Three.js Loading Strategy

1. Video background plays immediately (fast startup)
2. Three.js scene loads in background
3. Progress tracked via Zustand store
4. Smooth opacity transition when scene ready

### No-KYC Payments

- Telegram Stars: Instant, no verification needed
- TON: Blockchain-native, wallet-based
- No traditional payment processors required

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## License

MIT

---

Built with quantum physics metaphors and multiverse love.
