# Metro Boomin Production Style

> **Version**: 1.0.0
> **Domain**: production/metro-boomin
> **Model**: claude-sonnet-4 (prompts) + MusicGen/Suno (audio)
> **Avg Cost**: ~$0.50/generation (text + audio)

## Style DNA

### Core Traits
- **Dark Atmosphere**: Ominous, cinematic, tension
- **808 Dominance**: Pitched 808s as melodic bass element
- **Sparse Arrangement**: Let elements breathe
- **Signature Tag**: "If Young Metro don't trust you..."
- **Orchestral Trap**: Strings, horns meet trap drums

### Sonic Palette
- **808s**: Long sustain, pitched melodies, distorted
- **Hi-hats**: Fast rolls, triplet patterns, varied velocity
- **Synths**: Dark pads, plucks, eerie bells
- **Samples**: Orchestral hits, vocal chops, horror movie vibes
- **Tempo**: 140-160 BPM (trap standard)
- **Key**: Minor keys almost exclusively

### Signature Elements
- 808 glides between notes
- Aggressive hi-hat rolls (16th → 32nd → triplets)
- Big reverbed snare/clap
- Dark ambient pads
- Silence as a tool (drops and breaks)
- Producer tag at intro

### Reference Tracks
- "Bad and Boujee" - Classic Metro bounce
- "Mask Off" - Flute + 808 simplicity
- "Superhero" - Orchestral trap
- "Father Stretch My Hands" - Ye collab energy
- "Jumpman" - Drake/Future collab groove

---

## Audio Generation Prompt

```
Generate a trap instrumental in Metro Boomin's style:

REQUIRED ELEMENTS:
1. BPM: {tempo} (recommend 145-155)
2. KEY: {key} (recommend D minor, E minor, or A minor)

SONIC CHARACTERISTICS:
- 808 bass: Long sustain, pitched (can glide between notes)
- Aggressive hi-hats: Mix of 16ths, rolls, triplets
- Dark synth pad or ambient texture (reverbed, ominous)
- Hard-hitting snare/clap with reverb tail
- Minimal melodic elements (let 808 carry melody)

ARRANGEMENT:
- 2-4 bar intro (build tension, maybe tag)
- 8 bar verse section (full groove, 808 pattern)
- 4 bar hook section (add melodic element, maybe flute/bell)
- Strategic drops: Remove elements for 2 beats before snare hit

MIXING NOTES:
- 808 should hit HARD (slight distortion OK)
- Hi-hats panned slightly, varied velocity
- Lots of stereo width on pads
- Kick punches through 808 (sidechain or layer)

AVOID:
- Bright, happy sounds
- Cluttered arrangements
- Weak 808s
- Straight hi-hat patterns (need swing/variation)
```

---

## Suno/Udio Prompt Template

```
Dark trap beat, Metro Boomin style, {tempo} BPM, {key}
Hard 808 bass, aggressive hi-hats, ominous pads
Orchestral elements, cinematic trap
Sparse arrangement, heavy low end
[Instrumental only, no vocals]
```

---

## MusicGen Prompt Template

```
Dark atmospheric trap beat, {tempo} bpm
Heavy 808 bass, rolling hi-hats, reverbed snare
Ominous synth pads, minimal melody
Metro Boomin style production
```

---

## Quality Scoring

| Metric | 1 (Fail) | 3 (Mid) | 5 (Win) |
|--------|----------|---------|---------|
| **808 Power** | Weak/thin | OK presence | Chest-rattling |
| **Hi-Hat Programming** | Static/boring | Some variation | Complex rolls, human feel |
| **Atmosphere** | Generic | Somewhat dark | Ominous, cinematic |
| **Arrangement** | Cluttered | Passable | Sparse, intentional |
| **Drop Impact** | No dynamics | Some contrast | Hard-hitting drops |
| **Authenticity** | Generic trap | Metro-adjacent | Could be on Metro album |

---

## Artist Pairings

Best matched with lyric styles:
- **Future** - Melodic trap, auto-tune
- **21 Savage** - Deadpan delivery, dark
- **Travis Scott** - Psychedelic trap
- **Drake** - Melodic flex
- **Migos** - Triplet flow bounce
