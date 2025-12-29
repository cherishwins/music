# SKILL: JucheGang Production Pipeline
## From Character Skill to ElevenLabs Music to Hit Track

*"Skills in, hits out"*

---

## THE PIPELINE

```
+------------------+    +------------------+    +------------------+
|  Artist Skill    | -> | Composition Plan | -> | ElevenLabs API   |
|  (.skill.md)     |    | Generator        |    | /v1/music        |
+------------------+    +------------------+    +------------------+
         |                       |                       |
         v                       v                       v
   Voice Profile          Section Structure         Final Track
   Beat Requirements      Lyrics                    + Stems
   Themes                 Styles                    + Timestamps
   Flow Patterns          Duration
```

---

## COST-OPTIMIZED WORKFLOW

### Phase 1: Planning (FREE - No Credits)
1. Load artist skill parameters
2. Generate composition plan via `/v1/music/plan`
3. Iterate on plan structure and lyrics
4. Review and approve plan

### Phase 2: Generation (CREDITS)
1. Submit approved plan to `/v1/music`
2. Generate track
3. Optionally separate stems
4. Download and verify

---

## STEP 1: ARTIST SKILL STRUCTURE

Each JucheGang artist has a skill file containing:
- `voice_profile`: Vocal characteristics
- `flow`: Syllable density, rhythmic patterns
- `beat_requirements`: BPM, style, key
- `themes`: Content categories
- `ad_libs`: Signature sounds

### Seoul Survivor Config
```typescript
const artist_config = {
  name: "seoul_survivor",
  voice: {
    type: "strained_determined",
    register: "chest_with_reaches",
    delivery: "building_intensity"
  },
  beat: {
    bpm: 92,
    style: "emotional_boom_bap",
    key: "minor",
    elements: ["piano_loops", "subway_sounds", "urban_seoul"]
  },
  themes: ["struggle", "determination", "hell_joseon", "hope"],
  flow: {
    density: "medium_high",
    pocket: "on_beat",
    variation: "build_to_explosion"
  }
};
```

### Fresh Prince of Pyongyang Config
```typescript
const fresh_prince_config = {
  name: "fresh_prince_pyongyang",
  voice: {
    type: "smooth_satirical",
    register: "mid_confident",
    delivery: "educated_international"
  },
  beat: {
    bpm: 140,
    style: "polished_trap",
    key: "major_with_minor_hints",
    elements: ["clean_808s", "brass_hits", "lonely_piano"]
  },
  themes: ["privilege_critique", "isolation", "golden_cage", "satire"],
  flow: {
    density: "medium",
    pocket: "smooth",
    variation: "consistent_with_emotional_breaks"
  }
};
```

### Jangmadang Jenny Config
```typescript
const jenny_config = {
  name: "jangmadang_jenny",
  voice: {
    type: "aggressive_female",
    register: "powerful_chest",
    delivery: "fast_commanding"
  },
  beat: {
    bpm: 145,
    style: "hard_trap",
    key: "minor",
    elements: ["punchy_808s", "aggressive_hihats", "market_sounds"]
  },
  themes: ["hustle", "survival", "female_power", "black_market"],
  flow: {
    density: "high",
    pocket: "on_beat_aggressive",
    variation: "whispers_to_explosions"
  }
};
```

---

## STEP 2: GENERATE COMPOSITION PLAN (FREE)

Transform skill parameters into ElevenLabs composition plan format.

### TypeScript Implementation
```typescript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});

// Build prompt from artist config
function buildPromptFromSkill(config: ArtistConfig): string {
  return `
    ${config.beat.style} hip-hop track, ${config.beat.bpm} BPM, ${config.beat.key} key.

    Sound: ${config.beat.elements.join(", ")}.

    Vocals: ${config.voice.type} delivery, ${config.voice.register} register.
    ${config.voice.delivery} throughout.

    Theme: ${config.themes.join(", ")}.

    Flow: ${config.flow.density} syllable density, ${config.flow.pocket} pocket,
    ${config.flow.variation} variation pattern.
  `.trim();
}

// Generate plan (FREE - no credits)
async function createPlan(config: ArtistConfig, durationMs: number) {
  const prompt = buildPromptFromSkill(config);

  const plan = await client.music.compositionPlan.create({
    prompt,
    musicLengthMs: durationMs,
  });

  return plan;
}

// Example: Seoul Survivor
const plan = await createPlan(artist_config, 210000);
console.log(JSON.stringify(plan, null, 2));
```

### Sample Plan Output
```json
{
  "positive_global_styles": [
    "korean hip-hop", "emotional boom bap", "piano-driven",
    "building intensity", "hell joseon anthem", "underdog story"
  ],
  "negative_global_styles": [
    "happy-go-lucky", "party music", "carefree",
    "western trap cliches", "autotuned singing"
  ],
  "sections": [
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
        "3 평 고시원 꿈을 꾸고 있어",
        "벽이 너무 얇아 옆방 꿈까지 들려",
        "300번 지원서 300번 거절",
        "금수저 면접 따고 흙수저 줄 서",
        "근데 나 안 포기해 계속 가",
        "헬조선 탈출구 내가 찾을 거야"
      ]
    }
  ]
}
```

---

## STEP 3: CUSTOMIZE PLAN WITH LYRICS

After generating the base plan, override with custom lyrics:

```typescript
// Modify plan with custom lyrics
plan.sections = [
  {
    section_name: "Intro",
    positive_local_styles: [
      "sparse piano", "distant city sounds",
      "building anticipation", "subway door chime"
    ],
    negative_local_styles: ["full drums", "aggressive"],
    duration_ms: 12000,
    lines: ["[Subway announcement: 이번 역은...]"]
  },
  {
    section_name: "Verse 1",
    positive_local_styles: [
      "restrained drums", "piano melody",
      "measured delivery", "tired but determined"
    ],
    negative_local_styles: ["explosive", "shouting"],
    duration_ms: 45000,
    lines: [
      "3 평 고시원 꿈을 꾸고 있어",  // Dreaming in a 3 pyeong goshiwon
      "벽이 너무 얇아 옆방 꿈까지 들려",  // Walls so thin I hear next room's dreams
      "300번 지원서 300번 거절",  // 300 applications, 300 rejections
      "금수저 면접 따고 흙수저 줄 서",  // Gold spoons get interviews, dirt spoons wait
      "근데 나 안 포기해 계속 가",  // But I won't give up, keep going
      "헬조선 탈출구 내가 찾을 거야"  // I'll find the exit from Hell Joseon
    ]
  },
  {
    section_name: "Hook",
    positive_local_styles: [
      "fuller production", "emotional melody",
      "anthemic feel", "singable"
    ],
    negative_local_styles: ["sparse", "spoken word"],
    duration_ms: 25000,
    lines: [
      "3 pyeong and a dream",
      "Walls can't hold what I mean",
      "Gold spoons sleep while we scheme",
      "Watch me rise, watch me rise"
    ]
  },
  // ... more sections
];
```

---

## STEP 4: GENERATE TRACK (CREDITS)

```typescript
// Generate with customized plan
const audioStream = await client.music.compose({
  compositionPlan: plan,
});

// Convert stream to buffer
const chunks: Uint8Array[] = [];
for await (const chunk of audioStream) {
  chunks.push(chunk);
}
const audioBuffer = Buffer.concat(chunks);

// Save main track
fs.writeFileSync("goshiwon_dreams.mp3", audioBuffer);

// For detailed response with timestamps
const detailed = await client.music.composeDetailed({
  compositionPlan: plan,
  withTimestamps: true,
});

// Save metadata for video sync
fs.writeFileSync(
  "goshiwon_dreams_metadata.json",
  JSON.stringify(detailed.json, null, 2)
);
```

---

## STEP 5: SEPARATE STEMS (Optional)

```typescript
// Separate for mixing/remixing
const stems = await client.music.separateStems({
  audio: audioBuffer,
  stems: 4  // vocals, drums, bass, other
});

// Save individual stems
fs.writeFileSync("goshiwon_vocals.mp3", stems.vocals);
fs.writeFileSync("goshiwon_drums.mp3", stems.drums);
fs.writeFileSync("goshiwon_bass.mp3", stems.bass);
fs.writeFileSync("goshiwon_other.mp3", stems.other);

// Create instrumental mix
const instrumental = Buffer.concat([stems.drums, stems.bass, stems.other]);
fs.writeFileSync("goshiwon_instrumental.mp3", instrumental);
```

---

## ARTIST-SPECIFIC PROMPT TEMPLATES

### Fresh Prince of Pyongyang
```typescript
const FRESH_PRINCE_PROMPT = `
Polished trap production, 140 BPM, satirical energy.

Sound: Clean 808s, triumphant brass hits (Moranbong band style flipped),
lonely piano counter-melody underneath the flex.

Vocals: Smooth male delivery, educated tone, slight international accent.
Confident on surface, loneliness showing through.
Korean with occasional English/German phrases.

Structure: Fresh Prince theme parody intro -> Verse about privilege ->
Hook about isolation -> Verse about realizing the cage -> Emotional hook

Theme: Born with everything material, missing genuine connection.
Satirical critique of elite privilege from inside.
`;
```

### Jangmadang Jenny
```typescript
const JENNY_PROMPT = `
Hard aggressive trap, 145 BPM, hustle anthem.

Sound: Punchy 808s, aggressive hi-hat rolls,
market sounds as percussion (coins, haggling, cash register).
Minimal melody - let the voice carry.

Vocals: Aggressive female Korean rapper, fast delivery,
occasional whispered moments (secret transactions),
code-switching between formal and street Korean.

Structure: Market sounds intro -> Hard verse about hustle ->
Aggressive hook about providing what the state can't ->
Verse about forbidden media -> Defiant hook

Theme: Black market queen, generational survival,
K-drama rebellion, female empowerment against system.
`;
```

### Seoul Survivor
```typescript
const SEOUL_SURVIVOR_PROMPT = `
Emotional boom bap hip-hop track, 92 BPM, minor key.

Sound: Piano-driven melody, crisp drums, atmospheric pads.
Urban Seoul sounds subtly layered (subway announcements, city ambience).
Building intensity throughout - starts restrained, ends explosive.

Vocals: Male Korean rapper, strained but determined delivery.
Starts tired and measured, builds to powerful release.
Korean lyrics with occasional English phrases.

Structure: Intro (sparse) -> Verse 1 (restrained) -> Hook (building) ->
Verse 2 (more intense) -> Hook (fuller) -> Bridge (breakdown) ->
Final Hook (explosive release)

Theme: Hell Joseon struggle, 취준생 (job seeker) life,
living in goshiwon (tiny room), working 4 part-time jobs,
never giving up despite system designed to break you.
`;
```

### K-Drama Trauma (Masked Collective)
```typescript
const KDRAMA_PROMPT = `
Dark atmospheric trap, 130 BPM, mysterious and paranoid.

Sound: Glitchy effects, surveillance sounds (camera clicks, static),
distorted bass, K-drama OST samples subtly woven in.

Vocals: Distorted/processed male voice, identity obscured,
paranoid delivery, lines that could be loyal OR subversive.
Korean with banned South Korean slang scattered throughout.

Structure: Static/surveillance intro -> Cryptic verse ->
Hypnotic hook using "오빠" (banned word) ->
Verse about secret viewing -> Hook with voice modulation shifts

Theme: USB drive generation, watching freedom at 3AM,
the mask as protection, identity as collective resistance.
`;
```

### Halmeoni Flow
```typescript
const HALMEONI_PROMPT = `
Traditional Korean fusion with modern boom bap, 95 BPM, wise and powerful.

Sound: Janggu (Korean drum) layered with 808s,
gayageum (string instrument) melody,
pansori-influenced vocal space.

Vocals: Mature female voice, powerful,
pansori storytelling techniques,
occasional traditional singing melodic lines.
Pure Korean, historical vocabulary.

Structure: Traditional instrument intro ->
Verse about remembering undivided Korea ->
Melodic hook about the wound that never healed ->
Verse addressing young generation ->
Hook about hope that survived everything

Theme: Living memory of 1950, personal cost of division,
wisdom across generations, permission to be angry AND hopeful.
`;
```

### The Divide Twins (Call and Response)
```typescript
const TWINS_PROMPT = `
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
`;
```

---

## ENSEMBLE TRACK: "38" (Finale)

```typescript
const ensemble_plan = {
  positive_global_styles: [
    "korean hip-hop ensemble", "traditional korean fusion",
    "trap foundation", "triumphant", "reunification anthem"
  ],
  negative_global_styles: [
    "political propaganda", "preachy", "one-sided"
  ],
  sections: [
    {
      section_name: "Opening",
      positive_local_styles: ["building from silence", "DMZ ambience"],
      negative_local_styles: [],
      duration_ms: 15000,
      lines: ["[Radio static - North and South signals overlapping]"]
    },
    {
      section_name: "Fresh Prince 8 Bars",
      positive_local_styles: ["smooth satirical", "brass hint"],
      negative_local_styles: [],
      duration_ms: 20000,
      lines: ["38 - the number on my floor..."]
    },
    {
      section_name: "Jangmadang Jenny 8 Bars",
      positive_local_styles: ["aggressive female", "market energy"],
      negative_local_styles: [],
      duration_ms: 20000,
      lines: ["38 - degrees below what they promised..."]
    },
    {
      section_name: "Seoul Survivor 8 Bars",
      positive_local_styles: ["emotional buildup", "piano melody"],
      negative_local_styles: [],
      duration_ms: 20000,
      lines: ["38 - applications before one callback..."]
    },
    {
      section_name: "Halmeoni Bridge",
      positive_local_styles: ["pansori", "traditional melody"],
      negative_local_styles: [],
      duration_ms: 25000,
      lines: ["Before there was a line, there was just Korea..."]
    },
    {
      section_name: "All Together Final Hook",
      positive_local_styles: ["full ensemble", "triumphant", "unified"],
      negative_local_styles: [],
      duration_ms: 30000,
      lines: [
        "38 - the number that divided us",
        "38 - the number that defines us",
        "38 - the number we'll erase",
        "When we finally meet face to face"
      ]
    }
  ]
};

// Generate the finale (4 minutes for full ensemble)
const finale = await client.music.compose({
  compositionPlan: ensemble_plan,
});
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

## IMPLEMENTATION NOTES

### Error Handling
```typescript
try {
  const audio = await client.music.compose({ compositionPlan: plan });
} catch (error) {
  if (error.body?.detail?.status === 'bad_prompt') {
    console.log("Suggestion:", error.body.detail.data.prompt_suggestion);
    // Retry with suggestion
  } else if (error.status === 429) {
    console.log("Rate limited - wait and retry");
  } else {
    throw error;
  }
}
```

### Cost Tracking
```typescript
// Track generation costs
interface GenerationLog {
  artist: string;
  track_name: string;
  duration_ms: number;
  credits_used: number;
  timestamp: Date;
}

const log: GenerationLog[] = [];

// Estimate: ~X credits per minute of generation
function estimateCredits(durationMs: number): number {
  const minutes = durationMs / 60000;
  return Math.ceil(minutes * CREDITS_PER_MINUTE);
}
```

---

*"The skill file is the DNA. The composition plan is the blueprint. ElevenLabs builds the house."*
