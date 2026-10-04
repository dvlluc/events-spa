import { afterAll, beforeAll } from 'vitest'

import { worker } from './browser.ts'

beforeAll(async () => {
  await worker.start({ onUnhandledFrame: 'warn' })
})

afterAll(async () => {
  await worker.stop()
})
