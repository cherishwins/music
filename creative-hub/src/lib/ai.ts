/**
 * AI Content Generation with Claude
 */

import Anthropic from "@anthropic-ai/sdk";

let anthropic: Anthropic | null = null;

/**
 * Extract JSON from Claude response that might be wrapped in markdown code blocks
 */
function extractJSON<T>(text: string): T {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    }

    // Try to find JSON object boundaries
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error("No valid JSON found in response");
  }
}

function getClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

/**
 * Extract a compelling story/journey from text content
 * Used for Thread-to-Hit feature
 */
export async function extractStory(content: string): Promise<{
  title: string;
  hook: string;
  verses: string[];
  chorus: string;
  bridge: string;
  theme: string;
  emotion: string;
}> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Analyze this content and extract a compelling story suitable for a motivational/hype song in the style of NEFFEX or similar artists.

Content:
${content}

Return a JSON object with:
- title: A catchy song title (2-5 words)
- hook: A memorable one-liner that captures the essence
- verses: Array of 2-3 verse ideas (each 4-8 lines)
- chorus: A powerful, repeatable chorus (4-6 lines)
- bridge: A bridge section for emotional impact
- theme: The core theme (struggle, triumph, grind, etc.)
- emotion: Primary emotion (determined, defiant, hopeful, etc.)

Make it authentic, raw, and motivational. Focus on the hero's journey - the struggle, the grind, the triumph.

Respond with ONLY the JSON object, no other text.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return extractJSON(text);
  } catch (e) {
    console.error("Story extraction parse error:", e, "Raw text:", text.slice(0, 500));
    throw new Error("Failed to parse story extraction response");
  }
}

/**
 * Generate lyrics from extracted story
 */
export async function generateLyrics(story: {
  title: string;
  hook: string;
  verses: string[];
  chorus: string;
  theme: string;
  emotion: string;
}): Promise<string> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Write complete song lyrics based on this story concept:

Title: ${story.title}
Hook: ${story.hook}
Theme: ${story.theme}
Emotion: ${story.emotion}
Verse Ideas: ${story.verses.join("\n")}
Chorus Concept: ${story.chorus}

Write in a modern hip-hop/motivational style like NEFFEX, NF, or Eminem.
Include:
- [Intro]
- [Verse 1]
- [Chorus]
- [Verse 2]
- [Chorus]
- [Bridge]
- [Chorus]
- [Outro]

Make it authentic, powerful, and memorable. Use vivid imagery and strong rhyme schemes.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

/**
 * Generate slide deck content
 */
export async function generateSlideContent(
  topic: string,
  style: "quantum" | "corporate" | "creative" = "quantum"
): Promise<{
  title: string;
  slides: Array<{
    title: string;
    content: string[];
    notes: string;
    visualSuggestion: string;
  }>;
}> {
  const client = getClient();

  const styleGuide = {
    quantum: "Use physics metaphors, quantum concepts, and reality-bending language. Think multiverse, superposition, eigenvalues.",
    corporate: "Professional, data-driven, with clear actionable insights.",
    creative: "Bold, artistic, unconventional with surprising analogies.",
  };

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `Create a compelling slide deck about: ${topic}

Style: ${styleGuide[style]}

Return a JSON object with:
{
  "title": "Deck title",
  "slides": [
    {
      "title": "Slide title",
      "content": ["Bullet point 1", "Bullet point 2", ...],
      "notes": "Speaker notes for this slide",
      "visualSuggestion": "Description of visual/image to use"
    }
  ]
}

Create 8-12 slides that tell a compelling story. Each slide should have 3-5 bullet points max.

Respond with ONLY the JSON object.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return extractJSON(text);
  } catch (e) {
    console.error("Slide content parse error:", e, "Raw text:", text.slice(0, 500));
    throw new Error("Failed to parse slide content response");
  }
}

/**
 * Generate creative content description for video
 */
export async function generateVideoPrompt(
  concept: string,
  style: string = "cinematic"
): Promise<{
  prompt: string;
  scenes: string[];
  duration: string;
  mood: string;
}> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `Create a video generation prompt for: ${concept}

Style: ${style}

Return a JSON object with:
{
  "prompt": "A detailed prompt for AI video generation (Runway ML style)",
  "scenes": ["Scene 1 description", "Scene 2", ...],
  "duration": "Suggested duration (e.g., '4 seconds')",
  "mood": "The overall mood/feeling"
}

Make the prompt vivid, specific, and optimized for AI video generation.

Respond with ONLY the JSON object.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    return extractJSON(text);
  } catch (e) {
    console.error("Video prompt parse error:", e, "Raw text:", text.slice(0, 500));
    throw new Error("Failed to parse video prompt response");
  }
}
