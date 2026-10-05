import { useMutation } from '@tanstack/vue-query'

import { eventsApi, useInvalidateEventLists } from '@/entities/event'

export function useDeleteEventMutation() {
  const invalidateEventLists = useInvalidateEventLists()

  return useMutation<void, Error, string>({
    mutationFn: (id) => eventsApi.remove(id),
    onSuccess: () => {
      void invalidateEventLists()
    },
  })
}
