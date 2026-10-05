import { http, HttpResponse } from 'msw/http'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'

import { worker } from '@mocks/browser'
import { MOCK_HTTP } from '@mocks/constants'
import { db } from '@mocks/db'
import { createTestContext } from '@mocks/test-utils'

import { eventKeys, formatDateTime, formatDuration, type EventItem } from '@/entities/event'
import { STATE_MESSAGES, UI_MESSAGES } from '@/shared/config'

import { PAGINATION, SORT, VIRTUALIZATION } from '../config/constants'
import { LIST_MESSAGES, PAGER_MESSAGES } from '../config/messages'
import { useListStore } from '../model/listStore'
import EventsPage from './EventsPage.vue'

const WAIT = { timeout: 5_000 }
const SLOW_WAIT = { timeout: 10_000 }
const SLOW_TEST = { timeout: 15_000 }
const MAX_PAGE_SIZE = 100

type ListStore = ReturnType<typeof useListStore>

async function renderPage(prepare?: (store: ListStore) => void) {
  const { plugins, pinia } = createTestContext()
  prepare?.(useListStore(pinia))
  return render(EventsPage, { global: { plugins } })
}

type Screen = Awaited<ReturnType<typeof renderPage>>

function rowCount(screen: Screen): number {
  return screen.getByRole('listitem').length
}

function firstEvent(): EventItem {
  const [event] = db.list({
    page: 1,
    limit: 1,
    sortBy: SORT.DEFAULT_FIELD,
    order: SORT.DEFAULT_ORDER,
  })
  if (!event) throw new Error('в базе нет событий')
  return event
}

function visibleRows(screen: Screen): number {
  const viewport = screen.getByRole('list').query()
  expect(viewport).not.toBeNull()
  const stride = VIRTUALIZATION.ROW_HEIGHT_PX + VIRTUALIZATION.ROW_GAP_PX
  return Math.ceil((viewport?.clientHeight ?? 0) / stride)
}

async function waitForRows(screen: Screen): Promise<void> {
  await vi.waitFor(
    () => {
      expect(rowCount(screen)).toBeGreaterThan(0)
    },
    { timeout: SLOW_WAIT.timeout },
  )
}

beforeEach(() => {
  db.reset()
})

afterEach(() => {
  worker.resetHandlers()
})

test('пагинация: цифры страниц, стрелки и смена размера страницы', async () => {
  db.reset(30)
  const screen = await renderPage()
  const first = firstEvent()

  await expect
    .element(screen.getByRole('listitem'), WAIT)
    .toHaveLength(PAGINATION.DEFAULT_PAGE_SIZE)

  const firstRow = screen.getByRole('listitem').first()
  await expect.element(firstRow.getByText(first.title), WAIT).toBeInTheDocument()
  await expect.element(firstRow.getByText(formatDateTime(first.startAt)), WAIT).toBeInTheDocument()
  await expect
    .element(firstRow.getByText(formatDuration(first.durationMinutes)), WAIT)
    .toBeInTheDocument()

  const pageOne = screen.getByRole('button', { name: PAGER_MESSAGES.PAGE(1) })
  const pageTwo = screen.getByRole('button', { name: PAGER_MESSAGES.PAGE(2) })
  const prevButton = screen.getByRole('button', { name: PAGER_MESSAGES.PREV })
  const nextButton = screen.getByRole('button', { name: PAGER_MESSAGES.NEXT })

  await expect.element(pageOne, WAIT).toHaveAttribute('aria-current', 'page')
  await expect.element(prevButton, WAIT).toBeDisabled()
  await expect.element(nextButton, WAIT).toBeEnabled()
  await expect.element(pageTwo, WAIT).toBeEnabled()

  await pageTwo.click()
  await expect.element(pageTwo, WAIT).toHaveAttribute('aria-current', 'page')
  await expect.element(pageOne, WAIT).not.toHaveAttribute('aria-current', 'page')
  await expect.element(prevButton, WAIT).toBeEnabled()

  await prevButton.click()
  await expect.element(pageOne, WAIT).toHaveAttribute('aria-current', 'page')
  await expect.element(prevButton, WAIT).toBeDisabled()

  await nextButton.click()
  await expect.element(pageTwo, WAIT).toHaveAttribute('aria-current', 'page')

  await screen.getByRole('combobox').selectOptions(String(PAGINATION.PAGE_SIZE_OPTIONS[0]))
  await expect.element(pageOne, WAIT).toHaveAttribute('aria-current', 'page')
  await expect
    .element(screen.getByRole('listitem'), WAIT)
    .toHaveLength(PAGINATION.PAGE_SIZE_OPTIONS[0])
})

test('50 строк — ровно порог, все строки в DOM', async () => {
  db.reset(VIRTUALIZATION.THRESHOLD)
  const screen = await renderPage((store) => store.setPageSize(VIRTUALIZATION.THRESHOLD))

  await expect.element(screen.getByRole('listitem'), WAIT).toHaveLength(VIRTUALIZATION.THRESHOLD)
})

test('51 строка — виртуализация: в DOM меньше всех, но не меньше видимых', SLOW_TEST, async () => {
  db.reset(VIRTUALIZATION.THRESHOLD + 1)
  const screen = await renderPage((store) => store.setPageSize(MAX_PAGE_SIZE))

  await waitForRows(screen)

  const rendered = rowCount(screen)
  expect(rendered).toBeLessThan(VIRTUALIZATION.THRESHOLD + 1)
  expect(rendered).toBeGreaterThanOrEqual(visibleRows(screen))
})

test('100 строк — виртуализация: в DOM меньше всех, но не меньше видимых', SLOW_TEST, async () => {
  db.reset(MAX_PAGE_SIZE)
  const screen = await renderPage((store) => store.setPageSize(MAX_PAGE_SIZE))

  await waitForRows(screen)

  const rendered = rowCount(screen)
  expect(rendered).toBeLessThan(MAX_PAGE_SIZE)
  expect(rendered).toBeGreaterThanOrEqual(visibleRows(screen))
})

test('пустая база — empty-состояние вместо списка', async () => {
  db.reset(0)
  const screen = await renderPage()

  await expect.element(screen.getByRole('status'), WAIT).toHaveTextContent(STATE_MESSAGES.EMPTY)
  expect(screen.getByRole('list').query()).toBeNull()
})

test('ошибка загрузки — alert и «Повторить» возвращает список', SLOW_TEST, async () => {
  worker.use(
    http.get(MOCK_HTTP.EVENTS_PATH, () => HttpResponse.json({ message: 'error' }, { status: 500 })),
  )
  const screen = await renderPage()

  await expect.element(screen.getByRole('alert'), SLOW_WAIT).toHaveTextContent(STATE_MESSAGES.ERROR)

  worker.resetHandlers()
  await screen.getByRole('button', { name: UI_MESSAGES.RETRY }).click()

  await expect
    .element(screen.getByRole('listitem'), WAIT)
    .toHaveLength(PAGINATION.DEFAULT_PAGE_SIZE)
})

test('«Создать» и «Редактировать» открывают форму, Esc закрывает её', async () => {
  const screen = await renderPage()
  await expect
    .element(screen.getByRole('listitem'), WAIT)
    .toHaveLength(PAGINATION.DEFAULT_PAGE_SIZE)
  const first = firstEvent()

  await screen.getByRole('button', { name: LIST_MESSAGES.CREATE }).click()

  const createDialog = screen.getByRole('dialog')
  await expect.element(createDialog, WAIT).toBeVisible()
  await expect.element(createDialog.getByRole('textbox').first(), WAIT).toHaveValue('')

  await userEvent.keyboard('{Escape}')
  await expect.element(screen.getByRole('dialog'), WAIT).not.toBeInTheDocument()

  await screen
    .getByRole('listitem')
    .first()
    .getByRole('button', { name: LIST_MESSAGES.EDIT })
    .click()

  const editDialog = screen.getByRole('dialog')
  await expect.element(editDialog, WAIT).toBeVisible()
  await expect.element(editDialog.getByRole('textbox').first(), WAIT).toHaveValue(first.title)

  await userEvent.keyboard('{Escape}')
  await expect.element(screen.getByRole('dialog'), WAIT).not.toBeInTheDocument()
})

test('удаление последнего элемента страницы > 1 — автопереход назад', async () => {
  db.reset(PAGINATION.DEFAULT_PAGE_SIZE + 1)
  const screen = await renderPage((store) => store.setPage(PAGINATION.DEFAULT_PAGE + 1))

  await expect.element(screen.getByRole('listitem'), WAIT).toHaveLength(1)

  await screen.getByRole('listitem').getByRole('button', { name: LIST_MESSAGES.DELETE }).click()

  const dialog = screen.getByRole('dialog')
  await expect.element(dialog, WAIT).toBeVisible()
  await dialog.getByRole('button', { name: LIST_MESSAGES.DELETE }).click()

  await expect.element(screen.getByRole('dialog'), WAIT).not.toBeInTheDocument()
  await expect
    .element(
      screen.getByRole('button', { name: PAGER_MESSAGES.PAGE(PAGINATION.DEFAULT_PAGE) }),
      WAIT,
    )
    .toHaveAttribute('aria-current', 'page')
  await expect
    .element(screen.getByRole('listitem'), WAIT)
    .toHaveLength(PAGINATION.DEFAULT_PAGE_SIZE)
})

function countRowUpdates(): { counter: { count: number }; mixin: { updated(): void } } {
  const counter = { count: 0 }
  const mixin = {
    updated(this: { $el: unknown }): void {
      const element = this.$el
      if (element instanceof Element && element.classList.contains('event-row')) {
        counter.count += 1
      }
    },
  }
  return { counter, mixin }
}

test(
  'профилирование: строки не перерисовываются при несвязанных изменениях',
  SLOW_TEST,
  async () => {
    db.reset(PAGINATION.DEFAULT_PAGE_SIZE)
    const { counter, mixin } = countRowUpdates()
    const { plugins, queryClient } = createTestContext({ staleTime: Infinity })
    const screen = await render(EventsPage, { global: { plugins, mixins: [mixin] } })

    await expect
      .element(screen.getByRole('listitem'), WAIT)
      .toHaveLength(PAGINATION.DEFAULT_PAGE_SIZE)
    expect(counter.count).toBe(0)

    await screen.getByRole('button', { name: LIST_MESSAGES.CREATE }).click()
    await expect.element(screen.getByRole('dialog'), WAIT).toBeVisible()
    expect(counter.count).toBe(0)

    await userEvent.keyboard('{Escape}')
    await expect.element(screen.getByRole('dialog'), WAIT).not.toBeInTheDocument()
    expect(counter.count).toBe(0)

    const changed = firstEvent()
    db.update(changed.id, { ...changed, description: 'обновлено при инвалидации' })
    await queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    await vi.waitFor(() => expect(counter.count).toBeGreaterThan(0), {
      timeout: SLOW_WAIT.timeout,
    })
  },
)
