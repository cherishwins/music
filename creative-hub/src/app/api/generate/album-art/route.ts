import { NextRequest, NextResponse } from "next/server";
import { generateAlbumArt } from "@/lib/images";
import { requirePayment } from "@/lib/x402";

// Album art style presets
const STYLE_PRESETS = {
  trap: "dark moody trap aesthetic, urban gritty, neon accents, smoke effects",
  kpop: "colorful vibrant K-pop style, glossy finish, bold typography space",
  underground: "raw underground hip-hop, distressed textures, street art influence",
  luxury: "luxury minimalist, gold accents, premium feel, high fashion",
  retro: "80s retrowave, synthwave gradients, neon grid, VHS aesthetic",
  korean: "traditional Korean meets modern, hangeul typography space, cultural motifs",
} as const;

type StylePreset = keyof typeof STYLE_PRESETS;

export async function POST(request: NextRequest) {
  try {
    // Check for x402 payment if enabled
    if (process.env.X402_ENABLED === "true") {
      const paymentResponse = await requirePayment(request, "/api/generate/album-art");
      if (paymentResponse) {
        return paymentResponse;
      }
    }

    const body = await request.json();
    const { prompt, style, artistName, trackTitle } = body;

    if (!prompt || prompt.length < 5) {
      return NextResponse.json(
        { error: "Prompt must be at least 5 characters" },
        { status: 400 }
      );
    }

    if (!process.env.AI_GATEWAY_API_KEY) {
      return NextResponse.json(
        { error: "AI_GATEWAY_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Build enhanced prompt with style and metadata
    const styleHint = style && STYLE_PRESETS[style as StylePreset]
      ? STYLE_PRESETS[style as StylePreset]
      : "";

    const enhancedPrompt = [
      prompt,
      styleHint,
      artistName ? `For artist: ${artistName}` : "",
      trackTitle ? `Track: ${trackTitle}` : "",
      "Square format, album cover composition, no text in image",
    ]
      .filter(Boolean)
      .join(". ");

    // Generate album art
    const result = await generateAlbumArt(enhancedPrompt);

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      downloadUrl: result.downloadUrl,
      pathname: result.pathname,
      prompt: enhancedPrompt,
      style: style || "custom",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Album art generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate album art";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Get available style presets
export async function GET() {
  return NextResponse.json({
    presets: Object.entries(STYLE_PRESETS).map(([id, description]) => ({
      id,
      description,
    })),
    usage: {
      method: "POST",
      body: {
        prompt: "Your album concept description (required)",
        style: "Style preset id (optional)",
        artistName: "Artist name for context (optional)",
        trackTitle: "Track title for context (optional)",
      },
    },
  });
}
