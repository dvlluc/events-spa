import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { defineConfig, type Plugin } from 'vite'

export const aliases = {
  '@mocks': fileURLToPath(new URL('./mocks', import.meta.url)),
  '@': fileURLToPath(new URL('./src', import.meta.url)),
} as const

const VITEST_ENV = 'VITEST'
const E2E_MODE = 'e2e'
const SERVICE_WORKER_FILE = 'mockServiceWorker.js'

const devToolsPlugin = process.env[VITEST_ENV] ? [] : [vueDevTools()]

/**
 * Убирает mockServiceWorker.js из production-сборки.
 */
const dropServiceWorkerPlugin = (): Plugin => {
  let mode = ''
  let serviceWorkerPath = ''

  return {
    name: 'drop-mock-service-worker',
    apply: 'build',
    configResolved(config) {
      mode = config.mode
      serviceWorkerPath = path.resolve(config.root, config.build.outDir, SERVICE_WORKER_FILE)
    },
    closeBundle() {
      if (mode === E2E_MODE) return
      fs.rmSync(serviceWorkerPath, { force: true })
    },
  }
}

export default defineConfig({
  plugins: [vue(), ...devToolsPlugin, tailwindcss(), dropServiceWorkerPlugin()],
  resolve: {
    alias: aliases,
  },
  build: {
    rollupOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-vue',
              test: /node_modules[\\/](@vue[\\/]|vue[\\/]|vue-router[\\/]|pinia[\\/])/,
            },
            {
              name: 'vendor-query',
              test: /node_modules[\\/]@tanstack[\\/](vue-query|query-core)[\\/]/,
            },
            {
              name: 'vendor-zod',
              test: /node_modules[\\/]zod[\\/]/,
            },
            {
              name: 'vendor',
              test: /node_modules[\\/]/,
            },
          ],
        },
      },
    },
  },
})
