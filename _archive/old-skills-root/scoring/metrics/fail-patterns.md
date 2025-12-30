# Fail Pattern Analysis

> **Version**: 1.0.0
> **Purpose**: Document common failures and their fixes

---

## Fail Pattern Library

### FP001: The Generic Trap
**Symptom**: Output is technically correct but has no distinctive character
**Frequency**: ~30% of MID scores
**Root Cause**: Prompt too vague, no specific examples

**Example**:
```
INPUT: Write lyrics in Kanye style about money
OUTPUT: "I got money, money, money / Cash rules everything around me..."
PROBLEM: Could be any artist, no Kanye signature
```

**Fix**:
- Add specific song references
- Include signature phrases/patterns
- Specify era (MBDTF vs Yeezus)

---

### FP002: The Over-Rhyme
**Symptom**: Forced rhymes that break natural speech
**Frequency**: ~20% of flow score fails
**Root Cause**: Model prioritizing rhyme over meaning

**Example**:
```
"I'm in the club with my squad and my boys
Making money moves and avoiding the noise
We got the drinks and the girls and the toys
Living life like we're kings and making some joys"  // "joys" is forced
```

**Fix**:
- Add "natural speech" instruction
- Include "forced rhymes are failures" in prompt
- Provide anti-examples

---

### FP003: The Mumble Hook
**Symptom**: Hook exists but is forgettable/weak
**Frequency**: ~40% of hook score 3s (MID)
**Root Cause**: Not enough emphasis on hook importance

**Example**:
```
[Hook]
Yeah we do it like this
Every day every night
Yeah we do it like this
Living life so right
```
**PROBLEM**: No memorable phrase, generic

**Fix**:
- Separate hook generation step
- Score hooks independently first
- Provide "earworm examples"

---

### FP004: The Style Drift
**Symptom**: Starts in style, drifts to generic
**Frequency**: ~25% of long-form outputs
**Root Cause**: Context window dilution, no style anchors

**Example**:
```
[Verse 1] - Strong Eminem style
"I'm beginning to feel like a tech god, tech god..."

[Verse 3] - Drifted to generic
"Working hard every day, gonna make it somehow
Never giving up, taking a bow"  // Lost Em's technical style
```

**Fix**:
- Add style reminders mid-prompt
- Generate verses separately
- Re-inject style DNA between sections

---

### FP005: The Clipping 808
**Symptom**: Beat sounds distorted/harsh in wrong way
**Frequency**: ~35% of audio generations
**Root Cause**: Audio model over-saturation

**Example**: 808 meant to hit hard but sounds broken/digital distortion

**Fix**:
- Specify "controlled distortion" or "warm saturation"
- Add "clean low end" instruction
- Use reference track descriptors

---

### FP006: The Monotone Flow
**Symptom**: Lyrics are good but feel flat when read
**Frequency**: ~20% of flow score fails
**Root Cause**: No rhythm variation instructions

**Example**:
Every. Line. Has. The. Same. Syllable. Count.
Every. Line. Has. The. Same. Syllable. Count.

**Fix**:
- Add "vary cadence" instruction
- Include (fast) (slow) markers
- Specify breath points

---

### FP007: The Tryhard
**Symptom**: Too many techniques, feels forced
**Frequency**: ~15% of Eminem-style outputs
**Root Cause**: Over-emphasis on complexity

**Example**:
```
"I'm the antithesis of synthesis of nemesis
My genesis is venomous with sentences so tremulous
Incredulous the decorous decor is meticulous"
// Too much, loses meaning
```

**Fix**:
- Add "substance over style" instruction
- "Every word must serve the message"
- Balance technical with emotional

---

### FP008: The Loop Trap
**Symptom**: Beat is static, just loops with no variation
**Frequency**: ~50% of MID beat scores
**Root Cause**: Arrangement instructions ignored

**Example**: 30-second beat that's identical bar 1 and bar 30

**Fix**:
- Explicit arrangement structure
- "Must include variation at bar X"
- Request "builds and drops"

---

## Pattern Detection Queries

### Detecting FP001 (Generic Trap)
```sql
SELECT * FROM generations
WHERE auto_scores->>'authenticity' < 3
  AND auto_scores->>'average' >= 3
ORDER BY created_at DESC
LIMIT 100
```

### Detecting FP003 (Mumble Hook)
```sql
SELECT * FROM generations
WHERE auto_scores->>'hook' = 3
  AND auto_scores->>'average' >= 3.5
ORDER BY created_at DESC
LIMIT 100
```

### Detecting Style Drift
```sql
SELECT
  domain,
  skill_version,
  COUNT(*) as total,
  AVG((auto_scores->>'authenticity')::float) as avg_auth,
  STDDEV((auto_scores->>'authenticity')::float) as auth_variance
FROM generations
GROUP BY domain, skill_version
HAVING STDDEV((auto_scores->>'authenticity')::float) > 1.0
ORDER BY auth_variance DESC
```

---

## Fail Rate by Domain (Template)

| Domain | Current Fail Rate | Primary Pattern | Fix Status |
|--------|------------------|-----------------|------------|
| eminem | --% | FP007 | Not started |
| kanye-west | --% | FP001 | Not started |
| gucci-mane | --% | FP003 | Not started |
| dr-dre | --% | FP008 | Not started |
| metro-boomin | --% | FP005 | Not started |

---

## Weekly Fail Review Template

```markdown
## Week of YYYY-MM-DD

### Top 3 Fail Patterns This Week
1. FP00X: Description - N occurrences
2. FP00Y: Description - N occurrences
3. FP00Z: Description - N occurrences

### Domain with Highest Fail Rate
- Domain: X
- Fail Rate: Y%
- Root Cause: Z

### Actions Taken
- [ ] Updated X skill prompt
- [ ] Added anti-example for Y pattern
- [ ] Created A/B test for Z approach

### Results from Last Week's Fixes
- Fix A: Win rate +X%
- Fix B: No change
- Fix C: Rolled back (regression)
```
