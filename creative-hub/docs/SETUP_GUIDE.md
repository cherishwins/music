# Creative Hub Setup Guide
## Get the Intelligence Stack Running

---

## QUICK START

### 1. Create Turso Database (FREE)

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create creative-hub

# Get credentials
turso db show creative-hub --url
turso db tokens create creative-hub

# Add to .env
TURSO_DATABASE_URL=libsql://creative-hub-xxx.turso.io
TURSO_AUTH_TOKEN=xxx
```

### 2. Create Qdrant Cloud (FREE)

1. Go to https://cloud.qdrant.io
2. Create free cluster (1GB)
3. Get URL and API key

```bash
# Add to .env
QDRANT_URL=https://xxx.qdrant.io:6333
QDRANT_API_KEY=xxx
```

### 3. Run Database Migrations

```bash
# Generate migrations
pnpm drizzle-kit generate

# Push to Turso
pnpm drizzle-kit push

# Initialize Qdrant collections
pnpm tsx scripts/init-vectors.ts
```

### 4. Verify Setup

```bash
# Test database connection
pnpm tsx scripts/test-db.ts

# Test vector search
pnpm tsx scripts/test-vectors.ts
```

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────┐
│                 CREATIVE HUB                 │
├─────────────────────────────────────────────┤
│                                              │
│  ┌─────────────┐    ┌─────────────────────┐ │
│  │   TURSO     │    │      QDRANT         │ │
│  │  (LibSQL)   │    │  (Vector Search)    │ │
│  │             │    │                     │ │
│  │ - Users     │    │ - hit_songs         │ │
│  │ - Tracks    │    │   (512-dim CLAP)    │ │
│  │ - Payments  │    │ - user_tracks       │ │
│  │ - Analytics │    │ - patterns          │ │
│  │             │    │                     │ │
│  └──────┬──────┘    └──────────┬──────────┘ │
│         │                      │            │
│         └──────────┬───────────┘            │
│                    │                        │
│           ┌────────┴────────┐               │
│           │   GENERATION    │               │
│           │                 │               │
│           │ 1. Find hits    │               │
│           │ 2. Extract DNA  │               │
│           │ 3. Enrich prompt│               │
│           │ 4. Generate     │               │
│           │ 5. Learn        │               │
│           └─────────────────┘               │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │           VERCEL BLOB                │   │
│  │         (Audio Storage)              │   │
│  └──────────────────────────────────────┘   │
│                                              │
└─────────────────────────────────────────────┘
```

---

## FILES CREATED

| File | Purpose |
|------|---------|
| `src/lib/db/schema.ts` | Database schema (Drizzle) |
| `src/lib/db/index.ts` | Database client + helpers |
| `src/lib/vectors/index.ts` | Qdrant client + music intelligence |
| `drizzle.config.ts` | Drizzle configuration |

---

## COSTS

| Service | Free Tier | Paid |
|---------|-----------|------|
| Turso | 9GB, 500 DBs | $8/mo |
| Qdrant Cloud | 1GB vectors | $25/mo |
| Vercel Blob | 1GB | $0.15/GB |

**Total to start: $0**

---

## NEXT STEPS

1. **Get Turso/Qdrant credentials** (5 min)
2. **Run migrations** (2 min)
3. **Seed hit songs database** (30 min)
4. **Build CLAP embedding pipeline** (1 hour)
5. **Wire to generation flow** (1 hour)

---

## ENVIRONMENT VARIABLES NEEDED

```bash
# Already have
ELEVENLABS_API_KEY=xxx
ANTHROPIC_API_KEY=xxx
BLOB_READ_WRITE_TOKEN=xxx
TELEGRAM_BOT_TOKEN=xxx

# Need to add
TURSO_DATABASE_URL=libsql://xxx.turso.io
TURSO_AUTH_TOKEN=xxx
QDRANT_URL=https://xxx.qdrant.io:6333
QDRANT_API_KEY=xxx
```

---

*"The infrastructure is built. Now feed it data and watch it learn."*
