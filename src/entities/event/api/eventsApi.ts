import type { z } from 'zod/v4-mini'

import { ApiError, ContractError, request } from '@/shared/api'
import { HTTP } from '@/shared/config'

import { EVENTS_PATH } from '../config/constants'
import { EventListSchema, EventSchema } from '../model/schemas'
import type { EventItem, EventListParams, EventPayload } from '../model/types'

export type EventListRequest = EventListParams & { signal?: AbortSignal }
export type EventGetRequest = { signal?: AbortSignal }

function parse<S extends z.ZodMiniType>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data)
  if (!result.success) throw new ContractError()
  return result.data
}

function eventPath(id: string): string {
  return `${EVENTS_PATH}/${encodeURIComponent(id)}`
}

export const eventsApi = {
  async list({ page, limit, sortBy, order, signal }: EventListRequest): Promise<EventItem[]> {
    try {
      const data = await request<unknown>(EVENTS_PATH, {
        query: { page, limit, sortBy, order },
        ...(signal ? { signal } : {}),
      })
      return parse(EventListSchema, data)
    } catch (error) {
      if (error instanceof ApiError && error.status === HTTP.NOT_FOUND_STATUS) return []
      throw error
    }
  },

  async get(id: string, { signal }: EventGetRequest = {}): Promise<EventItem> {
    const data = await request<unknown>(eventPath(id), signal ? { signal } : {})
    return parse(EventSchema, data)
  },

  async create(payload: EventPayload): Promise<EventItem> {
    const data = await request<unknown>(EVENTS_PATH, { method: 'POST', body: payload })
    return parse(EventSchema, data)
  },

  async update(id: string, payload: EventPayload): Promise<EventItem> {
    const data = await request<unknown>(eventPath(id), { method: 'PUT', body: payload })
    return parse(EventSchema, data)
  },

  async remove(id: string): Promise<void> {
    await request<unknown>(eventPath(id), { method: 'DELETE' })
  },
}
