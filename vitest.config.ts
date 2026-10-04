import { fileURLToPath } from 'node:url'

import { playwright } from '@vitest/browser-playwright'
import { mergeConfig, type ViteUserConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

const COVERAGE_THRESHOLDS = {
  statements: 60,
  branches: 40,
  functions: 0,
  lines: 70,
} as const

/**
 * VITE_API_BASE_URL для тестов: тесты не ходят в сеть, нужен только валидный
 * http(s)-URL, чтобы shared/config/env.ts не падал при импорте без .env.
 */
const TEST_API_BASE_URL = 'http://localhost/api/v1'

const testConfig = {
  optimizeDeps: {
    include: ['vue', 'pinia', 'vue-router', 'zod'],
  },
  test: {
    root: fileURLToPath(new URL('./', import.meta.url)),
    env: { VITE_API_BASE_URL: TEST_API_BASE_URL },
    coverage: {
      provider: 'v8',
      thresholds: COVERAGE_THRESHOLDS,
    },

    projects: [
      {
        test: {
          name: 'unit',
          environment: 'happy-dom',
          include: ['src/**/*.spec.ts'],
          exclude: ['src/**/*.component.spec.ts'],
          setupFiles: ['mocks/setup.unit.ts'],
        },
      },
      {
        test: {
          name: 'component',
          include: ['src/**/*.component.spec.ts'],
          setupFiles: ['mocks/setup.component.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
} satisfies ViteUserConfig

export default mergeConfig(viteConfig, testConfig)
