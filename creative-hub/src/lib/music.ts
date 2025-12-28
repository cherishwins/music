/**
 * Music Generation with Suno API
 * https://sunoapi.org/
 */

const SUNO_API_BASE = "https://api.sunoapi.org";

interface SunoGenerateResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  audio_url?: string;
  title?: string;
  duration?: number;
}

interface SunoGenerateOptions {
  prompt: string;
  lyrics?: string;
  style?: string;
  title?: string;
  instrumental?: boolean;
}

function getApiKey(): string {
  const apiKey = process.env.SUNO_API_KEY;
  if (!apiKey) {
    throw new Error("SUNO_API_KEY is not configured");
  }
  return apiKey;
}

/**
 * Generate a song with Suno
 */
export async function generateSong(
  options: SunoGenerateOptions
): Promise<SunoGenerateResponse> {
  const apiKey = getApiKey();

  const response = await fetch(`${SUNO_API_BASE}/api/v1/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: options.prompt,
      lyrics: options.lyrics || "",
      style: options.style || "hip-hop motivational",
      title: options.title || "Untitled",
      instrumental: options.instrumental || false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Suno API error: ${error}`);
  }

  return response.json();
}

/**
 * Generate song with custom lyrics
 */
export async function generateSongWithLyrics(
  lyrics: string,
  style: string = "motivational hip-hop",
  title: string = "Thread to Hit"
): Promise<SunoGenerateResponse> {
  return generateSong({
    prompt: `Create a powerful ${style} song`,
    lyrics,
    style,
    title,
    instrumental: false,
  });
}

/**
 * Generate instrumental beat
 */
export async function generateBeat(
  style: string = "trap beat 140bpm",
  mood: string = "energetic"
): Promise<SunoGenerateResponse> {
  return generateSong({
    prompt: `${style}, ${mood} vibe`,
    instrumental: true,
    title: `Beat - ${style}`,
  });
}

/**
 * Check generation status
 */
export async function checkGenerationStatus(
  generationId: string
): Promise<SunoGenerateResponse> {
  const apiKey = getApiKey();

  const response = await fetch(
    `${SUNO_API_BASE}/api/v1/generations/${generationId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to check status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Full Thread-to-Hit pipeline
 * 1. Takes text content
 * 2. Uses Claude to extract story and generate lyrics
 * 3. Uses Suno to generate the song
 */
export async function threadToHit(
  content: string,
  style: string = "motivational hip-hop"
): Promise<{
  generationId: string;
  title: string;
  lyrics: string;
  status: string;
}> {
  // Import AI module dynamically to avoid circular deps
  const { extractStory, generateLyrics } = await import("./ai");

  // Step 1: Extract story from content
  const story = await extractStory(content);

  // Step 2: Generate full lyrics
  const lyrics = await generateLyrics(story);

  // Step 3: Generate song with Suno
  const result = await generateSongWithLyrics(lyrics, style, story.title);

  return {
    generationId: result.id,
    title: story.title,
    lyrics,
    status: result.status,
  };
}
