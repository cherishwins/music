# JucheGang Production Skills Index
## Complete Library for AI Music Generation

---

## 📁 DIRECTORY STRUCTURE

```
skills/
├── HIT_PRODUCTION_SCIENCE.md              # Math, frequencies, psychology of hits
├── ELEVENLABS_MUSIC.skill.md              # ElevenLabs API + MCP integration
├── JUCHEGANG_ELEVENLABS_PIPELINE.skill.md # Artist skills → API → Hit tracks
│
├── artists/                                # Reference artist styles
│   ├── JEEZY_STYLE.skill.md               # Deliberate trap patriarch
│   ├── LIL_WAYNE_STYLE.skill.md           # Metaphor king, wordplay
│   ├── EMINEM_STYLE.skill.md              # Technical virtuoso
│   └── FEMALE_HOOK_VOCALIST.skill.md      # Chorus/hook templates
│
└── juchegang/                              # JucheGang universe
    ├── MASTER_PRODUCTION.skill.md         # Orchestration guide
    ├── FRESH_PRINCE_PYONGYANG.skill.md    # Privileged outsider
    ├── JANGMADANG_JENNY.skill.md          # Black market queen
    └── SEOUL_SURVIVOR.skill.md            # Hell Joseon underdog
```

---

## 🎯 QUICK REFERENCE

### When You Need...

| Goal | Use This Skill |
|------|----------------|
| Understand what makes hits work | `HIT_PRODUCTION_SCIENCE.md` |
| **ElevenLabs Music API details** | `ELEVENLABS_MUSIC.skill.md` |
| **Generate track from artist skill** | `JUCHEGANG_ELEVENLABS_PIPELINE.skill.md` |
| Deliberate, spacious trap flow | `JEEZY_STYLE.skill.md` |
| Wordplay and punchline density | `LIL_WAYNE_STYLE.skill.md` |
| Technical rhyming, storytelling | `EMINEM_STYLE.skill.md` |
| Female chorus/hook | `FEMALE_HOOK_VOCALIST.skill.md` |
| Coordinate JucheGang project | `MASTER_PRODUCTION.skill.md` |
| Satirical privilege critique | `FRESH_PRINCE_PYONGYANG.skill.md` |
| Aggressive female hustle | `JANGMADANG_JENNY.skill.md` |
| Underdog struggle anthem | `SEOUL_SURVIVOR.skill.md` |

---

## 🔧 HOW TO USE SKILLS

### For Thread-to-Hit Generation

1. **Read the relevant skill file**
2. **Extract generation parameters** (JSON block in each file)
3. **Feed to API** with customizations
4. **Use quality checklist** to evaluate output

### Example: Generate Seoul Survivor Track

```bash
# 1. Load skill parameters
cat skills/juchegang/SEOUL_SURVIVOR.skill.md | grep -A 30 "Generation Parameters"

# 2. Feed to Thread-to-Hit
curl -X POST /api/generate/thread-to-hit \
  -d '{
    "thread": "3 years job searching, 300 applications, living in a goshiwon smaller than a parking space, working 4 part-time jobs, but still believing",
    "artist": "seoul_survivor",
    "voice": "strained_determined",
    "beatStyle": "hiphop",
    "bpm": 92,
    "language": "ko",
    "style": "anthem"
  }'
```

---

## 📊 SKILL FILE STRUCTURE

Each skill file contains:

```markdown
## VOICE PROFILE
- Tone, register, texture characteristics
- Delivery modes

## FLOW PATTERNS
- Syllable density
- Rhythmic DNA
- Signature techniques

## PRODUCTION PREFERENCES
- BPM range
- Beat requirements
- Signature sounds

## LYRICAL FRAMEWORK
- Themes
- Vocabulary style
- Rhyme patterns

## GENERATION PARAMETERS
- JSON block for API
- Ready to use

## QUALITY CHECKLIST
- Evaluation criteria
```

---

## 🎵 STILL TO CREATE

### Artist Skills Needed
- [ ] K-Drama Trauma (masked collective)
- [ ] Halmeoni Flow (elder wisdom)
- [ ] Gangnam Ghost (escaped elite)
- [ ] DMZ DJ (producer profile)
- [ ] The Divide Twins (separated brothers)

### Reference Artist Skills Needed
- [ ] Dr. Dre (production philosophy)
- [ ] T.I. (technical accessibility)
- [ ] Neffex (indie energy)
- [ ] Wiz Khalifa (smooth melody)
- [ ] Lil Baby (modern melodic trap)

### Technical Skills Needed
- [ ] Beat analysis pipeline
- [ ] Rhyme density calculator
- [ ] Hook memorability tester
- [ ] Mix quality checker

---

## 🚀 NEXT STEPS

1. **Test existing skills** - Generate tracks with current parameters
2. **Analyze output** - Compare to reference quality
3. **Iterate parameters** - Refine based on results
4. **Complete roster** - Build remaining character skills
5. **Build analysis tools** - Automate pattern extraction

---

*"The skills are the DNA. The generation is the expression."*
