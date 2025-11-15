"""Bootstrap script for the ThreadToHitRemix repo."""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path
from typing import Sequence

import requests

REPO_ROOT = Path(__file__).resolve().parent
DEPS_DIR = REPO_ROOT / "deps"
AUDIOCRAFT_REPO = "https://github.com/facebookresearch/audiocraft.git"
RVC_REPO = "https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI.git"
VOICE_MODEL_URL = (
    "https://huggingface.co/datasets/ashishpatel26/sample-audio-files/resolve/main/NEFFEX.wav"
)
VOICE_MODEL_PATH = REPO_ROOT / "models" / "neffex_placeholder.wav"
REQUIRED_DIRS = [
    REPO_ROOT / "inputs",
    REPO_ROOT / "inputs" / "threads",
    REPO_ROOT / "inputs" / "voice",
    REPO_ROOT / "outputs",
]


def run(cmd: Sequence[str], cwd: Path | None = None) -> None:
    print("Executing:", " ".join(cmd))
    subprocess.check_call(cmd, cwd=cwd)


def ensure_dirs() -> None:
    for path in REQUIRED_DIRS + [DEPS_DIR]:
        path.mkdir(parents=True, exist_ok=True)
        print(f"Ensured directory: {path.relative_to(REPO_ROOT)}")


def clone_repo(url: str, destination: Path) -> None:
    if destination.exists():
        print(f"Repo already present at {destination.relative_to(REPO_ROOT)}, skipping clone")
        return
    run(["git", "clone", url, str(destination)])


def install_packages() -> None:
    packages = [
        "torch",
        "librosa",
        "anthropic",
        "soundfile",
        "requests",
        "scikit-learn",
        "git+https://github.com/facebookresearch/audiocraft.git",
    ]
    run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
    run([sys.executable, "-m", "pip", "install"] + packages)


def download_voice_model() -> None:
    VOICE_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    if VOICE_MODEL_PATH.exists():
        print("Voice model placeholder already present")
        return
    try:
        print(f"Downloading NEFFEX placeholder voice model from {VOICE_MODEL_URL}")
        response = requests.get(VOICE_MODEL_URL, timeout=30)
        response.raise_for_status()
        VOICE_MODEL_PATH.write_bytes(response.content)
    except Exception as exc:  # noqa: BLE001 - show helpful msg
        print(f"Download failed ({exc}). Writing placeholder instructions instead.")
        VOICE_MODEL_PATH.with_suffix(".txt").write_text(
            "Download a NEFFEX-styled RVC checkpoint and place it here.",
            encoding="utf-8",
        )


def test_imports() -> None:
    import importlib

    modules = ["torch", "librosa", "anthropic", "audiocraft", "sklearn"]
    for name in modules:
        importlib.import_module(name)
        print(f"Imported {name}")
    import torch

    print("CUDA available:" , torch.cuda.is_available())


def main() -> None:
    ensure_dirs()
    clone_repo(AUDIOCRAFT_REPO, DEPS_DIR / "audiocraft")
    clone_repo(RVC_REPO, DEPS_DIR / "RVC-WebUI")
    install_packages()
    download_voice_model()
    test_imports()
    print("Setup complete 🥁")


if __name__ == "__main__":
    main()
