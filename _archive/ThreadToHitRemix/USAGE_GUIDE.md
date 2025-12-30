# Usage Guide - Making Music with ThreadToHitRemix

**Purpose:** Step-by-step guide to creating songs from forum threads
**Last Updated:** 2025-11-15
**Difficulty:** Intermediate (requires some command-line comfort)

---

## Quick Start (5 Minutes)

If you just want to make one song right now:

```bash
# 1. Activate environment
cd ThreadToHitRemix
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# 2. Create .env file (one-time setup)
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env

# 3. Make a thread file
cat > inputs/threads/my_thread.txt << 'EOF'
I finally did it. After months of self-doubt and imposter syndrome,
I shipped my first real project. It's not perfect, but it's MINE.
To everyone still stuck in tutorial hell - just build something.
Anything. The confidence comes from doing, not from knowing everything first.
EOF

# 4. Record a vocal (or use placeholder)
# Record 20-30 seconds of you speaking/rapping the vibe
# Save as: inputs/voice/my_vocal.wav

# 5. Run the pipeline (fast mode for first try)
python main.py \
  --thread inputs/threads/my_thread.txt \
  --voice inputs/voice/my_vocal.wav \
  --config configs/fast.yaml

# 6. Listen to output
# Open: outputs/thread_to_hit.wav
```

**Expected time:** 5-8 minutes on a decent GPU (RTX 3060+)

---

## Complete Workflow

### Step 1: Find or Create Source Material

The pipeline needs a narrative to work with. Good sources:

**Option A - Forum Threads (Original Intent)**
- Reddit: r/getdisciplined, r/decidingtobebetter, r/fitness transformation posts
- Hacker News: Ask HN career/journey threads
- Dev.to: #showdev posts with struggle → success arcs

**Copy-paste the thread text into a .txt file.**

**Option B - Write Your Own**
```
Good thread structure:
1. Opening struggle (2-3 sentences)
2. Rock bottom moment (1-2 sentences)
3. Decision to change (1 sentence)
4. Journey/process (3-4 sentences)
5. Breakthrough/win (2-3 sentences)
6. Inspirational closing (1-2 sentences)

Length: 200-500 words
Tone: Vulnerable but hopeful
```

**Example Topics That Work Well:**
- Overcoming burnout
- Career pivots
- Fitness transformations
- Creative breakthroughs
- Relationship growth
- Learning new skills
- Mental health journeys
- Starting a business

**Save as:** `inputs/threads/{topic_name}.txt`

---

### Step 2: Record Your Vocal

**Equipment Needed:**
- Microphone (USB mic, headset, or even phone mic works)
- Quiet room
- Audacity (free) or any audio recorder

**Recording Tips:**

1. **Environment:**
   - Close windows (reduce traffic noise)
   - Minimize room echo (record in closet if needed)
   - Turn off fans, AC
   - Use blankets/pillows to dampen reflections

2. **Mic Technique:**
   - 6-12 inches from mic
   - Slightly off-axis (not directly into mic to reduce plosives)
   - Consistent distance (don't move around)

3. **Performance:**
   - Read the generated lyrics OR just speak/rap the vibe
   - Energy > perfection (the pipeline will enhance it)
   - Multiple takes okay, pick best

4. **Technical Settings:**
   - Sample rate: 44100 Hz or 48000 Hz
   - Bit depth: 16-bit or 24-bit
   - Format: WAV (NOT MP3 or compressed)
   - Mono or stereo both work

5. **Export:**
   - Save as WAV file
   - No effects, no reverb, no EQ (dry recording)
   - Location: `inputs/voice/{descriptive_name}.wav`

**Don't have a mic?**
- Use phone voice recorder app, export as WAV
- Record on laptop built-in mic (lower quality but works)
- Use TTS (text-to-speech) for testing: Coqui TTS, Bark, etc.

---

### Step 3: Choose Your Configuration

Two presets are available:

#### configs/fast.yaml (Recommended for First Runs)

**Optimized for:** Quick iteration, testing ideas

**Settings:**
- Beat length: 20 seconds
- Vocal mode: Enhanced (no RVC)
- Denoising: Light (12dB)
- Hit predictor: Disabled
- Expected time: 3-5 minutes

**Use when:**
- Testing new thread topics
- Experimenting with vocal delivery
- Limited GPU VRAM (< 8GB)
- Rapid prototyping

**Command:**
```bash
python main.py \
  --thread inputs/threads/my_thread.txt \
  --voice inputs/voice/my_vocal.wav \
  --config configs/fast.yaml
```

---

#### configs/pipeline.yaml (Production Quality)

**Optimized for:** Final releases, best quality

**Settings:**
- Beat length: 30 seconds
- Vocal mode: RVC (voice conversion enabled)
- Denoising: Aggressive (18dB)
- Hit predictor: Enabled
- Expected time: 8-12 minutes

**Use when:**
- Creating final versions for release
- Maximum vocal enhancement needed
- Have good GPU (8GB+ VRAM)
- Want hit potential analysis

**Command:**
```bash
python main.py \
  --thread inputs/threads/my_thread.txt \
  --voice inputs/voice/my_vocal.wav \
  --config configs/pipeline.yaml
```

---

### Step 4: Understand Vocal Modes

The pipeline has 3 vocal processing modes:

#### Mode 1: Raw (No Processing)
```bash
python main.py \
  --thread inputs/threads/my_thread.txt \
  --voice inputs/voice/my_vocal.wav \
  --vocal-mode raw
```

**What happens:**
- Vocal used as-is, no enhancement
- No denoising, no EQ, no doubler
- No RVC voice conversion

**Use when:**
- Your recording is already professional
- Testing pipeline without vocal processing
- Debugging audio issues

---

#### Mode 2: Enhanced (Processing Only)
```bash
python main.py \
  --thread inputs/threads/my_thread.txt \
  --voice inputs/voice/my_vocal.wav \
  --vocal-mode enhanced
```

**What happens:**
- Spectral denoising (removes background noise)
- Highpass filter (removes rumble)
- Pitch detection (identifies key)
- Vocal doubler (adds richness)
- SNR estimation

**Use when:**
- You want your own voice, but polished
- RVC model isn't working/available
- Quick turnaround needed

---

#### Mode 3: RVC (Full Pipeline)
```bash
python main.py \
  --thread inputs/threads/my_thread.txt \
  --voice inputs/voice/my_vocal.wav \
  --vocal-mode rvc
```

**What happens:**
- All enhancements from Mode 2
- RVC voice conversion (transform your voice to target artist)
- Blending (70% RVC + 30% enhanced by default)

**Use when:**
- Want NEFFEX-style voice timbre
- Your voice doesn't match the genre
- Maximum production polish

**Note:** Requires RVC model setup (see Troubleshooting section)

---

### Step 5: Run the Pipeline

**Basic Command:**
```bash
python main.py \
  --thread inputs/threads/{your_thread}.txt \
  --voice inputs/voice/{your_vocal}.wav
```

**With All Options:**
```bash
python main.py \
  --thread inputs/threads/burnout_story.txt \
  --voice inputs/voice/take_03.wav \
  --config configs/pipeline.yaml \
  --vocal-mode rvc \
  --rvc-root deps/RVC-WebUI
```

**Or Use URL Instead of File:**
```bash
python main.py \
  --thread-url https://www.reddit.com/r/getdisciplined/comments/abc123/... \
  --voice inputs/voice/my_vocal.wav
```

---

### Step 6: Monitor Progress

**What You'll See:**

```
✓ GPU detected: NVIDIA GeForce RTX 3080 (10.0 GB VRAM)
✓ API key loaded: sk-ant-api03...
✓ Output directory ready: outputs/

[Stage 1/8] Extracting story from thread...
  Hook: "From tutorial hell to shipped reality"
  Protagonist: Self-taught developer
  Conflict: Imposter syndrome vs. desire to create
  ✓ Story extracted

[Stage 2/8] Generating NEFFEX-style lyrics...
  Temperature: 0.6
  Structure: ABABCB
  ✓ Lyrics generated: outputs/lyrics.json

[Stage 3/8] Creating beat with MusicGen...
  Preset: facebook/musicgen-small
  Duration: 30s
  BPM: 120
  ✓ Beat created: outputs/instrumental.wav

[Stage 4/8] Enhancing vocals...
  Detected key: F
  Median pitch: 174.6 Hz
  SNR: 18.2 dB
  ✓ Enhanced: outputs/enhanced_vocals.wav

[Stage 5/8] Converting voice with RVC...
  Model: models/neffex_voice.pth
  F0 method: RMVPE
  Blend ratio: 70%
  ✓ Converted: outputs/rvc_vocals.wav

[Stage 6/8] Mixing stems...
  Vocal gain: -1.0 dB
  Instrumental gain: -3.0 dB
  Echo: 0.25s delay, 0.35 decay
  ✓ Premix: outputs/premix.wav

[Stage 7/8] Mastering...
  Target LUFS: -9.5
  Measured LUFS: -12.3
  Applied gain: +2.8 dB
  ✓ Final mix: outputs/thread_to_hit.wav

[Stage 8/8] Predicting hit potential...
  Tempo: 118 BPM
  Energy: 0.72
  Repetition: 0.68
  Hit score: 78/100
  Feedback: Great balance—ship it!

✓ Pipeline complete!
  Final mix: outputs/thread_to_hit.wav
  Cost: $0.015
  Time: 6m 42s
```

---

### Step 7: Review Outputs

**Generated Files (in outputs/ directory):**

| File | Description | Use |
|------|-------------|-----|
| `lyrics.json` | Claude-generated lyrics in ABABCB structure | Read before recording next take |
| `instrumental.wav` | MusicGen beat (30s) | Listen standalone to check vibe |
| `enhanced_vocals.wav` | Denoised/EQ'd vocals | Compare to raw recording |
| `rvc_vocals.wav` | Voice-converted vocals | Hear RVC transformation |
| `blended_vocals.wav` | Mix of enhanced + RVC | Final vocal stem |
| `premix.wav` | Stems mixed, pre-mastering | Check mix balance |
| `thread_to_hit.wav` | **Final mastered track** | **This is your song!** |

**Metadata Files:**
| File | Description |
|------|-------------|
| `vocal_metadata.json` | Detected key, pitch, SNR |
| `story_summary.json` | Extracted narrative elements |

---

### Step 8: Iterate and Improve

**Not happy with the result? Try these tweaks:**

#### If the beat doesn't match the vibe:
```yaml
# Edit configs/pipeline.yaml
workflow:
  target_bpm: 100  # Slower, more melancholy
  # or
  target_bpm: 140  # Faster, more energetic
```

#### If vocals are too quiet/loud:
```yaml
# Edit configs/pipeline.yaml
mixing:
  vocal_gain_db: 2.0  # Louder vocals (+2dB)
  instrumental_gain_db: -6.0  # Quieter beat
```

#### If there's too much noise:
```yaml
# Edit configs/pipeline.yaml
vocals:
  enhancer:
    denoise_db: 24  # More aggressive (was 18)
```

#### If RVC sounds too robotic:
```yaml
# Edit configs/pipeline.yaml
vocals:
  rvc_blend: 0.3  # More of your original voice (30% RVC, 70% enhanced)
```

#### If lyrics don't match your story:
- Edit `outputs/lyrics.json` manually
- Rerun with edited lyrics (feature not yet implemented, but you can modify the JSON)

#### If beat is too short:
```yaml
# Edit configs/pipeline.yaml
workflow:
  beat_duration_seconds: 45  # Longer instrumental
```

---

## Advanced Usage

### Custom Thread Analysis

If Claude's story extraction misses the point:

```python
# Edit scripts/story_extractor.py system prompt (lines 20-40)
# Add domain-specific instructions, like:
"""
Focus on tech entrepreneurship themes.
Hook should emphasize building vs. consuming.
Conflict should be internal (self-doubt) not external.
"""
```

### Custom Lyric Styles

Edit `scripts/lyric_generator.py` to change style:

```python
# Line 25-35, modify style instructions
# Examples:
"Eminem-style intricate rhyme schemes"
"Drake-style melodic hooks"
"Kendrick-style storytelling"
"Pop-punk like Machine Gun Kelly"
```

### Using Your Own RVC Model

If you have a custom RVC checkpoint:

```bash
# 1. Place .pth file in models/
cp ~/Downloads/my_voice_model.pth models/

# 2. Update config
# Edit configs/pipeline.yaml:
workflow:
  voice_model_path: "models/my_voice_model.pth"
  rvc_config: "my_config_name"
```

### Batch Process Multiple Threads

```bash
# Process all threads in directory
for thread in inputs/threads/*.txt; do
  echo "Processing: $thread"
  python main.py \
    --thread "$thread" \
    --voice inputs/voice/standard_vocal.wav \
    --config configs/fast.yaml

  # Rename output
  basename=$(basename "$thread" .txt)
  mv outputs/thread_to_hit.wav "outputs/${basename}_mix.wav"
done
```

---

## Customization Examples

### Example 1: Lo-Fi Hip Hop Beat

```yaml
# Create configs/lofi.yaml
workflow:
  beat_duration_seconds: 60  # Longer loop
  target_bpm: 85  # Slower tempo
  vocal_mode: enhanced  # Keep natural voice

vocals:
  enhancer:
    denoise_db: 12  # Light processing for warmth
    doubler_mix: 0.5  # More doubling for dreaminess

mixing:
  vocal_gain_db: -3.0  # Quieter, more background
  instrumental_gain_db: -1.0  # Beat more prominent
  echo_delay_seconds: 0.5  # Longer echo
  echo_decay: 0.5  # More pronounced echo

mastering:
  target_lufs: -14.0  # Quieter, more chill
```

### Example 2: Aggressive Rap

```yaml
# Create configs/aggressive.yaml
workflow:
  beat_duration_seconds: 25
  target_bpm: 145  # Fast, aggressive
  vocal_mode: rvc

vocals:
  enhancer:
    denoise_db: 20  # Clean, punchy
    doubler_mix: 0.2  # Minimal doubling, more direct

mixing:
  vocal_gain_db: 1.0  # Louder, in-your-face
  instrumental_gain_db: -4.0  # Beat supports but doesn't compete
  echo_delay_seconds: 0.125  # Short, tight echo
  echo_decay: 0.2  # Minimal echo

mastering:
  target_lufs: -8.0  # Louder, more intense
```

### Example 3: Acoustic Singer-Songwriter

```yaml
# Create configs/acoustic.yaml
workflow:
  beat_duration_seconds: 40
  target_bpm: 95  # Mid-tempo, organic
  vocal_mode: enhanced  # Keep natural voice

vocals:
  enhancer:
    denoise_db: 15  # Moderate (preserve room tone)
    doubler_mix: 0.3  # Light doubling

mixing:
  vocal_gain_db: 0.0  # Centered, main focus
  instrumental_gain_db: -5.0  # Quiet, supporting
  echo_delay_seconds: 0.4  # Natural room echo
  echo_decay: 0.4

mastering:
  target_lufs: -12.0  # Dynamic range for emotion
```

**Usage:**
```bash
python main.py \
  --thread inputs/threads/my_story.txt \
  --voice inputs/voice/my_vocal.wav \
  --config configs/acoustic.yaml
```

---

## Troubleshooting

### Issue: "ANTHROPIC_API_KEY missing"

**Solution:**
```bash
# Create .env file in project root
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env

# Or export to environment (temporary)
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Get key from: https://console.anthropic.com/settings/keys
```

---

### Issue: "CUDA out of memory"

**Symptoms:** Pipeline crashes during beat generation

**Solutions:**

1. **Use smaller MusicGen model:**
   ```yaml
   # Edit configs/pipeline.yaml
   workflow:
     beat_preset: "facebook/musicgen-small"  # Was medium/large
   ```

2. **Reduce beat duration:**
   ```yaml
   workflow:
     beat_duration_seconds: 20  # Was 30
   ```

3. **Close other GPU programs:**
   ```bash
   # Check GPU usage
   nvidia-smi

   # Kill other processes using GPU
   ```

4. **Use fast config:**
   ```bash
   python main.py ... --config configs/fast.yaml
   ```

---

### Issue: RVC Voice Conversion Fails

**Symptoms:** Error in stage 5, or robotic/glitchy output

**Possible Causes:**

1. **Missing/wrong RVC model:**
   ```bash
   # Check if model exists
   ls -lh models/*.pth

   # Should see: neffex_voice.pth or similar
   # NOT .wav files
   ```

2. **RVC-WebUI not installed:**
   ```bash
   # Check if deps/RVC-WebUI exists
   ls deps/RVC-WebUI/infer-web.py

   # If missing, run setup again
   python setup.py
   ```

3. **Model path mismatch:**
   ```yaml
   # In configs/pipeline.yaml, ensure path matches actual file
   workflow:
     voice_model_path: "models/your_actual_model.pth"
   ```

**Workaround:** Skip RVC and use enhanced mode:
```bash
python main.py ... --vocal-mode enhanced
```

---

### Issue: Poor Lyric Quality

**Symptoms:** Lyrics don't match thread narrative, generic output

**Solutions:**

1. **Improve thread quality:**
   - Add more emotional detail
   - Include specific moments, not just general statements
   - 300-500 words is optimal (too short lacks context)

2. **Increase lyric creativity:**
   ```yaml
   # Edit configs/pipeline.yaml
   lyrics:
     temperature: 0.9  # Was 0.7 (more creative, less safe)
   ```

3. **Use better model for lyrics:**
   ```python
   # Edit scripts/lyric_generator.py line 15
   self.model = "claude-3-opus-20240229"  # Was sonnet (more creative)
   ```
   **Note:** Opus is 3x more expensive but higher quality.

---

### Issue: Audio Sounds Distorted/Clipped

**Symptoms:** Digital crackling, harsh peaks

**Solutions:**

1. **Check input vocal level:**
   ```bash
   # Open enhanced_vocals.wav in Audacity
   # Waveform should NOT touch top/bottom (clipping)
   # Peak around -6dB to -3dB is ideal
   ```

2. **Reduce gain:**
   ```yaml
   # Edit configs/pipeline.yaml
   mixing:
     vocal_gain_db: -3.0  # Lower if clipping
     instrumental_gain_db: -5.0
   ```

3. **Check LUFS normalization:**
   ```yaml
   mastering:
     target_lufs: -12.0  # Quieter (was -9.5)
   ```

---

### Issue: Beat Doesn't Match Lyrics

**Symptoms:** Upbeat beat with sad lyrics, or vice versa

**Solution:** MusicGen prompt is auto-generated from story hook. To customize:

```python
# Edit scripts/beat_maker.py line 45
# Current prompt:
prompt = f"Motivational EDM rap beat with punchy drums, heroic hook '{hook}', shimmering synth bass."

# Customize based on emotion:
if "sad" in hook.lower() or "lost" in hook.lower():
    prompt = f"Melancholic trap beat with emotional piano, minor key, '{hook}'"
elif "angry" in hook.lower() or "fight" in hook.lower():
    prompt = f"Aggressive trap beat with distorted 808s, hard drums, '{hook}'"
else:
    # Keep default motivational
    prompt = f"Motivational EDM rap beat with punchy drums, heroic hook '{hook}'"
```

---

### Issue: Pipeline is Too Slow

**Expected Times:**
- Fast config: 3-5 minutes
- Production config: 8-12 minutes

**If slower:**

1. **Check GPU usage:**
   ```bash
   nvidia-smi  # Should show python process using GPU
   ```

2. **Ensure CUDA is used:**
   ```python
   # Run this in Python:
   import torch
   print(torch.cuda.is_available())  # Should be True
   ```

3. **Reduce quality:**
   - Use fast.yaml config
   - Shorter beats (20s)
   - Smaller MusicGen model

4. **Skip hit predictor:**
   ```bash
   # Not yet implemented as CLI flag
   # Edit scripts/workflow.py line 120
   # Comment out: self.hit_predictor.predict(...)
   ```

---

## Tips for Best Results

### Recording Vocals

1. **Match the energy:**
   - Motivational thread → confident, energetic delivery
   - Sad thread → vulnerable, intimate delivery

2. **Don't overthink:**
   - First take energy > tenth take perfection
   - Enhancement will polish it

3. **Use lyrics as guide (optional):**
   - Generate lyrics first
   - Read them aloud for cadence
   - Re-record vocal with better flow

### Writing/Selecting Threads

1. **Transformation arcs work best:**
   - Before (struggle) → After (success)
   - Clear emotional shift

2. **Specificity > generality:**
   - "I quit my job to start a bakery" > "I made a change"
   - "Bench pressing my bodyweight" > "Got stronger"

3. **Vulnerability sells:**
   - Admit the low points
   - Don't gloss over the struggle

### Mixing Philosophy

1. **Vocals should lead:**
   - If you can't clearly hear words, boost vocals
   - Instrumental is support, not star

2. **Leave headroom:**
   - Don't max out every slider
   - Dynamics make music breathe

3. **Trust the LUFS:**
   - -9.5 LUFS matches Spotify/Apple Music standards
   - Don't try to make it louder manually

---

## Workflow Examples

### Scenario 1: Quick Idea Capture

"I just read an inspiring Reddit thread and want to hear it as a song ASAP."

```bash
# 1. Copy thread text
pbpaste > inputs/threads/reddit_inspiration.txt  # Mac
# or just copy-paste into file

# 2. Record quick vocal on phone, transfer to computer
# Save as: inputs/voice/quick_take.wav

# 3. Run fast pipeline
python main.py \
  --thread inputs/threads/reddit_inspiration.txt \
  --voice inputs/voice/quick_take.wav \
  --config configs/fast.yaml

# 4. Listen in 3 minutes
open outputs/thread_to_hit.wav
```

**Time: 15 minutes total**

---

### Scenario 2: Polished Release

"I want to create a high-quality song for my YouTube channel."

```bash
# Day 1: Generation
# 1. Write compelling 400-word transformation story
# 2. Record vocal in treated space with good mic
# 3. Multiple takes, pick best

python main.py \
  --thread inputs/threads/my_story_final.txt \
  --voice inputs/voice/best_take.wav \
  --config configs/pipeline.yaml

# Day 2: Refinement
# 1. Listen to output, identify issues
# 2. Adjust config (gains, BPM, denoising)
# 3. Regenerate

# Day 3: Release prep
# 1. Add metadata (upcoming feature)
# 2. Create album art
# 3. Upload to YouTube/SoundCloud
```

**Time: 3-5 hours total across multiple days**

---

### Scenario 3: Batch Content Creation

"I want to create 10 songs from different motivational threads."

```bash
# 1. Collect 10 threads in inputs/threads/
# 2. Record one versatile vocal
# 3. Batch process

for i in {1..10}; do
  thread="inputs/threads/thread_$(printf "%02d" $i).txt"

  python main.py \
    --thread "$thread" \
    --voice inputs/voice/standard_vocal.wav \
    --config configs/fast.yaml

  mv outputs/thread_to_hit.wav "outputs/song_$(printf "%02d" $i).wav"

  echo "✓ Completed song $i/10"
done
```

**Time: 30-50 minutes for 10 songs**

---

## Creative Variations

### Use Case 1: Podcast Intro Music

Generate custom intro for each episode from episode summary:

```bash
# 1. Write episode summary as "thread"
echo "Today: Sarah shares how she pivoted from law to tech" > ep_summary.txt

# 2. Record intro voiceover
# "Welcome to the Tech Pivot Podcast..."

# 3. Generate 20s instrumental
python main.py \
  --thread ep_summary.txt \
  --voice intro_voiceover.wav \
  --config configs/fast.yaml
```

### Use Case 2: Personal Achievement Anthems

Commemorate milestones:

```
"Ran my first marathon today. Started 6 months ago barely able to
run a mile. Every early morning, every doubt overcome, led to this.
26.2 miles of pure determination. I'm a runner now."
```

Generate → Celebrate!

### Use Case 3: Community Highlight Reels

Turn community wins into songs:

```bash
# Aggregate multiple community stories
cat community_wins/*.txt > inputs/threads/community_compilation.txt

# Generate anthem
python main.py \
  --thread inputs/threads/community_compilation.txt \
  --voice community_voice.wav
```

---

## Next Steps

After you've made a few songs:

1. **Share them:**
   - SoundCloud
   - YouTube (with visualizer)
   - Reddit (r/WeAreTheMusicMakers, r/makinghiphop)

2. **Iterate:**
   - Try different vocal modes
   - Experiment with BPM ranges
   - Test various thread topics

3. **Customize:**
   - Create your own config presets
   - Modify lyric prompts for your style
   - Fine-tune mixing preferences

4. **Contribute:**
   - Report bugs/issues
   - Share your best results
   - Suggest improvements

---

## FAQ

**Q: Can I use the output commercially?**
A: Check the licenses:
- MusicGen: CC-BY-NC 4.0 (non-commercial)
- RVC: Varies by model
- Claude API: Your content is yours
- **Overall: Currently non-commercial use recommended**

**Q: How much does each song cost?**
A: ~$0.015 per song in Claude API costs (1.5 cents)

**Q: Can I use my own beats instead of MusicGen?**
A: Yes! Replace `outputs/instrumental.wav` before the mixing stage
(Feature not fully automated yet)

**Q: Do I need to write the lyrics myself?**
A: No, Claude generates them automatically. But you CAN edit `outputs/lyrics.json` if desired.

**Q: What if I don't have a GPU?**
A: Pipeline will be VERY slow (30+ minutes per song). Consider:
- Google Colab (free GPU)
- Cloud GPU rental (vast.ai, RunPod)
- CPU-only mode (edit configs to skip MusicGen)

**Q: Can I run this on Mac?**
A: Yes, but:
- MusicGen on CPU only (slow)
- RVC might have compatibility issues
- Use enhanced mode instead of rvc mode

**Q: How do I get better at vocals?**
A: The enhancement helps, but:
- Practice delivery
- Study rap flow/cadence
- Listen to NEFFEX for reference
- Record multiple takes

**Q: Can I change the music genre?**
A: Edit `scripts/beat_maker.py` prompt:
```python
prompt = f"Lo-fi jazz beat with vinyl crackle, '{hook}'"
prompt = f"Synthwave 80s beat with retro drums, '{hook}'"
prompt = f"Acoustic folk guitar instrumental, '{hook}'"
```

**Q: The lyrics don't match my thread. Why?**
A: Possible issues:
- Thread too short (< 200 words)
- Thread lacks clear narrative arc
- Too generic/vague
- Try rewriting thread with more emotion/specifics

---

## Getting Help

If you're stuck:

1. **Check outputs/ directory:**
   - Which stage produced the last file?
   - That narrows down where it failed

2. **Enable verbose logging:**
   ```python
   # Edit main.py, add at top:
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

3. **Test stages individually:**
   ```bash
   # Test just story extraction
   python scripts/story_extractor.py --thread inputs/threads/test.txt
   ```

4. **Check GPU:**
   ```bash
   nvidia-smi  # Should show python using GPU
   ```

5. **Read error messages carefully:**
   - File not found → check paths
   - CUDA OOM → use smaller model
   - API error → check .env file

---

**Happy music making! Turn your stories into songs. 🎵**
