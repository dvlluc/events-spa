export const LIST_MESSAGES = {
  CREATE: 'Создать',
  EDIT: 'Редактировать',
  DELETE: 'Удалить',
} as const

export const PAGER_MESSAGES = {
  NAV_LABEL: 'Пагинация',
  PREV: 'Предыдущая страница',
  NEXT: 'Следующая страница',
  PAGE: (page: number) => `Страница ${page}`,
  PAGE_SIZE_LABEL: 'Элементов на странице',
} as const
