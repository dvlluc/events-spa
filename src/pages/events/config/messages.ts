export const LIST_MESSAGES = {
  CREATE: 'Создать',
  EDIT: 'Редактировать',
  DELETE: 'Удалить',
} as const

export const PAGER_MESSAGES = {
  PREV: 'Назад',
  NEXT: 'Вперёд',
  PAGE: (page: number) => `Страница ${page}`,
  PAGE_SIZE_LABEL: 'Элементов на странице',
} as const
