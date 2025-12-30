"""CLI entry point for ThreadToHitRemix."""
from __future__ import annotations

import argparse
import logging
import os
from pathlib import Path

import yaml
from dotenv import load_dotenv

from scripts.story_extractor import load_thread
from scripts.workflow import ThreadToHitWorkflow

logging.basicConfig(level=logging.INFO, format="%(levelname)s [%(name)s]: %(message)s")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Turn forum threads into produced songs")
    parser.add_argument(
        "--thread",
        type=Path,
        default=None,
        help="Path to text file with thread content",
    )
    parser.add_argument(
        "--thread-url",
        type=str,
        help="Remote URL for thread content (overrides --thread)",
    )
    parser.add_argument(
        "--voice",
        type=Path,
        default=None,
        help="Path to dry vocal WAV for conversion",
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=None,
        help="Path to pipeline config (overrides --preset)",
    )
    parser.add_argument(
        "--preset",
        type=str,
        choices=["default", "fast"],
        default="default",
        help="Preset configuration (default: pipeline.yaml, fast: fast.yaml)",
    )
    parser.add_argument(
        "--vocal-mode",
        type=str,
        choices=["auto", "raw", "enhanced", "rvc"],
        default="auto",
        help="Vocal processing mode (auto: use config, raw: no processing, enhanced: enhancer only, rvc: enhancer + RVC)",
    )
    parser.add_argument(
        "--voice-model",
        type=Path,
        default=None,
        help="Override voice model path from config",
    )
    parser.add_argument(
        "--rvc-root",
        type=Path,
        default=Path("deps/RVC-WebUI"),
        help="Location of the cloned RVC-WebUI repo",
    )
    return parser.parse_args()


def main() -> None:
    load_dotenv()
    args = parse_args()

    if args.config:
        config_path = args.config
    else:
        preset_map = {
            "default": Path("configs/pipeline.yaml"),
            "fast": Path("configs/fast.yaml"),
        }
        config_path = preset_map[args.preset]

    print(f"Using config: {config_path}")

    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
    if not anthropic_key:
        raise RuntimeError("ANTHROPIC_API_KEY missing. Add it to your .env file.")

    workflow = ThreadToHitWorkflow(
        config_path=config_path,
        anthropic_key=anthropic_key,
        rvc_root=args.rvc_root,
    )

    if args.vocal_mode != "auto":
        print(f"Overriding vocal_mode from CLI: {args.vocal_mode}")
        workflow.vocal_mode = args.vocal_mode

    if args.voice_model:
        print(f"Overriding voice model from CLI: {args.voice_model}")
        workflow.voice_model_path = args.voice_model

    thread_source = args.thread_url or (str(args.thread) if args.thread else None)
    if not thread_source:
        raise ValueError("Provide either --thread or --thread-url")

    thread_text = load_thread(thread_source)
    artifacts = workflow.run(thread_text, user_voice=args.voice)

    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE")
    print("=" * 60)
    print(f"Hook: {artifacts.story.hook}")
    print(f"Lyrics saved to: {artifacts.lyrics_path}")
    if artifacts.enhanced_vocals_path:
        print(f"Enhanced vocals: {artifacts.enhanced_vocals_path}")
    if artifacts.vocal_metadata:
        print(f"Detected key: {artifacts.vocal_metadata.detected_key}")
        print(f"Median pitch: {artifacts.vocal_metadata.median_pitch_hz:.1f}Hz")
    print(f"Final vocal: {artifacts.vocal_path}")
    print(f"Mix saved to: {artifacts.mix_path}")
    if artifacts.hit_score:
        print(f"\n{artifacts.hit_score.feedback}")
    print("=" * 60)


if __name__ == "__main__":
    main()
