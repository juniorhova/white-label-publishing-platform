# syntax=docker/dockerfile:1

FROM node:22.17.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies with the project's package manager.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN --mount=type=secret,id=DATABASE_URL \
  --mount=type=secret,id=PAYLOAD_SECRET \
  --mount=type=secret,id=NEXT_PUBLIC_SERVER_URL \
  --mount=type=secret,id=CRON_SECRET \
  --mount=type=secret,id=PREVIEW_SECRET \
  --mount=type=secret,id=NEXT_PUBLIC_TURNSTILE_SITE_KEY \
  --mount=type=secret,id=S3_ENABLED \
  --mount=type=secret,id=S3_BUCKET \
  --mount=type=secret,id=S3_REGION \
  --mount=type=secret,id=S3_ACCESS_KEY_ID \
  --mount=type=secret,id=S3_SECRET_ACCESS_KEY \
  export DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" && \
  export PAYLOAD_SECRET="$(cat /run/secrets/PAYLOAD_SECRET)" && \
  export NEXT_PUBLIC_SERVER_URL="$(cat /run/secrets/NEXT_PUBLIC_SERVER_URL)" && \
  export CRON_SECRET="$(cat /run/secrets/CRON_SECRET)" && \
  export PREVIEW_SECRET="$(cat /run/secrets/PREVIEW_SECRET)" && \
  for name in NEXT_PUBLIC_TURNSTILE_SITE_KEY S3_ENABLED S3_BUCKET S3_REGION S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY; do \
    if [ -f "/run/secrets/$name" ]; then export "$name=$(cat "/run/secrets/$name")"; fi; \
  done && \
  corepack enable pnpm && \
  pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN corepack enable pnpm

COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/src ./src
COPY --from=builder --chown=nextjs:nodejs /app/content ./content
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/redirects.ts ./redirects.ts

USER nextjs

EXPOSE 3000

ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["sh", "-c", "pnpm migrate && pnpm start"]
