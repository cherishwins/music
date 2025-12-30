#!/usr/bin/env node
/**
 * White Tiger MCP Server
 * AI Music Generation for Claude Desktop and AI Agents
 *
 * Tools:
 * - generate_music: Create viral phonk/trap/hip-hop tracks
 * - generate_viral_lyrics: Create Loop-First optimized lyrics
 * - get_styles: List available music styles
 * - check_viral_score: Analyze lyrics for viral potential
 *
 * Install: claude mcp add white-tiger-mcp
 * Or add to claude_desktop_config.json
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
// White Tiger API endpoint
const API_BASE = process.env.WHITE_TIGER_API_URL || "https://creative-hub-virid.vercel.app";
// Available music styles
const MUSIC_STYLES = {
    phonk: "Memphis-style phonk with aggressive 808s and cowbells",
    kphonk: "Korean phonk fusion with K-pop melodic hooks",
    trap: "Atlanta trap with heavy bass and hi-hats",
    drill: "UK/NY drill with sliding 808s",
    lofi: "Chill lo-fi hip hop beats",
    boom_bap: "Classic 90s hip hop production",
    hyperpop: "Experimental glitchy hyperpop",
    rnb: "Modern R&B with smooth production",
};
// Viral styles optimized for TikTok
const VIRAL_STYLES = ["phonk", "kphonk", "trap", "drill"];
const server = new Server({
    name: "white-tiger-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "generate_music",
                description: "Generate AI music track. Returns base64 audio. Costs $0.50 per track via x402 micropayment.",
                inputSchema: {
                    type: "object",
                    properties: {
                        prompt: {
                            type: "string",
                            description: "Description of the music you want (e.g., 'aggressive phonk beat for a meme coin anthem')",
                        },
                        style: {
                            type: "string",
                            enum: Object.keys(MUSIC_STYLES),
                            description: "Music style/genre",
                            default: "phonk",
                        },
                        duration_seconds: {
                            type: "number",
                            description: "Track duration in seconds (3-180)",
                            default: 60,
                        },
                    },
                    required: ["prompt"],
                },
            },
            {
                name: "generate_viral_lyrics",
                description: "Generate viral-optimized lyrics using Loop-First design. Analyzes 4,800+ viral tracks for patterns. Free to generate, costs $0.50 to create music.",
                inputSchema: {
                    type: "object",
                    properties: {
                        theme: {
                            type: "string",
                            description: "Topic/mood for the lyrics (e.g., 'meme coin moon mission', 'grinding entrepreneur')",
                        },
                        style: {
                            type: "string",
                            enum: VIRAL_STYLES,
                            description: "Music style for optimization",
                            default: "phonk",
                        },
                        target_viral_score: {
                            type: "number",
                            description: "Minimum viral score to achieve (0-100)",
                            default: 50,
                        },
                        include_music: {
                            type: "boolean",
                            description: "Also generate music track (costs $0.50)",
                            default: false,
                        },
                    },
                    required: ["theme"],
                },
            },
            {
                name: "get_styles",
                description: "List all available music styles with descriptions",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "check_viral_score",
                description: "Analyze lyrics for viral potential. Returns score 0-100 based on repetition ratio, hook density, and TikTok optimization.",
                inputSchema: {
                    type: "object",
                    properties: {
                        lyrics: {
                            type: "string",
                            description: "Lyrics to analyze",
                        },
                    },
                    required: ["lyrics"],
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "generate_music": {
                const { prompt, style = "phonk", duration_seconds = 60 } = args;
                const response = await fetch(`${API_BASE}/api/generate/music`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "WhiteTiger-MCP/1.0",
                    },
                    body: JSON.stringify({
                        mode: "prompt",
                        prompt,
                        style,
                        durationMs: duration_seconds * 1000,
                    }),
                });
                if (!response.ok) {
                    const error = await response.text();
                    // Check for x402 payment required
                    if (response.status === 402) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `Payment required: This tool costs $0.50 per track. The API returned a 402 Payment Required response. To use this tool, you need to configure x402 payment credentials.`,
                                },
                            ],
                            isError: true,
                        };
                    }
                    throw new Error(`API error: ${error}`);
                }
                const result = await response.json();
                return {
                    content: [
                        {
                            type: "text",
                            text: `Music generated successfully!\n\nStyle: ${style}\nDuration: ${duration_seconds}s\nSong ID: ${result.songId || "N/A"}\nWatermarked: ${result.isWatermarked ? "Yes (free tier)" : "No (paid)"}\n\nThe audio is available as base64 in the response. To save it, decode the base64 string to an MP3 file.`,
                        },
                    ],
                };
            }
            case "generate_viral_lyrics": {
                const { theme, style = "phonk", target_viral_score = 50, include_music = false, } = args;
                const response = await fetch(`${API_BASE}/api/generate/music`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "WhiteTiger-MCP/1.0",
                    },
                    body: JSON.stringify({
                        mode: "viral",
                        theme,
                        style,
                        targetViralScore: target_viral_score,
                        includeMusic: include_music,
                    }),
                });
                if (!response.ok) {
                    if (response.status === 402) {
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `Payment required for music generation. Lyrics generation is free, but creating the actual music track costs $0.50.`,
                                },
                            ],
                            isError: true,
                        };
                    }
                    const error = await response.text();
                    throw new Error(`API error: ${error}`);
                }
                const result = await response.json();
                let responseText = `# Viral Lyrics Generated\n\n`;
                responseText += `**Theme:** ${theme}\n`;
                responseText += `**Style:** ${style}\n`;
                responseText += `**Viral Score:** ${result.viralScore}/100\n`;
                responseText += `**Attempts:** ${result.attempts}\n\n`;
                if (result.metrics) {
                    responseText += `## Viral Metrics\n`;
                    responseText += `- Repetition Ratio: ${(result.metrics.repetitionRatio * 100).toFixed(1)}%\n`;
                    responseText += `- Hook Score: ${result.metrics.hookScore}\n`;
                    responseText += `- Short Line Ratio: ${(result.metrics.shortLineRatio * 100).toFixed(1)}%\n\n`;
                }
                responseText += `## Lyrics\n\n${result.lyrics}\n`;
                if (result.audio) {
                    responseText += `\n## Music\nMusic track generated and available as base64 MP3.`;
                }
                return {
                    content: [{ type: "text", text: responseText }],
                };
            }
            case "get_styles": {
                let text = "# Available Music Styles\n\n";
                text += "## Viral-Optimized (Best for TikTok)\n";
                for (const style of VIRAL_STYLES) {
                    text += `- **${style}**: ${MUSIC_STYLES[style]}\n`;
                }
                text += "\n## All Styles\n";
                for (const [style, description] of Object.entries(MUSIC_STYLES)) {
                    const isViral = VIRAL_STYLES.includes(style);
                    text += `- **${style}**${isViral ? " ⚡" : ""}: ${description}\n`;
                }
                text += "\n⚡ = Optimized for viral TikTok content";
                return {
                    content: [{ type: "text", text }],
                };
            }
            case "check_viral_score": {
                const { lyrics } = args;
                // Local viral score calculation (same as viral-optimizer.ts)
                const lines = lyrics.split("\n").filter((l) => l.trim());
                const words = lyrics.toLowerCase().match(/\b\w+\b/g) || [];
                // Repetition ratio
                const wordCounts = new Map();
                for (const word of words) {
                    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
                }
                const repeatedWords = Array.from(wordCounts.values()).filter((c) => c > 1);
                const repetitionRatio = repeatedWords.length / wordCounts.size;
                // Hook score (repeated phrases)
                const phrases = new Map();
                for (let i = 0; i < words.length - 2; i++) {
                    const phrase = words.slice(i, i + 3).join(" ");
                    phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
                }
                const hookScore = Array.from(phrases.values()).filter((c) => c >= 2).length;
                // Short line ratio
                const shortLines = lines.filter((l) => l.split(/\s+/).length <= 6);
                const shortLineRatio = shortLines.length / lines.length;
                // Calculate overall score
                const score = Math.min(100, Math.round(repetitionRatio * 40 + // 40% weight
                    Math.min(hookScore, 10) * 4 + // 40% weight (capped at 10 hooks)
                    shortLineRatio * 20 // 20% weight
                ));
                let text = `# Viral Score Analysis\n\n`;
                text += `**Overall Score: ${score}/100**\n\n`;
                text += `## Metrics\n`;
                text += `- Repetition Ratio: ${(repetitionRatio * 100).toFixed(1)}% (target: 40%+)\n`;
                text += `- Hook Score: ${hookScore} (target: 5+)\n`;
                text += `- Short Line Ratio: ${(shortLineRatio * 100).toFixed(1)}% (target: 60%+)\n\n`;
                text += `## Assessment\n`;
                if (score >= 60) {
                    text += `✅ Strong viral potential! These lyrics follow Loop-First design principles.`;
                }
                else if (score >= 40) {
                    text += `⚠️ Moderate viral potential. Consider adding more repetition and shorter, punchier lines.`;
                }
                else {
                    text += `❌ Low viral potential. Needs more hooks, repetition, and TikTok-friendly structure.`;
                }
                return {
                    content: [{ type: "text", text }],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("White Tiger MCP Server running on stdio");
}
main().catch(console.error);
//# sourceMappingURL=index.js.map