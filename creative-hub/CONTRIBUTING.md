# Contributing to JPANDA Ecosystem

Thanks for your interest in contributing! This project is building infrastructure for the degen economy on TON.

## Quick Start

```bash
# Clone
git clone https://github.com/cherishwins/music.git
cd music/creative-hub

# Install
pnpm install

# Set up env (copy and fill in your keys)
cp .env.example .env

# Run
pnpm dev
```

## Project Structure

```
creative-hub/
├── src/app/           # Next.js pages and API routes
├── src/lib/           # Core libraries (payments, AI, scoring)
├── src/components/    # React components
├── docs/              # Documentation
└── scripts/           # Pipeline scripts (Python)
```

## The 5 Pillars

| Pillar | Code Location | Status |
|--------|---------------|--------|
| White Tiger Studio | `/api/generate/music` | Live |
| Rug Score | `/api/minter-score` | Live |
| Brand Forge | `/api/generate/brand` | Live |
| MemeSeal | `/api/seal` | Live |
| SealBet | TBD | Next |

## How to Contribute

### Bug Reports
Open an issue with:
- What you expected
- What happened
- Steps to reproduce

### Feature Requests
Open an issue describing:
- The problem you're solving
- Your proposed solution
- Any alternatives considered

### Pull Requests
1. Fork the repo
2. Create a branch (`git checkout -b feature/amazing`)
3. Make your changes
4. Run `pnpm build` to verify
5. Commit with clear message
6. Open a PR

## Code Style

- TypeScript strict mode
- Tailwind CSS with project tokens (`tiger-*`, `neon-*`)
- Framer Motion for animations
- API routes in `src/app/api/`

## Need Help?

- Read `docs/MASTER_BRAIN.md` for full context
- Check existing issues
- Join the community (links coming soon)

## License

MIT - see [LICENSE](LICENSE)
