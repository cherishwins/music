# Hit Song Analysis Framework
## Systematic Research for Genre-Specific Hit Production

---

## CURRENT FOCUS

**Region**: North America (US/Canada)
**Bridge Target**: Korean market crossover appeal
**Goal**: Extract patterns that work in both markets

---

## GENRE CANDIDATES (North America → Korea Bridge)

| Genre | NA Appeal | Korea Crossover Potential | Notes |
|-------|-----------|---------------------------|-------|
| **Trap/Hip-Hop** | Massive | HIGH - K-hip-hop huge | 808s, flow patterns translate |
| **R&B/Soul** | Strong | HIGH - K-R&B established | Emotional delivery, vocal runs |
| **Pop-Rap** | Mainstream | HIGH - Similar to K-pop rap | Catchy hooks + verses |
| **Drill** | Growing | MEDIUM - Underground scene | Aggressive, distinctive |
| **Lo-fi Hip-Hop** | Streaming giant | HIGH - Study culture | Chill beats, universal |

**Recommended Start**: **Emotional Trap/Hip-Hop** - bridges both markets perfectly

---

## RESEARCH PROMPTS

### PROMPT 1: Chart Analysis (Billboard/Spotify)
```
Analyze the Top 20 Hip-Hop/Rap songs on Billboard Hot 100 and Spotify US
from 2023-2024. For each song, extract:

1. STRUCTURAL DATA
   - Song length (total seconds)
   - Time to first hook (seconds)
   - Number of distinct sections
   - Hook repetitions
   - Verse count

2. PRODUCTION DATA
   - BPM (beats per minute)
   - Key (major/minor)
   - Primary instruments
   - 808 pattern style
   - Hi-hat pattern style
   - Melodic elements

3. LYRICAL DATA
   - Theme categories (flex, struggle, love, party, introspective)
   - Rhyme scheme per verse
   - Average syllables per bar
   - Hook word count
   - Profanity level (clean/moderate/explicit)
   - Languages used

4. VOCAL DATA
   - Vocal style (rap/melodic rap/singing/mixed)
   - Delivery energy (laid-back/moderate/aggressive)
   - Ad-lib frequency
   - Autotune usage
   - Vocal layering

5. CULTURAL MARKERS
   - Regional references
   - Slang terms
   - Brand mentions
   - Social media references

Output as structured data for pattern analysis.
```

### PROMPT 2: Korean Crossover Success Analysis
```
Analyze songs that have succeeded in BOTH US and Korean markets:

EXAMPLES TO ANALYZE:
- BTS collaborations with US artists
- BLACKPINK crossover hits
- Korean-American artists (Jay Park, Dumbfoundead, etc.)
- US artists popular in Korea (Post Malone, Drake, The Weeknd)

For each, identify:

1. WHAT TRANSLATES
   - Musical elements that work in both markets
   - Themes that resonate universally
   - Production styles that cross over
   - Vocal approaches that appeal to both

2. KOREAN MARKET SPECIFICS
   - What Korean listeners respond to in Western music
   - Why certain US artists are huge in Korea
   - What K-hip-hop borrows from US
   - What US artists could learn from K-music

3. BRIDGE ELEMENTS
   - How to include Korean without alienating US
   - Code-switching patterns that work
   - Visual/aesthetic elements that cross over
   - Marketing approaches for dual markets

Output specific patterns and techniques.
```

### PROMPT 3: Emotional/Motivational Hip-Hop Deep Dive
```
Deep analysis of emotional/motivational hip-hop hits (2020-2024):

TARGET SONGS (examples):
- "Life Is Good" - Future ft. Drake
- "Laugh Now Cry Later" - Drake ft. Lil Durk
- "HUMBLE." - Kendrick Lamar
- "God's Plan" - Drake
- "Stronger" - Kanye West
- "Lose Yourself" - Eminem
- "No Role Modelz" - J. Cole
- Any NF song (known for emotional content)

For each song, extract:

1. EMOTIONAL ARC
   - Opening emotion
   - Tension building techniques
   - Climax point (timestamp)
   - Resolution/ending emotion
   - How production supports emotional journey

2. LYRICAL TECHNIQUES
   - Storytelling vs. boasting ratio
   - Vulnerability moments
   - Triumph/overcoming moments
   - Specific word choices that hit emotionally
   - Metaphors and imagery used

3. HOOK PSYCHOLOGY
   - Why is the hook memorable?
   - Melodic hook vs. rhythmic hook
   - Repetition patterns
   - Singability factor (can audience join in?)

4. PRODUCTION SUPPORT
   - How beat supports emotion
   - Dynamic changes (quiet vs. loud)
   - Instrument choices for emotion
   - Space in the mix for vocals

5. WHAT MAKES IT REPLAY-WORTHY
   - The "earworm" element
   - Quotable lines
   - Meme potential
   - Gym/motivation usage

Output actionable insights for replication.
```

### PROMPT 4: Beat Pattern Analysis
```
Technical analysis of beat patterns in US hip-hop hits (2022-2024):

CATEGORIES TO ANALYZE:

1. DRUM PATTERNS
   - Kick placement (on-beat, syncopated, trap rolls)
   - Snare/clap patterns (2 and 4, offbeat variations)
   - Hi-hat patterns (straight 8ths, trap rolls, swing)
   - Percussion layers (shakers, clicks, textures)

2. 808 BASS PATTERNS
   - Note duration (short punch vs. long sustain)
   - Slide usage
   - Distortion amount
   - Root note movement patterns
   - Octave jumps

3. MELODIC PATTERNS
   - Scale choices (minor pentatonic dominant)
   - Arpeggio patterns
   - Counter-melodies
   - Sample chops vs. original melodies
   - Piano/keys presence

4. ARRANGEMENT PATTERNS
   - Intro length
   - When drums enter
   - When bass enters
   - Section transition techniques
   - Drop/build patterns
   - Outro approach

5. MIX CHARACTERISTICS
   - Vocal placement (front/mid)
   - Low end weight
   - High frequency sparkle
   - Stereo width
   - Compression style

Output as production templates.
```

### PROMPT 5: Korean Language Integration Research
```
Research how to effectively integrate Korean into English hip-hop:

1. SUCCESSFUL EXAMPLES
   - K-pop songs with English hooks
   - US songs with Korean features
   - Bilingual rapper techniques

2. INTEGRATION PATTERNS
   - When to switch languages
   - How much Korean is effective (percentage)
   - Which words/phrases work in Korean for US ears
   - Sound-alike patterns (English words that sound Korean)
   - Korean words that sound cool to Western ears

3. CULTURAL SENSITIVITY
   - What to avoid
   - Respectful integration vs. appropriation
   - Authentic collaboration markers
   - How to signal genuine connection to Korea

4. PHONETIC CONSIDERATIONS
   - Korean syllable patterns in English beats
   - How Korean flows differently
   - Adapting English patterns for Korean phonetics
   - Words that work in both languages

5. HOOK STRATEGIES
   - Korean hook with English verses
   - English hook with Korean adlibs
   - Code-switching within hooks
   - Teaching Korean phrases through repetition

Output specific integration techniques.
```

---

## DATA COLLECTION TEMPLATE

For each hit song analyzed:

```yaml
song:
  title: ""
  artist: ""
  year:
  peak_position:
  weeks_on_chart:
  spotify_streams:

structure:
  length_seconds:
  sections:
    - name: "intro"
      start: 0
      end:
    - name: "verse_1"
      start:
      end:
    # etc
  hook_count:
  time_to_first_hook:

production:
  bpm:
  key: ""
  mode: ""  # major/minor
  primary_instruments: []
  drum_pattern: ""
  bass_style: ""
  melody_type: ""

lyrics:
  theme: ""
  rhyme_scheme: ""
  syllable_density: ""  # low/medium/high
  hook_words: []
  quotable_lines: []
  language_mix: ""

vocals:
  style: ""
  energy: ""
  effects: []
  ad_libs: []

cultural:
  target_demographic: ""
  crossover_elements: []
  korea_appeal_factors: []
```

---

## ANALYSIS OUTPUT FORMAT

After collecting data, produce:

### 1. Pattern Summary
```
CONSISTENT PATTERNS ACROSS HITS:
- 85% use minor key
- Average BPM: 135-145
- Hook appears by 0:45
- etc.
```

### 2. Production Template
```
WINNING FORMULA:
- BPM: 140 ± 5
- Key: Minor (C#m, Am, Em most common)
- Drums: Trap pattern with hi-hat rolls
- Bass: 808 with moderate sustain, slight distortion
- Melody: Dark piano or synth arpeggio
```

### 3. Lyrical Framework
```
THEME BALANCE:
- 40% struggle/real talk
- 30% triumph/flex
- 20% relationships
- 10% lifestyle

HOOK REQUIREMENTS:
- Max 10 words
- One key phrase
- Melodic element
```

### 4. Cultural Bridge Notes
```
KOREA CROSSOVER CHECKLIST:
- [ ] Emotional authenticity
- [ ] Technical vocal skill
- [ ] Clean production quality
- [ ] Visual aesthetic consideration
- [ ] Respectful cultural reference
```

---

## NEXT STEPS

1. **Run PROMPT 1** - Get baseline chart data
2. **Run PROMPT 2** - Identify crossover patterns
3. **Run PROMPT 3** - Deep dive emotional hits
4. **Synthesize** - Create master pattern file
5. **Test** - Generate compositions using patterns
6. **Iterate** - Refine based on output quality

---

*"Don't guess what hits. Study what hits."*
