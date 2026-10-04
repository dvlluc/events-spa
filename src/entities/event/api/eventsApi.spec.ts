import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { ApiError, ContractError } from '@/shared/api'
import { env } from '@/shared/config'

import { eventsApi } from './eventsApi'
import type { EventPayload } from '../model/types'

const fetchMock = vi.fn<typeof fetch>()

const event = {
  id: '7',
  title: 'title 7',
  description: 'description 7',
  startAt: '2027-08-10T00:03:02.325Z',
  endAt: '2026-12-01T04:37:02.002Z',
  durationMinutes: 35,
}

const payload: EventPayload = {
  title: 'title 7',
  description: 'description 7',
  startAt: '2027-08-10T00:03:02.325Z',
  endAt: '2026-12-01T04:37:02.002Z',
  durationMinutes: 35,
}

const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), { status })

const callAt = (index: number): [string, RequestInit] => {
  const call = fetchMock.mock.calls[index]
  if (!call) throw new Error(`fetch не вызывался, индекс ${index}`)
  return [String(call[0]), call[1] ?? {}]
}

const hangUntilAbort = (): void => {
  fetchMock.mockImplementation(
    (_url, init) =>
      new Promise((_resolve, reject) => {
        const signal = init?.signal ?? undefined
        const rejectWithReason = (): void => reject(signal?.reason)
        if (signal?.aborted) rejectWithReason()
        else signal?.addEventListener('abort', rejectWithReason, { once: true })
      }),
  )
}

const failure = (promise: Promise<unknown>): Promise<unknown> => promise.catch((error) => error)

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

test('list собирает query, не ставит заголовков и валидирует ответ', async () => {
  fetchMock.mockResolvedValue(jsonResponse([event]))

  const items = await eventsApi.list({ page: 2, limit: 10, sortBy: 'startAt', order: 'desc' })

  const [url, init] = callAt(0)
  expect(url).toBe(`${env.VITE_API_BASE_URL}/events?page=2&limit=10&sortBy=startAt&order=desc`)
  expect(init.method).toBe('GET')
  expect(init.headers).toBeUndefined()
  expect(init.body).toBeUndefined()
  expect(items).toEqual([event])
})

test('list передаёт внешний signal', async () => {
  hangUntilAbort()
  const controller = new AbortController()

  const promise = failure(
    eventsApi.list({
      page: 1,
      limit: 10,
      sortBy: 'startAt',
      order: 'asc',
      signal: controller.signal,
    }),
  )
  controller.abort()
  const error = await promise

  expect(error).toBeInstanceOf(DOMException)
  expect((error as DOMException).name).toBe('AbortError')
})

test('list: 404 на страницу вне диапазона даёт пустой список', async () => {
  fetchMock.mockResolvedValue(jsonResponse({ message: 'Not found' }, 404))

  await expect(
    eventsApi.list({ page: 999, limit: 10, sortBy: 'startAt', order: 'desc' }),
  ).resolves.toEqual([])
})

test('list: пустой массив остаётся пустым списком', async () => {
  fetchMock.mockResolvedValue(jsonResponse([]))

  await expect(
    eventsApi.list({ page: 999, limit: 10, sortBy: 'startAt', order: 'desc' }),
  ).resolves.toEqual([])
})

test('list: нарушение контракта превращается в ContractError', async () => {
  fetchMock.mockResolvedValue(jsonResponse([{ ...event, durationMinutes: -1 }]))

  const error = await failure(
    eventsApi.list({ page: 1, limit: 10, sortBy: 'startAt', order: 'desc' }),
  )

  expect(error).toBeInstanceOf(ContractError)
  expect(error).not.toBeInstanceOf(ApiError)
})

test('create отправляет JSON с телом и возвращает событие', async () => {
  fetchMock.mockResolvedValue(jsonResponse({ ...event, id: '13' }, 201))

  const created = await eventsApi.create(payload)

  const [url, init] = callAt(0)
  expect(url).toBe(`${env.VITE_API_BASE_URL}/events`)
  expect(init.method).toBe('POST')
  expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
  expect(init.body).toBe(JSON.stringify(payload))
  expect(created.id).toBe('13')
})

test('create: нарушение контракта превращается в ContractError', async () => {
  fetchMock.mockResolvedValue(jsonResponse({ ...event, durationMinutes: '35' }))

  const error = await failure(eventsApi.create(payload))

  expect(error).toBeInstanceOf(ContractError)
})

test('update отправляет PUT на /events/{id}', async () => {
  fetchMock.mockResolvedValue(jsonResponse(event))

  const updated = await eventsApi.update(event.id, payload)

  const [url, init] = callAt(0)
  expect(url).toBe(`${env.VITE_API_BASE_URL}/events/${event.id}`)
  expect(init.method).toBe('PUT')
  expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
  expect(init.body).toBe(JSON.stringify(payload))
  expect(updated).toEqual(event)
})

test('remove отправляет DELETE на /events/{id} без тела', async () => {
  fetchMock.mockResolvedValue(jsonResponse(event))

  await expect(eventsApi.remove(event.id)).resolves.toBeUndefined()

  const [url, init] = callAt(0)
  expect(url).toBe(`${env.VITE_API_BASE_URL}/events/${event.id}`)
  expect(init.method).toBe('DELETE')
  expect(init.headers).toBeUndefined()
  expect(init.body).toBeUndefined()
})
