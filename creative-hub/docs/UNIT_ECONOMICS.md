# White Tiger - Unit Economics & Cost Monitoring

## Know Your Numbers or Die

**Updated**: 2025-12-30

---

## SERVICE PROVIDERS QUICK REFERENCE

| Service | Purpose | Plan | Monthly Cost | Status |
|---------|---------|------|--------------|--------|
| [ElevenLabs](https://elevenlabs.io/pricing) | Music + Voice | Creator | $22 | Active |
| [Anthropic Claude](https://platform.claude.com/docs/en/about-claude/pricing) | AI Text | Pay-as-you-go | ~$5-20 | Active |
| [Turso](https://turso.tech/pricing) | Database | Free | $0 | Active |
| [Qdrant](https://qdrant.tech/pricing/) | Vectors | Free (1GB) | $0 | Active |
| [Vercel](https://vercel.com/pricing) | Hosting | Hobby | $0 | Active |
| [Replicate](https://replicate.com/pricing) | Images | Pay-as-you-go | ~$0-10 | Active |

**Total Fixed Costs**: ~$27-52/month

---

## COST PER TRACK GENERATED

### AI Model Costs (2025 Pricing)

| Service | Model | Cost | Usage |
|---------|-------|------|-------|
| **ElevenLabs Music** | music_v1 | ~$0.08/min (Creator plan) | Full song generation |
| **ElevenLabs Voice** | eleven_multilingual_v2 | ~$0.002/100 chars | TTS, watermarks |
| **ElevenLabs IVC** | Instant Voice Clone | Included | User voice clones |
| **Anthropic Claude** | claude-3-haiku | $0.25/1M input, $1.25/1M output | Lyrics, prompts |
| **Anthropic Claude** | claude-3.5-haiku | $0.80/1M input, $4/1M output | Better quality |
| **Anthropic Claude** | claude-4-sonnet | $3/1M input, $15/1M output | Complex generation |
| **xAI Grok** | grok-3 | $2/1M input, $6/1M output | Text only (no voice) |
| **Replicate Flux** | FLUX.1-schnell | $0.003/image | Album art |
| **Replicate Flux** | FLUX [dev] | $0.025/image | Better quality |

### Storage & Infrastructure Costs

| Service | Tier | Limits | Cost |
|---------|------|--------|------|
| **Vercel Blob** | Hobby | 1GB | $0 |
| **Vercel Blob** | Pro | $0.15/GB stored, $0.10/GB transfer | Pay-as-you-go |
| **Turso** | Free | 1B reads, 25M writes, 9GB | $0 |
| **Qdrant** | Free | 1GB RAM, ~1M vectors | $0 |
| **Vercel** | Hobby | 100GB bandwidth, 100K invocations | $0 |

### Free Tier Limits & Thresholds

| Service | Free Limit | Warning At | Upgrade Trigger |
|---------|------------|------------|-----------------|
| ElevenLabs Music | 62 min/mo (Creator) | 50 min | 80% usage |
| Turso Reads | 1 billion/mo | 500M | 800M |
| Qdrant Vectors | ~1M (768d) | 500K | 800K |
| Vercel Invocations | 100K/mo | 80K | 95K |

### Per-Track Cost Breakdown

```
TYPICAL TRACK GENERATION:
├── Composition Plan (FREE)          $0.00
├── ElevenLabs Music Generation      $0.20  (avg)
├── Claude Haiku (prompt gen)        $0.01
├── Storage (10MB × $0.15/GB)        $0.0015/month
├── Bandwidth (10MB × 10 plays)      $0.01
└── TOTAL COGS                       ~$0.23/track
```

---

## REVENUE PER CUSTOMER

### Telegram Stars Pricing

| Tier | Stars | USD Value | Our Take (70%) |
|------|-------|-----------|----------------|
| Creator | 200 | $3.99 | $2.79 |
| Studio | 500 | $9.99 | $6.99 |

*Telegram takes 30% of Stars payments*

### TON Pricing

| Tier | TON | USD Value (@ $6/TON) | Our Take (100%) |
|------|-----|----------------------|-----------------|
| Creator | 2 | $12 | $12 |
| Studio | 5 | $30 | $30 |

*TON = no middleman, we keep 100%*

---

## UNIT ECONOMICS BY TIER

### Free User
```
Revenue:                    $0
Cost per track:            $0.23
Tracks/month (avg):        2
Monthly cost:              -$0.46
Storage (30 day delete):   ~$0

NET: -$0.46/month
```

### Creator Tier (Monthly)
```
Revenue (Stars):           $2.79
Revenue (TON):             $12.00

Cost per track:            $0.23
Tracks/month (avg):        10
Generation cost:           -$2.30
Storage (50 tracks):       -$0.075

NET (Stars):  $2.79 - $2.38 = +$0.41/month
NET (TON):    $12.00 - $2.38 = +$9.62/month
```

### Studio Tier (Monthly)
```
Revenue (Stars):           $6.99
Revenue (TON):             $30.00

Cost per track:            $0.23
Tracks/month (avg):        30
Generation cost:           -$6.90
Storage (unlimited):       -$0.50

NET (Stars):  $6.99 - $7.40 = -$0.41/month (LOSING MONEY!)
NET (TON):    $30.00 - $7.40 = +$22.60/month
```

---

## CRITICAL INSIGHTS

### 1. Stars Payments Are Thin
Telegram takes 30%. Creator tier barely profitable. Studio tier LOSES money on Stars.

**Action**: Push TON payments aggressively. 4x more revenue per conversion.

### 2. Free Tier Bleeds
Every free user costs ~$0.46/month in generation costs.

**Action**:
- Limit free tier to 3 tracks/month (not unlimited)
- Delete tracks after 30 days of inactivity
- Strong paywall after 3 tracks

### 3. Heavy Users Are Expensive
A Studio user generating 50 tracks/month costs $11.50 in generation alone.

**Action**:
- Consider per-track pricing above quota
- Or: $0.10 per track after 30/month for Studio

### 4. TON Is The Path to Profit
| Payment Method | Creator Margin | Studio Margin |
|----------------|----------------|---------------|
| Stars | 15% | -6% |
| TON | 80% | 75% |

---

## BREAK-EVEN ANALYSIS

### Monthly Fixed Costs
```
Vercel Pro (optional):     $20
Supabase (free tier):      $0
Domain:                    $1
Total Fixed:               ~$21/month
```

### Break-Even Points

**Stars Only:**
- Need 51 Creator subs to break even ($0.41 × 51 = $20.91)
- Studio tier loses money, avoid promoting for Stars

**TON Only:**
- Need 3 Creator subs to break even ($9.62 × 3 = $28.86)
- Or 1 Studio sub ($22.60)

**Mixed (Realistic):**
- 20 Creator (Stars) + 2 Creator (TON) = $8.20 + $19.24 = $27.44

---

## PRICING OPTIMIZATION

### Current Pricing (Needs Adjustment)

| Tier | Stars | TON | Issue |
|------|-------|-----|-------|
| Creator | 200 | 2 | Stars too cheap |
| Studio | 500 | 5 | Stars way too cheap |

### Recommended Pricing

| Tier | Stars | TON | Margin (Stars) | Margin (TON) |
|------|-------|-----|----------------|--------------|
| Creator | 300 | 2 | 35% | 80% |
| Studio | 1000 | 5 | 40% | 75% |

**Or**: Keep Stars prices, but Stars = fewer features
- Stars Creator = 20 tracks/month
- TON Creator = 50 tracks/month

---

## TRACKING DASHBOARD

### Metrics to Track

**Revenue**
- [ ] Daily Stars revenue
- [ ] Daily TON revenue
- [ ] MRR (Monthly Recurring Revenue)
- [ ] ARPU (Average Revenue Per User)

**Costs**
- [ ] Daily API spend by service
- [ ] Cost per track (rolling average)
- [ ] Storage costs

**Unit Economics**
- [ ] CAC (Customer Acquisition Cost) - currently $0 (organic)
- [ ] LTV (Lifetime Value)
- [ ] LTV:CAC ratio (target: 3:1+)
- [ ] Payback period

**Conversion**
- [ ] Free → Creator conversion rate
- [ ] Creator → Studio upgrade rate
- [ ] Stars vs TON payment ratio

---

## IMPLEMENTATION: COST TRACKING

### Track Every API Call

```typescript
// src/lib/cost-tracker.ts
export interface CostEvent {
  service: 'elevenlabs_music' | 'elevenlabs_voice' | 'anthropic' | 'xai' | 'replicate' | 'storage';
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  durationSeconds?: number;
  bytesStored?: number;
  estimatedCost: number;
  userId?: string;
  trackId?: string;
  timestamp: Date;
}

export async function trackCost(event: CostEvent) {
  // Insert into Supabase cost_events table
  await supabase.from('cost_events').insert(event);
}

// Usage in generation
const track = await generateMusic(prompt);
await trackCost({
  service: 'elevenlabs_music',
  model: 'music_v1',
  durationSeconds: 120,
  estimatedCost: 0.20,
  userId: user.id,
  trackId: track.id,
  timestamp: new Date()
});
```

### Cost Events Table

```sql
CREATE TABLE cost_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,
  model TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  duration_seconds INTEGER,
  bytes_stored BIGINT,
  estimated_cost DECIMAL(10, 6) NOT NULL,
  user_id UUID REFERENCES users(id),
  track_id UUID REFERENCES tracks(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily aggregation view
CREATE VIEW daily_costs AS
SELECT
  DATE(created_at) as date,
  service,
  SUM(estimated_cost) as total_cost,
  COUNT(*) as event_count
FROM cost_events
GROUP BY DATE(created_at), service
ORDER BY date DESC;
```

### Revenue Events Table

```sql
CREATE TABLE revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('subscription', 'credits', 'one_time')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stars', 'ton')),
  gross_amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2) NOT NULL,
  product TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily revenue view
CREATE VIEW daily_revenue AS
SELECT
  DATE(created_at) as date,
  payment_method,
  SUM(gross_amount) as gross,
  SUM(platform_fee) as fees,
  SUM(net_amount) as net,
  COUNT(*) as transactions
FROM revenue_events
GROUP BY DATE(created_at), payment_method
ORDER BY date DESC;
```

---

## WEEKLY REVIEW CHECKLIST

Every Sunday, check:

1. **Profit/Loss**
   - Total revenue (net)
   - Total costs
   - Net P/L

2. **Unit Economics**
   - Cost per track (is it going up?)
   - Average tracks per paying user
   - Free:Paid user ratio

3. **Conversion**
   - How many free → paid?
   - Stars vs TON split?

4. **Action Items**
   - Adjust pricing?
   - Limit free tier more?
   - Push TON harder?

---

## THE GOLDEN RULES

1. **TON > Stars** - Always nudge toward TON payment
2. **Free = Marketing** - Treat as CAC, not a product
3. **Track Everything** - Can't optimize what you don't measure
4. **Watermark = Revenue** - The annoyance IS the monetization
5. **30 Tracks = Danger Zone** - Heavy users on Studio/Stars lose money

---

*"Revenue is vanity, profit is sanity, cash is reality."*
