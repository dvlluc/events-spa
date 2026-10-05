import { expect, test } from 'vitest'

import { VIRTUALIZATION } from '../config/constants'
import { shouldVirtualize } from './virtualization'

test('виртуализация выключается на пороге включается выше него', () => {
  expect(shouldVirtualize(VIRTUALIZATION.THRESHOLD)).toBe(false)
  expect(shouldVirtualize(VIRTUALIZATION.THRESHOLD + 1)).toBe(true)
})

test('пустой список не виртуализируется', () => {
  expect(shouldVirtualize(0)).toBe(false)
})
