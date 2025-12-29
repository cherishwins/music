import { NextRequest, NextResponse } from "next/server";
import { generateText, gateway } from "ai";
import { requirePayment } from "@/lib/x402";

// Vercel AI Gateway - unified access to 20+ providers
// Models: xai/grok-4.1-fast, google/gemini-2.0-flash, anthropic/claude-3-5-haiku
// Env: AI_GATEWAY_API_KEY (set in Vercel dashboard)

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
    // Check for x402 payment if enabled
    if (process.env.X402_ENABLED === "true") {
      const paymentResponse = await requirePayment(request, "/api/generate/brand");
      if (paymentResponse) {
        return paymentResponse;
      }
    }

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

    if (!process.env.AI_GATEWAY_API_KEY) {
      return NextResponse.json(
        { error: "AI_GATEWAY_API_KEY not configured" },
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

    // xAI Grok 4.1 Fast Non-Reasoning - best value for speed ($0.20/$0.50 per 1M tokens)
    // Alternatives: xai/grok-4.1-fast-reasoning, google/gemini-2.0-flash
    const result = await generateText({
      model: gateway("xai/grok-4.1-fast-non-reasoning"),
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
