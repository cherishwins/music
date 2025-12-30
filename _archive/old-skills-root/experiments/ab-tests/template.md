# A/B Test Template

> Copy this file for each new experiment

---

## Experiment: [EXP-XXX] {Title}

### Metadata
| Field | Value |
|-------|-------|
| **ID** | EXP-XXX |
| **Created** | YYYY-MM-DD |
| **Status** | Draft / Running / Analyzing / Complete |
| **Domain** | {domain} |
| **Skill Version** | Control: vX.X.X, Variant: vX.X.Y |

---

## Hypothesis

**If** we {change something specific}
**Then** we expect {metric} to improve by {amount}
**Because** {reasoning}

---

## Variants

### Control (A)
Current production skill version.

```
{paste relevant prompt section}
```

### Variant (B)
Modified version with change.

```
{paste modified prompt section}
```

### Key Difference
{Describe the specific change being tested}

---

## Success Criteria

| Metric | Control Baseline | Target Improvement | Minimum Improvement |
|--------|------------------|-------------------|---------------------|
| Win Rate | X% | +10% | +5% |
| {metric2} | X | +Y | +Z |

**Statistical Significance**: p < 0.05 required
**Sample Size**: Minimum N=100 per variant

---

## Traffic Split
- Control: 50%
- Variant: 50%

---

## Timeline
| Phase | Start | End |
|-------|-------|-----|
| Prep | YYYY-MM-DD | YYYY-MM-DD |
| Running | YYYY-MM-DD | YYYY-MM-DD |
| Analysis | YYYY-MM-DD | YYYY-MM-DD |
| Decision | YYYY-MM-DD | - |

---

## Results (fill after complete)

### Raw Data
| Variant | Generations | Wins | Win Rate | Avg Score |
|---------|-------------|------|----------|-----------|
| Control | | | | |
| Variant | | | | |

### Statistical Analysis
- **Win Rate Difference**: X% (p = Y)
- **Score Difference**: X points (p = Y)
- **Statistically Significant**: Yes / No

### Metric Breakdown
| Metric | Control | Variant | Δ |
|--------|---------|---------|---|
| Flow | | | |
| Rhyme | | | |
| Hook | | | |
| Authenticity | | | |

---

## Decision

**Outcome**: Ship Variant / Keep Control / Inconclusive

**Reasoning**: {explanation}

**Follow-up Actions**:
- [ ] Update skill to vX.X.X
- [ ] Document learnings
- [ ] Plan next experiment

---

## Learnings

### What We Learned
{Key insights from this experiment}

### What Surprised Us
{Unexpected findings}

### Future Tests
{Ideas for follow-up experiments}
