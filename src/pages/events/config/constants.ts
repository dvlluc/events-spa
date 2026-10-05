export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  PAGE_NEIGHBORS: 2,
} as const

export const VIRTUALIZATION = {
  THRESHOLD: 50,
  ROW_HEIGHT_PX: 96,
  ROW_GAP_PX: 8,
  OVERSCAN: 4,
  VIEWPORT_MAX_HEIGHT_VH: 70,
} as const

export const SORT = { DEFAULT_FIELD: 'startAt', DEFAULT_ORDER: 'asc' } as const
