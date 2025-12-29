#!/usr/bin/env python3
"""
Lyric Intelligence Pipeline - Cluster Analysis

Clusters lyric embeddings to discover hit patterns.
Analyzes what makes each cluster distinctive.

Usage:
    python cluster_lyrics.py --input ./lyric_embeddings --clusters 20
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.feature_extraction.text import TfidfVectorizer


def load_embeddings(input_dir: Path) -> tuple[list[dict], np.ndarray]:
    """Load embeddings and metadata."""
    embeddings = np.load(input_dir / "embeddings.npy")

    metadata = []
    with open(input_dir / "metadata.jsonl", "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                metadata.append(json.loads(line))

    return metadata, embeddings


def cluster_embeddings(
    embeddings: np.ndarray,
    n_clusters: int = 20,
    random_state: int = 42,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Cluster embeddings with K-means.

    Returns:
        (cluster_labels, cluster_centers)
    """
    print(f"Clustering {len(embeddings)} embeddings into {n_clusters} clusters...")

    kmeans = KMeans(
        n_clusters=n_clusters,
        random_state=random_state,
        n_init=10,
        max_iter=300,
    )
    labels = kmeans.fit_predict(embeddings)

    return labels, kmeans.cluster_centers_


def extract_cluster_patterns(
    songs: list[dict],
    labels: np.ndarray,
    top_terms: int = 15,
) -> dict[int, dict]:
    """
    Extract distinctive patterns for each cluster.
    Uses TF-IDF to find unique phrases.
    """
    print("Extracting cluster patterns...")

    # Group songs by cluster
    clusters = {}
    for i, song in enumerate(songs):
        cluster_id = int(labels[i])
        if cluster_id not in clusters:
            clusters[cluster_id] = []
        clusters[cluster_id].append(song)

    # Analyze each cluster
    patterns = {}

    for cluster_id, cluster_songs in clusters.items():
        lyrics_list = [s.get("lyrics_clean", "") for s in cluster_songs]

        # TF-IDF for distinctive terms
        try:
            vectorizer = TfidfVectorizer(
                max_features=200,
                stop_words="english",
                ngram_range=(1, 3),  # Unigrams to trigrams
                min_df=2,
            )
            tfidf = vectorizer.fit_transform(lyrics_list)
            feature_names = vectorizer.get_feature_names_out()

            # Average TF-IDF scores
            avg_tfidf = tfidf.mean(axis=0).A1
            top_indices = avg_tfidf.argsort()[-top_terms:][::-1]

            distinctive_terms = [
                {"term": feature_names[i], "score": float(avg_tfidf[i])}
                for i in top_indices
            ]
        except Exception:
            distinctive_terms = []

        # Genre distribution
        genres = [s.get("genre", "unknown") for s in cluster_songs if s.get("genre")]
        genre_dist = dict(Counter(genres).most_common(5))

        # Artists in cluster
        artists = [s.get("artist", "Unknown") for s in cluster_songs]
        top_artists = dict(Counter(artists).most_common(5))

        # Sample titles
        sample_titles = [s.get("title", "Untitled") for s in cluster_songs[:5]]

        patterns[cluster_id] = {
            "size": len(cluster_songs),
            "distinctive_terms": distinctive_terms,
            "genre_distribution": genre_dist,
            "top_artists": top_artists,
            "sample_titles": sample_titles,
        }

    return patterns


def analyze_structural_features(songs: list[dict], labels: np.ndarray) -> dict[int, dict]:
    """
    Analyze structural features per cluster.
    """
    import re

    clusters_features = {}

    for i, song in enumerate(songs):
        cluster_id = int(labels[i])
        if cluster_id not in clusters_features:
            clusters_features[cluster_id] = {
                "word_counts": [],
                "unique_ratios": [],
                "line_counts": [],
                "repetition_scores": [],
            }

        lyrics = song.get("lyrics_clean", "")
        words = lyrics.lower().split()
        lines = [l for l in lyrics.split("\n") if l.strip()]

        if words:
            # Word count
            clusters_features[cluster_id]["word_counts"].append(len(words))

            # Unique words ratio (vocabulary richness)
            unique_ratio = len(set(words)) / len(words)
            clusters_features[cluster_id]["unique_ratios"].append(unique_ratio)

            # Line count
            clusters_features[cluster_id]["line_counts"].append(len(lines))

            # Repetition score (repeated phrases)
            ngrams = {}
            for n in range(3, 6):  # 3 to 5 word phrases
                for j in range(len(words) - n):
                    phrase = " ".join(words[j : j + n])
                    ngrams[phrase] = ngrams.get(phrase, 0) + 1

            repeated = sum(1 for count in ngrams.values() if count > 1)
            rep_score = repeated / max(len(ngrams), 1)
            clusters_features[cluster_id]["repetition_scores"].append(rep_score)

    # Calculate averages
    results = {}
    for cluster_id, features in clusters_features.items():
        results[cluster_id] = {
            "avg_word_count": np.mean(features["word_counts"]) if features["word_counts"] else 0,
            "avg_unique_ratio": np.mean(features["unique_ratios"]) if features["unique_ratios"] else 0,
            "avg_line_count": np.mean(features["line_counts"]) if features["line_counts"] else 0,
            "avg_repetition_score": np.mean(features["repetition_scores"]) if features["repetition_scores"] else 0,
        }

    return results


def save_analysis(
    patterns: dict,
    structural: dict,
    labels: np.ndarray,
    output_dir: Path,
):
    """Save cluster analysis results."""
    output_dir.mkdir(parents=True, exist_ok=True)

    # Merge pattern and structural analysis
    full_analysis = {}
    for cluster_id in patterns:
        full_analysis[cluster_id] = {
            **patterns[cluster_id],
            "structural": structural.get(cluster_id, {}),
        }

    # Save full analysis
    analysis_path = output_dir / "cluster_analysis.json"
    with open(analysis_path, "w", encoding="utf-8") as f:
        json.dump(full_analysis, f, indent=2)
    print(f"Saved analysis: {analysis_path}")

    # Save cluster labels
    labels_path = output_dir / "cluster_labels.npy"
    np.save(labels_path, labels)
    print(f"Saved labels: {labels_path}")

    # Print summary
    print("\n" + "=" * 60)
    print("CLUSTER SUMMARY")
    print("=" * 60)

    for cluster_id in sorted(full_analysis.keys()):
        info = full_analysis[cluster_id]
        print(f"\nCluster {cluster_id} ({info['size']} songs)")
        print("-" * 40)

        # Top terms
        terms = info.get("distinctive_terms", [])[:5]
        if terms:
            print("  Distinctive: " + ", ".join(t["term"] for t in terms))

        # Structure
        struct = info.get("structural", {})
        if struct:
            print(f"  Avg words: {struct.get('avg_word_count', 0):.0f}, "
                  f"Unique ratio: {struct.get('avg_unique_ratio', 0):.2f}, "
                  f"Repetition: {struct.get('avg_repetition_score', 0):.3f}")

        # Genres
        genres = info.get("genre_distribution", {})
        if genres:
            print("  Genres: " + ", ".join(f"{g}({c})" for g, c in list(genres.items())[:3]))


def generate_pca_visualization(
    embeddings: np.ndarray,
    labels: np.ndarray,
    output_dir: Path,
):
    """Generate PCA coordinates for visualization."""
    print("Generating PCA visualization data...")

    pca = PCA(n_components=2, random_state=42)
    coords = pca.fit_transform(embeddings)

    viz_data = {
        "x": coords[:, 0].tolist(),
        "y": coords[:, 1].tolist(),
        "cluster": labels.tolist(),
        "explained_variance": pca.explained_variance_ratio_.tolist(),
    }

    viz_path = output_dir / "pca_visualization.json"
    with open(viz_path, "w") as f:
        json.dump(viz_data, f)
    print(f"Saved PCA data: {viz_path}")


def main():
    parser = argparse.ArgumentParser(description="Cluster lyric embeddings")
    parser.add_argument("--input", "-i", type=Path, default=Path("./lyric_embeddings"), help="Input directory with embeddings")
    parser.add_argument("--output", "-o", type=Path, help="Output directory (defaults to input)")
    parser.add_argument("--clusters", "-k", type=int, default=20, help="Number of clusters")

    args = parser.parse_args()

    output_dir = args.output or args.input

    # Load data
    songs, embeddings = load_embeddings(args.input)
    print(f"Loaded {len(songs)} songs with {embeddings.shape[1]}-dim embeddings")

    # Cluster
    labels, centers = cluster_embeddings(embeddings, n_clusters=args.clusters)

    # Analyze patterns
    patterns = extract_cluster_patterns(songs, labels)
    structural = analyze_structural_features(songs, labels)

    # Save results
    save_analysis(patterns, structural, labels, output_dir)

    # Generate visualization
    generate_pca_visualization(embeddings, labels, output_dir)

    print(f"\nDone! Analysis saved to {output_dir}")
    print("Next: Run analyze_performance.py to correlate with hit metrics")


if __name__ == "__main__":
    main()
