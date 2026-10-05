export const HTTP = {
  TIMEOUT_MS: 10_000,
  RETRY_COUNT: 2,
  RETRY_BASE_DELAY_MS: 500,
  SERVER_ERROR_STATUS: 500,
  NOT_FOUND_STATUS: 404,
} as const

export const QUERY = {
  STALE_TIME_MS: 30_000,
  GC_TIME_MS: 300_000,
  REFETCH_ON_WINDOW_FOCUS: false,
} as const

// Связано с _themes.scss (темы задаются там) — необходимо менять вместе.
export const THEME = { DEFAULT: 'light', ATTRIBUTE: 'data-theme' } as const
