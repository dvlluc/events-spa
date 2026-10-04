interface Window {
  /**
   * Размер in-memory базы моков; задаётся e2e-фикстурой до загрузки приложения.
   */
  __E2E_SEED__?: number

  /**
   * Режим сбоя: все запросы к мок-API отвечают 500.
   */
  __E2E_FAULT__?: boolean
}
