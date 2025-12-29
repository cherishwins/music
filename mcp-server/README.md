# Creative Hub MCP Server

AI music generation tools for Claude Desktop with x402 micropayments.

## Features

- **generate-music** - Generate AI music tracks ($0.50/track)
- **generate-album-art** - Generate album artwork ($0.10/image)
- **generate-brand** - Generate complete brand packages ($0.25/brand)
- **analyze-track** - Analyze tracks for hit potential ($0.05/analysis)

## Payment

All tools require payment via x402 protocol using USDC on Base network. Payments are handled automatically - just configure your wallet.

## Installation

```bash
npm install -g @jpanda/creative-hub-mcp
```

## Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "creative-hub": {
      "command": "npx",
      "args": ["@jpanda/creative-hub-mcp"],
      "env": {
        "WALLET_PRIVATE_KEY": "0x...",
        "CREATIVE_HUB_API": "https://creative-hub.vercel.app"
      }
    }
  }
}
```

### Getting a Wallet

1. Create a wallet on [Base network](https://base.org)
2. Fund it with USDC (Base Sepolia for testing, Base Mainnet for production)
3. Export your private key
4. Add to the config above

### Where to get USDC

- **Testnet**: Use [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)
- **Mainnet**: Buy via [Coinbase](https://coinbase.com) or bridge from Ethereum

## Usage in Claude

Once configured, just ask Claude:

> "Generate a trap beat with dark vibes and heavy 808s"

> "Create album art for a K-pop single called 'Midnight Seoul'"

> "Generate a brand for a meme coin about cats"

Claude will automatically call the tools and handle payment.

## Local Development

```bash
# Clone the repo
git clone https://github.com/jpandadev/creative-hub-mcp
cd mcp-server

# Install dependencies
pnpm install

# Build
pnpm build

# Run locally
pnpm dev
```

## Pricing

| Tool | Price | Description |
|------|-------|-------------|
| generate-music | $0.50 | Full AI music track (3s - 10min) |
| generate-album-art | $0.10 | Album artwork image |
| generate-brand | $0.25 | Name, ticker, colors, tagline, logo prompt |
| analyze-track | $0.05 | Hit potential analysis |

## Networks Supported

- Base Sepolia (testnet) - `eip155:84532`
- Base Mainnet - `eip155:8453`

## License

MIT
