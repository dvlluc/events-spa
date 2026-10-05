import { expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'

import { STATE_MESSAGES } from '@/shared/config'
import StateMessage from './StateMessage.vue'

test('loading показывает текст состояния в роли status', async () => {
  const screen = await render(StateMessage, { props: { kind: 'loading' } })

  await expect.element(screen.getByRole('status')).toHaveTextContent(STATE_MESSAGES.LOADING)
})

test('empty показывает свой текст и допускает переопределение', async () => {
  const screen = await render(StateMessage, {
    props: { kind: 'empty', message: 'Событий нет' },
  })

  await expect.element(screen.getByRole('status')).toHaveTextContent('Событий нет')
})

test('error показывает alert и отдаёт событие retry по кнопке «Повторить»', async () => {
  const onRetry = vi.fn<() => void>()
  const screen = await render(StateMessage, { props: { kind: 'error', onRetry } })

  await expect.element(screen.getByRole('alert')).toHaveTextContent(STATE_MESSAGES.ERROR)

  await userEvent.click(screen.getByRole('button', { name: 'Повторить' }))

  expect(onRetry).toHaveBeenCalledTimes(1)
})
