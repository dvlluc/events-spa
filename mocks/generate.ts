import { faker } from '@faker-js/faker'

import type { EventItem } from '@/entities/event'

import { MOCK_GENERATE } from './constants.ts'

export function generateEvent(id: string): EventItem {
  const startAt = faker.date.between({ from: MOCK_GENERATE.DATE_FROM, to: MOCK_GENERATE.DATE_TO })
  const durationMinutes = faker.number.int({
    min: MOCK_GENERATE.DURATION_MIN_MINUTES,
    max: MOCK_GENERATE.DURATION_MAX_MINUTES,
  })
  const endAt = new Date(
    startAt.getTime() + durationMinutes * MOCK_GENERATE.MILLISECONDS_PER_MINUTE,
  )

  return {
    id,
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    durationMinutes,
  }
}

export function generateEvents(count: number): EventItem[] {
  return Array.from({ length: Math.max(count, 0) }, (_, index) => generateEvent(String(index + 1)))
}
