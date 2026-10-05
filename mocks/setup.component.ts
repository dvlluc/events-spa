import { afterAll, beforeAll } from 'vitest'

import '@/app/styles/main.css'
import '@/app/styles/base.scss'

import { worker } from './browser.ts'

beforeAll(async () => {
  await worker.start({ onUnhandledFrame: 'warn' })
})

afterAll(async () => {
  await worker.stop()
})
