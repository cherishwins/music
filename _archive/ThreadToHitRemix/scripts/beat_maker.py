"""Beat generation utilities built on top of MusicGen."""
from __future__ import annotations

from pathlib import Path
from typing import Optional

import torch


def _ensure_torch_pytree_shim() -> None:
    """Bridge missing APIs for older torch builds."""

    try:
        from torch.utils import _pytree as torch_pytree

        if not hasattr(torch_pytree, "register_pytree_node") and hasattr(
            torch_pytree, "_register_pytree_node"
        ):

            def _legacy_wrapper(node_type, flatten_fn, unflatten_fn, **_kwargs):
                return torch_pytree._register_pytree_node(
                    node_type,
                    flatten_fn,
                    unflatten_fn,
                )

            torch_pytree.register_pytree_node = _legacy_wrapper
    except Exception:  # pragma: no cover - best-effort compatibility shim
        pass


_ensure_torch_pytree_shim()

from audiocraft.models import MusicGen


class BeatMaker:
    """Thin wrapper so we can swap model presets from config."""

    def __init__(
        self,
        preset: str = "facebook/musicgen-small",
        duration_seconds: int = 30,
        target_bpm: int = 120,
        device: Optional[str] = None,
    ) -> None:
        self.preset = preset
        self.duration_seconds = duration_seconds
        self.target_bpm = target_bpm
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self._model: Optional[MusicGen] = None

    def load(self) -> MusicGen:
        if self._model is None:
            self._model = MusicGen.get_pretrained(self.preset)
            self._model.set_generation_params(duration=self.duration_seconds)
            self._model.to(self.device)
        return self._model

    def create_beat(self, prompt: str, output_path: Path) -> Path:
        model = self.load()
        enriched_prompt = f"{prompt}. Target tempo {self.target_bpm} BPM."
        audio = model.generate(descriptions=[enriched_prompt])
        wav = audio[0].cpu()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        from audiocraft.data.audio_utils import save_wav

        save_wav(wav, output_path, sample_rate=model.sample_rate)
        return output_path
