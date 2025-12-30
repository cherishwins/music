"""Quality-first vocal enhancement pipeline."""
from __future__ import annotations

import json
import logging
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Optional

import librosa
import numpy as np
import soundfile as sf
from scipy import signal

logger = logging.getLogger(__name__)


@dataclass
class VocalMetadata:
    """Metadata extracted during vocal enhancement."""

    detected_key: Optional[str]
    median_pitch_hz: Optional[float]
    snr_db: Optional[float]
    processing_applied: Dict[str, bool]


class VocalEnhancer:
    """Enhances vocal recordings with denoising, EQ, and creative effects."""

    def __init__(
        self,
        sample_rate: int = 44100,
        denoise_db: float = 18.0,
        formant_shift: float = 0.0,
        doubler_mix: float = 0.35,
        pitch_correction: bool = False,
    ) -> None:
        self.sample_rate = sample_rate
        self.denoise_db = denoise_db
        self.formant_shift = formant_shift
        self.doubler_mix = doubler_mix
        self.pitch_correction = pitch_correction

    def enhance(
        self,
        input_path: Path,
        output_path: Path,
        config: Optional[Dict] = None,
    ) -> tuple[Path, VocalMetadata]:
        """
        Apply enhancement pipeline to vocal recording.

        Args:
            input_path: Path to input WAV file
            output_path: Path for enhanced output WAV
            config: Optional override config dict

        Returns:
            Tuple of (output_path, metadata)
        """
        if config:
            self._update_from_config(config)

        logger.info(f"Loading vocals from {input_path}")
        audio, sr = sf.read(input_path, always_2d=True)

        if sr != self.sample_rate:
            logger.warning(f"Resampling from {sr}Hz to {self.sample_rate}Hz")
            audio = librosa.resample(audio.T, orig_sr=sr, target_sr=self.sample_rate).T

        processing_log = {}

        audio, snr = self._spectral_denoise(audio)
        processing_log["spectral_denoise"] = True

        audio = self._highpass_filter(audio)
        processing_log["highpass_filter"] = True

        detected_key, median_pitch = self._detect_pitch(audio)
        processing_log["pitch_detection"] = detected_key is not None

        if self.pitch_correction and detected_key:
            logger.warning("Pitch correction requested but not yet implemented (TODO)")
            processing_log["pitch_correction"] = False
        else:
            processing_log["pitch_correction"] = False

        if abs(self.formant_shift) > 0.01:
            logger.warning("Formant shift requested but not yet implemented (TODO)")
            processing_log["formant_shift"] = False
        else:
            processing_log["formant_shift"] = False

        if self.doubler_mix > 0.0:
            audio = self._apply_doubler(audio)
            processing_log["vocal_doubler"] = True
        else:
            processing_log["vocal_doubler"] = False

        output_path.parent.mkdir(parents=True, exist_ok=True)
        sf.write(output_path, audio, self.sample_rate)
        logger.info(f"Enhanced vocals saved to {output_path}")

        metadata = VocalMetadata(
            detected_key=detected_key,
            median_pitch_hz=median_pitch,
            snr_db=snr,
            processing_applied=processing_log,
        )

        metadata_path = output_path.with_suffix(".json")
        with open(metadata_path, "w", encoding="utf-8") as handle:
            json.dump(asdict(metadata), handle, indent=2)
        logger.info(f"Metadata saved to {metadata_path}")

        return output_path, metadata

    def _spectral_denoise(self, audio: np.ndarray) -> tuple[np.ndarray, Optional[float]]:
        """
        Apply spectral noise gate using simple power-based gating.

        Returns:
            Tuple of (denoised_audio, estimated_snr_db)
        """
        try:
            stft = librosa.stft(audio.T)
            mag = np.abs(stft)
            phase = np.angle(stft)

            threshold = 10 ** (-self.denoise_db / 20)
            noise_floor = np.percentile(mag, 10)
            gate_threshold = noise_floor * (1 / threshold)

            mask = mag > gate_threshold
            mag_gated = mag * mask

            snr = self._estimate_snr(mag, mag_gated)

            stft_clean = mag_gated * np.exp(1j * phase)
            audio_clean = librosa.istft(stft_clean).T

            if audio_clean.shape[0] < audio.shape[0]:
                audio_clean = np.pad(
                    audio_clean,
                    ((0, audio.shape[0] - audio_clean.shape[0]), (0, 0)),
                    mode="constant",
                )
            elif audio_clean.shape[0] > audio.shape[0]:
                audio_clean = audio_clean[: audio.shape[0], :]

            return audio_clean, snr

        except Exception as e:
            logger.warning(f"Spectral denoising failed: {e}, returning original audio")
            return audio, None

    def _highpass_filter(self, audio: np.ndarray, cutoff_hz: float = 80.0) -> np.ndarray:
        """Apply high-pass filter to remove sub-bass rumble."""
        nyquist = self.sample_rate / 2.0
        normalized_cutoff = cutoff_hz / nyquist

        sos = signal.butter(4, normalized_cutoff, btype="high", output="sos")

        filtered = np.zeros_like(audio)
        for ch in range(audio.shape[1]):
            filtered[:, ch] = signal.sosfilt(sos, audio[:, ch])

        return filtered

    def _detect_pitch(self, audio: np.ndarray) -> tuple[Optional[str], Optional[float]]:
        """
        Detect pitch using librosa.pyin and estimate musical key.

        Returns:
            Tuple of (detected_key_name, median_pitch_hz)
        """
        try:
            mono = librosa.to_mono(audio.T)

            f0, voiced_flag, _ = librosa.pyin(
                mono,
                fmin=librosa.note_to_hz("C2"),
                fmax=librosa.note_to_hz("C6"),
                sr=self.sample_rate,
            )

            voiced_pitches = f0[voiced_flag]
            median_pitch = float(np.median(voiced_pitches)) if len(voiced_pitches) else None

            dominant_pitch = self._dominant_frequency(mono)

            if dominant_pitch is not None:
                if median_pitch is None:
                    median_pitch = dominant_pitch
                else:
                    ratio = dominant_pitch / max(median_pitch, 1e-6)
                    if ratio > 1.8 or ratio < 0.55:
                        median_pitch = dominant_pitch
                    else:
                        median_pitch = float((median_pitch + dominant_pitch) / 2.0)

            if median_pitch is None:
                logger.warning("No pitched content detected")
                return None, None

            note_number = librosa.hz_to_midi(median_pitch)
            note_name = librosa.midi_to_note(int(round(note_number)))
            detected_key = note_name[:-1]

            logger.info(f"Detected key: {detected_key}, median pitch: {median_pitch:.1f}Hz")

            return detected_key, median_pitch

        except Exception as e:
            logger.warning(f"Pitch detection failed: {e}")
            return None, None

    def _dominant_frequency(self, mono: np.ndarray) -> Optional[float]:
        """Estimate dominant frequency via FFT peak detection."""
        try:
            window = np.hanning(len(mono))
            spectrum = np.fft.rfft(mono * window)
            freqs = np.fft.rfftfreq(len(mono), 1 / self.sample_rate)
            idx = int(np.argmax(np.abs(spectrum)))
            if idx <= 0 or idx >= len(freqs):
                return None
            return float(freqs[idx])
        except Exception as exc:  # pragma: no cover - defensive fallback
            logger.debug(f"Dominant frequency estimation failed: {exc}")
            return None

    def _apply_doubler(self, audio: np.ndarray) -> np.ndarray:
        """
        Create vocal doubler effect with slight delay and detuning.

        Doubler adds richness by creating a slightly delayed and pitch-shifted copy.
        """
        delay_ms = 15
        detune_cents = 8

        delay_samples = int((delay_ms / 1000.0) * self.sample_rate)

        detune_factor = 2 ** (detune_cents / 1200.0)
        doubled = librosa.effects.pitch_shift(
            audio.T,
            sr=self.sample_rate,
            n_steps=detune_cents / 100.0,
        ).T

        if doubled.shape[0] > audio.shape[0]:
            doubled = doubled[: audio.shape[0], :]
        elif doubled.shape[0] < audio.shape[0]:
            doubled = np.pad(
                doubled,
                ((0, audio.shape[0] - doubled.shape[0]), (0, 0)),
                mode="constant",
            )

        delayed = np.pad(doubled, ((delay_samples, 0), (0, 0)), mode="constant")
        delayed = delayed[: audio.shape[0], :]

        mixed = audio * (1 - self.doubler_mix) + delayed * self.doubler_mix

        return np.clip(mixed, -1.0, 1.0)

    def _estimate_snr(self, original_mag: np.ndarray, cleaned_mag: np.ndarray) -> float:
        """Estimate signal-to-noise ratio in dB."""
        signal_power = np.mean(cleaned_mag**2)
        noise_mag = original_mag - cleaned_mag
        noise_power = np.mean(noise_mag**2) + 1e-10

        snr = 10 * np.log10(signal_power / noise_power)
        return float(snr)

    def _update_from_config(self, config: Dict) -> None:
        """Update parameters from config dict."""
        if "denoise_db" in config:
            self.denoise_db = config["denoise_db"]
        if "formant_shift" in config:
            self.formant_shift = config["formant_shift"]
        if "doubler_mix" in config:
            self.doubler_mix = config["doubler_mix"]
        if "pitch_correction" in config:
            self.pitch_correction = config["pitch_correction"]


def main():
    """CLI hook for testing VocalEnhancer."""
    import argparse

    parser = argparse.ArgumentParser(description="Enhance vocal recordings")
    parser.add_argument("input", type=Path, help="Input WAV file")
    parser.add_argument("output", type=Path, help="Output WAV file")
    parser.add_argument("--dry-run", action="store_true", help="Test on short segment")
    parser.add_argument("--denoise-db", type=float, default=18.0, help="Denoise threshold")
    parser.add_argument("--doubler-mix", type=float, default=0.35, help="Doubler mix amount")

    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

    enhancer = VocalEnhancer(
        denoise_db=args.denoise_db,
        doubler_mix=args.doubler_mix,
    )

    if args.dry_run:
        logger.info("Dry-run mode: processing first 5 seconds only")
        audio, sr = sf.read(args.input)
        short_audio = audio[: sr * 5]
        temp_input = Path("/tmp/vocal_test_input.wav")
        sf.write(temp_input, short_audio, sr)
        enhancer.enhance(temp_input, args.output)
    else:
        enhancer.enhance(args.input, args.output)

    logger.info("Enhancement complete!")


if __name__ == "__main__":
    main()
