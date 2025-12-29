#!/usr/bin/env python3
"""
Lyric Intelligence Pipeline - Generation Optimizer

Builds optimized prompts for lyric generation based on discovered patterns.
This is the actual moat - learning what works and feeding it back.

Usage:
    python generation_optimizer.py --patterns ./lyric_embeddings --theme aspiration --region US
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Optional

# Theme evolution by decade (from NC State research)
DECADE_THEMES = {
    "1960s": ["love", "aspiration", "rebellion"],
    "1970s": ["love", "desire", "escapism"],
    "1980s": ["loss", "confusion", "breakup"],
    "1990s": ["rebellion", "escapism", "desire"],
    "2000s": ["pain", "desperation", "rebellion"],
    "2010s": ["aspiration", "inspiration", "pain"],
    "2020s": ["cynicism", "pain", "escapism"],
}

# Regional preferences (empirical observations)
REGIONAL_PREFERENCES = {
    "US": {
        "dominant_themes": ["pain", "aspiration", "cynicism"],
        "sentiment_bias": -0.1,
        "structure": "verse-prehook-hook-verse-prehook-hook-bridge-hook",
        "vocab_style": "direct, slang-heavy, first-person",
    },
    "UK": {
        "dominant_themes": ["melancholy", "cynicism", "irony"],
        "sentiment_bias": -0.2,
        "structure": "verse-hook-verse-hook-bridge-hook",
        "vocab_style": "understated, witty, observational",
    },
    "KR": {
        "dominant_themes": ["aspiration", "love", "pain"],
        "sentiment_bias": 0.0,
        "structure": "intro-verse-prehook-hook-verse-hook-bridge-hook-outro",
        "vocab_style": "poetic, metaphorical, emotional contrast",
        "cultural_notes": "Han (한) - deep sorrow. Jeong (정) - connection. Include both struggle and triumph.",
    },
    "BR": {
        "dominant_themes": ["desire", "party", "social"],
        "sentiment_bias": 0.2,
        "structure": "hook-verse-hook-verse-hook",
        "vocab_style": "rhythmic, celebratory, community-focused",
    },
    "MX": {
        "dominant_themes": ["love", "betrayal", "party"],
        "sentiment_bias": 0.1,
        "structure": "verse-hook-verse-hook-bridge-hook",
        "vocab_style": "passionate, dramatic, storytelling",
    },
}


class GenerationOptimizer:
    """
    Build optimized prompts from learned patterns.
    The core of the feedback loop.
    """

    def __init__(self, patterns_dir: Optional[Path] = None):
        self.patterns_dir = patterns_dir
        self.patterns = {}
        self.cluster_analysis = {}
        self.hit_patterns = {}

        if patterns_dir:
            self._load_patterns()

    def _load_patterns(self):
        """Load discovered patterns from analysis."""
        if not self.patterns_dir:
            return

        # Load cluster analysis
        cluster_path = self.patterns_dir / "cluster_analysis.json"
        if cluster_path.exists():
            with open(cluster_path, "r") as f:
                self.cluster_analysis = json.load(f)

        # Load hit patterns
        hit_path = self.patterns_dir / "hit_patterns.json"
        if hit_path.exists():
            with open(hit_path, "r") as f:
                self.hit_patterns = json.load(f)

        # Load theme classification
        theme_path = self.patterns_dir / "theme_classification.json"
        if theme_path.exists():
            with open(theme_path, "r") as f:
                data = json.load(f)
                self.theme_distribution = data.get("theme_distribution", {})

        print(f"Loaded patterns from {self.patterns_dir}")
        print(f"  - Clusters: {len(self.cluster_analysis)}")
        print(f"  - Hit patterns: {len(self.hit_patterns.get('top_clusters', []))}")

    def build_prompt(
        self,
        theme: str,
        region: str = "US",
        artist_style: Optional[str] = None,
        decade_vibe: Optional[str] = None,
        include_patterns: bool = True,
    ) -> str:
        """
        Build an optimized generation prompt.

        Args:
            theme: Primary theme (loss, desire, aspiration, etc.)
            region: Target market (US, UK, KR, BR, MX)
            artist_style: Optional artist to reference
            decade_vibe: Optional decade aesthetic
            include_patterns: Include discovered patterns from analysis

        Returns:
            Optimized prompt for lyric generation
        """
        parts = []

        # Base instruction
        parts.append(f"Write powerful {theme} lyrics for a hit song.")

        # Regional preferences
        if region in REGIONAL_PREFERENCES:
            prefs = REGIONAL_PREFERENCES[region]
            parts.append(f"\nTARGET AUDIENCE: {region}")
            parts.append(f"STRUCTURE: {prefs['structure']}")
            parts.append(f"STYLE: {prefs['vocab_style']}")

            if "cultural_notes" in prefs:
                parts.append(f"CULTURAL CONTEXT: {prefs['cultural_notes']}")

        # Decade vibe
        if decade_vibe and decade_vibe in DECADE_THEMES:
            themes = DECADE_THEMES[decade_vibe]
            parts.append(f"\nDECADE AESTHETIC: {decade_vibe}")
            parts.append(f"BLEND WITH: {', '.join(themes)}")

        # Artist reference
        if artist_style:
            parts.append(f"\nSTYLE REFERENCE: Write in the style of {artist_style}")

        # Include learned patterns
        if include_patterns and self.hit_patterns:
            common_terms = self.hit_patterns.get("common_terms", [])
            if common_terms:
                terms = [t for t, _ in common_terms[:10]]
                parts.append(f"\nINCLUDE THESE WINNING ELEMENTS:")
                parts.append(f"  - Themes/phrases: {', '.join(terms)}")

            # Get structural patterns from top clusters
            top_clusters = self.hit_patterns.get("top_clusters", [])
            if top_clusters:
                best = top_clusters[0]
                struct = best.get("structural", {})
                if struct:
                    parts.append(f"\nSTRUCTURAL GUIDELINES:")
                    parts.append(f"  - Target word count: {struct.get('avg_word_count', 200):.0f}")
                    parts.append(f"  - Vocabulary richness: {struct.get('avg_unique_ratio', 0.4):.0%}")
                    parts.append(f"  - Repetition density: {struct.get('avg_repetition_score', 0.05)*100:.1f}%")

        # Hit songwriting techniques
        parts.append("""
SONGWRITING TECHNIQUES:
- Use antimetabole (reversed phrase repetition) in the hook
- Include call-and-response patterns
- Build emotional arc: tension → release → resolution
- Make the hook earworm-worthy with 4-8 repetitions
- Use first-person pronouns ("I", "me", "my")
- Write in present tense for immediacy

OUTPUT FORMAT:
[Verse 1]
(8-12 lines)

[Pre-Hook]
(2-4 lines, builds tension)

[Hook]
(4-6 lines, catchy and memorable)

[Verse 2]
(8-12 lines, develops story)

[Bridge]
(4-6 lines, emotional contrast)

[Final Hook]
(4-6 lines, maximum energy)
""")

        return "\n".join(parts)

    def build_regional_prompt(self, base_prompt: str, target_region: str) -> str:
        """Adapt a prompt for a specific region."""
        if target_region not in REGIONAL_PREFERENCES:
            return base_prompt

        prefs = REGIONAL_PREFERENCES[target_region]

        adaptation = f"""
REGIONAL ADAPTATION FOR {target_region}:
- Adjust sentiment: {'+positive' if prefs['sentiment_bias'] > 0 else 'neutral to darker' if prefs['sentiment_bias'] < 0 else 'balanced'}
- Emphasize themes: {', '.join(prefs['dominant_themes'])}
- Use structure: {prefs['structure']}
- Voice: {prefs['vocab_style']}
"""
        if "cultural_notes" in prefs:
            adaptation += f"- Cultural context: {prefs['cultural_notes']}\n"

        return base_prompt + adaptation

    def get_current_zeitgeist_themes(self) -> list[str]:
        """
        Get themes that align with current cultural moment.
        2020s: Cynicism dominant, pain and escapism strong.
        """
        year = datetime.now().year
        if year >= 2020:
            return DECADE_THEMES["2020s"]
        elif year >= 2010:
            return DECADE_THEMES["2010s"]
        else:
            return DECADE_THEMES["2000s"]

    def suggest_themes_for_market(self, region: str) -> list[str]:
        """Suggest themes likely to perform well in a market."""
        zeitgeist = self.get_current_zeitgeist_themes()
        regional = REGIONAL_PREFERENCES.get(region, {}).get("dominant_themes", [])

        # Intersection of zeitgeist and regional preferences
        overlap = set(zeitgeist) & set(regional)
        if overlap:
            return list(overlap)

        # Fall back to regional preferences
        return regional if regional else zeitgeist


def save_prompt_library(optimizer: GenerationOptimizer, output_dir: Path):
    """Generate and save prompt library for all theme/region combos."""
    output_dir.mkdir(parents=True, exist_ok=True)

    library = {}
    themes = ["loss", "desire", "aspiration", "breakup", "pain", "inspiration",
              "cynicism", "rebellion", "nostalgia", "escapism"]
    regions = ["US", "UK", "KR", "BR", "MX"]

    for theme in themes:
        library[theme] = {}
        for region in regions:
            prompt = optimizer.build_prompt(
                theme=theme,
                region=region,
                include_patterns=True,
            )
            library[theme][region] = prompt

    # Save library
    library_path = output_dir / "prompt_library.json"
    with open(library_path, "w") as f:
        json.dump(library, f, indent=2)
    print(f"Saved: {library_path}")

    # Save as readable text
    text_path = output_dir / "prompt_library.txt"
    with open(text_path, "w") as f:
        for theme, regions in library.items():
            f.write(f"\n{'='*60}\n")
            f.write(f"THEME: {theme.upper()}\n")
            f.write(f"{'='*60}\n")
            for region, prompt in regions.items():
                f.write(f"\n--- {region} ---\n")
                f.write(prompt)
                f.write("\n")
    print(f"Saved: {text_path}")

    # Generate zeitgeist-optimized prompts
    zeitgeist = optimizer.get_current_zeitgeist_themes()
    print(f"\nCurrent zeitgeist themes: {zeitgeist}")
    print("Suggested for maximum impact:")
    for region in regions:
        suggested = optimizer.suggest_themes_for_market(region)
        print(f"  {region}: {', '.join(suggested)}")


def main():
    parser = argparse.ArgumentParser(description="Generate optimized lyric prompts")
    parser.add_argument("--patterns", "-p", type=Path, help="Patterns directory from analysis")
    parser.add_argument("--theme", "-t", type=str, default="aspiration", help="Primary theme")
    parser.add_argument("--region", "-r", type=str, default="US", help="Target region")
    parser.add_argument("--artist", type=str, help="Artist style reference")
    parser.add_argument("--decade", type=str, help="Decade aesthetic (1990s, 2020s, etc.)")
    parser.add_argument("--output", "-o", type=Path, help="Output directory for library")
    parser.add_argument("--library", action="store_true", help="Generate full prompt library")

    args = parser.parse_args()

    optimizer = GenerationOptimizer(patterns_dir=args.patterns)

    if args.library:
        output = args.output or Path("./prompts")
        save_prompt_library(optimizer, output)
    else:
        prompt = optimizer.build_prompt(
            theme=args.theme,
            region=args.region,
            artist_style=args.artist,
            decade_vibe=args.decade,
            include_patterns=args.patterns is not None,
        )
        print(prompt)


if __name__ == "__main__":
    main()
