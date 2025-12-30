# ThreadToHitRemix

Turn messy community threads into finished songs using Claude, MusicGen, RVC, and Librosa.

## Repository layout

```
ThreadToHitRemix/
├── configs/           # YAML knobs for model presets and gain staging
├── data/prompts/      # Sample threads or scraped content
├── deps/              # Cloned audiocraft + RVC repos (ignored)
├── inputs/threads/    # Raw community thread dumps
├── inputs/voice/      # Dry vocal takes for conversion
├── models/            # RVC checkpoints / weights (ignored)
├── outputs/           # Generated stems and mixes (ignored)
├── scripts/           # Modular pipeline stages (Claude, MusicGen, RVC, Librosa)
└── main.py            # CLI entry point tying everything together
```

Key modules:
- `scripts/story_extractor.py` – Claude hero's-journey summaries with hook emphasis.
- `scripts/lyric_generator.py` – Claude NEFFEX-style ABABCB lyrics with antimetabole prompts.
- `scripts/beat_maker.py` – MusicGen wrapper with configurable preset/duration/BPM.
- `scripts/voice_converter.py` – shells out to RVC-WebUI and copies voice weights as needed.
- `scripts/mixer.py` – Librosa/SoundFile summing with optional hook echo.
- `scripts/hit_predictor.py` – Librosa + sklearn heuristics for hit potential scoring.
- `scripts/workflow.py` – orchestrates the full creative loop.

## Prerequisites

- Python 3.10+ with CUDA-capable GPU
- [PyTorch](https://pytorch.org/) build that matches your CUDA driver
- Anthropic API key (Claude access)
- Git + FFmpeg

## Setup

1. Clone the repo (after you initialize it locally, see below).
2. Create and activate a virtual environment:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install --upgrade pip
   ```

3. Install project dependencies and bring down AudioCraft/RVC via the helper script:

   ```bash
   pip install -r requirements.txt
   python setup.py
   ```

   - Clones `facebookresearch/audiocraft` and `Retrieval-based-Voice-Conversion-WebUI` into `deps/`.
   - Installs torch, librosa, anthropic, SoundFile, sklearn, and AudioCraft edits.
   - Downloads (or creates instructions for) a NEFFEX placeholder RVC checkpoint under `models/`.
   - Verifies CUDA availability and import readiness.

4. Create a `.env` file so Claude can authenticate:

   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

## Running the pipeline

1. Drop or scrape the thread text into `inputs/threads/` (see `data/prompts/sample_thread.txt`).
2. Record a dry vocal take (spoken or sung), save as WAV under `inputs/voice/`.
3. Confirm your RVC weights exist (default placeholder lives at `models/neffex_placeholder.wav`).
4. Launch the CLI. You can point to files or a remote URL:

   ```bash
   python main.py \
     --thread inputs/threads/sample_thread.txt \
     --voice inputs/voice/my_take.wav
   # or
   python main.py --thread-url https://example.com/forum/thread --voice inputs/voice/my_take.wav
   ```

Artifacts land under `outputs/`:
- `lyrics.json` – Claude-generated NEFFEX lyrics (ABABCB).
- `instrumental.wav` – MusicGen motivational beat.
- `styled_vocals.wav` – RVC output using the NEFFEX preset.
- `thread_to_hit.wav` – Librosa mix with echo-treated hooks.
- Hit predictor feedback is printed to the console.

## Customizing

- Edit `configs/pipeline.yaml` to swap MusicGen checkpoints, change BPM/duration, voice weights, or echo settings.
- Override defaults on the CLI, e.g. `python main.py --thread my_thread.txt --config configs/alt.yaml --rvc-root deps/RVC-WebUI`.
- Extend `scripts/workflow.py` to insert mastering, evaluation, or release automation.

## Troubleshooting

- MusicGen needs plenty of VRAM. Lower `beat_preset` to `facebook/musicgen-small` or reduce duration if you OOM.
- RVC conversion requires a dry vocal WAV (16-bit PCM). Record a guide vocal, point `--voice` to it, and confirm your NEFFEX weights exist.
- If Librosa complains about codecs, ensure FFmpeg is installed and available on `PATH`.
- Hit predictor relies on librosa + sklearn; if it errors, rerun `python setup.py` to confirm dependencies.
