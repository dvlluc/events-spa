import { expect, test } from 'vitest'

import { calcDurationMinutes, formatDuration } from './duration'

test('одинаковые даты дают 0 минут', () => {
  const iso = '2026-05-01T10:00:00.000Z'
  expect(calcDurationMinutes(iso, iso)).toBe(0)
})

test('считает длительность по разнице моментов времени', () => {
  expect(calcDurationMinutes('2026-05-01T10:00:00.000Z', '2026-05-01T12:30:00.000Z')).toBe(150)
  expect(calcDurationMinutes('2026-05-01T10:00:00.000Z', '2026-05-01T11:00:00.000Z')).toBe(60)
})

test('DST не влияет: считается по UTC, а не по настенным часам', () => {
  const start = '2026-03-29T00:30:00.000Z'
  const end = '2026-03-29T03:30:00.000Z'
  expect(calcDurationMinutes(start, end)).toBe(180)
})

test('endAt раньше startAt даёт отрицательное значение без исключения', () => {
  expect(calcDurationMinutes('2026-05-01T12:30:00.000Z', '2026-05-01T10:00:00.000Z')).toBe(-150)
})

test('formatDuration', () => {
  expect(formatDuration(0)).toBe('0 мин')
  expect(formatDuration(45)).toBe('45 мин')
  expect(formatDuration(60)).toBe('1 ч')
  expect(formatDuration(120)).toBe('2 ч')
  expect(formatDuration(150)).toBe('2 ч 30 мин')
})
