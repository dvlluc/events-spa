import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from './server.ts'

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'warn' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
