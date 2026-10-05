import { PAGINATION } from '../config/constants'

export type PageSlot = number | 'gap'

export function buildPageWindow(page: number, hasNext: boolean): PageSlot[] {
  const maxPage = hasNext ? page + 1 : page
  const from = Math.max(PAGINATION.DEFAULT_PAGE, page - PAGINATION.PAGE_NEIGHBORS)
  const to = Math.min(maxPage, page + PAGINATION.PAGE_NEIGHBORS)
  const pages = new Set<number>([PAGINATION.DEFAULT_PAGE, maxPage])
  for (let value = from; value <= to; value += 1) pages.add(value)

  const slots: PageSlot[] = []
  let prev: number | undefined
  for (const value of [...pages].sort((a, b) => a - b)) {
    if (prev !== undefined && value - prev > 1) slots.push('gap')
    slots.push(value)
    prev = value
  }
  return slots
}
