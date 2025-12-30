# White Tiger Skills Index
## AI Music Production + Payment Empire + Viral Intelligence

**Last Updated**: 2025-12-30
**Brand**: White Tiger (Cyberpunk Purple)

---

## DIRECTORY

```
skills/
├── INDEX.md                          # This file
│
├── CORE APIS
│   ├── ELEVENLABS_MUSIC.skill.md     # ElevenLabs Music API (FREE composition plans!)
│   └── MCP_SERVER_CONFIG.md          # Claude Desktop integration
│
├── JUCHEGANG SYSTEM
│   ├── JUCHEGANG_PIPELINE.skill.md   # Artist skill → track pipeline
│   └── JUCHEGANG_PROTOCOL.md         # Hell Joseon, NK symbols, Spaceship remix
│
├── BEAT PRODUCTION
│   ├── BEAT_PRODUCTION_ARSENAL.skill.md  # API stack + character profiles
│   └── PHONK_PRODUCTION.skill.md         # Memphis → Moscow → Seoul
│
├── PAYMENT EMPIRE
│   └── PAYMENT_EMPIRE.skill.md       # x402, MCP Server, Facilitator, TON, Stars
│
├── BRANDING & DESIGN
│   └── BRAND_KIT_MASTER.skill.md     # Complete brand kit creation workflow
│
├── research/
│   ├── VIRAL_HYPOTHESIS.md           # Loop-First Lyric Design (CURRENT)
│   ├── HIT_ANALYSIS_FRAMEWORK.md     # Genre/region research prompts
│   ├── NA_HIPHOP_PATTERNS_2024.md    # North American patterns
│   ├── LYRIC_INTELLIGENCE.md         # Lyric vectorization research
│   └── LYRICS_INTELLIGENCE_ENGINE.md # Full engine architecture
│
├── templates/
│   └── KOREA_BRIDGE_TRAP.json        # Ready-to-use composition plan
│
└── ../scripts/lyric-pipeline/        # Python lyric intelligence tools
    ├── embed_lyrics.py               # Vectorize lyrics
    ├── cluster_lyrics.py             # Find patterns
    ├── theme_classifier.py           # 12 proven hit themes
    ├── analyze_performance.py        # Correlate with success
    ├── generation_optimizer.py       # Build prompts from patterns
    └── upload_to_qdrant.py           # Store in vector DB
```

---

## QUICK REFERENCE

### When You Need...

| Goal | Use This Skill |
|------|----------------|
| ElevenLabs Music API | `ELEVENLABS_MUSIC.skill.md` |
| Generate track from artist | `JUCHEGANG_PIPELINE.skill.md` |
| Phonk/K-Phonk production | `PHONK_PRODUCTION.skill.md` |
| Beat generation code | `BEAT_PRODUCTION_ARSENAL.skill.md` |
| Payment integration | `PAYMENT_EMPIRE.skill.md` |
| Research hit patterns | `research/HIT_ANALYSIS_FRAMEWORK.md` |
| **Lyric pattern discovery** | `scripts/lyric-pipeline/` |
| **12 proven hit themes** | `research/LYRICS_INTELLIGENCE_ENGINE.md` |

---

## THE ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CREATIVE HUB EMPIRE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    VIRAL INTELLIGENCE (Moat)                      │   │
│  │                                                                   │   │
│  │  Qdrant (Vector DB)          Turso (Relational)                  │   │
│  │  ├── hiphop_viral (4,832)    ├── users                           │   │
│  │  ├── viral_score tracking    ├── tracks                          │   │
│  │  └── hook/repetition data    ├── transactions                    │   │
│  │                              └── cost_events                     │   │
│  │                                                                   │   │
│  │  HIP HOP ONLY - No country, no classical, no ABBA                │   │
│  │  Viral Score → 0-100 rating per track                            │   │
│  │  Research → 3x repetition, 150x hooks in viral tracks            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    LYRIC INTELLIGENCE (Moat)                     │   │
│  │                                                                   │   │
│  │  "Loop-First Lyric Design" - Optimized for TikTok virality       │   │
│  │                                                                   │   │
│  │  scripts/lyric-pipeline/                                         │   │
│  │  ├── embed_hiphop_viral.py → Hip hop + viral features (384-dim)  │   │
│  │  ├── upload_hiphop_qdrant.py → Store in hiphop_viral collection  │   │
│  │  ├── cluster_lyrics.py    → K-means thematic clusters            │   │
│  │  ├── theme_classifier.py  → 12 proven Billboard themes           │   │
│  │  ├── generation_optimizer.py → Build prompts from patterns       │   │
│  │  └── hiphop_embeddings/   → 4,832 vectors + metadata             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    PAYMENT EMPIRE (Revenue)                       │   │
│  │                                                                   │   │
│  │  Infrastructure (We Earn Fees)                                   │   │
│  │  ├── x402 Facilitator → Settle other apps' payments             │   │
│  │  ├── MCP Server → AI agents pay us                               │   │
│  │  └── AgentKit → Our agents transact                              │   │
│  │                                                                   │   │
│  │  Direct Payments (Users Pay Us)                                  │   │
│  │  ├── Telegram Stars → 1B+ users                                  │   │
│  │  ├── TON Connect → 87M wallets                                   │   │
│  │  ├── x402 Endpoints → Web + AI agents                            │   │
│  │  └── Coinbase Onramp → Fiat bridge                               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    GENERATION ENGINE (Product)                    │   │
│  │                                                                   │   │
│  │  ElevenLabs Music API                                            │   │
│  │  ├── /v1/music/plan (FREE) → Iterate composition                 │   │
│  │  ├── /v1/music (PAID) → Generate track                           │   │
│  │  └── /v1/music/separate-stems → Stems for mixing                 │   │
│  │                                                                   │   │
│  │  Hit DNA Enrichment                                              │   │
│  │  └── Prompt → Find similar hits → Extract patterns → Inject      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## KEY INSIGHTS

### Cost Optimization
- **ElevenLabs**: `POST /v1/music/plan` is FREE - iterate until perfect
- **Generation cost**: ~$0.23/track
- **Storage**: Vercel Blob at $0.15/GB

### Revenue Streams
| Source | Method | Take Rate |
|--------|--------|-----------|
| Stars | Telegram checkout | 70% (TG takes 30%) |
| TON | Direct to wallet | 100% |
| x402 | Micropayments | 100% |
| Facilitator | Settlement fees | 0.1-0.5% |
| MCP Server | Per-tool-call | 100% |

### The Moat
1. **Viral Intelligence** - 4,832 hip hop tracks with viral scoring
2. **Loop-First Design** - Lyrics optimized for TikTok virality
3. **Research-Backed** - Data shows 3x repetition, 150x hooks in viral tracks
4. **First MCP Music Server** - No competition
5. **Own Facilitator** - Not dependent on anyone
6. **Multi-Rail Payments** - Meet users anywhere

### Viral Pattern Research (December 2025)

**The Data (Our 4,832 Hip Hop Tracks)**:
| Metric | High Viral (50+) | Low Viral (<20) | Multiplier |
|--------|------------------|-----------------|------------|
| Repetition Ratio | 49.5% | 15.9% | **3.1x** |
| Hook Score | 8.0 | 0.05 | **150x** |
| Short Line Ratio | Higher | Lower | Key factor |
| First Line Punch | 1.0 | 0.3 | **3x** |

**TikTok/Phonk Science**:
- 84% of Billboard Global 200 went viral on TikTok first
- Phonk: 31 BILLION TikTok views
- "Built for looping, built for visual editing, built for short-form content"
- Contiguous repetition (stacking repeats) creates strongest earworms

---

## FILES REFERENCE

### Source Code
| File | Purpose |
|------|---------|
| `src/lib/db/schema.ts` | Database schema (Turso) |
| `src/lib/db/index.ts` | Database client + helpers |
| `src/lib/vectors/index.ts` | Qdrant vector operations |
| `src/lib/voice.ts` | ElevenLabs API |
| `src/lib/x402.ts` | x402 payment middleware |
| `src/lib/ton.ts` | TON Connect integration |
| `src/lib/coinbase.ts` | Coinbase Onramp |
| `src/lib/images.ts` | Album art generation |

### Related Projects
| Directory | Purpose |
|-----------|---------|
| `../mcp-server/` | MCP server for AI agents |
| `../facilitator/` | x402 facilitator service |

### Documentation
| File | Purpose |
|------|---------|
| `docs/MONETIZATION_ARCHITECTURE.md` | Business model |
| `docs/UNIT_ECONOMICS.md` | Cost/revenue tracking |
| `docs/HIT_DNA_ARCHITECTURE.md` | Intelligence system |
| `docs/DATABASE_OPTIONS.md` | DB decision rationale |
| `docs/SETUP_GUIDE.md` | Getting started |

---

## WHAT'S NEXT

### Completed (Dec 28-30, 2025)
- [x] Database schema designed (Turso)
- [x] Vector DB integration (Qdrant)
- [x] **@MSUCOBot created and configured**
- [x] **5 payment rails integrated (Stars, TON, x402, Onramp, Stripe)**
- [x] **x402 payment protection on all /api/generate/* endpoints**
- [x] **Health check endpoint** (`/api/health`)
- [x] **Daily keep-alive cron** (`/api/cron/keep-alive` - prevents Qdrant auto-delete)

### Completed (Dec 30, 2025) - HIP HOP PIVOT
- [x] **DELETED old garbage data** (ABBA, Alabama, Air Supply)
- [x] **Built hip hop viral pipeline** (`embed_hiphop_viral.py`)
- [x] **Uploaded 4,832 hip hop tracks** to `hiphop_viral` collection
- [x] **Analyzed viral patterns** (3x repetition, 150x hooks)
- [x] **Researched TikTok/phonk virality** (84% of Billboard went viral on TikTok first)
- [x] **Defined "Loop-First Lyric Design" hypothesis**

### This Week
- [ ] **Wire viral hypothesis into generation prompts**
- [ ] Add pre-generation viral score validation
- [ ] Scale to 10K+ hip hop lyrics
- [ ] Deploy MCP server (`/mcp-server/`)
- [ ] Deploy x402 facilitator (`/facilitator/`)

### This Month
- [ ] A/B test generated lyrics against viral score thresholds
- [ ] Launch feedback loop (performance → pattern refinement)
- [ ] Cross-cultural pattern analysis (US vs KR vs BR)
- [ ] First paying MCP users

---

## CREDENTIALS QUICK REFERENCE

All in `creative-hub/.env`:

| Service | Env Var | Status |
|---------|---------|--------|
| Telegram | `TELEGRAM_BOT_TOKEN` | @MSUCOBot |
| TON Wallet | `NEXT_PUBLIC_TON_WALLET_ADDRESS` | UQBZenh5... |
| Base/USDC | `X402_PAYMENT_ADDRESS` | 0x14E607... |
| Turso | `TURSO_DATABASE_URL` | msuco-lyrics-db |
| Qdrant | `QDRANT_URL` | 1000 vectors |
| ElevenLabs | `ELEVENLABS_API_KEY` | Active |
| Anthropic | `ANTHROPIC_API_KEY` | Active |
| Replicate | `REPLICATE_API_TOKEN` | Active |

---

*"Skills in, hits out, payments flowing."*
