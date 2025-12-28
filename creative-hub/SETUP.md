# Creative Hub Setup Guide

Follow these steps to get Creative Hub running.

---

## Step 1: Install Dependencies

```bash
cd creative-hub
pnpm install
```

---

## Step 2: Create Environment File

```bash
cp .env.example .env
```

---

## Step 3: Get Required API Keys

### A. Telegram Bot (REQUIRED)

1. Open Telegram and message **@BotFather**
2. Send `/newbot`
3. Choose a display name: `Creative Hub`
4. Choose a username: `YourCreativeHubBot` (must end in `bot`)
5. Copy the token and add to `.env`:
   ```
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxYZ
   ```

### B. TON Wallet (REQUIRED)

1. Install **Tonkeeper** app (iOS/Android) or use browser extension
2. Create a new wallet
3. Copy your wallet address (starts with `UQ` or `EQ`)
4. Add to `.env`:
   ```
   NEXT_PUBLIC_TON_WALLET_ADDRESS=UQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### C. Anthropic Claude (For AI Content)

1. Go to https://console.anthropic.com/
2. Create account and get API key
3. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   ```

### D. ElevenLabs (For Voice Generation)

1. Go to https://elevenlabs.io/
2. Sign up (free tier available)
3. Go to Profile → API Key
4. Add to `.env`:
   ```
   ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxx
   ```

### E. Mux (OPTIONAL - For Video Background)

1. Go to https://dashboard.mux.com/
2. Create account
3. Create API Access Token
4. Add to `.env`:
   ```
   MUX_TOKEN_ID=xxxxxxxx
   MUX_TOKEN_SECRET=xxxxxxxxxxxxxxxx
   ```

### F. n8n (For Social Media Automation)

**Option A: n8n Cloud (Easiest)**
1. Go to https://n8n.cloud/
2. Create free account
3. Create webhooks for each event
4. Add URLs to `.env`

**Option B: Self-Hosted**
```bash
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

---

## Step 4: Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000

---

## Step 5: Test Locally with Telegram

To test Telegram Mini App features locally:

1. Install ngrok: https://ngrok.com/
2. Run ngrok:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. In Telegram, message @BotFather:
   ```
   /setmenubutton
   ```
   - Select your bot
   - Enter the ngrok URL

---

## Step 6: Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com/
3. Import your repository
4. Add all environment variables from `.env`
5. Deploy

### After Deployment:

1. Update `public/tonconnect-manifest.json` with your real domain
2. Update BotFather with production URL:
   ```
   /setmenubutton
   ```

---

## Quick Reference: API Key Sources

| Service | URL | Free Tier |
|---------|-----|-----------|
| Telegram Bot | @BotFather on Telegram | Yes |
| TON Wallet | Tonkeeper app | Yes |
| Anthropic Claude | console.anthropic.com | $5 credit |
| ElevenLabs | elevenlabs.io | 10k chars/mo |
| Mux Video | dashboard.mux.com | Limited |
| n8n | n8n.cloud | Yes |
| Runway ML | runwayml.com | Trial |
| Supabase (DB) | supabase.com | Yes |

---

## What Each Service Does

- **Telegram Bot**: Handles Stars payments, user auth
- **TON Wallet**: Receives TON cryptocurrency payments
- **Claude**: Generates lyrics, story extraction, slide content
- **ElevenLabs**: Voice cloning and text-to-speech
- **Mux**: Hosts and streams video content
- **n8n**: Automates posting to social media
- **Runway**: AI video generation
- **Supabase**: Stores user data, content, transactions

---

## Minimum Viable Setup

To just get the app running with basic functionality:

1. Telegram Bot Token (for auth)
2. TON Wallet Address (for payments)
3. Claude API Key (for AI content)

Everything else can be added incrementally.
