import { z } from 'zod/v4-mini'

const DateTimeSchema = z.iso.datetime({ offset: true })

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  startAt: DateTimeSchema,
  endAt: DateTimeSchema,
  durationMinutes: z.int(),
})

export const EventPayloadSchema = z.omit(EventSchema, { id: true })

export const EventListSchema = z.array(EventSchema)
