import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  webServer: {
    command: "pnpm exec next dev --port 3000",
    env: {
      ...process.env,
      E2E_BYPASS_AUTH: "true",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "playwright-secret",
      NEXTAUTH_URL: "http://localhost:3000",
    },
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
})
