"""Story extraction utilities built on top of the Claude API."""
from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlparse

from anthropic import Anthropic


@dataclass
class StorySummary:
    """Structured summary of a community thread."""

    hook: str
    protagonist: str
    conflict: str
    sensory_details: str
    emotional_palette: str


class StoryExtractor:
    """Wraps Claude to turn long-form threads into musical story prompts."""

    def __init__(self, api_key: str, model: str = "claude-3-haiku-20240307") -> None:
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def extract_story(
        self,
        thread_text: str,
        max_tokens: int = 700,
        style_hint: str = "hero's journey with repeatable hook",
    ) -> StorySummary:
        """Return a StorySummary describing the narrative arc."""
        prompt = (
            "Act as a hit songwriter dissecting community chatter."
            " Summarize the thread as a hero's journey with a viral-ready hook."
            " Return JSON with fields Hook, Protagonist, Conflict, Sensory details,"
            " Emotional palette. Keep each field <= 280 characters."
            f" Style hint: {style_hint}."
        )
        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=0.2,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"THREAD:\n{thread_text}\nEND THREAD",
                        }
                    ],
                }
            ],
        )
        json_blob = response.content[0].text
        return self._parse_summary(json_blob)

    def _parse_summary(self, raw_json: str) -> StorySummary:
        import json

        payload = json.loads(raw_json)
        return StorySummary(
            hook=payload.get("Hook", ""),
            protagonist=payload.get("Protagonist", ""),
            conflict=payload.get("Conflict", ""),
            sensory_details=payload.get("Sensory details", ""),
            emotional_palette=payload.get("Emotional palette", ""),
        )


def load_thread(path_or_url: str, encoding: str = "utf-8") -> str:
    """Load thread text from disk or fetch from a URL."""
    parsed = urlparse(path_or_url)
    if parsed.scheme in {"http", "https"}:
        import requests

        response = requests.get(path_or_url, timeout=15)
        response.raise_for_status()
        return response.text.strip()
    with open(path_or_url, "r", encoding=encoding) as handle:
        return handle.read().strip()
