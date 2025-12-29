# Creative-Hub Structure Review

> **Generated**: December 28, 2025
> **Status**: Analysis complete, awaiting architecture decision

---

## Current Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/
│   │   │   ├── brand/route.ts        # Brand package generation (Vercel AI Gateway)
│   │   │   ├── slides/route.ts       # Slide deck generation
│   │   │   ├── social-kit/route.ts   # Social media kit generation
│   │   │   ├── thread-to-hit/route.ts # Thread → spoken word (ElevenLabs)
│   │   │   ├── video-prompt/route.ts # Video prompt generation
│   │   │   └── voice/route.ts        # Voice generation
│   │   ├── payments/
│   │   │   └── create-invoice/route.ts
│   │   └── telegram/
│   │       └── webhook/route.ts
│   ├── create/page.tsx
│   ├── dashboard/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── three/
│   │   └── cosmic-scene.tsx
│   ├── payments/
│   │   └── telegram-payment.tsx
│   ├── sections/
│   │   ├── features-section.tsx
│   │   ├── hero-section.tsx
│   │   ├── pricing-section.tsx
│   │   └── showcase-section.tsx
│   ├── video/
│   │   └── video-hero.tsx
│   ├── loading-screen.tsx
│   └── providers.tsx
└── lib/
    ├── ai.ts        # Claude: extractStory, generateLyrics, generateSlideContent, generateVideoPrompt
    ├── beats.ts     # Replicate/MusicGen: generateBeat
    ├── music.ts     # Suno: generateSong, threadToHit (UNUSED)
    ├── n8n.ts       # Social distribution webhooks
    ├── store.ts     # Zustand + PRICING_PLANS
    ├── telegram.ts  # Telegram utilities
    └── voice.ts     # ElevenLabs: generateSpeech, threadToHitAudio, cloneVoice
```

---

## Problems Identified

### Problem 1: Three "Thread-to-Hit" Implementations

| Location | Function | What It Does | Used? |
|----------|----------|--------------|-------|
| `lib/music.ts:124` | `threadToHit()` | Claude → Lyrics → Suno full song | NO |
| `lib/voice.ts:295` | `threadToHitAudio()` | Claude → Lyrics → ElevenLabs spoken word | YES |
| `api/generate/thread-to-hit/route.ts` | API endpoint | Uses voice.ts version | YES |

**Issue**: Unclear which IS the product. Song? Spoken word? Both?

---

### Problem 2: Naming Doesn't Match Mental Model

| File | Name Suggests | Actually Does |
|------|---------------|---------------|
| `music.ts` | All music | Only Suno (full songs with AI vocals) |
| `beats.ts` | Drum patterns? | MusicGen instrumentals via Replicate |
| `voice.ts` | Voice stuff | ElevenLabs TTS + full Thread-to-Hit pipeline |
| `ai.ts` | AI stuff | Claude for lyrics, slides, AND video prompts |

---

### Problem 3: `ai.ts` is a Catch-All

Contains unrelated concerns:
- `extractStory()` - Thread-to-Hit
- `generateLyrics()` - Thread-to-Hit
- `generateSlideContent()` - Quantum Slides
- `generateVideoPrompt()` - Multiverse Video

---

### Problem 4: Business Logic in API Routes

`/api/generate/brand/route.ts` contains:
- `BRAND_TIERS` config (should be in lib)
- Full prompt template (should be configurable)
- All generation logic (should be in lib)

Routes should be thin wrappers, not business logic.

---

### Problem 5: No Shared Types

Types scattered across files:
- `SunoGenerateResponse` in music.ts
- `BeatOptions` in beats.ts
- `VoiceId`, `VoicePreset` in voice.ts
- `User`, `AppState` in store.ts

No central types directory.

---

### Problem 6: Config Mixed with Code

Hardcoded throughout:
- `VOICES` in voice.ts
- `STYLE_PROMPTS` in beats.ts
- `BRAND_TIERS` in route.ts
- `PRICING_PLANS` in store.ts
- API URLs inline in each file

---

## Architecture Decision Point

### Option A: Traditional Next.js Restructure

Keep Next.js, organize with services/pipelines:

```
src/lib/
├── config/
│   ├── api.ts
│   ├── voices.ts
│   ├── styles.ts
│   └── pricing.ts
├── types/
│   └── *.ts
├── services/          # Raw API wrappers
│   ├── claude.ts
│   ├── elevenlabs.ts
│   ├── suno.ts
│   └── replicate.ts
└── pipelines/         # Business logic
    ├── thread-to-hit.ts
    ├── brand-forge.ts
    └── voice-studio.ts
```

**Pros**: Clean, testable, standard
**Cons**: Boring, doesn't match Astro Islands vision

---

### Option B: Astro Islands Architecture

Rebuild as Astro with partial hydration:

```
Static Shell (Astro - fast, SEO, instant)
    │
    ├── Island: Hero3D (client:only - Three.js)
    ├── Island: CreateWizard (client:load - React forms)
    ├── Island: PaymentFlow (client:visible - React)
    ├── Island: AudioPlayer (client:idle - React)
    └── API: Separate backend or Astro endpoints
```

**Pros**:
- Matches memescan-astro pattern
- Faster initial load
- Smaller bundle
- Modern architecture

**Cons**:
- Rewrite required
- Lose Next.js server actions
- More complex setup

---

### Option C: Next.js with Islands Mental Model

Keep Next.js but think in "islands":

```
Landing (mostly static, RSC)
    │
    ├── "use client" Island: CosmicScene (Three.js)
    ├── "use client" Island: CreateWizard
    ├── "use client" Island: PaymentModal
    └── Server Components for everything else
```

**Pros**:
- Best of both worlds
- No rewrite
- React Server Components = pseudo-islands

**Cons**:
- Not as pure as Astro
- Still full React runtime

---

## The Thread-to-Hit Question

Before restructuring, need to define what Thread-to-Hit IS:

**Option A: Spoken Word (Current)**
```
Thread → Claude Story → Claude Lyrics → ElevenLabs Speech → MP3
```

**Option B: Full Song**
```
Thread → Claude Story → Claude Lyrics → Suno Song → MP3
```

**Option C: Complete Package**
```
Thread → Claude Story → Claude Lyrics → [
  ElevenLabs Speech (spoken word)
  + MusicGen Beat (instrumental)
  + Suno Song (optional, with AI vocals)
] → Multiple outputs
```

---

## Products / Features

| Product | Status | Primary Service |
|---------|--------|-----------------|
| Thread-to-Hit | Working (voice only) | ElevenLabs + Claude |
| Brand Forge | Working | Vercel AI Gateway (Grok) |
| Voice Studio | Partial | ElevenLabs |
| Quantum Slides | Stub only | Claude |
| Multiverse Video | Stub only | Claude (prompt only) |
| Social Kit | Working | Claude |

---

## External Services

| Service | Used For | Env Var |
|---------|----------|---------|
| Anthropic Claude | Story, lyrics, slides, video prompts | `ANTHROPIC_API_KEY` |
| Vercel AI Gateway | Brand generation (Grok) | `AI_GATEWAY_API_KEY` |
| ElevenLabs | TTS, voice cloning | `ELEVENLABS_API_KEY` |
| Suno | Full song generation | `SUNO_API_KEY` |
| Replicate | MusicGen beats | `REPLICATE_API_TOKEN` |
| n8n | Social distribution | `NEXT_PUBLIC_N8N_*` |
| Telegram | Payments, mini app | `TELEGRAM_BOT_TOKEN` |

---

## Related Projects

This is part of the **ALCHEMY** brand in the JPanda ecosystem.

See also:
- `/home/jesse/dev/projects/personal/music/ThreadToHitRemix/` - Python CLI version
- `/home/jesse/dev/projects/personal/music/ARCHITECTURE.md` - Skills system design
- `/home/jesse/dev/projects/personal/ECOSYSTEM-MAP.md` - Full ecosystem map

---

## Next Steps

1. **Decide**: Astro Islands vs Next.js (Option A/B/C above)
2. **Define**: What IS Thread-to-Hit (the product)
3. **Prioritize**: Which feature is the hero
4. **Execute**: Restructure based on decisions

---

*Awaiting direction before any code changes.*
