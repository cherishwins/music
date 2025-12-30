# TON ECOSYSTEM BIBLE
## Every API, Service, Marketplace & Opportunity on TON

**Last Updated:** December 30, 2025
**Purpose:** Win all the marbles

---

## EXECUTIVE SUMMARY

TON is the **only blockchain with 900M+ built-in distribution** via Telegram. Key stats:
- **500M monthly users** in TON Mini Apps
- **650+ dApps**, 200+ tokens
- **$150M+ DeFi TVL**
- **$34M+ NFT gift trading volume**
- **1,000 new .ton domains/day**

**Our Edge:** We're building where 900M users already live.

---

## 1. DATA & ANALYTICS APIs

### Tier 1: Must Have

| Service | URL | What It Does | Pricing |
|---------|-----|--------------|---------|
| **TonAPI** | [tonapi.io](https://tonapi.io) | Full blockchain data, webhooks, liteservers | Free tier, paid for limits |
| **DYOR.io** | [dyor.io/tonapi](https://dyor.io/tonapi) | Trust scores, token analytics, DEX data | API key required |
| **TON Center** | [toncenter.com](https://toncenter.com) | Official TON blockchain API | Free tier |

### Tier 2: Nice to Have

| Service | URL | Use Case |
|---------|-----|----------|
| **Bitquery** | [bitquery.io](https://bitquery.io/blockchains/ton-blockchain-api) | GraphQL queries, real-time streaming |
| **GetBlock** | [getblock.io/nodes/ton](https://getblock.io/nodes/ton/) | RPC node access |
| **re:doubt/TONalytica** | [redoubt.online](https://redoubt.online) | SQL queries, wallet labels, dashboards |
| **DefiLlama** | [defillama.com/chain/ton](https://defillama.com/chain/ton) | TVL tracking, protocol analytics |

### Explorers

| Explorer | URL | Best For |
|----------|-----|----------|
| **Tonviewer** | [tonviewer.com](https://tonviewer.com) | Clean UI, wallet tools |
| **Tonscan** | [tonscan.org](https://tonscan.org) | Transaction tracking, staking pools |
| **TON Stat** | [tonstat.com](https://www.tonstat.com/) | Network statistics |

---

## 2. DEXs & TRADING

### Main DEXs

| DEX | URL | TVL | Features |
|-----|-----|-----|----------|
| **STON.fi** | [ston.fi](https://ston.fi) | Largest | AMM, SDK, cross-chain, Trust Scores |
| **DeDust** | [dedust.io](https://dedust.io) | #2 | Portfolio tracking, advanced tools |

### STON.fi Integration

```javascript
// Install: npm install @ston-fi/sdk @ston-fi/api
import { StonApiClient } from "@ston-fi/api";

const apiClient = new StonApiClient();

// Simulate swap
const simulation = await apiClient.simulateSwap({
  offerAddress: "EQAAAA...", // TON
  askAddress: "EQBynBO...",  // Target token
  offerUnits: "1000000000",  // 1 TON in nanotons
  slippageTolerance: "0.01"
});
```

**Key Endpoints:**
- `POST /v1/swap/simulate` - Simulate swap
- `POST /v1/reverse_swap/simulate` - Reverse calculation
- `GET /v1/swap/status` - Check swap status

### Trading Bots

| Bot | Features | MEV Protection |
|-----|----------|----------------|
| **Crypton Superbot** | Sniper, copy trading | Yes |
| **Maestro Bot** | Multi-platform, wallet protection | Yes |
| **StonksBot** | Quick trades, simple UI | No |

---

## 3. LAUNCHPADS & TOKEN TOOLS

### TON Launchpads

| Platform | URL | Type |
|----------|-----|------|
| **Blum** | [blum.io](https://blum.io) | Token launchpad, DeFi in Telegram |
| **TON Minter** | [minter.ton.org](https://minter.ton.org) | No-code Jetton deployment |

### Creating Jettons (Tokens)

**No-Code (TON Minter):**
- Visit minter.ton.org
- Fill in token details
- Deploy with 0.25 TON
- All tokens minted to deployer wallet

**Code (Blueprint/Tact):**
```bash
# Using Tact language
npm install @ton/blueprint
```

**Jetton Architecture:**
- **Master Contract** (Minter) - Total supply, metadata
- **Wallet Contracts** - One per user, holds balances

---

## 4. NFT MARKETPLACES

| Marketplace | URL | Focus | Fees |
|-------------|-----|-------|------|
| **GetGems** | [getgems.io](https://getgems.io) | Largest, general NFTs | 5% |
| **Fragment** | [fragment.com](https://fragment.com) | Usernames, numbers, ads | Variable |
| **MRKT** | Telegram Mini App | Gaming NFTs | TBD |

### NFT Gift Economy (HOT!)

- **$34M+ trading volume** in Telegram gifts
- Buy/sell via GetGems, Fragment, Tonnel
- NFT Gifts are Telegram-issued with real value
- Can buy with Telegram Stars

### GetGems API

```javascript
// GetGems contracts on GitHub
// https://github.com/getgems-io/nft-contracts
// Standard NFT, collection, sale & marketplace implementations
```

---

## 5. WALLETS & PAYMENTS

### Wallets

| Wallet | Type | Users | Best For |
|--------|------|-------|----------|
| **Tonkeeper** | Self-custody | 100M+ | Main wallet, SDK |
| **TON Wallet** | Telegram built-in | 100M+ | Mini App integration |
| **Tonhub** | Self-custody | - | Alternative |
| **MyTonWallet** | Browser extension | - | Desktop users |

### TON Connect Integration

```javascript
// npm install @tonconnect/sdk
import { TonConnect } from "@tonconnect/sdk";

const connector = new TonConnect({
  manifestUrl: "https://yourapp.com/tonconnect-manifest.json"
});

// Connect wallet
await connector.connect({ universalLink: wallet.universalLink });

// Send transaction
await connector.sendTransaction({
  validUntil: Math.floor(Date.now() / 1000) + 600,
  messages: [{
    address: "EQxxx...",
    amount: "1000000000" // 1 TON
  }]
});
```

### Payment Rails

| Method | Best For | Integration |
|--------|----------|-------------|
| **Telegram Stars** | Digital goods in Mini Apps | Bot API required |
| **TON Connect** | Crypto payments | SDK available |
| **Fragment** | Withdrawing Stars to TON | Fragment.com |

### Telegram Stars API

```javascript
// Create invoice
const invoice = await bot.createInvoiceLink({
  title: "Premium Feature",
  description: "Unlock premium",
  payload: "premium_unlock",
  provider_token: "", // Empty for Stars
  currency: "XTR",
  prices: [{ label: "Premium", amount: 100 }] // 100 Stars
});

// Refund
await bot.refundStarPayment(userId, telegramPaymentChargeId);
```

---

## 6. STAKING & DEFI

### Liquid Staking

| Protocol | Token | TVL | APY | Min Stake |
|----------|-------|-----|-----|-----------|
| **Tonstakers** | tsTON | 70M+ TON | ~5% | 1 TON |
| **Bemo** | bmTON | - | ~5% | 1 TON |

**Why Liquid Staking:**
- Stake TON, receive liquid token
- Use token in DeFi for extra yield
- No 10,000 TON minimum like regular staking
- Unstake anytime (36-72hr cooldown)

---

## 7. ADVERTISING & DISTRIBUTION

### Telegram Ads (via Fragment)

| Metric | Value |
|--------|-------|
| **Minimum First Deposit** | 20 TON |
| **CPM Starting Rate** | ~0.10 TON (~$0.34) |
| **Revenue Share** | 50% to channel owners |
| **Character Limit** | 160 characters |

**Where Ads Appear:**
- Public channels with 1,000+ subscribers
- Button must link to: bot, channel, or channel post
- No groups or external websites

**New: Suggested Posts (July 2025)**
- Fans/brands can propose & fund posts with Stars/TON
- Creators get paid after posting

### TON DNS Domains

| TLD | Marketplace | Use Case |
|-----|-------------|----------|
| **.ton** | dns.ton.org, GetGems | Wallet addresses |
| **.t.me** | Fragment | Telegram usernames |
| **+888 numbers** | Fragment | Anonymous phone numbers |

**Stats:**
- 1,000 new .ton auctions/day
- 137K total domains
- 49K unique owners
- Starting bid: 1 TON (11+ chars)

---

## 8. ECOSYSTEM APPS & GAMES

### Top Mini Apps (2025)

| App | Users | Type |
|-----|-------|------|
| **Notcoin** | 35M | Tap-to-earn game |
| **Hamster Kombat** | 300M+ (peak) | Clicker game |
| **Major** | 70M total | Social rewards |
| **Blum** | Flagship | DeFi + memecoin creation |
| **X Empire** | Large | Tap-to-earn + DeFi |
| **Catizen** | Large | Gaming platform |

### Gaming Opportunity

**Why TON for Games:**
- Fast, scalable, minimal fees
- Telegram's 900M users built-in
- Native crypto payments
- Mini App format = no app store needed

---

## 9. WHALE TRACKING

### Tools

| Tool | URL | Features |
|------|-----|----------|
| **Whale Alert** | [whale-alert.io](https://whale-alert.io) | Multi-chain alerts, API |
| **TON INU Tracker** | Telegram bot | Free TON wallet tracking |
| **Watcher** | ton.app | Configurable TON alerts |
| **re:doubt** | [redoubt.online](https://redoubt.online) | Wallet labels, dashboards |

### Whale Alert API

```javascript
// WebSocket connection for real-time alerts
const ws = new WebSocket("wss://api.whale-alert.io/ws");

ws.on("message", (data) => {
  const alert = JSON.parse(data);
  if (alert.blockchain === "ton" && alert.amount_usd > 100000) {
    console.log("TON WHALE ALERT:", alert);
  }
});
```

---

## 10. STRATEGIC OPPORTUNITIES

### Gaps We Can Fill

1. **Minter Credit Scoring** (BUILDING)
   - No Nansen equivalent for TON yet
   - re:doubt is closest but not focused on rug detection
   - **Our play:** "Equifax of Memecoins"

2. **Music NFTs on TON**
   - No music-focused NFT platform
   - GetGems is general purpose
   - **Our play:** AI-generated music as tradeable NFTs

3. **Cross-Platform Branding**
   - .ton domains + Telegram usernames unified
   - AI brand generation is unique
   - **Our play:** Brand-in-a-box for meme coins

4. **Sniper Bot Data Feed**
   - Sell our Minter Scores to trading bots
   - B2B API licensing
   - **Our play:** Become the trust layer

### Revenue Streams

| Stream | Mechanism | Potential |
|--------|-----------|-----------|
| **x402 Paywall** | $0.10-0.50/generation | Direct revenue |
| **Telegram Stars** | Digital goods | App Store compliant |
| **API Licensing** | Minter Score API | B2B recurring |
| **NFT Minting Fees** | Music NFTs | Per-mint fee |
| **Ads Arbitrage** | 50% rev share channels | Build audience, profit |

---

## 11. API KEYS NEEDED

| Service | Env Variable | Get It |
|---------|--------------|--------|
| **TonAPI** | `TONAPI_KEY` | [tonapi.io](https://tonapi.io) (free tier OK) |
| **DYOR.io** | `DYOR_API_KEY` | [dyor.io/tonapi](https://dyor.io/tonapi) |
| **Whale Alert** | `WHALE_ALERT_KEY` | [whale-alert.io](https://whale-alert.io) |

---

## 12. QUICK REFERENCE

### Useful Links

- **TON Docs:** https://docs.ton.org
- **TON App Directory:** https://ton.app
- **TON Blog:** https://blog.ton.org
- **TON GitHub:** https://github.com/ton-blockchain
- **TON Foundation:** https://ton.org

### Community

- **TON Dev Chat:** https://t.me/tondev
- **TON Community:** https://t.me/toncoin
- **DYOR API Support:** https://t.me/dyorapi

---

## THE PLAY

1. **We own Minter Credit Scoring** - No real competitor
2. **We have AI music generation** - Unique on TON
3. **We have brand generation** - Meme coins need this
4. **We're in Telegram** - Where 900M users are

**Next moves:**
- [ ] Get DYOR.io API key (human task)
- [ ] Integrate real blockchain data into Minter Score
- [ ] Build whale alert integration
- [ ] Create music NFT minting flow
- [ ] Launch on Blum/pump-style discovery

**LFG!**
