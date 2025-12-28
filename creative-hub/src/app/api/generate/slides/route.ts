import { NextRequest, NextResponse } from "next/server";
import { generateSlideContent } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { topic, style } = await request.json();

    if (!topic || topic.length < 10) {
      return NextResponse.json(
        { error: "Topic must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const validStyles = ["quantum", "corporate", "creative"] as const;
    const slideStyle = validStyles.includes(style) ? style : "quantum";

    const result = await generateSlideContent(topic, slideStyle);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Slide generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate slides";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
