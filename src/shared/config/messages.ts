export const ENV_MESSAGES = {
  INVALID: 'Приложение не запущено: некорректное окружение.',
  API_BASE_URL_INVALID:
    'VITE_API_BASE_URL обязателен и должен быть http(s)-URL вида https://host/api/v1.',
  HINT: 'Скопируйте .env.example в .env, заполните VITE_API_BASE_URL и перезапустите dev-сервер.',
} as const

export const APP_MESSAGES = {
  TITLE: 'События',
} as const

export const HTTP_MESSAGES = {
  API_ERROR: (status: number) => `Сервер ответил ошибкой ${status}.`,
  NETWORK: 'Не удалось связаться с сервером: проблема с сетью.',
  TIMEOUT: 'Сервер не ответил за отведённое время.',
  CONTRACT: 'Сервер вернул данные неожиданного формата.',
} as const

export const STATE_MESSAGES = {
  LOADING: 'Загрузка…',
  EMPTY: 'Ничего не найдено.',
  ERROR: 'Не удалось загрузить данные.',
} as const

export const UI_MESSAGES = {
  CLOSE: 'Закрыть',
  RETRY: 'Повторить',
} as const
