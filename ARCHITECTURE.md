# Creative Hub - API & Skills Architecture

## API Services Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CREATIVE HUB PLATFORM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   PAYMENTS   │    │   STORAGE    │    │  ANALYTICS   │                   │
│  ├──────────────┤    ├──────────────┤    ├──────────────┤                   │
│  │ Telegram ⭐   │    │ Vercel Blob  │    │ PostHog      │                   │
│  │ TON Connect  │    │ (audio/img)  │    │ (events)     │                   │
│  │ Stripe (TBD) │    │              │    │              │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                            AI GENERATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     TEXT/CREATIVE (LLMs)                             │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │  Anthropic  │  │    xAI      │  │   Google    │  │  OpenAI    │  │    │
│  │  │   Claude    │  │    Grok     │  │   Gemini    │  │   GPT-4    │  │    │
│  │  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├────────────┤  │    │
│  │  │ • Lyrics    │  │ • Brands    │  │ • Slides    │  │ • Backup   │  │    │
│  │  │ • Story     │  │ • Fast gen  │  │ • Images    │  │            │  │    │
│  │  │ • Analysis  │  │ • Memes     │  │ • Video     │  │            │  │    │
│  │  │             │  │             │  │   prompts   │  │            │  │    │
│  │  │ $3/$15/1M   │  │ $0.20/$0.50 │  │ $0.075/1M   │  │ $2.50/$10  │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  │                                                                      │    │
│  │  ACCESS: Vercel AI Gateway (unified SDK)                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     AUDIO GENERATION                                 │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │ ElevenLabs  │  │    Suno     │  │   Udio      │  │  MusicGen  │  │    │
│  │  │   (Voice)   │  │   (Music)   │  │  (Music)    │  │  (Local)   │  │    │
│  │  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├────────────┤  │    │
│  │  │ • TTS       │  │ • Full song │  │ • Full song │  │ • Beats    │  │    │
│  │  │ • Cloning   │  │ • Vocals    │  │ • Stems     │  │ • Instrum. │  │    │
│  │  │ • SFX       │  │ • Styles    │  │             │  │ • Free     │  │    │
│  │  │             │  │             │  │             │  │            │  │    │
│  │  │ $0.30/1K ch │  │ $10/250 cr  │  │ $10/200 cr  │  │ GPU cost   │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     IMAGE/VIDEO GENERATION                           │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │   Runway    │  │    DALL-E   │  │  Midjourney │                  │    │
│  │  │   (Video)   │  │   (Image)   │  │   (Image)   │                  │    │
│  │  ├─────────────┤  ├─────────────┤  ├─────────────┤                  │    │
│  │  │ • Gen-3     │  │ • Logos     │  │ • Album art │                  │    │
│  │  │ • Video     │  │ • Covers    │  │ • Visuals   │                  │    │
│  │  │             │  │             │  │             │                  │    │
│  │  │ $0.05/sec   │  │ $0.04/img   │  │ $0.02/img   │                  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Skills System Architecture

```
skills/
├── domains/
│   ├── production/           # Beat-making styles
│   │   ├── kanye-west.md
│   │   ├── dr-dre.md
│   │   ├── metro-boomin.md
│   │   ├── timbaland.md
│   │   └── pharrell.md
│   │
│   ├── lyricists/           # MC/Writing styles
│   │   ├── eminem.md
│   │   ├── kendrick-lamar.md
│   │   ├── gucci-mane.md
│   │   ├── jay-z.md
│   │   └── j-cole.md
│   │
│   ├── eras/                # Time period sounds
│   │   ├── 90s-boom-bap.md
│   │   ├── 2000s-bling.md
│   │   ├── 2010s-trap.md
│   │   └── 2020s-drill.md
│   │
│   └── moods/               # Emotional targeting
│       ├── hype-motivational.md
│       ├── introspective.md
│       ├── party-club.md
│       └── storytelling.md
│
├── scoring/
│   ├── rubrics/
│   │   ├── lyrics-scoring.md
│   │   ├── beat-scoring.md
│   │   └── mix-scoring.md
│   │
│   └── metrics/
│       ├── win-conditions.md
│       └── fail-patterns.md
│
└── experiments/
    ├── ab-tests/
    └── results/
```

---

## Scoring Framework

### Lyric Quality Score (0-100)

| Dimension | Weight | Metrics |
|-----------|--------|---------|
| **Flow** | 25% | Syllable patterns, breath points, rhythm |
| **Rhyme** | 20% | End rhymes, internal rhymes, multis |
| **Imagery** | 20% | Vivid language, metaphors, wordplay |
| **Authenticity** | 15% | Voice consistency, style match |
| **Hook** | 20% | Memorability, catchiness, repeat value |

### Beat Quality Score (0-100)

| Dimension | Weight | Metrics |
|-----------|--------|---------|
| **Groove** | 25% | Pocket, swing, bounce |
| **Sound Design** | 20% | Drum selection, textures |
| **Arrangement** | 20% | Structure, drops, builds |
| **Mix Clarity** | 20% | Frequency balance, punch |
| **Originality** | 15% | Uniqueness vs derivative |

### Win/Fail Tracking

```typescript
interface GenerationResult {
  id: string;
  timestamp: Date;

  // Input params
  domain: string;           // "kanye-west" | "eminem" etc
  skill_version: string;    // "v1.2.3"
  input_content: string;

  // Output
  output_type: "lyrics" | "beat" | "full_track";
  output_url: string;

  // Scoring
  auto_score: number;       // AI-evaluated 0-100
  human_score?: number;     // User feedback 1-5 stars

  // Classification
  outcome: "win" | "fail" | "mid";
  fail_reasons?: string[];  // ["weak_hook", "off_style", "bad_flow"]

  // Economics
  api_cost: number;
  credits_charged: number;

  // Iteration
  parent_id?: string;       // If this was a retry/variation
  iteration_count: number;
}
```

---

## Customer Segments

### Segment A: Content Creators
- **Need**: Quick viral clips, social content
- **Products**: Voice clips, short hooks, brand packages
- **Price Sensitivity**: Medium ($5-20/mo)
- **Volume**: High frequency, low complexity

### Segment B: Independent Artists
- **Need**: Full songs, professional quality
- **Products**: Thread-to-Hit, beat generation, full production
- **Price Sensitivity**: High ($20-100/mo)
- **Volume**: Medium frequency, high complexity

### Segment C: Labels/Agencies
- **Need**: Bulk generation, white-label
- **Products**: API access, custom models
- **Price Sensitivity**: Low ($500+/mo)
- **Volume**: High frequency, high complexity

---

## Phase 1 Focus: Lyric Generation

Start with Claude + Skills for lyric generation:
1. Most cost-effective (text only)
2. Fastest iteration cycles
3. Clear quality metrics
4. Foundation for all other features

### MVP Skills to Build:
1. **eminem.md** - Technical complexity, storytelling
2. **kanye-west.md** - Innovative, emotional, ego
3. **gucci-mane.md** - Trap, ad-libs, catchphrases
4. **drake.md** - Melodic, emotional, versatile

### Scoring MVP:
- Auto-score with Claude (self-eval)
- User thumbs up/down
- Track by skill version
- Weekly A/B test reports
