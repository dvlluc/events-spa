import { expect, test } from 'vitest'

import type { PageParams } from './pagination'

test('PageParams описывает номер страницы и её размер', () => {
  const params: PageParams = { page: 1, limit: 10 }

  expect(params).toEqual({ page: 1, limit: 10 })
})
