# SKILL: ElevenLabs Music Production
## Complete Guide to AI Music Generation with ElevenLabs

*"From prompt to production-ready track in minutes"*

---

## OVERVIEW

ElevenLabs Music API (`/v1/music`) generates **studio-grade music** from natural language prompts. Key capabilities:

- **Full songs with vocals** in English, Spanish, German, Japanese, Korean, and more
- **Instrumental tracks** across any genre
- **Section-based control** via composition plans
- **Stem separation** (vocals, drums, bass, other)
- **Up to 5 minutes** per generation
- **Commercial rights** included on paid plans

---

## CRITICAL: COST OPTIMIZATION

### FREE Operations (No Credits)
| Endpoint | Description |
|----------|-------------|
| `POST /v1/music/plan` | Create composition plan - **FREE** |

### Paid Operations (Credits Required)
| Endpoint | Description |
|----------|-------------|
| `POST /v1/music` | Generate audio from prompt/plan |
| `POST /v1/music/detailed` | Generate with metadata + timestamps |
| `POST /v1/music/stream` | Stream audio generation |
| `POST /v1/music/separate-stems` | Split into vocals/drums/bass/other |

**Strategy**: Always create and refine composition plans (FREE) before generating (PAID).

---

## API ENDPOINTS

### 1. Create Composition Plan (FREE)
```
POST https://api.elevenlabs.io/v1/music/plan
```

**Request Body:**
```json
{
  "prompt": "string (up to 4100 chars)",
  "music_length_ms": 180000,
  "model_id": "music_v1"
}
```

**Response:**
```json
{
  "positive_global_styles": ["trap", "aggressive", "808 heavy"],
  "negative_global_styles": ["acoustic", "soft", "minimal"],
  "sections": [
    {
      "section_name": "Intro",
      "positive_local_styles": ["building tension", "filtered synth"],
      "negative_local_styles": ["full drums"],
      "duration_ms": 15000,
      "lines": ["[Intro - building anticipation]"]
    }
  ]
}
```

### 2. Compose Music (CREDITS)
```
POST https://api.elevenlabs.io/v1/music
```

**With Prompt:**
```json
{
  "prompt": "Hard-hitting trap beat with 808s",
  "music_length_ms": 180000,
  "force_instrumental": false,
  "model_id": "music_v1",
  "output_format": "mp3_44100_128"
}
```

**With Composition Plan:**
```json
{
  "composition_plan": { /* plan object */ },
  "respect_sections_durations": true,
  "output_format": "mp3_44100_192"
}
```

### 3. Compose Detailed (CREDITS + Metadata)
```
POST https://api.elevenlabs.io/v1/music/detailed
```

Returns multipart response with:
- `composition_plan` - The plan used
- `song_metadata` - Title, genres, languages, etc.
- `audio` - Binary audio data

**With Timestamps:**
```json
{
  "prompt": "...",
  "music_length_ms": 180000,
  "with_timestamps": true
}
```

### 4. Stem Separation (CREDITS)
```
POST https://api.elevenlabs.io/v1/music/separate-stems
```

Multipart form data with audio file. Returns:
- `vocals`
- `drums`
- `bass`
- `other`

---

## COMPOSITION PLAN STRUCTURE

### Full Schema
```typescript
interface CompositionPlan {
  positive_global_styles: string[];  // Styles for entire song
  negative_global_styles: string[];  // Styles to AVOID
  sections: Section[];
}

interface Section {
  section_name: string;              // "Verse 1", "Hook", etc.
  positive_local_styles: string[];   // Styles for this section
  negative_local_styles: string[];   // Styles to avoid in section
  duration_ms: number;               // Duration in milliseconds
  lines: string[];                   // Lyrics for this section
  source_from?: SectionSource;       // Optional: source from existing song
}

interface SectionSource {
  song_id: string;
  range: { start_ms: number; end_ms: number };
  negative_ranges?: { start_ms: number; end_ms: number }[];
}
```

### Duration Guidelines
| Section Type | Typical Duration |
|--------------|------------------|
| Intro | 8,000 - 15,000 ms |
| Verse | 30,000 - 45,000 ms |
| Pre-Hook | 15,000 - 20,000 ms |
| Hook/Chorus | 20,000 - 30,000 ms |
| Bridge | 15,000 - 25,000 ms |
| Outro | 10,000 - 20,000 ms |

---

## TYPESCRIPT SDK

### Installation
```bash
npm install @elevenlabs/elevenlabs-js
```

### Basic Usage
```typescript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as fs from "fs";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

// 1. Create composition plan (FREE)
const plan = await client.music.compositionPlan.create({
  prompt: "Epic trap anthem with Korean lyrics and triumphant hook",
  musicLengthMs: 210000,
});

console.log("Plan created:", JSON.stringify(plan, null, 2));

// 2. Modify plan with custom lyrics
plan.sections[1].lines = [
  "Custom verse lyrics here",
  "More custom lyrics"
];

// 3. Generate music (CREDITS)
const audio = await client.music.compose({
  compositionPlan: plan,
});

// 4. Save to file
const buffer = Buffer.from(await audio.arrayBuffer());
fs.writeFileSync("track.mp3", buffer);
```

### Detailed Response with Timestamps
```typescript
const result = await client.music.composeDetailed({
  prompt: "Emotional Korean hip-hop with piano",
  musicLengthMs: 180000,
  withTimestamps: true,
});

// Access metadata
console.log("Composition Plan:", result.json.composition_plan);
console.log("Song Metadata:", result.json.song_metadata);

// Save audio
fs.writeFileSync("track.mp3", Buffer.from(result.audio));
```

### Stream Audio
```typescript
const stream = await client.music.stream({
  prompt: "Chill lo-fi beats",
  musicLengthMs: 120000,
});

// Process chunks
for await (const chunk of stream) {
  // Handle audio chunk
}
```

---

## PYTHON SDK

### Installation
```bash
pip install elevenlabs
```

### Basic Usage
```python
from elevenlabs import ElevenLabs
import os

client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

# 1. Create composition plan (FREE)
plan = client.music.composition_plan.create(
    prompt="Hard trap beat with aggressive 808s and dark melody",
    music_length_ms=180000,
)

print("Plan:", plan)

# 2. Generate with plan (CREDITS)
audio = client.music.compose(
    composition_plan=plan,
)

# 3. Save
with open("track.mp3", "wb") as f:
    f.write(audio)
```

### Detailed Response
```python
result = client.music.compose_detailed(
    prompt="Epic Korean hip-hop anthem",
    music_length_ms=210000,
    with_timestamps=True,
)

# Access composition plan used
print(result.json["composition_plan"])

# Access song metadata
print(result.json["song_metadata"])

# Save audio
with open("track.mp3", "wb") as f:
    f.write(result.audio)
```

---

## PROMPT ENGINEERING

### Prompt Structure Formula
```
[GENRE] + [MOOD] + [INSTRUMENTS] + [TEMPO] + [STRUCTURE] + [VOCALS] + [USE CASE]
```

### Effective Style Descriptors

**For Beats:**
- "808 bass heavy", "punchy kick", "trap hi-hat rolls"
- "boom bap drums", "live drum kit feel"
- "minimal percussion", "sparse arrangement"

**For Melody:**
- "dark minor key", "uplifting major key"
- "catchy synth hook", "atmospheric pads"
- "piano-driven", "guitar-led"

**For Vocals:**
- "deep male rap", "high-pitched female"
- "aggressive delivery", "smooth melodic"
- "ad-libs throughout", "harmonized chorus"
- "Korean lyrics", "English hook"

**For Structure:**
- "verse-hook-verse", "intro-build-drop"
- "gradual intensity increase", "dynamic shifts"
- "breakdown section", "false ending"

### Example Prompts

**Korean Hip-Hop:**
```
Emotional boom bap hip-hop, 92 BPM, minor key.
Piano-driven melody, crisp drums, atmospheric pads.
Urban Seoul sounds subtly layered.
Male Korean rapper, strained but determined delivery.
Building intensity - starts restrained, ends explosive.
Korean lyrics with occasional English phrases.
Theme: Hell Joseon struggle, underdog rising.
```

**Trap Anthem:**
```
Hard-hitting trap, 140 BPM, aggressive energy.
Clean 808s, rolling hi-hats, dark piano undertone.
Male rap vocals with ad-libs, anthemic hook.
Verse-hook-verse-hook-bridge-final hook structure.
Theme: Overcoming struggle, triumphant rise.
```

---

## COMPOSITION PLAN TEMPLATES

### Standard Hip-Hop (3:30)
```json
{
  "positive_global_styles": [
    "hip-hop", "trap", "808 bass", "modern production"
  ],
  "negative_global_styles": [
    "acoustic", "jazz", "country", "classical"
  ],
  "sections": [
    {
      "section_name": "Intro",
      "positive_local_styles": ["atmospheric", "building tension"],
      "negative_local_styles": ["full drums", "vocals"],
      "duration_ms": 15000,
      "lines": ["[Instrumental intro]"]
    },
    {
      "section_name": "Verse 1",
      "positive_local_styles": ["hard 808", "trap hi-hats", "aggressive"],
      "negative_local_styles": ["singing", "soft"],
      "duration_ms": 45000,
      "lines": [
        "First verse line one",
        "First verse line two",
        "Building momentum",
        "Leading to hook"
      ]
    },
    {
      "section_name": "Hook",
      "positive_local_styles": ["catchy melody", "full production", "memorable"],
      "negative_local_styles": ["sparse", "spoken word"],
      "duration_ms": 30000,
      "lines": [
        "This is the hook",
        "Everyone remembers"
      ]
    },
    {
      "section_name": "Verse 2",
      "positive_local_styles": ["harder 808", "faster hi-hats", "more aggressive"],
      "negative_local_styles": ["repetitive", "same energy as verse 1"],
      "duration_ms": 45000,
      "lines": [
        "Second verse comes harder",
        "Elevating energy",
        "Technical skill",
        "Building to peak"
      ]
    },
    {
      "section_name": "Hook 2",
      "positive_local_styles": ["even bigger", "ad-libs", "harmonies"],
      "negative_local_styles": ["quieter than hook 1"],
      "duration_ms": 30000,
      "lines": [
        "This is the hook",
        "Everyone remembers"
      ]
    },
    {
      "section_name": "Bridge",
      "positive_local_styles": ["breakdown", "stripped back", "emotional"],
      "negative_local_styles": ["full production"],
      "duration_ms": 20000,
      "lines": [
        "Slow down for real talk",
        "Before final explosion"
      ]
    },
    {
      "section_name": "Final Hook",
      "positive_local_styles": ["maximum energy", "triumphant", "all elements"],
      "negative_local_styles": ["fading", "sparse"],
      "duration_ms": 25000,
      "lines": [
        "This is the hook",
        "EVERYONE REMEMBERS"
      ]
    }
  ]
}
```

---

## ERROR HANDLING

### Copyright Errors
```typescript
try {
  const audio = await client.music.compose({ prompt: "..." });
} catch (error) {
  if (error.body?.detail?.status === 'bad_prompt') {
    // Use suggested alternative
    const suggestion = error.body.detail.data.prompt_suggestion;
    const audio = await client.music.compose({ prompt: suggestion });
  }
}
```

### Rate Limiting
- Composition plan creation: Rate limited per tier
- Music generation: Credit-based

---

## OUTPUT FORMATS

| Format | Description |
|--------|-------------|
| `mp3_44100_64` | MP3, 44.1kHz, 64kbps |
| `mp3_44100_128` | MP3, 44.1kHz, 128kbps (default) |
| `mp3_44100_192` | MP3, 44.1kHz, 192kbps (high quality) |
| `pcm_44100` | Raw PCM, 44.1kHz |

---

## WORKFLOW CHECKLIST

### Before Generation
- [ ] Create composition plan (FREE)
- [ ] Review and refine plan structure
- [ ] Customize sections and lyrics
- [ ] Validate total duration

### After Generation
- [ ] Track length matches target
- [ ] Vocal clarity is acceptable
- [ ] Beat matches style requirements
- [ ] Lyrics are audible and on-beat
- [ ] Emotional arc is present
- [ ] No copyright-flagged elements

---

*"The prompt is the song. Make it detailed, make it specific, make it hit."*
