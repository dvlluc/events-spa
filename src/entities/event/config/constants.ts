export const DATE_FORMAT = {
  LOCALE: 'ru-RU',
  OPTIONS: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  },
  // Длина строки "YYYY-MM-DDTHH:mm" для <input type="datetime-local">.
  DATETIME_LOCAL_LENGTH: 16,
} as const

export const TIME = {
  MINUTES_PER_HOUR: 60,
  MILLISECONDS_PER_MINUTE: 60_000,
} as const

export const DURATION_FORMAT = {
  HOUR_LABEL: 'ч',
  MINUTE_LABEL: 'мин',
} as const

export const EVENT_QUERY_KEY = {
  ROOT: 'events',
  LIST: 'list',
  DETAIL: 'detail',
} as const

export const EVENT_SCHEMA = {
  MIN_DURATION_MINUTES: 0,
} as const

export const EVENTS_PATH = '/events'
