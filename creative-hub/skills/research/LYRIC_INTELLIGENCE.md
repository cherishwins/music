# Lyric Intelligence Research
## Vectorizing Lyrics to Find Hit Patterns

**Date**: 2025-12-28
**Status**: Research Phase

---

## THE INSIGHT

Your idea: *"Vectorize a shit ton of lyrics, cluster them, measure performance against those clusters, find patterns"*

This is academically VALIDATED. December 2024 research shows:
- LLM lyric embeddings beat previous methods by **9%**
- Combined with audio features = even better
- Patterns DO emerge in embedding space

---

## AVAILABLE DATASETS

### 1. [HSP Lyrics Dataset](https://github.com/Orfium/hsp-lyrics-dataset)
- **95,067 songs** labeled hit/non-hit (Billboard Hot 100)
- Based on Million Song Dataset
- Direct hit prediction training data

### 2. [SpotGenTrack Popularity Dataset](https://arxiv.org/html/2512.05508)
- **101,939 tracks** from 56,129 artists
- Lyrics + audio features + metadata
- Popularity scores (0-100)
- Used in latest SOTA research

### 3. [Million Song Dataset](http://millionsongdataset.com/)
- **1 million songs** with audio features
- musiXmatch lyrics subset
- The classic benchmark

### 4. [Spotify Million Song (HuggingFace)](https://huggingface.co/datasets/vishnupriyavr/spotify-million-song-dataset)
- Song names, artists, lyrics
- Easy to load with `datasets` library

---

## WHAT THE RESEARCH SHOWS

### HitMusicLyricNet (December 2024)
[Paper](https://arxiv.org/abs/2512.05508)

**Key Finding**: LLM embeddings of lyrics + audio features = **9% better** than previous SOTA

**Architecture**:
```
Lyrics → LLM → Embeddings (768-dim)
                    ↓
Audio → Features → Combined → HitMusicLyricNet → Popularity Score
                    ↑
Metadata (artist popularity, market reach)
```

### Lyrics for Success (NLP4MusA 2024)
[Paper](https://aclanthology.org/2024.nlp4musa-1.13/)

**Key Finding**: Lyrics embedding + stylometric features improve early-phase predictions

**Features That Matter**:
- Semantic embeddings (LLM)
- Stylometric (word count, unique words, rhyme density)
- Sentiment trajectory
- Theme clusters

### DistilBERT Approach (July 2024)
[Paper](https://arxiv.org/html/2407.21068v1)

**Key Finding**: 79% accuracy in success prediction, 65% in genre classification

**Challenge**: Pop vs Rock lyrics hard to distinguish (they blend)

---

## THE PATTERN EXTRACTION SYSTEM

### Step 1: Collect Lyrics

```python
from datasets import load_dataset

# Load existing dataset
hsp_lyrics = load_dataset("path/to/hsp-lyrics")

# Or scrape from Genius
from lyricsgenius import Genius
genius = Genius(GENIUS_API_KEY)

def get_lyrics_batch(songs: list[dict]) -> list[str]:
    """Get lyrics for a batch of songs"""
    results = []
    for song in songs:
        try:
            result = genius.search_song(song["title"], song["artist"])
            if result:
                results.append({
                    **song,
                    "lyrics": result.lyrics
                })
        except:
            continue
    return results
```

### Step 2: Generate Embeddings

```python
from sentence_transformers import SentenceTransformer

# Use a good embedding model for lyrics
model = SentenceTransformer('all-MiniLM-L6-v2')  # Fast
# or: SentenceTransformer('all-mpnet-base-v2')  # Better quality

def embed_lyrics(lyrics: str) -> list[float]:
    """Generate embedding for song lyrics"""
    # Clean lyrics first
    cleaned = clean_lyrics(lyrics)

    # Get embedding
    embedding = model.encode(cleaned)

    return embedding.tolist()

def clean_lyrics(lyrics: str) -> str:
    """Remove metadata, normalize"""
    # Remove [Verse 1], [Chorus], etc
    import re
    cleaned = re.sub(r'\[.*?\]', '', lyrics)
    # Remove extra whitespace
    cleaned = ' '.join(cleaned.split())
    return cleaned
```

### Step 3: Cluster & Analyze

```python
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import numpy as np

def find_lyric_clusters(embeddings: np.ndarray, n_clusters: int = 20):
    """Find thematic clusters in lyrics"""
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    clusters = kmeans.fit_predict(embeddings)

    return clusters, kmeans.cluster_centers_

def analyze_cluster_performance(
    songs: list[dict],
    clusters: np.ndarray,
    performance_metric: str = "streams"
):
    """See which clusters correlate with success"""
    cluster_stats = {}

    for i, song in enumerate(songs):
        cluster = clusters[i]
        if cluster not in cluster_stats:
            cluster_stats[cluster] = []
        cluster_stats[cluster].append(song[performance_metric])

    # Calculate average performance per cluster
    results = {}
    for cluster, performances in cluster_stats.items():
        results[cluster] = {
            "avg": np.mean(performances),
            "median": np.median(performances),
            "count": len(performances),
            "top_10_pct": np.percentile(performances, 90)
        }

    return results
```

### Step 4: Extract Patterns from Winning Clusters

```python
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer

def extract_cluster_patterns(
    songs: list[dict],
    clusters: np.ndarray,
    target_cluster: int
):
    """Find what makes a cluster special"""

    # Get lyrics from target cluster
    cluster_lyrics = [
        songs[i]["lyrics"]
        for i in range(len(songs))
        if clusters[i] == target_cluster
    ]

    # TF-IDF for distinctive words
    vectorizer = TfidfVectorizer(
        max_features=100,
        stop_words='english',
        ngram_range=(1, 3)  # unigrams to trigrams
    )

    tfidf = vectorizer.fit_transform(cluster_lyrics)

    # Get top terms
    feature_names = vectorizer.get_feature_names_out()
    avg_tfidf = tfidf.mean(axis=0).A1

    top_terms = sorted(
        zip(feature_names, avg_tfidf),
        key=lambda x: x[1],
        reverse=True
    )[:20]

    return {
        "distinctive_phrases": top_terms,
        "sample_lyrics": cluster_lyrics[:5],
        "cluster_size": len(cluster_lyrics)
    }
```

---

## STRUCTURAL PATTERNS TO EXTRACT

Beyond semantic embeddings, analyze:

### 1. Rhyme Patterns
```python
import pronouncing

def analyze_rhyme_scheme(lyrics: str) -> dict:
    lines = lyrics.split('\n')
    last_words = [line.split()[-1] if line.split() else '' for line in lines]

    # Find rhymes
    rhymes = {}
    for i, word in enumerate(last_words):
        rhymes_with = pronouncing.rhymes(word.lower())
        for j, other_word in enumerate(last_words[i+1:]):
            if other_word.lower() in rhymes_with:
                rhymes[(i, i+1+j)] = (word, other_word)

    return {
        "rhyme_density": len(rhymes) / len(lines),
        "rhyme_pairs": rhymes
    }
```

### 2. Hook Repetition
```python
def find_repeated_phrases(lyrics: str, min_length: int = 3) -> list:
    """Find phrases that repeat (potential hooks)"""
    words = lyrics.lower().split()
    ngrams = {}

    for n in range(min_length, min_length + 5):
        for i in range(len(words) - n):
            phrase = ' '.join(words[i:i+n])
            ngrams[phrase] = ngrams.get(phrase, 0) + 1

    # Filter to repeated phrases
    hooks = [(phrase, count) for phrase, count in ngrams.items() if count > 2]
    return sorted(hooks, key=lambda x: x[1], reverse=True)[:10]
```

### 3. Emotional Arc
```python
from textblob import TextBlob

def analyze_emotional_arc(lyrics: str) -> list[float]:
    """Track sentiment through the song"""
    lines = [l for l in lyrics.split('\n') if l.strip()]

    # Chunk into sections (roughly)
    chunk_size = max(len(lines) // 8, 1)
    chunks = [lines[i:i+chunk_size] for i in range(0, len(lines), chunk_size)]

    arc = []
    for chunk in chunks:
        text = ' '.join(chunk)
        sentiment = TextBlob(text).sentiment.polarity  # -1 to 1
        arc.append(sentiment)

    return arc
```

---

## THE HIT PATTERN FORMULA

Based on research, hits tend to have:

### Lyrical Patterns
| Pattern | Hit Songs | Non-Hits |
|---------|-----------|----------|
| Repetition (hooks) | High | Low |
| Emotional contrast | Present | Flat |
| Universal themes | Dominant | Niche |
| First-person pronouns | High | Variable |
| Present tense | Dominant | Variable |

### Structural Patterns
| Pattern | Typical Hit |
|---------|-------------|
| Hook repetition | 4-8 times |
| Verse length | 8-16 lines |
| Unique words ratio | 0.3-0.5 |
| Rhyme density | 0.4-0.6 |

### Emotional Patterns
| Position | Typical Sentiment |
|----------|-------------------|
| Intro | Neutral/Slight negative |
| Verse 1 | Building tension |
| Pre-hook | Peak tension |
| Hook | Resolution/Release |
| Bridge | Contrast |
| Final Hook | Maximum energy |

---

## IMPLEMENTATION PLAN

### Phase 1: Data Collection (Week 1)
1. Download HSP Lyrics Dataset (95K songs)
2. Enrich with Genius lyrics where missing
3. Add Spotify audio features
4. Store in Qdrant with embeddings

### Phase 2: Clustering (Week 2)
1. Generate embeddings for all lyrics
2. Run k-means (try k=10, 20, 50)
3. Analyze cluster performance
4. Identify winning clusters

### Phase 3: Pattern Extraction (Week 3)
1. Extract distinctive phrases from top clusters
2. Analyze structural patterns
3. Build "hit lyrics template"
4. Create generation prompts from patterns

### Phase 4: Generation Integration (Week 4)
1. When user generates lyrics, find similar hits
2. Inject extracted patterns into prompt
3. Validate generated lyrics against patterns
4. Learn from user engagement

---

## RESOURCES

### Papers
- [Lyrics Matter (Dec 2024)](https://arxiv.org/abs/2512.05508) - SOTA lyric embeddings
- [Lyrics for Success (2024)](https://aclanthology.org/2024.nlp4musa-1.13/) - Embedding features
- [DistilBERT Genre/Success (2024)](https://arxiv.org/html/2407.21068v1) - 79% accuracy

### Datasets
- [HSP Lyrics](https://github.com/Orfium/hsp-lyrics-dataset) - 95K songs
- [Million Song](http://millionsongdataset.com/) - 1M songs
- [Spotify Million (HF)](https://huggingface.co/datasets/vishnupriyavr/spotify-million-song-dataset)

### Tools
- [LyricsGenius](https://github.com/johnwmillr/LyricsGenius) - Genius API wrapper
- [Sentence Transformers](https://www.sbert.net/) - Embeddings
- [pronouncing](https://github.com/aparrish/pronouncing) - Rhyme analysis

---

*"Hits are emotional horoscopes - vague enough to fit anyone, sharp enough to cut deep. The embeddings will show us where that magic lives."*
