## 2026-08-09 ##
Implemented the production-readiness cleanup.

  Changed:

  - Switched project to pnpm:
      - Added packageManager: pnpm@11.12.0
      - Generated pnpm-lock.yaml
      - Removed package-lock.json
      - Moved native build approval to pnpm-workspace.yaml

  - Approved native builds for sharp, esbuild, unrs-resolver.
  - Cleaned docker-compose.yml to only run local Postgres.
  - Added Payload/Postgres initial migration:
      - src/migrations/20260809_143404_initial_schema.ts
      - snapshot JSON
      - migration index

  - Added migration scripts:
      - pnpm migrate
      - pnpm migrate:create
      - pnpm migrate:status

  - Added .env.coolify.example.
  - Updated README with Coolify commands/env/migration notes.
  - Added .dockerignore.
  - Fixed Dockerfile for pnpm and BuildKit secrets.
  - Added generated app-router favicon at src/app/icon.tsx.
  - Removed hardcoded old favicon links from layout.
  - Fixed ESLint config so lint runs with current Next/ESLint versions.

  Validation:

  - pnpm install --frozen-lockfile passed.
  - pnpm lint passed with warnings.
  - pnpm test:int passed.
  - pnpm build passed.
  - Initial migration applied cleanly to a fresh temporary Postgres DB.
  - Docker image build passed using BuildKit secrets.
  - Docker container smoke test returned HTTP 200.

  Not completed:

  - pnpm test:e2e still needs OS packages. This environment could not run npx playwright install-deps chromium because sudo requires an interactive password. Run this locally:

    npx playwright install-deps chromium
    pnpm test:e2e

  For Coolify:

  - Base directory: white-label-publishing-platform
  - Install: pnpm install --frozen-lockfile
  - Build: pnpm build
  - Start: pnpm start
  - Set DATABASE_URL, PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL, CRON_SECRET, PREVIEW_SECRET.
  - Run pnpm migrate against production DB before the first production build.

  Favicon:

  - Change src/app/icon.tsx to update the browser tab icon.
  - For a real .ico, add src/app/favicon.ico.

  Docs referenced: pnpm build approvals, Payload migrations, Next app icons, and Coolify environment variables.