# Dr. Dre Production Style

> **Version**: 1.0.0
> **Domain**: production/dr-dre
> **Model**: claude-sonnet-4 (prompts) + MusicGen/Suno (audio)
> **Avg Cost**: ~$0.50/generation (text + audio)

## Style DNA

### Core Traits
- **G-Funk Foundation**: Synth-heavy, Parliament-Funkadelic samples
- **Low End Theory**: Deep, sub-rattling 808s and bass
- **Precision Engineering**: Every element EQ'd perfectly
- **West Coast Bounce**: Head-nodding pocket groove
- **Cinematic Scope**: Intro/outro, builds, dramatic tension

### Sonic Palette
- **Synths**: Moog bass, Rhodes, warm pads
- **Drums**: Punchy kick, snappy snare, hi-hat shuffle
- **Samples**: P-Funk, soul, orchestral stabs
- **Tempo**: 90-100 BPM (classic) or 75-85 BPM (modern slow)
- **Key**: Minor keys for drama, major for bounce

### Signature Elements
- Talk box (vocoder effects)
- Piano chords (2001 era)
- String sections
- Whistling melodies
- "That Dre sound" - clean, punchy, warm

### Reference Tracks
- "Still D.R.E." - Iconic piano, bounce
- "The Next Episode" - G-Funk synths, bass
- "Nuthin' but a 'G' Thang" - Sample flip, groove
- "I Need a Doctor" - Cinematic, emotional
- "Forgot About Dre" - Aggressive, punchy

---

## Audio Generation Prompt

```
Generate a hip-hop instrumental in Dr. Dre's style:

REQUIRED ELEMENTS:
1. BPM: {tempo} (recommend 92-98)
2. KEY: {key} (recommend G minor or C minor)

SONIC CHARACTERISTICS:
- Deep, warm bass (Moog-style) hitting on the 1 and 3
- Punchy kick drum, perfectly EQ'd (no mud)
- Snare with presence, not thin
- Hi-hat shuffle (not straight 8ths)
- Synth pads providing warmth
- Piano or Rhodes for melodic hook

ARRANGEMENT:
- 4 bar intro (drums build)
- 8 bar verse section (full groove)
- 4 bar hook section (add melodic element)
- Variation every 4 bars to maintain interest

MIXING NOTES:
- Bass and kick shouldn't fight (sidechain or carve EQ)
- Leave headroom for vocals
- Slight tape saturation warmth
- Wide stereo on pads, mono on bass

AVOID:
- Thin, digital-sounding drums
- Muddy low end
- Overly busy arrangements
- Modern trap hi-hat patterns
```

---

## Suno/Udio Prompt Template

```
G-funk west coast hip hop beat, {tempo} BPM, {key}
Moog bass, warm synth pads, punchy drums
Dr. Dre style production, piano chords
Clean mix, head-nodding groove
Cinematic, professional quality
[Instrumental only, no vocals]
```

---

## MusicGen Prompt Template

```
West coast g-funk hip hop instrumental, {tempo} bpm
Deep bass, funky synths, punchy drums, piano melody
Professional mix, warm analog sound
Dr Dre style production
```

---

## Quality Scoring

| Metric | 1 (Fail) | 3 (Mid) | 5 (Win) |
|--------|----------|---------|---------|
| **Low End** | Muddy/weak | Decent bass | Deep, clean, powerful |
| **Drums** | Thin/stock | OK punch | Punchy, balanced |
| **Synths** | Cheap/cold | Passable | Warm, G-funk authentic |
| **Groove** | Stiff | Decent bounce | Head-nodding pocket |
| **Mix Clarity** | Cluttered | Reasonable | Crystal clear, wide |
| **Authenticity** | Generic | Dre-adjacent | Unmistakably West Coast |

---

## Integration Notes

For thread-to-hit pipeline:
1. Generate prompt from lyric mood/theme
2. Call audio API with Dre-style template
3. Score output with rubric
4. Iterate if score < 4.0 average
