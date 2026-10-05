import { http, HttpResponse } from 'msw/http'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { defineComponent, h, ref, type PropType } from 'vue'

import { worker } from '@mocks/browser'
import { MOCK_HTTP, MOCK_MESSAGES } from '@mocks/constants'
import { db } from '@mocks/db'
import { createTestContext } from '@mocks/test-utils'

import type { EventItem } from '@/entities/event'
import { HTTP, HTTP_MESSAGES } from '@/shared/config'

import { EVENT_DELETE_MESSAGES } from '../config/messages'
import EventDeleteModal from './EventDeleteModal.vue'

const WAIT = { timeout: 5_000 }
const DB_SIZE = 3

const Harness = defineComponent({
  props: {
    event: { type: Object as PropType<EventItem>, required: true },
  },
  setup(props) {
    const isOpen = ref(true)
    return () =>
      isOpen.value
        ? h(EventDeleteModal, {
            event: props.event,
            onClose: () => {
              isOpen.value = false
            },
          })
        : h('div')
  },
})

function renderModal(event: EventItem) {
  const { plugins } = createTestContext()
  return render(Harness, { props: { event }, global: { plugins } })
}

type Screen = Awaited<ReturnType<typeof renderModal>>

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

function confirmButton(screen: Screen) {
  return screen.getByRole('button', { name: EVENT_DELETE_MESSAGES.CONFIRM })
}

function cancelButton(screen: Screen) {
  return screen.getByRole('button', { name: EVENT_DELETE_MESSAGES.CANCEL })
}

beforeEach(() => {
  db.reset(DB_SIZE)
})

afterEach(() => {
  worker.resetHandlers()
})

test('отмена: окно закрывается, запрос не отправляется', async () => {
  const row = firstEvent()
  let requested = false
  worker.use(
    http.delete(MOCK_HTTP.EVENT_PATH, () => {
      requested = true
      return HttpResponse.json(row)
    }),
  )

  const screen = await renderModal(row)

  await expect
    .element(screen.getByRole('dialog', { name: EVENT_DELETE_MESSAGES.TITLE(row.title) }), WAIT)
    .toBeVisible()

  await cancelButton(screen).click()

  await expect.element(screen.getByRole('dialog'), WAIT).not.toBeInTheDocument()
  expect(requested).toBe(false)
  expect(db.get(row.id)).toBeDefined()
})

test('подтверждение: DELETE с id события, окно закрывается, на время запроса busy', async () => {
  const row = firstEvent()
  const deferred: { resolve: (() => void) | null } = { resolve: null }
  let started = false
  let requestedId: string | null = null
  worker.use(
    http.delete(MOCK_HTTP.EVENT_PATH, async ({ params }) => {
      started = true
      requestedId = typeof params.id === 'string' ? params.id : null
      await new Promise<void>((resolve) => {
        deferred.resolve = resolve
      })
      const removed = db.remove(row.id)
      if (!removed) {
        return HttpResponse.json(
          { message: MOCK_MESSAGES.NOT_FOUND },
          { status: HTTP.NOT_FOUND_STATUS },
        )
      }
      return HttpResponse.json(removed)
    }),
  )

  const screen = await renderModal(row)

  await confirmButton(screen).click()

  await vi.waitFor(() => {
    expect(started).toBe(true)
  })

  await expect.element(confirmButton(screen), WAIT).toBeDisabled()
  await expect.element(cancelButton(screen), WAIT).toBeDisabled()
  await expect.element(screen.getByRole('dialog'), WAIT).toBeVisible()

  if (!deferred.resolve) throw new Error('запрос не был отложен')
  deferred.resolve()

  await expect.element(screen.getByRole('dialog'), WAIT).not.toBeInTheDocument()
  expect(requestedId).toBe(row.id)
  expect(db.get(row.id)).toBeUndefined()
})

test('ошибка сервера: alert внутри модалки, окно остаётся открытым', async () => {
  const row = firstEvent()
  worker.use(
    http.delete(MOCK_HTTP.EVENT_PATH, () =>
      HttpResponse.json(
        { message: MOCK_MESSAGES.SERVER_ERROR },
        { status: HTTP.SERVER_ERROR_STATUS },
      ),
    ),
  )

  const screen = await renderModal(row)

  await confirmButton(screen).click()

  await expect
    .element(screen.getByRole('alert'), WAIT)
    .toHaveTextContent(HTTP_MESSAGES.API_ERROR(HTTP.SERVER_ERROR_STATUS))
  await expect.element(screen.getByRole('dialog'), WAIT).toBeVisible()
  expect(db.get(row.id)).toBeDefined()
})
