import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'

import { eventsApi } from './eventsApi'
import { eventKeys } from './queryKeys'
import type { EventItem, EventListParams } from '../model/types'

export type EventsListQueryOptions = {
  enabled?: MaybeRefOrGetter<boolean>
}

export type EventQueryOptions = {
  enabled?: MaybeRefOrGetter<boolean>
  initialData?: MaybeRefOrGetter<EventItem | undefined>
}

export function useEventsListQuery(
  params: MaybeRefOrGetter<EventListParams>,
  options: EventsListQueryOptions = {},
) {
  const { enabled = true } = options

  return useQuery<EventItem[]>(() => {
    const listParams = toValue(params)
    return {
      queryKey: eventKeys.list(listParams),
      queryFn: ({ signal }) => eventsApi.list({ ...listParams, signal }),
      placeholderData: keepPreviousData,
      enabled: toValue(enabled),
    }
  })
}

export function useEventQuery(id: MaybeRefOrGetter<string>, options: EventQueryOptions = {}) {
  const { enabled = true, initialData } = options

  return useQuery<EventItem>(() => {
    const eventId = toValue(id)
    return {
      queryKey: eventKeys.detail(eventId),
      queryFn: ({ signal }) => eventsApi.get(eventId, { signal }),
      placeholderData: () => toValue(initialData),
      enabled: toValue(enabled),
    }
  })
}

export function useInvalidateEventLists(): () => Promise<void> {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
}
