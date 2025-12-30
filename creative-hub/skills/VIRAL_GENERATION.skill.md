---
description: Generate TikTok-viral lyrics and music using Loop-First Lyric Design
argument-hint: [theme] [style]
allowed-tools: Read, WebFetch
model: sonnet
---

# Viral Generation Skill

Generate TikTok-optimized lyrics and music prompts using research-backed viral patterns.

## Trigger Phrases

Use this skill when the user says:
- "make it viral"
- "TikTok optimized"
- "viral hook"
- "catchy lyrics"
- "phonk beat"
- "loop-first"

## The Loop-First Framework

Apply these rules to all generated content:

### Rule 1: First 8 Words Must SLAP

TikTok scroll = instant hook or death. No setup, no context, just impact.

**Generate openers like:**
- "Money talk, I don't need to speak"
- "We the ones that run this city"
- "Pull up, drip too hard to flex"

**Never generate:**
- "Let me tell you about the time when..."
- "I've been thinking lately about how..."

### Rule 2: Contiguous Repetition

Repeat key phrases 2-3x IMMEDIATELY. Stack them, don't spread.

**Generate patterns like:**
```
We up, we up, we up right now
Can't stop, won't stop, don't stop now
```

**Not like:**
```
We up in the club tonight
Feeling good, feeling right
We up and we here to stay
```

### Rule 3: Short Punchy Lines (6 Words Max)

Target 70%+ short lines. Each line = potential clip moment.

**Generate:**
```
Get out my way    (4 words)
I don't play      (3 words)
Every day         (2 words)
We get paid       (3 words)
```

### Rule 4: Ad-lib Density (3-5%)

Inject energy markers for video edit sync points.

**Include:** "yeah", "yuh", "aye", "sheesh", "let's go", "woo", "skrt", "brr", "gang"

### Rule 5: ONE Memorable Hook

Single phrase repeated 4+ times that loops in listener's head.

## Viral Score Targets

Generated content should achieve:

| Metric | Target | Description |
|--------|--------|-------------|
| Repetition Ratio | >40% | Percentage of words that repeat |
| Hook Score | >5 | Repeated phrases (2-5 words, 3+ occurrences) |
| Short Line Ratio | >60% | Lines with 6 words or fewer |
| First Line Punch | 1.0 | Opening line under 8 words, high impact |

## Style-Specific Guidance

### Phonk (TikTok Dominant - 31B views)

```yaml
traits:
  - Dark cowbell patterns
  - Memphis rap samples
  - Aggressive 808 bass
  - Drift culture aesthetic
  - Hard-hitting drops

mood: Dark, aggressive, relentless
bpm: 130-150
hook_style: "Repetitive, hypnotic, one-word or two-word loops"
```

### K-Phonk (Korean Fusion)

```yaml
traits:
  - Seoul street racing vibes
  - K-pop melodic hooks over phonk bass
  - Korean + English hybrid lyrics
  - Dark synth layers

mood: Aggressive yet melodic
bpm: 135-145
hook_style: "Korean word repeated, then English translation"
```

### Trap (Classic Viral)

```yaml
traits:
  - 808 sub bass with distortion
  - Crisp hi-hats with rolls
  - Metro Boomin style
  - Dark ambient pads

mood: Flex, money, status
bpm: 140-160
hook_style: "Flex phrase repeated with ad-libs"
```

## Prompt Template for Claude

When generating viral lyrics, use this template:

```
Write a TikTok-viral hip hop hook that:
- Opens with a 6-word punch line (no setup)
- Repeats the core hook phrase 3x in a row immediately
- Uses only lines with 6 words or fewer
- Includes 2-3 ad-libs (yeah, sheesh, let's go)
- Has ONE phrase designed to loop in someone's head

Theme: {user_theme}
Style: {phonk|kphonk|trap|drill}
Energy: {dark|hype|flex|emotional}
Target BPM: {bpm}

Format:
[Hook - 8 lines, 70%+ short lines, stack the main hook 3x at start]
[Verse - 12 lines, building energy to hook]
[Hook repeat]
```

## ElevenLabs Music Prompt Template

When generating viral beats, construct prompts like:

```
{style} beat, {bpm} BPM, TikTok viral energy,
hard-hitting drops every 8 bars, loopable structure,
perfect for 15-second clips, aggressive {808s|cowbell|hi-hats},
{mood} atmosphere, professional mix, viral potential
```

## Integration with Qdrant

Query high-viral patterns from the `hiphop_viral` collection:

```typescript
// Find patterns with viral_score > 50
const viralPatterns = await qdrant.scroll("hiphop_viral", {
  filter: {
    must: [{ key: "viral_score", range: { gte: 50 } }]
  },
  limit: 20,
  with_payload: true,
});

// Extract top hooks
const topHooks = viralPatterns.points
  .flatMap(p => p.payload.top_hooks)
  .slice(0, 10);
```

## Research Backing

From our analysis of 4,832 hip hop tracks:

- **High viral (50+) vs low viral (<20):**
  - Repetition ratio: 49.5% vs 15.9% (3.1x higher)
  - Hook score: 8.0 vs 0.05 (150x higher)

- **TikTok stats (2024-2025):**
  - 84% of Billboard Global 200 went viral on TikTok first
  - Phonk: 31 BILLION TikTok views
  - Songs average 15 seconds of exposure

## Example Output

**Theme:** "Making money, living large"
**Style:** phonk

```
[Hook]
Get paid, get paid, get paid (yeah)
Every day we get paid
Can't fade what I made
Run the game, run the shade (sheesh)
Get paid, get paid, get paid
Money talk, I don't play
In the dark, making waves
Get paid, get paid, get paid (let's go)

[Verse 1]
Stack it up (yeah)
Count it twice
Living life
Cold as ice
Dark outside
Neon lights
Money right
Every night
Run the block
Never stop
To the top
Make it pop (brr)
```

**Viral Score Analysis:**
- Repetition ratio: 52%
- Hook score: 6 ("get paid" x8)
- Short line ratio: 95%
- First line punch: "Get paid, get paid, get paid" (6 words)

---

*"Hits are loops. The hook IS the song. Everything else is just waiting for the hook to come back."*
