import process from 'node:process'

import type { EventItem, EventPayload } from '@/entities/event'

import { SEED_MOCKAPI_COUNT, SEED_MOCKAPI_PAUSE_MS } from '../mocks/constants.ts'
import { generateEvents } from '../mocks/generate.ts'

const BASE_URL_ENV = 'VITE_API_BASE_URL'

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

function toPayload({
  title,
  description,
  startAt,
  endAt,
  durationMinutes,
}: EventItem): EventPayload {
  return { title, description, startAt, endAt, durationMinutes }
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function main(): Promise<void> {
  const baseUrl = process.env[BASE_URL_ENV]
  if (!baseUrl) {
    throw new Error(`${BASE_URL_ENV} не задан: скопируйте .env.example в .env.`)
  }

  const events = generateEvents(SEED_MOCKAPI_COUNT)

  for (const [index, event] of events.entries()) {
    const response = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(toPayload(event)),
    })
    if (!response.ok) {
      throw new Error(`mockapi ответил ${response.status} на событие ${event.id}.`)
    }
    process.stdout.write(`\rСоздано событий: ${index + 1}/${SEED_MOCKAPI_COUNT}`)
    await pause(SEED_MOCKAPI_PAUSE_MS)
  }

  process.stdout.write('\n')
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
