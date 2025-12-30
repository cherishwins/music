# Human To-Dos

**Last Updated:** December 30, 2025

> This is the master checklist for human-in-the-loop tasks. Claude keeps this updated.
> Check items off as you complete them. Claude will add new tasks as needed.

---

## URGENT (Do Today)

### API Keys & Accounts
- [ ] **Rotate xAI API key** - You shared it in chat, rotate at https://console.x.ai
- [ ] **Create npm account** - https://www.npmjs.com/signup (if you don't have one)
- [ ] **Create npm org "whitetiger"** - https://www.npmjs.com/org/create (for @whitetiger/mcp-music)

### Publish MCP Server
- [ ] **Login to npm** - Run `npm login` in terminal
- [ ] **Publish package** - Run `cd mcp-server && npm publish --access public`
- [ ] **Create GitHub repo** - https://github.com/new → "white-tiger-mcp"
- [ ] **Push MCP code to GitHub** - See `mcp-server/PUBLISH.md` for commands

---

## THIS WEEK (Priority Order)

### Directory Submissions (Copy-paste content in `docs/SUBMISSION_CONTENT.md`)

#### Telegram Directories
- [ ] **FindMini.app** - https://findmini.app/submit
  - App: @MSUCOBot
  - Category: Entertainment/Music
  - Use UTM: `https://t.me/MSUCOBot?start=src_findmini`

- [ ] **tApps Center** - https://tapps.center
  - Highlight TON integration
  - Category: Web3/Music

- [ ] **Telegram @AppsModeration** - Message the bot for official listing

#### MCP Directories (After npm publish)
- [ ] **MCP.so** - https://mcp.so (17K+ servers listed)
- [ ] **MCP Market** - https://mcpmarket.com
- [ ] **MCPServers.org** - https://mcpservers.org
- [ ] **Clinde.ai** - https://clinde.ai
- [ ] **GitHub PR** - https://github.com/modelcontextprotocol/servers

#### Other Directories
- [ ] **BetaList** - https://betalist.com

### Screenshots & Media
- [ ] **Take app screenshots** (4-5 for directory listings)
  - Main generation interface
  - Generated track with viral score
  - Payment options (Stars/TON)
  - Mobile view in Telegram

- [ ] **Record 30-sec demo video**
  - Show: describe → generate → play flow

---

## NEXT WEEK

### Social & Community
- [ ] **Create TikTok account** for White Tiger
- [ ] **Post 3 teaser videos** on TikTok
- [ ] **Set up Telegram channel** for updates
- [ ] **Post on r/MusicProduction** (use template in SUBMISSION_CONTENT.md)
- [ ] **Post on r/cryptocurrency** (use template in SUBMISSION_CONTENT.md)

### Influencer Outreach
- [ ] **Identify 10 mid-tier crypto influencers** (10K-100K followers)
- [ ] **DM 5 for potential partnerships**

---

## WEEK 4 (Product Hunt)

### Prep (50+ hours recommended)
- [ ] **Build email list** - 200-400 engaged supporters
- [ ] **Create Product Hunt account** - Get established before launch
- [ ] **Prepare launch assets**:
  - [ ] Hero image (1270x760)
  - [ ] Gallery images (5-8)
  - [ ] Animated GIF demo
  - [ ] Video demo (optional)
- [ ] **Write launch copy** (in SUBMISSION_CONTENT.md)
- [ ] **Schedule launch** - Tuesday/Wednesday 12:01 AM PT

### Launch Day
- [ ] Post at 12:01 AM PT
- [ ] Post first comment immediately
- [ ] Notify supporters
- [ ] Engage with all comments

---

## ONGOING

### Credentials to Set Up (When Needed)
- [ ] **Coinbase Project ID** - For Coinbase Onramp
- [ ] **Stripe Secret Key** - For card payments

### Monitoring
- [ ] Check Turso dashboard for new signups
- [ ] Monitor funnel events in database
- [ ] Track directory referral sources

---

## COMPLETED

### December 30, 2025
- [x] Added xAI API key to .env
- [x] Database migration for funnel tracking
- [x] Built MCP server package
- [x] Generated watermark audio files
- [x] Created all submission content

---

## HOW THIS WORKS

1. **Claude adds tasks** to this file when human action is needed
2. **You check them off** as you complete them
3. **Claude reads this file** at session start to know what's done
4. **Completed items** move to the COMPLETED section with date

**Pattern:** You're the chimpanzee (hands-on tasks), Claude is the machine (code & automation).

---

*"You do the human stuff, I do the machine stuff. LFG."* 🦧🤖
