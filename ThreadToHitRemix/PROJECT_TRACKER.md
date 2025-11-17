# ThreadToHitRemix Project Tracker

_Updated: 2025-11-15_

## 1. Product Snapshot
- **Goal**: Transform long-form community/forum threads plus a user vocal into a fully mixed motivational rap track using Claude (story + lyrics), MusicGen (instrumental), Librosa/pyloudnorm (mixing/mastering), and RVC (voice conversion).
- **Primary Entry Point**: `main.py` CLI. Users provide `--thread` (file) or `--thread-url` plus an optional `--voice` WAV. Pipeline configs live in `configs/pipeline.yaml` (default) and `configs/fast.yaml` (quick iteration).
- **Outputs** (under `outputs/`): `lyrics.json`, `instrumental.wav`, `enhanced_vocals.wav`, optional `rvc_vocals.wav`, blended vocals, mastered `thread_to_hit.wav`, hit predictor feedback.

## 2. Current Architecture
1. **Thread ingestion** – `scripts/story_extractor.load_thread` loads local files or fetches HTTP(S).
2. **Narrative extraction** – `StoryExtractor` (Anthropic Claude) converts raw thread text into a `StorySummary` (hook/protagonist/conflict/etc.).
3. **Lyric generation** – `LyricGenerator` (Anthropic Claude) transforms the structured summary into NEFFEX-style ABABCB sections.
4. **Beat creation** – `BeatMaker` loads `facebook/musicgen-small` via AudioCraft, runs `model.generate`, and saves `instrumental.wav`.
5. **Vocal processing** – `VocalEnhancer` denoises + high-passes + optional doubler; optional `RvcVoiceConverter` shells into `deps/RVC-WebUI/infer-web.py`; `StemMixer.blend_vocals` mixes enhanced and RVC stems.
6. **Mix & master** – `StemMixer.mix` gain-stages, pads, applies echo, writes `premix.wav`; `StemMixer.normalize_lufs` targets `-9.5 LUFS` into final mix file.
7. **Hit scoring** – `HitPredictor` builds simple audio features (tempo, RMS, repetition) and prints heuristic feedback.

Supporting tooling: `setup.py` clones AudioCraft + RVC repos, installs Python dependencies, ensures `inputs/threads` and `inputs/voice` exist, and downloads a placeholder NEFFEX checkpoint.

## 3. External API / Service Usage
| Stage | Provider | Why it exists now | Notes |
| --- | --- | --- | --- |
| Story extraction | Anthropic Claude (`claude-3-haiku-20240307`) | Compress messy multi-speaker threads into structured hero's journey beats + hook text. Manual prompt engineering was too fragile; Claude ensures consistent JSON fields. | API key required via `.env`. Prompt string is defined but **not currently passed** into Claude (bug). |
| Lyric generation | Anthropic Claude (`claude-3-sonnet-20240229` default) | Produce on-brand NEFFEX lyric sections (ABABCB) faster than rule-based templating. Provides creative lift vs. deterministic Markov chains. | Same missing prompt injection + no config plumbing for temperature/token limits. |
| Optional thread scraping | Generic HTTP GET | Fetch remote discussion threads when a file isn’t provided. | Timeout 15s; no scraping/auth.
| Voice model download | Hugging Face file download (`setup.py`) | Pulls placeholder NEFFEX-style RVC weights to bootstrap creative testing. | Fails over to instructions text file.

> **If API usage should be removed**: replace StoryExtractor/LyricGenerator with on-device models or scripted templates; otherwise keep Anthropic to preserve narrative quality. Both calls are isolated in their respective classes for easy swapping.

## 4. Feature Status Matrix
| Area | Status | Notes |
| --- | --- | --- |
| CLI orchestration (`main.py`, `scripts/workflow.py`) | ✅ Functional | Preset selection, vocal-mode overrides, path overrides all wired.
| Story + lyric generation | ⚠️ Bugged | Prompts not inserted into Claude `messages`, so JSON instructions are ignored and parsing will often fail.
| MusicGen beat stage | ✅ Functional | Uses `facebook/musicgen-small`, auto duration/BPM from config.
| Vocal enhancement | ⚠️ Partial | Denoise/high-pass/doubler implemented. `pitch_correction` + `formant_shift` flags log TODO warnings (no-op). Metadata JSON saved.
| RVC conversion | ⚠️ Assumes env ready | Calls `infer-web.py` without validating repo state; errors if deps missing/CPU-only.
| Mixing/mastering | ✅ Functional | Gain/echo/normalization tested via `tests/test_integration.py`.
| Hit predictor | ✅ Basic | Logistic regression trained on synthetic data; light heuristic, can be toggled via config (`skip_hit_predictor`).
| Testing | ⚠️ Narrow | Only covers Librosa/pyloudnorm/vocal enhancer paths. No tests for CLI, workflow orchestration, or Anthropic/RVC integration.

## 5. Known Issues & TODOs
1. **Claude prompt wiring** – Inject the prepared `prompt` strings into `messages[0]["content"]` for both `StoryExtractor` and `LyricGenerator`, and add JSON validation/exception handling so failures degrade gracefully.
2. **Config plumbing gaps** – Surface `configs/*.yaml` values (e.g., `anthropic.max_output_tokens`, `lyrics.temperature/verse_count/hook_count`, lyric model override) into the respective classes.
3. **Vocal feature parity** – Either implement `pitch_correction` (librosa.pyin + retuning) and `formant_shift`, or remove those knobs from the config/README to avoid misleading users.
4. **RVC robustness** – Detect whether `deps/RVC-WebUI` exists, ensure `infer-web.py` is executable, wrap `subprocess.run` with error reporting, and document GPU requirements.
5. **Directory expectations** – `README.md` references `inputs/threads` and `inputs/voice` but repo doesn’t track them; add creation instructions outside `setup.py` or commit empty `.gitkeep` files.
6. **Testing coverage** – Add workflow-level tests that mock Anthropic + MusicGen to confirm CLI wiring, config overrides, and artifact generation.
7. **Retries & rate limits** – Add backoff or at least friendly error messages around Anthropic calls and remote thread fetching.
8. **Documentation drift** – README still implies fully functional pitch/formant features and manual thread scraping plan; align messaging with actual capabilities.

## 6. Suggested Next Steps
1. **Stabilize LLM stages** (highest priority)
   - Fix prompt injection and JSON validation (`scripts/story_extractor.py`, `scripts/lyric_generator.py`).
   - Allow `pipeline.yaml` to specify separate models/settings for story vs lyrics.
2. **Tighten vocal pipeline**
   - Implement or remove `pitch_correction`/`formant_shift`.
   - Add user-facing instructions for delivering `inputs/voice/*.wav` without running `setup.py`.
3. **Improve RVC invocation**
   - Detect when `deps/RVC-WebUI` is absent, offer actionable error text.
   - Allow CLI flag to disable RVC quickly if environment lacks GPU.
4. **Testing & automation**
   - Create mocks for Anthropic/MusicGen so `tests/test_integration.py` can cover the full pipeline without API keys.
   - Add CI smoke test to prevent regressions.
5. **Creative roadmap** (optional enhancements)
   - Insert mastering plugin/limiter stage.[?]
   - Build dataset of successful mix parameters to guide `HitPredictor` beyond heuristics.

## 7. How to Resume Development
1. **Environment**
   ```bash
   cd ThreadToHitRemix
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   python setup.py  # optional but ensures deps + inputs/
   cp .env.example .env && echo "ANTHROPIC_API_KEY=..." >> .env
   ```
2. **Fast feedback loop**
   - Use `configs/fast.yaml` with `--preset fast` to skip RVC + hit predictor while iterating on Claude/MusicGen changes.
3. **Where to jump back in**
   - `scripts/story_extractor.py` & `scripts/lyric_generator.py` for API prompt/response fixes.
   - `scripts/workflow.py` to thread new config fields through the pipeline.
   - `scripts/vocal_enhancer.py` for completing the advertised audio features.
4. **Deciding on API usage**
   - If you prefer no third-party LLMs, replace `StoryExtractor`/`LyricGenerator` with local models or deterministic templates; the rest of the pipeline is already on-device.

## 8. Quick Reference Checklist
- [ ] Prompt wiring fixed
- [ ] Config values honored end-to-end
- [ ] Vocal feature flags implemented or removed
- [ ] RVC error handling + docs
- [ ] Tests for CLI/workflow with mocked services
- [ ] Updated README + sample inputs committed

Use this tracker as the living source of truth before handing the project to another contributor or pausing development.
