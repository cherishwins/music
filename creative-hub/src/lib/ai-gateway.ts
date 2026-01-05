/**
 * Unified AI Gateway - Cross-App Intelligence Layer
 *
 * Leverages Vercel AI Gateway ($20 credit) for access to:
 * - xAI Grok (text, vision, reasoning)
 * - Google Gemini (fast, multimodal)
 * - Anthropic Claude (complex reasoning)
 * - OpenAI (GPT-4, embeddings)
 *
 * Combined with:
 * - ElevenLabs (voice, music, sound effects)
 * - Qdrant (vector search, semantic memory)
 * - Turso (structured data, user context)
 *
 * This is the brain for all jpanda-network apps.
 */

import { generateText, generateObject, gateway } from "ai";
import { z } from "zod";

// ============================================
// MODEL CONFIGURATION
// ============================================

// Best models for different tasks (cost-optimized)
export const MODELS = {
  // Fast & cheap - general queries
  fast: "xai/grok-4.1-fast-non-reasoning",

  // Reasoning - complex analysis
  reasoning: "xai/grok-4.1-fast-reasoning",

  // Vision - image analysis
  vision: "xai/grok-4.1-vision",

  // Multimodal fast - Gemini
  gemini: "google/gemini-2.0-flash",

  // Complex reasoning - Claude
  claude: "anthropic/claude-3-5-haiku",

  // Embeddings
  embeddings: "openai/text-embedding-3-small",
} as const;

export type ModelId = keyof typeof MODELS;

// ============================================
// CORE AI FUNCTIONS
// ============================================

/**
 * Generate text response with context
 */
export async function ask(
  prompt: string,
  options: {
    model?: ModelId;
    systemPrompt?: string;
    temperature?: number;
  } = {}
): Promise<string> {
  const modelId = MODELS[options.model || "fast"];

  const result = await generateText({
    model: gateway(modelId),
    system: options.systemPrompt || "You are a helpful AI assistant for the JPanda Network ecosystem.",
    prompt,
    temperature: options.temperature ?? 0.7,
  });

  return result.text;
}

/**
 * Generate structured data (JSON) with type safety
 */
export async function generate<T extends z.ZodType>(
  prompt: string,
  schema: T,
  options: {
    model?: ModelId;
    systemPrompt?: string;
  } = {}
): Promise<z.infer<T>> {
  const modelId = MODELS[options.model || "fast"];

  const result = await generateObject({
    model: gateway(modelId),
    system: options.systemPrompt || "Generate structured data as requested.",
    prompt,
    schema,
  });

  return result.object as z.infer<T>;
}

/**
 * Analyze an image
 */
export async function analyzeImage(
  imageUrl: string,
  question: string,
  options: {
    detailed?: boolean;
  } = {}
): Promise<string> {
  const result = await generateText({
    model: gateway(MODELS.vision),
    messages: [
      {
        role: "user",
        content: [
          { type: "image", image: imageUrl },
          {
            type: "text",
            text: options.detailed
              ? `Analyze this image in detail: ${question}`
              : question,
          },
        ],
      },
    ],
  });

  return result.text;
}

// ============================================
// SPECIALIZED FUNCTIONS FOR ECOSYSTEM
// ============================================

/**
 * Meme coin brand analysis
 * Used by: creative-hub, blockburnnn
 */
export async function analyzeMemeCoin(params: {
  name: string;
  ticker: string;
  description?: string;
  imageUrl?: string;
}): Promise<{
  sentiment: "bullish" | "bearish" | "neutral";
  viralPotential: number;
  communityAppeal: string[];
  suggestedHashtags: string[];
  concerns: string[];
}> {
  const schema = z.object({
    sentiment: z.enum(["bullish", "bearish", "neutral"]),
    viralPotential: z.number().min(0).max(100),
    communityAppeal: z.array(z.string()),
    suggestedHashtags: z.array(z.string()),
    concerns: z.array(z.string()),
  });

  const prompt = `Analyze this meme coin for viral potential and community appeal:
Name: ${params.name}
Ticker: ${params.ticker}
${params.description ? `Description: ${params.description}` : ""}

Consider: branding strength, ticker memorability, meme potential, and crypto Twitter appeal.`;

  return generate(prompt, schema, { model: "reasoning" });
}

/**
 * Lyrics viral analysis
 * Used by: creative-hub
 */
export async function analyzeLyricsVirality(lyrics: string): Promise<{
  hookScore: number;
  repetitionRatio: number;
  tiktokPotential: number;
  suggestedChops: string[];
  viralLines: string[];
}> {
  const schema = z.object({
    hookScore: z.number().min(0).max(100),
    repetitionRatio: z.number().min(0).max(1),
    tiktokPotential: z.number().min(0).max(100),
    suggestedChops: z.array(z.string()),
    viralLines: z.array(z.string()),
  });

  const prompt = `Analyze these lyrics for TikTok viral potential:

${lyrics}

Identify: catchy hooks, repeatable phrases, 15-second chop opportunities, and lines that would work as audio memes.`;

  return generate(prompt, schema, { model: "reasoning" });
}

/**
 * Finance insight generation
 * Used by: 1929-world
 */
export async function generateFinanceInsight(params: {
  topic: string;
  dataPoints?: Record<string, number>;
}): Promise<{
  headline: string;
  summary: string;
  keyTakeaways: string[];
  historicalContext: string;
  actionableInsight: string;
}> {
  const schema = z.object({
    headline: z.string(),
    summary: z.string(),
    keyTakeaways: z.array(z.string()),
    historicalContext: z.string(),
    actionableInsight: z.string(),
  });

  const prompt = `Generate a finance insight for 1929.world about: ${params.topic}
${params.dataPoints ? `\nData: ${JSON.stringify(params.dataPoints)}` : ""}

Style: Bloomberg meets crypto Twitter - authoritative but accessible.`;

  return generate(prompt, schema, { model: "reasoning" });
}

/**
 * Rug score explanation
 * Used by: blockburnnn
 */
export async function explainRugScore(params: {
  token: string;
  score: number;
  factors: Record<string, number>;
}): Promise<{
  summary: string;
  redFlags: string[];
  greenFlags: string[];
  recommendation: string;
  riskLevel: "safe" | "caution" | "danger";
}> {
  const schema = z.object({
    summary: z.string(),
    redFlags: z.array(z.string()),
    greenFlags: z.array(z.string()),
    recommendation: z.string(),
    riskLevel: z.enum(["safe", "caution", "danger"]),
  });

  const prompt = `Explain this rug score for ${params.token}:
Score: ${params.score}/100
Factors: ${JSON.stringify(params.factors)}

Provide a human-readable explanation of the risks and safety.`;

  return generate(prompt, schema, { model: "fast" });
}

// ============================================
// VOICE AI ASSISTANT
// ============================================

/**
 * Voice AI response generation
 * Optimized for conversational, spoken delivery
 */
export async function generateVoiceResponse(params: {
  userMessage: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  context?: {
    app: string;
    userTier?: string;
    recentActivity?: string[];
  };
}): Promise<{
  text: string;
  shouldSpeak: boolean;
  suggestedActions?: string[];
}> {
  const schema = z.object({
    text: z.string(),
    shouldSpeak: z.boolean(),
    suggestedActions: z.array(z.string()).optional(),
  });

  const systemPrompt = `You are the White Tiger AI assistant for JPanda Network.
You respond in a conversational, friendly tone optimized for voice synthesis.
Keep responses concise (under 150 words) for natural speech.
${params.context ? `\nUser context: App: ${params.context.app}, Tier: ${params.context.userTier || "free"}` : ""}`;

  const messages = params.conversationHistory || [];
  messages.push({ role: "user", content: params.userMessage });

  const prompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");

  return generate(prompt, schema, {
    model: "fast",
    systemPrompt,
  });
}

// ============================================
// EMBEDDINGS & SEMANTIC SEARCH
// ============================================

// Note: Embeddings require direct OpenAI/provider SDK calls
// The gateway() function returns LanguageModel, not EmbeddingModel
// Use the Qdrant library directly for embeddings in production

/**
 * Generate embeddings for text using fetch to OpenAI API
 * For storing in Qdrant
 */
export async function getEmbedding(text: string): Promise<number[]> {
  // For now, use a simple hash-based placeholder
  // In production, call OpenAI embeddings API directly
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Return 1536-dim vector (OpenAI text-embedding-3-small size)
  const vector = new Array(1536).fill(0).map((_, i) =>
    hashArray[i % hashArray.length] / 255 - 0.5
  );
  return vector;
}

/**
 * Generate embeddings for multiple texts
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map(getEmbedding));
}

// ============================================
// WHATSAPP VOICE ASSISTANT INTEGRATION
// ============================================

/**
 * Process WhatsApp voice message
 * Combines speech-to-text → AI response → text-to-speech
 */
export async function processWhatsAppVoice(params: {
  audioBase64: string;
  audioFormat: "ogg" | "mp3" | "wav";
  userId: string;
  phoneNumber: string;
}): Promise<{
  responseText: string;
  responseAudioBase64: string;
  shouldFollowUp: boolean;
}> {
  // This would integrate with:
  // 1. Whisper/other STT for transcription
  // 2. AI Gateway for response
  // 3. ElevenLabs for TTS

  // For now, return a placeholder showing the architecture
  const response = await generateVoiceResponse({
    userMessage: "[Transcribed voice message would go here]",
    context: { app: "whatsapp" },
  });

  return {
    responseText: response.text,
    responseAudioBase64: "", // Would be ElevenLabs audio
    shouldFollowUp: false,
  };
}

// ============================================
// COST TRACKING
// ============================================

// Approximate costs per 1M tokens (input/output)
export const MODEL_COSTS = {
  "xai/grok-4.1-fast-non-reasoning": { input: 0.2, output: 0.5 },
  "xai/grok-4.1-fast-reasoning": { input: 0.5, output: 2.0 },
  "xai/grok-4.1-vision": { input: 1.0, output: 2.0 },
  "google/gemini-2.0-flash": { input: 0.075, output: 0.3 },
  "anthropic/claude-3-5-haiku": { input: 0.25, output: 1.25 },
  "openai/text-embedding-3-small": { input: 0.02, output: 0 },
};

/**
 * Estimate cost for a request
 */
export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS];
  if (!costs) return 0;

  return (
    (inputTokens / 1_000_000) * costs.input +
    (outputTokens / 1_000_000) * costs.output
  );
}
