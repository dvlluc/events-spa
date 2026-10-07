import { defineConfig } from 'vite'

import { aliases } from './vite/aliases.ts'
import { codeSplitting } from './vite/code-splitting.ts'
import { output } from './vite/output.ts'
import { plugins } from './vite/plugins.ts'

export default defineConfig({
  plugins,
  resolve: {
    alias: aliases,
  },
  build: {
    rollupOptions: {
      output: {
        ...output,
        codeSplitting,
      },
    },
  },
})
