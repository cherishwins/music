# Development Roadmap - ThreadToHitRemix

**Purpose:** Prioritized task list for continuing development
**Last Updated:** 2025-11-15

---

## Critical Path (Must Fix Before v1.0)

### 🔴 P0 - Broken Features (Ship Blockers)

#### Task 1.1: Fix Pitch Correction or Remove from Config
**Status:** ⚠️ Configured but not implemented
**Location:** scripts/vocal_enhancer.py:84, configs/pipeline.yaml:32
**Estimated Effort:** 2-4 hours (implement) OR 5 minutes (remove)
**Blocker:** Users will enable this and get warning messages

**Implementation Path:**
```python
# File: scripts/vocal_enhancer.py
# Replace line 84 stub with:

if self.config.get("pitch_correction", False):
    target_key = self.config.get("target_key", "auto")

    # Auto-detect key if not specified
    if target_key == "auto":
        target_key = detected_key  # From PYIN detection

    # Calculate semitone shift needed
    semitone_shift = calculate_key_distance(detected_key, target_key)

    # Apply pitch correction
    audio = librosa.effects.pitch_shift(
        y=audio,
        sr=sr,
        n_steps=semitone_shift,
        bins_per_octave=12
    )

    logger.info(f"Pitch corrected: {detected_key} → {target_key} ({semitone_shift:+.1f} semitones)")
```

**Helper Function Needed:**
```python
def calculate_key_distance(from_key: str, to_key: str) -> float:
    """Calculate semitone distance between two musical keys."""
    # Map keys to semitone offsets from C
    key_map = {
        'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
        'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
        'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
        # Minor keys (relative to major)
        'Am': 9, 'A#m': 10, 'Bbm': 10, 'Bm': 11, 'Cm': 0,
        'C#m': 1, 'Dm': 2, 'D#m': 3, 'Ebm': 3, 'Em': 4,
        'Fm': 5, 'F#m': 6, 'Gm': 7, 'G#m': 8, 'Abm': 8,
    }

    from_offset = key_map.get(from_key, 0)
    to_offset = key_map.get(to_key, 0)

    # Calculate shortest distance (handle wraparound)
    distance = (to_offset - from_offset) % 12
    if distance > 6:
        distance -= 12

    return distance
```

**OR Removal Path:**
```yaml
# File: configs/pipeline.yaml
# Delete lines 32-33:
# vocals:
#   pitch_correction: true  # ← DELETE THIS
#   target_key: "auto"      # ← DELETE THIS
```

**Recommendation:** Implement it. Pitch correction is valuable for non-professional vocalists.

---

#### Task 1.2: Fix Formant Shift or Remove from Config
**Status:** ⚠️ Configured but not implemented
**Location:** scripts/vocal_enhancer.py:90, configs/pipeline.yaml:37
**Estimated Effort:** 6-10 hours (implement) OR 5 minutes (remove)
**Blocker:** Users will enable this and get warning messages

**Implementation Note:**
Formant shifting is COMPLEX. It requires:
- Phase vocoder analysis
- Spectral envelope extraction
- Formant peak detection
- Frequency-domain warping
- Phase coherent resynthesis

**Recommended Libraries:**
- `parselmouth` (Praat Python wrapper) - easiest
- `psola` (Pitch Synchronous Overlap-Add) - good quality
- `pyrubberband` (Rubber Band library) - best quality, requires C++ dependency

**Simple Implementation (parselmouth):**
```python
# Install: pip install praat-parselmouth
import parselmouth

if self.config.get("formant_shift", 0.0) != 0.0:
    shift_semitones = self.config["formant_shift"]

    # Convert numpy array to Parselmouth Sound
    sound = parselmouth.Sound(audio, sampling_frequency=sr)

    # Change formants using Praat's algorithm
    formant_shift_ratio = 2 ** (shift_semitones / 12)  # Semitones to ratio

    manipulated = parselmouth.praat.call(
        sound, "Change gender",
        75,    # Min pitch (Hz)
        600,   # Max pitch (Hz)
        formant_shift_ratio,  # Formant shift ratio
        0.0,   # Pitch median (0 = no change)
        1.0,   # Pitch range (1.0 = no change)
        1.0    # Duration (1.0 = no change)
    )

    audio = manipulated.values[0]  # Back to numpy
    logger.info(f"Formants shifted by {shift_semitones:+.1f} semitones")
```

**Recommendation:** Remove from config unless you have 1-2 days to implement properly. Most users won't need formant shifting.

---

#### Task 1.3: Fix RVC Model Path Issue
**Status:** 🐛 Likely broken
**Location:** configs/pipeline.yaml:8
**Issue:** Config references `models/neffex_placeholder.wav` but RVC expects .pth checkpoint
**Estimated Effort:** 30 minutes

**Current Config:**
```yaml
voice_model_path: "models/neffex_placeholder.wav"  # ← WRONG FILE TYPE
```

**Fix:**
1. Check if models/ directory has actual .pth files
2. Update config to point to real checkpoint:
   ```yaml
   voice_model_path: "models/neffex_voice.pth"
   ```
3. Add validation in voice_converter.py:
   ```python
   if not voice_model_path.endswith(('.pth', '.pt')):
       raise ValueError(f"RVC model must be .pth file, got: {voice_model_path}")
   ```

**Alternative:** If placeholder is intentional, update setup.py to actually download/create a .pth file instead of .wav.

---

### 🟡 P1 - User Experience Blockers

#### Task 2.1: Add Example Files to Repository
**Status:** 📝 Missing documentation artifacts
**Estimated Effort:** 1 hour
**Impact:** New users can't test the pipeline without creating their own inputs

**Checklist:**
- [ ] Create `data/prompts/sample_thread.txt` with compelling example thread
  - Topic: Overcoming creative block, career pivot, fitness journey
  - Length: 300-500 words
  - Emotional arc: struggle → breakthrough → triumph

- [ ] Create `inputs/threads/example_motivational.txt` (copy of above)

- [ ] Add example vocal recording:
  - Record 30-second dry vocal (no effects)
  - Save as `inputs/voice/example_take.wav`
  - Include in .gitignore exceptions OR provide download link in README

- [ ] Create `outputs_examples/` directory (not gitignored)
  - Include example output files from full pipeline run
  - README.md explaining each file
  - Comparison of raw vs enhanced vs rvc modes

**Sample Thread Content:**
```
Title: From Burnout to Breakthrough - My 6 Month Journey

Six months ago I was completely burned out. Working 80 hour weeks,
my relationships were failing, health declining. I felt like I was
just going through the motions. No passion, no purpose.

Then I hit rock bottom. Got passed over for a promotion I'd been
killing myself for. That night I made a decision - something had
to change.

Started small. Just 20 minutes of exercise each morning. Then
began saying no to projects that drained me. Reconnected with old
friends. Picked up guitar again after 10 years.

The transformation wasn't instant. Some days I still struggled.
But slowly, the fog lifted. I felt alive again. Creative again.

Last month I launched my own thing. Terrifying and exhilarating.
I'm making half the money but I've never been happier. This is
just the beginning.

To anyone out there feeling stuck - you're one decision away from
a different life. Take that first step. Future you will thank you.
```

---

#### Task 2.2: Better Error Messages and Validation
**Status:** 😵 Cryptic failures
**Estimated Effort:** 2-3 hours
**Impact:** Users get stuck and abandon the project

**Implementation Checklist:**

```python
# File: main.py - Add at startup

def validate_environment():
    """Pre-flight checks before running pipeline."""

    # Check 1: CUDA availability
    import torch
    if not torch.cuda.is_available():
        print("⚠️  WARNING: CUDA not available. MusicGen will be VERY slow.")
        print("   Install CUDA toolkit: https://developer.nvidia.com/cuda-downloads")
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)
    else:
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / 1e9
        print(f"✓ GPU detected: {gpu_name} ({vram_gb:.1f} GB VRAM)")

    # Check 2: Anthropic API key
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("❌ ERROR: ANTHROPIC_API_KEY not found in environment")
        print("   1. Create .env file in project root")
        print("   2. Add line: ANTHROPIC_API_KEY=sk-ant-...")
        print("   3. Get key from: https://console.anthropic.com/")
        sys.exit(1)
    else:
        key_preview = os.environ["ANTHROPIC_API_KEY"][:12] + "..."
        print(f"✓ API key loaded: {key_preview}")

    # Check 3: FFmpeg availability
    import shutil
    if not shutil.which("ffmpeg"):
        print("⚠️  WARNING: FFmpeg not found. Audio codecs may fail.")
        print("   Install: sudo apt install ffmpeg  (Linux)")
        print("           brew install ffmpeg      (Mac)")

    # Check 4: Output directory
    os.makedirs("outputs", exist_ok=True)
    print("✓ Output directory ready: outputs/")

    # Check 5: RVC directory (if using RVC mode)
    # ... etc
```

**Add GPU OOM Handler:**
```python
# File: scripts/beat_maker.py

try:
    wav = model.generate([prompt])
except RuntimeError as e:
    if "out of memory" in str(e).lower():
        print("\n❌ GPU OUT OF MEMORY")
        print("   Current preset:", self.preset)
        print("   Try these fixes:")
        print("   1. Use smaller preset: --config configs/fast.yaml")
        print("   2. Reduce duration: edit beat_duration_seconds in config")
        print("   3. Close other GPU programs")
        print(f"   4. Your GPU: {torch.cuda.get_device_name(0)}")
        raise
    else:
        raise
```

---

#### Task 2.3: Add Progress Indicators
**Status:** 🔇 Silent execution
**Estimated Effort:** 1-2 hours
**Impact:** Users don't know if pipeline is frozen or working

**Implementation:**
```python
# Install: pip install tqdm
from tqdm import tqdm
import time

# File: scripts/workflow.py

def run(self, thread_text: str, voice_path: str):
    """Run full pipeline with progress tracking."""

    stages = [
        ("Extracting story", self._extract_story),
        ("Generating lyrics", self._generate_lyrics),
        ("Creating beat", self._create_beat),
        ("Enhancing vocals", self._enhance_vocals),
        ("Converting voice", self._convert_voice),  # Optional
        ("Mixing stems", self._mix_stems),
        ("Mastering track", self._master_track),
        ("Predicting hit potential", self._predict_hit),
    ]

    with tqdm(total=len(stages), desc="Pipeline Progress") as pbar:
        for stage_name, stage_func in stages:
            pbar.set_description(stage_name)
            result = stage_func()
            pbar.update(1)

    print("\n✓ Pipeline complete!")
    print(f"  Final mix: {self.output_path}")
```

---

## Feature Development (v1.1+)

### 🟢 P2 - High Value Additions

#### Task 3.1: Validate Hit Predictor with Real Data
**Status:** 🎯 Unvalidated synthetic model
**Estimated Effort:** 6-10 hours
**Impact:** Makes hit prediction actually useful

**Data Collection:**
```python
# New file: scripts/train_hit_predictor.py

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import pandas as pd

def collect_spotify_features(playlist_uris: list) -> pd.DataFrame:
    """
    Collect audio features from Spotify playlists.

    Args:
        playlist_uris: List of Spotify playlist URIs
            - Top 200 Global: spotify:playlist:37i9dQZEVXbMDoHDwVN2tF
            - Viral 50: spotify:playlist:37i9dQZEVXbLiRSasKsNU9
            - Non-hits: Create custom playlist of < 1M stream songs
    """
    sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials())

    tracks = []
    for uri in playlist_uris:
        results = sp.playlist_tracks(uri)
        tracks.extend(results['items'])

    features = []
    for track in tracks:
        audio_features = sp.audio_features(track['track']['id'])[0]
        features.append({
            'track_name': track['track']['name'],
            'artist': track['track']['artists'][0]['name'],
            'tempo': audio_features['tempo'],
            'energy': audio_features['energy'],
            'danceability': audio_features['danceability'],
            'valence': audio_features['valence'],
            'loudness': audio_features['loudness'],
            'is_hit': True  # Label based on playlist source
        })

    return pd.DataFrame(features)

# Usage:
# hit_data = collect_spotify_features(['spotify:playlist:37i9dQZEVXbMDoHDwVN2tF'])
# non_hit_data = collect_spotify_features(['spotify:playlist:YOUR_NON_HIT_PLAYLIST'])
# combined = pd.concat([hit_data, non_hit_data])
# combined.to_csv('data/training/spotify_features.csv')
```

**Retrain Model:**
```python
# Update scripts/hit_predictor.py

def train_on_real_data(csv_path: str):
    """Train classifier on Spotify audio features."""
    df = pd.read_csv(csv_path)

    X = df[['tempo', 'energy', 'danceability', 'valence']]
    y = df['is_hit']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    print(f"Validation accuracy: {accuracy:.2%}")

    # Save model
    import joblib
    joblib.dump(model, 'models/hit_predictor_validated.pkl')
```

**Prerequisites:**
- Spotify Developer account (free)
- Client ID + Secret for API access
- ~500-1000 labeled songs (hits vs non-hits)

---

#### Task 3.2: Advanced Mastering Pipeline
**Status:** 🎚️ Basic LUFS only
**Estimated Effort:** 8-12 hours
**Impact:** Professional-quality output

**New File:** `scripts/mastering.py`

```python
from pedalboard import (
    Pedalboard, Compressor, Limiter, HighShelfFilter,
    LowShelfFilter, Gain, Reverb
)
import numpy as np

class Mastering:
    """Advanced mastering chain for streaming platforms."""

    def __init__(self, config: dict):
        self.config = config
        self.sample_rate = config.get("sample_rate", 44100)

        # Build mastering chain
        self.board = Pedalboard([
            # Stage 1: Multiband compression simulation
            Compressor(
                threshold_db=-18,
                ratio=3.0,
                attack_ms=20,
                release_ms=100
            ),

            # Stage 2: Tonal shaping
            LowShelfFilter(cutoff_frequency_hz=100, gain_db=1.5),  # Warmth
            HighShelfFilter(cutoff_frequency_hz=8000, gain_db=2.0),  # Air

            # Stage 3: Glue reverb (optional)
            Reverb(
                room_size=0.15,
                damping=0.5,
                wet_level=0.05,
                dry_level=0.95
            ),

            # Stage 4: Final limiting
            Limiter(threshold_db=-0.3, release_ms=50),
        ])

    def process(self, audio: np.ndarray) -> np.ndarray:
        """
        Apply mastering chain to stereo audio.

        Args:
            audio: Stereo audio (2, samples) at self.sample_rate

        Returns:
            Mastered audio with same shape
        """
        # Ensure stereo
        if audio.ndim == 1:
            audio = np.stack([audio, audio])

        # Apply pedalboard
        mastered = self.board(audio, self.sample_rate)

        # LUFS normalization (keep existing code)
        mastered = self._normalize_lufs(mastered)

        return mastered
```

**Install:** `pip install pedalboard` (Spotify's audio library)

**Integration:**
```python
# In scripts/mixer.py

from scripts.mastering import Mastering

# Replace simple LUFS normalization with:
mastering = Mastering(config)
final_mix = mastering.process(premix)
```

---

#### Task 3.3: Release Automation
**Status:** 📦 Manual export only
**Estimated Effort:** 4-6 hours
**Impact:** Streamlines distribution workflow

**New File:** `scripts/release.py`

```python
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, TIT2, TPE1, TALB, APIC
from pydub import AudioSegment
import os

class ReleaseManager:
    """Handles metadata tagging and format conversion."""

    def __init__(self, output_dir: str = "releases"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def prepare_release(
        self,
        wav_path: str,
        metadata: dict,
        album_art_path: str = None
    ) -> dict:
        """
        Convert WAV to distribution formats with metadata.

        Args:
            wav_path: Path to mastered WAV file
            metadata: {
                'title': 'Song Name',
                'artist': 'Artist Name',
                'album': 'Album Name',
                'year': '2025',
                'genre': 'Rap',
                'isrc': 'USXXX2512345'  # Optional
            }
            album_art_path: Path to cover art JPG (1400x1400 recommended)

        Returns:
            Dictionary of output paths by format
        """
        audio = AudioSegment.from_wav(wav_path)
        stem = os.path.splitext(os.path.basename(wav_path))[0]
        outputs = {}

        # MP3 (320kbps for streaming)
        mp3_path = os.path.join(self.output_dir, f"{stem}_320.mp3")
        audio.export(mp3_path, format="mp3", bitrate="320k")
        self._tag_mp3(mp3_path, metadata, album_art_path)
        outputs['mp3_320'] = mp3_path

        # MP3 (128kbps for demos)
        mp3_128_path = os.path.join(self.output_dir, f"{stem}_128.mp3")
        audio.export(mp3_128_path, format="mp3", bitrate="128k")
        self._tag_mp3(mp3_128_path, metadata, album_art_path)
        outputs['mp3_128'] = mp3_128_path

        # M4A (for Apple Music/iTunes)
        m4a_path = os.path.join(self.output_dir, f"{stem}.m4a")
        audio.export(m4a_path, format="ipod", bitrate="256k")
        outputs['m4a'] = m4a_path

        # FLAC (lossless archival)
        flac_path = os.path.join(self.output_dir, f"{stem}.flac")
        audio.export(flac_path, format="flac")
        outputs['flac'] = flac_path

        return outputs

    def _tag_mp3(self, mp3_path: str, metadata: dict, art_path: str):
        """Add ID3 tags to MP3 file."""
        audio = MP3(mp3_path, ID3=ID3)

        # Add text frames
        audio.tags.add(TIT2(encoding=3, text=metadata.get('title', 'Untitled')))
        audio.tags.add(TPE1(encoding=3, text=metadata.get('artist', 'Unknown')))
        audio.tags.add(TALB(encoding=3, text=metadata.get('album', 'Single')))

        # Add album art
        if art_path and os.path.exists(art_path):
            with open(art_path, 'rb') as f:
                audio.tags.add(
                    APIC(
                        encoding=3,
                        mime='image/jpeg',
                        type=3,  # Cover (front)
                        desc='Cover',
                        data=f.read()
                    )
                )

        audio.save()

# Usage in main.py:
# manager = ReleaseManager()
# outputs = manager.prepare_release(
#     'outputs/thread_to_hit.wav',
#     metadata={'title': 'Rise Up', 'artist': 'ThreadToHit'},
#     album_art_path='inputs/cover_art.jpg'
# )
```

**Install:** `pip install mutagen pydub`

---

### 🔵 P3 - Nice to Have

#### Task 4.1: Web UI (Gradio)
**Estimated Effort:** 10-15 hours
**Impact:** Makes tool accessible to non-technical users

**New File:** `app.py`

```python
import gradio as gr
from scripts.workflow import ThreadToHitWorkflow
import os

def generate_song(
    thread_text: str,
    vocal_file,
    preset: str,
    vocal_mode: str
):
    """Gradio interface function."""

    # Save uploaded vocal
    vocal_path = vocal_file.name

    # Run pipeline
    workflow = ThreadToHitWorkflow(
        config_path=f"configs/{preset}.yaml",
        anthropic_key=os.environ["ANTHROPIC_API_KEY"]
    )

    result = workflow.run(thread_text, vocal_path)

    return (
        result['final_mix'],  # Audio file
        result['lyrics'],      # JSON display
        result['hit_score']    # Number
    )

# Build interface
interface = gr.Interface(
    fn=generate_song,
    inputs=[
        gr.Textbox(
            label="Thread Text",
            placeholder="Paste forum thread here...",
            lines=10
        ),
        gr.Audio(label="Vocal Recording (WAV)", type="filepath"),
        gr.Dropdown(
            label="Preset",
            choices=["pipeline", "fast"],
            value="fast"
        ),
        gr.Dropdown(
            label="Vocal Processing",
            choices=["raw", "enhanced", "rvc"],
            value="enhanced"
        )
    ],
    outputs=[
        gr.Audio(label="Final Mix"),
        gr.JSON(label="Generated Lyrics"),
        gr.Number(label="Hit Score")
    ],
    title="ThreadToHitRemix",
    description="Transform forum threads into NEFFEX-style songs"
)

interface.launch()
```

**Run:** `python app.py`
**Install:** `pip install gradio`

---

#### Task 4.2: Batch Processing
**Estimated Effort:** 4-6 hours
**Impact:** Process multiple threads efficiently

**New File:** `scripts/batch.py`

```python
import os
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
from scripts.workflow import ThreadToHitWorkflow

def process_single_thread(args):
    """Worker function for parallel processing."""
    thread_path, vocal_path, config_path, anthropic_key = args

    workflow = ThreadToHitWorkflow(config_path, anthropic_key)

    with open(thread_path) as f:
        thread_text = f.read()

    result = workflow.run(thread_text, vocal_path)

    return {
        'thread': thread_path,
        'output': result['final_mix'],
        'score': result['hit_score']
    }

def batch_process(
    thread_dir: str,
    vocal_path: str,
    config_path: str,
    max_workers: int = 2  # Limited by GPU
):
    """
    Process all threads in directory.

    Args:
        thread_dir: Directory with .txt thread files
        vocal_path: Single vocal file to use for all
        config_path: Pipeline config
        max_workers: Parallel processes (limited by VRAM)
    """
    thread_files = list(Path(thread_dir).glob("*.txt"))
    anthropic_key = os.environ["ANTHROPIC_API_KEY"]

    args_list = [
        (str(tf), vocal_path, config_path, anthropic_key)
        for tf in thread_files
    ]

    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(process_single_thread, args_list))

    # Summarize
    print(f"\n✓ Processed {len(results)} threads")
    for r in sorted(results, key=lambda x: x['score'], reverse=True):
        print(f"  {r['score']:3.0f} - {Path(r['thread']).name}")
```

**Note:** GPU memory limits parallel processing. Max 2-3 workers typically.

---

## Infrastructure & DevOps

### 🛠️ P4 - Development Tooling

#### Task 5.1: CI/CD Pipeline (GitHub Actions)
**File:** `.github/workflows/test.yml`

```yaml
name: Test Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.10'

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov

    - name: Run tests
      run: |
        pytest tests/ --cov=scripts --cov-report=xml

    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

---

#### Task 5.2: Docker Container
**File:** `Dockerfile`

```dockerfile
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

# Install Python and system deps
RUN apt-get update && apt-get install -y \
    python3.10 python3-pip ffmpeg git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Copy application
COPY . .

# Setup external dependencies
RUN python3 setup.py

ENTRYPOINT ["python3", "main.py"]
```

**Usage:**
```bash
docker build -t threadtohit .
docker run --gpus all \
  -v $(pwd)/inputs:/app/inputs \
  -v $(pwd)/outputs:/app/outputs \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  threadtohit --thread inputs/threads/sample.txt --voice inputs/voice/vocal.wav
```

---

## Alternative Architectures

### Remove Claude API Dependency

If API costs are unacceptable, here's the migration path:

#### Option A: Local LLM (Ollama)

```python
# File: scripts/story_extractor_local.py

import ollama

class StoryExtractorLocal:
    """Local LLM story extraction (no API costs)."""

    def __init__(self, model: str = "llama3.1:8b"):
        self.model = model
        # Ensure model is pulled
        ollama.pull(model)

    def extract(self, thread_text: str) -> dict:
        """Extract story using local Llama model."""

        prompt = f"""
        Extract the core narrative from this thread.
        Return JSON with: hook, protagonist, conflict, emotional_palette.

        THREAD:
        {thread_text}

        JSON:
        """

        response = ollama.chat(
            model=self.model,
            messages=[{"role": "user", "content": prompt}]
        )

        # Parse JSON from response
        import json
        return json.loads(response['message']['content'])
```

**Pros:**
- $0 API costs
- Full privacy
- No internet required

**Cons:**
- Requires 16GB+ system RAM
- Slower (30s vs 2s per call)
- Lower quality outputs
- More hallucinations

**Install:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b  # 4.7GB download
pip install ollama
```

---

#### Option B: Template-Based (No AI)

```python
# File: scripts/lyric_generator_template.py

import random

class LyricGeneratorTemplate:
    """Template-based lyrics (no AI)."""

    VERSE_TEMPLATES = [
        "I was {emotion} but now I'm {emotion_opposite}",
        "They said I {negative_action} but I {positive_action}",
        "Started from {place_low} now I'm {place_high}",
        # ... etc
    ]

    def generate(self, story_summary: dict) -> list:
        """Generate lyrics from templates."""

        # Extract keywords from story
        keywords = self._extract_keywords(story_summary)

        # Fill templates
        verse1 = self._fill_template(
            random.choice(self.VERSE_TEMPLATES),
            keywords
        )

        # ... etc

        return [
            {"label": "Verse 1", "lines": verse1},
            # ... etc
        ]
```

**Pros:**
- $0 costs
- Instant generation
- Predictable structure

**Cons:**
- Generic, formulaic lyrics
- No narrative coherence
- Low creativity
- Repetitive over many songs

---

## Timeline Estimates

### Minimal Viable Product (MVP)
**Goal:** Fix broken features, add examples
**Time:** 1 week (20-30 hours)
- P0 tasks 1.1, 1.2, 1.3
- P1 task 2.1
**Outcome:** Stable v1.0 release

### Production Ready
**Goal:** Professional quality output
**Time:** 1 month (80-100 hours)
- MVP + P1 tasks 2.2, 2.3
- P2 tasks 3.2, 3.3
**Outcome:** v1.5 with advanced mastering and release tools

### Feature Complete
**Goal:** All planned features
**Time:** 3 months (200-250 hours)
- Production Ready + P2 task 3.1
- P3 tasks 4.1, 4.2
**Outcome:** v2.0 with web UI and batch processing

---

## Success Metrics

How to know if development is successful:

1. **Technical:**
   - [ ] All tests passing
   - [ ] No TODO warnings in production runs
   - [ ] GPU utilization > 80% during generation
   - [ ] Pipeline completes in < 10 minutes per song

2. **Quality:**
   - [ ] Generated lyrics follow ABABCB structure 95%+ of time
   - [ ] Final mixes pass LUFS validation (-9.5 ± 0.5)
   - [ ] Hit predictor validation accuracy > 70%
   - [ ] No audio artifacts (clipping, noise) in outputs

3. **User Experience:**
   - [ ] New users can run pipeline in < 30 minutes from clone
   - [ ] Error messages are actionable
   - [ ] Example files demonstrate full capabilities
   - [ ] README reflects actual implementation

4. **Business (if applicable):**
   - [ ] API costs < $0.02 per song
   - [ ] Songs pass streaming platform quality checks
   - [ ] Community adoption (GitHub stars, forks)

---

## When to Stop

Know when the project is "done":

**Stop adding features when:**
- ✅ Core pipeline is stable (no crashes)
- ✅ Output quality meets your standards
- ✅ You've made 10+ songs you're proud of
- ✅ Documentation is complete
- ✅ Tests cover critical paths

**Don't fall into:**
- ❌ Endless optimization (diminishing returns)
- ❌ Feature creep (web UI, mobile app, blockchain integration)
- ❌ Perfectionism (hit predictor will never be 100% accurate)

**This is a portfolio/creative tool, not a product.**
Ship it when it's useful to you, not when it's perfect.

---

## Getting Help

If you get stuck:

1. **Check existing code:** Tests in `tests/` show working examples
2. **Enable debug logging:** Add `logger.setLevel(logging.DEBUG)` to main.py
3. **Test in isolation:** Run individual scripts with `python scripts/vocal_enhancer.py --help`
4. **GPU issues:** Check `nvidia-smi`, reduce batch size, try smaller models
5. **Audio issues:** Verify FFmpeg install, check sample rates match, inspect waveforms

External resources:
- Librosa docs: https://librosa.org/doc/latest/
- AudioCraft examples: https://github.com/facebookresearch/audiocraft
- RVC guide: https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI

---

**Good luck! This is a solid project. Pick a stopping point and ship it.**
