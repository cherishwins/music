"""Integration points for RVC-WebUI voice conversion."""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path
from typing import Optional


class RvcVoiceConverter:
    """Invokes the command-line hooks exposed by the RVC-WebUI project."""

    def __init__(self, rvc_root: Path, python_bin: str = "python") -> None:
        self.rvc_root = rvc_root
        self.python_bin = python_bin

    def convert(
        self,
        source_vocals: Path,
        output_path: Path,
        config_name: str,
        voice_model: Optional[Path] = None,
        index_file: Optional[Path] = None,
        f0_method: str = "rmvpe",
    ) -> Path:
        """Calls RVC inference script with sensible defaults."""
        if voice_model:
            weights_dir = self.rvc_root / "weights"
            weights_dir.mkdir(parents=True, exist_ok=True)
            target = weights_dir / voice_model.name
            if not target.exists():
                shutil.copy2(voice_model, target)
                print(f"Copied voice model to {target}")
        cmd = [
            self.python_bin,
            str(self.rvc_root / "infer-web.py"),
            "--f0p",
            f0_method,
            "--path",
            str(source_vocals),
            "--opt",
            config_name,
            "--out",
            str(output_path),
        ]
        if index_file:
            cmd.extend(["--index", str(index_file)])
        subprocess.run(cmd, check=True)
        return output_path
