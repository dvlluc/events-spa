export const ENV_MESSAGES = {
  INVALID: 'Приложение не запущено: некорректное окружение.',
  API_BASE_URL_INVALID:
    'VITE_API_BASE_URL обязателен и должен быть http(s)-URL вида https://host/api/v1.',
  HINT: 'Скопируйте .env.example в .env, заполните VITE_API_BASE_URL и перезапустите dev-сервер.',
} as const
