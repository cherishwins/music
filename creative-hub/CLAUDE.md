# Creative Hub - AI Agent Instructions

## Project Overview

Creative Hub is a **Telegram Mini App** for monetized AI-powered content creation. Users pay with **Telegram Stars** or **TON cryptocurrency** to generate music, videos, slides, and voice content.

### Core Concept
- Transform community threads/posts into songs ("Thread to Hit")
- Generate AI presentations ("Quantum Slide Decks")
- Create videos with Runway ML
- Voice cloning with ElevenLabs
- Social media distribution via n8n workflows

---

## Architecture

```
creative-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page with Three.js scene
│   │   ├── create/page.tsx     # Content creation wizard
│   │   ├── dashboard/page.tsx  # User dashboard
│   │   └── api/payments/       # Payment endpoints
│   ├── components/
│   │   ├── three/              # Three.js 3D scenes
│   │   ├── payments/           # TON + Telegram Stars
│   │   ├── sections/           # Landing page sections
│   │   └── video/              # Mux video player
│   └── lib/
│       ├── store.ts            # Zustand state management
│       └── n8n.ts              # n8n webhook integrations
```

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **3D Graphics**: Three.js + React Three Fiber + Drei
- **Styling**: Tailwind CSS + Framer Motion
- **State**: Zustand with persistence
- **Payments**: TON Connect + Telegram Stars
- **Video**: Mux Player
- **Automation**: n8n webhooks

---

## Current Status

### What Works
- Landing page with animated Three.js cosmic scene
- Glassmorphism UI with smooth animations
- TON Connect wallet integration (frontend)
- Telegram WebApp detection and theming
- Payment modal UI (Stars + TON options)
- Zustand store with local persistence
- n8n webhook infrastructure (needs configuration)
- Responsive design

### What Needs Implementation

#### Priority 1: Core Functionality
1. **Telegram Bot Creation** - Required for Stars payments
2. **API Route for Real Payments** - Currently returns mock data
3. **AI Content Generation Endpoints** - All "Generate" buttons are non-functional
4. **Database** - User data isn't persisted beyond localStorage

#### Priority 2: AI Integrations
1. **Thread-to-Hit Pipeline**:
   - Text extraction from URLs
   - Claude API for lyrics/story extraction
   - MusicGen/Suno for beat generation
   - RVC for voice conversion
2. **Slide Generator**:
   - Claude API for content generation
   - Image generation (DALL-E/Midjourney)
   - PDF export
3. **Video Generator**:
   - Runway ML API integration
4. **Voice Studio**:
   - ElevenLabs API integration

#### Priority 3: Distribution
1. **n8n Workflow Setup** - Social media posting automation
2. **Analytics Dashboard** - Real metrics instead of mock data

---

## Required Services & API Keys

### 1. Telegram Bot (REQUIRED)
```bash
# Create via @BotFather on Telegram
# Get your bot token
TELEGRAM_BOT_TOKEN=your_bot_token_here
```
**Setup Steps:**
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Name it (e.g., "Creative Hub Bot")
4. Username must end in `bot` (e.g., `CreativeHubBot`)
5. Copy the token provided

### 2. TON Wallet (REQUIRED for TON payments)
```bash
# Your TON wallet address for receiving payments
NEXT_PUBLIC_TON_WALLET_ADDRESS=UQ...your_address
```
**Setup:**
1. Install Tonkeeper or TON Wallet
2. Create a wallet
3. Copy the address

### 3. Mux Video (OPTIONAL - for background video)
```bash
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
NEXT_PUBLIC_MUX_PLAYBACK_ID=your_default_playback_id
```
**Get at:** https://dashboard.mux.com/

### 4. ElevenLabs (for Voice Studio)
```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```
**Get at:** https://elevenlabs.io/
- Free tier: 10,000 characters/month
- Paid: Starts at $5/month

### 5. Runway ML (for Video Generation)
```bash
RUNWAY_API_KEY=your_runway_api_key
```
**Get at:** https://runwayml.com/
- Requires paid plan for API access

### 6. Anthropic Claude (for AI Content)
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
```
**Get at:** https://console.anthropic.com/
- Used for lyrics extraction, slide content, story generation

### 7. n8n (for Social Distribution)
```bash
NEXT_PUBLIC_N8N_CONTENT_CREATED_WEBHOOK=https://your-n8n.com/webhook/content-created
NEXT_PUBLIC_N8N_SOCIAL_DISTRIBUTE_WEBHOOK=https://your-n8n.com/webhook/social-distribute
NEXT_PUBLIC_N8N_USER_SIGNUP_WEBHOOK=https://your-n8n.com/webhook/user-signup
NEXT_PUBLIC_N8N_PAYMENT_COMPLETE_WEBHOOK=https://your-n8n.com/webhook/payment-complete
NEXT_PUBLIC_N8N_ANALYTICS_WEBHOOK=https://your-n8n.com/webhook/analytics
```
**Options:**
- Self-hosted: https://n8n.io/
- Cloud: https://n8n.cloud/ (free tier available)

### 8. Database (OPTIONAL but recommended)
```bash
DATABASE_URL=postgresql://...or_mongodb://...
```
**Options:**
- Supabase (free tier): https://supabase.com/
- PlanetScale (free tier): https://planetscale.com/
- Neon (free tier): https://neon.tech/

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

---

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo
2. Set environment variables in Vercel dashboard
3. Deploy

### After Deployment - Update These Files

**public/tonconnect-manifest.json:**
```json
{
  "url": "https://YOUR-ACTUAL-DOMAIN.vercel.app",
  "name": "Creative Hub",
  "iconUrl": "https://YOUR-ACTUAL-DOMAIN.vercel.app/icon.png",
  "termsOfUseUrl": "https://YOUR-ACTUAL-DOMAIN.vercel.app/terms",
  "privacyPolicyUrl": "https://YOUR-ACTUAL-DOMAIN.vercel.app/privacy"
}
```

**Configure Telegram Bot for Mini App:**
1. Message @BotFather
2. `/setmenubutton` - Set your app URL
3. `/setdomain` - Add your domain for WebApp

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main landing with Three.js + video |
| `src/app/create/page.tsx` | Content creation wizard (needs backend) |
| `src/app/api/payments/create-invoice/route.ts` | **MOCK** - needs Telegram Bot API |
| `src/lib/store.ts` | Zustand store + pricing plans |
| `src/lib/n8n.ts` | Social distribution webhooks |
| `src/components/three/cosmic-scene.tsx` | 3D animated background |
| `src/components/payments/telegram-payment.tsx` | Payment modal + TON integration |

---

## Implementation Priorities

When continuing development:

1. **First**: Create Telegram Bot + implement real Stars payment
2. **Second**: Add database (Supabase recommended)
3. **Third**: Implement one AI feature end-to-end (suggest: Voice Studio with ElevenLabs - simplest API)
4. **Fourth**: Add Thread-to-Hit with Claude API
5. **Fifth**: Set up n8n for social distribution

---

## Code Style

- TypeScript strict mode
- Tailwind for styling (use existing color tokens: `gold-*`, `cosmic-*`)
- Framer Motion for animations
- Components in `src/components/` with clear naming
- API routes in `src/app/api/`
- Use existing glass/glass-gold CSS classes for UI consistency

---

## Testing Payments Locally

For Telegram Stars:
- Use ngrok to expose localhost
- Set webhook URL in BotFather to ngrok URL
- Test in Telegram's WebApp inspector

For TON:
- TON Connect works in browser
- Use testnet first: set network in TonConnectUIProvider
