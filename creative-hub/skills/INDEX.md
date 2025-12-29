# Creative Hub Skills Index
## AI Music Production + Payment Empire + Music Intelligence

**Last Updated**: 2025-12-28

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
├── research/
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
│  │                    MUSIC INTELLIGENCE (Moat)                      │   │
│  │                                                                   │   │
│  │  Qdrant (Vector DB)          Turso (Relational)                  │   │
│  │  ├── hit_songs embeddings    ├── users                           │   │
│  │  ├── user_tracks             ├── tracks                          │   │
│  │  └── learned_patterns        ├── transactions                    │   │
│  │                              └── cost_events                     │   │
│  │                                                                   │   │
│  │  CLAP → Audio semantic search ("find songs that feel like...")   │   │
│  │  Lyrics → 12 hit themes (73.4% prediction accuracy)              │   │
│  │  Learning Loop → What works? Reinforce it.                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    LYRIC INTELLIGENCE (Moat)                     │   │
│  │                                                                   │   │
│  │  Vectorization → Clustering → Pattern Discovery → Generation     │   │
│  │                                                                   │   │
│  │  scripts/lyric-pipeline/                                         │   │
│  │  ├── embed_lyrics.py      → Sentence Transformers (384-dim)      │   │
│  │  ├── cluster_lyrics.py    → K-means thematic clusters            │   │
│  │  ├── theme_classifier.py  → 12 proven Billboard themes           │   │
│  │  ├── analyze_performance.py → Correlate with hit metrics         │   │
│  │  ├── generation_optimizer.py → Build prompts from patterns       │   │
│  │  └── upload_to_qdrant.py  → Store in lyric_patterns collection   │   │
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
1. **Music Intelligence** - System learns what works
2. **Lyric Intelligence** - 12 hit themes, regional patterns, feedback loop
3. **First MCP Music Server** - No competition
4. **Own Facilitator** - Not dependent on anyone
5. **Multi-Rail Payments** - Meet users anywhere

### The 12 Proven Hit Themes (73.4% Billboard Accuracy)
| Primary | Secondary |
|---------|-----------|
| Loss (1980s) | Nostalgia |
| Desire (all) | Rebellion |
| Aspiration (downturns) | **Cynicism (50% of 2020s!)** |
| Breakup (ALWAYS WORKS) | Desperation |
| Pain (2000s+) | Escapism |
| Inspiration | Confusion |

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

### Completed
- [x] Database schema designed (Turso)
- [x] Vector DB integration (Qdrant)
- [x] Lyric embedding pipeline built
- [x] 12 hit theme classifier implemented
- [x] Generation optimizer with regional patterns
- [x] Prompt library generator

### Immediate (Today)
- [ ] Get Turso + Qdrant credentials
- [ ] Run database migrations
- [ ] Test lyric pipeline: `python scripts/lyric-pipeline/embed_lyrics.py --hf-dataset vishnupriyavr/spotify-million-song-dataset --max-samples 1000`

### This Week
- [ ] Run full pipeline on 10K+ songs
- [ ] Seed lyric patterns to Qdrant
- [ ] Build CLAP audio embedding pipeline
- [ ] Deploy facilitator

### This Month
- [ ] Launch feedback loop (performance → pattern refinement)
- [ ] 50K+ lyrics in vector DB
- [ ] Cross-cultural pattern analysis (US vs KR vs BR)
- [ ] First paying MCP users

---

*"Skills in, hits out, payments flowing."*
