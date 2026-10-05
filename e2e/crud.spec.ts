import { expect, test } from './fixtures'

const SMALL_SEED = 5

const CREATED_TITLE = 'E2E новое событие'
const EDITED_TITLE = 'Обновлённое E2E событие'
const START_AT = '2026-06-01T10:00'
const END_AT = '2026-06-01T12:00'
const EARLIER_END_AT = '2026-06-01T09:00'

const TITLE_MIN_ERROR = 'Название: минимум 3 символов.'
const START_REQUIRED_ERROR = 'Укажите дату и время начала.'
const END_REQUIRED_ERROR = 'Укажите дату и время окончания.'
const RANGE_ERROR = 'Окончание должно быть позже начала.'
const DELETE_PROMPT = 'Событие будет удалено без возможности восстановления.'

test.use({ seed: SMALL_SEED })

test('создание: ошибки валидации, затем успех и событие в списке', async ({ page }) => {
  const rows = page.getByRole('listitem')
  await expect(rows).toHaveCount(SMALL_SEED)

  await page.getByRole('button', { name: 'Создать' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  await dialog.getByRole('button', { name: 'Сохранить' }).click()
  await expect(dialog.getByText(TITLE_MIN_ERROR)).toBeVisible()

  await dialog.getByLabel('Название').fill(CREATED_TITLE)
  await dialog.getByRole('button', { name: 'Сохранить' }).click()
  await expect(dialog.getByText(START_REQUIRED_ERROR)).toBeVisible()
  await expect(dialog.getByText(END_REQUIRED_ERROR)).toBeVisible()

  await dialog.getByLabel('Начало').fill(START_AT)
  await dialog.getByLabel('Окончание').fill(EARLIER_END_AT)
  await dialog.getByRole('button', { name: 'Сохранить' }).click()
  await expect(dialog.getByText(RANGE_ERROR)).toBeVisible()

  await dialog.getByLabel('Окончание').fill(END_AT)
  await dialog.getByRole('button', { name: 'Сохранить' }).click()

  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(rows).toHaveCount(SMALL_SEED + 1)
  await expect(rows.filter({ hasText: CREATED_TITLE })).toHaveCount(1)
})

test('редактирование: изменённое название видно в списке', async ({ page }) => {
  const rows = page.getByRole('listitem')
  await expect(rows).toHaveCount(SMALL_SEED)

  await rows.first().getByRole('button', { name: 'Редактировать' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel('Название')).toHaveValue(/\S/)

  await dialog.getByLabel('Название').fill(EDITED_TITLE)
  await dialog.getByRole('button', { name: 'Сохранить' }).click()

  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(rows.first()).toContainText(EDITED_TITLE)
})

test('удаление: отмена сохраняет событие, подтверждение удаляет', async ({ page }) => {
  const rows = page.getByRole('listitem')
  await expect(rows).toHaveCount(SMALL_SEED)

  await rows.first().getByRole('button', { name: 'Удалить' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText(DELETE_PROMPT)

  await dialog.getByRole('button', { name: 'Отмена' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(rows).toHaveCount(SMALL_SEED)

  await rows.first().getByRole('button', { name: 'Удалить' }).click()
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Удалить' }).click()

  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(rows).toHaveCount(SMALL_SEED - 1)
})

test('Esc закрывает модалку', async ({ page }) => {
  await page.getByRole('button', { name: 'Создать' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.keyboard.press('Escape')

  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.getByRole('listitem')).toHaveCount(SMALL_SEED)
})
