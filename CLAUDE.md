# CLAUDE.md - AI Assistant Guide for ThreadToHitRemix

> **Last Updated**: 2025-11-16
> **Repository**: ThreadToHitRemix - AI-powered music production pipeline

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Core Modules & Components](#core-modules--components)
5. [Configuration Management](#configuration-management)
6. [Development Workflows](#development-workflows)
7. [Code Conventions & Style](#code-conventions--style)
8. [Data Flow & Pipeline](#data-flow--pipeline)
9. [Dependencies & Integrations](#dependencies--integrations)
10. [Error Handling](#error-handling)
11. [Testing Strategy](#testing-strategy)
12. [Common Tasks & Recipes](#common-tasks--recipes)
13. [Troubleshooting Guide](#troubleshooting-guide)
14. [Improvement Opportunities](#improvement-opportunities)

---

## Project Overview

**ThreadToHitRemix** transforms community forum threads into complete, produced songs using:
- **Claude (Anthropic)**: Story extraction and lyric generation
- **MusicGen (Meta)**: AI instrumental beat creation
- **RVC (Retrieval-based Voice Conversion)**: Voice styling
- **Librosa**: Audio processing and mixing

### Primary Use Case
Input: Forum thread text + User's dry vocal recording
Output: Fully mixed song with NEFFEX-style motivational rap lyrics

### Key Characteristics
- **Prototype/Research Quality**: Well-structured but not production-hardened
- **GPU Required**: MusicGen and RVC need CUDA-capable GPU
- **Synchronous Pipeline**: Sequential processing (no parallelization)
- **Type-Safe**: Modern Python with comprehensive type hints

---

## Repository Structure

```
/home/user/music/
├── ThreadToHitRemix/
│   ├── main.py                    # CLI entry point
│   ├── setup.py                   # Dependency installer & validator
│   ├── requirements.txt           # Python dependencies
│   │
│   ├── configs/
│   │   └── pipeline.yaml          # Pipeline hyperparameters
│   │
│   ├── scripts/                   # Core pipeline modules
│   │   ├── __init__.py
│   │   ├── workflow.py            # Main orchestrator (ThreadToHitWorkflow)
│   │   ├── story_extractor.py     # Claude story/theme extraction
│   │   ├── lyric_generator.py     # Claude NEFFEX-style lyrics
│   │   ├── beat_maker.py          # MusicGen instrumental wrapper
│   │   ├── voice_converter.py     # RVC voice styling
│   │   ├── mixer.py               # Librosa audio mixing
│   │   └── hit_predictor.py       # ML-based hit scoring
│   │
│   ├── data/prompts/
│   │   └── sample_thread.txt      # Example input thread
│   │
│   ├── inputs/                    # User-provided content (gitignored)
│   │   ├── threads/               # Forum thread text files
│   │   └── voice/                 # Dry vocal WAV files
│   │
│   ├── outputs/                   # Generated artifacts (gitignored)
│   │   ├── lyrics.json            # Generated lyrics structure
│   │   ├── instrumental.wav       # MusicGen beat
│   │   ├── styled_vocals.wav      # RVC-converted vocals
│   │   └── thread_to_hit.wav      # Final mixed track
│   │
│   ├── deps/                      # Cloned dependencies (gitignored)
│   │   ├── audiocraft/            # Meta's MusicGen
│   │   └── RVC-WebUI/             # Voice conversion toolkit
│   │
│   └── models/                    # RVC checkpoints (gitignored)
│       └── neffex_placeholder.wav # NEFFEX-style voice model
```

### Key Directories
- **`scripts/`**: All core business logic lives here
- **`configs/`**: YAML configuration files
- **`outputs/`**: Generated artifacts (not version controlled)
- **`deps/`**: External repos cloned during setup (not version controlled)

---

## Architecture & Design Patterns

### 1. **Staged Pipeline Architecture**

```
Thread Text → Story → Lyrics → Beat + Vocals → Mix → Score
```

Each stage is isolated in its own module with clear inputs/outputs.

### 2. **Key Design Patterns**

#### **Facade Pattern**
`ThreadToHitWorkflow` (workflow.py:31) orchestrates all modules, hiding complexity from CLI.

```python
# main.py calls workflow with minimal code
workflow = ThreadToHitWorkflow(config_path, anthropic_key, rvc_root)
artifacts = workflow.run(thread_text, user_voice)
```

#### **Lazy Loading**
`BeatMaker.load()` (beat_maker.py:30) defers MusicGen model loading until first use.

```python
# Model isn't loaded on __init__ (saves VRAM)
beat_maker = BeatMaker(preset="facebook/musicgen-small")
# Load happens here, on first create_beat() call
beat_maker.create_beat(prompt, duration)
```

#### **Dependency Injection**
All modules receive configuration via constructor → testable and flexible.

```python
# Bad: Hardcoded config
class Mixer:
    def __init__(self):
        self.gain = -3.0  # Hardcoded!

# Good: Injected config (current approach)
class StemMixer:
    def __init__(self, vocal_gain_db: float, instrumental_gain_db: float):
        self.vocal_gain_db = vocal_gain_db
        self.instrumental_gain_db = instrumental_gain_db
```

#### **Dataclass-based DTOs**
Type-safe data transfer objects for structured data passing.

```python
@dataclass
class StorySummary:
    hook: str
    protagonist: str
    conflict: str
    sensory_details: list[str]
    emotional_palette: list[str]
```

### 3. **Separation of Concerns**

| Module | Responsibility | External Dependency |
|--------|---------------|---------------------|
| `story_extractor.py` | Extract narrative themes | Anthropic Claude API |
| `lyric_generator.py` | Generate rap lyrics | Anthropic Claude API |
| `beat_maker.py` | Create instrumentals | MusicGen (local GPU) |
| `voice_converter.py` | Style vocals | RVC-WebUI (subprocess) |
| `mixer.py` | Mix audio stems | Librosa (local) |
| `hit_predictor.py` | Score track quality | scikit-learn (local) |
| `workflow.py` | Orchestrate pipeline | All above modules |

---

## Core Modules & Components

### 1. **StoryExtractor** (`scripts/story_extractor.py`)

**Purpose**: Extract hero's journey narrative structure from thread text using Claude.

**Key Methods**:
```python
def extract_story(self, thread_text: str) -> StorySummary:
    """
    Returns: StorySummary with hook, protagonist, conflict,
             sensory details, emotional palette
    """
```

**Configuration**:
- Default model: `claude-3-haiku-20240307` (fast, cheap)
- Temperature: `0.2` (consistent, focused output)
- Max tokens: `800`

**Output Example**:
```python
StorySummary(
    hook="Never back down, rise above",
    protagonist="Underdog developer",
    conflict="Impostor syndrome vs self-belief",
    sensory_details=["bright screen glow", "keyboard clicks"],
    emotional_palette=["determination", "fear", "triumph"]
)
```

**Location**: `/home/user/music/ThreadToHitRemix/scripts/story_extractor.py`

---

### 2. **LyricGenerator** (`scripts/lyric_generator.py`)

**Purpose**: Generate NEFFEX-style motivational rap lyrics in ABABCB format.

**Key Methods**:
```python
def write_song(self, summary: str, genre_hint: str = "motivational edm rap",
               tempo: int = 120) -> List[LyricSection]:
    """
    Returns: List of LyricSection objects (Verse, Pre-Hook, Hook)
    """
```

**Configuration**:
- Default model: `claude-3-5-sonnet-20241022` (creative, high quality)
- Temperature: `0.6` (balanced creativity)
- Structure: ABABCB (A=Verse, B=Pre-Hook, C=Hook)

**Lyric Techniques**:
- Antimetabole (reversed phrase repetition)
- Call-and-response patterns
- Internal rhyme schemes
- Motivational themes

**Output Format**:
```json
[
  {"label": "Verse 1", "lines": ["Line 1", "Line 2", ...]},
  {"label": "Pre-Hook", "lines": [...]},
  {"label": "Hook", "lines": [...]}
]
```

**Location**: `/home/user/music/ThreadToHitRemix/scripts/lyric_generator.py`

---

### 3. **BeatMaker** (`scripts/beat_maker.py`)

**Purpose**: Thin wrapper around Meta's MusicGen for instrumental generation.

**Key Methods**:
```python
def load(self) -> None:
    """Lazy load MusicGen model to GPU/CPU"""

def create_beat(self, prompt: str, duration: float, output_path: Path) -> Path:
    """
    Generate instrumental from text prompt
    Returns: Path to generated WAV file
    """
```

**Configuration**:
- Default preset: `facebook/musicgen-small` (VRAM-friendly, ~1.5GB)
- Duration: `30` seconds (configurable)
- Sample rate: `44100` Hz
- Target BPM: `120` (passed in prompt, not enforced)

**Memory Management**:
- Lazy loading prevents VRAM allocation until needed
- Model stays loaded for subsequent beats

**Location**: `/home/user/music/ThreadToHitRemix/scripts/beat_maker.py`

---

### 4. **RvcVoiceConverter** (`scripts/voice_converter.py`)

**Purpose**: Convert dry vocals to NEFFEX-style using RVC-WebUI.

**Key Methods**:
```python
def convert(self, source_wav: Path, model_path: Path,
            output_path: Path, pitch_adjust: int = 0) -> Path:
    """
    Args:
        source_wav: User's dry vocal recording
        model_path: RVC voice model checkpoint
        pitch_adjust: Semitone shift (-12 to +12)
    Returns: Path to styled vocal WAV
    """
```

**Configuration**:
- Pitch detection: `rmvpe` (robust, accurate)
- Index rate: `0.66` (balance between original and model)
- RVC root: `deps/RVC-WebUI` (default)

**Important Notes**:
- Runs as subprocess: `python infer-web.py ...`
- Auto-copies voice model to RVC weights directory
- Requires 16-bit PCM WAV input

**Location**: `/home/user/music/ThreadToHitRemix/scripts/voice_converter.py`

---

### 5. **StemMixer** (`scripts/mixer.py`)

**Purpose**: Mix instrumental and vocals with Librosa, apply effects.

**Key Methods**:
```python
def mix(self, instrumental_path: Path, vocal_path: Path,
        output_path: Path) -> Path:
    """
    Returns: Path to final mixed WAV file
    """
```

**Configuration** (from `configs/pipeline.yaml`):
```yaml
mixing:
  vocal_gain_db: -1.0           # Slight vocal reduction
  instrumental_gain_db: -3.0    # Significant beat reduction
  limiter_threshold_db: -0.3    # Prevent clipping
  echo_delay_seconds: 0.25      # Echo delay (250ms)
  echo_decay: 0.35              # Echo feedback (35%)
```

**Processing Steps**:
1. Load both stems with `librosa.load(sr=44100)`
2. Apply gain (dB → linear: `10^(db/20)`)
3. Add echo effect to vocals (delay + decay)
4. Pad shorter audio to match lengths
5. Sum stems, clip to `[-1, 1]`
6. Write with `soundfile.write()`

**Location**: `/home/user/music/ThreadToHitRemix/scripts/mixer.py`

---

### 6. **HitPredictor** (`scripts/hit_predictor.py`)

**Purpose**: ML-based scoring system using audio features.

**Key Methods**:
```python
def score_track(self, audio_path: Path) -> HitScore:
    """
    Returns: HitScore with percentage (0-100) and feedback text
    """
```

**Feature Extraction** (Librosa):
- **Tempo**: BPM via beat tracking (ideal: 100-140 BPM)
- **Energy**: RMS (root mean square) loudness
- **Repetition**: MFCC correlation (catchiness proxy)

**Model**:
- Algorithm: `LogisticRegression` (scikit-learn)
- Training: Synthetic data (placeholder, not real hit data)
- Output: Probability score → percentage

**Feedback Examples**:
```
"Score: 78% – Great energy! Consider tightening the hook repetition."
"Score: 45% – Tempo feels slow. Try increasing to 120+ BPM."
```

**⚠️ Current Limitation**: Uses dummy training data, not predictive of real hit potential.

**Location**: `/home/user/music/ThreadToHitRemix/scripts/hit_predictor.py`

---

### 7. **ThreadToHitWorkflow** (`scripts/workflow.py`)

**Purpose**: Main orchestrator coordinating all pipeline stages.

**Key Methods**:
```python
def run(self, thread_text: str, user_voice: Path | None = None) -> PipelineArtifacts:
    """
    Execute full pipeline: story → lyrics → beat → vocals → mix → score
    Returns: PipelineArtifacts with all output paths
    """
```

**Workflow Steps**:
1. Extract story with `StoryExtractor`
2. Generate lyrics with `LyricGenerator`
3. Create beat with `BeatMaker`
4. Convert vocals with `RvcVoiceConverter` (if `user_voice` provided)
5. Mix stems with `StemMixer`
6. Score track with `HitPredictor`
7. Persist all artifacts to `outputs/`

**Return Value**:
```python
@dataclass
class PipelineArtifacts:
    story: StorySummary
    lyrics_path: Path          # outputs/lyrics.json
    instrumental_path: Path    # outputs/instrumental.wav
    vocals_path: Path | None   # outputs/styled_vocals.wav
    mix_path: Path             # outputs/thread_to_hit.wav
    hit_score: HitScore
```

**Location**: `/home/user/music/ThreadToHitRemix/scripts/workflow.py`

---

## Configuration Management

### YAML Configuration (`configs/pipeline.yaml`)

**Structure**:
```yaml
workflow:
  output_root: "outputs"
  sample_rate: 44100
  beat_duration_seconds: 30
  beat_preset: "facebook/musicgen-small"
  target_bpm: 120
  voice_model_path: "models/neffex_placeholder.wav"
  rvc_config: "neffex_voice"
  mixdown_filename: "thread_to_hit.wav"

anthropic:
  model: "claude-3-haiku-20240307"
  max_output_tokens: 800

lyrics:
  temperature: 0.7
  verse_count: 2
  hook_count: 1

mixing:
  vocal_gain_db: -1.0
  instrumental_gain_db: -3.0
  limiter_threshold_db: -0.3
  echo_delay_seconds: 0.25
  echo_decay: 0.35
```

### Environment Variables (`.env`)

**Required**:
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

**Loading**:
```python
# main.py:49
from dotenv import load_dotenv
load_dotenv()
anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
```

### CLI Overrides

```bash
python main.py \
  --thread inputs/threads/my_thread.txt \
  --voice inputs/voice/my_vocal.wav \
  --config configs/alt_pipeline.yaml \  # Override config
  --rvc-root /custom/path/to/RVC        # Override RVC location
```

### Configuration Strategy

1. **Defaults in Code**: Fallback values in module `__init__` methods
2. **YAML Config**: Override defaults via `pipeline.yaml`
3. **CLI Flags**: Override both defaults and YAML
4. **Environment Variables**: For secrets only (API keys)

**Precedence**: CLI > YAML > Code Defaults

---

## Development Workflows

### Initial Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd music/ThreadToHitRemix

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
python setup.py  # Downloads AudioCraft, RVC, models

# 4. Configure environment
cat > .env << EOF
ANTHROPIC_API_KEY=sk-ant-your-key-here
EOF

# 5. Verify installation
python -c "import torch; print('CUDA:', torch.cuda.is_available())"
```

### Running the Pipeline

**Basic Usage**:
```bash
python main.py \
  --thread inputs/threads/example.txt \
  --voice inputs/voice/dry_vocal.wav
```

**URL Input**:
```bash
python main.py \
  --thread-url https://example.com/forum/thread/123 \
  --voice inputs/voice/dry_vocal.wav
```

**Custom Config**:
```bash
python main.py \
  --thread inputs/threads/example.txt \
  --voice inputs/voice/dry_vocal.wav \
  --config configs/custom.yaml
```

### Adding a New Pipeline Stage

**Example**: Add a mastering stage after mixing.

1. **Create Module** (`scripts/mastering.py`):
```python
from __future__ import annotations
from pathlib import Path
import numpy as np
import librosa
import soundfile as sf

class Mastering:
    def __init__(self, target_lufs: float = -14.0):
        self.target_lufs = target_lufs

    def master(self, input_path: Path, output_path: Path) -> Path:
        audio, sr = librosa.load(input_path, sr=None, mono=False)
        # Apply mastering effects...
        sf.write(output_path, audio, sr)
        return output_path
```

2. **Update Workflow** (`scripts/workflow.py`):
```python
from scripts.mastering import Mastering

class ThreadToHitWorkflow:
    def __init__(self, ...):
        # ...
        self.mastering = Mastering(target_lufs=-14.0)

    def run(self, thread_text: str, user_voice: Path | None) -> PipelineArtifacts:
        # ... existing stages ...
        mix_path = self.mixer.mix(...)

        # Add mastering stage
        mastered_path = self.output_root / "mastered.wav"
        self.mastering.master(mix_path, mastered_path)

        # ... rest of workflow ...
```

3. **Update Config** (`configs/pipeline.yaml`):
```yaml
mastering:
  target_lufs: -14.0
  ceiling_db: -0.1
```

### Modifying Claude Prompts

**Story Extraction** (`scripts/story_extractor.py:26-39`):
```python
# Locate the system prompt
system_prompt = """
Act as a hit songwriter analyzing a messy community thread...
"""

# Modify to change extraction behavior
system_prompt = """
Act as a Broadway lyricist analyzing a community thread...
[Your custom instructions]
"""
```

**Lyric Generation** (`scripts/lyric_generator.py:29-70`):
```python
# Locate the lyric prompt template
lyric_prompt = f"""
You are a NEFFEX-inspired lyricist...
[Modify structure, style, techniques]
"""
```

**Testing Prompt Changes**:
```bash
# Run pipeline with test thread
python main.py --thread data/prompts/sample_thread.txt --voice inputs/voice/test.wav

# Check outputs
cat outputs/lyrics.json
```

---

## Code Conventions & Style

### Python Version
- **Minimum**: Python 3.10+
- **Reason**: Uses match/case, improved type hints, dataclass features

### Type Hints (Mandatory)

```python
# ✅ Good: Full type hints
def create_beat(self, prompt: str, duration: float, output_path: Path) -> Path:
    ...

# ❌ Bad: No type hints
def create_beat(self, prompt, duration, output_path):
    ...
```

### Future Imports (All Files)

```python
from __future__ import annotations  # First import in every file
```

**Benefit**: Allows forward references without quotes (`list[str]` instead of `List[str]`).

### Path Objects > Strings

```python
# ✅ Good: Path objects
from pathlib import Path
output_path: Path = self.output_root / "lyrics.json"
if output_path.exists():
    ...

# ❌ Bad: String concatenation
output_path: str = self.output_root + "/lyrics.json"
if os.path.exists(output_path):
    ...
```

### Dataclasses for Structured Data

```python
# ✅ Good: Dataclass
from dataclasses import dataclass

@dataclass
class HitScore:
    score: float
    feedback: str

# ❌ Bad: Dict
hit_score = {"score": 85.0, "feedback": "Great!"}  # No type safety
```

### Context Managers

```python
# ✅ Good: Context manager
with open(lyrics_path, "w", encoding="utf-8") as f:
    json.dump(lyrics, f, indent=2)

# ❌ Bad: Manual file handling
f = open(lyrics_path, "w")
json.dump(lyrics, f)
f.close()  # Easy to forget!
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | `StoryExtractor`, `BeatMaker` |
| Functions/Methods | snake_case | `extract_story`, `create_beat` |
| Private Methods | `_snake_case` | `_parse_summary`, `_load_config` |
| Constants | UPPER_SNAKE | `REPO_ROOT`, `SAMPLE_RATE` |
| Variables | snake_case | `thread_text`, `output_path` |

### Docstrings

**Required for**:
- All modules (file-level)
- All classes
- Public methods

**Format**: Google-style (preferred) or NumPy-style

```python
def extract_story(self, thread_text: str) -> StorySummary:
    """
    Extract narrative structure from thread text using Claude.

    Args:
        thread_text: Raw community thread content

    Returns:
        StorySummary with hook, protagonist, conflict, etc.

    Raises:
        requests.HTTPError: If Claude API call fails
    """
```

### Line Length
- **Target**: 88-100 characters
- **Hard Limit**: 120 characters
- Use implicit line continuation for long expressions

```python
# ✅ Good: Implicit continuation
artifacts = PipelineArtifacts(
    story=summary,
    lyrics_path=lyrics_path,
    instrumental_path=beat_path,
    vocals_path=styled_vocals_path,
    mix_path=mix_path,
    hit_score=hit_score,
)

# ❌ Bad: Exceeds line length
artifacts = PipelineArtifacts(story=summary, lyrics_path=lyrics_path, instrumental_path=beat_path, vocals_path=styled_vocals_path, mix_path=mix_path, hit_score=hit_score)
```

### Import Ordering

1. Future imports
2. Standard library
3. Third-party packages
4. Local modules

```python
from __future__ import annotations

import json
import os
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf

from scripts.mixer import StemMixer
from scripts.story_extractor import StorySummary
```

### Error Messages

```python
# ✅ Good: Actionable error
if not thread_source:
    raise ValueError("Provide either --thread or --thread-url")

# ❌ Bad: Vague error
if not thread_source:
    raise ValueError("Invalid input")
```

---

## Data Flow & Pipeline

### Complete Execution Sequence

```
┌──────────────────────────────────────────────────────────┐
│ 1. CLI Entry (main.py)                                   │
│    - Load .env → ANTHROPIC_API_KEY                       │
│    - Parse args: --thread, --voice, --config            │
│    - Initialize ThreadToHitWorkflow                      │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Load Thread (story_extractor.load_thread)             │
│    INPUT: File path or URL                               │
│    OUTPUT: str (raw thread text)                         │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Extract Story (StoryExtractor.extract_story)          │
│    INPUT: str (thread text)                              │
│    PROCESS: Claude API → JSON response                   │
│    OUTPUT: StorySummary (dataclass)                      │
│      {hook, protagonist, conflict, sensory_details,      │
│       emotional_palette}                                 │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 4. Generate Lyrics (LyricGenerator.write_song)           │
│    INPUT: StorySummary (JSON-serialized) + genre + tempo │
│    PROCESS: Claude API → ABABCB lyrics                   │
│    OUTPUT: List[LyricSection]                            │
│    PERSIST: outputs/lyrics.json                          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 5. Create Beat (BeatMaker.create_beat)                   │
│    INPUT: Text prompt (hook + tempo)                     │
│    PROCESS:                                              │
│      - Load MusicGen model (GPU/CPU)                     │
│      - Generate audio tensor                             │
│      - Save as WAV                                       │
│    OUTPUT: outputs/instrumental.wav                      │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 6. Convert Voice (RvcVoiceConverter.convert)             │
│    INPUT: User's dry vocal WAV                           │
│    PROCESS:                                              │
│      - Copy voice model to RVC dir                       │
│      - Subprocess: infer-web.py --f0p rmvpe ...          │
│    OUTPUT: outputs/styled_vocals.wav                     │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 7. Mix Stems (StemMixer.mix)                             │
│    INPUT: instrumental.wav + styled_vocals.wav           │
│    PROCESS:                                              │
│      - Load with librosa (sr=44100)                      │
│      - Apply gain: inst=-3dB, vocals=-1dB                │
│      - Add echo to vocals (250ms, 35% decay)             │
│      - Pad to same length, sum, clip                     │
│    OUTPUT: outputs/thread_to_hit.wav                     │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 8. Score Track (HitPredictor.score_track)                │
│    INPUT: outputs/thread_to_hit.wav                      │
│    PROCESS:                                              │
│      - Extract: tempo, energy (RMS), repetition (MFCC)   │
│      - Feed to LogisticRegression                        │
│    OUTPUT: HitScore {score: 0-100, feedback: str}        │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│ 9. Return Results (main.py)                              │
│    - Print hook, paths, hit score                        │
│    - Return PipelineArtifacts                            │
└──────────────────────────────────────────────────────────┘
```

### Data Transformations

```
Thread Text (str)
  ↓ [Claude API]
StorySummary (dataclass)
  ↓ [JSON serialization]
Lyric Prompt (str)
  ↓ [Claude API]
List[LyricSection] (dataclass list)
  ↓ [json.dump]
outputs/lyrics.json (file)

StorySummary.hook (str)
  ↓ [String formatting]
Beat Prompt (str)
  ↓ [MusicGen model]
Audio Tensor (torch.Tensor)
  ↓ [audiocraft.save_wav]
outputs/instrumental.wav (file)

User Vocal WAV (file)
  ↓ [RVC subprocess]
outputs/styled_vocals.wav (file)

instrumental.wav + styled_vocals.wav
  ↓ [librosa.load → numpy arrays]
  ↓ [gain, echo, padding, summing]
Mixed Audio (numpy.ndarray)
  ↓ [soundfile.write]
outputs/thread_to_hit.wav (file)

thread_to_hit.wav
  ↓ [librosa feature extraction]
Features [tempo, energy, repetition] (numpy array)
  ↓ [LogisticRegression.predict_proba]
HitScore {score: float, feedback: str} (dataclass)
```

---

## Dependencies & Integrations

### Python Packages (`requirements.txt`)

```
anthropic>=0.39.0          # Claude API client
accelerate>=0.32.1         # Hugging Face optimization
audiocraft>=1.2.0          # Meta MusicGen
librosa>=0.10.2            # Audio analysis
soundfile>=0.12.1          # WAV I/O
torch>=2.3.0               # PyTorch (CUDA required)
numpy>=1.26.0              # Numerical computing
python-dotenv>=1.0.1       # .env file loader
pyyaml>=6.0.1              # Config parser
requests>=2.32.0           # HTTP client
scikit-learn>=1.5.0        # ML scoring
```

### External Services

#### **Anthropic Claude API**

**Models Used**:
- `claude-3-haiku-20240307` (story extraction): Fast, cheap, consistent
- `claude-3-5-sonnet-20241022` (lyrics): Creative, high quality

**Authentication**:
```python
# .env file
ANTHROPIC_API_KEY=sk-ant-...

# Usage in code
from anthropic import Anthropic
client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
```

**Rate Limits**: Check Anthropic dashboard for current limits
**Cost**: ~$0.25 per song (Haiku) + ~$3.00 (Sonnet) = **~$3.25/song**

#### **Meta MusicGen**

**Model**: `facebook/musicgen-small`
**Hosting**: Local GPU/CPU (downloaded via Hugging Face)
**VRAM**: ~1.5GB for small model
**Alternatives**: `musicgen-medium` (better quality, 3GB VRAM), `musicgen-large` (5GB VRAM)

**Download Location**: `deps/audiocraft/`

#### **RVC-WebUI**

**Repository**: `RVC-Project/Retrieval-based-Voice-Conversion-WebUI`
**Invocation**: Subprocess (`python infer-web.py`)
**Voice Models**: `.pth` or `.wav` checkpoints in `models/`

**Required Files**:
- Voice model: `models/neffex_placeholder.wav`
- Pitch detector: `rmvpe` (auto-downloaded by RVC)

**Download Location**: `deps/RVC-WebUI/`

### External Assets

**NEFFEX Voice Model**:
- **Source**: HuggingFace dataset `ashishpatel26/sample-audio-files`
- **Format**: WAV (placeholder, not real NEFFEX voice)
- **Location**: `models/neffex_placeholder.wav`

**Improvement**: Replace with real RVC checkpoint trained on NEFFEX vocals.

---

## Error Handling

### Current Strategy: Fail-Fast

Most errors bubble up as unhandled exceptions → stack trace printed to console.

### Explicit Validation Points

**main.py**:
```python
# main.py:52
if not anthropic_key:
    raise RuntimeError("ANTHROPIC_API_KEY missing. Add it to your .env file.")

# main.py:60
if not thread_source:
    raise ValueError("Provide either --thread or --thread-url")
```

**workflow.py**:
```python
# workflow.py:51
if user_voice and not user_voice.exists():
    raise FileNotFoundError(f"Missing vocal source at {user_voice}")
```

### Subprocess Errors

**voice_converter.py**:
```python
# voice_converter.py:67
subprocess.run(cmd, check=True)  # Raises CalledProcessError on non-zero exit
```

**Problem**: RVC errors are opaque (only see exit code, not detailed error).
**Solution**: Capture stderr and re-raise with context:

```python
result = subprocess.run(cmd, check=False, capture_output=True, text=True)
if result.returncode != 0:
    raise RuntimeError(f"RVC conversion failed: {result.stderr}")
```

### HTTP Errors

**story_extractor.py**:
```python
# story_extractor.py:19
response = requests.get(url, timeout=30)
response.raise_for_status()  # Raises HTTPError for 4xx/5xx
```

### No Retry Logic

**Current**: Single-shot API calls
**Improvement**: Add exponential backoff for transient failures

```python
import time
from anthropic import APIError

def call_claude_with_retry(client, **kwargs):
    for attempt in range(3):
        try:
            return client.messages.create(**kwargs)
        except APIError as e:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)  # 1s, 2s, 4s
```

### No Logging Framework

**Current**: `print()` statements
**Improvement**: Add `logging` module

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Replace print() with logger
logger.info("Generating lyrics...")
logger.error("Beat creation failed", exc_info=True)
```

---

## Testing Strategy

### Current State: **NO TEST SUITE**

- No test files found
- No testing framework installed
- Validation is entirely manual

### Testability Features (Already Present)

1. **Dependency Injection**: All modules receive config via constructor → easy to mock
2. **Pure Functions**: Audio processing functions (gain, echo) are stateless
3. **Dataclasses**: Simplify test fixtures and assertions
4. **Modular Design**: Each stage can be tested independently

### Recommended Testing Approach

#### 1. **Unit Tests** (Individual Modules)

**Example**: Test `StemMixer.mix()` without running full pipeline

```python
# tests/test_mixer.py
import numpy as np
import soundfile as sf
from pathlib import Path
from scripts.mixer import StemMixer

def test_mix_applies_gain():
    # Setup: Create test audio files
    inst_path = Path("tests/fixtures/instrumental.wav")
    vocal_path = Path("tests/fixtures/vocals.wav")
    output_path = Path("tests/tmp/mixed.wav")

    # Create simple test audio
    sr = 44100
    duration = 1.0
    audio = np.sin(2 * np.pi * 440 * np.arange(int(sr * duration)) / sr)
    sf.write(inst_path, audio, sr)
    sf.write(vocal_path, audio, sr)

    # Execute
    mixer = StemMixer(
        vocal_gain_db=-1.0,
        instrumental_gain_db=-3.0,
        echo_delay_seconds=0.25,
        echo_decay=0.35,
        sample_rate=sr,
    )
    mixer.mix(inst_path, vocal_path, output_path)

    # Assert: Output file exists
    assert output_path.exists()

    # Assert: Output is shorter than 2x input (no doubling)
    mixed_audio, _ = sf.read(output_path)
    assert len(mixed_audio) < 2 * len(audio)
```

#### 2. **Integration Tests** (Multi-Module)

**Example**: Test story extraction → lyric generation pipeline

```python
# tests/test_integration.py
from scripts.story_extractor import StoryExtractor
from scripts.lyric_generator import LyricGenerator

def test_story_to_lyrics_pipeline(mock_anthropic_client):
    # Mock Claude API responses
    mock_anthropic_client.messages.create.side_effect = [
        # Story extraction response
        MagicMock(content=[MagicMock(text='{"hook": "Rise up", ...}')]),
        # Lyric generation response
        MagicMock(content=[MagicMock(text='[{"label": "Verse 1", ...}]')]),
    ]

    # Execute
    extractor = StoryExtractor(api_key="test-key")
    generator = LyricGenerator(api_key="test-key")

    story = extractor.extract_story("Test thread text")
    lyrics = generator.write_song(story.to_json())

    # Assert
    assert story.hook == "Rise up"
    assert len(lyrics) > 0
    assert lyrics[0].label == "Verse 1"
```

#### 3. **End-to-End Tests** (Full Pipeline)

**Example**: Run pipeline with test fixtures, verify outputs

```python
# tests/test_e2e.py
def test_full_pipeline_generates_all_artifacts(tmp_path):
    # Setup
    thread_path = Path("tests/fixtures/sample_thread.txt")
    voice_path = Path("tests/fixtures/dry_vocal.wav")
    config_path = Path("tests/fixtures/test_config.yaml")

    # Execute
    workflow = ThreadToHitWorkflow(
        config_path=config_path,
        anthropic_key=os.environ["TEST_ANTHROPIC_API_KEY"],
        rvc_root=Path("deps/RVC-WebUI"),
    )
    thread_text = load_thread(str(thread_path))
    artifacts = workflow.run(thread_text, user_voice=voice_path)

    # Assert: All files exist
    assert artifacts.lyrics_path.exists()
    assert artifacts.instrumental_path.exists()
    assert artifacts.vocals_path.exists()
    assert artifacts.mix_path.exists()

    # Assert: Mix is valid audio
    audio, sr = sf.read(artifacts.mix_path)
    assert sr == 44100
    assert len(audio) > 0
```

### Test Framework Recommendation

**pytest** (industry standard):

```bash
pip install pytest pytest-cov pytest-mock
```

**Directory Structure**:
```
ThreadToHitRemix/
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Shared fixtures
│   ├── fixtures/
│   │   ├── sample_thread.txt
│   │   ├── dry_vocal.wav
│   │   └── test_config.yaml
│   ├── test_mixer.py
│   ├── test_story_extractor.py
│   ├── test_lyric_generator.py
│   ├── test_integration.py
│   └── test_e2e.py
```

**Running Tests**:
```bash
pytest tests/                    # All tests
pytest tests/test_mixer.py       # Single file
pytest -k test_mix               # Pattern match
pytest --cov=scripts --cov-report=html  # Coverage report
```

---

## Common Tasks & Recipes

### Task 1: Change Lyric Style

**Goal**: Switch from NEFFEX rap to pop ballad style.

**Steps**:
1. Edit `scripts/lyric_generator.py:29-70` (lyric prompt)
2. Change genre hint in `workflow.py:60`:
   ```python
   lyrics = self.lyric_gen.write_song(
       story_json,
       genre_hint="emotional pop ballad",  # Changed
       tempo=self.config["target_bpm"],
   )
   ```
3. Update temperature for more emotional variation:
   ```yaml
   # configs/pipeline.yaml
   lyrics:
     temperature: 0.8  # Higher = more creative
   ```

### Task 2: Use Better MusicGen Model

**Goal**: Improve beat quality with larger model.

**Steps**:
1. Edit `configs/pipeline.yaml`:
   ```yaml
   workflow:
     beat_preset: "facebook/musicgen-medium"  # Was musicgen-small
   ```
2. Verify VRAM availability:
   ```bash
   python -c "import torch; print('Available VRAM:', torch.cuda.get_device_properties(0).total_memory / 1e9, 'GB')"
   ```
3. If OOM, reduce duration:
   ```yaml
   workflow:
     beat_duration_seconds: 20  # Was 30
   ```

### Task 3: Add Custom Claude Model

**Goal**: Use Claude Opus for highest quality lyrics.

**Steps**:
1. Edit `configs/pipeline.yaml`:
   ```yaml
   lyrics:
     model: "claude-3-opus-20240229"  # Was sonnet
     max_output_tokens: 1500  # Opus supports longer outputs
   ```
2. Expect **10x cost increase** (~$30/song vs $3)

### Task 4: Adjust Mix Balance

**Goal**: Make vocals louder relative to instrumental.

**Steps**:
1. Edit `configs/pipeline.yaml`:
   ```yaml
   mixing:
     vocal_gain_db: 0.0        # Was -1.0 (louder)
     instrumental_gain_db: -6.0  # Was -3.0 (quieter)
   ```
2. Test mix:
   ```bash
   python main.py --thread inputs/threads/test.txt --voice inputs/voice/test.wav
   # Listen to outputs/thread_to_hit.wav
   ```

### Task 5: Skip Voice Conversion

**Goal**: Run pipeline without RVC (faster testing).

**Steps**:
1. Don't provide `--voice` flag:
   ```bash
   python main.py --thread inputs/threads/test.txt
   # Skips voice conversion step
   ```
2. Update `workflow.py:63-70` to handle missing vocals in mix:
   ```python
   if user_voice:
       styled_vocals_path = self.rvc.convert(...)
       mix_path = self.mixer.mix(beat_path, styled_vocals_path, ...)
   else:
       # Just copy instrumental as "mix"
       mix_path = self.output_root / self.config["mixdown_filename"]
       shutil.copy(beat_path, mix_path)
   ```

### Task 6: Batch Process Multiple Threads

**Goal**: Generate songs for all threads in `inputs/threads/`.

**Steps**:
1. Create batch script (`batch_process.py`):
   ```python
   from pathlib import Path
   import subprocess

   threads_dir = Path("inputs/threads")
   voice_path = Path("inputs/voice/default_vocal.wav")

   for thread_file in threads_dir.glob("*.txt"):
       print(f"Processing {thread_file.name}...")
       subprocess.run([
           "python", "main.py",
           "--thread", str(thread_file),
           "--voice", str(voice_path),
       ], check=True)
   ```
2. Run:
   ```bash
   python batch_process.py
   ```

### Task 7: Export Stems Separately

**Goal**: Save instrumental and vocals separately (not just mix).

**Steps**:
1. `workflow.py` already saves stems:
   - `outputs/instrumental.wav`
   - `outputs/styled_vocals.wav`
2. To use in DAW (Ableton, Logic), import both files to separate tracks

### Task 8: Debug Claude API Calls

**Goal**: See exact prompts and responses.

**Steps**:
1. Add logging to `story_extractor.py`:
   ```python
   # Before API call
   print("=== STORY EXTRACTION PROMPT ===")
   print(system_prompt)
   print(f"User: {thread_text[:200]}...")

   # After API call
   print("=== CLAUDE RESPONSE ===")
   print(response.content[0].text)
   ```
2. Run pipeline and check console output

---

## Troubleshooting Guide

### Issue 1: MusicGen OOM (Out of Memory)

**Symptoms**:
```
torch.cuda.OutOfMemoryError: CUDA out of memory. Tried to allocate 2.50 GiB
```

**Solutions**:
1. Use smaller model:
   ```yaml
   workflow:
     beat_preset: "facebook/musicgen-small"  # Default (1.5GB VRAM)
   ```
2. Reduce duration:
   ```yaml
   workflow:
     beat_duration_seconds: 15  # Was 30
   ```
3. Clear CUDA cache before running:
   ```python
   import torch
   torch.cuda.empty_cache()
   ```

### Issue 2: RVC Conversion Fails Silently

**Symptoms**:
```
subprocess.CalledProcessError: Command '...' returned non-zero exit status 1
```

**Diagnosis**:
1. Check RVC installation:
   ```bash
   python deps/RVC-WebUI/infer-web.py --help
   ```
2. Verify voice model exists:
   ```bash
   ls -lh models/neffex_placeholder.wav
   ```

**Solutions**:
1. Re-run setup:
   ```bash
   python setup.py
   ```
2. Manual RVC test:
   ```bash
   cd deps/RVC-WebUI
   python infer-web.py \
     --f0p rmvpe \
     --input_path ../../inputs/voice/test.wav \
     --output_path ../../outputs/test_rvc.wav \
     --model_name neffex_placeholder
   ```

### Issue 3: Claude API 429 (Rate Limit)

**Symptoms**:
```
anthropic.RateLimitError: 429 Too Many Requests
```

**Solutions**:
1. Check Anthropic dashboard for current limits
2. Add retry logic (see [Error Handling](#error-handling))
3. Reduce request frequency:
   ```bash
   for thread in threads/*.txt; do
       python main.py --thread "$thread" --voice voice.wav
       sleep 5  # Wait 5 seconds between runs
   done
   ```

### Issue 4: Librosa Can't Load Audio

**Symptoms**:
```
soundfile.LibsndfileError: Error opening 'file.wav': System error
```

**Solutions**:
1. Install FFmpeg:
   ```bash
   # Ubuntu/Debian
   sudo apt install ffmpeg

   # macOS
   brew install ffmpeg
   ```
2. Convert audio to supported format:
   ```bash
   ffmpeg -i input.mp3 -ar 44100 -ac 1 -sample_fmt s16 output.wav
   ```

### Issue 5: Missing ANTHROPIC_API_KEY

**Symptoms**:
```
RuntimeError: ANTHROPIC_API_KEY missing. Add it to your .env file.
```

**Solutions**:
1. Create `.env` file in project root:
   ```bash
   echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env
   ```
2. Verify loading:
   ```bash
   python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('ANTHROPIC_API_KEY'))"
   ```

### Issue 6: CUDA Not Available

**Symptoms**:
```
torch.cuda.is_available() returns False
```

**Solutions**:
1. Install CUDA toolkit:
   - Download from [NVIDIA](https://developer.nvidia.com/cuda-downloads)
   - Match version with PyTorch build
2. Reinstall PyTorch with CUDA:
   ```bash
   pip uninstall torch
   pip install torch --index-url https://download.pytorch.org/whl/cu118  # CUDA 11.8
   ```
3. Fall back to CPU (slow):
   ```python
   # beat_maker.py:31
   self.model = MusicGen.get_pretrained(self.preset, device="cpu")
   ```

### Issue 7: Lyrics JSON Parsing Error

**Symptoms**:
```
json.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

**Diagnosis**: Claude returned invalid JSON (rare but possible).

**Solutions**:
1. Add JSON validation:
   ```python
   # lyric_generator.py:53
   try:
       lyrics = json.loads(response.content[0].text)
   except json.JSONDecodeError:
       print("=== INVALID RESPONSE ===")
       print(response.content[0].text)
       raise
   ```
2. Adjust temperature (lower = more consistent):
   ```yaml
   lyrics:
     temperature: 0.5  # Was 0.7
   ```

---

## Improvement Opportunities

### High Priority

1. **Add Test Suite**
   - Unit tests for audio processing functions
   - Integration tests for API interactions
   - End-to-end smoke tests
   - **Impact**: Prevent regressions, enable safe refactoring

2. **Implement Logging**
   - Replace `print()` with `logging` module
   - Add structured logging (JSON format)
   - Include timing metrics for each stage
   - **Impact**: Better debugging, performance profiling

3. **Error Recovery**
   - Retry logic for Claude API (exponential backoff)
   - Graceful degradation (skip optional stages)
   - Detailed error messages for RVC failures
   - **Impact**: More robust pipeline, better UX

4. **Real Hit Predictor**
   - Train model on Spotify API features + chart data
   - Use actual hit/non-hit labels
   - Add confidence intervals
   - **Impact**: Meaningful feedback to users

### Medium Priority

5. **Async/Parallel Processing**
   - Generate beat and convert vocals in parallel (independent stages)
   - Use `asyncio` for Claude API calls
   - **Impact**: 30-40% faster pipeline execution

6. **Configuration Validation**
   - Use Pydantic for schema validation
   - Check required files exist at startup
   - Validate audio format/sample rate
   - **Impact**: Fail-fast, better error messages

7. **Metrics/Monitoring**
   - Track API costs per song
   - Log execution time per stage
   - Monitor VRAM usage
   - **Impact**: Cost optimization, performance tuning

8. **Better RVC Integration**
   - Use RVC Python API (avoid subprocess)
   - Better error handling with stderr capture
   - Support multiple voice models per song
   - **Impact**: Faster conversion, better reliability

### Low Priority

9. **Web UI**
   - Gradio/Streamlit interface
   - Drag-and-drop thread/voice upload
   - Live preview of lyrics/mix
   - **Impact**: Easier for non-technical users

10. **Audio Mastering**
    - LUFS normalization
    - Multi-band compression
    - Stereo widening
    - **Impact**: Professional-quality output

11. **Extended Lyric Formats**
    - Support AABBCC, AAAA structures
    - Multilingual lyrics (Spanish, French, etc.)
    - Genre-specific templates (country, rock, etc.)
    - **Impact**: More creative flexibility

12. **Version Control for Outputs**
    - Git-like diffing for lyrics
    - A/B testing for mix variations
    - Rollback to previous generations
    - **Impact**: Easier iteration on creative work

---

## File Location Reference

Quick reference for key files:

| File | Location | Purpose |
|------|----------|---------|
| CLI Entry | `/home/user/music/ThreadToHitRemix/main.py` | Argument parsing, workflow invocation |
| Workflow | `/home/user/music/ThreadToHitRemix/scripts/workflow.py` | Pipeline orchestration |
| Story Extractor | `/home/user/music/ThreadToHitRemix/scripts/story_extractor.py` | Claude story extraction |
| Lyric Generator | `/home/user/music/ThreadToHitRemix/scripts/lyric_generator.py` | Claude lyric generation |
| Beat Maker | `/home/user/music/ThreadToHitRemix/scripts/beat_maker.py` | MusicGen wrapper |
| Voice Converter | `/home/user/music/ThreadToHitRemix/scripts/voice_converter.py` | RVC integration |
| Mixer | `/home/user/music/ThreadToHitRemix/scripts/mixer.py` | Audio mixing |
| Hit Predictor | `/home/user/music/ThreadToHitRemix/scripts/hit_predictor.py` | Track scoring |
| Config | `/home/user/music/ThreadToHitRemix/configs/pipeline.yaml` | Pipeline settings |
| Dependencies | `/home/user/music/ThreadToHitRemix/requirements.txt` | Python packages |
| Setup | `/home/user/music/ThreadToHitRemix/setup.py` | Dependency installer |
| README | `/home/user/music/ThreadToHitRemix/README.md` | User documentation |

---

## Questions & Support

### For AI Assistants

When working on this codebase:

1. **Always read existing modules before modifying** - Understand the current patterns
2. **Preserve type hints and dataclasses** - Core to codebase quality
3. **Test manually after changes** - No automated tests exist
4. **Update CLAUDE.md** - Keep this document current
5. **Check VRAM before adding models** - GPU memory is limited
6. **Validate Claude API costs** - Each song costs ~$3-4

### For Human Developers

- **GitHub Issues**: Report bugs or request features
- **Anthropic Docs**: [Claude API Reference](https://docs.anthropic.com/)
- **MusicGen Docs**: [AudioCraft Repository](https://github.com/facebookresearch/audiocraft)
- **RVC Docs**: [RVC-WebUI Wiki](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI/wiki)

---

**Last Updated**: 2025-11-16 | **Maintainer**: AI Assistant | **Status**: Active Development
