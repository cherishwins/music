import { NextRequest, NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

// Vercel AI Gateway - routes through Vercel's managed infrastructure
// Supports Google, Anthropic, OpenAI through unified interface
const gateway = createOpenAI({
  baseURL: "https://gateway.vercel.ai/v1",
  apiKey: process.env.VERCEL_AI_GATEWAY_SECRET || "",
});

// Brand style tiers matching the ecosystem
const BRAND_TIERS = {
  standard: {
    style: "clean, modern, accessible",
    aesthetic: "professional startup vibes",
  },
  outlier: {
    style: "luxury hip-hop, bold, urban elite",
    aesthetic: "Outlier Clothiers - street luxury meets high fashion",
  },
  "1929": {
    style: "art deco luxury, mysterious, exclusive",
    aesthetic: "1929.world - gilded age opulence meets crypto mystique",
  },
  juche: {
    style: "revolutionary, bold, ideological",
    aesthetic: "Juche philosophy - self-reliance, strength, purpose",
  },
};

type BrandTier = keyof typeof BRAND_TIERS;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      concept,
      tier = "standard",
      includeTagline = true,
      includeColors = true,
      includeLogoPrompt = true,
    } = body;

    if (!concept || concept.length < 3) {
      return NextResponse.json(
        { error: "Concept must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!process.env.VERCEL_AI_GATEWAY_SECRET) {
      return NextResponse.json(
        { error: "VERCEL_AI_GATEWAY_SECRET not configured" },
        { status: 500 }
      );
    }

    const tierStyle = BRAND_TIERS[tier as BrandTier] || BRAND_TIERS.standard;

    // Generate comprehensive brand package
    const prompt = `You are a top-tier brand strategist for the crypto/meme coin space.
Generate a complete brand package for a new project with this concept: "${concept}"

Brand Style: ${tierStyle.style}
Aesthetic Reference: ${tierStyle.aesthetic}

Return a JSON object with these fields:
{
  "name": "The project/coin name (memorable, unique, 1-3 words)",
  "ticker": "3-5 letter ticker symbol (all caps)",
  ${includeTagline ? '"tagline": "A catchy slogan (max 8 words)",' : ""}
  ${includeColors ? '"colors": {"primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex"},' : ""}
  ${includeLogoPrompt ? '"logoPrompt": "Detailed prompt for AI image generation of the logo (describe style, elements, colors, mood)",' : ""}
  "socialBio": "Twitter/X bio (max 160 chars)",
  "elevator": "One sentence pitch (max 25 words)"
}

Make it memorable, unique, and aligned with the ${tier} aesthetic.
For meme coins, lean into humor and community.
For serious projects, emphasize utility and vision.

IMPORTANT: Return ONLY valid JSON, no markdown or explanation.`;

    // Use Vercel AI Gateway to route to Google Gemini
    // Gateway model format: provider/model-name
    const result = await generateText({
      model: gateway("google/gemini-2.0-flash"),
      prompt,
    });

    // Parse the response
    let brandPackage;
    try {
      // Try direct parse
      brandPackage = JSON.parse(result.text);
    } catch {
      // Try extracting JSON from response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        brandPackage = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse brand package");
      }
    }

    return NextResponse.json({
      success: true,
      concept,
      tier,
      brand: brandPackage,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Brand generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate brand";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Get available tiers
export async function GET() {
  return NextResponse.json({
    tiers: Object.entries(BRAND_TIERS).map(([id, info]) => ({
      id,
      ...info,
    })),
    features: [
      "name",
      "ticker",
      "tagline",
      "colors",
      "logoPrompt",
      "socialBio",
      "elevator",
    ],
  });
}
