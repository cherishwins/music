# Human To-Dos

**Last Updated:** January 1, 2026

> This is the master checklist for human-in-the-loop tasks. Claude keeps this updated.
> Check items off as you complete them. Claude will add new tasks as needed.

---

## 🚨 MAJOR DISCOVERY: HUB-AND-SPOKE ARCHITECTURE

**Full plan:** `docs/HUB_SPOKE_ARCHITECTURE.md`

You have a MASSIVE backend already running on Render - **notaryton-bot** (4,662 lines):
- PostgreSQL database (15+ tables: users, tokens, wallets, KOLs, lottery)
- 40+ REST API endpoints (already live!)
- Token crawler (discovers new tokens automatically)
- Whale detection (holder snapshots, movement alerts)
- KOL tracking (influencer calls, verified wallets)
- TON ID authentication

### ⚡ CRITICAL FINDING (January 1, 2026)

**I tested both APIs. creative-hub's scoring is BETTER than notaryton's!**

| Test | notaryton | creative-hub | Winner |
|------|-----------|--------------|--------|
| Known Scammer | Score 70 (yellow) ❌ | Score 0, Grade F ✅ | **creative-hub** |
| CEX Detection | "Could not analyze" ❌ | Score 812, Grade A ✅ | **creative-hub** |
| Entity Labels | None | 2,958 addresses | **creative-hub** |

**Scammer Test (EQBe-OxgGw8mHgBpbafhc652p7eLgp8dqEwFU8mKh5vsL3a8):**
- notaryton: `score: 70, badge: yellow` ← WRONG! This is a known drainer!
- creative-hub: `score: 0, grade: F, "🚨 CONFIRMED SCAMMER"` ← CORRECT!

### NEW PLAN: Merge FORWARD not backward

Don't proxy creative-hub to notaryton. Instead:
1. **Migrate ton-labels TO notaryton** (copy the JSON, run import script)
2. **Port creative-hub's scoring logic TO notaryton** (Python version)
3. **THEN proxy creative-hub to notaryton** (once it's upgraded)

### Quick Integration Steps - ✅ ALL COMPLETE!
- [x] Copy `data/ton-labels-compiled.json` to notaryton-bot ✅
- [x] Create Python import script ✅
- [x] Port creative-hub's entity scoring logic to Python ✅
- [x] Update notaryton's `/api/v1/rugscore` endpoint ✅
- [x] Run migration (2,958 addresses imported) ✅
- [x] **VERIFIED:** notaryton now detects scammers (score 0) and CEX (score 85) ✅

### Test Results After Fix:
```bash
# Scammer - NOW CORRECT!
curl https://notaryton.com/api/v1/rugscore/EQBe-OxgGw8mHgBpbafhc652p7eLgp8dqEwFU8mKh5vsL3a8
# → score: 0, badge: red, verdict: SCAMMER ✅

# CEX - NOW CORRECT!
curl https://notaryton.com/api/v1/rugscore/EQB4XClemsAbLvlDjobh-VjUn7oEy9CITWPoG9WkTO2qRx_m
# → score: 85, badge: green, verdict: VERIFIED ✅
```

---

## 💰 RUNWAY & COST DASHBOARD (Check Weekly)

**API Endpoint:** `https://creative-hub-virid.vercel.app/api/admin/costs?period=month`

| Metric | Value | Status |
|--------|-------|--------|
| **Monthly Burn** | $22 (ElevenLabs Creator) | ✅ |
| **Available Funds** | $100 (configurable) | ⚠️ |
| **Runway** | ~4.5 months | ⚠️ WARNING |
| **Break-Even** | ~88 tracks/month | Target |

### Cost Per Service
| Service | Rate | Included Free |
|---------|------|---------------|
| ElevenLabs Music | $0.08/min | 62 min/mo |
| ElevenLabs Voice | $0.00002/char | 100K chars |
| Claude Haiku | $0.25/$1.25 per 1M tokens | Pay-as-you-go |
| Replicate Flux | $0.003/image | Pay-as-you-go |
| Turso | Free tier | 1B reads, 25M writes |
| Qdrant | Free tier | 1M vectors |
| Vercel | Free tier | 100K invocations |

**Per Track Cost:** ~$0.23 (music + AI + storage)

> 📊 **Weekly Check:** Hit the API endpoint or run `curl https://creative-hub-virid.vercel.app/api/admin/costs`

---

## 🐋 RUG SCORE PROJECT (The Equifax of Meme Coins)

**Goal:** Build proprietary credit scoring for TON meme coins - whale watch, liquidity pools, rug history

### ✅ LIVE API
**Endpoint:** `https://creative-hub-virid.vercel.app/api/minter-score/{TON_ADDRESS}`

```bash
# Test it:
curl https://creative-hub-virid.vercel.app/api/minter-score/UQBZenh5TFhBoxH4VPv1HDS16XcZ9_2XVZcUSMhmnzxTJUxf
```

**Returns:** Score (0-1000), Grade (A+ to F), Risk Level, Warnings, Recommendation

### Research Collected (See `docs/RUG_SCORE_RESEARCH.md`)
- [x] TON influencer list (multi-language) - 25+ handles organized by region
- [x] Scoring factors identified: whale behavior, liquidity locks, team history
- [x] Case study framework for known rugs
- [x] TonAPI integration working (TONAPI_KEY in Vercel)
- [x] DYOR.io integration (free tier, no key needed)

### Data Sources Integrated
- [x] TonAPI - Wallet history, transactions, jetton balances
- [x] DYOR.io - Token trust scores, holder analysis
- [ ] Whale wallet tracking (enhanced)
- [ ] Historical rug pull database
- [ ] Social sentiment (X/Telegram)

### Next Steps
- [x] Build React component for score display (MinterScoreCard.tsx created)
- [ ] Add to Telegram Mini App UI
- [ ] Wire into MemeSeal/brand generation flow

### Monetization Path
1. Free basic score → Paid deep analysis
2. Insurance product (long-term)
3. API access for other apps

---

## 🎵 AI MUSIC SERVICES (Sign Up & Get API Keys)

**Goal:** Multi-provider strategy - cheap volume + uncensored generation + quality control

### Tier 1: Cloud APIs (Quick Wins)

#### fal.ai - CassetteAI ($0.03/song) ✅ DONE
- [x] **Sign up:** https://fal.ai
- [x] **Get API key** - Added to .env as `FAL_KEY`
- [x] **Add $10 credits** (~333 songs for testing)
- [x] **Integrated CassetteAI** - Text-only generation, no reference audio needed!
> Status: LIVE at `/api/generate/anthem` - 90% cheaper than ElevenLabs

#### Replicate - Multi-Model Access
- [ ] **Sign up:** https://replicate.com
- [ ] **Get API token** - Already have `REPLICATE_API_TOKEN` in .env, verify it works
- [ ] **Test MiniMax Music:** https://replicate.com/minimax/music-01
> Why: Access to MiniMax + MusicGen + ACE-Step all in one place

### Tier 2: Uncensored Local Pipeline (The Nuclear Option)

#### RunPod - GPU Rental (For Training/Heavy Inference)
- [ ] **Sign up:** https://runpod.io
- [ ] **Add $20 credits** - First test run
- [ ] **Bookmark:** RTX 3090 ($0.30/hr) for inference, A100 ($1.50/hr) for training
> Why: Run Dolphin LLM + RVC + MusicGen locally = ZERO CENSORSHIP

#### Hugging Face - Model Downloads
- [ ] **Get access token:** https://huggingface.co/settings/tokens
- [ ] **Add to .env as `HF_TOKEN`**
- [ ] **Accept licenses for:**
  - [ ] ACE-Step: https://huggingface.co/ACE-Step/ACE-Step-v1-3.5B
  - [ ] MusicGen: https://huggingface.co/facebook/musicgen-medium
> Why: Download weights for local/RunPod deployment

### Tier 3: Voice Cloning (Meme Voices)

#### RVC WebUI - Voice Models
- [ ] **Bookmark community models:** https://voice-models.com
- [ ] **Download 5 meme voices** (Trump, Kanye, anime chars, etc.)
> Why: Convert any TTS to any voice. No content filtering.

### Service Priority Order
1. **fal.ai** - Immediate wins, cheap testing
2. **Replicate** - Already have token, just test models
3. **Hugging Face** - Get tokens for model access
4. **RunPod** - When ready for uncensored pipeline

---

## 🚀 GROWTH ENGINE (Anthem Wars + Partner Pipeline)

**Full Strategy:** `docs/GROWTH_ENGINE.md`
**Partner Outreach Skill:** `skills/PARTNER_OUTREACH.skill.md`

### Phase 1: This Week

#### Build the Loop (Claude Done ✅)
- [x] Add tier parameter to /api/generate/anthem
- [x] Add 30-second preview mode (free tier) ✅
- [x] Add watermark audio to free tracks ✅
- [x] Create leaderboard API endpoint ✅ `/api/leaderboard`
- [x] Create partners CRM table in Turso ✅ (schema ready)
- [x] Create ecosystem strategy ✅ `docs/ECOSYSTEM_STRATEGY.md`
- [x] Add White Tiger CTAs to blockburnnn ✅ (pushed to GitHub)
- [ ] Add share-to-unlock flow

#### 🔴 HUMAN ACTION NEEDED: Push Schema to Turso
Run this command to create the new tables (partners, outreach_logs, competition_weeks):
```bash
cd /home/jesse/dev/projects/personal/music/creative-hub
pnpm exec drizzle-kit push
```

#### Partner Outreach (Human Does)
- [ ] **Identify 20 target meme coins** - Use DexScreener new pairs
- [ ] **Join their Telegram groups**
- [ ] **Send first 10 outreach messages** - Use templates in PARTNER_OUTREACH.skill.md
- [ ] **Track responses** in spreadsheet or Turso

#### Pilot Competition
- [ ] **Sign 1 meme coin partner** for Anthem Wars Week 1
- [ ] **Set up prize** ($50-100 from their treasury or ours)
- [ ] **Announce in their community**
- [ ] **Track submissions and performance**

### Growth Loop Economics

| Action | Cost to Us | Value Created |
|--------|------------|---------------|
| Free 30s preview | $0.01 | Email capture |
| Share-to-unlock | $0.03 | Free marketing |
| Partner outreach | Time | Pipeline of deals |
| Competition | $50 prize | Community engagement |

---

## URGENT (Do Today)

### 🐯 RUG SCORE MARKETING (Revenue Target: $100 in 2 weeks)

**Scammer detection is LIVE!** 112 known scammers in database. Ready to market.

**Marketing copy in:** `docs/MARKETING_COPY.md`

#### Day 1-2: Telegram Group Blitz
- [ ] **Post in TON Memes / TON Degens** - Use launch post from MARKETING_COPY.md
- [ ] **Post in DeDust community** - Same template
- [ ] **Post in STON.fi community** - Same template
- [ ] **Post in 2 Russian TON groups** - Translate or use English

#### Day 3-5: Helpful Engagement
- [ ] **Reply to "is this safe?" questions** with actual rug checks (be helpful, not spammy)
- [ ] **Share interesting findings** - "Just caught a scammer wallet..."
- [ ] **Post "Rug of the Day" warning** in 1-2 groups

#### Day 6-7: Twitter Thread
- [ ] **Post thread** - "How I check every meme coin" (copy in MARKETING_COPY.md)
- [ ] **Quote-tweet** a new coin launch with its rug score

**Test Scammer Detection:**
```bash
# Known scammer (score = 0, grade F, CRITICAL)
curl https://creative-hub-virid.vercel.app/api/minter-score/EQBe-OxgGw8mHgBpbafhc652p7eLgp8dqEwFU8mKh5vsL3a8

# Clean wallet
curl https://creative-hub-virid.vercel.app/api/minter-score/UQBZenh5TFhBoxH4VPv1HDS16XcZ9_2XVZcUSMhmnzxTJUxf
```

---

### 🔮 Shodan Infrastructure Intelligence (SAVED FOR LATER)
**Status:** Plan saved in `docs/FUTURE_SHODAN_PLAN.md`
**When to execute:** After 100+ Rug Score users OR $200+ runway

**What's Built (Ready to Activate):**
- `src/lib/shodan.ts` - TypeScript Shodan client
- `scripts/shodan-crypto-intel.py` - Python scanner
- `src/app/api/infra-score/route.ts` - API endpoint

**To Activate (When Ready):**
1. Buy Shodan: https://account.shodan.io/billing ($49 one-time)
2. Add `SHODAN_API_KEY` to .env and Vercel
3. Test: `python scripts/shodan-crypto-intel.py --exchanges`

### 🔐 API Keys - ROTATED Dec 30 (Update Render!)
- [x] **Rotate TonAPI keys** - ✅ All 3 rotated in TonConsole
- [x] **Update Vercel** - ✅ Claude updated TONAPI_KEY in creative-hub
- [x] **Update Render** - ✅ Updated Dec 30, redeploying

### STON.fi Grant - ✅ COMPLETE
- [x] **Made repos public** - ✅ notaryton-bot, music, memeseal-casino
- [x] **Legendary README** - ✅ Updated music repo
- [x] **Send email to Ethan** - ✅ Sent Dec 30, awaiting response

### API Keys & Accounts
- [x] **Rotate xAI API key** - ✅ Rotated Dec 30, new key "whitetiger" active
- [ ] **Create npm account** - https://www.npmjs.com/signup (if you don't have one)
- [ ] **Create npm org "whitetiger"** - https://www.npmjs.com/org/create (for @whitetiger/mcp-music)

### Publish MCP Server
- [ ] **Login to npm** - Run `npm login` in terminal
- [ ] **Publish package** - Run `cd mcp-server && npm publish --access public`
- [ ] **Create GitHub repo** - https://github.com/new → "white-tiger-mcp"
- [ ] **Push MCP code to GitHub** - See `mcp-server/PUBLISH.md` for commands

---

## THIS WEEK (Priority Order)

### Directory Submissions (Copy-paste content in `docs/SUBMISSION_CONTENT.md`)

#### Telegram Directories
- [ ] **FindMini.app** - https://findmini.app/submit
  - App: @MSUCOBot
  - Category: Entertainment/Music
  - Use UTM: `https://t.me/MSUCOBot?start=src_findmini`

- [ ] **tApps Center** - https://tapps.center
  - Highlight TON integration
  - Category: Web3/Music

- [ ] **Telegram @AppsModeration** - Message the bot for official listing

#### MCP Directories (After npm publish)
- [ ] **MCP.so** - https://mcp.so (17K+ servers listed)
- [ ] **MCP Market** - https://mcpmarket.com
- [ ] **MCPServers.org** - https://mcpservers.org
- [ ] **Clinde.ai** - https://clinde.ai
- [ ] **GitHub PR** - https://github.com/modelcontextprotocol/servers

#### Other Directories
- [ ] **BetaList** - https://betalist.com

### Screenshots & Media
- [ ] **Take app screenshots** (4-5 for directory listings)
  - Main generation interface
  - Generated track with viral score
  - Payment options (Stars/TON)
  - Mobile view in Telegram

- [ ] **Record 30-sec demo video**
  - Show: describe → generate → play flow

---

## NEXT WEEK

### Social & Community
- [ ] **Create TikTok account** for White Tiger
- [ ] **Post 3 teaser videos** on TikTok
- [ ] **Set up Telegram channel** for updates
- [ ] **Post on r/MusicProduction** (use template in SUBMISSION_CONTENT.md)
- [ ] **Post on r/cryptocurrency** (use template in SUBMISSION_CONTENT.md)

### Influencer Outreach
- [ ] **Identify 10 mid-tier crypto influencers** (10K-100K followers)
- [ ] **DM 5 for potential partnerships**

---

## WEEK 4 (Product Hunt)

### Prep (50+ hours recommended)
- [ ] **Build email list** - 200-400 engaged supporters
- [ ] **Create Product Hunt account** - Get established before launch
- [ ] **Prepare launch assets**:
  - [ ] Hero image (1270x760)
  - [ ] Gallery images (5-8)
  - [ ] Animated GIF demo
  - [ ] Video demo (optional)
- [ ] **Write launch copy** (in SUBMISSION_CONTENT.md)
- [ ] **Schedule launch** - Tuesday/Wednesday 12:01 AM PT

### Launch Day
- [ ] Post at 12:01 AM PT
- [ ] Post first comment immediately
- [ ] Notify supporters
- [ ] Engage with all comments

---

## ONGOING

### Credentials to Set Up (When Needed)
- [ ] **Coinbase Project ID** - For Coinbase Onramp
- [ ] **Stripe Secret Key** - For card payments

### Monitoring
- [ ] Check Turso dashboard for new signups
- [ ] Monitor funnel events in database
- [ ] Track directory referral sources

---

## COMPLETED

### December 31, 2025 (Evening Session)
- [x] **ECOSYSTEM STRATEGY** - Hub-and-spoke architecture for 13 projects
- [x] **TIERED PRICING** - Free/Good/Better/Best tiers with watermarking
- [x] **LEADERBOARD API** - `/api/leaderboard?type=creators|anthems|trending|competition`
- [x] **PARTNERS CRM SCHEMA** - partners, outreach_logs, competition_weeks tables
- [x] **BLOCKBURNNN INTEGRATION** - White Tiger CTAs added, pushed to GitHub
- [x] **ECOSYSTEM FOOTER** - Cross-project links in blockburnnn footer
- [x] **GROWTH ENGINE DOC** - `docs/GROWTH_ENGINE.md` with business model
- [x] **PARTNER OUTREACH SKILL** - `skills/PARTNER_OUTREACH.skill.md` with templates

### December 31, 2025
- [x] **FULL TON-LABELS INTEGRATION** - 2,958 labeled addresses (was only 112 scammers)
- [x] **Category-based scoring** - CEX=A, DEX=B, validator=A+, scammer=F
- [x] **Entity info display** - Shows CEX/DEX/validator badges with websites
- [x] **Fixed Quick Check buttons** - Now uses real labeled addresses (CEX, DEX, scammer demo)
- [x] **Deployed to production** - All scoring improvements live

### December 30, 2025
- [x] Added xAI API key to .env
- [x] Database migration for funnel tracking
- [x] Built MCP server package
- [x] Generated watermark audio files
- [x] Created all submission content
- [x] **Minter Credit Score API LIVE** - `/api/minter-score/{address}`
- [x] TonAPI key added to Vercel (TONAPI_KEY)
- [x] DYOR.io integration (free tier)
- [x] Fixed TonAPI bugs (limit, endpoint, edge runtime)
- [x] **MemeSeal Proof-of-Prediction System** - Full API deployed at `/api/seal`
- [x] MinterScoreCard React component with animated visualization
- [x] **Command Center Dashboard** - Live at `/command` with real-time monitoring
- [x] Quick-check token buttons on Rug Score page
- [x] Navigation updated with Command Center link
- [x] **SCAMMER DETECTION LIVE** - 112 known scammers from ton-labels database
- [x] **Monetization Plan** - `docs/RUG_SCORE_MONETIZATION.md` ($100 in 2 weeks)
- [x] **Marketing Copy** - `docs/MARKETING_COPY.md` (ready-to-post templates)
- [x] **Shodan Plan Saved** - `docs/FUTURE_SHODAN_PLAN.md` (for later)

---

## HOW THIS WORKS

1. **Claude adds tasks** to this file when human action is needed
2. **You check them off** as you complete them
3. **Claude reads this file** at session start to know what's done
4. **Completed items** move to the COMPLETED section with date

**Pattern:** You're the chimpanzee (hands-on tasks), Claude is the machine (code & automation).

---

*"You do the human stuff, I do the machine stuff. LFG."* 🦧🤖
