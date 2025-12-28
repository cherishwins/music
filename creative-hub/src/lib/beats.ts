/**
 * Beat Generation with Replicate (MusicGen)
 * Generates instrumentals from text prompts
 */

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export interface BeatOptions {
  prompt: string;
  duration?: number; // seconds (default 30)
  bpm?: number;
  style?: "trap" | "lofi" | "edm" | "cinematic" | "hiphop";
}

// Style presets for different vibes
const STYLE_PROMPTS = {
  trap: "dark trap beat, 808 bass, hi-hats, hard hitting drums",
  lofi: "lofi hip hop beat, mellow, jazzy samples, vinyl crackle",
  edm: "energetic EDM drop, synths, build up, festival sound",
  cinematic: "epic cinematic instrumental, orchestral, dramatic",
  hiphop: "boom bap hip hop beat, soulful samples, punchy drums",
};

/**
 * Generate a beat using MusicGen via Replicate
 */
export async function generateBeat(options: BeatOptions): Promise<string> {
  const { prompt, duration = 30, bpm = 120, style = "hiphop" } = options;

  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  // Combine user prompt with style preset
  const stylePrompt = STYLE_PROMPTS[style];
  const fullPrompt = `${prompt}, ${stylePrompt}, ${bpm} BPM, instrumental only, no vocals`;

  console.log("Generating beat:", fullPrompt);

  // Use MusicGen via Replicate
  const output = await replicate.run(
    "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043ac92924f3f8ace440ca3834a",
    {
      input: {
        prompt: fullPrompt,
        duration: Math.min(duration, 30), // Max 30 seconds
        model_version: "stereo-melody-large",
        output_format: "mp3",
        normalization_strategy: "loudness",
      },
    }
  );

  // Replicate returns a URL to the generated audio
  if (typeof output === "string") {
    return output;
  }

  throw new Error("Unexpected response from Replicate");
}

/**
 * Download audio from URL and return as base64
 */
export async function downloadAudioAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download audio: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}

/**
 * Generate a beat and return as base64
 */
export async function generateBeatBase64(options: BeatOptions): Promise<string> {
  const url = await generateBeat(options);
  return downloadAudioAsBase64(url);
}
