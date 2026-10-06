import type { Rolldown } from 'vite'

import { VENDOR_CHUNK_PREFIX } from './constants.ts'

/**
 * Vendor-чанк: имя получает префикс, по которому vite/output.ts кладёт файл
 * в OUTPUT_DIR_VENDOR. Группы проверяются по порядку, модуль попадает только в первую.
 */
const vendorGroup = (name: string, test: RegExp): Rolldown.CodeSplittingGroup => ({
  name: `${VENDOR_CHUNK_PREFIX}${name}`,
  test,
})

export const codeSplitting = {
  groups: [
    vendorGroup('vue', /node_modules[\\/](@vue[\\/]|vue[\\/]|vue-router[\\/]|pinia[\\/])/),
    vendorGroup('query', /node_modules[\\/]@tanstack[\\/](vue-query|query-core)[\\/]/),
    vendorGroup('zod', /node_modules[\\/]zod[\\/]/),
    vendorGroup('common', /node_modules[\\/]/),
  ],
} satisfies Rolldown.CodeSplittingOptions
