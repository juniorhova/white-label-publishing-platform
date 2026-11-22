import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'editorial.e2e.spec.ts',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.EDITORIAL_BASE_URL || 'http://localhost:3203',
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
})
