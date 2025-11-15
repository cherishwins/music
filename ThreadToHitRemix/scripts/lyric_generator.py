"""Lyric ideation powered by Claude."""
from __future__ import annotations

from dataclasses import dataclass
from typing import List

from anthropic import Anthropic


@dataclass
class LyricSection:
    label: str
    lines: List[str]


class LyricGenerator:
    """Turns structured summaries into ready-to-sing lyrics."""

    def __init__(self, api_key: str, model: str = "claude-3-sonnet-20240229") -> None:
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def write_song(
        self,
        summary: str,
        genre_hint: str = "motivational edm rap",
        tempo: int = 120,
    ) -> List[LyricSection]:
        prompt = (
            "Write NEFFEX-inspired rap lyrics from the narrative summary."
            " Structure must follow ABABCB (A=verse, B=pre-hook, C=hook)."
            " Use repetition, antimetabole, and gritty optimism."
            " Return JSON array; each object requires fields label and lines (array of strings)."
            " Keep hooks <= 8 lines and include call-and-response phrasing."
        )
        response = self.client.messages.create(
            model=self.model,
            temperature=0.6,
            max_tokens=800,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                f"SUMMARY:\n{summary}\n\n"
                                f"Genre: {genre_hint}\nTempo: {tempo} BPM\n"
                                "Return JSON only."
                            ),
                        }
                    ],
                }
            ],
        )
        return self._parse_sections(response.content[0].text)

    def _parse_sections(self, raw_json: str) -> List[LyricSection]:
        import json

        data = json.loads(raw_json)
        return [LyricSection(label=chunk["label"], lines=chunk["lines"]) for chunk in data]
