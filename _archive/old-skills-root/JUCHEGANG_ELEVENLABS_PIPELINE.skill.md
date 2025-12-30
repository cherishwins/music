# SKILL: JucheGang Production Pipeline
## From Character Skill → ElevenLabs Music → Hit Track

*"Skills in, hits out"*

---

## THE PIPELINE

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Artist Skill   │ →  │ Composition Plan │ →  │ ElevenLabs API  │
│  (.skill.md)    │    │ Generator        │    │ /v1/music       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
   Voice Profile         Section Structure        Final Track
   Beat Requirements     Lyrics                   + Stems
   Themes               Styles                    + Timestamps
   Flow Patterns        Duration
```

---

## STEP 1: LOAD ARTIST SKILL

Each JucheGang artist has a skill file containing:
- `voice_profile`: Vocal characteristics
- `flow`: Syllable density, rhythmic patterns
- `beat_requirements`: BPM, style, key
- `themes`: Content categories
- `ad_libs`: Signature sounds

### Example: Loading Seoul Survivor
```python
# From SEOUL_SURVIVOR.skill.md
artist_config = {
    "name": "seoul_survivor",
    "voice": {
        "type": "strained_determined",
        "register": "chest_with_reaches",
        "delivery": "building_intensity"
    },
    "beat": {
        "bpm": 92,
        "style": "emotional_boom_bap",
        "key": "minor",
        "elements": ["piano_loops", "subway_sounds", "urban_seoul"]
    },
    "themes": ["struggle", "determination", "hell_joseon", "hope"],
    "flow": {
        "density": "medium_high",
        "pocket": "on_beat",
        "variation": "build_to_explosion"
    }
}
```

---

## STEP 2: GENERATE COMPOSITION PLAN

Transform skill parameters into ElevenLabs composition plan format.

### Seoul Survivor → "Goshiwon Dreams"
```python
from elevenlabs import ElevenLabs

client = ElevenLabs(api_key="your-key")

# Generate base plan from detailed prompt
plan = client.music.composition_plan.create(
    prompt="""
    Emotional boom bap hip-hop track, 92 BPM, minor key.
    
    Sound: Piano-driven melody, crisp drums, atmospheric pads.
    Urban Seoul sounds subtly layered (subway announcements, city ambience).
    Building intensity throughout - starts restrained, ends explosive.
    
    Vocals: Male Korean rapper, strained but determined delivery.
    Starts tired and measured, builds to powerful release.
    Korean lyrics with occasional English phrases.
    
    Structure: Intro (sparse) → Verse 1 (restrained) → Hook (building) → 
    Verse 2 (more intense) → Hook (fuller) → Bridge (breakdown) → 
    Final Hook (explosive release)
    
    Theme: Hell Joseon struggle, 취준생 (job seeker) life, 
    living in goshiwon (tiny room), working 4 part-time jobs,
    never giving up despite system designed to break you.
    """,
    music_length_ms=210000  # 3:30
)
```

### Customize the Plan with Lyrics
```python
# Override generated lyrics with custom content
plan["sections"] = [
    {
        "section_name": "Intro",
        "positive_local_styles": [
            "sparse piano", "distant city sounds", 
            "building anticipation", "subway door chime"
        ],
        "negative_local_styles": ["full drums", "aggressive"],
        "duration_ms": 12000,
        "lines": ["[Subway announcement: 이번 역은...]"]
    },
    {
        "section_name": "Verse 1",
        "positive_local_styles": [
            "restrained drums", "piano melody",
            "measured delivery", "tired but determined"
        ],
        "negative_local_styles": ["explosive", "shouting"],
        "duration_ms": 45000,
        "lines": [
            "3 평 고시원 꿈을 꾸고 있어",  # "Dreaming in a 3 pyeong goshiwon"
            "벽이 너무 얇아 옆방 꿈까지 들려",  # "Walls so thin I hear the next room's dreams"
            "300번 지원서 300번 거절",  # "300 applications, 300 rejections"
            "금수저 면접 따고 흙수저 줄 서",  # "Gold spoons get interviews, dirt spoons wait in line"
            "근데 나 안 포기해 계속 가",  # "But I won't give up, keep going"
            "헬조선 탈출구 내가 찾을 거야"  # "I'll find the exit from Hell Joseon"
        ]
    },
    {
        "section_name": "Hook",
        "positive_local_styles": [
            "fuller production", "emotional melody",
            "anthemic feel", "singable"
        ],
        "negative_local_styles": ["sparse", "spoken word"],
        "duration_ms": 25000,
        "lines": [
            "3 pyeong and a dream",
            "Walls can't hold what I mean",
            "Gold spoons sleep while we scheme",
            "Watch me rise, watch me rise"
        ]
    },
    {
        "section_name": "Verse 2",
        "positive_local_styles": [
            "building intensity", "harder drums",
            "more aggressive delivery", "faster flow moments"
        ],
        "negative_local_styles": ["same as verse 1", "monotonous"],
        "duration_ms": 45000,
        "lines": [
            "편의점 야간 배달 아침 PC방 오후",  # "Convenience store night, delivery morning, PC bang afternoon"
            "과외 주말 시간 없어 90분씩 잠",  # "Tutoring weekends, no time, 90 min sleep intervals"
            "그래도 랩 녹음해 목소리 메모",  # "Still recording raps, voice memos between shifts"
            "언젠간 터질 거야 믿어 난",  # "Someday it'll pop off, I believe"
            "삼포 세대? 난 포기 안 해",  # "Sampo generation? I don't give up"
            "오포 칠포 완포 다 개소리야"  # "Opo, chilpo, wanpo - all bullshit"
        ]
    },
    {
        "section_name": "Hook 2",
        "positive_local_styles": [
            "even fuller", "harmonies added",
            "more powerful", "crowd-ready"
        ],
        "negative_local_styles": ["quieter than hook 1"],
        "duration_ms": 25000,
        "lines": [
            "3 pyeong and a dream",
            "Walls can't hold what I mean",
            "Gold spoons sleep while we scheme",
            "Watch me rise, watch me rise"
        ]
    },
    {
        "section_name": "Bridge",
        "positive_local_styles": [
            "breakdown", "stripped to piano",
            "vulnerable", "raw emotion"
        ],
        "negative_local_styles": ["full production", "aggressive"],
        "duration_ms": 20000,
        "lines": [
            "엄마 미안해 아직 못 성공했어",  # "Mom, sorry, haven't made it yet"
            "근데 기다려 줘 곧 할 거야"  # "But wait for me, soon I will"
        ]
    },
    {
        "section_name": "Final Hook",
        "positive_local_styles": [
            "EXPLOSIVE", "all elements",
            "maximum energy", "triumphant release"
        ],
        "negative_local_styles": ["fading", "weak"],
        "duration_ms": 28000,
        "lines": [
            "3 pyeong and a dream",
            "WALLS CAN'T HOLD WHAT I MEAN",
            "Gold spoons sleep while we scheme",
            "WATCH ME RISE, WATCH ME RISE"
        ]
    },
    {
        "section_name": "Outro",
        "positive_local_styles": [
            "triumphant fade", "piano returns",
            "hopeful", "resolved"
        ],
        "negative_local_styles": ["abrupt ending"],
        "duration_ms": 10000,
        "lines": ["[Instrumental fade with subway sounds]"]
    }
]

# Set global styles
plan["positive_global_styles"] = [
    "korean hip-hop", "emotional boom bap", "piano-driven",
    "building intensity", "hell joseon anthem", "underdog story"
]

plan["negative_global_styles"] = [
    "happy-go-lucky", "party music", "carefree",
    "western trap cliches", "autotuned singing"
]
```

---

## STEP 3: GENERATE TRACK

```python
# Generate with customized plan
track = client.music.compose(
    composition_plan=plan,
    respect_sections_durations=True,
    output_format="mp3_44100_192"  # Higher quality
)

# Save main track
with open("goshiwon_dreams.mp3", "wb") as f:
    f.write(track)

# Get detailed response with timestamps
detailed = client.music.compose_detailed(
    composition_plan=plan,
    respect_sections_durations=True
)

# Save lyric timestamps for video sync
import json
with open("goshiwon_dreams_metadata.json", "w") as f:
    json.dump(detailed.json, f, indent=2)
```

---

## STEP 4: SEPARATE STEMS (Optional)

```python
# Separate for mixing/remixing
stems = client.music.separate_stems(
    audio=track,
    stems=4
)

# Save individual stems
with open("goshiwon_vocals.mp3", "wb") as f:
    f.write(stems["vocals"])
    
with open("goshiwon_instrumental.mp3", "wb") as f:
    f.write(stems["drums"] + stems["bass"] + stems["other"])
```

---

## ARTIST-SPECIFIC PROMPT TEMPLATES

### Fresh Prince of Pyongyang
```python
FRESH_PRINCE_PROMPT = """
Polished trap production, 140 BPM, satirical energy.

Sound: Clean 808s, triumphant brass hits (Moranbong band style flipped),
lonely piano counter-melody underneath the flex.

Vocals: Smooth male delivery, educated tone, slight international accent.
Confident on surface, loneliness showing through.
Korean with occasional English/German phrases.

Structure: Fresh Prince theme parody intro → Verse about privilege →
Hook about isolation → Verse about realizing the cage → Emotional hook

Theme: Born with everything material, missing genuine connection.
Satirical critique of elite privilege from inside.
"""
```

### Jangmadang Jenny
```python
JENNY_PROMPT = """
Hard aggressive trap, 145 BPM, hustle anthem.

Sound: Punchy 808s, aggressive hi-hat rolls, 
market sounds as percussion (coins, haggling, cash register).
Minimal melody - let the voice carry.

Vocals: Aggressive female Korean rapper, fast delivery,
occasional whispered moments (secret transactions),
code-switching between formal and street Korean.

Structure: Market sounds intro → Hard verse about hustle →
Aggressive hook about providing what the state can't →
Verse about forbidden media → Defiant hook

Theme: Black market queen, generational survival,
K-drama rebellion, female empowerment against system.
"""
```

### K-Drama Trauma (Masked Collective)
```python
KDRAMA_PROMPT = """
Dark atmospheric trap, 130 BPM, mysterious and paranoid.

Sound: Glitchy effects, surveillance sounds (camera clicks, static),
distorted bass, K-drama OST samples subtly woven in.

Vocals: Distorted/processed male voice, identity obscured,
paranoid delivery, lines that could be loyal OR subversive.
Korean with banned South Korean slang scattered throughout.

Structure: Static/surveillance intro → Cryptic verse →
Hypnotic hook using "오빠" (banned word) → 
Verse about secret viewing → Hook with voice modulation shifts

Theme: USB drive generation, watching freedom at 3AM,
the mask as protection, identity as collective resistance.
"""
```

### Halmeoni Flow
```python
HALMEONI_PROMPT = """
Traditional Korean fusion with modern boom bap, 95 BPM, wise and powerful.

Sound: Janggu (Korean drum) layered with 808s,
gayageum (string instrument) melody, 
pansori-influenced vocal space.

Vocals: Mature female voice, powerful, 
pansori storytelling techniques, 
occasional traditional singing melodic lines.
Pure Korean, historical vocabulary.

Structure: Traditional instrument intro → 
Verse about remembering undivided Korea →
Melodic hook about the wound that never healed →
Verse addressing young generation →
Hook about hope that survived everything

Theme: Living memory of 1950, personal cost of division,
wisdom across generations, permission to be angry AND hopeful.
"""
```

### The Divide Twins (Call and Response)
```python
TWINS_PROMPT = """
Emotional minimal production, 85 BPM, devastating intimacy.

Sound: Sparse piano, soft 808s with lots of space,
room for two contrasting voices,
traditional lullaby sample as recurring motif.

Vocals: Two male voices - one South Korean standard,
one with North Korean dialect influences.
Call and response structure, unknowingly connected.
Building to realization moment.

Structure: 
- Dong-Ho (South) intro verse about identity confusion
- Dong-Hyun (North) response about the mother he imagines  
- Shared hook (same melody, different words)
- Trading shorter bars
- The lullaby moment - both sing same song learned from mother
- Emotional release

Theme: Separated at birth, don't know each other exists,
the audience knows, building to devastating recognition,
the shared lullaby as the bridge across division.
"""
```

---

## MCP INTEGRATION

When using Claude Desktop with ElevenLabs MCP server:

```
User: "Create a track for Jangmadang Jenny about her night market hustle"

Claude: I'll generate a track using the JucheGang Jenny skill parameters...

[Claude reads JANGMADANG_JENNY.skill.md]
[Claude reads ELEVENLABS_MUSIC.skill.md]
[Claude constructs composition plan]
[Claude calls compose_music tool via MCP]

Track generated and saved to ~/Music/jangmadang_jenny_night_market.mp3
```

---

## FULL WORKFLOW EXAMPLE

### Generate "38" (Ensemble Finale)

```python
# Load all artist configs
artists = [
    "fresh_prince", "jenny", "seoul_survivor",
    "kdrama_trauma", "halmeoni", "gangnam_ghost"
]

# Create ensemble plan
ensemble_plan = {
    "positive_global_styles": [
        "korean hip-hop ensemble", "traditional korean fusion",
        "trap foundation", "triumphant", "reunification anthem"
    ],
    "negative_global_styles": [
        "political propaganda", "preachy", "one-sided"
    ],
    "sections": [
        {
            "section_name": "Opening",
            "positive_local_styles": ["building from silence", "DMZ ambience"],
            "duration_ms": 15000,
            "lines": ["[Radio static - North and South signals overlapping]"]
        },
        {
            "section_name": "Fresh Prince 8 Bars",
            "positive_local_styles": ["smooth satirical", "brass hint"],
            "duration_ms": 20000,
            "lines": ["38 - the number on my floor..."]
        },
        {
            "section_name": "Jangmadang Jenny 8 Bars",
            "positive_local_styles": ["aggressive female", "market energy"],
            "duration_ms": 20000,
            "lines": ["38 - degrees below what they promised..."]
        },
        # ... continue for each artist
        {
            "section_name": "Halmeoni Bridge",
            "positive_local_styles": ["pansori", "traditional melody"],
            "duration_ms": 25000,
            "lines": ["Before there was a line, there was just Korea..."]
        },
        {
            "section_name": "All Together Final Hook",
            "positive_local_styles": ["full ensemble", "triumphant", "unified"],
            "duration_ms": 30000,
            "lines": [
                "38 - the number that divided us",
                "38 - the number that defines us", 
                "38 - the number we'll erase",
                "When we finally meet face to face"
            ]
        }
    ]
}

# Generate the finale
finale = client.music.compose(
    composition_plan=ensemble_plan,
    music_length_ms=240000,  # 4 minutes for full ensemble
    respect_sections_durations=True
)
```

---

## OUTPUT CHECKLIST

After generation, verify:
- [ ] Track length matches target
- [ ] Vocal clarity is acceptable
- [ ] Beat matches artist parameters
- [ ] Lyrics are audible and on-beat
- [ ] Emotional arc is present
- [ ] No copyright-flagged elements
- [ ] Stems separate cleanly (if needed)

---

## NEXT STEPS

1. **Test each artist template** with ElevenLabs API
2. **Refine prompts** based on output quality
3. **Build prompt library** for rapid iteration
4. **Create MCP workflow** for Claude integration
5. **Generate first JucheGang album**

---

*"The skill file is the DNA. The composition plan is the blueprint. ElevenLabs builds the house."*
