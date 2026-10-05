import { expect, test } from './fixtures'

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_SAMPLE = [5, 10, 20, 50]
const VIRTUALIZED_PAGE_SIZE = 100
const CURRENT_PAGE = 'page'

test('загрузка списка: индикатор загрузки, затем строки и пагинация', async ({ page }) => {
  await expect(page.getByRole('status')).toHaveText('Загрузка…')

  const rows = page.getByRole('listitem')
  await expect(rows).toHaveCount(DEFAULT_PAGE_SIZE)

  await expect(page.getByRole('button', { name: 'Страница 1' })).toHaveAttribute(
    'aria-current',
    CURRENT_PAGE,
  )
  await expect(page.getByRole('button', { name: 'Предыдущая страница' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Следующая страница' })).toBeEnabled()
})

test('пагинация «Вперёд» и «Назад» листает список', async ({ page }) => {
  const rows = page.getByRole('listitem')
  await expect(rows).toHaveCount(DEFAULT_PAGE_SIZE)
  const firstRowText = (await rows.first().textContent()) ?? ''

  await page.getByRole('button', { name: 'Следующая страница' }).click()

  await expect(page.getByRole('button', { name: 'Страница 2' })).toHaveAttribute(
    'aria-current',
    CURRENT_PAGE,
  )
  await expect(rows.first()).not.toHaveText(firstRowText)
  await expect(page.getByRole('button', { name: 'Предыдущая страница' })).toBeEnabled()

  await page.getByRole('button', { name: 'Предыдущая страница' }).click()

  await expect(page.getByRole('button', { name: 'Страница 1' })).toHaveAttribute(
    'aria-current',
    CURRENT_PAGE,
  )
  await expect(rows.first()).toHaveText(firstRowText)
  await expect(page.getByRole('button', { name: 'Предыдущая страница' })).toBeDisabled()
})

test('размер страницы 5/10/20/50: все строки в DOM', async ({ page }) => {
  const rows = page.getByRole('listitem')
  await expect(rows).toHaveCount(DEFAULT_PAGE_SIZE)

  const sizeSelect = page.getByLabel('Элементов на странице')
  for (const size of PAGE_SIZE_SAMPLE) {
    await sizeSelect.selectOption(String(size))
    await expect(rows).toHaveCount(size)
  }
})

test('размер страницы 100: виртуализация, в DOM заметно меньше строк', async ({ page }) => {
  const rows = page.getByRole('listitem')
  await expect(rows).toHaveCount(DEFAULT_PAGE_SIZE)

  const secondPageLoaded = page.waitForResponse((response) =>
    /page=2&limit=100/.test(response.url()),
  )
  await page.getByLabel('Элементов на странице').selectOption(String(VIRTUALIZED_PAGE_SIZE))
  await secondPageLoaded

  await expect(rows.first()).toBeVisible()
  expect(await rows.count()).toBeLessThan(VIRTUALIZED_PAGE_SIZE)
})
