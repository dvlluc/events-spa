import type { z } from 'zod'

import type { EventPayloadSchema, EventSchema } from './schemas'

export type EventItem = z.infer<typeof EventSchema>

export type EventPayload = z.infer<typeof EventPayloadSchema>

export type EventSortOrder = 'asc' | 'desc'

export type EventListParams = {
  page: number
  limit: number
  sortBy: string
  order: EventSortOrder
}
