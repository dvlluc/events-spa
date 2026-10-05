import { useMutation, useQueryClient } from '@tanstack/vue-query'

import {
  eventsApi,
  eventKeys,
  useInvalidateEventLists,
  type EventItem,
  type EventPayload,
} from '@/entities/event'

export type CreateEventInput = EventPayload
export type UpdateEventInput = { id: string; payload: EventPayload }

export function useCreateEventMutation() {
  const invalidateEventLists = useInvalidateEventLists()

  return useMutation<EventItem, Error, CreateEventInput>({
    mutationFn: (payload) => eventsApi.create(payload),
    onSuccess: () => {
      void invalidateEventLists()
    },
  })
}

export function useUpdateEventMutation() {
  const invalidateEventLists = useInvalidateEventLists()
  const queryClient = useQueryClient()

  return useMutation<EventItem, Error, UpdateEventInput>({
    mutationFn: ({ id, payload }) => eventsApi.update(id, payload),
    onSuccess: (_event, { id }) => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) })
      void invalidateEventLists()
    },
  })
}
