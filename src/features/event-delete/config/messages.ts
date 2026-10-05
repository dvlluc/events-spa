export const EVENT_DELETE_MESSAGES = {
  TITLE: (title: string) => `Удалить «${title}»?`,
  PROMPT: 'Событие будет удалено без возможности восстановления.',
  CONFIRM: 'Удалить',
  CANCEL: 'Отмена',
  DELETE_ERROR: 'Не удалось удалить событие.',
} as const
