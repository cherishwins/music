# Creative Hub Monetization Architecture
## Capturing Value Without Burning Christmas Money

---

## THE BUSINESS MODEL

```
FREE TIER (Bait)
├── Generate tracks (watermarked audio)
├── 3 tracks/month storage
├── Community feed (with "Made with CreativeHub" badge)
└── Basic features

CREATOR TIER - 200 Stars ($3.99) or 2 TON
├── NO watermark on audio
├── 50 tracks storage
├── Remove community branding
├── Priority generation queue
└── Download stems separately

STUDIO TIER - 500 Stars ($9.99) or 5 TON
├── Everything in Creator
├── Unlimited storage
├── API access
├── Commercial license
├── White-label exports
└── Custom branding on shares
```

---

## DATABASE SCHEMA (Supabase/Postgres)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'creator', 'studio')),
  tier_expires_at TIMESTAMPTZ,
  credits INTEGER DEFAULT 0,
  track_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tracks Table
```sql
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Track metadata
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  bpm INTEGER,
  key TEXT,
  duration_seconds INTEGER,

  -- Files (Vercel Blob URLs)
  audio_url TEXT NOT NULL,           -- Full track (watermarked if free)
  audio_url_clean TEXT,              -- Unwatermarked (paid only)
  cover_url TEXT,
  waveform_data JSONB,

  -- AI generation metadata
  prompt TEXT,
  composition_plan JSONB,
  artist_profile TEXT,               -- JucheGang character used

  -- Community
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  plays_count INTEGER DEFAULT 0,

  -- Monetization
  is_watermarked BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Payment details
  type TEXT NOT NULL CHECK (type IN ('stars', 'ton', 'credits')),
  amount DECIMAL NOT NULL,
  currency TEXT NOT NULL,

  -- What they bought
  product TEXT NOT NULL,  -- 'creator_tier', 'studio_tier', 'credits_100', etc.

  -- External IDs
  telegram_payment_id TEXT,
  ton_transaction_hash TEXT,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Community Posts Table
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,

  caption TEXT,

  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,

  -- Visibility
  is_featured BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Likes Table
```sql
CREATE TABLE likes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);
```

---

## WATERMARKING STRATEGY

### Audio Watermark (Free Tier)
```
Options:
1. Audio tag at start/end: "Created with Creative Hub" (3 seconds)
2. Subtle audio watermark throughout (inaudible but detectable)
3. Both: Audible intro + inaudible throughout

Recommendation: Option 1 (simplest, most obvious value prop to remove)
```

### Implementation
```typescript
// Use FFmpeg to add audio tag
async function addWatermark(audioUrl: string): Promise<string> {
  // 1. Download original
  // 2. Concatenate watermark audio at start
  // 3. Upload to Vercel Blob
  // 4. Return watermarked URL
}
```

### Visual Watermark (Community Posts)
```
Free tier: "Made with CreativeHub" overlay on waveform/cover
Paid tier: Clean or custom branding
```

---

## STORAGE LIMITS

| Tier | Tracks | Storage | Retention |
|------|--------|---------|-----------|
| Free | 3 | ~30MB | 30 days inactive delete |
| Creator | 50 | ~500MB | 1 year |
| Studio | Unlimited | 5GB | Forever |

---

## API ROUTES NEEDED

```
POST /api/auth/telegram     # Telegram Mini App auth
GET  /api/user              # Get current user
PUT  /api/user              # Update profile

POST /api/tracks            # Create track (generation)
GET  /api/tracks            # List user's tracks
GET  /api/tracks/:id        # Get track details
DELETE /api/tracks/:id      # Delete track

POST /api/tracks/:id/publish  # Publish to community
GET  /api/community/feed      # Community feed
POST /api/community/:id/like  # Like a post

POST /api/payments/subscribe  # Start subscription
POST /api/payments/webhook    # Telegram/TON webhook
GET  /api/payments/history    # Transaction history

POST /api/generate/music      # Generate track (uses credits/tier)
```

---

## SUPABASE SETUP

### 1. Create Project
```bash
# Go to supabase.com, create project
# Get these values:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Server-side only
```

### 2. Install SDK
```bash
pnpm add @supabase/supabase-js
```

### 3. Client Setup
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side with service role
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

---

## TELEGRAM AUTH FLOW

```
1. User opens Mini App
2. Telegram passes initData (signed by bot)
3. We verify signature server-side
4. Create/update user in Supabase
5. Return session token
6. All API calls include token
```

```typescript
// Verify Telegram initData
import crypto from 'crypto'

function verifyTelegramAuth(initData: string): TelegramUser | null {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  params.delete('hash')

  // Sort and create data check string
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  // Create secret key
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.TELEGRAM_BOT_TOKEN!)
    .digest()

  // Verify hash
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  if (calculatedHash !== hash) return null

  return JSON.parse(params.get('user') || '{}')
}
```

---

## MINIMUM VIABLE PRODUCT (MVP) ORDER

### Phase 1: Auth + Storage (Do First)
1. Set up Supabase project
2. Create database tables
3. Implement Telegram auth
4. Connect track generation to save to DB + Blob

### Phase 2: Monetization (Do Second)
1. Add watermark to generated audio
2. Implement tier checking
3. Connect Telegram Stars payment
4. Tier upgrade flow

### Phase 3: Community (Do Third)
1. Community feed page
2. Publish track flow
3. Like/engagement
4. Trending algorithm

---

## COST ANALYSIS

### Supabase Free Tier
- 500MB database: ~5,000 users with 50 tracks each
- 1GB storage: ~100 tracks at 10MB each
- 50k monthly active users

### Vercel Blob (Already Have)
- Use for audio files
- $0.15/GB stored, $0.10/GB transferred

### Break-even
- 50 Creator subscriptions ($200) covers ~1 year of growth
- Focus on conversion: Free → Creator

---

*"Free gets them in. Watermark gets them to pay. Community keeps them."*
