import { computed, watch } from 'vue'

import { useEventsListQuery, type EventListParams } from '@/entities/event'

import { PAGINATION, SORT } from '../config/constants'
import { useListStore } from './listStore'
import { shouldVirtualize } from './virtualization'

/**
 * Список текущей страницы + пробный запрос следующей (в API нет total).
 * hasNext даёт true только когда ответ следующей страницы уже получен:
 * раньше keepPreviousData показал бы старые данные и позволил уйти на пустую страницу.
 */
export function useEventsList() {
  const store = useListStore()

  const params = computed<EventListParams>(() => ({
    page: store.page,
    limit: store.pageSize,
    sortBy: SORT.DEFAULT_FIELD,
    order: SORT.DEFAULT_ORDER,
  }))

  const listQuery = useEventsListQuery(params)
  const items = computed(() => listQuery.data.value ?? [])

  const isPageFull = computed(() => items.value.length === store.pageSize)
  const nextParams = computed<EventListParams>(() => ({
    ...params.value,
    page: params.value.page + 1,
  }))
  const nextQuery = useEventsListQuery(nextParams, { enabled: isPageFull })

  const isNextKnown = computed(() => {
    if (!isPageFull.value) return true
    if (listQuery.isPlaceholderData.value || listQuery.isFetching.value) return false
    if (nextQuery.isPlaceholderData.value || nextQuery.isFetching.value) return false
    return nextQuery.data.value !== undefined
  })

  const hasNext = computed(
    () => isPageFull.value && isNextKnown.value && (nextQuery.data.value?.length ?? 0) > 0,
  )

  const isLoading = computed(() => listQuery.isLoading.value)
  const error = computed(() => listQuery.error.value)
  const page = computed(() => store.page)
  const pageSize = computed(() => store.pageSize)
  const isVirtualized = computed(() => shouldVirtualize(items.value.length))

  function retry(): void {
    void listQuery.refetch()
  }

  watch(
    () => [listQuery.data.value, listQuery.isPlaceholderData.value] as const,
    ([data, isPlaceholder]) => {
      if (data === undefined || isPlaceholder || data.length > 0) return
      if (store.page > PAGINATION.DEFAULT_PAGE) store.setPage(store.page - 1)
    },
  )

  return { items, isLoading, error, retry, page, pageSize, hasNext, isVirtualized }
}
