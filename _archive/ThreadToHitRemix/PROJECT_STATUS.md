# ThreadToHitRemix - Project Status & Tracking

**Last Updated:** 2025-11-15
**Status:** ~80% Complete - Core Pipeline Functional, Polish Features Missing
**Branch:** claude/review-repo-setup-01TWSahhB8dmW7qkYSTXESGq

---

## Executive Summary

ThreadToHitRemix is a working AI music production pipeline that transforms forum threads into finished songs. The core 8-stage pipeline is functional and can produce streaming-ready tracks. However, two vocal processing features are configured but not implemented (pitch correction, formant shift), and several polish/automation features from the original vision remain unbuilt.

**Critical Dependency:** This project REQUIRES paid Anthropic Claude API access ($0.01-0.02 per song). The LLM calls are fundamental to the concept - they extract narratives and generate lyrics from raw thread text.

---

## What Works Right Now (Ready to Use)

### ✅ Fully Functional Features

1. **Story Extraction** (scripts/story_extractor.py)
   - Reads forum thread text (file or URL)
   - Uses Claude Haiku to extract narrative arc
   - Outputs: hook, protagonist, conflict, emotional palette
   - Status: PRODUCTION READY

2. **Lyric Generation** (scripts/lyric_generator.py)
   - Transforms story into NEFFEX-style rap lyrics
   - Uses Claude Sonnet for creative generation
   - ABABCB structure with antimetabole patterns
   - Status: PRODUCTION READY

3. **Beat/Instrumental Creation** (scripts/beat_maker.py)
   - Meta MusicGen model integration
   - Configurable duration (20-30s), BPM (100-130), preset (small/medium/large)
   - GPU-accelerated generation
   - Status: PRODUCTION READY

4. **Vocal Enhancement** (scripts/vocal_enhancer.py)
   - Spectral denoising with adaptive noise gate
   - Highpass filtering (80Hz cutoff)
   - Pitch detection via librosa PYIN + FFT
   - Vocal doubler effect (15ms delay, 8 cent detune)
   - SNR estimation and key detection
   - Status: PRODUCTION READY

5. **Voice Conversion** (scripts/voice_converter.py)
   - RVC-WebUI subprocess integration
   - RMVPE pitch detection
   - Configurable blending (enhanced + RVC mix)
   - Status: PRODUCTION READY

6. **Mixing** (scripts/mixer.py)
   - Gain staging (independent vocal/instrumental control)
   - Echo effect (0.25s delay, 0.35 decay)
   - Stem synchronization and blending
   - Status: PRODUCTION READY

7. **Mastering** (scripts/mixer.py)
   - LUFS normalization to -9.5 (streaming standard)
   - Loudness metering (ITU-R BS.1770-4)
   - Status: PRODUCTION READY (basic)

8. **Hit Prediction** (scripts/hit_predictor.py)
   - Tempo, energy, repetition feature extraction
   - Logistic regression classifier
   - Actionable feedback generation
   - Status: WORKING BUT UNVALIDATED (trained on synthetic data)

9. **End-to-End Workflow** (scripts/workflow.py + main.py)
   - CLI orchestration of all stages
   - YAML configuration system
   - Multiple vocal modes (raw/enhanced/rvc)
   - Status: PRODUCTION READY

### 📦 Complete Test Suite

Located in tests/test_integration.py:
- Vocal mode testing (raw, enhanced, rvc)
- Blending tests (0.0, 0.5, 1.0 ratios)
- LUFS normalization validation
- Complete pipeline integration test
- Status: PASSING

---

## What's Broken/Missing

### ❌ Configured But NOT Implemented

These features are enabled in configs/pipeline.yaml but throw warnings when used:

1. **Pitch Correction**
   - Config: `vocals.pitch_correction: true` (line 32)
   - Code: Stubbed in vocal_enhancer.py:84
   - Warning: "Pitch correction requested but not yet implemented (TODO)"
   - Impact: Can detect pitch but can't auto-correct off-key vocals
   - **Users will be confused if they enable this**

2. **Formant Shift**
   - Config: `vocals.enhancer.formant_shift: -1.2` (line 37)
   - Code: Stubbed in vocal_enhancer.py:90
   - Warning: "Formant shift requested but not yet implemented (TODO)"
   - Impact: Can't adjust vocal timbre (darker/brighter voice)
   - **Users will be confused if they enable this**

**IMMEDIATE ACTION NEEDED:** Either implement these or remove from config to prevent user confusion.

### ⚠️ Partially Complete / Needs Validation

1. **Hit Predictor**
   - Works but trained on 256 synthetic samples
   - Not validated against real Spotify/Billboard chart data
   - Feedback may not correlate with actual commercial success
   - Good for learning, not for real A&R decisions

2. **Mastering Pipeline**
   - Only does LUFS normalization
   - Missing: multiband compression, stereo widening, final EQ
   - Good enough for demos, not professional releases

### 🚧 Mentioned in README But Not Built

1. **Release Automation**
   - No metadata tagging (artist, title, ISRC, album art)
   - No format conversion (MP3, FLAC, M4A export)
   - No distribution upload (DistroKid, SoundCloud, Bandcamp)
   - Manual export required

2. **Evaluation Framework**
   - No A/B testing capability
   - No listener feedback collection
   - No iterative refinement workflow

3. **Documentation Gaps**
   - Missing sample_thread.txt in data/prompts/ (referenced in README)
   - No example output files
   - No vocal mode comparison guide
   - No RVC troubleshooting section

---

## Critical Dependency: Anthropic Claude API

### The Situation

This project makes **2 paid API calls per song** to Anthropic Claude:

| Call | Model | Cost/Call | Purpose |
|------|-------|-----------|---------|
| Story extraction | claude-3-haiku-20240307 | ~$0.003 | Extract narrative from thread |
| Lyric generation | claude-3-sonnet-20240229 | ~$0.012 | Generate NEFFEX-style lyrics |

**Total cost per song: ~$0.015 (1.5 cents)**

### Why This Might Be a Surprise

If you didn't originally plan for LLM API costs, this could be unexpected. However, your README states:

> "Turn messy community threads into finished songs using Claude, MusicGen, RVC, and Librosa."

Claude is listed as a core dependency, suggesting this was part of the design. The API calls are not optional - they're the creative engine that transforms unstructured thread text into songwriting material.

### Alternatives to Paid API (If You Want to Remove Dependency)

If you want to eliminate the Anthropic costs, here are options:

**Option 1: Local LLM Replacement**
- Replace Anthropic SDK with Ollama/llama.cpp
- Use local models like Llama 3.1 8B or Mistral 7B
- Pros: No API costs, full privacy
- Cons: Requires powerful hardware (16GB+ VRAM), slower, lower quality lyrics

**Option 2: Manual Story/Lyric Input**
- Remove story_extractor.py and lyric_generator.py
- Accept pre-written story summaries and lyrics as input
- Pros: No AI costs at all
- Cons: User must write their own lyrics (defeats automation purpose)

**Option 3: Template-Based Generation**
- Create lyric templates with fill-in-the-blank patterns
- Use simple keyword extraction from threads (no LLM)
- Pros: Free, fast
- Cons: Generic lyrics, no narrative coherence, loss of quality

**Option 4: Keep Claude (Recommended)**
- Cost is minimal ($0.015/song = $1.50 for 100 songs)
- Quality is significantly better than local models
- Haiku + Sonnet provide good balance of speed/cost/quality

**My Recommendation:** Keep the Claude API. The cost is negligible compared to the time saved, and the quality is dramatically better than alternatives. If budget is an issue, switch both calls to Haiku (cheaper but still good).

### How to Switch to Free Local LLMs (If Needed)

1. Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`
2. Pull model: `ollama pull llama3.1:8b`
3. Replace Anthropic client in story_extractor.py and lyric_generator.py:
   ```python
   # Old
   from anthropic import Anthropic
   client = Anthropic(api_key=key)

   # New
   import ollama
   response = ollama.chat(model='llama3.1:8b', messages=[...])
   ```
4. Update requirements.txt: remove anthropic, add ollama

**Estimated effort:** 2-4 hours to refactor + test

---

## Project File Structure

```
ThreadToHitRemix/
├── configs/
│   ├── pipeline.yaml       # Production settings (30s beats, RVC enabled)
│   └── fast.yaml           # Quick iteration (20s beats, RVC disabled)
├── data/prompts/           # (MISSING) Sample thread examples
├── deps/                   # Cloned external repos (gitignored)
│   ├── audiocraft/         # Meta MusicGen source
│   └── RVC-WebUI/          # Voice conversion
├── inputs/
│   ├── threads/            # Raw forum thread text files
│   └── voice/              # Dry vocal recordings (WAV)
├── models/                 # RVC voice model checkpoints (gitignored)
│   └── neffex_placeholder.wav  # (Should be .pth file, not WAV)
├── outputs/                # Generated files (gitignored)
│   ├── lyrics.json         # Claude-generated lyrics
│   ├── instrumental.wav    # MusicGen beat
│   ├── enhanced_vocals.wav # Denoised/EQ'd vocals
│   ├── rvc_vocals.wav      # Voice-converted vocals
│   ├── blended_vocals.wav  # Mix of enhanced + RVC
│   ├── premix.wav          # Pre-mastering mix
│   └── thread_to_hit.wav   # Final mastered track
├── scripts/
│   ├── story_extractor.py  # Claude narrative extraction
│   ├── lyric_generator.py  # Claude lyric generation
│   ├── beat_maker.py       # MusicGen wrapper
│   ├── vocal_enhancer.py   # Librosa audio processing
│   ├── voice_converter.py  # RVC subprocess integration
│   ├── mixer.py            # Stem mixing + LUFS mastering
│   ├── hit_predictor.py    # ML-based scoring
│   └── workflow.py         # Pipeline orchestration
├── tests/
│   └── test_integration.py # Full pipeline tests
├── main.py                 # CLI entry point
├── setup.py                # Dependency installer
├── requirements.txt        # Python packages
├── README.md               # Installation & basic usage
├── PROJECT_STATUS.md       # This file
└── .env                    # ANTHROPIC_API_KEY (not in repo)
```

---

## Git History Context

Recent commits (most recent first):

```
34b240d - Love You 김정은
8d06418 - Add quality-first vocal enhancement pipeline
78f53ca - one_juche
```

The "quality-first vocal enhancement pipeline" commit suggests recent focus on improving vocal processing quality. The cryptic commit messages don't provide much context about feature development.

---

## Dependencies & System Requirements

### Required

- Python 3.10+
- CUDA-capable GPU (8GB+ VRAM recommended)
- CUDA toolkit + cuDNN matching PyTorch version
- FFmpeg (system binary)
- Anthropic API key (ANTHROPIC_API_KEY env var)
- ~10GB disk space (models + outputs)

### Python Packages (requirements.txt)

- anthropic >= 0.39.0 (Claude API)
- audiocraft >= 1.2.0 (MusicGen)
- torch == 2.1.0 + torchaudio (GPU acceleration)
- librosa >= 0.10.2 (audio analysis)
- soundfile >= 0.12.1 (WAV I/O)
- scikit-learn >= 1.5.0 (hit predictor)
- scipy >= 1.11.0 (signal processing)
- pyloudnorm >= 0.1.1 (LUFS mastering)
- requests, pyyaml, python-dotenv (utilities)

### External Tools

- RVC-WebUI (cloned to deps/RVC-WebUI)
- AudioCraft (cloned to deps/audiocraft)

---

## Known Issues & Limitations

1. **RVC Model Path Issue**
   - Config references `models/neffex_placeholder.wav`
   - RVC expects .pth checkpoint files, not WAV
   - May cause RVC stage to fail silently

2. **GPU Memory Constraints**
   - MusicGen large preset requires 16GB+ VRAM
   - Use `facebook/musicgen-small` if you OOM
   - Duration > 30s can cause crashes

3. **Hit Predictor Unreliable**
   - Trained on synthetic data
   - Not validated against real chart performance
   - Feedback is educational only, not predictive

4. **No Multi-Track Support**
   - Single vocal + single instrumental only
   - Can't layer harmonies or ad-libs
   - Can't separate drum stems for individual mixing

5. **No Real-Time Preview**
   - Must wait for full pipeline to complete
   - No intermediate playback during generation
   - Iteration can be slow (5-10 min per song)

6. **Thread URL Fetching**
   - Basic HTTP GET with no auth
   - Can't scrape behind login walls (Reddit auth, Discord, etc.)
   - No HTML parsing for structured forums

---

## Configuration Deep Dive

### configs/pipeline.yaml (Production Settings)

```yaml
workflow:
  sample_rate: 44100              # CD quality
  beat_duration_seconds: 30       # Full beat length
  beat_preset: "facebook/musicgen-small"  # VRAM-friendly
  target_bpm: 120                 # Mid-tempo
  vocal_mode: "rvc"               # Full processing chain

vocals:
  pitch_correction: true          # ❌ NOT IMPLEMENTED
  rvc_blend: 0.7                  # 70% RVC, 30% enhanced
  enhancer:
    denoise_db: 18                # Aggressive noise removal
    formant_shift: -1.2           # ❌ NOT IMPLEMENTED
    doubler_mix: 0.35             # Vocal richness

mixing:
  vocal_gain_db: -1.0             # Vocal level
  instrumental_gain_db: -3.0      # Beat level (quieter)
  echo_delay_seconds: 0.25        # Quarter note echo
  echo_decay: 0.35                # Echo fade rate

mastering:
  target_lufs: -9.5               # Streaming loudness standard
```

### configs/fast.yaml (Iteration Settings)

- Shorter beats (20s vs 30s)
- Lighter denoising (12dB vs 18dB)
- Skip RVC (enhanced mode only)
- Skip hit predictor
- Same LUFS target

**Use fast.yaml when:** Experimenting with prompts, testing lyric styles, iterating quickly

**Use pipeline.yaml when:** Creating final releasable tracks

---

## Where to Continue Development

### Priority 1: Fix Configured-But-Broken Features (2-4 hours)

**Option A - Implement Pitch Correction:**
```python
# In vocal_enhancer.py, replace line 84 stub:
if self.config.get("pitch_correction", False):
    target_key = self.config.get("target_key", "auto")

    # Get detected key from pitch detection
    if target_key == "auto":
        target_key = detected_key  # Use librosa detection

    # Convert key to semitone shift
    semitone_shift = calculate_semitone_shift(detected_key, target_key)

    # Apply pitch shift
    audio = librosa.effects.pitch_shift(
        audio, sr=sr, n_steps=semitone_shift
    )
```

**Option B - Remove from Config:**
- Delete lines 32-33 from configs/pipeline.yaml
- Users won't expect feature that doesn't exist

**Implement Formant Shift OR Remove:**

Formant shift is complex (requires phase vocoder). Recommend removing from config unless you have 4-8 hours to implement properly.

### Priority 2: Validate Hit Predictor (4-8 hours)

1. Collect real song data:
   - Spotify API: get audio features for Top 200 tracks
   - Billboard Hot 100: historical chart data
   - Label as hit (top 40) vs. non-hit

2. Extract same features (tempo, energy, repetition)

3. Retrain LogisticRegression on real data

4. Validate with holdout set

5. Update feedback thresholds based on real correlations

### Priority 3: Add Advanced Mastering (8-12 hours)

Create new `scripts/mastering.py`:

1. **Multiband Compression**
   - Low (20-250Hz): compression for tight bass
   - Mid (250Hz-5kHz): compression for vocal clarity
   - High (5kHz+): gentle compression for air

2. **Stereo Widening**
   - M/S processing to widen instrumental, keep vocals centered
   - Prevents mono-compatibility issues

3. **Final EQ**
   - High shelf boost for sparkle
   - Low shelf for warmth
   - Notch filter for problem frequencies

4. **Limiter**
   - True peak limiting to -0.3dBFS
   - Prevents clipping on streaming platforms

**Recommended library:** `pydub` or `pedalboard` (Spotify's audio effects library)

### Priority 4: Release Automation (4-6 hours)

Create new `scripts/release.py`:

1. **Metadata Tagging**
   - Use `mutagen` library for MP3/M4A tagging
   - Artist, title, album, ISRC, album art embedding
   - Accept metadata from YAML or CLI args

2. **Format Conversion**
   - WAV → MP3 (320kbps for streaming)
   - WAV → FLAC (lossless archival)
   - WAV → M4A (Apple Music, iTunes)
   - Use ffmpeg subprocess

3. **Distribution Upload** (optional)
   - DistroKid API integration
   - SoundCloud API upload
   - S3/cloud storage backup

### Priority 5: User Experience Improvements (2-4 hours)

1. **Add Example Files**
   - Create data/prompts/sample_thread.txt with good example
   - Include example vocal recording
   - Add example outputs to outputs_examples/ (not gitignored)

2. **Better Error Messages**
   - Catch CUDA OOM and suggest smaller MusicGen preset
   - Detect missing .env and print setup instructions
   - Validate RVC model path before running pipeline

3. **Progress Indicators**
   - Add tqdm progress bars for long operations
   - Print stage names as pipeline runs
   - Estimate time remaining

4. **Vocal Mode Comparison Tool**
   - Script to generate same song with raw/enhanced/rvc modes
   - Side-by-side waveform visualization
   - Helps users pick best mode for their voice

### Priority 6: Advanced Features (Future)

1. **Multi-Track Support**
   - Accept multiple vocal files (lead, harmony, ad-libs)
   - Individual RVC processing per track
   - Separate mixing controls

2. **Batch Processing**
   - Process multiple threads in parallel
   - Queue system for GPU-limited environments
   - Aggregate hit prediction analytics

3. **Web UI**
   - Gradio or Streamlit interface
   - Drag-and-drop thread upload
   - Real-time waveform preview
   - Download button for final mix

4. **Fine-Tuned Lyric Model**
   - Collect corpus of NEFFEX lyrics
   - Fine-tune GPT-2/Llama on specific style
   - More consistent style adherence

5. **Interactive Editing**
   - Edit generated lyrics before vocal processing
   - Adjust beat BPM/key after generation
   - Re-mix with different gain staging

---

## Development Environment Setup

If someone new (or future you) needs to pick this up:

```bash
# 1. Clone repo
git clone <repo-url>
cd ThreadToHitRemix

# 2. Create virtual environment
python3.10 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
python setup.py  # Clones audiocraft + RVC

# 4. Configure API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# 5. Download RVC model (if not exists)
# Place .pth checkpoint in models/
# Update configs/pipeline.yaml voice_model_path

# 6. Run tests
python -m pytest tests/

# 7. Test pipeline
python main.py \
  --thread inputs/threads/test.txt \
  --voice inputs/voice/test.wav \
  --preset fast  # Use fast config for first test
```

---

## Testing Strategy

### Current Test Coverage (tests/test_integration.py)

- ✅ Vocal mode switching (raw/enhanced/rvc)
- ✅ Blending ratios (0.0, 0.5, 1.0)
- ✅ LUFS normalization accuracy
- ✅ Complete pipeline integration
- ❌ No story extraction tests (requires API mocking)
- ❌ No lyric generation tests (requires API mocking)
- ❌ No beat generation tests (too slow for CI)

### Recommended Additional Tests

1. **Unit Tests for Audio Processing**
   - Test spectral denoising at various thresholds
   - Test pitch detection accuracy with known frequencies
   - Test vocal doubler effect parameters

2. **API Mocking Tests**
   - Mock Anthropic responses for story/lyric generation
   - Test JSON parsing edge cases
   - Test error handling for API failures

3. **End-to-End Tests**
   - Full pipeline with real thread → final WAV
   - Validate output file formats (sample rate, bit depth)
   - Check LUFS within tolerance of target

4. **Performance Tests**
   - Measure GPU memory usage per preset
   - Time each pipeline stage
   - Identify bottlenecks

---

## Cost Analysis

### Per-Song Costs

| Item | Cost | Notes |
|------|------|-------|
| Claude API (story) | $0.003 | Haiku, ~700 tokens |
| Claude API (lyrics) | $0.012 | Sonnet, ~800 tokens |
| MusicGen (compute) | $0.00 | Free, local GPU |
| RVC (compute) | $0.00 | Free, local GPU |
| **Total per song** | **$0.015** | ~1.5 cents |

### Scaling Costs

- 100 songs: $1.50
- 1,000 songs: $15.00
- 10,000 songs: $150.00

**GPU Costs (if using cloud):**
- AWS g5.xlarge (A10G): ~$1.20/hour
- Average song generation: ~10 minutes
- Cost per song: ~$0.20 (13x more than API costs)

**Recommendation:** Run locally if you have a GPU. API costs are trivial compared to cloud compute.

---

## Quick Reference Commands

```bash
# Fast iteration (20s beats, no RVC)
python main.py \
  --thread inputs/threads/my_thread.txt \
  --voice inputs/voice/my_vocal.wav \
  --config configs/fast.yaml

# Full production (30s beats, RVC enabled)
python main.py \
  --thread inputs/threads/my_thread.txt \
  --voice inputs/voice/my_vocal.wav \
  --config configs/pipeline.yaml

# Skip RVC even with default config
python main.py \
  --thread inputs/threads/my_thread.txt \
  --voice inputs/voice/my_vocal.wav \
  --vocal-mode enhanced

# Use URL instead of file
python main.py \
  --thread-url https://example.com/forum/thread.html \
  --voice inputs/voice/my_vocal.wav

# Custom RVC installation
python main.py \
  --thread inputs/threads/my_thread.txt \
  --voice inputs/voice/my_vocal.wav \
  --rvc-root /path/to/custom/RVC-WebUI
```

---

## Decision Points for Future Development

### Should You Continue This Project?

**Continue if:**
- ✅ You enjoy music production automation
- ✅ You're okay with ~$0.015/song API costs
- ✅ You have access to a CUDA GPU
- ✅ You want to experiment with AI music generation

**Pivot if:**
- ❌ API costs are unacceptable (switch to local LLMs)
- ❌ You want professional mastering quality (hire audio engineer)
- ❌ You need real-time generation (this is batch-only)
- ❌ You want commercial chart success (hit predictor is unvalidated)

### Potential Pivots

1. **Content Creator Tool**
   - Focus on YouTube/TikTok background music
   - Remove hit prediction, add video sync
   - Royalty-free licensing workflow

2. **Educational Platform**
   - Teach music production concepts
   - Visualize each processing stage
   - Interactive parameter tuning

3. **Community Music Project**
   - Multi-user thread → song collaboration
   - Voting on best generated lyrics/beats
   - Social sharing integration

4. **RVC Voice Model Marketplace**
   - Focus on the voice conversion aspect
   - Curated library of RVC checkpoints
   - User uploads → instant NEFFEX-style conversion

---

## Support & Resources

### Documentation
- README.md - Installation and basic usage
- This file (PROJECT_STATUS.md) - Current state and roadmap
- Code comments - Implementation details

### External Resources
- AudioCraft docs: https://github.com/facebookresearch/audiocraft
- RVC-WebUI docs: https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- Librosa docs: https://librosa.org/doc/latest/index.html
- Anthropic API docs: https://docs.anthropic.com/

### Getting Help
- Check configs/pipeline.yaml for all tunable parameters
- Run tests: `python -m pytest tests/ -v`
- Enable debug logging (add to main.py): `logging.basicConfig(level=logging.DEBUG)`
- Check GPU usage: `nvidia-smi`

---

## Final Notes

This project is a impressive technical achievement - you've successfully integrated 4 complex AI systems (Claude, MusicGen, RVC, ML scoring) into a cohesive pipeline. The ~80% completion rate is solid for an experimental music AI project.

The Claude API dependency is NOT a mistake - it's essential to the creative automation. Without it, you'd need to manually write lyrics for every thread, defeating the purpose.

**Biggest gaps:**
1. Pitch correction / formant shift configured but not implemented
2. Hit predictor trained on fake data
3. Advanced mastering missing
4. No release automation

**Easiest wins:**
1. Add example files to repo
2. Fix or remove pitch correction config
3. Better error messages
4. Progress bars

**Recommended next steps:**
1. Decide if you're okay with Claude API costs (or switch to local LLMs)
2. Either implement or remove pitch_correction/formant_shift from config
3. Create example thread + vocal files for new users
4. Run the pipeline and make some music!

Good luck with wherever this project goes next!
