import { expect, test } from 'vitest'

import { EventListSchema, EventPayloadSchema, EventSchema } from './schemas'

const realEvent = {
  id: '7',
  title: 'title 7',
  description: 'description 7',
  startAt: '2027-08-10T00:03:02.325Z',
  endAt: '2026-12-01T04:37:02.002Z',
  durationMinutes: 35,
}

test('принимает запись с реального mockapi, даже если endAt раньше startAt', () => {
  expect(EventSchema.safeParse(realEvent).success).toBe(true)
})

test('принимает даты со сдвигом зоны, а не только UTC', () => {
  const result = EventSchema.safeParse({
    ...realEvent,
    startAt: '2027-08-10T03:03:02.325+03:00',
  })
  expect(result.success).toBe(true)
})

test('отклоняет отрицательные durationMinutes', () => {
  const result = EventSchema.safeParse({ ...realEvent, durationMinutes: -1 })
  expect(result.success).toBe(false)
})

test('отклоняет дробные durationMinutes', () => {
  const result = EventSchema.safeParse({ ...realEvent, durationMinutes: 35.5 })
  expect(result.success).toBe(false)
})

test('отклоняет нестроковые id и даты', () => {
  expect(EventSchema.safeParse({ ...realEvent, id: 7 }).success).toBe(false)
  expect(EventSchema.safeParse({ ...realEvent, startAt: '10.08.2027' }).success).toBe(false)
})

test('отклоняет отсутствующее поле', () => {
  const { durationMinutes: _omitted, ...withoutDuration } = realEvent
  expect(EventSchema.safeParse(withoutDuration).success).toBe(false)
})

test('EventListSchema принимает массив и пустой список', () => {
  expect(EventListSchema.safeParse([realEvent]).success).toBe(true)
  expect(EventListSchema.safeParse([]).success).toBe(true)
  expect(EventListSchema.safeParse({}).success).toBe(false)
})

test('EventPayloadSchema не содержит id', () => {
  const { id: _id, ...payload } = realEvent
  const result = EventPayloadSchema.safeParse(payload)
  expect(result.success).toBe(true)
  expect(result.data).not.toHaveProperty('id')
})
