import { EVENT_QUERY_KEY } from '../config/constants'
import type { EventListParams } from '../model/types'

const all = [EVENT_QUERY_KEY.ROOT] as const

const lists = [...all, EVENT_QUERY_KEY.LIST] as const

export const eventKeys = {
  all,
  lists: () => lists,
  list: (params: EventListParams) => [...lists, params] as const,
  detail: (id: string) => [...all, EVENT_QUERY_KEY.DETAIL, id] as const,
}
