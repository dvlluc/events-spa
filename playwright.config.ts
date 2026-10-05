import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1'

const PREVIEW_PORT = 4173
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    actionTimeout: 0,
    baseURL: PREVIEW_URL,

    trace: 'on-first-retry',

    /* Only on CI systems run the tests headless */
    headless: !!process.env.CI,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: {
    /* Продакшн-сборка в режиме e2e (в бандле есть MSW) + preview-сервер. */
    command: `pnpm exec vite build --mode e2e && pnpm exec vite preview --port ${PREVIEW_PORT} --strictPort`,
    url: PREVIEW_URL,
    env: { VITE_API_BASE_URL: process.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL },
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
})
