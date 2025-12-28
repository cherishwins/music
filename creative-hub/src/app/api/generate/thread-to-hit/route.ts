import { NextRequest, NextResponse } from "next/server";
import { threadToHit } from "@/lib/music";

export async function POST(request: NextRequest) {
  try {
    const { content, style } = await request.json();

    if (!content || content.length < 50) {
      return NextResponse.json(
        { error: "Content must be at least 50 characters" },
        { status: 400 }
      );
    }

    // Check if APIs are configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    if (!process.env.SUNO_API_KEY) {
      return NextResponse.json(
        { error: "SUNO_API_KEY not configured" },
        { status: 500 }
      );
    }

    const result = await threadToHit(content, style || "motivational hip-hop");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Thread to hit error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
