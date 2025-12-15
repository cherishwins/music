/**
 * n8n Workflow Integration
 *
 * This module provides hooks for triggering n8n workflows
 * to automate social media distribution and content processing.
 */

export interface N8nWebhookPayload {
  event: string;
  data: Record<string, unknown>;
  userId?: string;
  timestamp: string;
}

export interface SocialMediaPost {
  content: string;
  mediaUrls?: string[];
  platforms: SocialPlatform[];
  scheduledAt?: string;
  hashtags?: string[];
}

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "tiktok"
  | "linkedin"
  | "vk"
  | "ok"
  | "wechat"
  | "telegram";

// n8n webhook endpoints - configure these in your environment
const N8N_WEBHOOKS = {
  contentCreated: process.env.NEXT_PUBLIC_N8N_CONTENT_CREATED_WEBHOOK,
  socialDistribute: process.env.NEXT_PUBLIC_N8N_SOCIAL_DISTRIBUTE_WEBHOOK,
  userSignup: process.env.NEXT_PUBLIC_N8N_USER_SIGNUP_WEBHOOK,
  paymentComplete: process.env.NEXT_PUBLIC_N8N_PAYMENT_COMPLETE_WEBHOOK,
  analyticsEvent: process.env.NEXT_PUBLIC_N8N_ANALYTICS_WEBHOOK,
};

/**
 * Trigger an n8n webhook
 */
async function triggerWebhook(
  webhookUrl: string | undefined,
  payload: N8nWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl) {
    console.warn("n8n webhook URL not configured");
    return { success: false, error: "Webhook URL not configured" };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("n8n webhook error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Trigger content distribution to social media platforms
 */
export async function distributeToSocialMedia(
  post: SocialMediaPost,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  return triggerWebhook(N8N_WEBHOOKS.socialDistribute, {
    event: "social_distribute",
    data: {
      content: post.content,
      mediaUrls: post.mediaUrls || [],
      platforms: post.platforms,
      scheduledAt: post.scheduledAt || new Date().toISOString(),
      hashtags: post.hashtags || [],
    },
    userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify n8n when new content is created
 */
export async function notifyContentCreated(
  contentType: "music" | "slide" | "video" | "pdf",
  contentId: string,
  metadata: Record<string, unknown>,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  return triggerWebhook(N8N_WEBHOOKS.contentCreated, {
    event: "content_created",
    data: {
      contentType,
      contentId,
      ...metadata,
    },
    userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify n8n when a user signs up
 */
export async function notifyUserSignup(
  userId: string,
  userData: {
    telegramId?: number;
    username?: string;
    source?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  return triggerWebhook(N8N_WEBHOOKS.userSignup, {
    event: "user_signup",
    data: userData,
    userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify n8n when a payment is completed
 */
export async function notifyPaymentComplete(
  userId: string,
  paymentData: {
    planId: string;
    amount: number;
    currency: "XTR" | "TON";
    credits: number;
    transactionId?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  return triggerWebhook(N8N_WEBHOOKS.paymentComplete, {
    event: "payment_complete",
    data: paymentData,
    userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track analytics events via n8n
 */
export async function trackAnalyticsEvent(
  eventName: string,
  eventData: Record<string, unknown>,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  return triggerWebhook(N8N_WEBHOOKS.analyticsEvent, {
    event: eventName,
    data: eventData,
    userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Social media platform configurations for n8n workflows
 */
export const PLATFORM_CONFIGS: Record<
  SocialPlatform,
  {
    name: string;
    maxLength: number;
    supportsMedia: boolean;
    supportsScheduling: boolean;
  }
> = {
  instagram: {
    name: "Instagram",
    maxLength: 2200,
    supportsMedia: true,
    supportsScheduling: true,
  },
  facebook: {
    name: "Facebook",
    maxLength: 63206,
    supportsMedia: true,
    supportsScheduling: true,
  },
  twitter: {
    name: "X (Twitter)",
    maxLength: 280,
    supportsMedia: true,
    supportsScheduling: true,
  },
  tiktok: {
    name: "TikTok",
    maxLength: 2200,
    supportsMedia: true,
    supportsScheduling: false,
  },
  linkedin: {
    name: "LinkedIn",
    maxLength: 3000,
    supportsMedia: true,
    supportsScheduling: true,
  },
  vk: {
    name: "VK",
    maxLength: 15000,
    supportsMedia: true,
    supportsScheduling: true,
  },
  ok: {
    name: "Odnoklassniki",
    maxLength: 5000,
    supportsMedia: true,
    supportsScheduling: false,
  },
  wechat: {
    name: "WeChat",
    maxLength: 2000,
    supportsMedia: true,
    supportsScheduling: false,
  },
  telegram: {
    name: "Telegram",
    maxLength: 4096,
    supportsMedia: true,
    supportsScheduling: true,
  },
};
