"""Integration tests for vocal processing pipeline."""
import unittest
from pathlib import Path

import numpy as np
import soundfile as sf

from scripts.mixer import StemMixer
from scripts.vocal_enhancer import VocalEnhancer


class TestVocalPipeline(unittest.TestCase):
    """Integration tests for the complete vocal processing pipeline."""

    @classmethod
    def setUpClass(cls):
        """Set up test fixtures and output directory."""
        cls.fixtures_dir = Path(__file__).parent / "fixtures"
        cls.fixtures_dir.mkdir(exist_ok=True)
        cls.output_dir = Path(__file__).parent / "output"
        cls.output_dir.mkdir(exist_ok=True)

        cls.test_vocal_path = cls.fixtures_dir / "test_vocal_440hz.wav"

        if not cls.test_vocal_path.exists():
            sample_rate = 44100
            duration = 2.0
            frequencies = [440.0, 554.37, 659.25]
            audio = np.zeros(int(sample_rate * duration))

            for freq in frequencies:
                t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
                audio += 0.3 * np.sin(2 * np.pi * freq * t)

            noise = np.random.normal(0, 0.02, audio.shape)
            audio = audio + noise

            audio = audio / np.max(np.abs(audio)) * 0.5
            stereo_audio = np.column_stack([audio, audio])

            sf.write(cls.test_vocal_path, stereo_audio, sample_rate)

        cls.test_instrumental_path = cls.fixtures_dir / "test_instrumental.wav"

        if not cls.test_instrumental_path.exists():
            sample_rate = 44100
            duration = 2.0
            t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
            bass = 0.4 * np.sin(2 * np.pi * 110 * t)
            kick = 0.5 * np.sin(2 * np.pi * 60 * t) * np.exp(-10 * (t % 0.5))
            audio = bass + kick
            audio = audio / np.max(np.abs(audio)) * 0.6
            stereo_audio = np.column_stack([audio, audio])

            sf.write(cls.test_instrumental_path, stereo_audio, sample_rate)

    def test_vocal_mode_raw(self):
        """Test raw vocal mode (no processing)."""
        original_audio, sr = sf.read(self.test_vocal_path)
        self.assertEqual(sr, 44100)
        self.assertGreater(len(original_audio), 0)

    def test_vocal_mode_enhanced(self):
        """Test enhanced vocal mode (enhancer only)."""
        enhancer = VocalEnhancer(denoise_db=15.0, doubler_mix=0.3)
        output_path = self.output_dir / "vocal_enhanced_mode.wav"

        enhanced_path, metadata = enhancer.enhance(
            input_path=self.test_vocal_path,
            output_path=output_path,
        )

        self.assertTrue(enhanced_path.exists())
        self.assertIsNotNone(metadata.detected_key)

        enhanced_audio, sr = sf.read(enhanced_path)
        self.assertEqual(sr, 44100)
        self.assertGreater(len(enhanced_audio), 0)

    def test_vocal_blending(self):
        """Test vocal blending functionality."""
        enhancer = VocalEnhancer(denoise_db=12.0, doubler_mix=0.2)
        mixer = StemMixer()

        vocal_a_path = self.output_dir / "vocal_a.wav"
        vocal_b_path = self.output_dir / "vocal_b.wav"

        enhancer.enhance(self.test_vocal_path, vocal_a_path)

        enhancer_strong = VocalEnhancer(denoise_db=25.0, doubler_mix=0.6)
        enhancer_strong.enhance(self.test_vocal_path, vocal_b_path)

        blended_path = self.output_dir / "vocals_blended.wav"
        result_path = mixer.blend_vocals(
            vocal_a_path=vocal_a_path,
            vocal_b_path=vocal_b_path,
            output_path=blended_path,
            blend_ratio=0.5,
        )

        self.assertTrue(result_path.exists())

        blended_audio, sr = sf.read(blended_path)
        self.assertEqual(sr, 44100)
        self.assertGreater(len(blended_audio), 0)

    def test_lufs_normalization(self):
        """Test LUFS normalization for mastering."""
        mixer = StemMixer()

        normalized_path = self.output_dir / "normalized_lufs.wav"
        result_path = mixer.normalize_lufs(
            audio_path=self.test_vocal_path,
            output_path=normalized_path,
            target_lufs=-12.0,
        )

        self.assertTrue(result_path.exists())

        normalized_audio, sr = sf.read(normalized_path)
        self.assertEqual(sr, 44100)
        self.assertGreater(len(normalized_audio), 0)

    def test_complete_mix_pipeline(self):
        """Test complete mixing pipeline: enhance + mix + master."""
        enhancer = VocalEnhancer(denoise_db=15.0, doubler_mix=0.3)
        mixer = StemMixer()

        enhanced_vocal_path = self.output_dir / "vocal_for_mix.wav"
        enhancer.enhance(self.test_vocal_path, enhanced_vocal_path)

        premix_path = self.output_dir / "premix.wav"
        mixer.mix(
            instrumental_path=self.test_instrumental_path,
            vocal_path=enhanced_vocal_path,
            output_path=premix_path,
            instrumental_gain_db=-3.0,
            vocal_gain_db=-1.0,
            add_vocal_echo=True,
        )

        self.assertTrue(premix_path.exists())

        final_mix_path = self.output_dir / "final_mix_mastered.wav"
        mixer.normalize_lufs(
            audio_path=premix_path,
            output_path=final_mix_path,
            target_lufs=-9.5,
        )

        self.assertTrue(final_mix_path.exists())

        final_audio, sr = sf.read(final_mix_path)
        self.assertEqual(sr, 44100)
        self.assertGreater(len(final_audio), 0)

        rms = np.sqrt(np.mean(final_audio**2))
        self.assertGreater(rms, 0.0)
        self.assertLess(rms, 1.0)

    def test_blend_ratio_extremes(self):
        """Test vocal blending at extreme ratios (0.0 and 1.0)."""
        mixer = StemMixer()

        vocal_a, sr_a = sf.read(self.test_vocal_path)
        vocal_b_path = self.output_dir / "vocal_variant.wav"

        enhancer = VocalEnhancer(doubler_mix=0.8)
        enhancer.enhance(self.test_vocal_path, vocal_b_path)

        blend_0_path = self.output_dir / "blend_0.0.wav"
        mixer.blend_vocals(
            vocal_a_path=self.test_vocal_path,
            vocal_b_path=vocal_b_path,
            output_path=blend_0_path,
            blend_ratio=0.0,
        )

        blend_1_path = self.output_dir / "blend_1.0.wav"
        mixer.blend_vocals(
            vocal_a_path=self.test_vocal_path,
            vocal_b_path=vocal_b_path,
            output_path=blend_1_path,
            blend_ratio=1.0,
        )

        blend_0_audio, _ = sf.read(blend_0_path)
        blend_1_audio, _ = sf.read(blend_1_path)
        vocal_b_audio, _ = sf.read(vocal_b_path)

        self.assertTrue(len(blend_0_audio) > 0)
        self.assertTrue(len(blend_1_audio) > 0)


if __name__ == "__main__":
    unittest.main()
