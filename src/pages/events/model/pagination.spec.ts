import { expect, test } from 'vitest'

import { buildPageWindow } from './pagination'

test('единственная известная страница', () => {
  expect(buildPageWindow(1, false)).toEqual([1])
})

test('первая страница с известной следующей', () => {
  expect(buildPageWindow(1, true)).toEqual([1, 2])
})

test('окно помещается целиком без эллипсиса', () => {
  expect(buildPageWindow(3, true)).toEqual([1, 2, 3, 4])
})

test('эллипсис слева от окна, верх ограничен известным максимумом', () => {
  expect(buildPageWindow(10, true)).toEqual([1, 'gap', 8, 9, 10, 11])
})

test('последняя страница не выходит за известный максимум', () => {
  expect(buildPageWindow(11, false)).toEqual([1, 'gap', 9, 10, 11])
})
