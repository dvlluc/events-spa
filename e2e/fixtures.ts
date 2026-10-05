import { test as base, expect } from '@playwright/test'

import { E2E_SEED_SIZE } from '../mocks/constants'

type E2EOptions = {
  /** Размер in-memory базы моков (константа E2E_SEED_SIZE в mocks/constants). */
  seed: number
  /** Режим сбоя: все запросы к мок-API отвечают 500. */
  fault: boolean
  /** Инициализация страницы перед каждым тестом (auto-фикстура). */
  freshPage: void
}

/**
 * Сброс базы: in-memory база моков живёт в контексте страницы, поэтому свежая
 * загрузка пересоздаёт её заново из seed. __E2E_SEED__ и __E2E_FAULT__ задаются
 * init-скриптом — он выполняется до старта приложения на каждой навигации.
 */
export const test = base.extend<E2EOptions>({
  seed: [E2E_SEED_SIZE, { option: true }],
  fault: [false, { option: true }],

  freshPage: [
    async ({ page, seed, fault }, use) => {
      await page.addInitScript(
        (options) => {
          window.__E2E_SEED__ = options.seed
          window.__E2E_FAULT__ = options.fault
        },
        { seed, fault },
      )
      await page.goto('/')
      await use()
    },
    { auto: true },
  ],
})

export { expect }
