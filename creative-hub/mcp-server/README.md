# White Tiger MCP Server

> AI Music Generation for Claude Desktop and AI Agents

Generate viral phonk, trap, and hip-hop tracks directly from Claude. Powered by the White Tiger viral intelligence engine analyzing 4,800+ hit tracks.

## Installation

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "white-tiger": {
      "command": "npx",
      "args": ["@whitetiger/mcp-music"]
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add white-tiger-mcp
```

### Manual Installation

```bash
npm install -g @whitetiger/mcp-music
white-tiger-mcp
```

## Tools

### `generate_music`

Create AI music tracks in various styles.

```
Generate a phonk beat for my meme coin launch
```

**Parameters:**
- `prompt` (required): Description of the music
- `style`: phonk, kphonk, trap, drill, lofi, boom_bap, hyperpop, rnb
- `duration_seconds`: 3-180 (default: 60)

**Cost:** $0.50 per track via x402 micropayment

---

### `generate_viral_lyrics`

Create lyrics optimized for TikTok virality using Loop-First design.

```
Write viral lyrics about diamond hands and moon missions
```

**Parameters:**
- `theme` (required): Topic/mood for the lyrics
- `style`: phonk, kphonk, trap, drill (viral-optimized)
- `target_viral_score`: 0-100 (default: 50)
- `include_music`: Generate music too (costs $0.50)

**Cost:** Free for lyrics, $0.50 if including music

---

### `get_styles`

List all available music styles with descriptions.

```
What music styles are available?
```

---

### `check_viral_score`

Analyze lyrics for viral potential.

```
Check the viral score of these lyrics: [paste lyrics]
```

**Returns:**
- Overall score (0-100)
- Repetition ratio
- Hook score
- Short line ratio
- Assessment and recommendations

## Viral Intelligence

White Tiger uses research-backed viral optimization:

| Metric | Viral Target | Why It Matters |
|--------|--------------|----------------|
| Repetition Ratio | 40%+ | Earworm effect |
| Hook Score | 5+ | Catchiness |
| Short Line Ratio | 60%+ | TikTok pacing |

**Research findings:**
- Viral tracks have 3x more word repetition
- 150x more hooks than non-viral tracks
- 84% of Billboard Global 200 went viral on TikTok first

## Pricing

| Feature | Cost |
|---------|------|
| Lyrics generation | Free |
| Viral score check | Free |
| Music generation | $0.50/track |

Payments via x402 micropayments (USDC on Base).

## Examples

### Meme Coin Anthem

```
Generate viral lyrics about a tiger-themed meme coin going to the moon, phonk style, target viral score 60
```

### Drill Beat

```
Generate music: aggressive drill beat with sliding 808s for a crypto trading montage, 30 seconds
```

### Check Your Lyrics

```
Check viral score of:
Money on my mind, money on my brain
Stack it up again, stack it up again
We don't feel the pain, we don't feel the rain
Stack it up again, stack it up again
```

## Environment Variables

```bash
# Optional: Custom API endpoint
WHITE_TIGER_API_URL=https://creative-hub-virid.vercel.app
```

## Links

- **Web App**: https://creative-hub-virid.vercel.app
- **Telegram Bot**: [@MSUCOBot](https://t.me/MSUCOBot)
- **GitHub**: https://github.com/jpanda/white-tiger-mcp

## License

MIT

---

*"First MCP server for AI music generation. No competition."* 🐯
