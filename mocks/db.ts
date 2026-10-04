import type { EventItem, EventListParams, EventPayload, EventSortOrder } from '@/entities/event'

import { E2E_SEED_SIZE, MOCK_DB_DEFAULT_SIZE } from './constants.ts'
import { generateEvents } from './generate.ts'

let events: EventItem[] | null = null

function defaultSize(): number {
  return import.meta.env.MODE === 'e2e' ? E2E_SEED_SIZE : MOCK_DB_DEFAULT_SIZE
}

function seedSize(): number {
  const seed = typeof window === 'undefined' ? undefined : window.__E2E_SEED__
  return seed ?? defaultSize()
}

function ensure(): EventItem[] {
  events ??= generateEvents(seedSize())
  return events
}

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value)
}

function compareValues(left: string | number, right: string | number): number {
  const leftNumber = toNumber(left)
  const rightNumber = toNumber(right)
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return leftNumber - rightNumber
  }
  return String(left).localeCompare(String(right))
}

function sorted(list: EventItem[], sortBy: string, order: EventSortOrder): EventItem[] {
  const direction = order === 'desc' ? -1 : 1
  return [...list].sort((first, second) => {
    const left = first[sortBy as keyof EventItem] ?? ''
    const right = second[sortBy as keyof EventItem] ?? ''
    return compareValues(left, right) * direction
  })
}

function nextId(list: EventItem[]): string {
  let max = 0
  for (const event of list) {
    const numericId = Number(event.id)
    if (Number.isFinite(numericId) && numericId > max) max = numericId
  }
  return String(max + 1)
}

export const db = {
  reset(size?: number): void {
    events = generateEvents(size ?? seedSize())
  },

  list({ page, limit, sortBy, order }: EventListParams): EventItem[] {
    const ordered = sorted(ensure(), sortBy, order)
    const size = Math.max(Math.floor(limit), 0)
    const start = Number.isFinite(size) ? (Math.max(Math.floor(page), 1) - 1) * size : 0
    return ordered.slice(start, start + size)
  },

  get(id: string): EventItem | undefined {
    return ensure().find((event) => event.id === id)
  },

  create(payload: EventPayload): EventItem {
    const list = ensure()
    const event = { ...payload, id: nextId(list) }
    list.push(event)
    return event
  },

  update(id: string, payload: EventPayload): EventItem | null {
    const list = ensure()
    const index = list.findIndex((event) => event.id === id)
    if (index < 0) return null
    const updated = { ...payload, id }
    list[index] = updated
    return updated
  },

  remove(id: string): EventItem | null {
    const list = ensure()
    const index = list.findIndex((event) => event.id === id)
    if (index < 0) return null
    const [removed] = list.splice(index, 1)
    return removed ?? null
  },
}
