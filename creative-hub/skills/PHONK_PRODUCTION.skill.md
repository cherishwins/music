# SKILL: Phonk Production Deep Dive
## From Memphis to Moscow to Seoul - The Complete Phonk Guide

*"Cowbell + distorted 808 + darkness = phonk. Now let's get specific."*

---

## PHONK FAMILY TREE

```
Memphis Rap (90s)
    |
    +-- DJ Screw (Chopped & Screwed)
    |
    +-- Three 6 Mafia, DJ Spanish Fly
            |
            v
    +-------------------+
    |   PHONK (2010s)   | <- SpaceGhostPurrp coins term
    +-------------------+
            |
    +-------+-------+-----------+----------+
    v               v           v          v
Classic Phonk   Drift Phonk  Wave Phonk  Brazilian Phonk
(Dark, slow)   (Fast, cowbell) (Ambient)  (Funk carioca)
    |               |
    |               +-- K-Phonk (Korean fusion)
    |
    +-- Dirty Phonk (Horror vibes)
```

---

## THE PHONK DNA

### Core Sound Signature

**1. The 808 Cowbell**
```
THE defining element of modern phonk.
Source: Roland TR-808 drum machine
Character: Metallic, pitched, melodic
Usage: Lead melody instrument (not just percussion)

Tuning approach:
- Root note: Usually minor key
- Add minor 2nd (Phrygian) for darkness
- Keep range within one octave
- Repeat hypnotically
```

**2. The Distorted 808 Bass**
```
Not just bass - a WEAPON.

Processing chain:
Input -> Saturation -> Soft clip -> Hard clip -> EQ boost low

Settings to try:
- Saturation: 60-80% drive
- Soft clip threshold: -6dB
- Hard clip ceiling: -1dB
- EQ: +3dB at 50Hz, cut 200-400Hz mud

Result: Bass that PUNCHES, doesn't just rumble
```

**3. The Thin Snare**
```
NOT a thick trap snare.
Phonk snares are:
- High frequency dominant
- Snappy, cracking
- Short decay
- Cuts through distorted bass

EQ approach:
- High pass at 200Hz
- Boost 2-4kHz for snap
- Reduce body, increase crack
```

**4. Lo-Fi Texture**
```
Everything should feel degraded.

Techniques:
- Tape saturation on master
- Vinyl crackle layer (subtle)
- Bitcrushing on elements
- Sample rate reduction
- Slight pitch wobble
```

---

## DRIFT PHONK SPECIFICS

### The Russian Wave

Drift phonk emerged from Russia/Eastern Europe around 2016-2018. Key producers:
- **Kordhell** (Murder in My Mind)
- **Interworld** (Metamorphosis)
- **DXRK** (RAVE)
- **Pharmacist**
- **KAITO SHOMA** (Scary Garry - considered first drift phonk)

### Drift Phonk Formula

```
BPM: 140-160 (sweet spot: 145)
Key: Minor (Phrygian mode preferred)
Structure: Usually no traditional verse/chorus - just BUILDS

Elements (in order of importance):
1. 808 Cowbell melody - LEAD INSTRUMENT
2. Distorted 808 bass - follows cowbell or kick
3. Punchy kick - usually layered with 808
4. Thin snare - on 2 and 4
5. Hi-hats - rolling, aggressive
6. Atmosphere - pads, fx, vocal chops
```

### Cowbell Melody Theory

**The Phrygian Secret:**
```
Standard minor: 1 2 b3 4 5 b6 b7
Phrygian mode:  1 b2 b3 4 5 b6 b7
                  ^
           This flat 2 = DARKNESS

Example in E:
E minor: E F# G A B C D
E Phrygian: E F G A B C D
            ^
        F instead of F# = instant menace
```

**Cowbell Pattern Templates:**
```
Pattern 1 - Hypnotic Loop (4 bars):
|1---b2--1---|1---b3--5---|1---b2--1---|5---b3--1---|

Pattern 2 - Aggressive Stabs:
|1-1-1---5---|b2-b2-5-----|1-1-1---5---|b3-----1----|

Pattern 3 - Melodic Run:
|1-b2-b3-5---|b3-b2-1-----|1-b2-b3-5---|5-b3-b2-1---|
```

---

## PRODUCTION SETTINGS

### 808 Bass Settings

**For Drift Phonk (Aggressive):**
```yaml
oscillator:
  waveform: sine_with_harmonics
  pitch_envelope: slight_drop  # That "bwow" sound

amp_envelope:
  attack: 5ms
  decay: 800ms
  sustain: 0.7
  release: 500ms

distortion:
  type: hard_clip
  drive: 75%
  mix: 100%  # Full wet

eq:
  low_shelf: +4dB @ 50Hz
  cut: -6dB @ 300Hz  # Remove mud
  presence: +2dB @ 1kHz  # Audible on small speakers
```

**For Classic Phonk (Warm):**
```yaml
oscillator:
  waveform: pure_sine
  pitch_envelope: none

amp_envelope:
  attack: 10ms
  decay: 1200ms  # Longer sustain
  sustain: 0.5
  release: 800ms

saturation:
  type: tape
  drive: 40%
  mix: 70%

eq:
  low_shelf: +3dB @ 60Hz
  warmth: +2dB @ 200Hz
```

### Drum Pattern Templates

**Drift Phonk Drums (145 BPM):**
```
KICK:  |X---X---X---X---|X---X---X---X---|
SNARE: |----X-------X---|----X-------X---|
HAT:   |X-X-X-X-X-X-X-X-|X-X-X-X-X-X-X-X-|
COWBL: |X---X-X-X---X---|X-X-X---X-X-----|

HAT velocity pattern (1-10):
       |8-5-7-4-9-5-7-5-|8-5-7-4-9-5-7-6-|

Add hat rolls on beat 4:
       |X-X-X-X-X-X-XXXX|
```

**Classic Phonk Drums (75 BPM half-time feel):**
```
KICK:  |X-------X-------|X-------X-------|
SNARE: |--------X-------|--------X-------|
HAT:   |--X---X---X---X-|--X---X---X---X-|
PERC:  |X-----------X---|X-----------X---|
```

### Mix Settings

**Frequency Allocation:**
```
Sub bass (808):     30-80 Hz   - MONO, dominant
Bass body:          80-200 Hz  - Slight cut for clarity
Kick punch:         60-100 Hz  - Duck under 808
Snare body:         200-500 Hz - Thin, not thick
Snare crack:        2-5 kHz    - Boosted
Hi-hats:            6-12 kHz   - Presence
Cowbell:            1-4 kHz    - Cuts through
Air/texture:        10-16 kHz  - Subtle
```

**Master Chain:**
```
1. EQ: Slight smile curve (+2dB @ 60Hz, +1dB @ 10kHz)
2. Saturation: Tape, 20-30% for warmth
3. Compression: 2:1 ratio, slow attack, medium release
4. Limiter: -1dB ceiling, 3-6dB gain reduction
5. LUFS target: -10 to -8 for phonk (louder than streaming standard)
```

---

## K-PHONK FUSION GUIDE

### What Makes It "Korean"

**Traditional Elements to Add:**
```
Gayageum - 12-string zither
- Plucked, ethereal, melancholic
- Use in breakdowns or intros
- Pitch shift to match minor key

Janggu - Hourglass drum
- Layer subtly with kick
- Adds organic texture to electronic drums
- Don't overpower 808

Daegeum - Bamboo flute
- Haunting, breathy
- Use as atmospheric element
- Great for transitions

Haegeum - Two-string fiddle
- Dark, crying sound
- Perfect for dark phonk fusion
- Can replace or layer with synth leads
```

**K-Pop/K-Hip-Hop Influence:**
```
- Cleaner mix than Russian phonk
- More melodic hooks
- Bilingual potential (Korean/English)
- K-drama emotional sensibility
- Anime visual culture overlap
```

### K-Phonk Production Template

**Intro (8 bars):**
```
- Traditional instrument solo (gayageum)
- Lo-fi texture fades in
- Hint of cowbell at end
```

**Build (8 bars):**
```
- Kick enters
- 808 starts (not distorted yet)
- Cowbell melody begins
- Building filter sweep
```

**Drop (16 bars):**
```
- FULL distorted 808
- Aggressive cowbell melody
- Complete drum pattern
- Traditional element as counter-melody
```

**Breakdown (8 bars):**
```
- Strip to traditional + bass
- Emotional moment
- Build tension for second drop
```

---

## AI GENERATION PROMPTS

### Drift Phonk Prompts

**For ElevenLabs:**
```
"Aggressive drift phonk instrumental, 145 BPM, E minor.
808 cowbell as lead melody, hypnotic repeating pattern.
Heavily distorted 808 bass, clipping and aggressive.
Thin snapping snare on 2 and 4.
Rolling hi-hats with velocity variation.
Lo-fi texture, tape saturation feel.
Dark, menacing, high energy.
Made for racing videos and anime edits."
```

### K-Phonk Prompts

**ElevenLabs:**
```
"Korean phonk fusion instrumental, 142 BPM, D minor.
Drift phonk base with 808 cowbell melody.
Distorted 808 bass but slightly cleaner than standard phonk.
Traditional Korean string sample (gayageum) in breakdown.
K-pop influenced melodic section.
Blend of aggressive phonk energy with Korean melodic sensibility.
Lo-fi texture but not too degraded.
Anime/gaming energy with Korean cultural elements."
```

### JucheGang Character Phonk

**Jangmadang Jenny (Aggressive):**
```
"Aggressive Korean drift phonk, 148 BPM, F# minor.
808 cowbell melody with attitude.
HEAVILY distorted bass, market sounds layered subtly.
Fast rolling hi-hats, aggressive snare.
Korean female vocal chop (just syllables, unintelligible).
Lo-fi tape texture.
Black market hustle energy, female empowerment.
Think: Cardi B production meets Korean phonk."
```

**K-Drama Trauma (Dark/Mysterious):**
```
"Dark atmospheric phonk, 132 BPM, B minor.
Glitchy, stuttering 808 bass.
Eerie synth pads, horror movie feel.
Sparse cowbell hits (not melodic, punctuation).
Korean TV static sample in intro.
Surveillance camera click sounds.
Paranoid, secretive energy.
Like watching forbidden content at 3AM."
```

---

## JUCHEGANG PHONK VARIATIONS

### The Six Flavors

| Artist | Phonk Type | Key Element | Energy |
|--------|-----------|-------------|--------|
| Fresh Prince | NOT phonk (trap) | Brass, piano | Smooth flex |
| Jenny | Aggressive drift | Market sounds | Maximum |
| Seoul Survivor | NOT phonk (boom bap) | Piano, strings | Building |
| K-Drama Trauma | Dark/atmospheric | Glitch, static | Paranoid |
| Halmeoni | NOT phonk (traditional) | Live instruments | Wise |
| Ensemble "38" | K-phonk fusion | All elements | Epic |

### When to Use Phonk vs Other Styles

**Use Phonk for:**
- High energy moments
- Aggressive characters (Jenny)
- TikTok/viral potential
- Action sequences in animated series

**Use Trap for:**
- Smooth flex moments (Fresh Prince)
- Versatile vocal delivery
- Mainstream accessibility

**Use Boom Bap for:**
- Storytelling tracks
- Emotional depth (Seoul Survivor)
- Technical rap showcase
- Elder wisdom (Halmeoni)

---

## QUALITY CHECKLIST

### Phonk Beat Quality Standards

- [ ] Cowbell melody is hypnotic (can loop forever)
- [ ] 808 is distorted but still has sub presence
- [ ] Snare cuts through the distortion
- [ ] Hi-hats have human feel (velocity variation)
- [ ] Lo-fi texture is present but not overwhelming
- [ ] Key is minor (Phrygian bonus points)
- [ ] BPM is 140-150 for drift, 60-90 for classic
- [ ] Would work in a street racing edit
- [ ] Bass shakes but doesn't mud

### K-Phonk Specific Checks

- [ ] Traditional Korean element is present
- [ ] Cleaner than pure Russian phonk
- [ ] Has melodic moment (not just aggression)
- [ ] Could appeal to K-hip-hop audience
- [ ] Balances East and West sonic elements

---

*"The cowbell is the voice. The 808 is the heartbeat. The distortion is the attitude."*
