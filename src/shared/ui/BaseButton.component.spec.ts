import { expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'

import BaseButton from './BaseButton.vue'

test('по умолчанию type=button, data-variant не проставляется, клик отдаёт событие', async () => {
  const onClick = vi.fn<() => void>()
  const screen = await render(BaseButton, {
    props: { onClick },
    slots: { default: 'Сохранить' },
  })

  const button = screen.getByRole('button', { name: 'Сохранить' })
  await expect.element(button).toHaveAttribute('type', 'button')
  await expect.element(button).not.toHaveAttribute('data-variant')

  await userEvent.click(button)

  expect(onClick).toHaveBeenCalledTimes(1)
})

test('variant проставляет data-variant, disabled блокирует кнопку', async () => {
  const screen = await render(BaseButton, {
    props: { variant: 'primary', disabled: true },
    slots: { default: 'Создать' },
  })

  const button = screen.getByRole('button', { name: 'Создать' })
  await expect.element(button).toHaveAttribute('data-variant', 'primary')
  await expect.element(button).toBeDisabled()
  expect(screen.container.querySelector('.loader')).toBeNull()
})

test('loading блокирует кнопку, показывает лоадер и сохраняет имя кнопки', async () => {
  const screen = await render(BaseButton, {
    props: { loading: true },
    slots: { default: 'Удалить' },
  })

  const button = screen.getByRole('button', { name: 'Удалить' })
  await expect.element(button).toBeDisabled()
  expect(screen.container.querySelector('.loader')).not.toBeNull()
})
