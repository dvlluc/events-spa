import { expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import type { EventItem } from '@/entities/event'

import EventsVirtualList from './EventsVirtualList.vue'

const ITEM_COUNT = 100
const OVERLAP_TOLERANCE_PX = 2

function createEvent(id: string, index: number): EventItem {
  const isShort = index % 3 === 0
  return {
    id,
    title: `Событие ${id}`,
    description: isShort ? 'Короткое описание' : 'Очень длинное описание события. '.repeat(4),
    startAt: '2026-03-01T10:00:00.000Z',
    endAt: '2026-03-01T11:00:00.000Z',
    durationMinutes: 60,
  }
}

/** id вразнобой относительно позиции — как после сортировки по startAt. */
function shuffledIds(count: number): string[] {
  return Array.from({ length: count }, (_v, index) => String(((index * 37) % count) + 1))
}

function createItems(): EventItem[] {
  return shuffledIds(ITEM_COUNT).map((id, index) => createEvent(id, index))
}

function rowsOf(viewport: Element): Element[] {
  return Array.from(viewport.querySelectorAll('[role="listitem"]'))
}

function overlapPx(viewport: Element): number {
  const rects = rowsOf(viewport).map((row) => row.getBoundingClientRect())
  let overlap = 0
  for (let i = 1; i < rects.length; i += 1) {
    const prev = rects[i - 1]
    const curr = rects[i]
    if (!prev || !curr) continue
    const delta = curr.top - prev.top - prev.height
    if (delta < 0) overlap += -delta
  }
  return Math.round(overlap)
}

async function renderList() {
  const screen = await render(EventsVirtualList, { props: { items: createItems() } })
  await vi.waitFor(() => {
    expect(screen.getByRole('listitem').length).toBeGreaterThan(0)
  })
  return { screen, viewport: await screen.getByRole('list').element() }
}

test('data-index строки — числовой индекс окна виртуализации, а не id события', async () => {
  const { viewport } = await renderList()

  const dataIndexes = rowsOf(viewport).map((row) => row.getAttribute('data-index'))

  expect(dataIndexes).toEqual(dataIndexes.map((_value, index) => String(index)))
})

test('виртуализированные строки не перекрываются в начале и после прокрутки', async () => {
  const { viewport } = await renderList()

  await vi.waitFor(() => {
    expect(overlapPx(viewport)).toBeLessThanOrEqual(OVERLAP_TOLERANCE_PX)
  })

  viewport.scrollTop = viewport.scrollHeight

  await vi.waitFor(() => {
    expect(overlapPx(viewport)).toBeLessThanOrEqual(OVERLAP_TOLERANCE_PX)
  })
})
