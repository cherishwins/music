/**
 * Social Blitz - Maximum Platform Coverage
 *
 * "The more the merrier" - Every platform that generates traffic
 *
 * Tier 1 (Your network - 500k+):
 * - VK, WeChat, Telegram
 *
 * Tier 2 (Crypto degen):
 * - Twitter/X, Discord, Reddit
 *
 * Tier 3 (Visual/discovery):
 * - Pinterest, TikTok, Instagram, YouTube Shorts
 *
 * Tier 4 (Long-tail):
 * - LinkedIn, Medium, Quora, Threads
 */

// ============================================
// PINTEREST - Visual Discovery Engine
// ============================================

export interface PinterestConfig {
  accessToken: string;
  boardId?: string;
}

export interface PinterestPin {
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  boardId: string;
  altText?: string;
}

export async function createPin(
  config: PinterestConfig,
  pin: PinterestPin
): Promise<{ pinId: string; success: boolean }> {
  try {
    const response = await fetch("https://api.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board_id: pin.boardId,
        title: pin.title,
        description: pin.description,
        link: pin.link,
        media_source: {
          source_type: "image_url",
          url: pin.imageUrl,
        },
        alt_text: pin.altText || pin.description,
      }),
    });

    const data = await response.json();
    if (data.id) {
      return { pinId: data.id, success: true };
    }
    console.error("Pinterest error:", data);
    return { pinId: "", success: false };
  } catch (error) {
    console.error("Pinterest failed:", error);
    return { pinId: "", success: false };
  }
}

// ============================================
// REDDIT - Community Engagement
// ============================================

export interface RedditConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  userAgent: string;
  accessToken?: string;
  tokenExpiry?: number;
}

export interface RedditPost {
  subreddit: string;
  title: string;
  content?: string; // Text post
  url?: string; // Link post
  flair?: string;
}

async function getRedditToken(config: RedditConfig): Promise<string | null> {
  if (config.accessToken && config.tokenExpiry && Date.now() < config.tokenExpiry) {
    return config.accessToken;
  }

  try {
    const auth = Buffer.from(
      `${config.clientId}:${config.clientSecret}`
    ).toString("base64");

    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": config.userAgent,
      },
      body: `grant_type=password&username=${config.username}&password=${config.password}`,
    });

    const data = await response.json();
    if (data.access_token) {
      config.accessToken = data.access_token;
      config.tokenExpiry = Date.now() + data.expires_in * 1000;
      return data.access_token;
    }

    console.error("Reddit auth error:", data);
    return null;
  } catch (error) {
    console.error("Reddit auth failed:", error);
    return null;
  }
}

export async function postToReddit(
  config: RedditConfig,
  post: RedditPost
): Promise<{ postId: string; success: boolean }> {
  const token = await getRedditToken(config);
  if (!token) return { postId: "", success: false };

  try {
    const formData = new URLSearchParams({
      sr: post.subreddit,
      title: post.title,
      kind: post.url ? "link" : "self",
      ...(post.url ? { url: post.url } : { text: post.content || "" }),
      ...(post.flair ? { flair_text: post.flair } : {}),
    });

    const response = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": config.userAgent,
      },
      body: formData,
    });

    const data = await response.json();
    if (data.json?.data?.id) {
      return { postId: data.json.data.id, success: true };
    }

    console.error("Reddit post error:", data);
    return { postId: "", success: false };
  } catch (error) {
    console.error("Reddit post failed:", error);
    return { postId: "", success: false };
  }
}

// ============================================
// DISCORD - Community Webhooks
// ============================================

export interface DiscordWebhook {
  url: string;
  name?: string;
}

export interface DiscordMessage {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    image?: { url: string };
    thumbnail?: { url: string };
    footer?: { text: string };
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  }>;
  components?: Array<{
    type: 1;
    components: Array<{
      type: 2;
      style: 5; // Link button
      label: string;
      url: string;
    }>;
  }>;
}

export async function postToDiscord(
  webhook: DiscordWebhook,
  message: DiscordMessage
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: webhook.name || "White Tiger",
        ...message,
      }),
    });

    return { success: response.ok };
  } catch (error) {
    console.error("Discord webhook failed:", error);
    return { success: false };
  }
}

// ============================================
// TWITTER/X - Crypto Twitter
// ============================================

export interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
  bearerToken?: string;
}

export interface Tweet {
  text: string;
  mediaIds?: string[];
  replyToId?: string;
  quoteTweetId?: string;
}

// Twitter v2 API requires OAuth 1.0a signature
// For production, use twitter-api-v2 library
export async function postTweet(
  config: TwitterConfig,
  tweet: Tweet
): Promise<{ tweetId: string; success: boolean }> {
  // Using Bearer token for simplicity (requires elevated access)
  if (!config.bearerToken) {
    console.warn("Twitter: Bearer token required for v2 API");
    return { tweetId: "", success: false };
  }

  try {
    const payload: Record<string, unknown> = {
      text: tweet.text,
    };

    if (tweet.mediaIds?.length) {
      payload.media = { media_ids: tweet.mediaIds };
    }
    if (tweet.replyToId) {
      payload.reply = { in_reply_to_tweet_id: tweet.replyToId };
    }
    if (tweet.quoteTweetId) {
      payload.quote_tweet_id = tweet.quoteTweetId;
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.data?.id) {
      return { tweetId: data.data.id, success: true };
    }

    console.error("Twitter error:", data);
    return { tweetId: "", success: false };
  } catch (error) {
    console.error("Twitter failed:", error);
    return { tweetId: "", success: false };
  }
}

// ============================================
// MEDIUM - Long-form Content
// ============================================

export interface MediumConfig {
  integrationToken: string;
  authorId?: string;
}

export interface MediumPost {
  title: string;
  content: string; // HTML or Markdown
  contentFormat: "html" | "markdown";
  tags?: string[];
  publishStatus?: "public" | "draft" | "unlisted";
  canonicalUrl?: string;
}

export async function postToMedium(
  config: MediumConfig,
  post: MediumPost
): Promise<{ postId: string; url: string; success: boolean }> {
  try {
    // First get author ID if not cached
    if (!config.authorId) {
      const meResponse = await fetch("https://api.medium.com/v1/me", {
        headers: {
          Authorization: `Bearer ${config.integrationToken}`,
        },
      });
      const meData = await meResponse.json();
      config.authorId = meData.data?.id;
    }

    if (!config.authorId) {
      return { postId: "", url: "", success: false };
    }

    const response = await fetch(
      `https://api.medium.com/v1/users/${config.authorId}/posts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.integrationToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: post.title,
          contentFormat: post.contentFormat,
          content: post.content,
          tags: post.tags || [],
          publishStatus: post.publishStatus || "public",
          canonicalUrl: post.canonicalUrl,
        }),
      }
    );

    const data = await response.json();
    if (data.data?.id) {
      return {
        postId: data.data.id,
        url: data.data.url,
        success: true,
      };
    }

    console.error("Medium error:", data);
    return { postId: "", url: "", success: false };
  } catch (error) {
    console.error("Medium failed:", error);
    return { postId: "", url: "", success: false };
  }
}

// ============================================
// YOUTUBE SHORTS - Video Reach
// ============================================

// YouTube upload requires OAuth2 flow and youtube-upload library
// Placeholder for integration pattern
export interface YouTubeConfig {
  accessToken: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

export interface YouTubeShort {
  title: string;
  description: string;
  videoPath: string;
  tags?: string[];
  thumbnailPath?: string;
}

export async function uploadYouTubeShort(
  _config: YouTubeConfig,
  _short: YouTubeShort
): Promise<{ videoId: string; success: boolean }> {
  // YouTube Data API v3 requires resumable upload
  // Use @googleapis/youtube library in production
  console.warn("YouTube upload requires googleapis library - implement with resumable upload");
  return { videoId: "", success: false };
}

// ============================================
// LINKEDIN - B2B Reach
// ============================================

export interface LinkedInConfig {
  accessToken: string;
  personUrn?: string; // urn:li:person:xxxxx
  organizationUrn?: string; // urn:li:organization:xxxxx
}

export interface LinkedInPost {
  text: string;
  imageUrl?: string;
  articleUrl?: string;
  visibility?: "PUBLIC" | "CONNECTIONS";
}

export async function postToLinkedIn(
  config: LinkedInConfig,
  post: LinkedInPost
): Promise<{ postId: string; success: boolean }> {
  // Get author URN (person or org)
  const authorUrn = config.organizationUrn || config.personUrn;
  if (!authorUrn) {
    // Fetch profile to get person URN
    try {
      const meResponse = await fetch("https://api.linkedin.com/v2/me", {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      });
      const meData = await meResponse.json();
      config.personUrn = `urn:li:person:${meData.id}`;
    } catch {
      return { postId: "", success: false };
    }
  }

  try {
    const payload: Record<string, unknown> = {
      author: config.personUrn || config.organizationUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: post.text,
          },
          shareMediaCategory: post.articleUrl
            ? "ARTICLE"
            : post.imageUrl
              ? "IMAGE"
              : "NONE",
          ...(post.articleUrl
            ? {
                media: [
                  {
                    status: "READY",
                    originalUrl: post.articleUrl,
                  },
                ],
              }
            : {}),
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": post.visibility || "PUBLIC",
      },
    };

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.id) {
      return { postId: data.id, success: true };
    }

    console.error("LinkedIn error:", data);
    return { postId: "", success: false };
  } catch (error) {
    console.error("LinkedIn failed:", error);
    return { postId: "", success: false };
  }
}

// ============================================
// THREADS (Meta) - Instagram spinoff
// ============================================

export interface ThreadsConfig {
  accessToken: string;
  userId: string;
}

export interface ThreadsPost {
  text: string;
  mediaType?: "TEXT" | "IMAGE" | "VIDEO";
  imageUrl?: string;
  videoUrl?: string;
}

export async function postToThreads(
  config: ThreadsConfig,
  post: ThreadsPost
): Promise<{ postId: string; success: boolean }> {
  try {
    // Step 1: Create media container
    const createParams = new URLSearchParams({
      media_type: post.mediaType || "TEXT",
      text: post.text,
      access_token: config.accessToken,
    });

    if (post.imageUrl) {
      createParams.set("image_url", post.imageUrl);
    }
    if (post.videoUrl) {
      createParams.set("video_url", post.videoUrl);
    }

    const createResponse = await fetch(
      `https://graph.threads.net/v1.0/${config.userId}/threads?${createParams}`,
      { method: "POST" }
    );
    const createData = await createResponse.json();

    if (!createData.id) {
      console.error("Threads create error:", createData);
      return { postId: "", success: false };
    }

    // Step 2: Publish the container
    const publishResponse = await fetch(
      `https://graph.threads.net/v1.0/${config.userId}/threads_publish?creation_id=${createData.id}&access_token=${config.accessToken}`,
      { method: "POST" }
    );
    const publishData = await publishResponse.json();

    if (publishData.id) {
      return { postId: publishData.id, success: true };
    }

    console.error("Threads publish error:", publishData);
    return { postId: "", success: false };
  } catch (error) {
    console.error("Threads failed:", error);
    return { postId: "", success: false };
  }
}

// ============================================
// BLITZ COORDINATOR - FIRE EVERYWHERE
// ============================================

export interface BlitzConfig {
  pinterest?: PinterestConfig;
  reddit?: RedditConfig;
  discord?: DiscordWebhook[];
  twitter?: TwitterConfig;
  medium?: MediumConfig;
  youtube?: YouTubeConfig;
  linkedin?: LinkedInConfig;
  threads?: ThreadsConfig;
}

export interface BlitzContent {
  // Short form
  shortText: string; // Twitter, Threads (280 chars)
  mediumText: string; // Reddit, Discord, LinkedIn (500 chars)

  // Long form
  title?: string;
  longContent?: string; // Medium, blog

  // Visual
  imageUrl?: string;
  videoUrl?: string;
  gifUrl?: string;

  // Metadata
  link?: string;
  tags?: string[];
  token?: string;
  campaign?: string;
}

export interface BlitzTargets {
  pinterest?: { boardId: string }[];
  reddit?: { subreddit: string; flair?: string }[];
  discord?: boolean; // Use all configured webhooks
  twitter?: boolean;
  medium?: boolean;
  linkedin?: boolean;
  threads?: boolean;
}

/**
 * FIRE CONTENT TO ALL PLATFORMS
 */
export async function executeBlitz(
  config: BlitzConfig,
  content: BlitzContent,
  targets: BlitzTargets
): Promise<{
  total: number;
  success: number;
  failed: number;
  results: Array<{
    platform: string;
    target: string;
    success: boolean;
    id?: string;
    error?: string;
  }>;
}> {
  const results: Array<{
    platform: string;
    target: string;
    success: boolean;
    id?: string;
    error?: string;
  }> = [];

  // Pinterest
  if (targets.pinterest && config.pinterest) {
    for (const board of targets.pinterest) {
      const result = await createPin(config.pinterest, {
        title: content.title || content.shortText.slice(0, 100),
        description: content.mediumText,
        link: content.link || "",
        imageUrl: content.imageUrl || "",
        boardId: board.boardId,
      });
      results.push({
        platform: "pinterest",
        target: board.boardId,
        success: result.success,
        id: result.pinId,
      });
    }
  }

  // Reddit
  if (targets.reddit && config.reddit) {
    for (const sub of targets.reddit) {
      const result = await postToReddit(config.reddit, {
        subreddit: sub.subreddit,
        title: content.title || content.shortText,
        content: content.mediumText,
        url: content.link,
        flair: sub.flair,
      });
      results.push({
        platform: "reddit",
        target: sub.subreddit,
        success: result.success,
        id: result.postId,
      });
    }
  }

  // Discord
  if (targets.discord && config.discord) {
    for (const webhook of config.discord) {
      const result = await postToDiscord(webhook, {
        content: content.mediumText,
        embeds: content.imageUrl
          ? [
              {
                title: content.title,
                description: content.shortText,
                url: content.link,
                image: { url: content.imageUrl },
                color: 0x8b5cf6, // Tiger purple
              },
            ]
          : undefined,
        components: content.link
          ? [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    style: 5,
                    label: "Check it out",
                    url: content.link,
                  },
                ],
              },
            ]
          : undefined,
      });
      results.push({
        platform: "discord",
        target: webhook.name || "webhook",
        success: result.success,
      });
    }
  }

  // Twitter
  if (targets.twitter && config.twitter) {
    const result = await postTweet(config.twitter, {
      text: content.shortText,
    });
    results.push({
      platform: "twitter",
      target: "feed",
      success: result.success,
      id: result.tweetId,
    });
  }

  // Medium (long-form)
  if (targets.medium && config.medium && content.longContent) {
    const result = await postToMedium(config.medium, {
      title: content.title || content.shortText.slice(0, 100),
      content: content.longContent,
      contentFormat: "markdown",
      tags: content.tags,
    });
    results.push({
      platform: "medium",
      target: "blog",
      success: result.success,
      id: result.postId,
    });
  }

  // LinkedIn
  if (targets.linkedin && config.linkedin) {
    const result = await postToLinkedIn(config.linkedin, {
      text: content.mediumText,
      articleUrl: content.link,
    });
    results.push({
      platform: "linkedin",
      target: "feed",
      success: result.success,
      id: result.postId,
    });
  }

  // Threads
  if (targets.threads && config.threads) {
    const result = await postToThreads(config.threads, {
      text: content.shortText,
      mediaType: content.imageUrl ? "IMAGE" : "TEXT",
      imageUrl: content.imageUrl,
    });
    results.push({
      platform: "threads",
      target: "feed",
      success: result.success,
      id: result.postId,
    });
  }

  const success = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return {
    total: results.length,
    success,
    failed,
    results,
  };
}

// ============================================
// EXPORTS
// ============================================

export const SocialBlitz = {
  // Individual platforms
  createPin,
  postToReddit,
  postToDiscord,
  postTweet,
  postToMedium,
  uploadYouTubeShort,
  postToLinkedIn,
  postToThreads,

  // Unified blitz
  executeBlitz,
};

export default SocialBlitz;
