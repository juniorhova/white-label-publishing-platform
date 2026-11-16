import { defineConfig } from '@playwright/test'

// Dedicated regression checks against the already-running local home preview.
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'roadmap.e2e.spec.ts',
  use: {
    baseURL: process.env.HOME_REVIEW_URL || 'http://localhost:3100',
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  reporter: 'list',
})
