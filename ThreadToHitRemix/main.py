"""CLI entry point for ThreadToHitRemix."""
from __future__ import annotations

import argparse
import os
from pathlib import Path

from dotenv import load_dotenv

from scripts.story_extractor import load_thread
from scripts.workflow import ThreadToHitWorkflow


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
        default=Path("configs/pipeline.yaml"),
        help="Path to pipeline config",
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
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
    if not anthropic_key:
        raise RuntimeError("ANTHROPIC_API_KEY missing. Add it to your .env file.")
    workflow = ThreadToHitWorkflow(
        config_path=args.config,
        anthropic_key=anthropic_key,
        rvc_root=args.rvc_root,
    )
    thread_source = args.thread_url or (str(args.thread) if args.thread else None)
    if not thread_source:
        raise ValueError("Provide either --thread or --thread-url")
    thread_text = load_thread(thread_source)
    artifacts = workflow.run(thread_text, user_voice=args.voice)
    print("Hook:", artifacts.story.hook)
    print("Lyrics saved to:", artifacts.lyrics_path)
    print("Mix saved to:", artifacts.mix_path)
    print(artifacts.hit_score.feedback)


if __name__ == "__main__":
    main()
