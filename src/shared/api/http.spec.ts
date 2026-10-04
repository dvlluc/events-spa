import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { env, HTTP, HTTP_MESSAGES } from '@/shared/config'

import { ApiError, ContractError, NetworkError } from './errors'
import { request } from './http'

const fetchMock = vi.fn<typeof fetch>()

const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), { status })

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

const callAt = (index: number): [string, RequestInit] => {
  const call = fetchMock.mock.calls[index]
  if (!call) throw new Error(`fetch не вызывался, индекс ${index}`)
  return [String(call[0]), call[1] ?? {}]
}

const nameOf = (error: unknown): unknown =>
  typeof error === 'object' && error !== null && 'name' in error ? error.name : undefined

const failure = (promise: Promise<unknown>): Promise<unknown> => promise.catch((error) => error)

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  fetchMock.mockReset()
})

test('GET собирает базовый URL и query, не отправляя заголовков и тела', async () => {
  fetchMock.mockResolvedValue(jsonResponse([]))

  await request('/events', {
    query: { page: 2, limit: 10, sortBy: 'startAt', order: 'desc', filter: undefined },
  })

  const [url, init] = callAt(0)
  expect(url).toBe(`${env.VITE_API_BASE_URL}/events?page=2&limit=10&sortBy=startAt&order=desc`)
  expect(init.method).toBe('GET')
  expect(init.headers).toBeUndefined()
  expect(init.body).toBeUndefined()
  expect(init.signal).toBeInstanceOf(AbortSignal)
})

test('запрос с телом получает Content-Type: application/json', async () => {
  fetchMock.mockResolvedValue(jsonResponse({ id: '1' }, 201))

  await request('/events', { method: 'POST', body: { title: 'Test' } })

  const [url, init] = callAt(0)
  expect(url).toBe(`${env.VITE_API_BASE_URL}/events`)
  expect(init.method).toBe('POST')
  expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
  expect(init.body).toBe(JSON.stringify({ title: 'Test' }))
})

test('DELETE без тела не получает Content-Type', async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

  await request('/events/1', { method: 'DELETE' })

  const [, init] = callAt(0)
  expect(init.headers).toBeUndefined()
  expect(init.body).toBeUndefined()
})

test('4xx превращается в ApiError без ретраев', async () => {
  fetchMock.mockResolvedValue(jsonResponse({ message: 'Not found' }, 404))

  const error = await failure(request('/events', { query: { page: 99 } }))

  expect(error).toBeInstanceOf(ApiError)
  expect((error as ApiError).status).toBe(404)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('5xx у GET ретраится RETRY_COUNT раз и падает с ApiError', async () => {
  vi.useFakeTimers()
  fetchMock.mockResolvedValue(jsonResponse({}, 500))

  const promise = failure(request('/events'))
  await vi.runAllTimersAsync()
  const error = await promise

  expect(error).toBeInstanceOf(ApiError)
  expect((error as ApiError).status).toBe(HTTP.SERVER_ERROR_STATUS)
  expect(fetchMock).toHaveBeenCalledTimes(HTTP.RETRY_COUNT + 1)
})

test('5xx у POST не ретраится', async () => {
  fetchMock.mockResolvedValue(jsonResponse({}, 500))

  const error = await failure(request('/events', { method: 'POST', body: {} }))

  expect(error).toBeInstanceOf(ApiError)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('сетевой сбой у GET ретраится и превращается в NetworkError', async () => {
  vi.useFakeTimers()
  fetchMock.mockRejectedValue(new TypeError('fetch failed'))

  const promise = failure(request('/events'))
  await vi.runAllTimersAsync()
  const error = await promise

  expect(error).toBeInstanceOf(NetworkError)
  expect((error as NetworkError).message).toBe(HTTP_MESSAGES.NETWORK)
  expect(fetchMock).toHaveBeenCalledTimes(HTTP.RETRY_COUNT + 1)
})

test('сетевой сбой у POST не ретраится', async () => {
  fetchMock.mockRejectedValue(new TypeError('fetch failed'))

  const error = await failure(request('/events', { method: 'PUT', body: {} }))

  expect(error).toBeInstanceOf(NetworkError)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('таймаут нормализуется в NetworkError и ретраится как сетевая ошибка', async () => {
  vi.useFakeTimers()
  vi.spyOn(AbortSignal, 'timeout').mockReturnValue(
    AbortSignal.abort(new DOMException('signal timed out', 'TimeoutError')),
  )
  hangUntilAbort()

  const promise = failure(request('/events'))
  await vi.runAllTimersAsync()
  const error = await promise

  expect(error).toBeInstanceOf(NetworkError)
  expect((error as NetworkError).message).toBe(HTTP_MESSAGES.TIMEOUT)
  expect(fetchMock).toHaveBeenCalledTimes(HTTP.RETRY_COUNT + 1)
})

test('внешний abort пробрасывается как AbortError без ретраев', async () => {
  hangUntilAbort()
  const controller = new AbortController()

  const promise = failure(request('/events', { signal: controller.signal }))
  controller.abort()
  const error = await promise

  expect(nameOf(error)).toBe('AbortError')
  expect(error).not.toBeInstanceOf(NetworkError)
  expect(error).not.toBeInstanceOf(ApiError)
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('abort во время паузы прекращает ретраи', async () => {
  vi.useFakeTimers()
  fetchMock.mockRejectedValue(new TypeError('fetch failed'))
  const controller = new AbortController()

  const promise = failure(request('/events', { signal: controller.signal }))
  await vi.advanceTimersByTimeAsync(HTTP.RETRY_BASE_DELAY_MS / 2)
  controller.abort()
  const error = await promise

  expect(nameOf(error)).toBe('AbortError')
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('некорректный JSON превращается в ContractError', async () => {
  fetchMock.mockResolvedValue(new Response('<html>', { status: 200 }))

  const error = await failure(request('/events'))

  expect(error).toBeInstanceOf(ContractError)
  expect((error as ContractError).message).toBe(HTTP_MESSAGES.CONTRACT)
})

test('пустой ответ разбирается как undefined', async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

  await expect(request('/events/1', { method: 'DELETE' })).resolves.toBeUndefined()
})
