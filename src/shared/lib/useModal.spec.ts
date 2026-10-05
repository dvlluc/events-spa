import { expect, test } from 'vitest'

import type { GlobalModalState } from './useModal'
import { useModal } from './useModal'

test('open() собирает state из initialState + payload и всегда ставит isOpen', () => {
  const { state, open } = useModal({ isOpen: false, event: null as string | null })

  open({ event: 'e-1' })

  expect(state).toEqual({ isOpen: true, event: 'e-1' })

  open({ isOpen: false })
  expect(state.isOpen).toBe(true)
})

test('open() сбрасывает флаги прошлого открытия', () => {
  const { state, open, close, setLoading, setSuccess, setError } = useModal<GlobalModalState>({
    isOpen: false,
  })

  open()
  setLoading(true)
  setSuccess()
  setError()
  close()
  open()

  expect(state.isLoading).toBeUndefined()
  expect(state.isSuccess).toBeUndefined()
  expect(state.isError).toBeUndefined()
  expect(state.isOpen).toBe(true)
})

test('close() закрывает модалку, не сбрасывая остальной state', () => {
  const { state, open, close } = useModal({ isOpen: false, event: null as string | null })

  open({ event: 'e-1' })
  close()

  expect(state.isOpen).toBe(false)
  expect(state.event).toBe('e-1')
})

test('setLoading/setSuccess/setError обновляют только свои флаги', () => {
  const modal = useModal<GlobalModalState>({ isOpen: false })

  modal.setLoading(true)
  expect(modal.state.isLoading).toBe(true)

  modal.setLoading(false)
  expect(modal.state.isLoading).toBe(false)

  modal.setSuccess()
  expect(modal.state.isSuccess).toBe(true)

  modal.setError()
  expect(modal.state.isError).toBe(true)
  expect(modal.state.isSuccess).toBe(true)
})

test('reset() возвращает initialState, убирая ключи из payload', () => {
  const { state, open, reset } = useModal({ isOpen: false, event: null as string | null })

  open({ event: 'e-1' })
  reset()

  expect(state).toEqual({ isOpen: false, event: null })
})

test('reset() снимает флаги, которых нет в initialState', () => {
  const { state, open, setLoading, reset } = useModal<GlobalModalState>({ isOpen: false })

  open()
  setLoading(true)
  reset()

  expect(state.isLoading).toBeUndefined()
  expect(state.isOpen).toBe(false)
})

test('инстансы независимы: глобального синглтона нет', () => {
  const first = useModal({ isOpen: false })
  const second = useModal({ isOpen: false })

  first.open()
  expect(first.state.isOpen).toBe(true)
  expect(second.state.isOpen).toBe(false)

  second.close()
  expect(second.state.isOpen).toBe(false)
  expect(first.state.isOpen).toBe(true)
})
