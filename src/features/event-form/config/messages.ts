export const EVENT_FORM_TITLES = {
  CREATE: 'Новое событие',
  EDIT: 'Редактирование события',
} as const

export const EVENT_FORM_LABELS = {
  TITLE: 'Название',
  DESCRIPTION: 'Описание',
  START_AT: 'Начало',
  END_AT: 'Окончание',
  DURATION: 'Длительность',
} as const

export const EVENT_FORM_ACTIONS = {
  SAVE: 'Сохранить',
  CANCEL: 'Отмена',
} as const

export const EVENT_FORM_ERRORS = {
  TITLE_MIN: (min: number) => `Название: минимум ${min} символов.`,
  TITLE_MAX: (max: number) => `Название: не длиннее ${max} символов.`,
  DESCRIPTION_MAX: (max: number) => `Описание: не длиннее ${max} символов.`,
  START_REQUIRED: 'Укажите дату и время начала.',
  END_REQUIRED: 'Укажите дату и время окончания.',
  INVALID_DATE: 'Некорректные дата и время.',
  RANGE: 'Окончание должно быть позже начала.',
} as const

export const EVENT_FORM_FEEDBACK = {
  DURATION_HINT: 'Заполнится автоматически после ввода корректных дат',
  SUBMIT_ERROR: 'Не удалось сохранить событие.',
  DETAIL_NOT_FOUND: 'Событие не найдено: возможно, оно уже удалено.',
} as const
