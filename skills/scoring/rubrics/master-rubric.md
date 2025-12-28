# Master Scoring Rubric

> **Version**: 1.0.0
> **Purpose**: Unified quality assessment for all generations

---

## Scoring Philosophy

### The 1-5 Scale

| Score | Label | Meaning |
|-------|-------|---------|
| **1** | FAIL | Unusable, off-brand, embarrassing |
| **2** | WEAK | Recognizable intent, poor execution |
| **3** | MID | Acceptable, "it's fine", forgettable |
| **4** | SOLID | Good quality, would use, minor tweaks |
| **5** | WIN | Exceptional, no notes, share immediately |

### Win/Fail Classification

- **WIN**: Average score ≥ 4.0 AND no individual metric ≤ 2
- **FAIL**: Average score < 3.0 OR any critical metric = 1
- **MID**: Everything else (iterate or ship with caveats)

---

## Lyric Scoring (6 Metrics)

### 1. Flow (Weight: 20%)
*How does it feel to rap/speak aloud?*

| Score | Criteria |
|-------|----------|
| 1 | Unrappable, awkward syllable counts, no rhythm |
| 2 | Technically possible but clunky |
| 3 | Decent flow, nothing special |
| 4 | Smooth delivery, natural breath points |
| 5 | Flawless rhythm, varied cadence, pocket perfect |

### 2. Rhyme Quality (Weight: 20%)
*Sophistication of rhyme scheme*

| Score | Criteria |
|-------|----------|
| 1 | Forced rhymes, no internal rhymes |
| 2 | Basic end rhymes only |
| 3 | Some internal rhymes, predictable |
| 4 | Multi-syllabic rhymes, good density |
| 5 | Complex schemes, compound rhymes, slant rhymes |

### 3. Imagery/Wordplay (Weight: 15%)
*Vividness and cleverness of language*

| Score | Criteria |
|-------|----------|
| 1 | Cliché, generic, no metaphors |
| 2 | Occasional attempt, mostly flat |
| 3 | Some clever moments, hit or miss |
| 4 | Strong imagery, memorable lines |
| 5 | Quotable bars, layered meanings, original metaphors |

### 4. Hook Strength (Weight: 20%)
*Memorability and repeat value*

| Score | Criteria |
|-------|----------|
| 1 | Forgettable, wouldn't repeat |
| 2 | Exists but doesn't stick |
| 3 | Decent, might hum later |
| 4 | Catchy, would replay for hook |
| 5 | Instant earworm, crowd chant potential |

### 5. Style Authenticity (Weight: 15%)
*Match to target artist/domain*

| Score | Criteria |
|-------|----------|
| 1 | Completely off-brand, wrong artist |
| 2 | Generic, could be anyone |
| 3 | Some recognizable elements |
| 4 | Strong match, would guess correctly |
| 5 | Unmistakably the target style |

### 6. Emotional Impact (Weight: 10%)
*Does it make you feel something?*

| Score | Criteria |
|-------|----------|
| 1 | Nothing, empty, soulless |
| 2 | Slight reaction |
| 3 | Decent emotional content |
| 4 | Strong feeling, resonates |
| 5 | Visceral reaction, goosebumps, or laughed out loud |

---

## Beat Scoring (6 Metrics)

### 1. Groove/Pocket (Weight: 25%)
*Head-nodding factor*

| Score | Criteria |
|-------|----------|
| 1 | Stiff, robotic, no bounce |
| 2 | Slight movement |
| 3 | Decent groove, not memorable |
| 4 | Strong bounce, want to move |
| 5 | Irresistible pocket, can't stop nodding |

### 2. Sound Selection (Weight: 20%)
*Quality of drums, synths, samples*

| Score | Criteria |
|-------|----------|
| 1 | Stock, cheap, amateur |
| 2 | Below average |
| 3 | Acceptable quality |
| 4 | Professional, well-chosen |
| 5 | Perfect selection, cohesive palette |

### 3. Low End (Weight: 20%)
*Bass and kick power/clarity*

| Score | Criteria |
|-------|----------|
| 1 | Muddy, weak, or missing |
| 2 | Present but problematic |
| 3 | Acceptable bass |
| 4 | Punchy, clean, powerful |
| 5 | Chest-rattling, perfectly balanced |

### 4. Arrangement (Weight: 15%)
*Structure, builds, variation*

| Score | Criteria |
|-------|----------|
| 1 | No variation, boring loop |
| 2 | Minimal changes |
| 3 | Basic intro/verse/hook |
| 4 | Good dynamics, intentional builds |
| 5 | Cinematic arrangement, perfect pacing |

### 5. Mix Clarity (Weight: 10%)
*Can you hear everything?*

| Score | Criteria |
|-------|----------|
| 1 | Cluttered, muddy, harsh |
| 2 | Problematic areas |
| 3 | Passable mix |
| 4 | Clear, balanced, professional |
| 5 | Crystal clear, wide, punchy |

### 6. Style Authenticity (Weight: 10%)
*Match to target producer/era*

| Score | Criteria |
|-------|----------|
| 1 | Wrong genre entirely |
| 2 | Generic, no character |
| 3 | Some style elements |
| 4 | Strong match |
| 5 | Unmistakably the target style |

---

## Automated Scoring Prompt

Use this prompt to have Claude self-evaluate generated content:

```
Score this {content_type} on a 1-5 scale for each metric:

CONTENT:
{generated_content}

TARGET STYLE: {target_domain}

SCORING RUBRIC:
{paste relevant rubric section}

Return JSON:
{
  "scores": {
    "metric_1": { "score": 1-5, "reasoning": "brief explanation" },
    "metric_2": { "score": 1-5, "reasoning": "brief explanation" },
    ...
  },
  "average": X.X,
  "classification": "WIN" | "MID" | "FAIL",
  "improvement_notes": ["specific suggestion 1", "suggestion 2"]
}
```

---

## Tracking Schema

```typescript
interface ScoringRecord {
  id: string;
  generation_id: string;
  scored_at: Date;
  scorer: "auto" | "human" | "both";

  // Scores
  metrics: Record<string, {
    score: number;
    reasoning?: string;
  }>;
  average: number;
  classification: "WIN" | "MID" | "FAIL";

  // Context
  domain: string;
  skill_version: string;

  // Human override
  human_override?: {
    final_classification: "WIN" | "MID" | "FAIL";
    notes: string;
  };
}
```

---

## Weekly Review Process

1. **Pull all generations** from past 7 days
2. **Aggregate by domain** (eminem, kanye, metro, etc.)
3. **Calculate win rates** per domain/version
4. **Identify fail patterns** (which metrics fail most?)
5. **Update skill prompts** based on learnings
6. **Increment version** and A/B test

### Key Metrics to Track

| Metric | Target | Action if Below |
|--------|--------|-----------------|
| Win Rate | > 60% | Revise skill prompt |
| Avg Score | > 3.8 | Analyze weak metrics |
| User Rating | > 4.0/5 | Compare to auto-score |
| Cost per Win | < $0.50 | Optimize retries |
