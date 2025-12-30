# Win Conditions & Success Metrics

> **Version**: 1.0.0
> **Purpose**: Define what "success" looks like at each level

---

## Win Hierarchy

```
                    ┌─────────────────┐
                    │  VIRAL WIN      │  User shares publicly
                    │  (Exceptional)  │  without prompting
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  COMMERCIAL WIN │  User pays/upgrades
                    │  (Strong)       │  after this generation
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  ENGAGEMENT WIN │  User downloads, saves,
                    │  (Good)         │  or continues session
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  QUALITY WIN    │  Scores ≥4.0 average
                    │  (Baseline)     │  in auto-evaluation
                    └─────────────────┘
```

---

## Win Signals by Type

### Immediate Signals (0-60 seconds)
| Signal | Type | Strength |
|--------|------|----------|
| User downloads file | Engagement | Strong |
| User rates 5 stars | Engagement | Strong |
| User clicks "regenerate" | Soft Fail | Weak |
| User rates 1-2 stars | Hard Fail | Strong |
| User closes immediately | Hard Fail | Weak |

### Short-term Signals (1 min - 1 day)
| Signal | Type | Strength |
|--------|------|----------|
| User returns same session | Engagement | Medium |
| User purchases credits | Commercial | Strong |
| User shares to social | Viral | Strong |
| User submits support ticket | Fail | Strong |

### Long-term Signals (1 day - 30 days)
| Signal | Type | Strength |
|--------|------|----------|
| Repeat user (weekly) | Retention | Strong |
| Upgrades plan | Commercial | Strong |
| Refers another user | Viral | Strong |
| Churns within 7 days | Fail | Strong |

---

## Quality Win Conditions (Auto-Scored)

### Lyric Generation
```
WIN if:
  average_score >= 4.0
  AND flow_score >= 3
  AND hook_score >= 4
  AND authenticity_score >= 3
  AND no_metric <= 2

MID if:
  average_score >= 3.0
  AND average_score < 4.0
  AND no_metric <= 1

FAIL if:
  average_score < 3.0
  OR any_metric <= 1
  OR authenticity_score <= 2
```

### Beat Generation
```
WIN if:
  average_score >= 4.0
  AND groove_score >= 4
  AND low_end_score >= 3
  AND no_metric <= 2

MID if:
  average_score >= 3.0
  AND no_metric <= 1

FAIL if:
  average_score < 3.0
  OR groove_score <= 2
  OR low_end_score <= 1
```

---

## Business Win Conditions

### Unit Economics Win
```
WIN if:
  revenue_from_generation > (api_cost * 2.5)

SUSTAINABLE if:
  revenue_from_generation > (api_cost * 1.5)

LOSS if:
  revenue_from_generation < api_cost
```

### Customer Segment Win Rates

| Segment | Target Win Rate | Action Below |
|---------|-----------------|--------------|
| Content Creators | > 70% | Simplify prompts |
| Indie Artists | > 50% | Improve quality |
| Power Users | > 40% | Add customization |

---

## Fail Taxonomy

### HARD FAILS (Immediate action required)
| Code | Description | Resolution |
|------|-------------|------------|
| F001 | API error/timeout | Retry, fallback |
| F002 | Empty/gibberish output | Regenerate |
| F003 | Wrong language | Check input |
| F004 | Offensive content | Filter + log |
| F005 | Copyright concern | Legal review |

### SOFT FAILS (Iterate and improve)
| Code | Description | Resolution |
|------|-------------|------------|
| S001 | Off-style output | Refine prompt |
| S002 | Weak hook | Hook-specific focus |
| S003 | Poor flow | Add flow examples |
| S004 | Generic/bland | Increase temperature |
| S005 | Over-complicated | Simplify instructions |

### EDGE CASES (Monitor, don't action)
| Code | Description | Notes |
|------|-------------|-------|
| E001 | User regenerated | Could be exploring |
| E002 | User edited heavily | Might be power user |
| E003 | No interaction | Session timeout? |

---

## Win Rate Targets by Month

### Month 1 (Foundation)
| Metric | Target |
|--------|--------|
| Lyric Win Rate | 40% |
| Beat Win Rate | 30% |
| User Satisfaction | 3.5/5 |
| Cost per Win | < $1.00 |

### Month 3 (Growth)
| Metric | Target |
|--------|--------|
| Lyric Win Rate | 60% |
| Beat Win Rate | 50% |
| User Satisfaction | 4.0/5 |
| Cost per Win | < $0.50 |

### Month 6 (Scale)
| Metric | Target |
|--------|--------|
| Lyric Win Rate | 75% |
| Beat Win Rate | 65% |
| User Satisfaction | 4.3/5 |
| Cost per Win | < $0.30 |

---

## Tracking Implementation

```typescript
// Event to log after each generation
interface GenerationEvent {
  // Identity
  generation_id: string;
  user_id: string;
  session_id: string;

  // Input
  domain: string;          // "lyricists/eminem"
  skill_version: string;   // "1.0.0"
  input_tokens: number;

  // Output
  output_type: "lyrics" | "beat" | "full_track";
  output_tokens: number;

  // Scoring
  auto_scores: Record<string, number>;
  auto_classification: "WIN" | "MID" | "FAIL";

  // Economics
  api_cost_usd: number;
  credits_charged: number;

  // Signals (updated async)
  signals: {
    downloaded: boolean;
    rated: number | null;    // 1-5
    shared: boolean;
    regenerated: boolean;
    time_on_result_ms: number;
  };

  // Final classification (after signals)
  final_classification?: "WIN" | "MID" | "FAIL";
}
```
