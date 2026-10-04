import { expect, test } from 'vitest'

import { env } from './env'

test('импорт env не падает при test.env', () => {
  expect(env.VITE_API_BASE_URL).toMatch(/^https?:\/\//)
})
