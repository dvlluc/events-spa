import { faker } from '@faker-js/faker'

import type { EventItem } from '@/entities/event'

import { MOCK_GENERATE } from './constants.ts'

function limitText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()
}

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
    title: limitText(faker.lorem.sentence(), MOCK_GENERATE.TITLE_MAX_LENGTH),
    description: limitText(faker.lorem.paragraph(), MOCK_GENERATE.DESCRIPTION_MAX_LENGTH),
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    durationMinutes,
  }
}

export function generateEvents(count: number): EventItem[] {
  return Array.from({ length: Math.max(count, 0) }, (_, index) => generateEvent(String(index + 1)))
}
