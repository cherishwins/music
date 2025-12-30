#!/usr/bin/env node
/**
 * Creative Hub MCP Server
 * AI music generation tools with x402 micropayments
 *
 * Claude Desktop users can:
 * - Generate music tracks ($0.50 per track)
 * - Generate album artwork ($0.10 per image)
 * - Generate brand packages ($0.25 per brand)
 * - Analyze tracks for hit potential ($0.05 per analysis)
 *
 * Payments are handled automatically via x402 protocol.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";
import { privateKeyToAccount } from "viem/accounts";

// Configuration
const CREATIVE_HUB_API = process.env.CREATIVE_HUB_API || "https://creative-hub.vercel.app";
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

// Tool definitions with pricing
const TOOLS = [
  {
    name: "generate-music",
    description: "Generate an AI music track. Costs $0.50 in USDC via x402.",
    inputSchema: {
      type: "object" as const,
      properties: {
        prompt: {
          type: "string",
          description: "Description of the music to generate (min 10 chars)",
        },
        style: {
          type: "string",
          enum: ["trap", "hiphop", "kpop", "ambient", "electronic", "cinematic", "pop", "rock", "rnb", "lofi", "drill"],
          description: "Music style/genre",
        },
        durationMs: {
          type: "number",
          description: "Duration in milliseconds (3000-600000)",
          default: 60000,
        },
        instrumental: {
          type: "boolean",
          description: "Generate instrumental only (no vocals)",
          default: false,
        },
      },
      required: ["prompt"],
    },
    price: "$0.50",
  },
  {
    name: "generate-album-art",
    description: "Generate AI album artwork. Costs $0.10 in USDC via x402.",
    inputSchema: {
      type: "object" as const,
      properties: {
        prompt: {
          type: "string",
          description: "Description of the album artwork (min 5 chars)",
        },
        style: {
          type: "string",
          enum: ["trap", "kpop", "underground", "luxury", "retro", "korean"],
          description: "Art style preset",
        },
        artistName: {
          type: "string",
          description: "Artist name for context",
        },
        trackTitle: {
          type: "string",
          description: "Track title for context",
        },
      },
      required: ["prompt"],
    },
    price: "$0.10",
  },
  {
    name: "generate-brand",
    description: "Generate a complete brand package (name, ticker, colors, tagline). Costs $0.25 in USDC via x402.",
    inputSchema: {
      type: "object" as const,
      properties: {
        concept: {
          type: "string",
          description: "Brand concept description (min 3 chars)",
        },
        tier: {
          type: "string",
          enum: ["standard", "outlier", "1929", "juche"],
          description: "Brand style tier",
          default: "standard",
        },
      },
      required: ["concept"],
    },
    price: "$0.25",
  },
  {
    name: "analyze-track",
    description: "Analyze a track for hit potential. Costs $0.05 in USDC via x402.",
    inputSchema: {
      type: "object" as const,
      properties: {
        audioUrl: {
          type: "string",
          description: "URL to the audio file to analyze",
        },
      },
      required: ["audioUrl"],
    },
    price: "$0.05",
  },
];

// Create API client with x402 payment interceptor
function createPaymentClient(): AxiosInstance {
  const client = axios.create({
    baseURL: CREATIVE_HUB_API,
    timeout: 120000, // 2 minutes for generation
  });

  // Add x402 payment interceptor
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 402) {
        // Payment required - handle x402 flow
        const paymentRequired = error.response.headers["x-payment-required"];

        if (!paymentRequired) {
          throw new Error("Payment required but no payment details provided");
        }

        if (!WALLET_PRIVATE_KEY) {
          throw new Error(
            "WALLET_PRIVATE_KEY not configured. Set it in your MCP server config."
          );
        }

        // Parse payment requirements
        const requirements = JSON.parse(
          Buffer.from(paymentRequired, "base64").toString()
        );

        // Sign payment with wallet
        const account = privateKeyToAccount(WALLET_PRIVATE_KEY as `0x${string}`);
        const payment = await signPayment(account, requirements.accepts[0]);

        // Retry request with payment
        const config = error.config;
        config.headers["X-PAYMENT"] = payment;
        return client.request(config);
      }
      throw error;
    }
  );

  return client;
}

// Sign x402 payment
async function signPayment(
  account: ReturnType<typeof privateKeyToAccount>,
  requirement: {
    payTo: string;
    maxAmountRequired: string;
    asset: string;
    network: string;
  }
): Promise<string> {
  // Construct payment payload
  const payload = {
    scheme: "exact",
    network: requirement.network,
    payload: {
      signature: "", // Will be filled
      authorization: {
        from: account.address,
        to: requirement.payTo,
        value: requirement.maxAmountRequired,
        validAfter: Math.floor(Date.now() / 1000) - 60,
        validBefore: Math.floor(Date.now() / 1000) + 300,
        nonce: `0x${Math.random().toString(16).slice(2)}`,
      },
    },
  };

  // Sign the authorization
  const message = JSON.stringify(payload.payload.authorization);
  const signature = await account.signMessage({ message });
  payload.payload.signature = signature;

  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// Main server
async function main() {
  const server = new Server(
    {
      name: "creative-hub-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const apiClient = createPaymentClient();

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOLS.map((tool) => ({
        name: tool.name,
        description: `${tool.description}`,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "generate-music": {
          const response = await apiClient.post("/api/generate/music", {
            mode: "prompt",
            prompt: args?.prompt,
            style: args?.style || "trap",
            durationMs: args?.durationMs || 60000,
            instrumental: args?.instrumental || false,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  message: "Music generated successfully!",
                  style: response.data.style,
                  format: response.data.format,
                  audioBase64Length: response.data.audio?.length || 0,
                  // Don't return full audio in text - it's too large
                  // Client can request the audio separately
                }),
              },
            ],
          };
        }

        case "generate-album-art": {
          const response = await apiClient.post("/api/generate/album-art", {
            prompt: args?.prompt,
            style: args?.style,
            artistName: args?.artistName,
            trackTitle: args?.trackTitle,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  imageUrl: response.data.imageUrl,
                  downloadUrl: response.data.downloadUrl,
                  style: response.data.style,
                }),
              },
            ],
          };
        }

        case "generate-brand": {
          const response = await apiClient.post("/api/generate/brand", {
            concept: args?.concept,
            tier: args?.tier || "standard",
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  brand: response.data.brand,
                  tier: response.data.tier,
                }),
              },
            ],
          };
        }

        case "analyze-track": {
          // For now, return a placeholder since we haven't built the analysis endpoint
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  message: "Track analysis endpoint coming soon!",
                  audioUrl: args?.audioUrl,
                }),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: true, message }),
          },
        ],
        isError: true,
      };
    }
  });

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Creative Hub MCP Server running");
}

main().catch(console.error);
