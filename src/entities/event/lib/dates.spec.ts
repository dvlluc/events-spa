import { afterAll, beforeAll, expect, test } from 'vitest'

import { formatDateTime, isoToLocalInput, localInputToIso } from './dates'

const ORIGINAL_TZ = process.env.TZ

beforeAll(() => {
  process.env.TZ = 'Europe/Berlin'
})

afterAll(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ
  else process.env.TZ = ORIGINAL_TZ
})

test('полночь: ISO UTC переводится в datetime-local локальной зоны', () => {
  expect(isoToLocalInput('2026-01-01T00:00:00.000Z')).toBe('2026-01-01T01:00')
})

test('полночь: datetime-local локальной зоны переводится в ISO UTC', () => {
  expect(localInputToIso('2026-01-01T00:00')).toBe('2025-12-31T23:00:00.000Z')
})

test('форматирование показывает локальную полуночь как 00:00', () => {
  expect(formatDateTime('2025-12-31T23:00:00.000Z')).toBe('01.01.2026, 00:00')
})

test('форматирование использует локаль и опции из DATE_FORMAT', () => {
  expect(formatDateTime('2026-03-29T01:30:00.000Z')).toBe('29.03.2026, 03:30')
})

test('DST: сдвиг локального времени меняется на час вокруг перехода', () => {
  expect(isoToLocalInput('2026-03-29T00:30:00.000Z')).toBe('2026-03-29T01:30')
  expect(isoToLocalInput('2026-03-29T03:30:00.000Z')).toBe('2026-03-29T05:30')
  expect(localInputToIso('2026-03-29T01:30')).toBe('2026-03-29T00:30:00.000Z')
  expect(localInputToIso('2026-03-29T05:30')).toBe('2026-03-29T03:30:00.000Z')
})

test('DST: несуществующее локальное время нормализуется и не бросает', () => {
  const iso = localInputToIso('2026-03-29T02:30')
  expect(iso).toBe('2026-03-29T01:30:00.000Z')
  expect(isoToLocalInput(iso)).toBe('2026-03-29T03:30')
})

test('roundtrip: ISO -> datetime-local -> ISO сохраняет момент времени', () => {
  const iso = '2026-06-15T10:45:00.000Z'
  expect(localInputToIso(isoToLocalInput(iso))).toBe(iso)
})
