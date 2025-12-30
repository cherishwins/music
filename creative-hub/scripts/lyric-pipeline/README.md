# Hip Hop Viral Intelligence Pipeline

Vectorization → Viral Feature Extraction → Pattern Discovery → Generation Optimization

*"The patterns exist. We're using them to generate VIRAL tracks."*

**Last Updated**: December 30, 2025

---

## Current State: HIP HOP ONLY

**OLD DATA DELETED**: ABBA, Alabama, Air Supply garbage is GONE.

**NEW DATA**: 4,832 pure hip hop tracks from `Cropinky/rap_lyrics_english`.

**Collection**: `hiphop_viral` in Qdrant (NOT `lyric_patterns`)

---

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# HIP HOP VIRAL PIPELINE (RECOMMENDED)
python embed_hiphop_viral.py --max-samples 5000 --output ./hiphop_embeddings

# Upload to Qdrant (needs QDRANT_URL and QDRANT_API_KEY in .env)
python upload_hiphop_qdrant.py --input ./hiphop_embeddings --replace

# To also delete old lyric_patterns collection:
python upload_hiphop_qdrant.py --input ./hiphop_embeddings --replace --delete-old
```

### Legacy Commands (Generic - Not Recommended)

```bash
# These use the OLD generic pipeline - kept for reference only
python embed_lyrics.py --hf-dataset vishnupriyavr/spotify-million-song-dataset --max-samples 10000
python cluster_lyrics.py --input ./lyric_embeddings --clusters 20
python theme_classifier.py --corpus ./lyric_embeddings
python upload_to_qdrant.py --input ./lyric_embeddings
```

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  1. EMBED + VIRAL FEATURES (embed_hiphop_viral.py)              │
│     Lyrics → Sentence Transformer → 384-dim vectors             │
│     + viral_score, hook_score, repetition_ratio, etc.           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. UPLOAD (upload_hiphop_qdrant.py)                            │
│     Store in hiphop_viral collection                            │
│     Each vector has viral features as payload                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. SEARCH & LEARN                                              │
│     Find high-viral patterns                                    │
│     Extract what makes them work                                │
│     Feed into generation prompts                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Viral Features Extracted

Each track gets scored on:

| Feature | Description | Viral Correlation |
|---------|-------------|-------------------|
| `viral_score` | Overall 0-100 score | The target metric |
| `hook_score` | Repeated phrase count (2-5 word phrases appearing 3+ times) | **150x higher** in viral tracks |
| `repetition_ratio` | % of words that repeat | **3.1x higher** in viral tracks |
| `adlib_density` | "yeah", "skrt", "sheesh" per word | Energy indicator |
| `short_line_ratio` | Lines ≤6 words | Clip-able moments |
| `phonk_score` | Dark vocabulary match | Genre vibe |
| `first_line_punch` | Does opening line hit? (≤8 words) | TikTok scroll survival |
| `top_hooks` | Most repeated phrases | The actual hooks |

---

## Results: Viral Score Distribution

From our 4,832 hip hop tracks:

```
0-20:    4,132 (85.5%)  ← Most rap is NOT viral
20-40:     328 (6.8%)
40-60:     104 (2.2%)
60-80:      70 (1.4%)
80-100:    198 (4.1%)   ← THESE are the patterns we want
```

**Key Finding**: Only ~4% of tracks score 80+ viral. These are the patterns to extract and replicate.

---

## The Viral Hypothesis: "Loop-First Lyric Design"

Based on our analysis + TikTok research:

### Rule 1: First 8 Words Must SLAP
TikTok scroll = instant hook or death. No setup, no context, just impact.

### Rule 2: Contiguous Repetition
Stack repeats immediately, don't spread them out.
```
GOOD: "We up, we up, we up right now"
BAD:  "We up in the club... [4 lines later]... we up and ready"
```

### Rule 3: Short Punchy Lines (≤6 Words)
Target 70%+ short lines. Each line = potential clip moment.

### Rule 4: Ad-lib Density (3-5%)
Energy markers: "yeah", "sheesh", "let's go", "skrt"

### Rule 5: ONE Memorable Hook
Single phrase repeated 4+ times that loops in your head.

---

## Output Files

After running `embed_hiphop_viral.py`:

```
hiphop_embeddings/
├── embeddings.npy           # (4832, 384) numpy array
├── metadata.jsonl           # Track metadata + viral features
└── stats.json               # Viral score distribution analysis
```

---

## Integration with Creative Hub

The Qdrant collection `hiphop_viral` enables:

```typescript
// In your Next.js app
import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// Find high-viral patterns
const viralPatterns = await client.scroll("hiphop_viral", {
  filter: {
    must: [
      { key: "viral_score", range: { gte: 50 } }
    ]
  },
  limit: 100,
  with_payload: true,
});

// Extract hooks from top tracks
const topHooks = viralPatterns.points
  .flatMap(p => p.payload.top_hooks)
  .slice(0, 20);

// Use in generation prompt
const prompt = `Write viral hip hop lyrics with hooks like: ${topHooks.join(", ")}`;
```

---

## Data Sources

| Dataset | Tracks | Status |
|---------|--------|--------|
| [Cropinky/rap_lyrics_english](https://huggingface.co/datasets/Cropinky/rap_lyrics_english) | 1.18M | **CURRENT** (4,832 sampled) |
| [Spotify Million Song](https://huggingface.co/datasets/vishnupriyavr/spotify-million-song-dataset) | 1M | OLD - had ABBA garbage |
| [Genius Hip-Hop](https://kaggle.com/datasets/ceebloop/rap-lyrics-for-nlp) | 50K+ | Alternative option |

---

## Research Backing

### Our Data Analysis
- High viral (50+) vs low viral (<20):
  - Repetition ratio: 49.5% vs 15.9% (**3.1x**)
  - Hook score: 8.0 vs 0.05 (**150x**)

### TikTok Virality Research (2024-2025)
- 84% of Billboard Global 200 went viral on TikTok first
- Phonk: 31 BILLION TikTok views
- "Built for looping, built for visual editing, built for short-form content"

### Earworm Psychology
- Contiguous repetition creates strongest earworms
- Brain craves "predictive completion" - loops trigger dopamine

---

## Files in This Directory

| File | Purpose | Status |
|------|---------|--------|
| `embed_hiphop_viral.py` | Hip hop + viral feature extraction | **CURRENT** |
| `upload_hiphop_qdrant.py` | Upload to hiphop_viral collection | **CURRENT** |
| `embed_lyrics.py` | Generic lyrics embedding | Legacy |
| `cluster_lyrics.py` | K-means clustering | Legacy |
| `theme_classifier.py` | 12 hit theme classification | Legacy |
| `analyze_performance.py` | Billboard correlation | Legacy |
| `generation_optimizer.py` | Prompt building from patterns | Legacy |
| `upload_to_qdrant.py` | Upload to lyric_patterns | Legacy |

---

## Next Steps

1. **Wire hypothesis into generation prompts** - Use viral patterns in `/api/generate/music`
2. **Scale to 10K+ tracks** - More data = better patterns
3. **Add viral score validation** - Reject generated lyrics below threshold
4. **A/B test** - Compare viral-optimized vs generic generation

---

*"Hits are loops. The hook IS the song. Everything else is just waiting for the hook to come back."*
