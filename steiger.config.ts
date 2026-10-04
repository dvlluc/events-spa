import fsd from '@feature-sliced/steiger-plugin'
import { defineConfig } from 'steiger'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: ['./src/features/event-delete/**'],
    rules: {
      'fsd/no-segmentless-slices': 'off',
    },
  },
  {
    files: ['./src/app/providers.ts'],
    rules: {
      'fsd/segments-by-purpose': 'off',
    },
  },
])
