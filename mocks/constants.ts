export const MOCK_DB_DEFAULT_SIZE = 200
export const E2E_SEED_SIZE = 150
export const MOCK_LATENCY_MS = 300

export const SEED_MOCKAPI_COUNT = 50
export const SEED_MOCKAPI_PAUSE_MS = 500

export const MOCK_GENERATE = {
  DATE_FROM: '2026-01-01T00:00:00.000Z',
  DATE_TO: '2027-12-31T23:59:59.999Z',
  DURATION_MIN_MINUTES: 15,
  DURATION_MAX_MINUTES: 240,
  MILLISECONDS_PER_MINUTE: 60_000,
} as const

export const MOCK_HTTP = {
  EVENTS_PATH: '*/api/v1/events',
  EVENT_PATH: '*/api/v1/events/:id',
  PAGE_DEFAULT: 1,
  LIMIT_DEFAULT: Number.POSITIVE_INFINITY,
  SORT_BY_DEFAULT: 'id',
  ORDER_DEFAULT: 'asc',
  CREATED_STATUS: 201,
} as const

export const MOCK_MESSAGES = {
  NOT_FOUND: 'Not found',
  SERVER_ERROR: 'Internal Server Error',
} as const
