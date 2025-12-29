#!/usr/bin/env python3
"""
Lyric Intelligence Pipeline - Embedding Generator

Transforms lyrics into vector embeddings for pattern discovery.
Uses Sentence Transformers for semantic embeddings.

Usage:
    python embed_lyrics.py --input lyrics.jsonl --output embeddings.npy
    python embed_lyrics.py --hf-dataset vishnupriyavr/spotify-million-song-dataset
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Iterator

import numpy as np
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Default model - good balance of quality and speed
DEFAULT_MODEL = "all-MiniLM-L6-v2"  # 384 dim, fast
# Alternative: "all-mpnet-base-v2"  # 768 dim, higher quality


def clean_lyrics(lyrics: str) -> str:
    """
    Clean lyrics for embedding.
    Removes section markers, normalizes whitespace.
    """
    if not lyrics:
        return ""

    # Remove section markers like [Verse 1], [Chorus], (Hook), etc.
    cleaned = re.sub(r"\[.*?\]", "", lyrics)
    cleaned = re.sub(r"\(.*?\)", "", cleaned)

    # Remove common metadata patterns
    cleaned = re.sub(r"^\d+\s*Contributors.*$", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"^.*Lyrics$", "", cleaned, flags=re.MULTILINE)

    # Normalize whitespace
    cleaned = " ".join(cleaned.split())

    return cleaned.strip()


def load_jsonl(path: Path) -> Iterator[dict]:
    """Load songs from JSONL file."""
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                yield json.loads(line)


def load_hf_dataset(dataset_name: str, split: str = "train", max_samples: int | None = None):
    """Load lyrics from HuggingFace dataset."""
    from datasets import load_dataset

    print(f"Loading HuggingFace dataset: {dataset_name}")
    dataset = load_dataset(dataset_name, split=split)

    # Common column names for lyrics
    lyrics_cols = ["lyrics", "text", "lyric", "song_lyrics"]
    lyrics_col = None

    for col in lyrics_cols:
        if col in dataset.column_names:
            lyrics_col = col
            break

    if not lyrics_col:
        print(f"Available columns: {dataset.column_names}")
        raise ValueError(f"No lyrics column found in dataset. Tried: {lyrics_cols}")

    print(f"Using lyrics column: {lyrics_col}")

    for i, item in enumerate(dataset):
        if max_samples and i >= max_samples:
            break
        yield {
            "id": str(i),
            "title": item.get("song", item.get("track", item.get("title", f"song_{i}"))),
            "artist": item.get("artist", item.get("singer", "Unknown")),
            "lyrics": item.get(lyrics_col, ""),
            "genre": item.get("genre", item.get("tag", "")),
        }


def embed_lyrics(
    songs: Iterator[dict],
    model_name: str = DEFAULT_MODEL,
    batch_size: int = 32,
) -> tuple[list[dict], np.ndarray]:
    """
    Generate embeddings for lyrics.

    Returns:
        (processed_songs, embeddings) where embeddings is shape (n_songs, embed_dim)
    """
    print(f"Loading model: {model_name}")
    model = SentenceTransformer(model_name)

    processed = []
    lyrics_batch = []

    print("Processing lyrics...")
    for song in tqdm(songs, desc="Cleaning"):
        clean = clean_lyrics(song.get("lyrics", ""))
        if len(clean) < 50:  # Skip very short lyrics
            continue

        processed.append({
            **song,
            "lyrics_clean": clean,
        })
        lyrics_batch.append(clean)

    print(f"Generating embeddings for {len(lyrics_batch)} songs...")
    embeddings = model.encode(
        lyrics_batch,
        batch_size=batch_size,
        show_progress_bar=True,
        convert_to_numpy=True,
    )

    return processed, embeddings


def save_results(
    songs: list[dict],
    embeddings: np.ndarray,
    output_dir: Path,
):
    """Save processed songs and embeddings."""
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save embeddings as numpy array
    embeddings_path = output_dir / "embeddings.npy"
    np.save(embeddings_path, embeddings)
    print(f"Saved embeddings: {embeddings_path} (shape: {embeddings.shape})")

    # Save metadata as JSONL (without embeddings)
    metadata_path = output_dir / "metadata.jsonl"
    with open(metadata_path, "w", encoding="utf-8") as f:
        for song in songs:
            # Remove full lyrics to save space
            meta = {k: v for k, v in song.items() if k != "lyrics"}
            f.write(json.dumps(meta) + "\n")
    print(f"Saved metadata: {metadata_path}")

    # Save summary stats
    stats = {
        "total_songs": len(songs),
        "embedding_dim": embeddings.shape[1],
        "model": DEFAULT_MODEL,
    }
    stats_path = output_dir / "stats.json"
    with open(stats_path, "w") as f:
        json.dump(stats, f, indent=2)
    print(f"Saved stats: {stats_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate lyric embeddings")
    parser.add_argument("--input", "-i", type=Path, help="Input JSONL file")
    parser.add_argument("--hf-dataset", type=str, help="HuggingFace dataset name")
    parser.add_argument("--output", "-o", type=Path, default=Path("./lyric_embeddings"), help="Output directory")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL, help="Sentence transformer model")
    parser.add_argument("--max-samples", type=int, help="Limit number of samples")
    parser.add_argument("--batch-size", type=int, default=32, help="Embedding batch size")

    args = parser.parse_args()

    if args.input:
        songs = load_jsonl(args.input)
    elif args.hf_dataset:
        songs = load_hf_dataset(args.hf_dataset, max_samples=args.max_samples)
    else:
        print("Error: Provide --input or --hf-dataset")
        sys.exit(1)

    processed, embeddings = embed_lyrics(
        songs,
        model_name=args.model,
        batch_size=args.batch_size,
    )

    save_results(processed, embeddings, args.output)

    print(f"\nDone! Processed {len(processed)} songs.")
    print(f"Next: Run cluster_lyrics.py to find patterns")


if __name__ == "__main__":
    main()
