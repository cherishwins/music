"""Utilities for combining stems with Librosa."""
from __future__ import annotations

import logging
from pathlib import Path

import librosa
import numpy as np
import pyloudnorm as pyln
import soundfile as sf

logger = logging.getLogger(__name__)


class StemMixer:
    """Simple stereo summing with gain staging."""

    def __init__(
        self,
        sample_rate: int = 44100,
        echo_delay_seconds: float = 0.25,
        echo_decay: float = 0.35,
    ) -> None:
        self.sample_rate = sample_rate
        self.echo_delay_seconds = echo_delay_seconds
        self.echo_decay = echo_decay

    def mix(
        self,
        instrumental_path: Path,
        vocal_path: Path,
        output_path: Path,
        instrumental_gain_db: float = -3.0,
        vocal_gain_db: float = -1.0,
        add_vocal_echo: bool = True,
    ) -> Path:
        inst, _ = librosa.load(instrumental_path, sr=self.sample_rate, mono=False)
        vox, _ = librosa.load(vocal_path, sr=self.sample_rate, mono=False)
        inst = self._apply_gain(inst, instrumental_gain_db)
        vox = self._apply_gain(vox, vocal_gain_db)
        if add_vocal_echo:
            vox = self._apply_echo(vox)
        max_len = max(inst.shape[-1], vox.shape[-1])
        inst = self._pad(inst, max_len)
        vox = self._pad(vox, max_len)
        mix = inst + vox
        mix = np.clip(mix, -1.0, 1.0)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        sf.write(output_path, mix.T, self.sample_rate)
        return output_path

    def _apply_gain(self, audio: np.ndarray, gain_db: float) -> np.ndarray:
        gain = 10 ** (gain_db / 20)
        return audio * gain

    def _pad(self, audio: np.ndarray, target_len: int) -> np.ndarray:
        if audio.shape[-1] >= target_len:
            return audio[..., :target_len]
        pad_width = target_len - audio.shape[-1]
        return np.pad(audio, ((0, 0), (0, pad_width)))

    def _apply_echo(self, audio: np.ndarray) -> np.ndarray:
        delay = int(self.echo_delay_seconds * self.sample_rate)
        if delay <= 0:
            return audio
        echoed = np.copy(audio)
        padded = np.pad(audio, ((0, 0), (delay, 0)))[:, : audio.shape[-1]]
        echoed += padded * self.echo_decay
        return np.clip(echoed, -1.0, 1.0)

    def normalize_lufs(
        self,
        audio_path: Path,
        output_path: Path,
        target_lufs: float = -9.5,
    ) -> Path:
        """
        Normalize audio to target LUFS loudness standard.

        Args:
            audio_path: Input audio file
            output_path: Output normalized file
            target_lufs: Target integrated loudness (typical: -14 to -9 LUFS)

        Returns:
            Path to normalized audio file
        """
        audio, sr = sf.read(audio_path, always_2d=True)

        meter = pyln.Meter(sr)
        loudness = meter.integrated_loudness(audio)

        logger.info(f"Current loudness: {loudness:.2f} LUFS, target: {target_lufs:.2f} LUFS")

        normalized = pyln.normalize.loudness(audio, loudness, target_lufs)

        normalized = np.clip(normalized, -1.0, 1.0)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        sf.write(output_path, normalized, sr)

        logger.info(f"Normalized audio saved to {output_path}")
        return output_path

    def blend_vocals(
        self,
        vocal_a_path: Path,
        vocal_b_path: Path,
        output_path: Path,
        blend_ratio: float = 0.5,
    ) -> Path:
        """
        Blend two vocal stems with weighted mixing.

        Args:
            vocal_a_path: First vocal stem (e.g., enhanced vocals)
            vocal_b_path: Second vocal stem (e.g., RVC-processed vocals)
            output_path: Output blended file
            blend_ratio: Mix ratio (0.0 = all A, 1.0 = all B)

        Returns:
            Path to blended vocal file
        """
        vox_a, sr_a = sf.read(vocal_a_path, always_2d=True)
        vox_b, sr_b = sf.read(vocal_b_path, always_2d=True)

        if sr_a != sr_b:
            logger.warning(f"Sample rate mismatch: {sr_a}Hz vs {sr_b}Hz, resampling B")
            vox_b = librosa.resample(vox_b.T, orig_sr=sr_b, target_sr=sr_a).T

        max_len = max(vox_a.shape[0], vox_b.shape[0])
        vox_a = self._pad(vox_a.T, max_len).T
        vox_b = self._pad(vox_b.T, max_len).T

        blended = vox_a * (1 - blend_ratio) + vox_b * blend_ratio
        blended = np.clip(blended, -1.0, 1.0)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        sf.write(output_path, blended, sr_a)

        logger.info(f"Blended vocals ({blend_ratio:.0%} B) saved to {output_path}")
        return output_path
