"""Quick-and-dirty hit prediction heuristic."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Tuple

import librosa
import numpy as np
from sklearn.linear_model import LogisticRegression


@dataclass
class HitScore:
    score: float
    feedback: str


class HitPredictor:
    """Learns a simple classifier on synthetic data to score tracks."""

    def __init__(self, tempo_range: Tuple[int, int] = (100, 130), seed: int = 42) -> None:
        self.tempo_range = tempo_range
        self.rng = np.random.default_rng(seed)
        self.model = self._train_dummy_model()

    def _train_dummy_model(self) -> LogisticRegression:
        """Train a classifier on procedurally generated features."""
        samples = 256
        tempo_min, tempo_max = self.tempo_range
        tempos = self.rng.uniform(80, 150, samples)
        energies = self.rng.uniform(0.3, 0.95, samples)
        repetitions = self.rng.uniform(0.4, 0.95, samples)
        labels = (
            (np.abs(tempos - np.mean(self.tempo_range)) < 15)
            & (energies > 0.6)
            & (repetitions > 0.65)
        ).astype(int)
        features = np.stack([tempos, energies, repetitions], axis=1)
        model = LogisticRegression(max_iter=200)
        model.fit(features, labels)
        return model

    def score_track(self, wav_path: Path) -> HitScore:
        features = self._extract_features(wav_path)
        proba = float(self.model.predict_proba([features])[0][1])
        score = round(proba * 100, 2)
        feedback = self._build_feedback(features, score)
        return HitScore(score=score, feedback=feedback)

    def _extract_features(self, wav_path: Path) -> np.ndarray:
        audio, sr = librosa.load(wav_path, sr=44100, mono=True)
        tempo, _ = librosa.beat.beat_track(y=audio, sr=sr)
        rms = librosa.feature.rms(y=audio).mean()
        mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
        norm_mfcc = (mfcc - mfcc.mean(axis=1, keepdims=True)) / (
            mfcc.std(axis=1, keepdims=True) + 1e-5
        )
        similarity = np.corrcoef(norm_mfcc)
        repetition = float(np.mean(similarity[np.triu_indices_from(similarity, k=1)]))
        repetition = (repetition + 1) / 2  # normalize from [-1,1] to [0,1]
        tempo_norm = tempo or 0
        return np.array([tempo_norm, float(rms), repetition], dtype=float)

    def _build_feedback(self, features: np.ndarray, score: float) -> str:
        tempo, energy, repetition = features
        remarks = []
        if tempo < self.tempo_range[0]:
            remarks.append("Push BPM for more drive")
        elif tempo > self.tempo_range[1]:
            remarks.append("Slightly slow the beat for groove")
        if energy < 0.6:
            remarks.append("Layer more percussion for energy")
        if repetition < 0.65:
            remarks.append("Amp repetition for stickiness")
        if not remarks:
            remarks.append("Great balance—ship it")
        return f"Score {score}/100. " + "; ".join(remarks)