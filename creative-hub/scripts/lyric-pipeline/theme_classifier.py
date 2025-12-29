#!/usr/bin/env python3
"""
Lyric Intelligence Pipeline - Theme Classifier

Classifies lyrics into the 12 proven hit themes from NC State research.
These themes predict Billboard #1 with 73.4% accuracy.

The 12 Proven Hit Themes:
  PRIMARY (dominant drivers):
    1. Loss - Peaked 1980s
    2. Desire - Consistent across decades
    3. Aspiration - Peaks during economic downturns
    4. Breakup - MOST CONSISTENT (always works)
    5. Pain - Exploded post-2000s
    6. Inspiration - Cycles with social movements

  SECONDARY (contextual):
    7. Nostalgia - Peaks during uncertainty
    8. Rebellion - Youth market constant
    9. Jaded/Cynicism - Dominant 2020s (50%!)
    10. Desperation - Post-9/11 surge
    11. Escapism - Precedes desperation cycles
    12. Confusion - Economic uncertainty marker

Usage:
    python theme_classifier.py --input lyrics.txt
    python theme_classifier.py --corpus ./lyric_embeddings
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Optional

import numpy as np

# The 12 proven hit themes with keyword patterns
THEMES = {
    # Primary themes (strong predictors)
    "loss": {
        "keywords": [
            "lost", "gone", "miss", "left", "away", "without", "alone",
            "empty", "void", "losing", "fading", "slipping", "memory",
            "used to", "remember when", "never again", "goodbye"
        ],
        "weight": 1.0,
        "decade_peaks": ["1980s"],
    },
    "desire": {
        "keywords": [
            "want", "need", "crave", "hunger", "thirst", "wish",
            "dream", "yearn", "ache", "long for", "dying to", "gotta have",
            "fire", "burn", "passion", "obsessed", "addicted"
        ],
        "weight": 1.0,
        "decade_peaks": ["all"],
    },
    "aspiration": {
        "keywords": [
            "rise", "climb", "top", "king", "queen", "throne", "crown",
            "success", "wealth", "rich", "famous", "legend", "iconic",
            "made it", "came from nothing", "started from", "grind"
        ],
        "weight": 1.0,
        "decade_peaks": ["2010s", "economic_downturns"],
    },
    "breakup": {
        "keywords": [
            "leave", "leaving", "left me", "walked away", "over", "done",
            "through", "goodbye", "farewell", "heart broken", "tears",
            "cry", "cheated", "lied", "betrayed", "trust", "hurt"
        ],
        "weight": 1.2,  # MOST CONSISTENT - extra weight
        "decade_peaks": ["all"],
    },
    "pain": {
        "keywords": [
            "pain", "hurt", "broken", "bleeding", "scar", "wound",
            "suffer", "agony", "torture", "hell", "dying", "killing me",
            "numb", "empty inside", "dead inside", "hollow"
        ],
        "weight": 1.0,
        "decade_peaks": ["2000s", "2010s", "2020s"],
    },
    "inspiration": {
        "keywords": [
            "believe", "hope", "faith", "strong", "fight", "survive",
            "overcome", "conquer", "warrior", "soldier", "never give up",
            "keep going", "unstoppable", "invincible", "power"
        ],
        "weight": 1.0,
        "decade_peaks": ["2010s", "social_movements"],
    },

    # Secondary themes (contextual)
    "nostalgia": {
        "keywords": [
            "remember", "back then", "used to", "old days", "childhood",
            "simpler times", "back when", "memories", "way back", "young",
            "innocent", "before", "those days"
        ],
        "weight": 0.8,
        "decade_peaks": ["uncertainty"],
    },
    "rebellion": {
        "keywords": [
            "fuck", "shit", "damn", "rebel", "break the rules", "middle finger",
            "don't care", "dgaf", "system", "fight back", "revolution",
            "stand up", "against", "free", "freedom", "chains"
        ],
        "weight": 0.8,
        "decade_peaks": ["1990s", "youth"],
    },
    "cynicism": {
        "keywords": [
            "fake", "phony", "lie", "liars", "trust no one", "cap",
            "everybody", "nobody", "all the same", "whatever", "don't matter",
            "pointless", "meaningless", "doesn't matter", "joke"
        ],
        "weight": 1.1,  # DOMINANT 2020s - extra weight
        "decade_peaks": ["2020s"],
    },
    "desperation": {
        "keywords": [
            "need you", "can't live", "dying", "drowning", "falling",
            "help", "save me", "last chance", "only hope", "nothing left",
            "end", "edge", "breaking point", "rock bottom"
        ],
        "weight": 0.8,
        "decade_peaks": ["2000s"],
    },
    "escapism": {
        "keywords": [
            "fly", "away", "escape", "run", "leave this place", "somewhere",
            "paradise", "heaven", "fantasy", "dream world", "forget",
            "high", "wasted", "drunk", "fade away", "disappear"
        ],
        "weight": 0.8,
        "decade_peaks": ["2010s", "pre_crisis"],
    },
    "confusion": {
        "keywords": [
            "don't know", "confused", "lost", "which way", "what is",
            "who am i", "understand", "make sense", "crazy", "insane",
            "spinning", "falling", "question", "wonder", "unsure"
        ],
        "weight": 0.7,
        "decade_peaks": ["economic_uncertainty"],
    },
}


def classify_lyrics(lyrics: str) -> dict[str, float]:
    """
    Classify lyrics into the 12 hit themes.
    Returns normalized scores for each theme.
    """
    if not lyrics:
        return {theme: 0.0 for theme in THEMES}

    lyrics_lower = lyrics.lower()
    scores = {}

    for theme, config in THEMES.items():
        keywords = config["keywords"]
        weight = config["weight"]

        # Count keyword matches
        matches = sum(
            len(re.findall(rf"\b{re.escape(kw)}\b", lyrics_lower))
            for kw in keywords
        )

        # Normalize by lyrics length (per 100 words)
        word_count = len(lyrics_lower.split())
        if word_count > 0:
            score = (matches / word_count) * 100 * weight
        else:
            score = 0.0

        scores[theme] = round(score, 3)

    # Normalize to sum to 1.0 (softmax-like)
    total = sum(scores.values())
    if total > 0:
        scores = {k: round(v / total, 3) for k, v in scores.items()}

    return scores


def get_dominant_themes(scores: dict[str, float], top_k: int = 3) -> list[tuple[str, float]]:
    """Get top-k dominant themes."""
    sorted_themes = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_themes[:top_k]


def get_theme_profile(lyrics: str) -> dict:
    """
    Full theme analysis for lyrics.
    Returns scores, dominant themes, and generation hints.
    """
    scores = classify_lyrics(lyrics)
    dominant = get_dominant_themes(scores, top_k=3)

    # Determine decade alignment
    decade_alignment = []
    for theme, score in dominant:
        if score > 0.1:  # Significant presence
            peaks = THEMES[theme]["decade_peaks"]
            decade_alignment.extend(peaks)

    # Generate prompt hints
    hints = []
    for theme, score in dominant:
        if score > 0.15:  # Strong theme
            hints.append(f"Strong {theme} theme ({score:.0%})")
        elif score > 0.08:  # Moderate theme
            hints.append(f"Contains {theme} elements ({score:.0%})")

    return {
        "scores": scores,
        "dominant_themes": [{"theme": t, "score": s} for t, s in dominant],
        "decade_alignment": list(set(decade_alignment)),
        "generation_hints": hints,
    }


def classify_corpus(input_dir: Path) -> dict:
    """
    Classify entire corpus and compute statistics.
    """
    metadata = []
    with open(input_dir / "metadata.jsonl", "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                metadata.append(json.loads(line))

    print(f"Classifying {len(metadata)} songs...")

    # Classify each song
    results = []
    theme_totals = {theme: 0.0 for theme in THEMES}

    for song in metadata:
        lyrics = song.get("lyrics_clean", "")
        profile = get_theme_profile(lyrics)

        results.append({
            "id": song.get("id"),
            "title": song.get("title"),
            "artist": song.get("artist"),
            **profile,
        })

        for theme, score in profile["scores"].items():
            theme_totals[theme] += score

    # Average theme distribution
    n = len(results)
    theme_distribution = {
        theme: round(total / n, 3)
        for theme, total in theme_totals.items()
    }

    return {
        "total_songs": n,
        "theme_distribution": theme_distribution,
        "top_themes": sorted(theme_distribution.items(), key=lambda x: x[1], reverse=True)[:5],
        "songs": results,
    }


def save_classification(results: dict, output_dir: Path):
    """Save classification results."""
    output_dir.mkdir(parents=True, exist_ok=True)

    # Full results
    full_path = output_dir / "theme_classification.json"
    with open(full_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"Saved: {full_path}")

    # Summary
    print("\n" + "=" * 50)
    print("THEME DISTRIBUTION")
    print("=" * 50)
    for theme, score in results["top_themes"]:
        bar = "█" * int(score * 50)
        print(f"{theme:15} {score:.1%} {bar}")


def main():
    parser = argparse.ArgumentParser(description="Classify lyrics into 12 hit themes")
    parser.add_argument("--input", "-i", type=str, help="Single lyrics text file or lyrics string")
    parser.add_argument("--corpus", "-c", type=Path, help="Directory with metadata.jsonl")
    parser.add_argument("--output", "-o", type=Path, help="Output directory")

    args = parser.parse_args()

    if args.input:
        # Classify single input
        if Path(args.input).exists():
            lyrics = Path(args.input).read_text()
        else:
            lyrics = args.input

        profile = get_theme_profile(lyrics)
        print(json.dumps(profile, indent=2))

    elif args.corpus:
        # Classify corpus
        results = classify_corpus(args.corpus)
        output_dir = args.output or args.corpus
        save_classification(results, output_dir)

    else:
        # Demo
        demo_lyrics = """
        I came from nothing, now I'm on top
        Climbing to the throne, I'll never stop
        They said I couldn't make it, look at me now
        From the bottom to the crown, I showed them how
        """
        print("Demo classification:")
        profile = get_theme_profile(demo_lyrics)
        print(json.dumps(profile, indent=2))


if __name__ == "__main__":
    main()
