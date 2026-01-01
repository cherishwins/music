# White Tiger Growth Engine

> **Mission**: Build a self-sustaining flywheel where value creation → value capture → value redistribution → more value creation

---

## Business Model Canvas

### Customer Segments

| Segment | Pain Point | Instant Hook | Upsell Path |
|---------|------------|--------------|-------------|
| **Meme Coin Projects** | Need viral content, no music skills | Free anthem in 60 seconds | Official partnership, multi-track deal |
| **Crypto Influencers** | Need unique sounds, brand identity | Exclusive sound pack | Revenue share on viral tracks |
| **TikTok Creators** | Need trending sounds before others | Early access to new sounds | Premium sounds, no watermark |
| **Degens/Traders** | Want to support their bags | Create anthem for holdings | Leaderboard status, prizes |
| **Music Producers** | Want AI assistance, distribution | Free stems, beat generation | Pro tools, royalty splits |

### Value Propositions (By Segment)

**Meme Coin Projects:**
- "Your community anthem in 60 seconds"
- "Viral-optimized: 140-175 BPM, hook in 3 seconds"
- "Multi-platform distribution included"
- "Leaderboard for community engagement"

**Crypto Influencers:**
- "Unique intro/outro nobody else has"
- "Revenue share when your sound goes viral"
- "First access to trending meme sounds"

**TikTok Creators:**
- "Fresh sounds before they're overused"
- "Meme coin sounds = engagement bait"
- "No copyright strikes, fully licensed"

### Channels (How They Find Us)

```
OWNED CHANNELS (We Control)
├── @MSUCOBot (Telegram Mini App)
├── 20+ TikTok accounts (content seeding)
├── Twitter/X accounts (crypto native)
├── SoundCloud (audio hosting + discovery)
├── Discord (community)
└── Website (SEO, landing pages)

EARNED CHANNELS (We Earn)
├── Viral tracks shared organically
├── Meme coin communities sharing
├── Influencer mentions
├── Reddit/4chan threads
└── Crypto news coverage

PAID CHANNELS (We Pay)
├── Sponsored posts in crypto groups
├── Influencer partnerships
├── Twitter ads (if needed)
└── Prize pools for competitions
```

### Revenue Streams

| Stream | Trigger | Amount | Notes |
|--------|---------|--------|-------|
| **Track Generation** | User pays | $0.50-2.00 | Tiered by quality |
| **Partnership Deals** | Project signs up | $50-500 | Official anthem packages |
| **Distribution Fee** | We post to networks | $5-25 | Multi-platform posting |
| **Revenue Share** | Track goes viral | 20% of royalties | TikTok, SoundCloud, etc. |
| **Licensing** | Influencer uses sound | $10-100 | Usage rights |
| **API Access** | Developer integrates | $0.10/call | For other apps |
| **Grants** | We apply | $5K-50K | TON, Solana, etc. |

### Cost Structure

| Cost | Type | Amount | Notes |
|------|------|--------|-------|
| **fal.ai (CassetteAI)** | Variable | $0.03/track | 94% margin at $0.50 |
| **ElevenLabs** | Variable | $0.32/track | 84% margin at $2.00 |
| **Vercel** | Fixed | $0 (free tier) | Until 100K invocations |
| **Turso** | Fixed | $0 (free tier) | Until limits hit |
| **n8n** | Fixed | $0 (self-hosted) | Or $20/mo cloud |
| **Prize Pools** | Growth | $50-500/week | Funded by partners |

---

## Growth Loops

### Loop 1: Viral Content Flywheel

```
User creates anthem (free tier = 30s preview)
        ↓
Track watermarked: "Made with White Tiger"
        ↓
User shares to unlock full track
        ↓
Friends hear watermark → visit site
        ↓
New users create anthems
        ↓
REPEAT
```

**Metrics**: Tracks created → Shares → New signups → Conversion rate

### Loop 2: Partnership Pipeline

```
Outreach agent posts in meme coin communities
        ↓
Offers free anthem for their token
        ↓
Project tries it, community loves it
        ↓
Upsell to official partnership ($50-500)
        ↓
Case study → attracts more projects
        ↓
REPEAT
```

**Metrics**: Outreach sent → Responses → Free trials → Conversions → Revenue

### Loop 3: Creator Competition

```
Weekly "Anthem Wars" competition
        ↓
Users create anthems for featured coin
        ↓
We distribute to 20+ TikTok accounts
        ↓
Track performance (views, shares, uses)
        ↓
Winner gets prize + leaderboard crown
        ↓
Competition drives more creation
        ↓
REPEAT
```

**Metrics**: Participants → Tracks created → Total reach → Engagement rate

### Loop 4: Revenue Redistribution

```
Viral track generates revenue
        ↓
Smart contract splits automatically:
├── 60% to creator
├── 20% to platform (us)
├── 10% to prize pool
└── 10% to referrer (if any)
        ↓
Creator reinvests in more tracks
        ↓
REPEAT
```

**Metrics**: Revenue generated → Payouts → Reinvestment rate

---

## Instant Hooks (Value We Offer Immediately)

| Hook | Cost to Us | Value to Them | Commitment Required |
|------|------------|---------------|---------------------|
| **Free 30s anthem preview** | $0.01 | Hear their coin's sound | Email/wallet signup |
| **Free full anthem** | $0.03 | Complete track | Share on Twitter |
| **Free distribution** | Time | 20 TikTok posts | Partnership signup |
| **Rug Score check** | $0 | Safety analysis | Try the Mini App |
| **Brand package preview** | $0.05 | Logo, colors, tagline | Email signup |

---

## Partner Outreach System

### Outreach Skill (skills/PARTNER_OUTREACH.skill.md)

```markdown
# Partner Outreach Agent

## Target: Meme Coin Projects

### Qualification Criteria
- Active Telegram community (500+ members)
- Recent launch (< 30 days)
- No existing anthem/audio content
- English or Russian speaking

### Outreach Template

Hey [PROJECT_NAME] team! 👋

Just found your project and love the energy. We built an AI that creates viral anthems for meme coins.

Here's what we made for $WIF: [EXAMPLE_LINK]

Want a free one for [TICKER]? Takes 60 seconds.

Drop me a DM or try it: https://t.me/MSUCOBot

### Follow-up Sequence
- Day 0: Initial outreach
- Day 2: "Did you see the example?"
- Day 5: "Made a preview for you anyway: [LINK]"
- Day 7: Final follow-up or move on

### Success Metrics
- Response rate: Target 10%+
- Trial rate: Target 30% of responses
- Conversion rate: Target 20% of trials
```

### Automation via n8n

```
Workflow: Partner Pipeline
├── Trigger: New meme coin detected (DexScreener, pump.fun)
├── Filter: Meets qualification criteria
├── Action: Generate sample anthem with their ticker
├── Action: Post in their Telegram/Discord
├── Action: Track response in CRM (Turso)
├── Action: Follow-up sequence
└── Action: Update leaderboard
```

---

## Smart Contract Revenue Distribution

### x402 + TON Jetton Hybrid

```typescript
// Revenue split configuration
const REVENUE_SPLITS = {
  creator: 0.60,      // 60% to track creator
  platform: 0.20,     // 20% to White Tiger
  prizePool: 0.10,    // 10% to weekly prizes
  referrer: 0.10,     // 10% to referrer (or to prize pool if none)
};

// Trigger: Revenue received
// Action: Auto-distribute via smart contract
```

### Payout Triggers

| Event | Payout |
|-------|--------|
| Track used as TikTok sound (1000+ uses) | $5 to creator |
| Track hits 100K views across platforms | $10 to creator |
| Track licensed by influencer | 60% to creator |
| Weekly competition winner | Prize pool share |

---

## Metrics Dashboard

### North Star Metric
**Weekly Active Creators (WAC)**: Users who generated at least 1 track in the last 7 days

### Supporting Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Tracks created/week | 100 | TBD |
| Partners signed/week | 5 | TBD |
| Total reach (views) | 100K/week | TBD |
| Revenue/week | $500 | TBD |
| Creator payouts/week | $100 | TBD |

---

## Phase 1: MVP (This Week)

### Day 1-2: Core Loop
- [ ] Add tier parameter to /api/generate/anthem
- [ ] Add 30-second preview mode (free tier)
- [ ] Add watermark audio to free tracks
- [ ] Add share-to-unlock flow

### Day 3-4: Leaderboard
- [ ] Create tracks table in Turso (with metrics)
- [ ] Create /api/leaderboard endpoint
- [ ] Create leaderboard UI component
- [ ] Add track performance tracking

### Day 5-6: Partner Outreach
- [ ] Create partner outreach skill
- [ ] Set up n8n workflow for outreach
- [ ] Identify 20 target meme coins
- [ ] Send first batch of outreach

### Day 7: Competition Launch
- [ ] Partner with 1 meme coin for pilot
- [ ] Launch "Anthem Wars Week 1"
- [ ] Distribute top tracks to TikTok accounts
- [ ] Track and report results

---

## Long-Term Vision

```
YEAR 1: Prove the Model
├── 1,000 weekly active creators
├── 50 meme coin partnerships
├── $10K/month revenue
└── Self-sustaining growth loops

YEAR 2: Scale Distribution
├── 10,000 weekly active creators
├── Major label/influencer partnerships
├── $100K/month revenue
└── Expand beyond meme coins

YEAR 3: Become the Platform
├── 100,000 weekly active creators
├── White Tiger = "the Spotify for AI music"
├── $1M/month revenue
└── Token launch? DAO governance?
```

---

*"We're not building an app. We're building a flywheel."*
