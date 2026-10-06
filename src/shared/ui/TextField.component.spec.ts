import { expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-vue'

import TextField from './TextField.vue'

test('label связан с полем через id, значение приходит из modelValue', async () => {
  const screen = await render(TextField, {
    props: { label: 'Название', modelValue: 'Событие' },
  })

  const input = screen.getByLabelText('Название')

  await expect.element(input).toHaveValue('Событие')
  await expect.element(input).not.toHaveAttribute('aria-invalid')
  await expect.element(input).not.toHaveAttribute('aria-describedby')
})

test('ошибка связывает поле с текстом через aria-invalid и aria-describedby', async () => {
  const screen = await render(TextField, {
    props: { label: 'Название', modelValue: '', error: 'Обязательное поле' },
  })

  const input = screen.getByLabelText('Название')

  await expect.element(input).toHaveAttribute('aria-invalid', 'true')
  await expect.element(input).toHaveAccessibleDescription('Обязательное поле')
  await expect.element(screen.getByText('Обязательное поле')).toBeVisible()
})

test('ввод обновляет modelValue', async () => {
  const onUpdate = vi.fn<(value: string) => void>()
  const screen = await render(TextField, {
    props: { label: 'Название', modelValue: '', 'onUpdate:modelValue': onUpdate },
  })

  await screen.getByLabelText('Название').fill('Новое название')

  expect(onUpdate).toHaveBeenCalledWith('Новое название')
})
