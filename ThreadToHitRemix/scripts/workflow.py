"""Orchestrates the end-to-end ThreadToHitRemix pipeline."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, List, Optional

import yaml

from .beat_maker import BeatMaker
from .hit_predictor import HitPredictor, HitScore
from .lyric_generator import LyricGenerator
from .mixer import StemMixer
from .story_extractor import StoryExtractor, StorySummary
from .voice_converter import RvcVoiceConverter


@dataclass
class PipelineArtifacts:
    story: StorySummary
    lyrics: List[Dict[str, str]]
    lyrics_path: Path
    beat_path: Path
    vocal_path: Path
    mix_path: Path
    hit_score: HitScore


class ThreadToHitWorkflow:
    """Coordinates each creative stage so CLI stays tidy."""

    def __init__(self, config_path: Path, anthropic_key: str, rvc_root: Path) -> None:
        self.config = self._load_config(config_path)
        model_name = self.config["anthropic"]["model"]
        workflow_cfg = self.config["workflow"]
        mixing_cfg = self.config["mixing"]
        self.story_extractor = StoryExtractor(api_key=anthropic_key, model=model_name)
        self.lyric_generator = LyricGenerator(api_key=anthropic_key)
        self.beat_maker = BeatMaker(
            preset=workflow_cfg["beat_preset"],
            duration_seconds=workflow_cfg["beat_duration_seconds"],
            target_bpm=workflow_cfg["target_bpm"],
        )
        self.voice_converter = RvcVoiceConverter(rvc_root=rvc_root)
        self.mixer = StemMixer(
            sample_rate=workflow_cfg["sample_rate"],
            echo_delay_seconds=mixing_cfg["echo_delay_seconds"],
            echo_decay=mixing_cfg["echo_decay"],
        )
        self.hit_predictor = HitPredictor(tempo_range=(100, 130))
        self.output_root = Path(workflow_cfg["output_root"])
        self.output_root.mkdir(parents=True, exist_ok=True)
        self.voice_model_path = Path(workflow_cfg["voice_model_path"])
        self.rvc_config_name = workflow_cfg.get("rvc_config", "default")

    def run(self, thread_text: str, user_voice: Optional[Path] = None) -> PipelineArtifacts:
        summary = self.story_extractor.extract_story(thread_text)
        summary_text = json.dumps(asdict(summary), indent=2)
        lyrics_sections = self.lyric_generator.write_song(
            summary_text,
            genre_hint="NEFFEX motivational rap",
            tempo=self.config["workflow"]["target_bpm"],
        )
        lyric_payload = [
            {"label": section.label, "lines": section.lines} for section in lyrics_sections
        ]
        lyrics_path = self._persist_lyrics(lyric_payload)
        beat_prompt = (
            "Motivational EDM rap beat with punchy drums,"
            f" heroic hook '{summary.hook}', shimmering synth bass."
        )
        beat_path = self.beat_maker.create_beat(
            prompt=beat_prompt,
            output_path=self.output_root / "instrumental.wav",
        )
        vocal_source = user_voice or (self.output_root / "dry_vocals.wav")
        if not vocal_source.exists():
            raise FileNotFoundError(
                f"Missing vocal source at {vocal_source}. Record a guide vocal and rerun."
            )
        vocal_path = self.voice_converter.convert(
            source_vocals=vocal_source,
            output_path=self.output_root / "styled_vocals.wav",
            config_name=self.rvc_config_name,
            voice_model=self.voice_model_path if self.voice_model_path.exists() else None,
        )
        mix_path = self.mixer.mix(
            instrumental_path=beat_path,
            vocal_path=vocal_path,
            output_path=self.output_root / self.config["workflow"]["mixdown_filename"],
            instrumental_gain_db=self.config["mixing"]["instrumental_gain_db"],
            vocal_gain_db=self.config["mixing"]["vocal_gain_db"],
            add_vocal_echo=True,
        )
        hit_score = self.hit_predictor.score_track(mix_path)
        return PipelineArtifacts(
            story=summary,
            lyrics=lyric_payload,
            lyrics_path=lyrics_path,
            beat_path=beat_path,
            vocal_path=vocal_path,
            mix_path=mix_path,
            hit_score=hit_score,
        )

    def _persist_lyrics(self, lyrics: List[Dict[str, List[str]]]) -> Path:
        lyrics_path = self.output_root / "lyrics.json"
        with open(lyrics_path, "w", encoding="utf-8") as handle:
            json.dump(lyrics, handle, indent=2)
        return lyrics_path

    def _load_config(self, config_path: Path) -> Dict:
        with open(config_path, "r", encoding="utf-8") as handle:
            return yaml.safe_load(handle)
