import { NextRequest, NextResponse } from "next/server";
import { SwarmController } from "@/lib/intel/swarm-controller";
import { SocialBlitz, BlitzConfig, BlitzTargets } from "@/lib/intel/social-blitz";
import { DistributionChannels } from "@/lib/intel/distribution-channels";

/**
 * Intelligence Blitz API
 *
 * Endpoints:
 * POST /api/intel/blitz - Execute coordinated content distribution
 * POST /api/intel/blitz/signals - Get aggregated alpha signals
 * POST /api/intel/blitz/whale - Profile a whale address
 */

// Load configs from environment
function getBlitzConfig(): BlitzConfig {
  return {
    pinterest: process.env.PINTEREST_ACCESS_TOKEN
      ? { accessToken: process.env.PINTEREST_ACCESS_TOKEN }
      : undefined,

    reddit: process.env.REDDIT_CLIENT_ID
      ? {
          clientId: process.env.REDDIT_CLIENT_ID,
          clientSecret: process.env.REDDIT_CLIENT_SECRET || "",
          username: process.env.REDDIT_USERNAME || "",
          password: process.env.REDDIT_PASSWORD || "",
          userAgent: "WhiteTiger/1.0",
        }
      : undefined,

    discord: process.env.DISCORD_WEBHOOK_URLS
      ? process.env.DISCORD_WEBHOOK_URLS.split(",").map((url) => ({
          url: url.trim(),
          name: "White Tiger",
        }))
      : undefined,

    twitter: process.env.TWITTER_BEARER_TOKEN
      ? {
          apiKey: process.env.TWITTER_API_KEY || "",
          apiSecret: process.env.TWITTER_API_SECRET || "",
          accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
          accessSecret: process.env.TWITTER_ACCESS_SECRET || "",
          bearerToken: process.env.TWITTER_BEARER_TOKEN,
        }
      : undefined,

    medium: process.env.MEDIUM_INTEGRATION_TOKEN
      ? { integrationToken: process.env.MEDIUM_INTEGRATION_TOKEN }
      : undefined,

    linkedin: process.env.LINKEDIN_ACCESS_TOKEN
      ? { accessToken: process.env.LINKEDIN_ACCESS_TOKEN }
      : undefined,

    threads: process.env.THREADS_ACCESS_TOKEN
      ? {
          accessToken: process.env.THREADS_ACCESS_TOKEN,
          userId: process.env.THREADS_USER_ID || "",
        }
      : undefined,
  };
}

function getDistributionConfig() {
  return {
    vk: process.env.VK_ACCESS_TOKEN
      ? {
          accessToken: process.env.VK_ACCESS_TOKEN,
          groupId: process.env.VK_GROUP_ID || "",
          apiVersion: "5.199",
        }
      : undefined,

    wechat: process.env.WECHAT_APP_ID
      ? {
          appId: process.env.WECHAT_APP_ID,
          appSecret: process.env.WECHAT_APP_SECRET || "",
        }
      : undefined,

    telegram: process.env.TELEGRAM_BOT_TOKEN
      ? {
          botToken: process.env.TELEGRAM_BOT_TOKEN,
          channels: (process.env.TELEGRAM_DISTRIBUTION_CHANNELS || "").split(","),
        }
      : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "blitz": {
        // Execute full social blitz
        const { content, targets } = body as {
          action: string;
          content: {
            shortText: string;
            mediumText: string;
            title?: string;
            longContent?: string;
            imageUrl?: string;
            videoUrl?: string;
            link?: string;
            tags?: string[];
            token?: string;
            campaign?: string;
          };
          targets: BlitzTargets;
        };

        const config = getBlitzConfig();
        const result = await SocialBlitz.executeBlitz(config, content, targets);

        // Also distribute to VK/WeChat/Telegram if configured
        const distConfig = getDistributionConfig();
        if (distConfig.vk || distConfig.wechat || distConfig.telegram) {
          const distResult = await DistributionChannels.distributeAcrossPlatforms(
            {
              ...distConfig,
              targets: [
                ...(distConfig.vk
                  ? [{ platform: "vk" as const, channelId: distConfig.vk.groupId, priority: 10 }]
                  : []),
                ...(distConfig.wechat ? [{ platform: "wechat" as const, channelId: "all", priority: 10 }] : []),
                ...(distConfig.telegram?.channels.map((ch) => ({
                  platform: "telegram" as const,
                  channelId: ch,
                  priority: 9,
                })) || []),
              ],
            },
            {
              text: content.mediumText,
              shortText: content.shortText,
              imageUrl: content.imageUrl,
              ctaUrl: content.link,
            }
          );

          result.total += distResult.totalSent + distResult.totalFailed;
          result.success += distResult.totalSent;
          result.failed += distResult.totalFailed;
          result.results.push(
            ...distResult.results.map((r) => ({
              platform: r.platform,
              target: r.channelId,
              success: r.success,
              id: r.messageId?.toString(),
            }))
          );
        }

        return NextResponse.json({
          ok: true,
          total: result.total,
          successCount: result.success,
          failedCount: result.failed,
          results: result.results,
        });
      }

      case "signals": {
        // Get aggregated alpha signals
        const { timeWindowMinutes, minConfidence } = body;
        const signals = await SwarmController.aggregateSignals({
          timeWindowMinutes: timeWindowMinutes || 60,
          minConfidence: minConfidence || 60,
        });

        return NextResponse.json({
          success: true,
          signals,
          count: signals.length,
        });
      }

      case "whale": {
        // Profile a whale address
        const { address, chain } = body;
        if (!address || !chain) {
          return NextResponse.json(
            { error: "address and chain required" },
            { status: 400 }
          );
        }

        const profile = await SwarmController.profileWhale({ address, chain });

        return NextResponse.json({
          success: true,
          profile,
        });
      }

      case "swarm": {
        // Create and execute swarm command
        const { signal, networkSize, autoDistribute } = body;
        if (!signal) {
          return NextResponse.json({ error: "signal required" }, { status: 400 });
        }

        const command = await SwarmController.createSwarmCommand({
          signal,
          networkSize,
        });

        let distribution = null;
        if (autoDistribute) {
          distribution = await SwarmController.distributeContent({
            command,
            contentType: signal.type === "warning" ? "alert" : "meme",
          });
        }

        return NextResponse.json({
          success: true,
          command,
          distribution,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Blitz API error:", error);
    const message = error instanceof Error ? error.message : "Blitz failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET - Status and available platforms
export async function GET() {
  const blitzConfig = getBlitzConfig();
  const distConfig = getDistributionConfig();

  const platforms = {
    // Tier 1 - Your network
    vk: !!distConfig.vk,
    wechat: !!distConfig.wechat,
    telegram: !!distConfig.telegram,

    // Tier 2 - Crypto degen
    twitter: !!blitzConfig.twitter,
    discord: !!(blitzConfig.discord && blitzConfig.discord.length > 0),
    reddit: !!blitzConfig.reddit,

    // Tier 3 - Visual/discovery
    pinterest: !!blitzConfig.pinterest,

    // Tier 4 - Long-tail
    medium: !!blitzConfig.medium,
    linkedin: !!blitzConfig.linkedin,
    threads: !!blitzConfig.threads,
  };

  const activePlatforms = Object.entries(platforms)
    .filter(([, v]) => v)
    .map(([k]) => k);

  return NextResponse.json({
    name: "Intelligence Blitz API",
    version: "1.0.0",
    activePlatforms,
    platformStatus: platforms,
    endpoints: {
      "POST /api/intel/blitz": {
        actions: {
          blitz: "Execute coordinated content distribution across all platforms",
          signals: "Get aggregated alpha signals from whale movements and social",
          whale: "Profile a specific whale address",
          swarm: "Create and execute swarm coordination command",
        },
      },
    },
    envRequired: [
      "# Tier 1 (Your Network)",
      "VK_ACCESS_TOKEN, VK_GROUP_ID",
      "WECHAT_APP_ID, WECHAT_APP_SECRET",
      "TELEGRAM_BOT_TOKEN, TELEGRAM_DISTRIBUTION_CHANNELS",
      "",
      "# Tier 2 (Crypto Degen)",
      "TWITTER_BEARER_TOKEN, TWITTER_API_KEY, TWITTER_API_SECRET",
      "DISCORD_WEBHOOK_URLS (comma-separated)",
      "REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD",
      "",
      "# Tier 3 (Visual)",
      "PINTEREST_ACCESS_TOKEN",
      "",
      "# Tier 4 (Long-tail)",
      "MEDIUM_INTEGRATION_TOKEN",
      "LINKEDIN_ACCESS_TOKEN",
      "THREADS_ACCESS_TOKEN, THREADS_USER_ID",
    ],
  });
}
