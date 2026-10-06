import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import type { Plugin } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

import { E2E_MODE, SERVICE_WORKER_FILE, VITEST_ENV } from './constants.ts'

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

export const plugins = [vue(), ...devToolsPlugin, tailwindcss(), dropServiceWorkerPlugin()]
