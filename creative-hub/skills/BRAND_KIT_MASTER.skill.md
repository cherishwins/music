# Brand Kit Master - Domain Expert Skill

> **Trigger Patterns**: "create brand kit", "generate branding", "build brand assets", "PWA assets", "/brand", "/branding"
> **Integrations**: Canva (MCP), Grok Imagine, Banana3, Midjourney, DALL-E
> **Version**: 1.1.0

---

## Canva MCP Integration (Recommended)

If you have Canva MCP connected, you can automate the entire asset production pipeline:

### Setup (One-time)

**Claude Code:**
```bash
claude mcp add --transport http Canva https://mcp.canva.com/mcp
```

**Claude Desktop:**
Add to MCP config (Settings → Developer → Edit Config):
```json
{
  "mcpServers": {
    "Canva": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://mcp.canva.com/mcp"]
    }
  }
}
```

### Automated Workflow

Once connected, say:
```
"Show me my recent designs" → Find your master logo
"Export [design] as 512x512 PNG" → Get master size
"Export [design] as 192x192 PNG" → PWA icon
"Export [design] as 72x72 PNG" → Small icon
... repeat for all sizes
```

### What's Available (Free Canva Plan)

| Feature | Status |
|---------|--------|
| Create empty designs | Yes |
| Find existing designs | Yes |
| Export as PNG/PDF | Yes |
| Autofill templates | Enterprise only |

### Batch Export Script

Ask Claude to batch export all sizes:
```
"From my [logo design], export all PWA icon sizes:
72, 96, 128, 144, 152, 192, 384, 512 pixels"
```

---

## Overview

You are a **Brand Kit Master** - a domain expert in visual identity, graphic design, and multi-platform asset production. You help create comprehensive brand kits from concept to production-ready assets across all devices, browsers, and platforms.

---

## Workflow Pipeline

```
1. DISCOVER  → Capture brand DNA (name, values, aesthetic, colors)
2. IDEATE    → Generate concepts via AI image tools
3. REFINE    → Iterate on promising directions
4. PRODUCE   → Create production assets via Canva
5. EXPORT    → Organize complete brand kit folder
```

---

## Phase 1: Brand DNA Capture

When starting a new brand, extract these core elements:

### Identity Questions
```yaml
Brand Name:
Tagline/Slogan:
Industry/Niche:
Target Audience:
Brand Personality: [professional|playful|bold|minimal|luxurious|rebellious|cosmic]
Competitors to Differentiate From:
```

### Visual DNA
```yaml
Primary Color: # (hex)
Secondary Color: # (hex)
Accent Color: # (hex)
Background Style: [dark|light|gradient|cosmic|minimal]
Typography Vibe: [modern|classic|bold|playful|techy]
Mascot/Symbol: [describe if applicable]
Aesthetic Tags: [e.g., vaporwave, cyberpunk, minimal, retro-futuristic]
```

### Example: To The Stars Creative Studio
```yaml
Brand Name: To The Stars / MSUCO
Tagline: "Seal, Scan, Insure – Launch to the Stars"
Industry: Web3 Creative Studio (Telegram Mini Apps)
Target Audience: Memecoin creators, crypto degens, minters
Brand Personality: cosmic, bold, playful, rebellious

Primary Color: #4B0082 (Indigo)
Secondary Color: #8B5CF6 (Violet)
Accent Color: #00FFFF (Cyan/Neon)
Background: Cosmic purple nebula, deep space
Typography: Bold, futuristic, slightly glitchy
Mascot: White Tiger with crown, Pepe, Panda
Aesthetic: Vaporwave + Cyberpunk + Cosmic
```

---

## Phase 2: AI Image Generation Prompts

### Style DNA Templates

Use these as base prompts for consistent brand imagery:

#### Cosmic/Vaporwave Style
```
{subject}, cosmic purple nebula background, neon cyan #00FFFF accents,
deep indigo #4B0082 base, vaporwave aesthetic, retro-futuristic,
synthwave lighting, glitch effects, high contrast, 8k detailed
```

#### Cyberpunk Style
```
{subject}, cyberpunk cityscape, neon purple and cyan lighting,
dark atmospheric, rain reflections, holographic elements,
futuristic technology, blade runner aesthetic, cinematic
```

#### Minimal/Modern Style
```
{subject}, clean minimal background, single accent color pop,
geometric shapes, negative space, modern typography,
professional corporate, high-end luxury feel
```

#### Mascot Generation
```
{mascot animal} character, anthropomorphic, wearing {accessories},
{brand aesthetic} style, front-facing portrait, solid background,
vector art style, suitable for logo, high detail face
```

### Platform-Specific Prompts

#### Grok Imagine
```
Create a {asset type} for {brand name}. Style: {aesthetic tags}.
Colors: primary {hex}, accent {hex}. Include {mascot/symbol}.
High resolution, suitable for {use case}.
```

#### Banana3 / Midjourney
```
/imagine {subject} --style {aesthetic} --ar {aspect ratio}
Example: /imagine white tiger king with golden crown, cosmic purple nebula,
neon cyan accents, vaporwave, portrait --ar 1:1 --v 6
```

---

## Phase 3: Asset Specifications

### PWA Manifest Icons (Required)

| Size | Filename | Purpose |
|------|----------|---------|
| 72x72 | icon-72x72.png | Android legacy |
| 96x96 | icon-96x96.png | Android legacy |
| 128x128 | icon-128x128.png | Chrome Web Store |
| 144x144 | icon-144x144.png | MS Tile |
| 152x152 | icon-152x152.png | iOS legacy |
| 192x192 | icon-192x192.png | Android Chrome |
| 384x384 | icon-384x384.png | Android splash |
| 512x512 | icon-512x512.png | Android/PWA primary |

**Manifest JSON format:**
```json
{
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### Favicons (Required)

| Size | Filename | Purpose |
|------|----------|---------|
| 16x16 | favicon-16x16.png | Browser tab |
| 32x32 | favicon-32x32.png | Browser tab (retina) |
| 48x48 | favicon.ico | Legacy IE |
| 180x180 | apple-touch-icon.png | iOS home screen |
| 192x192 | android-chrome-192x192.png | Android |
| 512x512 | android-chrome-512x512.png | Android splash |

**HTML Head:**
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
```

### Social Media Assets

| Platform | Asset | Size | Notes |
|----------|-------|------|-------|
| **Telegram** | Bot Avatar | 512x512 | Square, clear at small sizes |
| **X/Twitter** | Profile | 400x400 | Circular crop |
| **X/Twitter** | Header | 1500x500 | Safe zone center |
| **LinkedIn** | Profile | 400x400 | Professional tone |
| **LinkedIn** | Banner | 1584x396 | Company branding |
| **Instagram** | Profile | 320x320 | Circular crop |
| **Facebook** | Profile | 170x170 | Circular crop |
| **Facebook** | Cover | 820x312 | Desktop optimized |
| **Discord** | Server Icon | 512x512 | Circular crop |
| **YouTube** | Profile | 800x800 | Circular crop |
| **YouTube** | Banner | 2560x1440 | Safe zone 1546x423 |

### Open Graph / Social Sharing

| Asset | Size | Usage |
|-------|------|-------|
| og-image.png | 1200x630 | Universal share preview |
| twitter-card.png | 1200x628 | Twitter large card |
| linkedin-share.png | 1200x627 | LinkedIn shares |

### iOS Splash Screens

| Device | Size | Orientation |
|--------|------|-------------|
| 12.9" iPad Pro | 2048x2732 | Portrait |
| 11" iPad Pro | 1668x2388 | Portrait |
| 10.5" iPad | 1668x2224 | Portrait |
| 9.7" iPad | 1536x2048 | Portrait |
| iPhone 14 Pro Max | 1290x2796 | Portrait |
| iPhone 14 Pro | 1179x2556 | Portrait |
| iPhone 13/12 | 1170x2532 | Portrait |
| iPhone SE | 750x1334 | Portrait |

---

## Phase 4: Canva Production Workflow

### Step 1: Upload Master Assets
1. Upload refined logo/mascot to Canva Brand Kit
2. Set brand colors (primary, secondary, accent)
3. Add brand fonts if custom

### Step 2: Create Asset Templates

**Canva Search Terms:**
- "App icon template" → for PWA icons
- "Favicon generator" → multi-size export
- "Social media kit" → platform templates
- "OG image template" → share previews

### Step 3: Batch Export Settings

```yaml
PWA Icons:
  Format: PNG
  Background: Transparent (if logo allows) or brand color
  Quality: High

Social Media:
  Format: PNG or JPG (for photos)
  Quality: High
  Color Profile: sRGB

Favicons:
  Format: PNG (convert .ico separately)
  Background: Transparent preferred
```

### Step 4: Canva Magic Resize
Use "Resize" feature to quickly generate all social sizes from one master design.

---

## Phase 5: Brand Kit Folder Structure

```
brand-kit/
├── README.md                    # Brand guidelines
├── brand-dna.yaml              # Colors, fonts, values
│
├── logos/
│   ├── logo-primary.svg        # Vector master
│   ├── logo-primary.png        # 1024x1024
│   ├── logo-dark.png           # For light backgrounds
│   ├── logo-light.png          # For dark backgrounds
│   ├── logo-icon-only.png      # Symbol without text
│   └── logo-horizontal.png     # Wide format
│
├── icons/
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
│
├── social/
│   ├── telegram-avatar.png
│   ├── twitter-profile.png
│   ├── twitter-header.png
│   ├── linkedin-profile.png
│   ├── linkedin-banner.png
│   ├── instagram-profile.png
│   ├── facebook-profile.png
│   ├── facebook-cover.png
│   ├── discord-icon.png
│   └── og-image.png
│
├── splash/
│   ├── splash-2048x2732.png
│   ├── splash-1668x2388.png
│   └── ... (all iOS sizes)
│
└── colors/
    └── palette.md              # HEX, RGB, HSL, CMYK values
```

---

## Color System Documentation Template

```markdown
# {Brand Name} Color Palette

## Primary Colors

### Indigo (Primary)
- HEX: #4B0082
- RGB: 75, 0, 130
- HSL: 275, 100%, 25%
- CMYK: 42, 100, 0, 49

### Violet (Secondary)
- HEX: #8B5CF6
- RGB: 139, 92, 246
- HSL: 258, 90%, 66%
- CMYK: 43, 63, 0, 4

### Cyan (Accent)
- HEX: #00FFFF
- RGB: 0, 255, 255
- HSL: 180, 100%, 50%
- CMYK: 100, 0, 0, 0

## Background Colors

### Deep Space
- HEX: #0A0A0A
- Usage: Primary dark background

### Cosmic Purple
- HEX: #1a0a2e
- Usage: Gradient backgrounds

## Usage Guidelines

- Primary: Headers, CTAs, key brand moments
- Secondary: Supporting elements, hover states
- Accent: Highlights, notifications, emphasis
- Always maintain 4.5:1 contrast ratio for accessibility
```

---

## Quick Reference Commands

### Start New Brand
```
"Create brand kit for [name] - [industry]. Style: [aesthetic]. Colors: [describe]."
```

### Generate Assets from Logo
```
"Generate all PWA and social assets from this logo. Brand colors: [primary], [accent]."
```

### Style Consistency Check
```
"Review these assets for brand consistency. Brand DNA: [describe style]."
```

### Export Checklist
```
"Generate export checklist for [brand]. Include: PWA, social, favicons, OG images."
```

---

## Integration Notes

### Canva MCP (Preferred)
When connected to Canva via MCP:
- Find and list your existing designs
- Export designs at any custom size (40-8000px)
- Export as PNG, JPG, PDF, GIF, MP4
- No OAuth setup needed - MCP handles auth via browser
- Works with free Canva plan (autofill requires Enterprise)

**Setup:** `claude mcp add --transport http Canva https://mcp.canva.com/mcp`

### Image Generation Tools
- **Grok Imagine**: Best for quick iterations (X.com)
- **Banana3**: Great for artistic/abstract
- **Midjourney**: Highest quality, needs Discord
- **DALL-E**: Good for icons/simple graphics
- **Gemini**: Good for album art with Google AI

---

## Checklist: Complete Brand Kit

- [ ] Brand DNA documented (colors, fonts, values)
- [ ] Primary logo (SVG + PNG)
- [ ] Logo variations (dark, light, icon-only)
- [ ] All PWA manifest icons (72-512px)
- [ ] All favicons (16, 32, 180, 192, 512)
- [ ] Telegram bot avatar
- [ ] Twitter profile + header
- [ ] LinkedIn profile + banner
- [ ] Instagram profile
- [ ] Facebook profile + cover
- [ ] OG image for social sharing
- [ ] iOS splash screens (if PWA)
- [ ] Color palette documentation
- [ ] Brand guidelines README

---

*Last Updated: December 2025*
*Skill Author: To The Stars Creative Studio*
