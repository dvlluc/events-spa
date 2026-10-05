import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { defineConfig } from 'vite'

export const aliases = {
  '@mocks': fileURLToPath(new URL('./mocks', import.meta.url)),
  '@': fileURLToPath(new URL('./src', import.meta.url)),
} as const

const VITEST_ENV = 'VITEST'

const devToolsPlugin = process.env[VITEST_ENV] ? [] : [vueDevTools()]

export default defineConfig({
  plugins: [vue(), ...devToolsPlugin, tailwindcss()],
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
          ],
        },
      },
    },
  },
})
