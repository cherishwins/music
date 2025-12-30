#!/usr/bin/env python3
"""
Hip Hop Viral Intelligence - Qdrant Uploader

Uploads hip hop embeddings with viral features to Qdrant.
Replaces old garbage pop/country data.

Usage:
    python upload_hiphop_qdrant.py --input ./hiphop_embeddings --replace
"""

from __future__ import annotations

import argparse
import json
import os
import uuid
from pathlib import Path

import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    PointStruct,
    VectorParams,
)
from tqdm import tqdm

# New collection for hip hop / viral patterns
COLLECTION_NAME = "hiphop_viral"
OLD_COLLECTION = "lyric_patterns"  # The garbage we're replacing
EMBEDDING_DIM = 384


def get_qdrant_client() -> QdrantClient:
    """Initialize Qdrant client from environment."""
    url = os.environ.get("QDRANT_URL")
    api_key = os.environ.get("QDRANT_API_KEY")

    if not url:
        raise ValueError("QDRANT_URL not set")
    if not api_key:
        raise ValueError("QDRANT_API_KEY not set")

    return QdrantClient(url=url, api_key=api_key)


def delete_old_collection(client: QdrantClient):
    """Delete the old garbage collection."""
    try:
        collections = client.get_collections().collections
        if any(c.name == OLD_COLLECTION for c in collections):
            print(f"Deleting old garbage collection: {OLD_COLLECTION}")
            client.delete_collection(OLD_COLLECTION)
            print("Deleted. Good riddance to ABBA.")
    except Exception as e:
        print(f"Could not delete old collection: {e}")


def ensure_collection(client: QdrantClient, dim: int, recreate: bool = False):
    """Create or recreate collection."""
    collections = client.get_collections().collections
    exists = any(c.name == COLLECTION_NAME for c in collections)

    if exists and recreate:
        print(f"Recreating collection: {COLLECTION_NAME}")
        client.delete_collection(COLLECTION_NAME)
        exists = False

    if not exists:
        print(f"Creating collection: {COLLECTION_NAME}")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
        )
    else:
        print(f"Collection exists: {COLLECTION_NAME}")


def load_data(input_dir: Path) -> tuple[list[dict], np.ndarray]:
    """Load metadata and embeddings."""
    embeddings = np.load(input_dir / "embeddings.npy")

    metadata = []
    with open(input_dir / "metadata.jsonl", "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                metadata.append(json.loads(line))

    return metadata, embeddings


def upload_to_qdrant(
    client: QdrantClient,
    metadata: list[dict],
    embeddings: np.ndarray,
    batch_size: int = 100,
):
    """Upload hip hop embeddings with viral features."""
    print(f"Uploading {len(metadata)} hip hop tracks to Qdrant...")

    points = []
    for i, meta in enumerate(tqdm(metadata, desc="Preparing")):
        # Build payload with viral features
        payload = {
            "source": meta.get("source", "rap_lyrics_english"),
            "lyrics_preview": meta.get("lyrics_preview", "")[:300],
            # Viral features
            "viral_score": meta.get("viral_score", 0),
            "hook_score": meta.get("hook_score", 0),
            "repetition_ratio": meta.get("repetition_ratio", 0),
            "adlib_density": meta.get("adlib_density", 0),
            "short_line_ratio": meta.get("short_line_ratio", 0),
            "exclamation_energy": meta.get("exclamation_energy", 0),
            "phonk_score": meta.get("phonk_score", 0),
            "first_line_punch": meta.get("first_line_punch", 0),
            "word_count": meta.get("word_count", 0),
            "line_count": meta.get("line_count", 0),
            "top_hooks": meta.get("top_hooks", []),
        }

        point_id = str(uuid.uuid4())
        points.append(PointStruct(
            id=point_id,
            vector=embeddings[i].tolist(),
            payload=payload,
        ))

    # Upload in batches
    for i in tqdm(range(0, len(points), batch_size), desc="Uploading"):
        batch = points[i:i + batch_size]
        client.upsert(collection_name=COLLECTION_NAME, points=batch)

    print(f"Uploaded {len(points)} hip hop tracks")


def test_search(client: QdrantClient, embeddings: np.ndarray):
    """Test search and show high viral tracks."""
    print("\n" + "="*50)
    print("SEARCHING FOR VIRAL PATTERNS")
    print("="*50)

    # Search with first embedding
    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=embeddings[0].tolist(),
        limit=5,
    )

    print("\nTop 5 similar tracks:")
    for r in results:
        viral = r.payload.get('viral_score', 0)
        hooks = r.payload.get('top_hooks', [])[:2]
        print(f"  Viral: {viral:2d} | Hooks: {hooks}")

    # Find highest viral scores
    print("\n" + "-"*50)
    print("Searching for highest viral scores...")

    # Use scroll to get all points and find highest viral
    all_points, _ = client.scroll(
        collection_name=COLLECTION_NAME,
        limit=100,
        with_payload=True,
        with_vectors=False,
    )

    # Sort by viral score
    sorted_points = sorted(
        all_points,
        key=lambda p: p.payload.get('viral_score', 0),
        reverse=True
    )

    print("\nTop 10 MOST VIRAL tracks:")
    for p in sorted_points[:10]:
        viral = p.payload.get('viral_score', 0)
        hooks = p.payload.get('top_hooks', [])[:3]
        rep = p.payload.get('repetition_ratio', 0)
        print(f"  Viral: {viral:3d} | Rep: {rep:.2f} | Hooks: {hooks}")


def main():
    parser = argparse.ArgumentParser(description="Upload hip hop to Qdrant")
    parser.add_argument("--input", "-i", type=Path, default=Path("./hiphop_embeddings"))
    parser.add_argument("--batch-size", type=int, default=100)
    parser.add_argument("--replace", action="store_true", help="Delete old collection first")
    parser.add_argument("--delete-old", action="store_true", help="Also delete old lyric_patterns collection")

    args = parser.parse_args()

    # Load dotenv
    try:
        from dotenv import load_dotenv
        # Load from parent project
        env_path = Path(__file__).parent.parent.parent / ".env"
        load_dotenv(env_path)
    except ImportError:
        pass

    # Initialize client
    client = get_qdrant_client()

    # Delete old garbage if requested
    if args.delete_old:
        delete_old_collection(client)

    # Load data
    metadata, embeddings = load_data(args.input)
    print(f"Loaded {len(metadata)} hip hop tracks")

    # Ensure collection exists
    ensure_collection(client, embeddings.shape[1], recreate=args.replace)

    # Upload
    upload_to_qdrant(client, metadata, embeddings, batch_size=args.batch_size)

    # Test
    test_search(client, embeddings)

    print("\n" + "="*50)
    print("HIP HOP INTELLIGENCE IS LIVE!")
    print(f"Collection: {COLLECTION_NAME}")
    print(f"Tracks: {len(metadata)}")
    print("="*50)


if __name__ == "__main__":
    main()
