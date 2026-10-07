import { http, HttpResponse } from 'msw/http'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'
import { defineComponent, h, ref, type PropType } from 'vue'

import { worker } from '@mocks/browser'
import { MOCK_HTTP, MOCK_MESSAGES } from '@mocks/constants'
import { db } from '@mocks/db'
import { createTestContext } from '@mocks/test-utils'

import { isoToLocalInput, type EventItem, type EventPayload } from '@/entities/event'
import { HTTP, HTTP_MESSAGES } from '@/shared/config'

import { EVENT_VALIDATION } from '../config/constants'
import {
  EVENT_FORM_ACTIONS,
  EVENT_FORM_ERRORS,
  EVENT_FORM_FEEDBACK,
  EVENT_FORM_LABELS,
} from '../config/messages'
import type { EventFormMode } from '../model/useEventForm'
import EventFormModal from './EventFormModal.vue'

const WAIT = { timeout: 5_000 }
const DB_SIZE = 3
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

type HarnessProps = { mode: EventFormMode; event?: EventItem | null }

const Harness = defineComponent({
  props: {
    mode: { type: String as PropType<EventFormMode>, default: 'create' },
    event: { type: Object as PropType<EventItem | null>, default: null },
  },
  setup(props) {
    const isOpen = ref(true)
    return () =>
      isOpen.value
        ? h(EventFormModal, {
            mode: props.mode,
            event: props.event,
            onClose: () => {
              isOpen.value = false
            },
          })
        : h('div')
  },
})

function renderModal(overrides: Partial<HarnessProps> = {}) {
  const { plugins } = createTestContext()
  const props: HarnessProps = { mode: 'create', ...overrides }
  return render(Harness, { props, global: { plugins } })
}

function firstEvent(): EventItem {
  const [event] = db.list({
    page: 1,
    limit: MOCK_HTTP.LIMIT_DEFAULT,
    sortBy: 'id',
    order: 'asc',
  })
  if (!event) throw new Error('в базе нет событий')
  return event
}

function requirePayload(payload: EventPayload | null): EventPayload {
  if (!payload) throw new Error('запрос не отправлен')
  return payload
}

async function fillValidForm(screen: Awaited<ReturnType<typeof renderModal>>): Promise<void> {
  await screen.getByLabelText(EVENT_FORM_LABELS.TITLE).fill('Название события')
  await screen.getByLabelText(EVENT_FORM_LABELS.DESCRIPTION).fill('Описание события')
  await screen.getByLabelText(EVENT_FORM_LABELS.START_AT).fill('2026-03-10T10:00')
  await screen.getByLabelText(EVENT_FORM_LABELS.END_AT).fill('2026-03-10T11:30')
}

beforeEach(() => {
  db.reset(DB_SIZE)
})

afterEach(() => {
  worker.resetHandlers()
})

test('валидация title: слишком короткое и слишком длинное', async () => {
  const screen = await renderModal()
  const title = screen.getByLabelText(EVENT_FORM_LABELS.TITLE)
  const save = screen.getByRole('button', { name: EVENT_FORM_ACTIONS.SAVE })

  await title.fill('аб')
  await save.click()

  await expect
    .element(screen.getByText(EVENT_FORM_ERRORS.TITLE_MIN(EVENT_VALIDATION.TITLE_MIN_LENGTH)), WAIT)
    .toBeVisible()

  await title.fill('а'.repeat(EVENT_VALIDATION.TITLE_MAX_LENGTH + 1))
  await save.click()

  await expect
    .element(screen.getByText(EVENT_FORM_ERRORS.TITLE_MAX(EVENT_VALIDATION.TITLE_MAX_LENGTH)), WAIT)
    .toBeVisible()
  await expect.element(title, WAIT).toHaveValue('а'.repeat(EVENT_VALIDATION.TITLE_MAX_LENGTH + 1))
})

test('валидация description: длиннее максимума', async () => {
  const screen = await renderModal()
  const description = screen.getByLabelText(EVENT_FORM_LABELS.DESCRIPTION)

  await description.fill('а'.repeat(EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH + 1))
  await screen.getByRole('button', { name: EVENT_FORM_ACTIONS.SAVE }).click()

  await expect
    .element(
      screen.getByText(EVENT_FORM_ERRORS.DESCRIPTION_MAX(EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH)),
      WAIT,
    )
    .toBeVisible()
})

test('валидация дат: обе даты обязательны', async () => {
  const screen = await renderModal()

  await screen.getByLabelText(EVENT_FORM_LABELS.TITLE).fill('Валидное название')
  await screen.getByRole('button', { name: EVENT_FORM_ACTIONS.SAVE }).click()

  await expect.element(screen.getByText(EVENT_FORM_ERRORS.START_REQUIRED), WAIT).toBeVisible()
  await expect.element(screen.getByText(EVENT_FORM_ERRORS.END_REQUIRED), WAIT).toBeVisible()
})

test('нельзя сохранить запись с endAt <= startAt: ошибка и запрос не уходит', async () => {
  let posted = false
  worker.use(
    http.post(MOCK_HTTP.EVENTS_PATH, async ({ request }) => {
      posted = true
      const payload = (await request.json()) as EventPayload
      return HttpResponse.json({ id: '1', ...payload }, { status: MOCK_HTTP.CREATED_STATUS })
    }),
  )

  const screen = await renderModal()
  const start = screen.getByLabelText(EVENT_FORM_LABELS.START_AT)
  const end = screen.getByLabelText(EVENT_FORM_LABELS.END_AT)
  const save = screen.getByRole('button', { name: EVENT_FORM_ACTIONS.SAVE })

  await screen.getByLabelText(EVENT_FORM_LABELS.TITLE).fill('Название события')
  await start.fill('2026-03-10T11:00')
  await end.fill('2026-03-10T11:00')
  await save.click()

  await expect.element(screen.getByText(EVENT_FORM_ERRORS.RANGE), WAIT).toBeVisible()
  expect(posted).toBe(false)

  await end.fill('2026-03-10T12:00')
  await userEvent.click(screen.getByRole('dialog'))
  await expect.element(screen.getByText(EVENT_FORM_ERRORS.RANGE), WAIT).not.toBeInTheDocument()

  await save.click()

  await expect.element(screen.getByRole('dialog'), WAIT).not.toBeInTheDocument()
  expect(posted).toBe(true)
})

test('длительность: блок подсказывает автозаполнение и пересчитывается по датам', async () => {
  const screen = await renderModal()
  const duration = screen.getByLabelText(EVENT_FORM_LABELS.DURATION)

  await expect.element(duration, WAIT).toHaveTextContent(EVENT_FORM_FEEDBACK.DURATION_HINT)

  await screen.getByLabelText(EVENT_FORM_LABELS.START_AT).fill('2026-03-10T10:00')
  await screen.getByLabelText(EVENT_FORM_LABELS.END_AT).fill('2026-03-10T11:30')

  await expect.element(duration, WAIT).toHaveTextContent('1 ч 30 мин')

  await screen.getByLabelText(EVENT_FORM_LABELS.END_AT).fill('2026-03-10T10:00')

  await expect.element(duration, WAIT).toHaveTextContent(EVENT_FORM_FEEDBACK.DURATION_HINT)
})

test('create: на сервер уходят ISO UTC и корректный durationMinutes', async () => {
  let body: EventPayload | null = null
  worker.use(
    http.post(MOCK_HTTP.EVENTS_PATH, async ({ request }) => {
      const payload = (await request.json()) as EventPayload
      body = payload
      return HttpResponse.json({ id: '1', ...payload }, { status: MOCK_HTTP.CREATED_STATUS })
    }),
  )

  const screen = await renderModal()
  await screen.getByLabelText(EVENT_FORM_LABELS.TITLE).fill('  Новое событие  ')
  await screen.getByLabelText(EVENT_FORM_LABELS.DESCRIPTION).fill('  Описание события  ')
  await screen.getByLabelText(EVENT_FORM_LABELS.START_AT).fill('2026-03-10T10:00')
  await screen.getByLabelText(EVENT_FORM_LABELS.END_AT).fill('2026-03-10T11:30')
  await screen.getByRole('button', { name: EVENT_FORM_ACTIONS.SAVE }).click()

  await expect.element(screen.getByRole('dialog'), WAIT).not.toBeInTheDocument()

  const payload = requirePayload(body)
  expect(payload.title).toBe('Новое событие')
  expect(payload.description).toBe('Описание события')
  expect(payload.startAt).toMatch(ISO_UTC_PATTERN)
  expect(payload.endAt).toMatch(ISO_UTC_PATTERN)
  expect(isoToLocalInput(payload.startAt)).toBe('2026-03-10T10:00')
  expect(isoToLocalInput(payload.endAt)).toBe('2026-03-10T11:30')
  expect(payload.durationMinutes).toBe(90)
})

test('edit: предзаполнение из строки списка и PUT с корректным payload', async () => {
  const row = firstEvent()
  let body: EventPayload | null = null
  worker.use(
    http.put(MOCK_HTTP.EVENT_PATH, async ({ request }) => {
      const payload = (await request.json()) as EventPayload
      body = payload
      return HttpResponse.json({ id: row.id, ...payload })
    }),
  )

  const screen = await renderModal({ mode: 'edit', event: row })

  await expect.element(screen.getByLabelText(EVENT_FORM_LABELS.TITLE), WAIT).toHaveValue(row.title)
  await expect
    .element(screen.getByLabelText(EVENT_FORM_LABELS.START_AT), WAIT)
    .toHaveValue(isoToLocalInput(row.startAt))

  await screen.getByLabelText(EVENT_FORM_LABELS.TITLE).fill('Обновлённое название')
  await screen.getByLabelText(EVENT_FORM_LABELS.START_AT).fill('2026-05-01T09:00')
  await screen.getByLabelText(EVENT_FORM_LABELS.END_AT).fill('2026-05-01T10:30')
  await screen.getByRole('button', { name: EVENT_FORM_ACTIONS.SAVE }).click()

  await expect.element(screen.getByRole('dialog'), WAIT).not.toBeInTheDocument()

  const payload = requirePayload(body)
  expect(payload.title).toBe('Обновлённое название')
  expect(payload.startAt).toMatch(ISO_UTC_PATTERN)
  expect(payload.endAt).toMatch(ISO_UTC_PATTERN)
  expect(isoToLocalInput(payload.startAt)).toBe('2026-05-01T09:00')
  expect(isoToLocalInput(payload.endAt)).toBe('2026-05-01T10:30')
  expect(payload.durationMinutes).toBe(90)
})

test('ошибка сервера: alert внутри модалки, окно остаётся открытым', async () => {
  worker.use(
    http.post(MOCK_HTTP.EVENTS_PATH, () =>
      HttpResponse.json(
        { message: MOCK_MESSAGES.SERVER_ERROR },
        {
          status: HTTP.SERVER_ERROR_STATUS,
        },
      ),
    ),
  )

  const screen = await renderModal()
  await fillValidForm(screen)
  await screen.getByRole('button', { name: EVENT_FORM_ACTIONS.SAVE }).click()

  await expect
    .element(screen.getByRole('alert'), WAIT)
    .toHaveTextContent(HTTP_MESSAGES.API_ERROR(HTTP.SERVER_ERROR_STATUS))
  await expect.element(screen.getByRole('dialog'), WAIT).toBeVisible()
})

test('на время запроса кнопки заблокированы и Esc не закрывает модалку', async () => {
  let started = false
  const deferred: { resolve: (() => void) | null } = { resolve: null }
  worker.use(
    http.post(MOCK_HTTP.EVENTS_PATH, async ({ request }) => {
      const payload = (await request.json()) as EventPayload
      started = true
      await new Promise<void>((resolve) => {
        deferred.resolve = resolve
      })
      return HttpResponse.json({ id: '1', ...payload }, { status: MOCK_HTTP.CREATED_STATUS })
    }),
  )

  const screen = await renderModal()
  await fillValidForm(screen)

  const save = screen.getByRole('button', { name: EVENT_FORM_ACTIONS.SAVE })
  const cancel = screen.getByRole('button', { name: EVENT_FORM_ACTIONS.CANCEL })
  await save.click()

  await vi.waitFor(() => {
    expect(started).toBe(true)
  })

  await expect.element(save, WAIT).toBeDisabled()
  await expect.element(cancel, WAIT).toBeDisabled()

  await userEvent.keyboard('{Escape}')
  await expect.element(screen.getByRole('dialog'), WAIT).toBeVisible()

  if (!deferred.resolve) throw new Error('запрос не был отложен')
  deferred.resolve()

  await expect.element(screen.getByRole('dialog'), WAIT).not.toBeInTheDocument()
})

test('404 от detail-запроса: событие удалено — ошибка внутри модалки', async () => {
  const row = firstEvent()
  worker.use(
    http.get(MOCK_HTTP.EVENT_PATH, () =>
      HttpResponse.json({ message: MOCK_MESSAGES.NOT_FOUND }, { status: HTTP.NOT_FOUND_STATUS }),
    ),
  )

  const screen = await renderModal({ mode: 'edit', event: row })

  await expect
    .element(screen.getByRole('alert'), WAIT)
    .toHaveTextContent(EVENT_FORM_FEEDBACK.DETAIL_NOT_FOUND)
  await expect.element(screen.getByLabelText(EVENT_FORM_LABELS.TITLE), WAIT).toHaveValue(row.title)
})
