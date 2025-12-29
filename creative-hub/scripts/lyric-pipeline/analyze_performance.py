#!/usr/bin/env python3
"""
Lyric Intelligence Pipeline - Performance Correlation

Correlates lyric clusters with performance metrics to find hit patterns.
This is where we discover what makes songs successful.

Usage:
    python analyze_performance.py --input ./lyric_embeddings --performance billboard.csv
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from scipy import stats


def load_cluster_data(input_dir: Path) -> tuple[list[dict], np.ndarray]:
    """Load songs metadata and cluster labels."""
    labels = np.load(input_dir / "cluster_labels.npy")

    songs = []
    with open(input_dir / "metadata.jsonl", "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                songs.append(json.loads(line))

    return songs, labels


def load_performance_data(
    path: Path,
    id_col: str = "track_id",
    performance_cols: Optional[list[str]] = None,
) -> pd.DataFrame:
    """
    Load performance metrics from CSV/Excel.

    Expected columns:
    - track_id or title+artist for matching
    - Performance metrics: streams, chart_position, weeks_on_chart, etc.
    """
    if path.suffix == ".xlsx":
        df = pd.read_excel(path)
    else:
        df = pd.read_csv(path)

    print(f"Loaded performance data: {len(df)} rows")
    print(f"Columns: {list(df.columns)}")

    return df


def match_songs_to_performance(
    songs: list[dict],
    performance_df: pd.DataFrame,
    match_on: str = "title",  # "title", "title_artist", "id"
) -> list[dict]:
    """
    Match songs to their performance metrics.
    Returns songs enriched with performance data.
    """
    print(f"Matching songs on: {match_on}")

    # Build lookup
    if match_on == "title":
        perf_lookup = {
            str(row.get("title", row.get("track", ""))).lower(): row
            for _, row in performance_df.iterrows()
        }
        get_key = lambda s: str(s.get("title", "")).lower()

    elif match_on == "title_artist":
        perf_lookup = {
            f"{str(row.get('title', '')).lower()}|{str(row.get('artist', '')).lower()}": row
            for _, row in performance_df.iterrows()
        }
        get_key = lambda s: f"{str(s.get('title', '')).lower()}|{str(s.get('artist', '')).lower()}"

    else:  # id
        perf_lookup = {str(row.get("track_id", "")): row for _, row in performance_df.iterrows()}
        get_key = lambda s: str(s.get("id", ""))

    matched = 0
    enriched = []

    for song in songs:
        key = get_key(song)
        perf = perf_lookup.get(key)

        if perf is not None:
            matched += 1
            song["performance"] = {
                k: v for k, v in perf.items()
                if k not in ["title", "artist", "track_id", "lyrics"]
                and pd.notna(v)
            }
        else:
            song["performance"] = None

        enriched.append(song)

    print(f"Matched {matched}/{len(songs)} songs ({100*matched/len(songs):.1f}%)")
    return enriched


def analyze_cluster_performance(
    songs: list[dict],
    labels: np.ndarray,
    metric: str = "streams",  # The performance metric to analyze
) -> dict:
    """
    Analyze which clusters correlate with hit performance.

    Returns ranking of clusters by performance metric.
    """
    print(f"\nAnalyzing cluster performance (metric: {metric})")

    cluster_performance = {}

    for i, song in enumerate(songs):
        cluster_id = int(labels[i])
        perf = song.get("performance")

        if cluster_id not in cluster_performance:
            cluster_performance[cluster_id] = []

        if perf and metric in perf:
            value = perf[metric]
            if isinstance(value, (int, float)) and not np.isnan(value):
                cluster_performance[cluster_id].append(value)

    # Calculate stats per cluster
    results = {}
    for cluster_id, values in cluster_performance.items():
        if len(values) >= 3:  # Need at least 3 samples
            results[cluster_id] = {
                "n": len(values),
                "mean": np.mean(values),
                "median": np.median(values),
                "std": np.std(values),
                "max": np.max(values),
                "p90": np.percentile(values, 90),
            }

    # Rank clusters by mean performance
    ranked = sorted(results.items(), key=lambda x: x[1]["mean"], reverse=True)

    return {
        "metric": metric,
        "clusters_ranked": [
            {"cluster": c, **stats}
            for c, stats in ranked
        ],
    }


def find_hit_patterns(
    songs: list[dict],
    labels: np.ndarray,
    analysis_path: Path,
    top_k: int = 5,
) -> dict:
    """
    Cross-reference top performing clusters with their distinctive features.
    This tells us WHAT makes hits.
    """
    # Load cluster analysis
    with open(analysis_path, "r") as f:
        cluster_analysis = json.load(f)

    # Get performance rankings (need to run analyze_cluster_performance first)
    # For now, just identify high-performance clusters based on matched songs

    hit_songs = [
        (i, s) for i, s in enumerate(songs)
        if s.get("performance") and s["performance"].get("is_hit")
    ]

    if not hit_songs:
        # Fall back to using any performance metric
        hit_songs = [
            (i, s) for i, s in enumerate(songs)
            if s.get("performance")
        ][:100]  # Top 100 by whatever metric

    # Count hits per cluster
    hit_cluster_counts = {}
    for idx, song in hit_songs:
        cluster_id = str(int(labels[idx]))
        hit_cluster_counts[cluster_id] = hit_cluster_counts.get(cluster_id, 0) + 1

    # Get top clusters
    top_clusters = sorted(hit_cluster_counts.items(), key=lambda x: x[1], reverse=True)[:top_k]

    # Extract patterns from top clusters
    hit_patterns = {
        "top_clusters": [],
        "common_terms": [],
        "structural_patterns": {},
    }

    all_terms = []

    for cluster_id, count in top_clusters:
        cluster_info = cluster_analysis.get(cluster_id, {})
        terms = cluster_info.get("distinctive_terms", [])
        all_terms.extend([t["term"] for t in terms[:10]])

        hit_patterns["top_clusters"].append({
            "cluster_id": cluster_id,
            "hit_count": count,
            "total_size": cluster_info.get("size", 0),
            "hit_rate": count / cluster_info.get("size", 1),
            "distinctive_terms": terms[:10],
            "structural": cluster_info.get("structural", {}),
        })

    # Find most common terms across top clusters
    from collections import Counter
    term_counts = Counter(all_terms)
    hit_patterns["common_terms"] = term_counts.most_common(20)

    return hit_patterns


def generate_prompt_templates(hit_patterns: dict) -> list[str]:
    """
    Generate lyric generation prompts based on discovered hit patterns.
    """
    templates = []

    common_terms = [t for t, _ in hit_patterns.get("common_terms", [])[:10]]

    for cluster in hit_patterns.get("top_clusters", [])[:3]:
        struct = cluster.get("structural", {})
        terms = [t["term"] for t in cluster.get("distinctive_terms", [])[:5]]

        template = f"""Write lyrics with these hit patterns:

THEMES: {', '.join(terms)}
STRUCTURE:
- Target word count: {struct.get('avg_word_count', 200):.0f}
- Vocabulary uniqueness: {struct.get('avg_unique_ratio', 0.4):.0%}
- Repetition level: {struct.get('avg_repetition_score', 0.05)*100:.1f}% repeated phrases

STYLE: Include these proven phrases/concepts:
{', '.join(common_terms[:5])}

Write a complete song with verse, pre-chorus, chorus, verse 2, bridge, final chorus."""

        templates.append(template)

    return templates


def save_performance_analysis(
    performance_results: dict,
    hit_patterns: dict,
    templates: list[str],
    output_dir: Path,
):
    """Save all analysis results."""
    output_dir.mkdir(parents=True, exist_ok=True)

    # Performance analysis
    perf_path = output_dir / "performance_analysis.json"
    with open(perf_path, "w") as f:
        json.dump(performance_results, f, indent=2)
    print(f"Saved: {perf_path}")

    # Hit patterns
    patterns_path = output_dir / "hit_patterns.json"
    with open(patterns_path, "w") as f:
        json.dump(hit_patterns, f, indent=2)
    print(f"Saved: {patterns_path}")

    # Prompt templates
    templates_path = output_dir / "hit_prompt_templates.txt"
    with open(templates_path, "w") as f:
        for i, template in enumerate(templates, 1):
            f.write(f"=== TEMPLATE {i} ===\n")
            f.write(template)
            f.write("\n\n")
    print(f"Saved: {templates_path}")

    # Summary
    print("\n" + "=" * 60)
    print("HIT PATTERN SUMMARY")
    print("=" * 60)

    for cluster in hit_patterns.get("top_clusters", [])[:3]:
        print(f"\nCluster {cluster['cluster_id']} (Hit rate: {cluster['hit_rate']:.1%})")
        print(f"  Terms: {', '.join(t['term'] for t in cluster['distinctive_terms'][:5])}")

    print("\nMost common hit elements:")
    for term, count in hit_patterns.get("common_terms", [])[:10]:
        print(f"  - {term} ({count})")


def main():
    parser = argparse.ArgumentParser(description="Analyze lyric cluster performance")
    parser.add_argument("--input", "-i", type=Path, default=Path("./lyric_embeddings"), help="Input directory")
    parser.add_argument("--performance", "-p", type=Path, help="Performance metrics CSV/Excel")
    parser.add_argument("--metric", type=str, default="streams", help="Performance metric column")
    parser.add_argument("--match-on", type=str, default="title", choices=["title", "title_artist", "id"])
    parser.add_argument("--output", "-o", type=Path, help="Output directory")

    args = parser.parse_args()

    output_dir = args.output or args.input

    # Load cluster data
    songs, labels = load_cluster_data(args.input)
    print(f"Loaded {len(songs)} songs with cluster labels")

    if args.performance:
        # Load and match performance data
        perf_df = load_performance_data(args.performance)
        songs = match_songs_to_performance(songs, perf_df, match_on=args.match_on)

        # Analyze performance by cluster
        performance_results = analyze_cluster_performance(songs, labels, metric=args.metric)
    else:
        print("\nNo performance data provided.")
        print("Using cluster analysis only (no hit correlation)")
        performance_results = {"metric": "none", "clusters_ranked": []}

    # Find hit patterns
    analysis_path = args.input / "cluster_analysis.json"
    hit_patterns = find_hit_patterns(songs, labels, analysis_path)

    # Generate prompt templates
    templates = generate_prompt_templates(hit_patterns)

    # Save everything
    save_performance_analysis(performance_results, hit_patterns, templates, output_dir)

    print(f"\nDone! Results saved to {output_dir}")
    print("\nNext steps:")
    print("1. Use hit_prompt_templates.txt in your lyric generation")
    print("2. Run upload_to_qdrant.py to store embeddings in vector DB")


if __name__ == "__main__":
    main()
