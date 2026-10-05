import { QueryClient, type DefaultOptions } from '@tanstack/vue-query'

import { QUERY } from '@/shared/config'

export type QueryClientOverrides = NonNullable<DefaultOptions['queries']>

export function createQueryClient(overrides: QueryClientOverrides = {}): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY.STALE_TIME_MS,
        gcTime: QUERY.GC_TIME_MS,
        retry: false,
        refetchOnWindowFocus: QUERY.REFETCH_ON_WINDOW_FOCUS,
        ...overrides,
      },
    },
  })
}
