import { http, HttpResponse } from 'msw/http'
import { delay } from 'msw/utils/delay'
import { expect, test, vi } from 'vitest'
import { nextTick, ref, watch } from 'vue'

import { MOCK_HTTP } from '@mocks/constants'
import { server } from '@mocks/server'
import { createTestContext, mountComposable } from '@mocks/test-utils'
import { QUERY } from '@/shared/config'

import { useEventQuery, useEventsListQuery, useInvalidateEventLists } from './queries'
import type { EventItem, EventListParams } from '../model/types'

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

function listParams(page: number): EventListParams {
  return { page, limit: 10, sortBy: 'id', order: 'asc' }
}

function pageOf(request: Request): number {
  return Number(new URL(request.url).searchParams.get('page'))
}

test('листание не мигает: прошлая страница остаётся в data до прихода новой', async () => {
  const requested: number[] = []
  server.use(
    http.get(MOCK_HTTP.EVENTS_PATH, async ({ request }) => {
      const page = pageOf(request)
      requested.push(page)
      if (page === 2) await delay(80)
      return HttpResponse.json([eventItem(`${page}-1`), eventItem(`${page}-2`)])
    }),
  )

  const params = ref<EventListParams>(listParams(1))
  const harness = mountComposable(() => useEventsListQuery(params, { enabled: true }))

  await vi.waitFor(() => expect(harness.value.data.value).toHaveLength(2))
  expect(harness.value.data.value?.[0]?.id).toBe('1-1')

  const dataSnapshots: Array<EventItem[] | undefined> = []
  const placeholderSnapshots: boolean[] = []
  const stop = watch(
    [() => harness.value.data.value, () => harness.value.isPlaceholderData.value],
    ([data, placeholder]) => {
      dataSnapshots.push(data)
      placeholderSnapshots.push(placeholder)
    },
    { immediate: true, flush: 'sync' },
  )

  params.value = listParams(2)

  await vi.waitFor(() => expect(harness.value.data.value?.[0]?.id).toBe('2-1'))
  stop()

  expect(requested).toEqual([1, 2])
  expect(dataSnapshots.every((data) => data !== undefined)).toBe(true)
  expect(placeholderSnapshots).toContain(true)

  harness.unmount()
})

test('быстрое листание: отменённый запрос не ломает состояние', async () => {
  server.use(
    http.get(MOCK_HTTP.EVENTS_PATH, async ({ request }) => {
      const page = pageOf(request)
      if (page === 2) await delay(250)
      return HttpResponse.json([eventItem(`${page}-1`)])
    }),
  )

  const params = ref<EventListParams>(listParams(1))
  const harness = mountComposable(() => useEventsListQuery(params, { enabled: true }))

  await vi.waitFor(() => expect(harness.value.data.value).toHaveLength(1))

  params.value = listParams(2)
  await vi.waitFor(() => expect(harness.value.fetchStatus.value).toBe('fetching'))
  params.value = listParams(3)

  await vi.waitFor(() => expect(harness.value.data.value?.[0]?.id).toBe('3-1'))

  expect(harness.value.status.value).toBe('success')
  expect(harness.value.error.value).toBeNull()
  expect(harness.value.isError.value).toBe(false)
  expect(harness.value.isPlaceholderData.value).toBe(false)

  harness.unmount()
})

test('повторный заход берёт страницу из кэша без нового запроса', async () => {
  let requests = 0
  server.use(
    http.get(MOCK_HTTP.EVENTS_PATH, () => {
      requests += 1
      return HttpResponse.json([eventItem('1')])
    }),
  )

  const context = createTestContext({ gcTime: QUERY.GC_TIME_MS })
  const first = mountComposable(() => useEventsListQuery(listParams(1), { enabled: true }), context)

  await vi.waitFor(() => expect(first.value.data.value).toHaveLength(1))
  first.unmount()

  const second = mountComposable(
    () => useEventsListQuery(listParams(1), { enabled: true }),
    context,
  )

  expect(second.value.data.value).toHaveLength(1)
  expect(second.value.fetchStatus.value).toBe('idle')
  expect(requests).toBe(1)

  second.unmount()
})

test('useEventQuery: строка списка видна сразу, свежие данные добираются фоном', async () => {
  const row = eventItem('7', 'старый заголовок')
  const fresh = eventItem('7', 'свежий заголовок')
  server.use(
    http.get(MOCK_HTTP.EVENT_PATH, async () => {
      await delay(60)
      return HttpResponse.json(fresh)
    }),
  )

  const harness = mountComposable(() => useEventQuery('7', { enabled: true, initialData: row }))

  expect(harness.value.data.value).toEqual(row)
  expect(harness.value.isPlaceholderData.value).toBe(true)

  await vi.waitFor(() => expect(harness.value.data.value).toEqual(fresh))
  expect(harness.value.isPlaceholderData.value).toBe(false)
  expect(harness.value.fetchStatus.value).toBe('idle')

  harness.unmount()
})

test('useEventQuery с enabled: false не ходит в сеть', async () => {
  let requests = 0
  server.use(
    http.get(MOCK_HTTP.EVENT_PATH, () => {
      requests += 1
      return HttpResponse.json(eventItem('7'))
    }),
  )

  const harness = mountComposable(() => useEventQuery('7', { enabled: false }))

  expect(harness.value.data.value).toBeUndefined()
  expect(harness.value.fetchStatus.value).toBe('idle')

  await new Promise((resolve) => setTimeout(resolve, 20))
  expect(requests).toBe(0)

  harness.unmount()
})

test('useInvalidateEventLists инвалидирует активные листы', async () => {
  let items = [eventItem('1')]
  server.use(http.get(MOCK_HTTP.EVENTS_PATH, () => HttpResponse.json(items)))

  const harness = mountComposable(() => ({
    list: useEventsListQuery(listParams(1), { enabled: true }),
    invalidate: useInvalidateEventLists(),
  }))

  await vi.waitFor(() => expect(harness.value.list.data.value).toHaveLength(1))

  items = [eventItem('1'), eventItem('2')]
  await harness.value.invalidate()

  await vi.waitFor(() => expect(harness.value.list.data.value).toHaveLength(2))

  harness.unmount()
})

test('useEventsListQuery с enabled: false не ходит в сеть', async () => {
  let requests = 0
  server.use(
    http.get(MOCK_HTTP.EVENTS_PATH, () => {
      requests += 1
      return HttpResponse.json([])
    }),
  )

  const harness = mountComposable(() => useEventsListQuery(listParams(1), { enabled: false }))

  expect(harness.value.fetchStatus.value).toBe('idle')
  expect(harness.value.data.value).toBeUndefined()

  await nextTick()
  expect(requests).toBe(0)

  harness.unmount()
})
