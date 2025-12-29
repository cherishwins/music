# ElevenLabs MCP Server Configuration
## For Claude Desktop Integration

---

## INSTALLATION

### Option 1: Using uvx (Recommended)
```bash
# Install uvx if not installed
pip install uvx

# The MCP server will be downloaded automatically when Claude Desktop starts
```

### Option 2: Using pip
```bash
pip install elevenlabs-mcp
```

---

## CLAUDE DESKTOP CONFIGURATION

### Location of Configuration File

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```
~/.config/claude/claude_desktop_config.json
```

### Configuration

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ElevenLabs": {
      "command": "uvx",
      "args": ["elevenlabs-mcp"],
      "env": {
        "ELEVENLABS_API_KEY": "YOUR_API_KEY_HERE",
        "ELEVENLABS_MCP_OUTPUT_MODE": "files",
        "ELEVENLABS_MCP_BASE_PATH": "/home/jesse/dev/projects/personal/music/creative-hub/outputs"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Options |
|----------|-------------|---------|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key | Required |
| `ELEVENLABS_MCP_OUTPUT_MODE` | How to return audio | `files`, `resources`, `both` |
| `ELEVENLABS_MCP_BASE_PATH` | Where to save audio files | Absolute path |

### Output Modes

- **`files`**: Saves audio to disk, returns file paths
- **`resources`**: Returns base64-encoded audio in MCP response
- **`both`**: Saves to disk AND returns base64

---

## AVAILABLE MCP TOOLS

When the ElevenLabs MCP server is configured, Claude Desktop gets access to:

### Music Generation Tools

| Tool | Description | Credits |
|------|-------------|---------|
| `compose_music` | Generate music from text prompt | YES |
| `create_composition_plan` | Create detailed structure plan | FREE |
| `compose_music_with_plan` | Generate using composition plan | YES |
| `separate_stems` | Split into vocals/drums/bass/other | YES |

### Voice Tools

| Tool | Description | Credits |
|------|-------------|---------|
| `text_to_speech` | Convert text to speech | YES |
| `voice_design` | Create custom voices | YES |
| `transcribe_audio` | Speech to text | YES |

---

## USAGE IN CLAUDE DESKTOP

### Creating a Composition Plan (FREE)

When you ask Claude to create a composition plan, it will use the MCP tool:

```
User: "Create a composition plan for an emotional Korean hip-hop track, 3 minutes long"

Claude: I'll create a composition plan for you using ElevenLabs Music API.

[Claude uses create_composition_plan tool]

Here's the plan:
- Global styles: korean hip-hop, emotional boom bap, piano-driven...
- Section 1: Intro (12s) - atmospheric, building tension
- Section 2: Verse 1 (45s) - restrained drums, piano melody
- ...

This plan is FREE to create. Would you like me to generate the actual music? (This will use credits)
```

### Generating Music (CREDITS)

```
User: "Yes, generate the song with that plan"

Claude: I'll generate the track now.

[Claude uses compose_music_with_plan tool]

Done! Your track has been saved to:
/home/jesse/dev/projects/personal/music/creative-hub/outputs/korean_hiphop_track.mp3
```

---

## TESTING THE CONFIGURATION

### 1. Verify Installation
```bash
# Check if uvx can find the package
uvx elevenlabs-mcp --help
```

### 2. Test API Key
```bash
# Quick test with curl
curl -s https://api.elevenlabs.io/v1/user \
  -H "xi-api-key: YOUR_API_KEY" | jq .
```

### 3. Test Composition Plan (FREE)
```bash
# Create a composition plan (doesn't cost credits)
curl -s https://api.elevenlabs.io/v1/music/plan \
  -H "Content-Type: application/json" \
  -H "xi-api-key: YOUR_API_KEY" \
  -d '{
    "prompt": "Hard trap beat with 808s, 140 BPM",
    "music_length_ms": 60000
  }' | jq .
```

---

## TROUBLESHOOTING

### "MCP server not found"
1. Make sure uvx is installed: `pip install uvx`
2. Restart Claude Desktop after changing config
3. Check the config file is valid JSON

### "Invalid API key"
1. Verify your API key at https://elevenlabs.io/app/settings/api-keys
2. Make sure there are no extra spaces in the key
3. Check you have an active subscription

### "Rate limited"
- Composition plan creation is rate-limited per tier
- Wait a few seconds and try again
- Higher tiers have higher limits

### "Output not appearing"
1. Check `ELEVENLABS_MCP_BASE_PATH` exists and is writable
2. Make sure `ELEVENLABS_MCP_OUTPUT_MODE` is set to `files` or `both`

---

## COST-OPTIMIZED WORKFLOW

### Best Practice: Plan First, Generate Once

1. **Use `create_composition_plan`** to iterate on structure (FREE)
2. **Review and refine** the plan with Claude
3. **Only use `compose_music_with_plan`** when you're happy (CREDITS)

This saves credits by getting the structure right before generating.

---

## INTEGRATION WITH CREATIVE HUB

The Creative Hub application can use these MCP tools when running through Claude Desktop:

1. User requests a song via Creative Hub
2. Creative Hub sends request to Claude
3. Claude uses MCP tools to:
   - Create composition plan (FREE)
   - Generate music (CREDITS)
4. Audio is saved to Creative Hub outputs directory
5. Creative Hub serves the file to user

---

*"Plan for free, generate once, save credits."*
