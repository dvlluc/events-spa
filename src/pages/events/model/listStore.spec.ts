import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import { PAGINATION } from '../config/constants'
import { useListStore } from './listStore'

beforeEach(() => {
  setActivePinia(createPinia())
})

test('значения по умолчанию берутся из PAGINATION', () => {
  const store = useListStore()

  expect(store.page).toBe(PAGINATION.DEFAULT_PAGE)
  expect(store.pageSize).toBe(PAGINATION.DEFAULT_PAGE_SIZE)
})

test('setPage меняет страницу, некорректное значение сбрасывает на первую', () => {
  const store = useListStore()

  store.setPage(3)
  expect(store.page).toBe(3)

  store.setPage(PAGINATION.DEFAULT_PAGE - 1)
  expect(store.page).toBe(PAGINATION.DEFAULT_PAGE)

  store.setPage(2.5)
  expect(store.page).toBe(PAGINATION.DEFAULT_PAGE)
})

test('setPageSize меняет размер и сбрасывает страницу на первую', () => {
  const store = useListStore()
  store.setPage(5)

  store.setPageSize(PAGINATION.PAGE_SIZE_OPTIONS[3])

  expect(store.pageSize).toBe(PAGINATION.PAGE_SIZE_OPTIONS[3])
  expect(store.page).toBe(PAGINATION.DEFAULT_PAGE)
})

test('setPageSize игнорирует размер вне PAGE_SIZE_OPTIONS', () => {
  const store = useListStore()
  store.setPage(4)

  store.setPageSize(7)

  expect(store.pageSize).toBe(PAGINATION.DEFAULT_PAGE_SIZE)
  expect(store.page).toBe(4)
})
