/**
 * Multi-Platform Distribution Channels
 *
 * Primary Networks (500k+ users):
 * - VK (VKontakte) - Russian-speaking crypto community
 * - WeChat - Chinese-speaking crypto community
 * - Telegram - Primary degen network
 *
 * Secondary (for reach amplification):
 * - Twitter/X - Crypto Twitter narratives
 * - Discord - Community depth
 *
 * NOT using: WhatsApp/Meta (restrictive AF on crypto)
 */

// ============================================
// VK INTEGRATION
// ============================================

/**
 * VK API wrapper for community management and posting
 * Docs: https://dev.vk.com/en/reference
 *
 * VK is more permissive than Meta for crypto content
 * Community posts, stories, and targeted messaging all supported
 */
export interface VKConfig {
  accessToken: string; // Community token from VK app
  groupId: string; // Negative ID for community posts
  apiVersion: string; // e.g., "5.199"
}

export interface VKPost {
  message: string;
  attachments?: string[];
  publishDate?: number; // Unix timestamp for scheduled posts
  signedByAdmin?: boolean;
}

export async function postToVK(
  config: VKConfig,
  post: VKPost
): Promise<{ postId: number; success: boolean }> {
  const params = new URLSearchParams({
    access_token: config.accessToken,
    v: config.apiVersion || "5.199",
    owner_id: `-${config.groupId}`, // Negative for community
    message: post.message,
    from_group: "1",
  });

  if (post.attachments) {
    params.set("attachments", post.attachments.join(","));
  }
  if (post.publishDate) {
    params.set("publish_date", post.publishDate.toString());
  }
  if (post.signedByAdmin) {
    params.set("signed", "1");
  }

  try {
    const response = await fetch(
      `https://api.vk.com/method/wall.post?${params}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("VK API error:", data.error);
      return { postId: 0, success: false };
    }

    return { postId: data.response.post_id, success: true };
  } catch (error) {
    console.error("VK post failed:", error);
    return { postId: 0, success: false };
  }
}

/**
 * Get VK community stats for engagement tracking
 */
export async function getVKCommunityStats(
  config: VKConfig
): Promise<{
  members: number;
  reach24h: number;
  engagement: number;
}> {
  const params = new URLSearchParams({
    access_token: config.accessToken,
    v: config.apiVersion || "5.199",
    group_id: config.groupId,
  });

  try {
    const response = await fetch(
      `https://api.vk.com/method/groups.getById?${params}&fields=members_count,activity`
    );
    const data = await response.json();

    if (data.response?.[0]) {
      return {
        members: data.response[0].members_count || 0,
        reach24h: 0, // Requires separate stats API call
        engagement: 0,
      };
    }
  } catch (error) {
    console.error("VK stats failed:", error);
  }

  return { members: 0, reach24h: 0, engagement: 0 };
}

// ============================================
// WECHAT INTEGRATION
// ============================================

/**
 * WeChat Official Account API wrapper
 * Docs: https://developers.weixin.qq.com/doc/
 *
 * WeChat requires:
 * 1. Verified Official Account (Service Account for full API)
 * 2. Server in China or with Chinese IP for some features
 * 3. Content review may apply but crypto is generally OK
 */
export interface WeChatConfig {
  appId: string;
  appSecret: string;
  accessToken?: string; // Cached, expires every 2 hours
  tokenExpiry?: number;
}

export interface WeChatMessage {
  type: "text" | "image" | "voice" | "video" | "news";
  content: string;
  mediaId?: string; // For non-text content
  articles?: Array<{
    title: string;
    description: string;
    url: string;
    picurl: string;
  }>;
}

/**
 * Get WeChat access token (cache for 2 hours)
 */
export async function getWeChatToken(
  config: WeChatConfig
): Promise<string | null> {
  // Return cached token if valid
  if (config.accessToken && config.tokenExpiry && Date.now() < config.tokenExpiry) {
    return config.accessToken;
  }

  try {
    const response = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`
    );
    const data = await response.json();

    if (data.access_token) {
      // Cache token (expires in ~2 hours, refresh at 1.5 hours)
      config.accessToken = data.access_token;
      config.tokenExpiry = Date.now() + 5400000; // 1.5 hours
      return data.access_token;
    }

    console.error("WeChat token error:", data);
    return null;
  } catch (error) {
    console.error("WeChat token failed:", error);
    return null;
  }
}

/**
 * Send mass message to all followers
 */
export async function sendWeChatMassMessage(
  config: WeChatConfig,
  message: WeChatMessage
): Promise<{ msgId: string; success: boolean }> {
  const token = await getWeChatToken(config);
  if (!token) return { msgId: "", success: false };

  const payload: Record<string, unknown> = {
    filter: { is_to_all: true },
    msgtype: message.type,
  };

  // Build type-specific content
  switch (message.type) {
    case "text":
      payload.text = { content: message.content };
      break;
    case "news":
      payload.mpnews = { media_id: message.mediaId };
      break;
    case "image":
      payload.image = { media_id: message.mediaId };
      break;
    default:
      payload.text = { content: message.content };
  }

  try {
    const response = await fetch(
      `https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();

    if (data.errcode === 0) {
      return { msgId: data.msg_id, success: true };
    }

    console.error("WeChat send error:", data);
    return { msgId: "", success: false };
  } catch (error) {
    console.error("WeChat send failed:", error);
    return { msgId: "", success: false };
  }
}

// ============================================
// TELEGRAM DISTRIBUTION
// ============================================

/**
 * Telegram channel/group posting via grammy or Telegram MCP
 *
 * This integrates with the existing @MSUCOBot and other bots
 */
export interface TelegramDistributionConfig {
  botToken: string;
  channels: string[]; // @channel usernames or chat IDs
}

export interface TelegramPost {
  text: string;
  parseMode?: "HTML" | "MarkdownV2";
  media?: {
    type: "photo" | "video" | "animation";
    url: string;
    caption?: string;
  };
  buttons?: Array<{
    text: string;
    url: string;
  }>;
}

export async function postToTelegram(
  config: TelegramDistributionConfig,
  channelId: string,
  post: TelegramPost
): Promise<{ messageId: number; success: boolean }> {
  const baseUrl = `https://api.telegram.org/bot${config.botToken}`;

  try {
    let endpoint: string;
    const payload: Record<string, unknown> = {
      chat_id: channelId,
      parse_mode: post.parseMode || "HTML",
    };

    // Add inline keyboard if buttons provided
    if (post.buttons?.length) {
      payload.reply_markup = {
        inline_keyboard: [
          post.buttons.map((b) => ({ text: b.text, url: b.url })),
        ],
      };
    }

    if (post.media) {
      switch (post.media.type) {
        case "photo":
          endpoint = "/sendPhoto";
          payload.photo = post.media.url;
          payload.caption = post.media.caption || post.text;
          break;
        case "video":
          endpoint = "/sendVideo";
          payload.video = post.media.url;
          payload.caption = post.media.caption || post.text;
          break;
        case "animation":
          endpoint = "/sendAnimation";
          payload.animation = post.media.url;
          payload.caption = post.media.caption || post.text;
          break;
        default:
          endpoint = "/sendMessage";
          payload.text = post.text;
      }
    } else {
      endpoint = "/sendMessage";
      payload.text = post.text;
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.ok) {
      return { messageId: data.result.message_id, success: true };
    }

    console.error("Telegram send error:", data);
    return { messageId: 0, success: false };
  } catch (error) {
    console.error("Telegram send failed:", error);
    return { messageId: 0, success: false };
  }
}

// ============================================
// UNIFIED DISTRIBUTION
// ============================================

export interface DistributionTarget {
  platform: "vk" | "wechat" | "telegram" | "twitter" | "discord";
  channelId: string;
  priority: number; // 1-10, higher = post first
  rateLimit?: number; // ms between posts to this channel
}

export interface DistributionConfig {
  vk?: VKConfig;
  wechat?: WeChatConfig;
  telegram?: TelegramDistributionConfig;
  targets: DistributionTarget[];
}

export interface ContentPackage {
  // Core message
  text: string;
  shortText?: string; // For character-limited platforms

  // Media
  imageUrl?: string;
  videoUrl?: string;
  gifUrl?: string;

  // Call to action
  ctaText?: string;
  ctaUrl?: string;

  // Metadata
  token?: string;
  campaign?: string;
  urgency?: "low" | "medium" | "high";
}

/**
 * Distribute content across all configured platforms
 */
export async function distributeAcrossPlatforms(
  config: DistributionConfig,
  content: ContentPackage
): Promise<{
  totalSent: number;
  totalFailed: number;
  results: Array<{
    platform: string;
    channelId: string;
    success: boolean;
    messageId?: string | number;
  }>;
}> {
  const results: Array<{
    platform: string;
    channelId: string;
    success: boolean;
    messageId?: string | number;
  }> = [];

  // Sort targets by priority (highest first)
  const sortedTargets = [...config.targets].sort(
    (a, b) => b.priority - a.priority
  );

  for (const target of sortedTargets) {
    try {
      let result: { success: boolean; messageId?: string | number } = {
        success: false,
      };

      switch (target.platform) {
        case "vk":
          if (config.vk) {
            const vkResult = await postToVK(config.vk, {
              message: content.text,
              attachments: content.imageUrl ? [content.imageUrl] : undefined,
            });
            result = { success: vkResult.success, messageId: vkResult.postId };
          }
          break;

        case "wechat":
          if (config.wechat) {
            const wcResult = await sendWeChatMassMessage(config.wechat, {
              type: "text",
              content: content.text,
            });
            result = { success: wcResult.success, messageId: wcResult.msgId };
          }
          break;

        case "telegram":
          if (config.telegram) {
            const tgResult = await postToTelegram(
              config.telegram,
              target.channelId,
              {
                text: content.text,
                media: content.imageUrl
                  ? { type: "photo", url: content.imageUrl }
                  : content.gifUrl
                    ? { type: "animation", url: content.gifUrl }
                    : undefined,
                buttons: content.ctaUrl
                  ? [{ text: content.ctaText || "Learn More", url: content.ctaUrl }]
                  : undefined,
              }
            );
            result = {
              success: tgResult.success,
              messageId: tgResult.messageId,
            };
          }
          break;

        // Twitter and Discord can be added similarly
        default:
          console.warn(`Platform ${target.platform} not configured`);
      }

      results.push({
        platform: target.platform,
        channelId: target.channelId,
        ...result,
      });

      // Rate limiting between posts
      if (target.rateLimit) {
        await new Promise((r) => setTimeout(r, target.rateLimit));
      }
    } catch (error) {
      console.error(`Distribution to ${target.platform}/${target.channelId} failed:`, error);
      results.push({
        platform: target.platform,
        channelId: target.channelId,
        success: false,
      });
    }
  }

  return {
    totalSent: results.filter((r) => r.success).length,
    totalFailed: results.filter((r) => !r.success).length,
    results,
  };
}

// ============================================
// EXPORTS
// ============================================

export const DistributionChannels = {
  // VK
  postToVK,
  getVKCommunityStats,

  // WeChat
  getWeChatToken,
  sendWeChatMassMessage,

  // Telegram
  postToTelegram,

  // Unified
  distributeAcrossPlatforms,
};

export default DistributionChannels;
