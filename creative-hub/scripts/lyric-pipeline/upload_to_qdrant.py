#!/usr/bin/env python3
"""
Lyric Intelligence Pipeline - Qdrant Uploader

Uploads lyric embeddings to Qdrant for integration with the Creative Hub.
Creates a searchable lyric intelligence database.

Usage:
    python upload_to_qdrant.py --input ./lyric_embeddings
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

# Collection for lyric embeddings (separate from audio embeddings)
COLLECTION_NAME = "lyric_patterns"
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 outputs 384 dims


def get_qdrant_client() -> QdrantClient:
    """Initialize Qdrant client from environment."""
    url = os.environ.get("QDRANT_URL", "http://localhost:6333")
    api_key = os.environ.get("QDRANT_API_KEY")

    if "localhost" not in url and not api_key:
        print("Warning: QDRANT_API_KEY not set for remote Qdrant")

    return QdrantClient(url=url, api_key=api_key)


def ensure_collection(client: QdrantClient, dim: int):
    """Create collection if it doesn't exist."""
    collections = client.get_collections().collections
    exists = any(c.name == COLLECTION_NAME for c in collections)

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

    # Load cluster labels if available
    labels_path = input_dir / "cluster_labels.npy"
    if labels_path.exists():
        labels = np.load(labels_path)
        for i, meta in enumerate(metadata):
            if i < len(labels):
                meta["cluster"] = int(labels[i])

    # Load cluster analysis if available
    analysis_path = input_dir / "cluster_analysis.json"
    cluster_info = {}
    if analysis_path.exists():
        with open(analysis_path, "r") as f:
            cluster_info = json.load(f)

    return metadata, embeddings, cluster_info


def upload_to_qdrant(
    client: QdrantClient,
    metadata: list[dict],
    embeddings: np.ndarray,
    cluster_info: dict,
    batch_size: int = 100,
):
    """Upload embeddings and metadata to Qdrant."""
    print(f"Uploading {len(metadata)} points to Qdrant...")

    points = []
    for i, meta in enumerate(tqdm(metadata, desc="Preparing")):
        # Build payload
        payload = {
            "title": meta.get("title", "Unknown"),
            "artist": meta.get("artist", "Unknown"),
            "genre": meta.get("genre", ""),
            "lyrics_preview": meta.get("lyrics_clean", "")[:500],  # First 500 chars
            "cluster": meta.get("cluster", -1),
        }

        # Add cluster info if available
        cluster_id = str(meta.get("cluster", -1))
        if cluster_id in cluster_info:
            cinfo = cluster_info[cluster_id]
            payload["cluster_terms"] = [t["term"] for t in cinfo.get("distinctive_terms", [])[:5]]
            payload["cluster_size"] = cinfo.get("size", 0)

        # Add performance data if available
        if "performance" in meta and meta["performance"]:
            for k, v in meta["performance"].items():
                if isinstance(v, (int, float, str, bool)):
                    payload[f"perf_{k}"] = v

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

    print(f"Uploaded {len(points)} points")


def test_search(client: QdrantClient, embeddings: np.ndarray):
    """Test search functionality."""
    print("\nTesting search...")

    # Search with first embedding
    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=embeddings[0].tolist(),
        limit=5,
    )

    print("Top 5 similar songs:")
    for r in results:
        print(f"  - {r.payload.get('title', 'Unknown')} by {r.payload.get('artist', 'Unknown')} (score: {r.score:.3f})")


def main():
    parser = argparse.ArgumentParser(description="Upload lyrics to Qdrant")
    parser.add_argument("--input", "-i", type=Path, default=Path("./lyric_embeddings"), help="Input directory")
    parser.add_argument("--batch-size", type=int, default=100, help="Upload batch size")

    args = parser.parse_args()

    # Load dotenv if available
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    # Initialize client
    client = get_qdrant_client()

    # Load data
    metadata, embeddings, cluster_info = load_data(args.input)
    print(f"Loaded {len(metadata)} songs with {embeddings.shape[1]}-dim embeddings")

    # Ensure collection exists
    ensure_collection(client, embeddings.shape[1])

    # Upload
    upload_to_qdrant(client, metadata, embeddings, cluster_info, batch_size=args.batch_size)

    # Test
    test_search(client, embeddings)

    print("\nDone! Lyric intelligence is now searchable in Qdrant.")
    print(f"Collection: {COLLECTION_NAME}")


if __name__ == "__main__":
    main()
