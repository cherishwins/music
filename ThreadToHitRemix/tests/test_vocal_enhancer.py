"""Unit tests for VocalEnhancer."""
import json
import unittest
from pathlib import Path

import numpy as np
import soundfile as sf

from scripts.vocal_enhancer import VocalEnhancer, VocalMetadata


class TestVocalEnhancer(unittest.TestCase):
    """Test suite for VocalEnhancer class."""

    @classmethod
    def setUpClass(cls):
        """Create test fixture once for all tests."""
        cls.fixtures_dir = Path(__file__).parent / "fixtures"
        cls.fixtures_dir.mkdir(exist_ok=True)
        cls.test_audio_path = cls.fixtures_dir / "test_vocal_440hz.wav"
        cls.output_dir = Path(__file__).parent / "output"
        cls.output_dir.mkdir(exist_ok=True)

        if not cls.test_audio_path.exists():
            sample_rate = 44100
            duration = 1.0
            frequencies = [440.0, 554.37, 659.25]
            audio = np.zeros(int(sample_rate * duration))

            for freq in frequencies:
                t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
                audio += 0.3 * np.sin(2 * np.pi * freq * t)

            audio = audio / np.max(np.abs(audio)) * 0.8
            stereo_audio = np.column_stack([audio, audio])

            sf.write(cls.test_audio_path, stereo_audio, sample_rate)
            print(f"Generated test fixture: {cls.test_audio_path}")

    def test_enhancer_initialization(self):
        """Test VocalEnhancer can be initialized with default parameters."""
        enhancer = VocalEnhancer()
        self.assertEqual(enhancer.sample_rate, 44100)
        self.assertEqual(enhancer.denoise_db, 18.0)
        self.assertEqual(enhancer.doubler_mix, 0.35)

    def test_enhancer_custom_parameters(self):
        """Test VocalEnhancer accepts custom parameters."""
        enhancer = VocalEnhancer(
            sample_rate=48000,
            denoise_db=20.0,
            doubler_mix=0.5,
        )
        self.assertEqual(enhancer.sample_rate, 48000)
        self.assertEqual(enhancer.denoise_db, 20.0)
        self.assertEqual(enhancer.doubler_mix, 0.5)

    def test_enhance_basic(self):
        """Test basic enhancement pipeline completes without errors."""
        enhancer = VocalEnhancer(denoise_db=12.0, doubler_mix=0.2)
        output_path = self.output_dir / "enhanced_basic.wav"

        result_path, metadata = enhancer.enhance(
            input_path=self.test_audio_path,
            output_path=output_path,
        )

        self.assertTrue(result_path.exists())
        self.assertIsInstance(metadata, VocalMetadata)

        audio, sr = sf.read(result_path)
        self.assertEqual(sr, 44100)
        self.assertGreater(len(audio), 0)

    def test_metadata_generation(self):
        """Test that metadata is properly generated and saved."""
        enhancer = VocalEnhancer()
        output_path = self.output_dir / "enhanced_metadata.wav"

        _, metadata = enhancer.enhance(
            input_path=self.test_audio_path,
            output_path=output_path,
        )

        self.assertIsNotNone(metadata.detected_key)
        self.assertIsNotNone(metadata.median_pitch_hz)
        self.assertIn("spectral_denoise", metadata.processing_applied)
        self.assertIn("highpass_filter", metadata.processing_applied)
        self.assertIn("pitch_detection", metadata.processing_applied)

        metadata_path = output_path.with_suffix(".json")
        self.assertTrue(metadata_path.exists())

        with open(metadata_path, "r") as f:
            metadata_dict = json.load(f)
            self.assertIn("detected_key", metadata_dict)
            self.assertIn("median_pitch_hz", metadata_dict)

    def test_pitch_detection(self):
        """Test that pitch detection works on test audio."""
        enhancer = VocalEnhancer()

        audio, sr = sf.read(self.test_audio_path, always_2d=True)
        detected_key, median_pitch = enhancer._detect_pitch(audio)

        self.assertIsNotNone(detected_key)
        self.assertIsNotNone(median_pitch)
        self.assertGreater(median_pitch, 400)
        self.assertLess(median_pitch, 700)

    def test_highpass_filter(self):
        """Test high-pass filter removes low frequencies."""
        enhancer = VocalEnhancer()

        audio, sr = sf.read(self.test_audio_path, always_2d=True)
        filtered = enhancer._highpass_filter(audio)

        self.assertEqual(filtered.shape, audio.shape)
        self.assertIsInstance(filtered, np.ndarray)

    def test_doubler_effect(self):
        """Test vocal doubler effect applies correctly."""
        enhancer = VocalEnhancer(doubler_mix=0.5)

        audio, sr = sf.read(self.test_audio_path, always_2d=True)
        doubled = enhancer._apply_doubler(audio)

        self.assertEqual(doubled.shape, audio.shape)
        self.assertFalse(np.array_equal(doubled, audio))

    def test_config_override(self):
        """Test that config dict overrides default parameters."""
        enhancer = VocalEnhancer(denoise_db=18.0, doubler_mix=0.35)

        config = {"denoise_db": 25.0, "doubler_mix": 0.5}
        enhancer._update_from_config(config)

        self.assertEqual(enhancer.denoise_db, 25.0)
        self.assertEqual(enhancer.doubler_mix, 0.5)

    def test_graceful_degradation_pitch_correction(self):
        """Test that unimplemented pitch correction doesn't crash."""
        enhancer = VocalEnhancer(pitch_correction=True)
        output_path = self.output_dir / "enhanced_pitch_correction.wav"

        result_path, metadata = enhancer.enhance(
            input_path=self.test_audio_path,
            output_path=output_path,
        )

        self.assertTrue(result_path.exists())
        self.assertFalse(metadata.processing_applied["pitch_correction"])

    def test_graceful_degradation_formant_shift(self):
        """Test that unimplemented formant shift doesn't crash."""
        enhancer = VocalEnhancer(formant_shift=-1.2)
        output_path = self.output_dir / "enhanced_formant_shift.wav"

        result_path, metadata = enhancer.enhance(
            input_path=self.test_audio_path,
            output_path=output_path,
        )

        self.assertTrue(result_path.exists())
        self.assertFalse(metadata.processing_applied["formant_shift"])

    def test_audio_length_preservation(self):
        """Test that output audio has similar length to input."""
        enhancer = VocalEnhancer()
        output_path = self.output_dir / "enhanced_length_test.wav"

        enhancer.enhance(
            input_path=self.test_audio_path,
            output_path=output_path,
        )

        input_audio, _ = sf.read(self.test_audio_path)
        output_audio, _ = sf.read(output_path)

        length_diff = abs(len(input_audio) - len(output_audio))
        self.assertLess(length_diff, 1000)


if __name__ == "__main__":
    unittest.main()
