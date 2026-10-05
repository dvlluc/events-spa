import { expect, test } from 'vitest'

import { QUERY } from '@/shared/config'

import { createQueryClient } from './providers'

test('createQueryClient ставит staleTime и gcTime из QUERY и отключает ретраи', () => {
  const queries = createQueryClient().getDefaultOptions().queries

  expect(queries?.staleTime).toBe(QUERY.STALE_TIME_MS)
  expect(queries?.gcTime).toBe(QUERY.GC_TIME_MS)
  expect(queries?.retry).toBe(false)
  expect(queries?.refetchOnWindowFocus).toBe(QUERY.REFETCH_ON_WINDOW_FOCUS)
})

test('createQueryClient применяет переопределения поверх дефолтов', () => {
  const queries = createQueryClient({ gcTime: 0 }).getDefaultOptions().queries

  expect(queries?.gcTime).toBe(0)
  expect(queries?.staleTime).toBe(QUERY.STALE_TIME_MS)
  expect(queries?.retry).toBe(false)
  expect(queries?.refetchOnWindowFocus).toBe(QUERY.REFETCH_ON_WINDOW_FOCUS)
})
