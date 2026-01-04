# Self-Sovereign Payments - Complete Guide

> **You control everything. No middlemen. No service providers. Your keys, your money.**

Last Updated: January 3, 2026

---

## What We Built

A complete payment system where:
- Users pay with USDC on Base blockchain
- Money goes directly to YOUR wallet
- YOU verify payments on-chain
- No Stripe, no PayPal, no facilitators, no fees to anyone but gas

---

## How It Works (Plain English)

### The Flow

```
1. User visits /pay page
2. User connects their Coinbase Wallet
3. User picks a product ($0.50 music track, etc.)
4. User clicks "Pay"
5. Their wallet asks them to sign a USDC transfer
6. USDC moves from their wallet → YOUR wallet
7. Our backend checks the blockchain to confirm
8. We deliver their content
```

### Why This Matters

- **Traditional payments**: User → Stripe (3% fee) → Your bank (days later)
- **Our payments**: User → Your wallet (instant, ~$0.001 gas)

---

## Step-by-Step Setup

### Step 1: Get Test Money (5 minutes)

Before testing, you need testnet tokens:

1. **Get Base Sepolia ETH** (for gas)
   - Go to: https://www.coinbase.com/faucets/base-sepolia
   - Enter your wallet address
   - Get free test ETH

2. **Get Base Sepolia USDC** (for payments)
   - USDC contract: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
   - Use Uniswap on Base Sepolia or find a faucet
   - Or bridge from another testnet

### Step 2: Understand the Files

| File | What It Does |
|------|--------------|
| `src/lib/wallet-config.ts` | Your wallet address & product prices |
| `src/components/payments/wallet-button.tsx` | The "Connect Wallet" button |
| `src/components/payments/usdc-payment.tsx` | The payment form |
| `src/app/api/payments/verify/route.ts` | Checks blockchain for payment |
| `src/app/pay/page.tsx` | The payment page users see |

### Step 3: Configure Your Wallet

Edit `src/lib/wallet-config.ts`:

```typescript
// This is YOUR wallet - where all payments go
export const TREASURY_ADDRESS = "0x14E6076eAC2420e56b4E2E18c815b2DD52264D54" as const;
```

Change this to your own wallet address if different.

### Step 4: Set Your Prices

In the same file, edit `PRODUCTS`:

```typescript
export const PRODUCTS = {
  music_track: {
    name: "AI Music Track",
    description: "Full-length AI-generated track",
    priceUsdc: "500000", // $0.50 (USDC has 6 decimals)
    priceDisplay: "$0.50",
  },
  // ... add more products
};
```

**Important**: USDC has 6 decimals, so:
- $0.50 = 500000
- $1.00 = 1000000
- $2.00 = 2000000

### Step 5: Run Locally

```bash
cd creative-hub
pnpm dev
```

Visit: http://localhost:3000/pay

### Step 6: Test a Payment

1. Open http://localhost:3000/pay
2. Click "Connect Wallet"
3. Connect with Coinbase Wallet
4. Make sure you're on Base Sepolia network
5. Select a product
6. Click "Pay $X.XX USDC"
7. Approve the transaction in your wallet
8. Watch the money arrive!

---

## Going to Production (Mainnet)

When you're ready for real money:

### 1. Update the Chain

In `src/components/payments/usdc-payment.tsx`, change:

```typescript
// FROM (testnet):
const targetChainId = baseSepolia.id;

// TO (mainnet):
const targetChainId = base.id;
```

### 2. Verify Your Treasury

Make sure `TREASURY_ADDRESS` in `wallet-config.ts` is the wallet you control on Base mainnet.

### 3. Deploy

```bash
git add .
git commit -m "Enable mainnet payments"
git push
```

Vercel will auto-deploy.

---

## Verifying Payments (API)

When someone pays, verify it:

### Check via API

```bash
curl "https://creative-hub-virid.vercel.app/api/payments/verify?tx=0xYOUR_TX_HASH&product=music_track"
```

### Response

```json
{
  "verified": true,
  "txHash": "0x...",
  "payer": "0x...",
  "amount": "500000",
  "amountFormatted": "0.5",
  "product": "music_track",
  "timestamp": 1704307200
}
```

### Integrate With Your App

```typescript
// After user pays, verify before delivering content
const response = await fetch('/api/payments/verify', {
  method: 'POST',
  body: JSON.stringify({
    txHash: userProvidedTxHash,
    productId: 'music_track',
  }),
});

const { verified } = await response.json();

if (verified) {
  // Deliver content!
}
```

---

## Security Notes

### What's Safe

- Treasury address is public (that's fine, it's where you RECEIVE money)
- USDC contract addresses are public (they're the same for everyone)
- Transaction hashes are public (blockchain is transparent)

### What to Protect

- **Your wallet's private key** - NEVER share this, NEVER commit it
- Keep it in a hardware wallet or secure location

### How Verification Works

We don't trust the user's word. We check the blockchain directly:

1. User says "I paid, here's the tx hash"
2. We call Base RPC and get the transaction receipt
3. We look for USDC Transfer event in the logs
4. We verify: from = user, to = our treasury, amount >= price
5. Only then do we say "verified: true"

---

## Troubleshooting

### "Insufficient USDC balance"

User doesn't have enough USDC. They need to:
- Buy USDC on Coinbase
- Bridge USDC to Base
- Or use testnet USDC for testing

### "Please switch to Base Sepolia network"

User's wallet is on wrong network. They click "Switch Network" button.

### "Transaction failed on-chain"

Something went wrong with the blockchain tx. Check:
- Did they have enough ETH for gas?
- Did they have enough USDC?
- Check the tx on BaseScan for details

### Payment shows success but verification fails

Possible causes:
- Wrong treasury address in config
- Network mismatch (testnet vs mainnet)
- Product ID doesn't match

---

## File Reference

### Frontend Components

```
src/components/
├── providers.tsx              # Wallet provider setup
├── payments/
│   ├── index.ts               # Exports
│   ├── wallet-button.tsx      # Connect wallet button
│   └── usdc-payment.tsx       # Payment flow
└── ui/
    └── button.tsx             # Button component
```

### Backend API

```
src/app/api/payments/
└── verify/
    └── route.ts               # Verify on-chain payments
```

### Configuration

```
src/lib/
└── wallet-config.ts           # Treasury, prices, USDC addresses
```

### Smart Contract (Optional)

```
contracts/
└── TigerPayments.sol          # On-chain payment receiver (if you want invoicing)
```

---

## Adding New Products

1. Open `src/lib/wallet-config.ts`
2. Add to the `PRODUCTS` object:

```typescript
export const PRODUCTS = {
  // ... existing products ...

  my_new_product: {
    name: "My New Product",
    description: "What this product does",
    priceUsdc: "1000000", // $1.00
    priceDisplay: "$1.00",
  },
};
```

3. Add to `src/app/api/payments/verify/route.ts`:

```typescript
const PRODUCT_PRICES: Record<string, bigint> = {
  // ... existing ...
  my_new_product: BigInt(1000000), // $1.00
};
```

4. Done! The product appears on /pay automatically.

---

## Costs

### What You Pay

| Item | Cost |
|------|------|
| Base network gas | ~$0.001 per tx |
| USDC transfer | Free (no token fees) |
| Our infrastructure | Free (Vercel free tier) |

### What You Keep

**100% of every payment** minus ~$0.001 gas (which user pays).

Compare to:
- Stripe: 2.9% + $0.30 per transaction
- PayPal: 2.9% + $0.30 per transaction
- Apple Pay: 15-30% on in-app purchases

---

## Next Steps

1. **Test on testnet** - Make sure flow works
2. **Get real USDC on Base** - Bridge from Coinbase
3. **Switch to mainnet** - Change targetChainId
4. **Accept payments** - LFG!

---

## Quick Commands

```bash
# Run locally
pnpm dev

# Build for production
pnpm build

# Deploy
git push origin main

# Check a payment (testnet)
curl "https://creative-hub-virid.vercel.app/api/payments/verify?tx=0x...&product=music_track"
```

---

*"No middlemen. No permission needed. You control your destiny."*
