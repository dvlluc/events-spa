import path from 'node:path'

import type { Rolldown } from 'vite'

import {
  OUTPUT_DIR_CSS,
  OUTPUT_DIR_JS,
  OUTPUT_DIR_STATIC,
  OUTPUT_DIR_VENDOR,
  VENDOR_CHUNK_PREFIX,
} from './constants.ts'

const NAME = '[name]'
const HASH = '[hash]'
const EXT = '[extname]'
const JS_EXT = '.js'
const CSS_EXT = '.css'

/**
 * Точка входа — assets/js/, асинхронные чанки приложения — тоже assets/js/
 * (о назначении говорит имя: `index` — entry, остальные — lazy-модули).
 * Vendor-чанки по префиксу имени уходят в assets/vendor/ без повтора префикса.
 */
const entryFileNames = `${OUTPUT_DIR_JS}/${NAME}-${HASH}${JS_EXT}`

const chunkFileNames = ({ name }: Rolldown.PreRenderedChunk): string => {
  if (!name.startsWith(VENDOR_CHUNK_PREFIX)) return `${OUTPUT_DIR_JS}/${name}-${HASH}${JS_EXT}`

  const vendorName = name.slice(VENDOR_CHUNK_PREFIX.length)
  return `${OUTPUT_DIR_VENDOR}/${vendorName}-${HASH}${JS_EXT}`
}

/** Стили — assets/css/, остальные ассеты (картинки, шрифты) — assets/static/. */
const assetFileNames = ({ names }: Rolldown.PreRenderedAsset): string => {
  const isStyle = path.extname(names[0] ?? '').toLowerCase() === CSS_EXT
  return `${isStyle ? OUTPUT_DIR_CSS : OUTPUT_DIR_STATIC}/${NAME}-${HASH}${EXT}`
}

export const output = {
  entryFileNames,
  chunkFileNames,
  assetFileNames,
} satisfies Rolldown.OutputOptions
