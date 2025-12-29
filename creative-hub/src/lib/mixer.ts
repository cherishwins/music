/**
 * Audio Mixing & Mastering
 * Combines voice + beat into final production-ready track
 */

import { spawn } from "child_process";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export interface MixOptions {
  voiceVolume?: number; // 0.0 - 2.0, default 1.0
  beatVolume?: number; // 0.0 - 2.0, default 0.35
  normalize?: boolean; // Apply loudness normalization
  fadeIn?: number; // Fade in duration (seconds)
  fadeOut?: number; // Fade out duration (seconds)
}

/**
 * Mix voice and beat into a final track using ffmpeg
 */
export async function mixTrack(
  voiceBuffer: Buffer,
  beatBuffer: Buffer,
  options: MixOptions = {}
): Promise<Buffer> {
  const {
    voiceVolume = 1.0,
    beatVolume = 0.35,
    normalize = true,
    fadeIn = 0.5,
    fadeOut = 2.0,
  } = options;

  // Create temp files
  const tempDir = tmpdir();
  const voicePath = join(tempDir, `voice-${Date.now()}.mp3`);
  const beatPath = join(tempDir, `beat-${Date.now()}.mp3`);
  const outputPath = join(tempDir, `mixed-${Date.now()}.mp3`);

  try {
    // Write input files
    await writeFile(voicePath, voiceBuffer);
    await writeFile(beatPath, beatBuffer);

    // Build ffmpeg filter chain
    const filters = [
      `[0:a]volume=${voiceVolume}[voice]`,
      `[1:a]volume=${beatVolume}[beat]`,
      `[voice][beat]amix=inputs=2:duration=first:dropout_transition=3[mixed]`,
    ];

    // Add fade effects
    if (fadeIn > 0) {
      filters.push(`[mixed]afade=t=in:st=0:d=${fadeIn}[faded]`);
    }

    // Add normalization for consistent loudness
    if (normalize) {
      const lastLabel = fadeIn > 0 ? "faded" : "mixed";
      filters.push(`[${lastLabel}]loudnorm=I=-14:TP=-1:LRA=11[normalized]`);
    }

    // Add fade out
    if (fadeOut > 0) {
      const lastLabel = normalize ? "normalized" : fadeIn > 0 ? "faded" : "mixed";
      // Fade out needs duration, we'll apply it in a second pass
    }

    const filterComplex = filters.join(";");
    const outputLabel = normalize ? "[normalized]" : fadeIn > 0 ? "[faded]" : "[mixed]";

    // Run ffmpeg
    await runFFmpeg([
      "-i", voicePath,
      "-stream_loop", "-1", // Loop beat to match voice duration
      "-i", beatPath,
      "-filter_complex", `${filterComplex}`,
      "-map", outputLabel,
      "-c:a", "libmp3lame",
      "-b:a", "320k", // High quality bitrate
      "-ar", "44100", // Standard sample rate
      "-shortest", // Stop when shortest input ends (voice)
      "-y", // Overwrite output
      outputPath,
    ]);

    // Read output
    const outputBuffer = await readFile(outputPath);
    return outputBuffer;
  } finally {
    // Cleanup temp files
    await Promise.all([
      unlink(voicePath).catch(() => {}),
      unlink(beatPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);
  }
}

/**
 * Run ffmpeg command
 */
function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stderr = "";
    ffmpeg.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
      }
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Get audio duration in seconds
 */
export async function getAudioDuration(audioBuffer: Buffer): Promise<number> {
  const tempPath = join(tmpdir(), `probe-${Date.now()}.mp3`);

  try {
    await writeFile(tempPath, audioBuffer);

    return new Promise((resolve, reject) => {
      const ffprobe = spawn("ffprobe", [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        tempPath,
      ]);

      let stdout = "";
      ffprobe.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      ffprobe.on("close", (code) => {
        if (code === 0) {
          resolve(parseFloat(stdout.trim()));
        } else {
          reject(new Error("ffprobe failed"));
        }
      });
    });
  } finally {
    await unlink(tempPath).catch(() => {});
  }
}
