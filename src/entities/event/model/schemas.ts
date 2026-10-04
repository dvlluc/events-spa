import { z } from 'zod'

import { EVENT_SCHEMA } from '../config/constants'

const DateTimeSchema = z.iso.datetime({ offset: true })

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  startAt: DateTimeSchema,
  endAt: DateTimeSchema,
  durationMinutes: z.int().min(EVENT_SCHEMA.MIN_DURATION_MINUTES),
})

export const EventPayloadSchema = EventSchema.omit({ id: true })

export const EventListSchema = z.array(EventSchema)
