import { env, HTTP, HTTP_MESSAGES } from '@/shared/config'

import { ApiError, ContractError, NetworkError } from './errors'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type QueryParams = Record<string, string | number | boolean | undefined>

export interface RequestConfig {
  method?: HttpMethod
  query?: QueryParams
  body?: unknown
  signal?: AbortSignal
}

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

const TIMEOUT_ERROR_NAME = 'TimeoutError'

export async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = 'GET', query, body, signal } = config
  const url = buildUrl(path, query)
  const retryableMethod = method === 'GET'
  let pauseMs = HTTP.RETRY_BASE_DELAY_MS

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fetchJson<T>(url, method, body, signal)
    } catch (error) {
      if (!retryableMethod || !isRetryable(error) || attempt >= HTTP.RETRY_COUNT) throw error
      await pause(pauseMs, signal)
      pauseMs += pauseMs
    }
  }
}

async function fetchJson<T>(
  url: string,
  method: HttpMethod,
  body: unknown,
  external: AbortSignal | undefined,
): Promise<T> {
  if (external?.aborted) throw external.reason

  const timeout = AbortSignal.timeout(HTTP.TIMEOUT_MS)
  const signal = external ? AbortSignal.any([timeout, external]) : timeout

  let response: Response
  try {
    response = await fetch(url, createInit(method, signal, body))
  } catch (error) {
    throw normalize(error, timeout, external)
  }

  if (!response.ok) throw new ApiError(response.status)
  return readBody<T>(response)
}

function createInit(method: HttpMethod, signal: AbortSignal, body: unknown): RequestInit {
  const init: RequestInit = { method, signal }
  if (body !== undefined) {
    init.headers = JSON_HEADERS
    init.body = JSON.stringify(body)
  }
  return init
}

function normalize(
  error: unknown,
  timeout: AbortSignal,
  external: AbortSignal | undefined,
): unknown {
  if (external?.aborted) return external.reason
  if (isNamed(error, TIMEOUT_ERROR_NAME) || timeout.aborted) {
    return new NetworkError(HTTP_MESSAGES.TIMEOUT, { cause: error })
  }
  if (error instanceof TypeError) return new NetworkError(HTTP_MESSAGES.NETWORK, { cause: error })
  return error
}

function isRetryable(error: unknown): boolean {
  return (
    error instanceof NetworkError ||
    (error instanceof ApiError && error.status >= HTTP.SERVER_ERROR_STATUS)
  )
}

function isNamed(error: unknown, name: string): boolean {
  return typeof error === 'object' && error !== null && 'name' in error && error.name === name
}

async function readBody<T>(response: Response): Promise<T> {
  const text = await response.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : undefined
  } catch (error) {
    throw new ContractError(HTTP_MESSAGES.CONTRACT, { cause: error })
  }
  return data as T
}

function buildUrl(path: string, query: QueryParams | undefined): string {
  const base = env.VITE_API_BASE_URL.replace(/\/+$/, '')
  const url = `${base}/${path.replace(/^\/+/, '')}`
  if (!query) return url
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) search.append(key, String(value))
  }
  const params = search.toString()
  return params ? `${url}?${params}` : url
}

function pause(ms: number, external: AbortSignal | undefined): Promise<void> {
  if (external?.aborted) return Promise.reject(external.reason)

  return new Promise((resolve, reject) => {
    const onAbort = (): void => {
      clearTimeout(timer)
      reject(external?.reason)
    }
    const timer = setTimeout(() => {
      external?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    external?.addEventListener('abort', onAbort, { once: true })
    if (external?.aborted) onAbort()
  })
}
