"""Generate test fixtures for unit tests."""
import numpy as np
import soundfile as sf
from pathlib import Path

FIXTURES_DIR = Path(__file__).parent / "fixtures"
FIXTURES_DIR.mkdir(exist_ok=True)

SAMPLE_RATE = 44100
DURATION = 1.0

frequencies = [440.0, 554.37, 659.25]
audio = np.zeros(int(SAMPLE_RATE * DURATION))

for freq in frequencies:
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), endpoint=False)
    audio += 0.3 * np.sin(2 * np.pi * freq * t)

audio = audio / np.max(np.abs(audio)) * 0.8

stereo_audio = np.column_stack([audio, audio])

output_path = FIXTURES_DIR / "test_vocal_440hz.wav"
sf.write(output_path, stereo_audio, SAMPLE_RATE)

print(f"Generated test fixture: {output_path}")
print(f"Duration: {DURATION}s, Sample rate: {SAMPLE_RATE}Hz")
print(f"Frequencies: {frequencies}Hz (A4, C#5, E5 - A major triad)")
