# Publishing White Tiger MCP Server to npm

## Prerequisites

1. **npm account** - Create at https://www.npmjs.com/signup
2. **npm CLI logged in** - Run `npm login`

## Steps

### 1. Login to npm (one-time)

```bash
npm login
# Enter username, password, email, OTP if 2FA enabled
```

### 2. Verify package.json

The package name is `@whitetiger/mcp-music`. Options:

**Option A: Scoped package (recommended)**
- Requires npm org: https://www.npmjs.com/org/create
- Create org named `whitetiger`
- Package will be `@whitetiger/mcp-music`

**Option B: Unscoped package**
- Edit package.json: `"name": "white-tiger-mcp"`
- No org needed

### 3. Build the package

```bash
cd mcp-server
pnpm build
```

### 4. Publish

**For scoped package:**
```bash
npm publish --access public
```

**For unscoped package:**
```bash
npm publish
```

### 5. Verify

```bash
npm view @whitetiger/mcp-music
# or
npm view white-tiger-mcp
```

## After Publishing

### Update Installation Docs

If using unscoped name, update:
- `mcp-server/README.md`
- `docs/SUBMISSION_CONTENT.md`
- `docs/DIRECTORY_SUBMISSIONS.md`

### Create GitHub Repo

1. Go to https://github.com/new
2. Create repo: `white-tiger-mcp`
3. Push code:
```bash
cd mcp-server
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/white-tiger-mcp.git
git push -u origin main
```

### Submit to MCP Directories

With npm package live, submit to:
- MCP.so
- MCP Market
- GitHub modelcontextprotocol/servers (PR)

## Quick Commands

```bash
# Build
cd mcp-server && pnpm build

# Test locally
node dist/index.js

# Publish (after login)
npm publish --access public

# Update version and publish
npm version patch && npm publish --access public
```

## Troubleshooting

### "Package name already exists"
Change the package name in package.json

### "You must be logged in"
Run `npm login`

### "Need 2FA"
Use authenticator app, enter code when prompted

### "E403 Forbidden"
For scoped packages, need `--access public` flag
