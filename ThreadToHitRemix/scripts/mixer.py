"""Utilities for combining stems with Librosa."""
from __future__ import annotations

from pathlib import Path

import librosa
import numpy as np
import soundfile as sf


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
