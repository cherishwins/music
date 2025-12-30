# Creative Hub Skills System

> **Version**: 1.0.0
> **Philosophy**: Specialized AI prompts + Scientific iteration = Quality at scale

---

## Quick Start

### Using a Skill
```typescript
import { loadSkill, generateWithSkill, scoreOutput } from '@/lib/skills';

// 1. Load the skill
const skill = await loadSkill('lyricists/eminem');

// 2. Generate content
const output = await generateWithSkill(skill, {
  topic: 'overcoming impostor syndrome',
  mood: 'determined',
  length: 16
});

// 3. Score the result
const score = await scoreOutput(output, skill);

// 4. Log for iteration
await logGeneration({
  domain: 'lyricists/eminem',
  skill_version: skill.version,
  output,
  score,
  classification: score.average >= 4.0 ? 'WIN' : score.average >= 3.0 ? 'MID' : 'FAIL'
});
```

---

## Directory Structure

```
skills/
├── README.md                    # You are here
│
├── domains/                     # Style-specific prompts
│   ├── lyricists/              # MC/Writing styles
│   │   ├── eminem.md           ✓ Technical complexity
│   │   ├── kanye-west.md       ✓ Innovation + ego
│   │   ├── gucci-mane.md       ✓ Trap simplicity
│   │   ├── kendrick-lamar.md   TODO
│   │   ├── drake.md            TODO
│   │   └── jay-z.md            TODO
│   │
│   ├── production/             # Beat-making styles
│   │   ├── dr-dre.md           ✓ G-funk, west coast
│   │   ├── metro-boomin.md     ✓ Dark trap
│   │   ├── kanye-producer.md   TODO
│   │   ├── timbaland.md        TODO
│   │   └── pharrell.md         TODO
│   │
│   ├── eras/                   # Period-specific sounds
│   │   ├── 90s-boom-bap.md     TODO
│   │   ├── 2000s-bling.md      TODO
│   │   ├── 2010s-trap.md       TODO
│   │   └── 2020s-drill.md      TODO
│   │
│   └── moods/                  # Emotional targeting
│       ├── hype.md             TODO
│       ├── introspective.md    TODO
│       └── party.md            TODO
│
├── scoring/
│   ├── rubrics/
│   │   └── master-rubric.md    ✓ 1-5 scale, all metrics
│   │
│   └── metrics/
│       ├── win-conditions.md   ✓ What success looks like
│       └── fail-patterns.md    ✓ Common failures + fixes
│
└── experiments/
    ├── ab-tests/
    │   └── template.md         ✓ Experiment template
    │
    └── results/                # Historical test results
        └── .gitkeep
```

---

## Skill File Format

Each `.md` file follows this structure:

```markdown
# {Artist/Style} Style

> **Version**: X.X.X
> **Domain**: {category}/{name}
> **Model**: claude-sonnet-4
> **Avg Cost**: ~$X.XX/generation

## Style DNA
{Core traits, signature elements, what to avoid}

## System Prompt
{The actual prompt to send to Claude}

## Prompt Template
{Template with {variables} for user input}

## Scoring Rubric
{Domain-specific 1-5 scoring criteria}

## Example Output
{Reference generation showing ideal output}

## Iteration Log
{Version history with win rates}

## A/B Test Queue
{Planned experiments}
```

---

## MVP Implementation Path

### Phase 1: Lyric Generation (Week 1-2)
1. ✅ Create 3 lyricist skills (Em, Ye, Gucci)
2. ✅ Build scoring rubric
3. 🔲 Implement skill loader in codebase
4. 🔲 Add auto-scoring to generation pipeline
5. 🔲 Deploy and measure baseline win rates

### Phase 2: Iteration (Week 3-4)
1. 🔲 Analyze fail patterns
2. 🔲 Run first A/B tests
3. 🔲 Add 2 more lyricist skills
4. 🔲 Reach 50% win rate target

### Phase 3: Production (Week 5-6)
1. 🔲 Add producer skills (Dr Dre, Metro)
2. 🔲 Integrate with Suno/MusicGen
3. 🔲 Full thread-to-hit pipeline
4. 🔲 Reach 40% win rate on full tracks

### Phase 4: Scale (Week 7-8)
1. 🔲 Add era/mood skills
2. 🔲 User feedback loop
3. 🔲 Custom skill builder (power users)
4. 🔲 Reach profitability targets

---

## Metrics Dashboard (Target)

| Domain | Version | 7d Gens | Win Rate | Avg Score | Cost/Win |
|--------|---------|---------|----------|-----------|----------|
| eminem | 1.0.0 | -- | --% | -- | $-- |
| kanye-west | 1.0.0 | -- | --% | -- | $-- |
| gucci-mane | 1.0.0 | -- | --% | -- | $-- |
| dr-dre | 1.0.0 | -- | --% | -- | $-- |
| metro-boomin | 1.0.0 | -- | --% | -- | $-- |

---

## Key Principles

### 1. Style > Generic
Generic prompts = generic output. Every skill has specific DNA.

### 2. Measure Everything
No changes without data. A/B test all improvements.

### 3. Fail Fast, Learn Faster
Low win rate? Document pattern, fix skill, re-measure.

### 4. Version Control
Every skill change = version bump. Never edit in place.

### 5. Cost Awareness
Track cost per win. Optimize for profitability, not just quality.

---

## Next Actions

1. **Implement skill loader** in `creative-hub/src/lib/skills.ts`
2. **Add scoring endpoint** in `creative-hub/src/app/api/score/route.ts`
3. **Create tracking table** for generations + scores
4. **Build dashboard** to visualize win rates
5. **Start generating** and measuring!
