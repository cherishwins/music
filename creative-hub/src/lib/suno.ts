/**
 * Suno AI Music Generation
 * Generates REAL songs with vocals + music that actually sound good
 */

export interface SunoGenerateOptions {
  title: string;
  lyrics: string;
  style: string;
  instrumental?: boolean;
  model?: "V5" | "V4_5ALL" | "V4_5PLUS" | "V4_5" | "V4";
}

export interface SunoTrack {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  duration: number;
  style: string;
}

export interface SunoResponse {
  taskId: string;
  tracks?: SunoTrack[];
  status: "pending" | "processing" | "completed" | "failed";
}

const SUNO_API_BASE = "https://api.sunoapi.org/api/v1";

/**
 * Generate a song with Suno AI
 * Returns 2 variations of the song
 */
export async function generateSong(options: SunoGenerateOptions): Promise<SunoTrack[]> {
  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    throw new Error("SUNO_API_KEY not configured");
  }

  const {
    title,
    lyrics,
    style,
    instrumental = false,
    model = "V4_5ALL",
  } = options;

  console.log(`[Suno] Generating: "${title}" in style: ${style}`);

  // Create generation request
  const createResponse = await fetch(`${SUNO_API_BASE}/generate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customMode: true,
      instrumental,
      model,
      prompt: lyrics,
      style,
      title,
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Suno API error: ${error}`);
  }

  const createResult = await createResponse.json();
  const taskId = createResult.data?.taskId || createResult.taskId;

  if (!taskId) {
    throw new Error("No taskId returned from Suno API");
  }

  console.log(`[Suno] Task created: ${taskId}`);

  // Poll for completion (Suno can take 1-3 minutes)
  const maxAttempts = 60; // 5 minutes max
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

    const statusResponse = await fetch(`${SUNO_API_BASE}/query?taskId=${taskId}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!statusResponse.ok) {
      console.log(`[Suno] Status check failed, retrying...`);
      continue;
    }

    const statusResult = await statusResponse.json();
    const status = statusResult.data?.status || statusResult.status;

    console.log(`[Suno] Status: ${status} (attempt ${i + 1}/${maxAttempts})`);

    if (status === "completed" || status === "SUCCESS") {
      const tracks = statusResult.data?.data || statusResult.data?.tracks || [];

      if (tracks.length === 0) {
        throw new Error("No tracks returned from Suno");
      }

      return tracks.map((track: Record<string, unknown>) => ({
        id: track.id as string || track.songId as string,
        title: track.title as string || title,
        audioUrl: track.audioUrl as string || track.audio_url as string,
        imageUrl: track.imageUrl as string || track.image_url as string,
        duration: track.duration as number || 0,
        style: track.style as string || style,
      }));
    }

    if (status === "failed" || status === "FAILED") {
      throw new Error(`Suno generation failed: ${statusResult.data?.error || "Unknown error"}`);
    }
  }

  throw new Error("Suno generation timed out");
}

/**
 * Generate lyrics using Suno's AI
 */
export async function generateLyrics(prompt: string): Promise<string> {
  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    throw new Error("SUNO_API_KEY not configured");
  }

  const response = await fetch(`${SUNO_API_BASE}/lyrics`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Suno lyrics error: ${error}`);
  }

  const result = await response.json();
  return result.data?.lyrics || result.lyrics || "";
}

/**
 * Download audio from Suno URL
 */
export async function downloadSunoAudio(audioUrl: string): Promise<Buffer> {
  const response = await fetch(audioUrl);
  if (!response.ok) {
    throw new Error(`Failed to download Suno audio: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Style presets for different vibes
export const SUNO_STYLES = {
  trap: "Dark Trap, 808 Bass, Hard Hitting Drums, Atlanta Trap, Aggressive",
  hiphop: "Hip Hop, Boom Bap, Soulful Samples, Classic Rap, East Coast",
  drill: "UK Drill, Sliding 808s, Dark Melodies, Aggressive Flow",
  rnb: "R&B, Smooth, Soulful, Melodic, Neo-Soul",
  pop: "Pop, Catchy, Radio-Friendly, Upbeat, Modern",
  lofi: "Lo-Fi Hip Hop, Chill, Jazzy, Mellow, Study Beats",
  cinematic: "Cinematic, Epic, Orchestral, Dramatic, Movie Score",
  afrobeat: "Afrobeats, Nigerian Pop, Danceable, Afro-Fusion",
  reggaeton: "Reggaeton, Latin Trap, Perreo, Dembow",
  kpop: "K-Pop, Korean Pop, Catchy, Dance, Polished Production",
};
