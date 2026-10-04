import { http, HttpResponse } from 'msw/http'
import { delay } from 'msw/utils/delay'

import type { EventListParams, EventPayload, EventSortOrder } from '@/entities/event'

import { MOCK_HTTP, MOCK_LATENCY_MS, MOCK_MESSAGES } from './constants.ts'
import { db } from './db.ts'

function latencyMs(): number {
  return import.meta.env.MODE === 'test' ? 0 : MOCK_LATENCY_MS
}

function faultEnabled(): boolean {
  return typeof window !== 'undefined' && window.__E2E_FAULT__ === true
}

function serverFailure(): Response | null {
  if (!faultEnabled()) return null
  return HttpResponse.json({ message: MOCK_MESSAGES.SERVER_ERROR }, { status: 500 })
}

function notFound(): Response {
  return HttpResponse.json({ message: MOCK_MESSAGES.NOT_FOUND }, { status: 404 })
}

function intParam(raw: string | null, fallback: number): number {
  const value = raw === null ? Number.NaN : Number.parseInt(raw, 10)
  return Number.isFinite(value) ? value : fallback
}

function parseOrder(raw: string | null): EventSortOrder {
  return raw === 'asc' || raw === 'desc' ? raw : MOCK_HTTP.ORDER_DEFAULT
}

function listParams(url: URL): EventListParams {
  return {
    page: intParam(url.searchParams.get('page'), MOCK_HTTP.PAGE_DEFAULT),
    limit: intParam(url.searchParams.get('limit'), MOCK_HTTP.LIMIT_DEFAULT),
    sortBy: url.searchParams.get('sortBy') ?? MOCK_HTTP.SORT_BY_DEFAULT,
    order: parseOrder(url.searchParams.get('order')),
  }
}

function readId(id: string | readonly string[] | undefined): string | null {
  return typeof id === 'string' && id !== '' ? id : null
}

async function readPayload(request: Request): Promise<EventPayload> {
  return (await request.json()) as EventPayload
}

export const handlers = [
  http.get(MOCK_HTTP.EVENTS_PATH, async ({ request }) => {
    await delay(latencyMs())
    const failure = serverFailure()
    if (failure) return failure
    return HttpResponse.json(db.list(listParams(new URL(request.url))))
  }),

  http.get(MOCK_HTTP.EVENT_PATH, async ({ params }) => {
    await delay(latencyMs())
    const failure = serverFailure()
    if (failure) return failure
    const id = readId(params.id)
    if (id === null) return notFound()
    const event = db.get(id)
    if (event === undefined) return notFound()
    return HttpResponse.json(event)
  }),

  http.post(MOCK_HTTP.EVENTS_PATH, async ({ request }) => {
    await delay(latencyMs())
    const failure = serverFailure()
    if (failure) return failure
    const payload = await readPayload(request)
    return HttpResponse.json(db.create(payload), { status: MOCK_HTTP.CREATED_STATUS })
  }),

  http.put(MOCK_HTTP.EVENT_PATH, async ({ request, params }) => {
    await delay(latencyMs())
    const failure = serverFailure()
    if (failure) return failure
    const id = readId(params.id)
    if (id === null) return notFound()
    const payload = await readPayload(request)
    const updated = db.update(id, payload)
    if (updated === null) return notFound()
    return HttpResponse.json(updated)
  }),

  http.delete(MOCK_HTTP.EVENT_PATH, async ({ params }) => {
    await delay(latencyMs())
    const failure = serverFailure()
    if (failure) return failure
    const id = readId(params.id)
    if (id === null) return notFound()
    const removed = db.remove(id)
    if (removed === null) return notFound()
    return HttpResponse.json(removed)
  }),
]
