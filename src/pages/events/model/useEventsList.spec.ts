import { http, HttpResponse } from 'msw/http'
import { delay } from 'msw/utils/delay'
import { expect, test, vi } from 'vitest'

import { MOCK_HTTP } from '@mocks/constants'
import { server } from '@mocks/server'
import { mountComposable } from '@mocks/test-utils'
import type { EventItem } from '@/entities/event'

import { PAGINATION } from '../config/constants'
import { useListStore } from './listStore'
import { useEventsList } from './useEventsList'

const PAGE_SIZE = PAGINATION.DEFAULT_PAGE_SIZE

function eventItem(id: string): EventItem {
  return {
    id,
    title: `title ${id}`,
    description: `description ${id}`,
    startAt: '2026-03-01T10:00:00.000Z',
    endAt: '2026-03-01T11:00:00.000Z',
    durationMinutes: 60,
  }
}

type ServeOptions = {
  fullPages: number
  latencyMs?: number
  requested?: number[]
  responded?: number[]
}

function servePages({ fullPages, latencyMs = 0, requested, responded }: ServeOptions): void {
  server.use(
    http.get(MOCK_HTTP.EVENTS_PATH, async ({ request }) => {
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page'))
      const limit = Number(url.searchParams.get('limit'))
      requested?.push(page)
      if (latencyMs > 0) await delay(latencyMs)
      responded?.push(page)
      if (page > fullPages) return HttpResponse.json([])
      return HttpResponse.json(
        Array.from({ length: limit }, (_item, index) => eventItem(`${page}-${index}`)),
      )
    }),
  )
}

function mountList() {
  return mountComposable(() => ({ list: useEventsList(), store: useListStore() }))
}

test('список отдаёт items, страницу, размер и признак виртуализации', async () => {
  servePages({ fullPages: 2 })
  const harness = mountList()

  await vi.waitFor(() => expect(harness.value.list.items.value).toHaveLength(PAGE_SIZE))

  expect(harness.value.list.page.value).toBe(PAGINATION.DEFAULT_PAGE)
  expect(harness.value.list.pageSize.value).toBe(PAGE_SIZE)
  expect(harness.value.list.isLoading.value).toBe(false)
  expect(harness.value.list.error.value).toBeNull()
  expect(harness.value.list.isVirtualized.value).toBe(false)

  harness.unmount()
})

test('hasNext: полная страница с непустой следующей — true', async () => {
  servePages({ fullPages: 2 })
  const harness = mountList()

  await vi.waitFor(() => expect(harness.value.list.hasNext.value).toBe(true))
  expect(harness.value.list.items.value).toHaveLength(PAGE_SIZE)

  harness.unmount()
})

test('hasNext: последняя страница — false, следующая пуста', async () => {
  const requested: number[] = []
  const responded: number[] = []
  servePages({ fullPages: 2, requested, responded })
  const harness = mountList()

  await vi.waitFor(() => expect(harness.value.list.hasNext.value).toBe(true))

  harness.value.store.setPage(2)

  await vi.waitFor(() => expect(requested).toContain(3))
  await vi.waitFor(() => expect(responded).toContain(3))

  expect(harness.value.list.items.value).toHaveLength(PAGE_SIZE)
  expect(harness.value.list.hasNext.value).toBe(false)

  harness.unmount()
})

test('hasNext: пока запрос следующей страницы грузится — false (неизвестно)', async () => {
  const responded: number[] = []
  servePages({ fullPages: 2, latencyMs: 150, responded })
  const harness = mountList()

  await vi.waitFor(() => expect(harness.value.list.items.value).toHaveLength(PAGE_SIZE))

  expect(responded).not.toContain(2)
  expect(harness.value.list.hasNext.value).toBe(false)

  await vi.waitFor(() => expect(harness.value.list.hasNext.value).toBe(true))

  harness.unmount()
})

test('hasNext: не берётся из устаревших данных при переходе на следующую страницу', async () => {
  const requested: number[] = []
  const responded: number[] = []
  servePages({ fullPages: 2, latencyMs: 200, requested, responded })
  const harness = mountList()

  await vi.waitFor(() => expect(harness.value.list.hasNext.value).toBe(true))

  harness.value.store.setPage(2)

  await vi.waitFor(() => expect(requested).toContain(3))
  expect(responded).not.toContain(3)
  expect(harness.value.list.hasNext.value).toBe(false)

  await vi.waitFor(() => expect(responded).toContain(3))
  expect(harness.value.list.hasNext.value).toBe(false)

  harness.unmount()
})

test('пустая страница больше первой приводит к автоматическому переходу назад', async () => {
  servePages({ fullPages: 2 })
  const harness = mountComposable(() => {
    const store = useListStore()
    store.setPage(3)
    return { list: useEventsList(), store }
  })

  await vi.waitFor(() => expect(harness.value.list.page.value).toBe(2))
  await vi.waitFor(() => expect(harness.value.list.items.value).toHaveLength(PAGE_SIZE))

  expect(harness.value.list.page.value).toBe(2)

  harness.unmount()
})
