import { NextRequest, NextResponse } from "next/server";

// Social media platform specifications
const PLATFORM_SPECS = {
  twitter: {
    name: "Twitter/X",
    profile: { width: 400, height: 400, format: "square" },
    banner: { width: 1500, height: 500, format: "3:1" },
  },
  telegram: {
    name: "Telegram",
    profile: { width: 512, height: 512, format: "square" },
    banner: { width: 1280, height: 720, format: "16:9" },
  },
  discord: {
    name: "Discord",
    profile: { width: 512, height: 512, format: "square" },
    banner: { width: 960, height: 540, format: "16:9" },
  },
  youtube: {
    name: "YouTube",
    profile: { width: 800, height: 800, format: "square" },
    banner: { width: 2560, height: 1440, format: "16:9" },
  },
  tiktok: {
    name: "TikTok",
    profile: { width: 200, height: 200, format: "square" },
  },
  soundcloud: {
    name: "SoundCloud",
    profile: { width: 800, height: 800, format: "square" },
    banner: { width: 2480, height: 520, format: "~5:1" },
  },
};

type Platform = keyof typeof PLATFORM_SPECS;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      ticker,
      tagline,
      colors,
      logoPrompt,
      platforms = ["twitter", "telegram", "discord"],
    } = body;

    if (!name || !ticker) {
      return NextResponse.json(
        { error: "Name and ticker are required" },
        { status: 400 }
      );
    }

    // Generate social kit specifications
    const socialKit: Record<string, {
      platform: string;
      assets: Array<{
        type: string;
        dimensions: { width: number; height: number };
        prompt: string;
        textOverlay?: { primary: string; secondary?: string };
      }>;
    }> = {};

    for (const platform of platforms as Platform[]) {
      const spec = PLATFORM_SPECS[platform];
      if (!spec) continue;

      const assets = [];

      // Profile picture
      if (spec.profile) {
        assets.push({
          type: "profile",
          dimensions: { width: spec.profile.width, height: spec.profile.height },
          prompt: `${logoPrompt || `Logo for ${name} (${ticker})`}. Square format, centered, bold, works at small sizes. Colors: ${colors?.primary || "#FFD700"} primary.`,
          textOverlay: {
            primary: ticker,
          },
        });
      }

      // Banner
      if ("banner" in spec && spec.banner) {
        assets.push({
          type: "banner",
          dimensions: { width: spec.banner.width, height: spec.banner.height },
          prompt: `Banner for ${name} (${ticker}). ${spec.banner.format} aspect ratio. ${tagline ? `Include tagline: "${tagline}"` : ""}. Gradient background using ${colors?.primary || "#FFD700"} and ${colors?.secondary || "#1a1a2e"}. Professional crypto/tech aesthetic.`,
          textOverlay: {
            primary: name,
            secondary: tagline,
          },
        });
      }

      socialKit[platform] = {
        platform: spec.name,
        assets,
      };
    }

    // Generate bio templates for each platform
    const bioTemplates = {
      twitter: `${tagline || name} | $${ticker} | Building the future 🚀`,
      telegram: `Welcome to ${name}!\n\n${tagline || "Join the community"}\n\n💎 $${ticker}`,
      discord: `${name} Official Server | $${ticker}\n${tagline || ""}`,
    };

    return NextResponse.json({
      success: true,
      brand: { name, ticker, tagline, colors },
      socialKit,
      bioTemplates,
      platforms: Object.keys(PLATFORM_SPECS),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Social kit generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate social kit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Get available platforms and their specs
export async function GET() {
  return NextResponse.json({
    platforms: Object.entries(PLATFORM_SPECS).map(([id, spec]) => ({
      id,
      name: spec.name,
      hasProfile: !!spec.profile,
      hasBanner: "banner" in spec,
    })),
  });
}
