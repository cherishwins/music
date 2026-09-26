# White Tiger — the Telegram mini-app, as one small standalone image.
#
# node server.js on :3000, run as a non-root user.
#
# NEXT_PUBLIC_* values are inlined into the bundle at BUILD time (server code
# included), so they are build args, not runtime env — changing a public
# wallet address or the app URL means rebuilding. Every real secret
# (TELEGRAM_BOT_TOKEN, TURSO_*, QDRANT_*, ELEVENLABS_API_KEY, ANTHROPIC_API_KEY,
# REPLICATE_API_TOKEN, X402_PAYMENT_ADDRESS, STRIPE_SECRET_KEY, ...) is RUNTIME
# env only and never enters an image layer.
#
# Base image is pinned to a content digest, not the mutable `node:22-bookworm-slim`
# tag, so a rebuild always resolves the same bytes and an upstream re-tag can't
# silently change what ships. The three stages MUST share one digest — keep them
# identical. This is the multi-arch OCI index digest, so it still selects the
# right platform. Bump it deliberately (Dependabot/Renovate track digest pins),
# re-resolving with:
#   docker buildx imagetools inspect node:22-bookworm-slim

# ---- deps: install the full dependency tree from the lockfile ---------------
FROM node:22-bookworm-slim@sha256:43ac6c60b8f89723f746e8a92ce91abd5017e627ce1ddfe4238355d3a30b772c AS deps
WORKDIR /app
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
# Pin pnpm so the install behaves the same everywhere (the repo has no
# packageManager field). On 10.33 unapproved dependency build scripts are a
# warning, not a fatal error — and none of them are needed here: sharp 0.34
# loads from its prebuilt @img/* packages, while esbuild / bufferutil /
# utf-8-validate / unrs-resolver are dev-only tooling (the last two are also
# externalized in next.config.js).
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build: compile the Next.js standalone server ---------------------------
FROM node:22-bookworm-slim@sha256:43ac6c60b8f89723f746e8a92ce91abd5017e627ce1ddfe4238355d3a30b772c AS build
WORKDIR /app
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public, build-time config. Safe empty/localhost defaults so the image builds
# with no secrets; override with --build-arg for a real deployment.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000 \
    NEXT_PUBLIC_TON_WALLET_ADDRESS= \
    NEXT_PUBLIC_TON_PAYMENT_ADDRESS= \
    NEXT_PUBLIC_TON_MANIFEST_URL= \
    NEXT_PUBLIC_COINBASE_PROJECT_ID= \
    NEXT_PUBLIC_N8N_CONTENT_CREATED_WEBHOOK= \
    NEXT_PUBLIC_N8N_SOCIAL_DISTRIBUTE_WEBHOOK= \
    NEXT_PUBLIC_N8N_USER_SIGNUP_WEBHOOK= \
    NEXT_PUBLIC_N8N_PAYMENT_COMPLETE_WEBHOOK= \
    NEXT_PUBLIC_N8N_ANALYTICS_WEBHOOK=

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_TON_WALLET_ADDRESS=$NEXT_PUBLIC_TON_WALLET_ADDRESS \
    NEXT_PUBLIC_TON_PAYMENT_ADDRESS=$NEXT_PUBLIC_TON_PAYMENT_ADDRESS \
    NEXT_PUBLIC_TON_MANIFEST_URL=$NEXT_PUBLIC_TON_MANIFEST_URL \
    NEXT_PUBLIC_COINBASE_PROJECT_ID=$NEXT_PUBLIC_COINBASE_PROJECT_ID \
    NEXT_PUBLIC_N8N_CONTENT_CREATED_WEBHOOK=$NEXT_PUBLIC_N8N_CONTENT_CREATED_WEBHOOK \
    NEXT_PUBLIC_N8N_SOCIAL_DISTRIBUTE_WEBHOOK=$NEXT_PUBLIC_N8N_SOCIAL_DISTRIBUTE_WEBHOOK \
    NEXT_PUBLIC_N8N_USER_SIGNUP_WEBHOOK=$NEXT_PUBLIC_N8N_USER_SIGNUP_WEBHOOK \
    NEXT_PUBLIC_N8N_PAYMENT_COMPLETE_WEBHOOK=$NEXT_PUBLIC_N8N_PAYMENT_COMPLETE_WEBHOOK \
    NEXT_PUBLIC_N8N_ANALYTICS_WEBHOOK=$NEXT_PUBLIC_N8N_ANALYTICS_WEBHOOK \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=4096
# lib/db instantiates the libSQL client at import; a route handler is evaluated
# during the build, so give it an inert local file URL. This is a placeholder,
# not a secret, and does not exist in the runner image. The real
# TURSO_DATABASE_URL is supplied at runtime.
ENV TURSO_DATABASE_URL=file:/tmp/build-placeholder.db
RUN pnpm run build

# ---- runner: the standalone server, nothing else ----------------------------
FROM node:22-bookworm-slim@sha256:43ac6c60b8f89723f746e8a92ce91abd5017e627ce1ddfe4238355d3a30b772c AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
# Next's standalone bundle, its static chunks, and the public assets.
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
# Liveness only: a GET on the root page, so the check never depends on the
# external databases being reachable.
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
