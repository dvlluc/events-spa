import { expect, test } from 'vitest'
import { h } from 'vue'
import { render } from 'vitest-browser-vue'

import FormField from './FormField.vue'

test('label связан с полем, без ошибки aria-атрибутов нет', async () => {
  const screen = await render(FormField, {
    props: { label: 'Название' },
    slots: { default: (control) => h('input', control) },
  })

  const input = screen.getByLabelText('Название')

  await expect.element(input).toBeVisible()
  await expect.element(input).not.toHaveAttribute('aria-invalid')
  await expect.element(input).not.toHaveAttribute('aria-describedby')
})

test('ошибка помечает поле через aria-invalid и aria-describedby', async () => {
  const screen = await render(FormField, {
    props: { label: 'Название', error: 'Обязательное поле' },
    slots: { default: (control) => h('input', control) },
  })

  const input = screen.getByLabelText('Название')

  await expect.element(input).toHaveAttribute('aria-invalid', 'true')
  await expect.element(input).toHaveAccessibleDescription('Обязательное поле')
  await expect.element(screen.getByText('Обязательное поле')).toBeVisible()
})
