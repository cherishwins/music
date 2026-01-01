# Partner Outreach Skill

> Automated outreach to meme coin projects for anthem partnerships

---

## Target Segments

### Tier 1: Hot New Launches (Highest Priority)
- Launched in last 7 days
- $100K+ market cap
- Active Telegram (500+ members)
- No existing audio content

### Tier 2: Established Projects
- 30-90 days old
- $1M+ market cap
- Looking to refresh brand
- Has community but stale engagement

### Tier 3: Pre-Launch
- Announced but not launched
- Building community
- Need content for launch day

---

## Outreach Templates

### Template A: Cold Intro (Telegram/Discord)

```
Hey [PROJECT_NAME] fam! 🔥

Just found you guys and the energy is insane. Quick question - do you have an official anthem yet?

We built an AI that makes viral meme coin anthems. Here's one we made for $WIF: [EXAMPLE_LINK]

Want a free one for $[TICKER]? Takes literally 60 seconds.

Try it: https://t.me/MSUCOBot

Or I can make a preview right now if you drop your ticker 👀
```

### Template B: Value-First (Already Made Preview)

```
Yo [PROJECT_NAME] community!

Made something for you guys - a $[TICKER] anthem:

🎵 [PREVIEW_LINK]

No strings attached, just thought your community deserved one.

If you want the full 2-minute version or want to customize it, hit me up. We can also distribute it to 20+ TikTok accounts.

Made with https://t.me/MSUCOBot 🐯
```

### Template C: Partnership Proposal (After Warm Response)

```
Awesome, glad you liked it! Here's what we can do:

**Free Tier** (what you got)
- 30-second preview
- Watermarked
- You own it

**Official Partnership** ($50-200)
- Full 2-minute anthem
- No watermark
- 3 variations to choose from
- Distribution to 20+ TikTok accounts
- Featured on our leaderboard
- Revenue share if it goes viral

Most projects go with the partnership because the distribution alone is worth it. The TikTok accounts have combined 50K+ followers.

Want me to send over the full package details?
```

### Template D: Competition Invite

```
[PROJECT_NAME] fam! 🏆

We're running "Anthem Wars" this week - a competition to create the most viral meme coin anthem.

Your community could participate:
1. Anyone can create an anthem for $[TICKER]
2. We distribute the best ones to 20+ TikToks
3. Track with most views wins
4. Winner gets $50 + their song becomes "official"

Want to be the featured coin this week? We'll promote the competition to all our channels too.

Zero cost to you - your community creates the content, we handle distribution.

Interested?
```

---

## Follow-Up Sequence

### Day 0: Initial Outreach
- Send Template A or B
- Track in CRM

### Day 2: Soft Follow-Up
```
Hey! Did you get a chance to check out the anthem preview?

Would love to hear what [PROJECT_NAME] community thinks of it 🎵
```

### Day 5: Value Add
```
Made an updated version with some tweaks:

[NEW_PREVIEW_LINK]

This one has more energy in the drop. Let me know if you want the full version!
```

### Day 7: Final / Move On
```
Last ping on this! We're about to feature another project for this week's Anthem Wars.

If you're interested in participating, just reply. Otherwise no worries - the preview is yours to keep either way 🐯
```

---

## Qualification Scorecard

| Criteria | Points | How to Check |
|----------|--------|--------------|
| Telegram 500+ members | +3 | Check member count |
| Active chat (10+ msgs/hour) | +2 | Observe for 5 min |
| Launched < 7 days | +3 | Check DexScreener |
| Market cap $100K-1M | +2 | Check DexScreener |
| No existing anthem | +3 | Search YouTube, TikTok |
| English community | +2 | Read chat |
| Meme-able name/ticker | +2 | Subjective |
| Team responds to DMs | +3 | Test outreach |

**Score 15+**: High priority, personalized outreach
**Score 10-14**: Medium priority, template outreach
**Score < 10**: Skip or batch outreach

---

## Finding Targets

### Sources

1. **DexScreener New Pairs**
   - Filter: TON or Solana
   - Filter: Last 24 hours
   - Filter: $50K+ volume
   - URL: https://dexscreener.com/new-pairs

2. **pump.fun Trending**
   - Check "King of the Hill"
   - Check "Graduating Soon"
   - URL: https://pump.fun

3. **Telegram Search**
   - Search: "new token" + "launching"
   - Search: "[COIN] official"
   - Join crypto alpha groups

4. **Twitter/X**
   - Search: "stealth launch" + "ton" or "sol"
   - Follow meme coin influencers
   - Track trending tickers

5. **Reddit**
   - r/CryptoMoonShots
   - r/SatoshiStreetBets
   - r/memecoins

---

## n8n Automation Workflow

```yaml
name: Partner Outreach Pipeline

triggers:
  - schedule: every 6 hours
  - webhook: new_project_detected

steps:
  1. Fetch new pairs from DexScreener API
  2. Filter by qualification criteria
  3. Check if already contacted (Turso lookup)
  4. Generate sample anthem via /api/generate/anthem
  5. Upload to temporary hosting
  6. Send outreach message via Telegram API
  7. Log contact in Turso CRM
  8. Schedule follow-ups

follow_up_workflow:
  - Day 2: Check for response, send follow-up if none
  - Day 5: Send value-add with new preview
  - Day 7: Final follow-up or mark as cold
```

---

## CRM Schema (Turso)

```sql
CREATE TABLE partners (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  telegram_group TEXT,
  discord_server TEXT,
  twitter_handle TEXT,
  contact_name TEXT,
  market_cap REAL,
  qualification_score INTEGER,
  status TEXT DEFAULT 'prospect', -- prospect, contacted, responded, negotiating, closed, rejected
  outreach_date TEXT,
  last_contact_date TEXT,
  notes TEXT,
  deal_value REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outreach_logs (
  id TEXT PRIMARY KEY,
  partner_id TEXT REFERENCES partners(id),
  channel TEXT, -- telegram, discord, twitter, email
  template_used TEXT,
  message_sent TEXT,
  response TEXT,
  sent_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## Success Metrics

### Weekly Targets

| Metric | Target | Tracking |
|--------|--------|----------|
| Outreach sent | 50 | CRM count |
| Response rate | 10% (5) | Responses / Sent |
| Trial rate | 30% of responses (1-2) | Trials / Responses |
| Close rate | 50% of trials (1) | Closed / Trials |
| Revenue | $50-200 | Deal value |

### Optimization

- A/B test templates (track response rates)
- Test timing (when to send)
- Test channels (Telegram vs Discord vs Twitter)
- Track which project types convert best
- Iterate on qualification criteria

---

## Scripts

### Generate Batch Previews

```bash
# Generate previews for top 10 new launches
for ticker in PEPE WOJAK DOGE WIF BONK POPCAT SHIB FLOKI BRETT MEME; do
  curl -X POST https://creative-hub-virid.vercel.app/api/generate/anthem \
    -H "Content-Type: application/json" \
    -d "{
      \"tokenName\": \"$ticker Token\",
      \"ticker\": \"$ticker\",
      \"preferCheap\": true
    }" &
done
wait
```

### Bulk Outreach (n8n HTTP Request)

```javascript
// For each qualified project
const message = templates.cold_intro
  .replace('[PROJECT_NAME]', project.name)
  .replace('[TICKER]', project.ticker)
  .replace('[EXAMPLE_LINK]', exampleAnthemUrl);

await telegramApi.sendMessage({
  chat_id: project.telegram_group,
  text: message
});

await db.insert(outreach_logs, {
  partner_id: project.id,
  channel: 'telegram',
  template_used: 'cold_intro',
  message_sent: message
});
```

---

*"Every partnership starts with a single message."*
