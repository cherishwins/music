# x402 Facilitator Service

**BE THE INFRASTRUCTURE.**

Run your own x402 payment facilitator. Verify and settle payments on-chain. Earn fees from every transaction.

## Why Run a Facilitator?

- **Earn fees** on every payment (configurable %)
- **Control your infrastructure** - don't depend on Coinbase
- **Build reputation** as a trusted facilitator
- **Custom logic** - add your own validation, limits, etc.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/supported` | GET | List supported networks and schemes |
| `/verify` | POST | Verify payment payload |
| `/settle` | POST | Settle payment on-chain |
| `/health` | GET | Health check |

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your private key

# Run locally
pnpm dev

# Build for production
pnpm build
pnpm start
```

## Configuration

Create `.env`:

```bash
# Port to run on
PORT=4022

# Your wallet private key (needs ETH for gas)
EVM_PRIVATE_KEY=0x...

# Fee percentage (0.1 = 0.1%)
FEE_PERCENTAGE=0.1

# RPC URLs (optional, has defaults)
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASE_MAINNET_RPC=https://mainnet.base.org
```

## Supported Networks

- **Base Sepolia** (testnet) - `eip155:84532`
- **Base Mainnet** - `eip155:8453`

## Adding to Your App

Point your x402 middleware to your facilitator:

```typescript
// In your app
import { paymentMiddleware } from "@x402/next";

export default paymentMiddleware({
  "POST /api/generate/music": {
    price: "$0.50",
    network: "base",
    currency: "USDC",
  }
}, {
  facilitator: "https://your-facilitator.com"  // Your facilitator URL
});
```

## Deployment

### Vercel

```bash
vercel deploy
```

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install && pnpm build
CMD ["pnpm", "start"]
```

## Revenue Model

With 0.1% fee on $100k monthly volume = **$100/month passive income**

Scale to $1M volume = **$1,000/month**

The more apps use your facilitator, the more you earn.

## Security

- Never commit your private key
- Use environment variables
- Monitor for failed settlements
- Keep gas topped up
- Set up alerts for low balance

## License

MIT
