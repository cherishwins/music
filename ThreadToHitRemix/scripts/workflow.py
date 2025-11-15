"""Orchestrates the end-to-end ThreadToHitRemix pipeline."""
from __future__ import annotations

import json
import logging
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, List, Optional

import yaml

from .beat_maker import BeatMaker
from .hit_predictor import HitPredictor, HitScore
from .lyric_generator import LyricGenerator
from .mixer import StemMixer
from .story_extractor import StoryExtractor, StorySummary
from .vocal_enhancer import VocalEnhancer, VocalMetadata
from .voice_converter import RvcVoiceConverter

logger = logging.getLogger(__name__)


@dataclass
class PipelineArtifacts:
    story: StorySummary
    lyrics: List[Dict[str, str]]
    lyrics_path: Path
    beat_path: Path
    vocal_path: Path
    mix_path: Path
    hit_score: Optional[HitScore]
    enhanced_vocals_path: Optional[Path] = None
    vocal_metadata: Optional[VocalMetadata] = None


class ThreadToHitWorkflow:
    """Coordinates each creative stage so CLI stays tidy."""

    def __init__(self, config_path: Path, anthropic_key: str, rvc_root: Path) -> None:
        self.config = self._load_config(config_path)
        model_name = self.config["anthropic"]["model"]
        workflow_cfg = self.config["workflow"]
        mixing_cfg = self.config["mixing"]
        vocals_cfg = self.config.get("vocals", {})
        mastering_cfg = self.config.get("mastering", {})

        self.story_extractor = StoryExtractor(api_key=anthropic_key, model=model_name)
        self.lyric_generator = LyricGenerator(api_key=anthropic_key)
        self.beat_maker = BeatMaker(
            preset=workflow_cfg["beat_preset"],
            duration_seconds=workflow_cfg["beat_duration_seconds"],
            target_bpm=workflow_cfg["target_bpm"],
        )

        enhancer_cfg = vocals_cfg.get("enhancer", {})
        self.vocal_enhancer = VocalEnhancer(
            sample_rate=workflow_cfg["sample_rate"],
            denoise_db=enhancer_cfg.get("denoise_db", 18.0),
            formant_shift=enhancer_cfg.get("formant_shift", 0.0),
            doubler_mix=enhancer_cfg.get("doubler_mix", 0.35),
            pitch_correction=vocals_cfg.get("pitch_correction", False),
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

        self.vocal_mode = workflow_cfg.get("vocal_mode", "rvc")
        self.use_rvc = workflow_cfg.get("use_rvc", True)
        self.rvc_blend = vocals_cfg.get("rvc_blend", 0.7)
        self.target_lufs = mastering_cfg.get("target_lufs", -9.5)
        self.skip_hit_predictor = workflow_cfg.get("skip_hit_predictor", False)

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

        enhanced_vocals_path = None
        vocal_metadata = None
        final_vocal_path = vocal_source

        logger.info(f"Vocal processing mode: {self.vocal_mode}")

        if self.vocal_mode == "raw":
            logger.info("Using raw vocals (no enhancement or RVC)")
            final_vocal_path = vocal_source

        elif self.vocal_mode == "enhanced":
            logger.info("Applying vocal enhancement (no RVC)")
            enhanced_vocals_path, vocal_metadata = self.vocal_enhancer.enhance(
                input_path=vocal_source,
                output_path=self.output_root / "enhanced_vocals.wav",
            )
            final_vocal_path = enhanced_vocals_path

        elif self.vocal_mode == "rvc":
            logger.info("Applying enhancement + RVC pipeline")

            enhanced_vocals_path, vocal_metadata = self.vocal_enhancer.enhance(
                input_path=vocal_source,
                output_path=self.output_root / "enhanced_vocals.wav",
            )

            if self.use_rvc:
                rvc_vocals_path = self.voice_converter.convert(
                    source_vocals=enhanced_vocals_path,
                    output_path=self.output_root / "rvc_vocals.wav",
                    config_name=self.rvc_config_name,
                    voice_model=self.voice_model_path if self.voice_model_path.exists() else None,
                )

                if self.rvc_blend < 1.0:
                    logger.info(f"Blending enhanced + RVC vocals (blend={self.rvc_blend})")
                    final_vocal_path = self.mixer.blend_vocals(
                        vocal_a_path=enhanced_vocals_path,
                        vocal_b_path=rvc_vocals_path,
                        output_path=self.output_root / "blended_vocals.wav",
                        blend_ratio=self.rvc_blend,
                    )
                else:
                    logger.info("Using 100% RVC vocals (no blending)")
                    final_vocal_path = rvc_vocals_path
            else:
                logger.info("RVC disabled, using enhanced vocals only")
                final_vocal_path = enhanced_vocals_path

        else:
            logger.warning(f"Unknown vocal_mode '{self.vocal_mode}', defaulting to raw")
            final_vocal_path = vocal_source

        logger.info(f"Final vocal path: {final_vocal_path}")

        mix_path = self.mixer.mix(
            instrumental_path=beat_path,
            vocal_path=final_vocal_path,
            output_path=self.output_root / "premix.wav",
            instrumental_gain_db=self.config["mixing"]["instrumental_gain_db"],
            vocal_gain_db=self.config["mixing"]["vocal_gain_db"],
            add_vocal_echo=True,
        )

        logger.info("Applying mastering (LUFS normalization)")
        final_mix_path = self.mixer.normalize_lufs(
            audio_path=mix_path,
            output_path=self.output_root / self.config["workflow"]["mixdown_filename"],
            target_lufs=self.target_lufs,
        )

        hit_score = None
        if not self.skip_hit_predictor:
            logger.info("Running hit prediction model")
            hit_score = self.hit_predictor.score_track(final_mix_path)
        else:
            logger.info("Skipping hit predictor (disabled in config)")

        return PipelineArtifacts(
            story=summary,
            lyrics=lyric_payload,
            lyrics_path=lyrics_path,
            beat_path=beat_path,
            vocal_path=final_vocal_path,
            mix_path=final_mix_path,
            hit_score=hit_score,
            enhanced_vocals_path=enhanced_vocals_path,
            vocal_metadata=vocal_metadata,
        )

    def _persist_lyrics(self, lyrics: List[Dict[str, List[str]]]) -> Path:
        lyrics_path = self.output_root / "lyrics.json"
        with open(lyrics_path, "w", encoding="utf-8") as handle:
            json.dump(lyrics, handle, indent=2)
        return lyrics_path

    def _load_config(self, config_path: Path) -> Dict:
        with open(config_path, "r", encoding="utf-8") as handle:
            return yaml.safe_load(handle)
