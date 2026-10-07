import { expect, test } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { render } from 'vitest-browser-vue'
import { userEvent } from 'vitest/browser'

import { SCROLL_LOCK } from '@/shared/config'

import BaseModal from './BaseModal.vue'

const Harness = defineComponent({
  props: {
    busy: { type: Boolean, default: false },
  },
  setup(props) {
    const isOpen = ref(false)

    return () =>
      h('div', [
        h(
          'button',
          {
            type: 'button',
            onClick: () => {
              isOpen.value = true
            },
          },
          'Открыть',
        ),
        isOpen.value
          ? h(
              BaseModal,
              {
                title: 'Тестовая модалка',
                busy: props.busy,
                onClose: () => {
                  isOpen.value = false
                },
              },
              {
                body: () => h('p', 'Содержимое модалки'),
                footer: () => h('button', { type: 'button' }, 'Готово'),
              },
            )
          : null,
      ])
  },
})

test('Esc закрывает модалку, диалог подписан заголовком', async () => {
  const screen = await render(Harness)

  await userEvent.click(screen.getByRole('button', { name: 'Открыть' }))
  await expect.element(screen.getByRole('dialog', { name: 'Тестовая модалка' })).toBeVisible()

  await userEvent.keyboard('{Escape}')

  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
})

test('при busy повторное Esc не закрывает модалку', async () => {
  const screen = await render(Harness, { props: { busy: true } })

  await userEvent.click(screen.getByRole('button', { name: 'Открыть' }))
  await expect.element(screen.getByRole('dialog')).toBeVisible()

  await userEvent.keyboard('{Escape}')
  await userEvent.keyboard('{Escape}')

  await expect.element(screen.getByRole('dialog')).toBeVisible()
})

test('крестик закрывает модалку', async () => {
  const screen = await render(Harness)

  await userEvent.click(screen.getByRole('button', { name: 'Открыть' }))
  await expect.element(screen.getByRole('dialog')).toBeVisible()

  await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()
})

test('крестик не закрывает модалку при busy', async () => {
  const screen = await render(Harness, { props: { busy: true } })

  await userEvent.click(screen.getByRole('button', { name: 'Открыть' }))
  await expect.element(screen.getByRole('dialog')).toBeVisible()

  await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

  await expect.element(screen.getByRole('dialog')).toBeVisible()
})

test('после закрытия фокус возвращается на вызвавший элемент', async () => {
  const screen = await render(Harness)
  const trigger = screen.getByRole('button', { name: 'Открыть' })

  await userEvent.click(trigger)
  await expect.element(screen.getByRole('dialog')).toBeVisible()

  await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()

  await expect.element(trigger).toHaveFocus()
})

test('на время открытой модалки скролл фона заблокирован', async () => {
  const screen = await render(Harness)
  const body = document.body

  expect(body.style[SCROLL_LOCK.PROPERTY]).toBe('')

  await userEvent.click(screen.getByRole('button', { name: 'Открыть' }))
  await expect.element(screen.getByRole('dialog')).toBeVisible()

  expect(body.style[SCROLL_LOCK.PROPERTY]).toBe(SCROLL_LOCK.LOCKED_VALUE)

  await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
  await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument()

  expect(body.style[SCROLL_LOCK.PROPERTY]).toBe('')
})
