#!/usr/bin/env python3
"""
Hip Hop & Viral Music Intelligence Pipeline

Focused on patterns that make music GO VIRAL:
- Hook detection (catchy repeated phrases)
- Flow patterns (syllable density, internal rhymes)
- Energy markers (ad-libs, exclamations)
- Meme potential (short memorable phrases)

Usage:
    python embed_hiphop_viral.py --max-samples 5000 --output ./hiphop_embeddings
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Iterator

import numpy as np
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Embedding model
MODEL_NAME = "all-MiniLM-L6-v2"

# Hip hop ad-libs and energy markers
ADLIBS = {
    "yeah", "yuh", "aye", "skrt", "brr", "gang", "woo", "sheesh",
    "lets go", "what", "huh", "ay", "yea", "uh", "oh", "damn",
    "flex", "drip", "ice", "fire", "lit", "cap", "no cap", "facts",
    "slatt", "yeet", "bet", "slay", "sus", "vibe", "goat", "bussin"
}

# Phonk/trap specific markers
PHONK_MARKERS = {
    "drift", "phonk", "cowbell", "bass", "dark", "demon", "shadow",
    "murder", "kill", "death", "blood", "night", "smoke", "lean"
}


def extract_viral_features(lyrics: str) -> dict:
    """
    Extract features that correlate with viral potential.
    """
    if not lyrics:
        return {}

    words = lyrics.lower().split()
    lines = [l.strip() for l in lyrics.split('\n') if l.strip()]

    # 1. Hook detection - find repeated phrases (2-5 words)
    phrase_counts = Counter()
    for n in range(2, 6):
        for i in range(len(words) - n + 1):
            phrase = " ".join(words[i:i+n])
            phrase_counts[phrase] += 1

    # Get most repeated phrases (potential hooks)
    hooks = [(p, c) for p, c in phrase_counts.most_common(10) if c >= 3]
    hook_score = len(hooks)  # More repeated phrases = catchier

    # 2. Repetition ratio (viral songs are repetitive)
    unique_words = set(words)
    repetition_ratio = 1 - (len(unique_words) / max(len(words), 1))

    # 3. Ad-lib density (energy indicator)
    adlib_count = sum(1 for w in words if w in ADLIBS)
    adlib_density = adlib_count / max(len(words), 1)

    # 4. Short line ratio (punchy delivery)
    short_lines = sum(1 for l in lines if len(l.split()) <= 6)
    short_line_ratio = short_lines / max(len(lines), 1)

    # 5. Exclamation energy
    exclamation_count = lyrics.count('!') + lyrics.count('?')

    # 6. Phonk/dark vibe score
    phonk_words = sum(1 for w in words if w in PHONK_MARKERS)
    phonk_score = phonk_words / max(len(words), 1)

    # 7. First line hook potential (crucial for TikTok)
    first_line = lines[0] if lines else ""
    first_line_words = len(first_line.split())
    first_line_punch = 1 if first_line_words <= 8 else 0

    # 8. Calculate overall viral score (0-100)
    viral_score = min(100, int(
        (hook_score * 10) +
        (repetition_ratio * 30) +
        (adlib_density * 100) +
        (short_line_ratio * 20) +
        (first_line_punch * 10) +
        (phonk_score * 50)
    ))

    return {
        "hook_score": hook_score,
        "repetition_ratio": round(repetition_ratio, 3),
        "adlib_density": round(adlib_density, 4),
        "short_line_ratio": round(short_line_ratio, 3),
        "exclamation_energy": exclamation_count,
        "phonk_score": round(phonk_score, 4),
        "first_line_punch": first_line_punch,
        "viral_score": viral_score,
        "word_count": len(words),
        "line_count": len(lines),
        "top_hooks": [p for p, _ in hooks[:5]],
    }


def clean_lyrics(lyrics: str) -> str:
    """Clean lyrics for embedding."""
    if not lyrics:
        return ""

    # Remove section markers
    cleaned = re.sub(r"\[.*?\]", "", lyrics)
    cleaned = re.sub(r"\(.*?\)", "", cleaned)

    # Remove common metadata
    cleaned = re.sub(r"^\d+\s*Contributors.*$", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"^.*Lyrics$", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"Embed$", "", cleaned)

    # Normalize whitespace but keep line breaks for analysis
    lines = [" ".join(line.split()) for line in cleaned.split('\n')]
    cleaned = "\n".join(line for line in lines if line)

    return cleaned.strip()


def load_hiphop_dataset(max_samples: int = 5000) -> Iterator[dict]:
    """Load hip hop lyrics from HuggingFace."""
    from datasets import load_dataset

    print(f"Loading Cropinky/rap_lyrics_english (max {max_samples} samples)...")

    # Use streaming to avoid loading entire dataset
    dataset = load_dataset("Cropinky/rap_lyrics_english", split="train", streaming=True)

    count = 0
    for item in tqdm(dataset, desc="Loading", total=max_samples):
        if count >= max_samples:
            break

        text = item.get("text", "")
        if len(text) < 100:  # Skip very short entries
            continue

        yield {
            "id": str(count),
            "lyrics": text,
            "source": "rap_lyrics_english",
        }
        count += 1

    print(f"Loaded {count} hip hop tracks")


def process_and_embed(
    songs: Iterator[dict],
    model_name: str = MODEL_NAME,
    batch_size: int = 32,
) -> tuple[list[dict], np.ndarray]:
    """Process songs with viral features and generate embeddings."""

    print(f"Loading embedding model: {model_name}")
    model = SentenceTransformer(model_name)

    processed = []
    lyrics_for_embedding = []

    print("Processing lyrics and extracting viral features...")
    for song in songs:
        clean = clean_lyrics(song.get("lyrics", ""))
        if len(clean) < 50:
            continue

        # Extract viral features
        features = extract_viral_features(clean)

        processed.append({
            "id": song["id"],
            "source": song.get("source", "unknown"),
            "lyrics_preview": clean[:200],  # Just a preview
            **features,
        })

        # Use cleaned lyrics for semantic embedding
        lyrics_for_embedding.append(clean)

    print(f"Generating embeddings for {len(lyrics_for_embedding)} tracks...")
    embeddings = model.encode(
        lyrics_for_embedding,
        batch_size=batch_size,
        show_progress_bar=True,
        convert_to_numpy=True,
    )

    return processed, embeddings


def analyze_viral_distribution(songs: list[dict]) -> dict:
    """Analyze the distribution of viral scores."""
    viral_scores = [s["viral_score"] for s in songs]

    return {
        "total_tracks": len(songs),
        "avg_viral_score": round(np.mean(viral_scores), 2),
        "max_viral_score": max(viral_scores),
        "min_viral_score": min(viral_scores),
        "high_viral_count": sum(1 for v in viral_scores if v >= 50),
        "score_distribution": {
            "0-20": sum(1 for v in viral_scores if v < 20),
            "20-40": sum(1 for v in viral_scores if 20 <= v < 40),
            "40-60": sum(1 for v in viral_scores if 40 <= v < 60),
            "60-80": sum(1 for v in viral_scores if 60 <= v < 80),
            "80-100": sum(1 for v in viral_scores if v >= 80),
        }
    }


def save_results(
    songs: list[dict],
    embeddings: np.ndarray,
    output_dir: Path,
):
    """Save processed songs and embeddings."""
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save embeddings
    embeddings_path = output_dir / "embeddings.npy"
    np.save(embeddings_path, embeddings)
    print(f"Saved embeddings: {embeddings_path} (shape: {embeddings.shape})")

    # Save metadata
    metadata_path = output_dir / "metadata.jsonl"
    with open(metadata_path, "w", encoding="utf-8") as f:
        for song in songs:
            f.write(json.dumps(song) + "\n")
    print(f"Saved metadata: {metadata_path}")

    # Analyze viral distribution
    analysis = analyze_viral_distribution(songs)

    # Save stats
    stats = {
        "total_tracks": len(songs),
        "embedding_dim": embeddings.shape[1],
        "model": MODEL_NAME,
        "genre_focus": "hip_hop_viral",
        "viral_analysis": analysis,
    }
    stats_path = output_dir / "stats.json"
    with open(stats_path, "w") as f:
        json.dump(stats, f, indent=2)
    print(f"Saved stats: {stats_path}")

    # Print summary
    print("\n" + "="*50)
    print("VIRAL ANALYSIS SUMMARY")
    print("="*50)
    print(f"Total tracks: {analysis['total_tracks']}")
    print(f"Avg viral score: {analysis['avg_viral_score']}")
    print(f"High viral (50+): {analysis['high_viral_count']} tracks")
    print("\nScore distribution:")
    for bucket, count in analysis['score_distribution'].items():
        pct = count / analysis['total_tracks'] * 100
        bar = "█" * int(pct / 5)
        print(f"  {bucket}: {count:4d} ({pct:5.1f}%) {bar}")


def main():
    parser = argparse.ArgumentParser(description="Hip Hop Viral Embeddings")
    parser.add_argument("--max-samples", type=int, default=5000, help="Max tracks to process")
    parser.add_argument("--output", "-o", type=Path, default=Path("./hiphop_embeddings"), help="Output dir")
    parser.add_argument("--batch-size", type=int, default=32, help="Embedding batch size")

    args = parser.parse_args()

    # Load and process
    songs = load_hiphop_dataset(max_samples=args.max_samples)
    processed, embeddings = process_and_embed(songs, batch_size=args.batch_size)

    # Save results
    save_results(processed, embeddings, args.output)

    print(f"\nDone! Ready to upload to Qdrant.")
    print(f"Next: python upload_to_qdrant.py --input {args.output} --collection hiphop_viral")


if __name__ == "__main__":
    main()
