export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
} as const

export const VIRTUALIZATION = {
  THRESHOLD: 50,
  ROW_HEIGHT_PX: 96,
  OVERSCAN: 8,
  VIEWPORT_MAX_HEIGHT_VH: 70,
} as const

export const SORT = { DEFAULT_FIELD: 'startAt', DEFAULT_ORDER: 'desc' } as const
