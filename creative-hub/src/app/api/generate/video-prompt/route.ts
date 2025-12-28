import { NextRequest, NextResponse } from "next/server";
import { generateVideoPrompt } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { concept, style } = await request.json();

    if (!concept || concept.length < 10) {
      return NextResponse.json(
        { error: "Concept must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const result = await generateVideoPrompt(concept, style || "cinematic");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Video prompt generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate video prompt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
