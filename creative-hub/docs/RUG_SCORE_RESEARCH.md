# Rug Score Research - The Equifax of Meme Coins

**Last Updated:** December 30, 2025
**Goal:** Build proprietary credit scoring system for TON meme coins

---

## THE VISION

Create a defensible moat through proprietary data:
- Whale wallet behavior patterns
- Liquidity pool health metrics
- Historical rug pull case studies
- Team/deployer reputation scores
- Social sentiment analysis

**End Game:** Meme coin insurance products (if we get this right)

---

## TON MEME COIN INFLUENCER DATABASE

### English (Core Network)
| X Handle | Telegram | Why Relevant |
|----------|----------|--------------|
| @MemeCoinScanTON | @MemeScanTON_bot | Bloomberg-style terminal, tracks safety scores, whale alerts |
| @BabyLadyTONCoin | /babyladytoncoin | Community takeover squad, 49% liquidity lock focus |
| @0xSIIILV3R | N/A | Locksmith vibes, shares $cocoon launches |
| @Mellow_ | N/A | Gamified ecosystem explorer |
| @Giooton | @ton_cabal | Streamer, giveaways, community bonds |
| @Tyler_Did_It | N/A | TON NFT + meme growth analyst |
| @Overdose_AI | /overdose_ai | Low-cap meme spotter, exploit audits |
| @ApeDao76699 | N/A | DAO governance, decentralized trades |

### Russian (Eastern Edge)
| X Handle | Telegram | Why Relevant |
|----------|----------|--------------|
| N/A | @toncoin_rus | TON news including meme coins, Russian updates |
| @kingyru | @investmentkingyru | Top TON influencer, investment alpha |
| N/A | @Mine_Verse | Pro Ton channel, community mining |

### Vietnamese (Southeast Asia Growth)
| X Handle | Telegram | Why Relevant |
|----------|----------|--------------|
| @TamN0D | N/A | Calls out meme point exploits, fairness advocate |
| @sangwinner54119 | N/A | Meme coin fairness explorer |

### French (European DeFi)
| X Handle | Telegram | Why Relevant |
|----------|----------|--------------|
| @MEXCFrancophone | N/A | Daily meme alpha, low-fee TON plays |
| @Alpha_Phaerys | N/A | Esports x crypto crossover |

### Arabic (Middle East)
| X Handle | Telegram | Why Relevant |
|----------|----------|--------------|
| N/A | @freecryptodragon | Meme myths debate, dragon hoard vibes |

### Other Languages
| Language | X Handle | Telegram | Why Relevant |
|----------|----------|----------|--------------|
| Burmese | @tonmyanmar | N/A | Community updates |
| Chinese | N/A | @toncoin_cn | Ecosystem growth, August 2025 surge |
| Korean | N/A | Academy links | Beginner guides, $100 dreams |
| Thai | N/A | Bitkub sources | Telegram integration education |
| Indonesian | N/A | Festival links | Web3 integration events |

### SKIP LIST (Already Known/Covered)
@ton_blockchain, @tonstakers, @s0meone_u_know, @precursorkols, @hotdao_, @pumpresearch, @ton_insi, @fo1_davis, @WizCalls, @Paradotsol, @ZssBecker, @TeddyxROO, @TedTalksCrypto, @Jok3rXBT, @ChatKolz, @cryptosanthoshK, @tdmilky, @mbexbt, @iamalexthugart, @AltCryptoGems, @CryptoBlckParty, @3orovik, @SenditHighor, @CNainyas

---

## RUG SCORE FACTORS (Scoring Algorithm)

### On-Chain Signals (40% weight)
1. **Liquidity Lock Status** (0-100)
   - Locked duration (longer = better)
   - Lock percentage (higher = better)
   - Lock platform reputation

2. **Whale Concentration** (0-100)
   - Top 10 wallets % of supply
   - Wallet age and history
   - Previous rug associations

3. **Contract Analysis** (0-100)
   - Honeypot check
   - Mint function disabled?
   - Ownership renounced?
   - Tax rates (buy/sell)

### Social Signals (30% weight)
1. **Team Transparency** (0-100)
   - Doxxed team members
   - Previous project history
   - Community engagement

2. **Community Health** (0-100)
   - Telegram member count vs. activity
   - Bot detection score
   - Organic growth rate

3. **Influencer Risk** (0-100)
   - Known pump-and-dump callers
   - Paid shill detection

### Historical Pattern Matching (30% weight)
1. **Deployer History** (0-100)
   - Previous contracts deployed
   - Rug pull associations
   - Wallet age and activity

2. **Launch Pattern** (0-100)
   - Matches known rug patterns?
   - Fair launch vs. insider allocation
   - Initial liquidity size

---

## CASE STUDY FRAMEWORK

For each known rug, document:

```markdown
## [TOKEN NAME] Rug - [DATE]

**Amount Lost:** $X
**Time to Rug:** X hours/days from launch

### Red Flags Present
- [ ] Unlocked liquidity
- [ ] Whale concentration >50%
- [ ] Anonymous team
- [ ] Suspicious contract functions
- [ ] Fake community (bots)

### Timeline
1. [Date] - Token launched
2. [Date] - Price peaked at $X
3. [Date] - Liquidity pulled
4. [Date] - Price crashed to $0

### Lessons
- What should have been caught
- Which signals would have flagged this

### Deployer Wallet
- Address: [0x...]
- Other contracts: [list]
- Current status: [active/dormant]
```

---

## DATA SOURCES TO INTEGRATE

### TON Blockchain
- **TON API** - https://tonapi.io
- **TON Center** - https://toncenter.com
- **TON Scan** - https://tonscan.org

### Existing Tools to Study/Integrate
- **MemeScan TON** - Already tracking safety scores
- **DEX Screener** - Pool analytics
- **GeckoTerminal** - Token metrics

### Social Listening
- **X API** - Influencer mentions, sentiment
- **Telegram Bot API** - Channel health, bot detection
- **Discord** - Community activity

---

## MONETIZATION STRATEGY

### Tier 1: Free (Lead Gen)
- Basic rug score (1-100)
- Limited checks per day
- Community badge on Telegram

### Tier 2: Pro ($9.99/mo in TON)
- Unlimited checks
- Whale alerts
- Historical data access
- API access (100 calls/day)

### Tier 3: Enterprise (Custom)
- White-label integration
- Unlimited API
- Custom scoring weights
- Insurance underwriting data

### Long-Term: Insurance
- Partner with DeFi insurance protocols
- Offer coverage on "verified safe" tokens
- Premium based on rug score

---

## TECHNICAL ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│                   RUG SCORE ENGINE                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │ On-Chain    │  │ Social      │  │ Historical │  │
│  │ Analyzer    │  │ Listener    │  │ Matcher    │  │
│  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │
│         │                │               │          │
│         └────────────────┼───────────────┘          │
│                          │                          │
│                   ┌──────▼──────┐                   │
│                   │  Scoring    │                   │
│                   │  Algorithm  │                   │
│                   └──────┬──────┘                   │
│                          │                          │
│         ┌────────────────┼────────────────┐         │
│         │                │                │         │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐  │
│  │ Qdrant      │  │ Turso       │  │ Redis       │  │
│  │ (Patterns)  │  │ (Scores)    │  │ (Cache)     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                      APIs                           │
│  /api/rug-score/check   - Get score for token       │
│  /api/rug-score/history - Historical rugs           │
│  /api/rug-score/whale   - Whale movement alerts     │
└─────────────────────────────────────────────────────┘
```

---

## NEXT STEPS

1. **Build MVP Scoring API**
   - [ ] Contract analysis (honeypot check)
   - [ ] Liquidity lock verification
   - [ ] Whale concentration calc

2. **Seed Historical Database**
   - [ ] Document 50 known TON rugs
   - [ ] Extract deployer wallets
   - [ ] Build pattern library

3. **Launch Beta**
   - [ ] Telegram bot for free checks
   - [ ] Embed in @MSUCOBot
   - [ ] Collect feedback

4. **Iterate on Algorithm**
   - [ ] Track accuracy (rugs we caught vs. missed)
   - [ ] Adjust weights based on data
   - [ ] Add new signals

---

## COMPETITIVE MOAT

What makes this defensible:
1. **Proprietary Historical Data** - Case studies nobody else has
2. **Multi-Language Network** - Influencer relationships globally
3. **Pattern Library** - ML on rug patterns over time
4. **Community Trust** - Built through accurate predictions
5. **Insurance Path** - Nobody else connecting scoring to coverage

---

*"The truth isn't in the picture. It's in why we need one."*
