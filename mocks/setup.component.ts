import { afterAll, beforeAll } from 'vitest'

import '@/app/styles/main.css'
import '@/app/styles/reset.scss'

import { worker } from './browser.ts'

beforeAll(async () => {
  await worker.start({ onUnhandledFrame: 'warn' })
})

afterAll(async () => {
  await worker.stop()
})
