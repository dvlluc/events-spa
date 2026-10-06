import { fileURLToPath, URL } from 'node:url'

/** Алиасы импортов: `@` → src, `@mocks` → mocks (вне слоёв FSD). */
export const aliases = {
  '@mocks': fileURLToPath(new URL('../mocks', import.meta.url)),
  '@': fileURLToPath(new URL('../src', import.meta.url)),
} as const
