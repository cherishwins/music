# Lyric Intelligence Pipeline

Vectorization → Clustering → Pattern Discovery → Generation Optimization

*"The patterns exist. We're using them to generate."*

---

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Option 1: Use HuggingFace dataset
python embed_lyrics.py --hf-dataset vishnupriyavr/spotify-million-song-dataset --max-samples 10000

# Option 2: Use your own JSONL
python embed_lyrics.py --input lyrics.jsonl

# Cluster and analyze
python cluster_lyrics.py --input ./lyric_embeddings --clusters 20

# Classify by 12 proven themes
python theme_classifier.py --corpus ./lyric_embeddings

# If you have performance data (Billboard, streams, etc.)
python analyze_performance.py --input ./lyric_embeddings --performance billboard.csv

# Upload to Qdrant (needs QDRANT_URL and QDRANT_API_KEY)
python upload_to_qdrant.py --input ./lyric_embeddings

# Generate optimized prompts
python generation_optimizer.py --patterns ./lyric_embeddings --theme aspiration --region KR

# Generate full prompt library
python generation_optimizer.py --patterns ./lyric_embeddings --library
```

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  1. EMBED                                                        │
│     Lyrics → Sentence Transformer → 384-dim vectors             │
│     embed_lyrics.py                                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. CLUSTER                                                      │
│     K-means → Find thematic groups                              │
│     Extract distinctive terms per cluster                        │
│     cluster_lyrics.py                                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. CLASSIFY                                                     │
│     Map to 12 proven hit themes (73.4% prediction accuracy)      │
│     theme_classifier.py                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. CORRELATE (optional)                                         │
│     Match with Billboard/streaming performance                   │
│     Find which clusters = hits                                   │
│     analyze_performance.py                                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. GENERATE                                                     │
│     Build prompts from winning patterns                          │
│     Theme × Region = Optimized prompt                           │
│     generation_optimizer.py                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. STORE                                                        │
│     Upload to Qdrant for semantic search                        │
│     "Find lyrics similar to X"                                  │
│     upload_to_qdrant.py                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## The 12 Proven Hit Themes

From NC State research (50 years of Billboard #1s, 73.4% prediction accuracy):

### Primary (Strong Predictors)
| Theme | Peak Era | Description |
|-------|----------|-------------|
| **Loss** | 1980s | Gone, empty, alone |
| **Desire** | All decades | Want, need, crave |
| **Aspiration** | Economic downturns | Rise, grind, throne |
| **Breakup** | Always works | Left me, tears, hurt |
| **Pain** | 2000s+ | Broken, numb, dying |
| **Inspiration** | Social movements | Believe, fight, overcome |

### Secondary (Contextual)
| Theme | Peak Era | Description |
|-------|----------|-------------|
| **Nostalgia** | Uncertainty | Remember, back then |
| **Rebellion** | Youth markets | Fuck the system |
| **Cynicism** | 2020s (50%!) | Fake, cap, don't care |
| **Desperation** | Post-9/11 | Need you, last chance |
| **Escapism** | Pre-crisis | Fly away, paradise |
| **Confusion** | Economic uncertainty | Don't know, lost |

**2020s Zeitgeist**: Cynicism dominates (50% of hits). Pain and escapism strong.

---

## Regional Optimization

| Region | Dominant Themes | Style |
|--------|-----------------|-------|
| **US** | Pain, aspiration, cynicism | Direct, slang-heavy |
| **UK** | Melancholy, cynicism, irony | Understated, witty |
| **KR** | Aspiration, love, pain | Poetic, metaphorical, Han (한) |
| **BR** | Desire, party, social | Rhythmic, celebratory |
| **MX** | Love, betrayal, party | Passionate, dramatic |

---

## Output Files

After running the pipeline:

```
lyric_embeddings/
├── embeddings.npy           # (N, 384) numpy array
├── metadata.jsonl           # Song metadata
├── stats.json               # Dataset statistics
├── cluster_labels.npy       # Cluster assignments
├── cluster_analysis.json    # Distinctive terms per cluster
├── pca_visualization.json   # 2D coords for plotting
├── theme_classification.json # Theme scores per song
├── hit_patterns.json        # Patterns from top performers
├── hit_prompt_templates.txt # Ready-to-use prompts
└── prompt_library.json      # All theme × region combos
```

---

## Integration with Creative Hub

The Qdrant collection `lyric_patterns` enables:

```typescript
// In your Next.js app
import { qdrant } from "@/lib/vectors";

// Find lyrics similar to a description
const similar = await qdrant.search("lyric_patterns", {
  vector: textEmbedding,  // From sentence-transformers
  limit: 10,
  filter: {
    must: [{ key: "cluster", match: { value: 5 } }]  // Only cluster 5
  }
});

// Use patterns in generation
const patterns = similar.map(s => s.payload.cluster_terms).flat();
const prompt = `Write lyrics with these winning elements: ${patterns.join(", ")}`;
```

---

## Data Sources

| Dataset | Songs | Best For |
|---------|-------|----------|
| [Spotify Million Song](https://huggingface.co/datasets/vishnupriyavr/spotify-million-song-dataset) | 1M | General training |
| [HSP Lyrics](https://github.com/Orfium/hsp-lyrics-dataset) | 95K | Hit prediction (labeled) |
| [Genius Hip-Hop](https://kaggle.com/datasets/ceebloop/rap-lyrics-for-nlp) | 50K+ | Hip-hop specific |
| Your own lyrics | ? | Competitive moat |

---

## The Moat

Everyone can:
- Access the same datasets
- Use the same embedding models
- Generate with the same APIs

**We have:**
1. **Our performance data** - What we generate, how it performs
2. **Our regional insights** - Cross-cultural patterns we discover
3. **Our feedback loop** - Continuous learning from deployment
4. **Our timing intelligence** - Themes correlated with current events

The value compounds:
```
Generate 1,000 songs → Learn 100 patterns →
Generate 10,000 songs → Learn 1,000 patterns →
Generate 100,000 songs → KNOW WHAT WORKS EVERYWHERE
```

---

*"The patterns are the map. The feedback loop is the territory."*
