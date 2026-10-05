import { defineStore } from 'pinia'
import { ref } from 'vue'

import { PAGINATION } from '../config/constants'

type PageSize = (typeof PAGINATION.PAGE_SIZE_OPTIONS)[number]

function isPageSize(value: number): value is PageSize {
  return (PAGINATION.PAGE_SIZE_OPTIONS as readonly number[]).includes(value)
}

function normalizePage(value: number): number {
  return Number.isInteger(value) && value >= PAGINATION.DEFAULT_PAGE
    ? value
    : PAGINATION.DEFAULT_PAGE
}

export const useListStore = defineStore('events-list', () => {
  const page = ref<number>(PAGINATION.DEFAULT_PAGE)
  const pageSize = ref<number>(PAGINATION.DEFAULT_PAGE_SIZE)

  function setPage(value: number): void {
    page.value = normalizePage(value)
  }

  function setPageSize(value: number): void {
    if (!isPageSize(value)) return
    pageSize.value = value
    page.value = PAGINATION.DEFAULT_PAGE
  }

  return { page, pageSize, setPage, setPageSize }
})
