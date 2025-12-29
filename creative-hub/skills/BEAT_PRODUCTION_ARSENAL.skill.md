# SKILL: Beat Production Arsenal
## Trap, Phonk, K-Phonk & The JucheGang Signature Sound

*"The 808 doesn't lie. The cowbell doesn't either."*

---

## THE BEAT MAKERS - YOUR OPTIONS

### Tier 1: Full Control (Recommended)

| Platform | API? | Best For | Cost | Commercial Rights |
|----------|------|----------|------|-------------------|
| **ElevenLabs Music** | ✅ Official | Full songs + vocals | Credits | ✅ Yes |
| **Suno** | ✅ Unofficial wrappers | Full songs + vocals | $10-30/mo | ✅ Pro+ plans |
| **Udio** | ⚠️ Limited | Best vocal quality | Free tier + paid | ✅ Paid plans |
| **Soundraw** | ✅ Official | Instrumentals only | $17/mo | ✅ Yes |

### Tier 2: Quick Generation

| Platform | API? | Best For | Notes |
|----------|------|----------|-------|
| **BandLab SongStarter** | ❌ UI only | Quick phonk ideas | Free, has "Drift Phonk" preset |
| **Mubert** | ✅ Yes | Background music | Royalty-free, credit required |
| **Beatoven.ai** | ✅ Yes | Mood-based BGM | $3/min downloads |

### Tier 3: Sample-Based Production

| Source | Type | Best For |
|--------|------|----------|
| **Splice** | Samples/Loops | Professional quality, legal |
| **Looperman** | Free samples | Community loops |
| **Sample Focus** | Free one-shots | 808s, cowbells, drums |
| **Landr Samples** | Curated packs | Genre-specific |

---

## API ACCESS DETAILS

### ElevenLabs Music (Primary)
```python
from elevenlabs import ElevenLabs
client = ElevenLabs(api_key="your-key")

# Generate instrumental beat
beat = client.music.compose(
    prompt="Hard trap beat, 140 BPM, aggressive 808s, dark melody",
    music_length_ms=180000,
    force_instrumental=True
)
```

### Suno API (Via Wrappers)

**Option 1: CometAPI (Recommended)**
```bash
# Pricing: ~$0.05-0.14 per generation
curl -X POST 'https://api.cometapi.com/v1/suno/create' \
  -H 'Authorization: Bearer YOUR_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "custom_mode": true,
    "prompt": "[Instrumental]\nAggressive drift phonk beat with 808 cowbell melody",
    "tags": "phonk, trap, instrumental, aggressive",
    "make_instrumental": true,
    "mv": "chirp-v4"
  }'
```

**Option 2: MusicAPI.ai**
```python
import requests

response = requests.post(
    'https://api.musicapi.ai/api/v1/sonic/create',
    headers={
        'Authorization': 'Bearer YOUR_KEY',
        'Content-Type': 'application/json'
    },
    json={
        "custom_mode": True,
        "prompt": "Korean trap beat with traditional instrument sample",
        "tags": "trap, korean, instrumental",
        "make_instrumental": True
    }
)
```

**Option 3: Self-Hosted suno-api**
```bash
# Clone: https://github.com/gcui-art/suno-api
# Requires: Suno account cookie + 2Captcha for CAPTCHA solving
# Free if you have Suno subscription
```

---

## THE JUCHEGANG SIGNATURE SOUND

### Our Unique Fusion Formula

```
JUCHEGANG SOUND =
    Trap Foundation (808s, hi-hats, snares)
  + Phonk Aggression (distortion, cowbell option)
  + Korean Traditional (gayageum, janggu, daegeum samples)
  + Political Undertone (propaganda samples flipped)
  + Reunification Theme (North + South sonic elements)
```

### Sound DNA by Character

**Fresh Prince of Pyongyang**
```yaml
base: Polished trap (not phonk)
signature: Moranbong Band brass samples (flipped satirically)
808: Clean, sustained, not distorted
melody: Minor key piano + brass hits
feel: "Rich kid sad" - Drake meets DPRK state music
tempo: 135-145 BPM
```

**Jangmadang Jenny**
```yaml
base: Aggressive drift phonk
signature: Market sounds (coins, haggling) as percussion
808: HEAVILY distorted, aggressive
melody: Cowbell + dark synth stabs
feel: Cardi B energy meets black market hustle
tempo: 145-155 BPM
```

**Seoul Survivor**
```yaml
base: Emotional boom bap
signature: Seoul urban sounds (subway, delivery scooters)
808: Punchy but not distorted
melody: Piano-driven, melancholic
feel: Eminem "Lose Yourself" meets Hell Joseon
tempo: 88-95 BPM
build: Starts sparse, EXPLODES at climax
```

**K-Drama Trauma**
```yaml
base: Dark atmospheric phonk
signature: K-drama OST samples (distorted)
808: Glitchy, stuttering
melody: Eerie synths + surveillance sounds
feel: Paranoid, secretive, rebellious
tempo: 125-135 BPM
fx: Heavy distortion on everything
```

**Halmeoni Flow**
```yaml
base: Traditional fusion boom bap
signature: Live traditional instruments (not samples)
808: Warm, round, respectful
melody: Pansori vocal techniques over modern beat
feel: Grandmaster Flash meets Korean folk
tempo: 90-100 BPM
```

---

## BEAT GENERATION PROMPTS

### Trap Beat Prompts (ElevenLabs/Suno)

**Hard Trap:**
```
"Aggressive trap beat, 140 BPM, F minor.
Hard-hitting 808 with long sustain, punchy kick.
Rolling trap hi-hats with velocity variation.
Dark synth melody, minimal but menacing.
Snare on 2 and 4, occasional rolls.
Space for rap vocals in verses."
```

**Melodic Trap:**
```
"Melodic trap beat, 135 BPM, A minor.
Emotional piano chords with reverb.
Warm 808 bass, not too distorted.
Gentle hi-hat patterns, some triplet rolls.
Atmospheric pads in background.
Suitable for emotional rap vocals."
```

### Phonk Beat Prompts

**Drift Phonk:**
```
"Aggressive drift phonk, 145 BPM, E minor.
808 cowbell as main melody, hypnotic pattern.
HEAVILY distorted 808 bass, clipping allowed.
Thin snappy snare, cutting through mix.
Lo-fi texture, tape hiss, vinyl crackle.
No vocals, purely instrumental.
Racing/anime energy."
```

**Dark Phonk:**
```
"Dark atmospheric phonk, 130 BPM, B minor.
Eerie synth pads, horror movie feel.
Distorted 808, menacing presence.
Sparse cowbell hits, not melodic.
Chopped vocal sample (unintelligible).
Heavy reverb on everything.
Feels dangerous."
```

### K-Phonk / JucheGang Prompts

**K-Phonk Fusion:**
```
"Korean phonk fusion, 140 BPM, D minor.
Drift phonk base with 808 cowbell melody.
Subtle traditional Korean string sample in breakdown.
Distorted bass but cleaner than standard phonk.
K-pop influenced melodic hook section.
Mix of aggressive verses and melodic hooks."
```

**JucheGang Signature:**
```
"Korean reunification trap, 138 BPM, G minor.
Modern trap 808s with traditional Korean percussion hint.
Janggu (Korean drum) layered subtly with kick.
Dark melody with occasional brass stab (propaganda flip).
Space for bilingual Korean/English rap.
Builds from sparse intro to full production.
Theme: Two Koreas becoming one musically."
```

---

## API INTEGRATION CODE

### Complete Beat Generation Function
```python
import os
from elevenlabs import ElevenLabs

def generate_juchegang_beat(
    artist: str,
    mood: str = "aggressive",
    duration_ms: int = 180000
) -> bytes:
    """
    Generate a beat tailored to a JucheGang artist.

    Args:
        artist: One of 'fresh_prince', 'jenny', 'seoul_survivor',
                'kdrama_trauma', 'halmeoni'
        mood: 'aggressive', 'emotional', 'dark', 'triumphant'
        duration_ms: Length in milliseconds

    Returns:
        Audio bytes (MP3)
    """

    ARTIST_BEATS = {
        "fresh_prince": {
            "base": "polished trap, 140 BPM",
            "808": "clean sustained 808 bass",
            "melody": "minor key piano with brass stabs",
            "vibe": "satirical luxury, lonely undertone"
        },
        "jenny": {
            "base": "aggressive drift phonk, 148 BPM",
            "808": "heavily distorted 808, clipping",
            "melody": "808 cowbell melody, dark synth stabs",
            "vibe": "black market hustle, female power"
        },
        "seoul_survivor": {
            "base": "emotional boom bap, 92 BPM",
            "808": "punchy 808, warm not distorted",
            "melody": "melancholic piano, building strings",
            "vibe": "underdog anthem, explosive climax"
        },
        "kdrama_trauma": {
            "base": "dark atmospheric phonk, 130 BPM",
            "808": "glitchy stuttering bass",
            "melody": "eerie synths, surveillance sounds",
            "vibe": "paranoid, mysterious, rebellious"
        },
        "halmeoni": {
            "base": "traditional fusion boom bap, 95 BPM",
            "808": "warm round bass",
            "melody": "pansori influenced, traditional strings",
            "vibe": "wise elder, historical weight"
        }
    }

    config = ARTIST_BEATS.get(artist, ARTIST_BEATS["seoul_survivor"])

    prompt = f"""
    Instrumental beat for Korean hip-hop track.
    Style: {config['base']}
    Bass: {config['808']}
    Melody: {config['melody']}
    Energy: {mood}
    Vibe: {config['vibe']}

    Make it sound unique - blend traditional Korean elements subtly.
    Leave space for rap vocals.
    """

    client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

    beat = client.music.compose(
        prompt=prompt,
        music_length_ms=duration_ms,
        force_instrumental=True
    )

    return beat


# Usage
beat = generate_juchegang_beat("jenny", mood="aggressive")
with open("jenny_beat.mp3", "wb") as f:
    f.write(beat)
```

---

## QUALITY CHECKLIST

### Beat Quality Standards
- [ ] 808 hits hard but doesn't mud the mix
- [ ] Hi-hats have velocity variation (not robotic)
- [ ] Snare cuts through
- [ ] Melody doesn't fight vocal frequency range
- [ ] Low-end is mono (for club/streaming)
- [ ] Dynamic range: 8-10 dB
- [ ] Loudness: -14 LUFS for streaming

### JucheGang Signature Check
- [ ] Traditional Korean element present (even subtle)
- [ ] Matches artist character profile
- [ ] Leaves space for vocals
- [ ] Has energy arc (build/release)
- [ ] Unique - not generic trap

---

## RECOMMENDED SETUP

### For Maximum Flexibility
```
Primary: ElevenLabs Music API (best quality, official)
Backup: Suno via MusicAPI (more variety, cheaper)
Samples: Splice subscription (professional quality)
DAW: Any (for final touches, stem work)
```

### API Keys Needed
```bash
# .env file
ELEVENLABS_API_KEY=your_key
MUSICAPI_KEY=your_key  # For Suno wrapper
SPLICE_API_KEY=your_key  # Optional, for samples
```

---

*"The beat is the foundation. Build it strong, build it unique, build it JucheGang."*
