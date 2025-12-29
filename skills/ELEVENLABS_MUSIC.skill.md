# SKILL: ElevenLabs Music Production
## Complete Guide to AI Music Generation with ElevenLabs

*"From prompt to production-ready track in minutes"*

---

## OVERVIEW

ElevenLabs offers a powerful Music API (`/v1/music`) that generates **studio-grade music** from natural language prompts. Key capabilities:

- **Full songs with vocals** in English, Spanish, German, Japanese, Korean, and more
- **Instrumental tracks** across any genre
- **Section-based control** via composition plans
- **Stem separation** (vocals, drums, bass, other)
- **Inpainting** (edit specific sections)
- **Up to 5 minutes** per generation
- **Commercial rights** included on paid plans

---

## API ENDPOINTS

### 1. Simple Compose (Quick Generation)
```
POST https://api.elevenlabs.io/v1/music
```

**Parameters:**
```json
{
  "prompt": "string (up to 4100 chars)",
  "music_length_ms": 10000,  // 3,000 - 300,000 ms
  "force_instrumental": false,
  "model_id": "music_v1",
  "output_format": "mp3_44100_128"
}
```

### 2. Create Composition Plan (Detailed Control)
```
POST https://api.elevenlabs.io/v1/music/plan
```

**Response Structure:**
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
    },
    {
      "section_name": "Verse 1",
      "positive_local_styles": ["hard 808", "trap hi-hats"],
      "negative_local_styles": ["melodic singing"],
      "duration_ms": 45000,
      "lines": [
        "First line of lyrics here",
        "Second line of lyrics",
        "Third line continues the story",
        "Fourth line closes the verse"
      ]
    },
    {
      "section_name": "Hook",
      "positive_local_styles": ["catchy melody", "full production"],
      "negative_local_styles": ["sparse arrangement"],
      "duration_ms": 30000,
      "lines": [
        "This is the hook that people remember",
        "Repeat it so they can sing along"
      ]
    }
  ]
}
```

### 3. Compose with Plan
```
POST https://api.elevenlabs.io/v1/music
```

```json
{
  "composition_plan": { /* the plan object */ },
  "respect_sections_durations": true
}
```

### 4. Stem Separation
```
POST https://api.elevenlabs.io/v1/music/separate-stems
```

Separates into: vocals, drums, bass, other
Cost: 0.5× for 2 stems, 1× for 4 stems

---

## OFFICIAL MCP SERVER

ElevenLabs has an **official MCP server** that exposes all music tools to Claude, Cursor, etc.

### Installation
```bash
# Using uvx (recommended)
uvx elevenlabs-mcp

# Or pip
pip install elevenlabs-mcp
```

### Claude Desktop Configuration
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "ElevenLabs": {
      "command": "uvx",
      "args": ["elevenlabs-mcp"],
      "env": {
        "ELEVENLABS_API_KEY": "your-api-key-here",
        "ELEVENLABS_MCP_OUTPUT_MODE": "files",
        "ELEVENLABS_MCP_BASE_PATH": "~/Music/output"
      }
    }
  }
}
```

### Output Modes
- **`files`**: Save to disk, return file paths
- **`resources`**: Return base64 in MCP response
- **`both`**: Save AND return base64

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `compose_music` | Generate music from prompt |
| `create_composition_plan` | Create detailed plan from prompt |
| `compose_music_with_plan` | Generate using composition plan |
| `separate_stems` | Split into vocals/drums/bass/other |
| `text_to_speech` | Generate speech (for vocals/voiceovers) |
| `voice_design` | Create custom voices |
| `transcribe_audio` | Speech to text |

---

## PROMPT ENGINEERING FOR MUSIC

### Prompt Structure Formula
```
[GENRE] + [MOOD] + [INSTRUMENTS] + [TEMPO] + [STRUCTURE] + [VOCALS] + [USE CASE]
```

### Example Prompts by Style

**Trap/Hip-Hop:**
```
"Hard-hitting trap beat with aggressive 808 bass, rolling hi-hats, dark piano 
melody, 140 BPM half-time feel. Deep male rap vocals with ad-libs. Verse-hook-verse 
structure with an intense drop after each chorus."
```

**K-Pop/Korean:**
```
"Energetic K-pop track with catchy synth hooks, punchy electronic drums, 
uplifting chord progressions, 125 BPM. Korean female vocals with English 
chorus. Intro-verse-prechorus-chorus-verse-bridge-final chorus structure."
```

**Emotional/Storytelling:**
```
"Melancholic hip-hop ballad with soft piano, atmospheric pads, minimal 
trap drums, 85 BPM. Emotional male vocals with occasional falsetto. 
Slow build from sparse verse to powerful chorus."
```

**Anthem/Hype:**
```
"Epic stadium anthem with orchestral elements, massive drums, triumphant 
brass hits, 130 BPM. Powerful male and female vocal trade-offs. Build to 
explosive drop with crowd chant hook."
```

### Style Descriptors That Work

**For Beats:**
- "808 bass heavy", "punchy kick", "trap hi-hat rolls"
- "boom bap drums", "live drum kit feel"
- "minimal percussion", "sparse arrangement"

**For Melody:**
- "dark minor key", "uplifting major key"
- "catchy synth hook", "atmospheric pads"
- "guitar-driven", "piano-led"

**For Vocals:**
- "deep male rap", "high-pitched female"
- "aggressive delivery", "smooth melodic"
- "ad-libs throughout", "harmonized chorus"
- "Korean lyrics", "English hook"

**For Structure:**
- "verse-hook-verse", "intro-build-drop"
- "gradual intensity increase", "dynamic shifts"
- "breakdown section", "false ending"

---

## COMPOSITION PLAN TEMPLATES

### Template 1: Standard Hip-Hop Track (3:30)
```json
{
  "positive_global_styles": [
    "hip-hop", "trap", "808 bass", "hard-hitting", "modern production"
  ],
  "negative_global_styles": [
    "acoustic", "soft rock", "jazz", "country", "classical"
  ],
  "sections": [
    {
      "section_name": "Intro",
      "positive_local_styles": ["atmospheric", "building tension", "filtered bass"],
      "negative_local_styles": ["full drums", "vocals"],
      "duration_ms": 15000,
      "lines": ["[Instrumental intro - producer tag]"]
    },
    {
      "section_name": "Verse 1",
      "positive_local_styles": ["hard 808", "trap hi-hats", "aggressive delivery"],
      "negative_local_styles": ["singing", "soft"],
      "duration_ms": 45000,
      "lines": [
        "First verse line establishing the theme",
        "Second line developing the story",
        "Third line with internal rhymes",
        "Fourth line building momentum",
        "Fifth line increasing intensity",
        "Sixth line leading to hook"
      ]
    },
    {
      "section_name": "Hook 1",
      "positive_local_styles": ["catchy melody", "full production", "memorable"],
      "negative_local_styles": ["sparse", "spoken word"],
      "duration_ms": 30000,
      "lines": [
        "This is the hook everybody gonna remember",
        "Say it twice so they sing along forever"
      ]
    },
    {
      "section_name": "Verse 2",
      "positive_local_styles": ["harder 808", "faster hi-hats", "more aggressive"],
      "negative_local_styles": ["repetitive", "same as verse 1"],
      "duration_ms": 45000,
      "lines": [
        "Second verse comes in harder than the first",
        "Elevating the energy with each bar",
        "Technical skill on display now",
        "Building to the climax",
        "Almost at the peak",
        "Let it drop"
      ]
    },
    {
      "section_name": "Hook 2",
      "positive_local_styles": ["even bigger", "ad-libs", "harmonies added"],
      "negative_local_styles": ["quieter than hook 1"],
      "duration_ms": 30000,
      "lines": [
        "This is the hook everybody gonna remember",
        "Say it twice so they sing along forever"
      ]
    },
    {
      "section_name": "Bridge",
      "positive_local_styles": ["breakdown", "stripped back", "emotional"],
      "negative_local_styles": ["full production"],
      "duration_ms": 20000,
      "lines": [
        "Slow it down for the real talk",
        "Before the final explosion"
      ]
    },
    {
      "section_name": "Final Hook",
      "positive_local_styles": ["maximum energy", "all elements", "triumphant"],
      "negative_local_styles": ["fading", "sparse"],
      "duration_ms": 25000,
      "lines": [
        "This is the hook everybody gonna remember",
        "Yeah, yeah, we out here forever"
      ]
    }
  ]
}
```

### Template 2: Korean Hip-Hop (JucheGang Style)
```json
{
  "positive_global_styles": [
    "korean hip-hop", "trap", "k-hip-hop", "modern seoul sound",
    "melodic hooks", "aggressive verses"
  ],
  "negative_global_styles": [
    "western country", "classical", "jazz fusion", "acoustic"
  ],
  "sections": [
    {
      "section_name": "인트로 (Intro)",
      "positive_local_styles": ["atmospheric", "traditional korean instrument hint", "building"],
      "negative_local_styles": ["full drums"],
      "duration_ms": 12000,
      "lines": ["[Korean traditional instrument sample fading into trap beat]"]
    },
    {
      "section_name": "벌스 1 (Verse 1)",
      "positive_local_styles": ["aggressive korean rap", "trap hi-hats", "808 sub bass"],
      "negative_local_styles": ["english lyrics", "singing"],
      "duration_ms": 40000,
      "lines": [
        "Korean verse lyrics line one",
        "Korean verse lyrics line two",
        "Korean verse lyrics line three",
        "Building to the hook"
      ]
    },
    {
      "section_name": "훅 (Hook)",
      "positive_local_styles": ["catchy korean melody", "bilingual option", "anthemic"],
      "negative_local_styles": ["spoken word", "sparse"],
      "duration_ms": 25000,
      "lines": [
        "Catchy Korean hook line that everyone remembers",
        "Maybe English phrase mixed in for global appeal"
      ]
    }
  ]
}
```

---

## INTEGRATION WITH JUCHEGANG

### Mapping Artist Skills to Composition Plans

**Fresh Prince of Pyongyang:**
```json
{
  "positive_global_styles": [
    "polished trap", "satirical", "smooth delivery",
    "moranbong band sample flipped", "lonely piano undertone"
  ],
  "negative_global_styles": ["aggressive", "raw", "underground"],
  "sections": [
    {
      "section_name": "West Pyongyang Intro",
      "positive_local_styles": ["fresh prince theme parody", "playful"],
      "duration_ms": 15000,
      "lines": ["In West Pyongyang born and raised..."]
    }
  ]
}
```

**Jangmadang Jenny:**
```json
{
  "positive_global_styles": [
    "hard trap", "aggressive female rap", "market sounds as percussion",
    "fast delivery", "empowering"
  ],
  "negative_global_styles": ["soft", "melodic", "slow"],
  "sections": [
    {
      "section_name": "Night Market Verse",
      "positive_local_styles": ["rapid fire", "cash register samples"],
      "lines": ["When the state store closes, I open..."]
    }
  ]
}
```

**Seoul Survivor:**
```json
{
  "positive_global_styles": [
    "emotional boom bap", "building intensity", "hell joseon anthem",
    "piano loops", "urban seoul sounds"
  ],
  "negative_global_styles": ["happy", "carefree", "party"],
  "sections": [
    {
      "section_name": "Goshiwon Verse",
      "positive_local_styles": ["desperate determination", "subway sounds"],
      "lines": ["3 pyeong and a dream, walls so thin..."]
    }
  ]
}
```

---

## PYTHON SDK USAGE

### Basic Generation
```python
from elevenlabs import ElevenLabs
from elevenlabs.play import play

client = ElevenLabs(api_key="your-api-key")

# Simple prompt
track = client.music.compose(
    prompt="Hard-hitting trap beat with 808s and aggressive male vocals",
    music_length_ms=180000,  # 3 minutes
)
play(track)

# Save to file
with open("output.mp3", "wb") as f:
    f.write(track)
```

### With Composition Plan
```python
# Create plan from prompt
plan = client.music.composition_plan.create(
    prompt="Korean hip-hop track with trap production and bilingual hook",
    music_length_ms=210000,
)

# Modify the plan
plan["sections"][1]["lines"] = [
    "Custom lyrics for verse 1",
    "More custom lyrics here"
]

# Generate with plan
track = client.music.compose(
    composition_plan=plan,
    respect_sections_durations=True
)
```

### Detailed Response (Get Timestamps)
```python
result = client.music.compose_detailed(
    prompt="Your detailed prompt here",
    music_length_ms=180000,
)

# Access composition plan used
print(result.json["composition_plan"])

# Access lyric timestamps
print(result.json["song_metadata"])

# Access audio
with open("track.mp3", "wb") as f:
    f.write(result.audio)
```

### Stem Separation
```python
# After generating a track
stems = client.music.separate_stems(
    audio=track,
    stems=4  # vocals, drums, bass, other
)

# Each stem is accessible
vocals = stems["vocals"]
drums = stems["drums"]
bass = stems["bass"]
other = stems["other"]
```

---

## TYPESCRIPT/NODE SDK USAGE

```typescript
import { ElevenLabsClient } from "elevenlabs";
import * as fs from "fs";

const client = new ElevenLabsClient({ apiKey: "your-api-key" });

// Generate music
const track = await client.music.compose({
  prompt: "Hard trap beat with 808s",
  musicLengthMs: 180000,
});

// Save to file
fs.writeFileSync("track.mp3", Buffer.from(track));

// With composition plan
const plan = await client.music.compositionPlan.create({
  prompt: "Epic anthem track",
  musicLengthMs: 210000,
});

const trackWithPlan = await client.music.compose({
  compositionPlan: plan,
});
```

---

## COST AND LIMITS

### Pricing (as of late 2024)
- Music generation: Credits-based
- 1 minute of music ≈ significant credit usage
- Stem separation: 0.5× - 1× generation cost

### Rate Limits by Tier
- Free: Limited generations per month
- Creator: Higher limits
- Pro: Highest limits
- Enterprise: Custom

### Best Practices for Cost
1. Use `music_length_ms` precisely - don't over-generate
2. Create composition plans first (free) before generating
3. Use stem separation only when needed
4. Cache and reuse plans for similar tracks

---

## QUALITY OPTIMIZATION

### For Best Results:
1. **Be specific**: "140 BPM trap" beats "fast beat"
2. **Name instruments**: "808 bass, trap hi-hats, dark piano"
3. **Describe vocals**: "deep male rap, occasional ad-libs"
4. **Specify structure**: "verse-hook-verse-hook-bridge-outro"
5. **Include mood**: "aggressive but melodic, confident"

### Common Issues and Fixes:

| Issue | Fix |
|-------|-----|
| Vocals unclear | Add "clear vocal pronunciation" to styles |
| Beat too busy | Add "spacious arrangement" |
| Lyrics off-beat | Use composition plan with specific lines |
| Wrong genre | Be more explicit, add negative styles |
| Too short/long | Set exact `music_length_ms` |

---

## ERROR HANDLING

### Copyright Errors
```python
try:
    track = client.music.compose(prompt="Song like Eminem's Lose Yourself")
except Exception as e:
    if e.body['detail']['status'] == 'bad_prompt':
        # Use the suggested alternative
        suggestion = e.body['detail']['data']['prompt_suggestion']
        track = client.music.compose(prompt=suggestion)
```

### Harmful Content
No suggestion returned - prompt rejected outright.

---

## NEXT STEPS

1. **Set up MCP server** for Claude Desktop integration
2. **Create artist-specific composition plan templates**
3. **Build prompt library** for each JucheGang character
4. **Test generation** with skill file parameters
5. **Iterate** based on output quality

---

*"The prompt is the song. Make it detailed, make it specific, make it hit."*
