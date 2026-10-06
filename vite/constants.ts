/** Имя переменной окружения, которую задаёт Vitest: включает тестовый режим сборки. */
export const VITEST_ENV = 'VITEST'

/** Режим production-сборки для e2e: в нём остаётся mockServiceWorker.js. */
export const E2E_MODE = 'e2e'

/** Service worker из public/, который удаляется из обычной production-сборки. */
export const SERVICE_WORKER_FILE = 'mockServiceWorker.js'

/** Директории dist/, в которые складываются файлы сборки. */
export const OUTPUT_DIR_JS = 'assets/js'
export const OUTPUT_DIR_CSS = 'assets/css'
export const OUTPUT_DIR_VENDOR = 'assets/vendor'
export const OUTPUT_DIR_STATIC = 'assets/static'

/** Префикс имени vendor-чанка: такие чанки ложатся в OUTPUT_DIR_VENDOR. */
export const VENDOR_CHUNK_PREFIX = 'vendor-'
