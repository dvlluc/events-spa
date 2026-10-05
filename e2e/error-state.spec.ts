import { expect, test } from './fixtures'

const DEFAULT_PAGE_SIZE = 10

test.use({ fault: true })

test('500: StateMessage c «Повторить», после сбоя список загружается', async ({ page }) => {
  const alert = page.getByRole('alert')
  await expect(alert).toHaveText('Не удалось загрузить данные.')
  await expect(page.getByRole('button', { name: 'Повторить' })).toBeVisible()

  await page.evaluate(() => {
    window.__E2E_FAULT__ = false
  })
  await page.getByRole('button', { name: 'Повторить' }).click()

  await expect(page.getByRole('listitem')).toHaveCount(DEFAULT_PAGE_SIZE)
  await expect(alert).toBeHidden()
})
