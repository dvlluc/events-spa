import { http, HttpResponse } from 'msw/http'
import { afterEach, expect, test, vi } from 'vitest'

import { MOCK_HTTP } from '@mocks/constants'
import { server } from '@mocks/server'
import { createTestContext, mountComposable, type ComposableHarness } from '@mocks/test-utils'
import {
  eventKeys,
  useEventQuery,
  useEventsListQuery,
  type EventItem,
  type EventListParams,
  type EventPayload,
} from '@/entities/event'

import { useCreateEventMutation, useUpdateEventMutation } from './mutations'

const LIST_PARAMS: EventListParams = { page: 1, limit: 10, sortBy: 'id', order: 'asc' }

const harnesses: Array<ComposableHarness<unknown>> = []

afterEach(() => {
  for (const harness of harnesses.splice(0)) harness.unmount()
})

function eventItem(id: string, title = `event ${id}`): EventItem {
  return {
    id,
    title,
    description: `description ${id}`,
    startAt: '2026-03-01T10:00:00.000Z',
    endAt: '2026-03-01T11:00:00.000Z',
    durationMinutes: 60,
  }
}

function payload(title: string): EventPayload {
  return {
    title,
    description: 'описание',
    startAt: '2026-05-01T09:00:00.000Z',
    endAt: '2026-05-01T10:30:00.000Z',
    durationMinutes: 90,
  }
}

test('update: кэш detail обновляется из ответа мутации без повторного GET, списки инвалидируются', async () => {
  let detailGets = 0
  let listGets = 0
  const row = eventItem('10', 'старый заголовок')
  const saved = { ...row, ...payload('новый заголовок') }

  server.use(
    http.get(MOCK_HTTP.EVENT_PATH, () => {
      detailGets += 1
      return HttpResponse.json(row)
    }),
    http.get(MOCK_HTTP.EVENTS_PATH, () => {
      listGets += 1
      return HttpResponse.json([row])
    }),
    http.put(MOCK_HTTP.EVENT_PATH, () => HttpResponse.json(saved)),
  )

  const harness = mountComposable(
    () => ({
      update: useUpdateEventMutation(),
      detail: useEventQuery('10', { enabled: true, initialData: row }),
      list: useEventsListQuery(LIST_PARAMS, { enabled: true }),
    }),
    createTestContext(),
  )
  harnesses.push(harness)

  await vi.waitFor(() => {
    expect(detailGets).toBe(1)
    expect(listGets).toBe(1)
  })

  await harness.value.update.mutateAsync({ id: '10', payload: payload('новый заголовок') })

  expect(harness.value.update.error.value).toBeNull()
  expect(harness.queryClient.getQueryData(eventKeys.detail('10'))).toEqual(saved)
  expect(harness.value.detail.data.value).toEqual(saved)

  await vi.waitFor(() => expect(listGets).toBe(2))
  expect(detailGets).toBe(1)
})

test('create: после успеха инвалидируются только списки', async () => {
  let listGets = 0
  const row = eventItem('1')

  server.use(
    http.get(MOCK_HTTP.EVENTS_PATH, () => {
      listGets += 1
      return HttpResponse.json([row])
    }),
    http.post(MOCK_HTTP.EVENTS_PATH, () =>
      HttpResponse.json({ id: '2', ...payload('новое') }, { status: MOCK_HTTP.CREATED_STATUS }),
    ),
  )

  const harness = mountComposable(
    () => ({
      create: useCreateEventMutation(),
      list: useEventsListQuery(LIST_PARAMS, { enabled: true }),
    }),
    createTestContext(),
  )
  harnesses.push(harness)

  await vi.waitFor(() => expect(listGets).toBe(1))

  await harness.value.create.mutateAsync(payload('новое'))

  await vi.waitFor(() => expect(listGets).toBe(2))
})
