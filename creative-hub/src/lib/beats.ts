/**
 * Beat Generation with Replicate (MusicGen)
 * Generates instrumentals from text prompts
 */

export interface BeatOptions {
  prompt: string;
  duration?: number; // seconds (default 15)
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

const MUSICGEN_VERSION = "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb";

/**
 * Generate a beat using MusicGen via Replicate direct API
 */
export async function generateBeat(options: BeatOptions): Promise<string> {
  const { prompt, duration = 15, bpm = 120, style = "hiphop" } = options;

  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  // Combine user prompt with style preset
  const stylePrompt = STYLE_PROMPTS[style];
  const fullPrompt = `${prompt}, ${stylePrompt}, ${bpm} BPM, instrumental only, no vocals`;

  console.log("Generating beat:", fullPrompt);

  // Create prediction
  const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: MUSICGEN_VERSION,
      input: {
        prompt: fullPrompt,
        model_version: "stereo-large",
        duration: Math.min(duration, 30),
        output_format: "mp3",
        normalization_strategy: "loudness",
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Replicate API error: ${error}`);
  }

  const prediction = await createResponse.json();
  const predictionId = prediction.id;

  // Poll for completion (max 2 minutes)
  const maxAttempts = 24;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

    const statusResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: { "Authorization": `Bearer ${apiToken}` },
      }
    );

    const status = await statusResponse.json();

    if (status.status === "succeeded") {
      return status.output;
    }

    if (status.status === "failed") {
      throw new Error(`Beat generation failed: ${status.error}`);
    }

    console.log(`Beat generation progress: ${status.status}`);
  }

  throw new Error("Beat generation timed out");
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
