# Skills-Based Architecture

> **The Vibe**: Each skill is a domain expert. It knows its API deeply, knows what works, knows how to WIN.

---

## THE IDEA

Forget boring services/pipelines. We build **skills**.

A skill is:
- Deep knowledge of HOW an API works
- Best practices from real testing
- What combinations make winners
- How to combine with other skills
- Quality checklists to know when you've won

```
┌─────────────────────────────────────────────────────────────────┐
│                        SKILLS LIBRARY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   API SKILLS              ARTIST SKILLS         SCIENCE SKILLS  │
│   ───────────             ─────────────         ──────────────  │
│   ElevenLabs Music        Seoul Survivor        Hit Production  │
│   Suno API                Jangmadang Jenny      Hook Psychology │
│   Replicate/MusicGen      Fresh Prince          Rhyme Density   │
│   Claude Prompts          Halmeoni Flow         Mix Quality     │
│   Runway ML               K-Drama Trauma        Beat Analysis   │
│                           Divide Twins                          │
│                                                                 │
│   REFERENCE ARTISTS       COMBINATION SKILLS                    │
│   ─────────────────       ──────────────────                    │
│   Jeezy Style             Thread-to-Hit Pipeline                │
│   Lil Wayne Style         Brand Forge Pipeline                  │
│   Eminem Style            Voice Studio Pipeline                 │
│   Neffex Energy           Full Album Production                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  WINNING TRACK  │
                     └─────────────────┘
```

---

## DIRECTORY STRUCTURE

```
/home/jesse/dev/projects/personal/music/skills/
├── INDEX.md                              # Quick reference, what skill for what
│
├── ELEVENLABS_MUSIC.skill.md             # ElevenLabs Music API mastery
├── JUCHEGANG_ELEVENLABS_PIPELINE.skill.md # Artist skill → API → Track
│
├── api/                                  # API-specific skills (TO CREATE)
│   ├── SUNO.skill.md                     # Suno API mastery
│   ├── REPLICATE_MUSICGEN.skill.md       # MusicGen mastery
│   ├── CLAUDE_PROMPTS.skill.md           # Claude for lyrics/stories
│   └── RUNWAY_VIDEO.skill.md             # Video generation
│
├── artists/                              # Reference artist styles
│   ├── JEEZY_STYLE.skill.md              # Deliberate trap patriarch
│   ├── LIL_WAYNE_STYLE.skill.md          # Metaphor king
│   ├── EMINEM_STYLE.skill.md             # Technical virtuoso
│   └── FEMALE_HOOK_VOCALIST.skill.md     # Chorus templates
│
├── juchegang/                            # JucheGang universe characters
│   ├── MASTER_PRODUCTION.skill.md        # Orchestration guide
│   ├── FRESH_PRINCE_PYONGYANG.skill.md   # Privileged outsider
│   ├── JANGMADANG_JENNY.skill.md         # Black market queen
│   ├── SEOUL_SURVIVOR.skill.md           # Hell Joseon underdog
│   ├── KDRAMA_TRAUMA.skill.md            # Masked collective (TO CREATE)
│   ├── HALMEONI_FLOW.skill.md            # Elder wisdom (TO CREATE)
│   └── DIVIDE_TWINS.skill.md             # Separated brothers (TO CREATE)
│
└── science/                              # The math of hits (TO CREATE)
    ├── HIT_PRODUCTION_SCIENCE.skill.md   # Frequencies, psychology
    ├── HOOK_MEMORABILITY.skill.md        # What makes hooks stick
    ├── RHYME_DENSITY.skill.md            # Flow mathematics
    └── MIX_QUALITY.skill.md              # Production standards
```

---

## SKILL FILE STRUCTURE

Every skill file follows this format:

```markdown
# SKILL: [Name]
## [Tagline that captures the essence]

---

## OVERVIEW
What this skill does, why it matters

## DEEP KNOWLEDGE
The real shit - how the API actually works, what parameters matter,
what combinations produce winners

## TEMPLATES / PATTERNS
Ready-to-use structures, prompts, composition plans

## INTEGRATION
How this skill connects to other skills in the pipeline

## QUALITY CHECKLIST
How to know if you won

## NEXT STEPS
What to test, iterate, improve

---

*"[Memorable closing line]"*
```

---

## THE PIPELINE

```
THREAD/INPUT
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  SKILL: Claude Prompts (extract story, generate lyrics)        │
│  Knows: How to prompt Claude for maximum creativity            │
│  Output: Story structure, lyrics, emotional arc                │
└─────────────────────────────────────────────────────────────────┘
     │
     ├──────────────────┬──────────────────┐
     ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ SKILL:       │  │ SKILL:       │  │ SKILL:       │
│ ElevenLabs   │  │ Suno         │  │ MusicGen     │
│ (spoken word)│  │ (full song)  │  │ (beat only)  │
└──────────────┘  └──────────────┘  └──────────────┘
     │                  │                  │
     └──────────────────┼──────────────────┘
                        ▼
                  ┌──────────────┐
                  │ ARTIST SKILL │
                  │ (style, vibe)│
                  └──────────────┘
                        │
                        ▼
                  ┌──────────────┐
                  │ QUALITY      │
                  │ CHECKLIST    │
                  └──────────────┘
                        │
                   WIN or ITERATE
```

---

## HOW SKILLS COMBINE

### Example: Seoul Survivor Track

```
1. Load SEOUL_SURVIVOR.skill.md
   → voice: strained_determined
   → bpm: 92
   → style: emotional_boom_bap
   → themes: hell_joseon, struggle, hope

2. Feed to ELEVENLABS_MUSIC.skill.md
   → Use composition plan template
   → Map artist parameters to API format
   → Set positive/negative styles

3. Generate track

4. Check against QUALITY CHECKLIST:
   - [ ] Vocal clarity
   - [ ] Beat matches artist requirements
   - [ ] Emotional arc present
   - [ ] Lyrics on-beat
   - [ ] Theme comes through

5. WIN or iterate
```

---

## THE VISION

Each skill gets REFINED through:
- **Testing**: Generate tracks, evaluate results
- **Failing**: Most won't hit, that's data
- **Learning**: What worked? Update the skill
- **Winning**: Lock in what works, document it

Over time, skills become EXPERTS that know exactly how to produce winners.

---

## vs. TRADITIONAL ARCHITECTURE

| Traditional | Skills-Based |
|-------------|--------------|
| `services/claude.ts` | `CLAUDE_PROMPTS.skill.md` |
| Just wraps API | Knows HOW to use API to WIN |
| Generic function | Deep domain knowledge |
| No iteration history | Documents what works |
| Code-only | Knowledge + code |

---

## WHAT WE HAVE SO FAR

### Created
- [x] `ELEVENLABS_MUSIC.skill.md` - Complete ElevenLabs Music API mastery
- [x] `JUCHEGANG_ELEVENLABS_PIPELINE.skill.md` - Artist → API → Track
- [x] `INDEX.md` - Quick reference

### To Create
- [ ] `SUNO.skill.md` - Suno API deep knowledge
- [ ] `REPLICATE_MUSICGEN.skill.md` - Beat generation mastery
- [ ] `CLAUDE_PROMPTS.skill.md` - Prompt engineering for lyrics/stories
- [ ] JucheGang character skills (5 more)
- [ ] Reference artist skills (Jeezy, Wayne, Em, etc.)
- [ ] Science skills (hit production math)

---

## INTEGRATION WITH CREATIVE-HUB

The creative-hub app **uses** skills:

```typescript
// API route loads relevant skill
const artistSkill = loadSkill('juchegang/seoul_survivor');
const apiSkill = loadSkill('elevenlabs_music');

// Combine to generate
const compositionPlan = apiSkill.createPlan(artistSkill.params, userInput);
const track = await elevenLabs.compose(compositionPlan);

// Evaluate
const quality = apiSkill.checkQuality(track);
if (!quality.passed) {
  // Log what failed, iterate
}
```

Skills are the **knowledge layer** that makes the code smart.

---

## THE GOAL

> "Test, fail, iterate until it's **shiny, winning, and making money**"

Skills encode everything we learn. When something works, we lock it in. When something fails, we document why.

Over time, the skills library becomes a **winning machine**.

---

*"Skills in, hits out."*
