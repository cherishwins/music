"""
Modal.com serverless GPU function for ThreadToHitRemix music production pipeline.

Deploy with: modal deploy modal_app.py
Test with: modal run modal_app.py
"""
from __future__ import annotations

import base64
import io
import json
import os
import tempfile
from pathlib import Path
from typing import Optional

import modal

# Define the container image with all dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "libsndfile1")
    .pip_install(
        "anthropic>=0.39.0",
        "audiocraft>=1.2.0",
        "librosa>=0.10.2",
        "soundfile>=0.12.1",
        "torch==2.1.0",
        "torchaudio==2.1.0",
        "numpy>=1.24.0,<2.0.0",
        "pyyaml>=6.0.1",
        "scipy>=1.11.0",
        "pyloudnorm>=0.1.1",
    )
)

app = modal.App("alchemy-music-production", image=image)


@app.function(
    gpu="T4",  # Use T4 GPU for cost efficiency
    timeout=600,  # 10 minute timeout
    secrets=[modal.Secret.from_name("anthropic-api-key")],
)
def generate_full_track(
    content: str,
    voice_mode: str = "enhanced",  # raw, enhanced, or rvc
    target_bpm: int = 120,
    genre_hint: str = "motivational hip-hop",
) -> dict:
    """
    Generate a complete music track from text content.

    Args:
        content: The source content (thread, post, story) to transform
        voice_mode: Vocal processing mode (raw/enhanced/rvc)
        target_bpm: Target tempo in BPM
        genre_hint: Genre style hint for lyrics and beat

    Returns:
        Dictionary with audio data, lyrics, and metadata
    """
    import soundfile as sf
    from scripts.beat_maker import BeatMaker
    from scripts.hit_predictor import HitPredictor
    from scripts.lyric_generator import LyricGenerator
    from scripts.mixer import StemMixer
    from scripts.story_extractor import StoryExtractor
    from scripts.vocal_enhancer import VocalEnhancer

    # Get API key from secrets
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
    if not anthropic_key:
        raise ValueError("ANTHROPIC_API_KEY not found in secrets")

    # Create output directory
    output_dir = Path(tempfile.mkdtemp())

    # Initialize pipeline components
    story_extractor = StoryExtractor(api_key=anthropic_key, model="claude-3-haiku-20240307")
    lyric_generator = LyricGenerator(api_key=anthropic_key)
    beat_maker = BeatMaker(
        preset="facebook/musicgen-small",
        duration_seconds=30,
        target_bpm=target_bpm,
    )
    vocal_enhancer = VocalEnhancer(sample_rate=44100)
    mixer = StemMixer(sample_rate=44100)
    hit_predictor = HitPredictor(tempo_range=(100, 130))

    # Step 1: Extract story from content
    story = story_extractor.extract_story(content)

    # Step 2: Generate lyrics
    lyrics_sections = lyric_generator.write_song(
        json.dumps(
            {
                "title": story.title,
                "hook": story.hook,
                "themes": story.themes,
                "emotions": story.emotions,
            }
        ),
        genre_hint=genre_hint,
        tempo=target_bpm,
    )

    lyrics_text = "\n\n".join(
        f"[{section.label}]\n" + "\n".join(section.lines)
        for section in lyrics_sections
    )

    # Step 3: Generate beat
    beat_prompt = f"Motivational {genre_hint} beat with punchy drums, '{story.hook}', tempo {target_bpm} BPM"
    beat_path = beat_maker.create_beat(
        prompt=beat_prompt,
        output_path=output_dir / "instrumental.wav",
    )

    # Step 4: Read the beat audio
    beat_audio, sr = sf.read(beat_path)

    # Step 5: Mix and master (without vocals for now - vocals need ElevenLabs TTS)
    # For the full track, the user will need to provide vocals or use ElevenLabs
    final_path = output_dir / "final_mix.wav"

    # Apply mastering to beat
    mastered_path = mixer.normalize_lufs(
        audio_path=beat_path,
        output_path=final_path,
        target_lufs=-9.5,
    )

    # Step 6: Score the track
    hit_score = hit_predictor.score_track(mastered_path)

    # Read final audio and encode to base64
    audio_data, sr = sf.read(mastered_path)
    audio_buffer = io.BytesIO()
    sf.write(audio_buffer, audio_data, sr, format="wav")
    audio_base64 = base64.b64encode(audio_buffer.getvalue()).decode("utf-8")

    return {
        "title": story.title,
        "hook": story.hook,
        "themes": story.themes,
        "emotions": story.emotions,
        "lyrics": lyrics_text,
        "audio_base64": audio_base64,
        "audio_format": "wav",
        "sample_rate": sr,
        "duration_seconds": len(audio_data) / sr,
        "bpm": target_bpm,
        "hit_score": {
            "score": hit_score.score,
            "confidence": hit_score.confidence,
            "feedback": hit_score.feedback,
        } if hit_score else None,
    }


@app.function(
    gpu="T4",
    timeout=120,
    secrets=[modal.Secret.from_name("anthropic-api-key")],
)
def generate_beat_only(
    prompt: str,
    duration_seconds: int = 30,
    target_bpm: int = 120,
) -> dict:
    """
    Generate just the instrumental beat.

    Args:
        prompt: Description of the desired beat
        duration_seconds: Length of the beat
        target_bpm: Target tempo

    Returns:
        Dictionary with audio data and metadata
    """
    import soundfile as sf
    from scripts.beat_maker import BeatMaker

    output_dir = Path(tempfile.mkdtemp())

    beat_maker = BeatMaker(
        preset="facebook/musicgen-small",
        duration_seconds=duration_seconds,
        target_bpm=target_bpm,
    )

    beat_path = beat_maker.create_beat(
        prompt=prompt,
        output_path=output_dir / "beat.wav",
    )

    # Read and encode
    audio_data, sr = sf.read(beat_path)
    audio_buffer = io.BytesIO()
    sf.write(audio_buffer, audio_data, sr, format="wav")
    audio_base64 = base64.b64encode(audio_buffer.getvalue()).decode("utf-8")

    return {
        "audio_base64": audio_base64,
        "audio_format": "wav",
        "sample_rate": sr,
        "duration_seconds": len(audio_data) / sr,
        "bpm": target_bpm,
        "prompt": prompt,
    }


@app.local_entrypoint()
def main():
    """Test the pipeline locally."""
    print("Testing Alchemy Music Production Pipeline...")

    test_content = """
    Every day you wake up, you have a choice. You can stay in bed and let life pass you by,
    or you can rise up and make something happen. The grind doesn't stop. The hustle is real.
    But at the end of the day, when you look back at what you've built, you'll know it was worth it.
    Keep pushing. Keep growing. Keep winning.
    """

    result = generate_full_track.remote(
        content=test_content,
        voice_mode="enhanced",
        target_bpm=120,
        genre_hint="motivational hip-hop",
    )

    print(f"Generated: {result['title']}")
    print(f"Hook: {result['hook']}")
    print(f"Duration: {result['duration_seconds']:.1f}s")
    print(f"Hit Score: {result['hit_score']}")
    print("\nLyrics Preview:")
    print(result["lyrics"][:500])
