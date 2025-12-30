---
description: Generate Runway Gen-4.5 prompts for White Tiger promo videos
argument-hint: [mood] [duration]
allowed-tools: Read
model: sonnet
---

# Runway Gen-4.5 Promo Generator

Generate optimized prompts for Runway AI video generation targeting viral TikTok/Instagram content.

## Trigger Phrases

Use this skill when the user says:
- "create a promo video"
- "Runway prompt"
- "Gen-4.5 video"
- "promotional clip"
- "TikTok video"

## White Tiger Brand Guidelines

### Visual Identity
- **Primary Color**: Cyberpunk Purple (#8B5CF6)
- **Accent Colors**: Neon Cyan (#22D3EE), Neon Pink (#F472B6)
- **Background**: Deep black/obsidian (#0A0A0A)
- **Logo**: White Tiger with soundwave motif
- **Aesthetic**: Cyberpunk, neon, futuristic, crypto-native

### Brand Assets
Located in `public/assets/brand/`:
- `logo-primary.jpg` - Main tiger logo
- `logo-aggressive.jpg` - Roaring variant (energy)
- `logo-dj-vinyl.jpg` - DJ/vinyl variant (music)
- `logo-city.jpg` - City background (urban)

## Runway Gen-4.5 Prompt Framework

### Structure for Maximum Impact

```
[Camera Movement] + [Subject] + [Action] + [Environment] + [Lighting] + [Style] + [Duration Hint]
```

### Duration Guidelines

| TikTok Format | Runway Duration | Notes |
|---------------|-----------------|-------|
| Hook clip | 5 seconds | First impact, scroll stopper |
| Main video | 8-15 seconds | Full message |
| Transition | 3 seconds | Between scenes |

## Prompt Templates by Mood

### 1. Hype/Energy (Launch Announcements)

```
Cinematic push-in shot, majestic white tiger with glowing purple eyes emerging from neon-lit fog,
electronic particles swirling around its form, deep bass vibration visible as purple energy waves,
cyberpunk cityscape backdrop with purple and cyan neon signs,
dramatic rim lighting in electric purple,
volumetric fog, lens flare, 8K hyperrealistic detail,
style of Blade Runner meets music video,
5 seconds, perfect loop
```

### 2. Aggressive/Phonk (Beat Drops)

```
Dutch angle tracking shot, white tiger roaring with soundwave explosion from its mouth,
purple shockwave rippling through dark urban environment,
drift cars with neon underglow blur past in background,
aggressive camera shake on bass drop,
dark atmospheric with harsh purple spotlights,
Memphis rap aesthetic meets Tokyo drift culture,
8 seconds, sync to 140 BPM drop
```

### 3. Mysterious/Teaser (Coming Soon)

```
Slow dolly zoom, silhouette of white tiger emerging from pure darkness,
only eyes visible - glowing intense purple,
minimal purple particle effects floating slowly,
deep shadows with single source purple lighting,
extremely cinematic, Fincher-style color grading,
atmospheric tension building,
10 seconds, holds mystery
```

### 4. Celebratory/Flex (Milestones)

```
Crane shot rising, white tiger standing on mountain of glowing crypto coins and music notes,
confetti of purple and cyan particles falling,
stadium lights in background creating god rays,
triumphant golden hour lighting with purple overlay,
epic scale, heroic composition,
Hans Zimmer meets Future vibes,
8 seconds, celebration energy
```

### 5. Community/Social (User Features)

```
Orbital shot circling, multiple white tigers dancing in synchronized formation,
holographic music visualization between them,
social media icons floating as purple neon signs,
night club atmosphere with purple laser grid,
inclusive energy, community celebration,
warm purple glow on subjects,
12 seconds, loop-friendly ending
```

## Music Sync Markers

For maximum viral impact, align video moments with audio:

| Timestamp | Visual | Audio Sync |
|-----------|--------|------------|
| 0.0s | Camera starts moving | Beat intro |
| 2.0s | First reveal | First kick |
| 4.0s | Action peak | Drop hits |
| 6.0s | Energy sustain | Hook vocals |
| 8.0s | Transition out | Phrase end |

## Shot Inspiration by Platform

### TikTok Optimized (9:16 vertical)
```
Extreme close-up eye shot, white tiger's purple eye reflecting crypto charts and music waveforms,
rapid zoom out to reveal full tiger in neon club environment,
vertical framing optimized for phone viewing,
text-safe zones at top and bottom,
hook must hit in first 1.5 seconds,
5-8 seconds total
```

### Instagram Reels (9:16 or 1:1)
```
Smooth circular pan, white tiger DJ working holographic turntables,
purple and cyan light trails following paw movements,
clean composition for square crop compatibility,
premium aesthetic, high fashion lighting,
8-15 seconds
```

### Twitter/X (16:9 horizontal)
```
Wide establishing shot, white tiger silhouette against massive purple moon,
cityscape below with neon signs showing $TIGER,
cinematic letterboxing suggests premium content,
text overlay space in lower third,
6-10 seconds
```

## AI Video Best Practices

### DO:
- Include specific camera movements (dolly, crane, tracking)
- Reference lighting direction and quality
- Mention style references (Blade Runner, music videos)
- Specify time duration
- Use "8K", "hyperrealistic", "cinematic" quality markers
- Include loop hints for seamless playback

### DON'T:
- Request text/typography (AI struggles with this)
- Ask for specific readable branding (add in post)
- Request rapid cuts (single shot works best)
- Over-specify every detail (leave creative room)
- Request human faces (uncanny valley risk)

## Quick Copy-Paste Prompts

### 10-Second Launch Promo
```
Epic crane shot rising from ground level, majestic white tiger with purple glowing eyes standing powerful in center frame, electronic purple energy particles swirling around its body creating a vortex effect, cyberpunk cityscape in background with massive holographic music visualizers, dramatic purple and cyan neon lighting with volumetric fog, bass vibrations visible as rippling energy waves, hyper-detailed fur with purple rim lighting, Blade Runner meets music video aesthetic, 8K cinematic quality, 10 seconds, seamless loop ending
```

### 5-Second Scroll Stopper
```
Aggressive push-in shot, white tiger eyes snapping open revealing intense purple glow, immediate bass drop shockwave rippling outward, dark environment exploding with purple energy, extreme impact, Memphis phonk aesthetic, 5 seconds, 140 BPM sync
```

### 8-Second Beat Drop Sync
```
Tracking shot following, white tiger running through neon-lit tunnel, purple energy trail behind, walls covered in graffiti glowing purple, beat builds with increasing purple particle density, explosive moment as tiger leaps and transforms into pure purple energy wave, cyberpunk underground racing aesthetic, 8 seconds, drop at 4 second mark
```

## Post-Production Notes

After Runway generation:
1. Add White Tiger logo watermark (lower right)
2. Add music sync if not using Runway audio
3. Color grade to match brand purple (#8B5CF6)
4. Export at platform-optimal resolution
5. Add captions/text in editing software (not AI)

## Integration with Music Generation

For maximum impact, pair with viral music from Master DJ:

```typescript
// Generate matching music
const track = await masterDJ.generate({
  theme: "white tiger power energy",
  style: "phonk",
  targetViralScore: 60,
  includeMusic: true,
  durationMs: 10000, // Match video length
});

// Use first 8 seconds for video
// Hook should align with visual drop
```

---

*"The visual hook and audio hook must hit at the same moment. That's the scroll-stopping formula."*
