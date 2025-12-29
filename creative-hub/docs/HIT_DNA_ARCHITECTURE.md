# HIT DNA Architecture
## The System That Learns What Makes Music Work

---

## THE INSIGHT

Everyone's making AI music tools. They all produce mid.

**Why?** Because they treat music generation like text generation - prompt in, audio out. No understanding of WHY certain songs dominate.

**The opportunity**: Build a system that actually UNDERSTANDS hit patterns at a deep level, and uses that understanding to guide generation.

---

## THE VISION

```
Traditional AI Music:
  Prompt → Black Box → Audio (hope it's good)

Hit DNA System:
  Prompt → Find Similar Hits → Extract Patterns →
  Inject Hit DNA → Generate → Validate Against Patterns →
  Learn From Engagement → Get Smarter
```

---

## WHAT IS "HIT DNA"?

Not metadata. Not tags. The actual ESSENCE of what makes songs work.

### Layer 1: Audio Fingerprint
```
- Tempo curve (not just BPM - how it CHANGES)
- Energy arc (quiet → loud → quiet moments)
- Frequency spectrum over time
- Harmonic progression patterns
- Rhythmic complexity score
- "Bounce" factor (groove quantification)
```

### Layer 2: Structural DNA
```
- Section lengths (intro, verse, hook ratios)
- Hook placement (when does it hit?)
- Build/drop patterns
- Repetition frequency (how often does the hook repeat?)
- Surprise factor (unexpected changes)
- "Earworm index" (melodic stickiness)
```

### Layer 3: Emotional Curve
```
- Tension/release mapping over time
- Emotional valence (positive/negative)
- Energy intensity
- Anticipation building
- Catharsis moments
```

### Layer 4: Production Signature
```
- 808 character (distortion level, sustain)
- Vocal treatment (reverb, delay, autotune amount)
- Stereo width over time
- Low-end power (sub presence)
- High-end sparkle
- Compression style
```

---

## THE ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    HIT DNA DATABASE                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Audio       │  │ Structural  │  │ Emotional   │         │
│  │ Embeddings  │  │ Patterns    │  │ Curves      │         │
│  │ (vectors)   │  │ (vectors)   │  │ (vectors)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         ↑                ↑                ↑                 │
│         └────────────────┴────────────────┘                 │
│                          │                                   │
│              ┌───────────┴───────────┐                      │
│              │   HIT ANALYZER        │                      │
│              │   (Extracts DNA)      │                      │
│              └───────────────────────┘                      │
│                          ↑                                   │
└──────────────────────────┼──────────────────────────────────┘
                           │
    ┌──────────────────────┴──────────────────────┐
    │                                              │
┌───┴────┐                                   ┌────┴─────┐
│ INGEST │                                   │ GENERATE │
│ HITS   │                                   │ TRACKS   │
└────────┘                                   └──────────┘
    │                                              │
    │  Spotify/YouTube hits                        │  User prompt
    │  User successful tracks                      │       ↓
    │  Chart data                            ┌─────┴──────────┐
    │       ↓                                │ PATTERN MATCHER │
    │  Extract features                      │ Find similar    │
    │  Chunk into sections                   │ hits, extract   │
    │  Generate embeddings                   │ their DNA       │
    │  Store in vector DB                    └────────┬────────┘
    │                                                  │
    │                                                  ↓
    │                                        ┌─────────────────┐
    │                                        │ PROMPT ENRICHER │
    │                                        │ Inject hit DNA  │
    │                                        │ into generation │
    │                                        └────────┬────────┘
    │                                                  │
    │                                                  ↓
    │                                        ┌─────────────────┐
    │                                        │ ELEVENLABS API  │
    │                                        │ Generate track  │
    │                                        └────────┬────────┘
    │                                                  │
    │                                                  ↓
    │                                        ┌─────────────────┐
    │                                        │ VALIDATOR       │
    │                                        │ Does it match   │
    │                                        │ hit patterns?   │
    │                                        └────────┬────────┘
    │                                                  │
    │         ┌────────────────────────────────────────┘
    │         │
    │         ↓
    │  ┌──────────────┐
    │  │ USER ENGAGES │ ←── Plays, shares, likes
    │  └──────┬───────┘
    │         │
    │         ↓
    │  ┌──────────────┐
    └──│ FEEDBACK     │ ←── What worked? Feed back into DB
       │ LOOP         │     Successful tracks = more training data
       └──────────────┘
```

---

## VECTOR DATABASE CHOICE

For music embeddings, we need:
- Fast similarity search
- Multiple vector types per item
- Metadata filtering
- Good free tier

### Options:

**Qdrant** (Recommended)
```
- 1GB free tier (Cloud)
- Self-host option (unlimited)
- Rust = blazing fast
- Multiple vectors per point
- Hybrid search (vector + filter)
- $25/mo for 4GB (if needed)
```

**Pinecone**
```
- Easy to use
- 100K vectors free
- Gets expensive fast ($70/mo)
- Limited filtering
```

**Weaviate**
```
- Hybrid search built-in
- Generous free tier
- More complex setup
- Great for text+vector
```

**Supabase pgvector**
```
- Postgres extension
- Combine with relational data
- Slower than dedicated vector DBs
- Good for simpler use cases
```

### Recommendation: **Qdrant Cloud**
- Free tier sufficient for MVP
- Self-host later for cost control
- Fast enough for real-time search
- Multiple vector support (audio + structural + emotional)

---

## AUDIO ANALYSIS PIPELINE

### Option 1: Librosa + Custom (Self-hosted)
```python
import librosa
import numpy as np

def extract_hit_dna(audio_path: str) -> dict:
    y, sr = librosa.load(audio_path)

    # Tempo and beat tracking
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)

    # Energy curve (RMS over time)
    rms = librosa.feature.rms(y=y)[0]

    # Spectral features
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)

    # Chroma (harmonic content)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)

    # MFCCs (timbral features - 20 dimensions)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)

    # Create embedding from features
    embedding = np.concatenate([
        [tempo],
        np.mean(rms),
        np.std(rms),  # Energy variance
        np.mean(spectral_centroid),
        np.mean(spectral_rolloff),
        np.mean(chroma, axis=1),  # 12 dims
        np.mean(mfccs, axis=1),   # 20 dims
    ])

    return {
        "embedding": embedding.tolist(),  # ~40 dimensions
        "tempo": float(tempo),
        "energy_curve": rms.tolist(),
        "sections": detect_sections(y, sr),
    }
```

### Option 2: Essentia (More Complete)
```python
import essentia.standard as es

def analyze_with_essentia(audio_path: str) -> dict:
    loader = es.MonoLoader(filename=audio_path)
    audio = loader()

    # High-level descriptors
    rhythm = es.RhythmExtractor2013()(audio)
    key, scale, strength = es.KeyExtractor()(audio)
    loudness = es.Loudness()(audio)
    danceability = es.Danceability()(audio)

    # More sophisticated embedding
    embedding_model = es.TensorflowPredictEffnetDiscogs()
    embedding = embedding_model(audio)

    return {
        "embedding": embedding,  # 128-dim learned embedding
        "bpm": rhythm[0],
        "key": key,
        "scale": scale,
        "danceability": danceability,
    }
```

### Option 3: Pre-trained Music Embeddings
```python
# Use models trained specifically for music understanding
# - CLAP (Contrastive Language-Audio Pretraining)
# - MusicGen's internal embeddings
# - OpenL3 embeddings

from transformers import ClapModel, ClapProcessor

def get_clap_embedding(audio_path: str):
    model = ClapModel.from_pretrained("laion/clap-htsat-fused")
    processor = ClapProcessor.from_pretrained("laion/clap-htsat-fused")

    audio, sr = librosa.load(audio_path, sr=48000)
    inputs = processor(audios=audio, return_tensors="pt", sampling_rate=48000)

    with torch.no_grad():
        embedding = model.get_audio_features(**inputs)

    return embedding.numpy()  # 512-dim embedding
```

---

## CHUNKING STRATEGY

Don't just analyze whole songs. Understand the PARTS.

```
Song
├── Intro (0-15s)
│   └── Embedding + "intro patterns" from hits
├── Verse 1 (15-45s)
│   └── Embedding + "verse energy curve" patterns
├── Pre-Hook (45-55s)
│   └── Embedding + "tension building" patterns
├── Hook (55-85s)
│   └── Embedding + "hook catchiness" patterns
├── Verse 2 (85-115s)
│   └── ...
└── Outro (175-195s)
    └── ...
```

### Section Detection
```python
def detect_sections(y, sr):
    # Use librosa's structure analysis
    bounds = librosa.segment.agglomerative(y, k=8)  # Find ~8 sections
    bound_times = librosa.frames_to_time(bounds, sr=sr)

    sections = []
    for i in range(len(bound_times) - 1):
        section_audio = y[int(bound_times[i]*sr):int(bound_times[i+1]*sr)]
        sections.append({
            "start": bound_times[i],
            "end": bound_times[i+1],
            "duration": bound_times[i+1] - bound_times[i],
            "embedding": extract_section_embedding(section_audio, sr),
            "energy": np.mean(librosa.feature.rms(y=section_audio)),
        })

    return sections
```

---

## THE GENERATION FLOW

### Step 1: User Request
```
User: "Make me a track like 'Not Like Us' energy but with K-phonk elements"
```

### Step 2: Pattern Matching
```python
# Find similar tracks in vector DB
similar_tracks = qdrant.search(
    collection="hit_songs",
    query_vector=encode_text_query("Not Like Us energy K-phonk"),
    limit=5,
    filter={"genre": ["phonk", "hip-hop"]}
)

# Extract their DNA patterns
patterns = []
for track in similar_tracks:
    patterns.append({
        "hook_placement": track.payload["hook_timing"],
        "energy_curve": track.payload["energy_curve"],
        "section_structure": track.payload["sections"],
        "production_style": track.payload["production_embedding"],
    })
```

### Step 3: Prompt Enrichment
```python
def enrich_prompt_with_dna(user_prompt: str, patterns: list) -> str:
    # Analyze patterns to find commonalities
    avg_bpm = np.mean([p["bpm"] for p in patterns])
    common_structure = most_common([p["section_structure"] for p in patterns])
    energy_template = average_energy_curve(patterns)

    enriched_prompt = f"""
    {user_prompt}

    Based on analysis of similar hit songs:
    - Target BPM: {avg_bpm}
    - Structure: {common_structure}
    - Energy arc: Start at {energy_template[0]}, peak at {energy_template['peak_time']},
      with {energy_template['num_drops']} drops
    - Hook should hit at {patterns[0]['hook_placement']} seconds
    - Production style: {describe_production(patterns)}

    Make the hook repeat {avg_hook_repeats} times.
    Build tension before each drop.
    """

    return enriched_prompt
```

### Step 4: Generate & Validate
```python
# Generate with enriched prompt
track = elevenlabs.music.generate(enriched_prompt)

# Extract DNA from generated track
generated_dna = extract_hit_dna(track.audio)

# Compare to target patterns
similarity_score = compare_dna(generated_dna, target_patterns)

if similarity_score < 0.7:
    # Regenerate with adjusted parameters
    ...
```

---

## THE LEARNING LOOP

This is the moat. Every user interaction makes the system smarter.

```python
# When user engages with a track
async def on_track_engagement(track_id: str, engagement_type: str):
    track = await get_track(track_id)

    # Calculate engagement score
    engagement_score = calculate_engagement({
        "plays": track.plays,
        "completion_rate": track.avg_completion,
        "shares": track.shares,
        "likes": track.likes,
    })

    if engagement_score > THRESHOLD:
        # This track "worked" - learn from it

        # 1. Add to hit database
        await add_to_hits_db(track)

        # 2. Update pattern weights
        await update_pattern_weights(
            patterns=track.generation_patterns,
            success_score=engagement_score
        )

        # 3. Reinforce similar generations
        await boost_similar_patterns(track.dna_embedding)
```

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1)
- Set up Qdrant Cloud
- Build audio analysis pipeline (Librosa)
- Seed database with 100 known hits
- Basic pattern matching

### Phase 2: Generation Enhancement (Week 2)
- Prompt enrichment system
- Section-aware generation
- Basic validation loop

### Phase 3: Learning Loop (Week 3)
- Engagement tracking
- Feedback integration
- Pattern weight updates

### Phase 4: Intelligence (Ongoing)
- More sophisticated embeddings
- Multi-modal understanding (lyrics + audio)
- Predictive hit scoring
- Auto-improvement

---

## COSTS

| Component | Free Tier | Paid |
|-----------|-----------|------|
| Qdrant Cloud | 1GB vectors | $25/mo |
| Audio Analysis | Self-hosted | CPU time |
| Storage | Vercel Blob | $0.15/GB |
| ElevenLabs | Per generation | Existing |

**Estimated additional cost**: $0-25/mo depending on scale

---

## THE MOAT

After 6 months of operation:
- 10,000+ analyzed hit songs
- 50,000+ user-generated tracks with engagement data
- Patterns that ACTUALLY predict what works
- Every generation informed by real success data

**No one else has this.**

They have prompts. We have UNDERSTANDING.

---

*"The goal isn't to generate music. It's to generate HITS. And hits have patterns. Find the patterns, own the game."*
