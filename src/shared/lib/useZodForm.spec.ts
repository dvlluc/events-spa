import { expect, test } from 'vitest'
import { nextTick } from 'vue'
import { z } from 'zod/v4-mini'

import { useZodForm } from './useZodForm'

const FormSchema = z.object({
  title: z.string().check(z.minLength(3, 'Не короче 3 символов')),
  note: z.string().check(z.minLength(1, 'Заполните заметку')),
})

function createForm() {
  return useZodForm(FormSchema, { title: '', note: '' })
}

test('validate(): false на невалидных значениях, ошибки в fieldErrors', () => {
  const form = createForm()

  expect(form.validate()).toBe(false)
  expect(form.errors.value.fieldErrors.title).toEqual(['Не короче 3 символов'])
  expect(form.errors.value.fieldErrors.note).toEqual(['Заполните заметку'])
})

test('validate(): true очищает ошибки', () => {
  const form = createForm()
  form.validate()

  form.values.title = 'Событие'
  form.values.note = 'Заметка'

  expect(form.validate()).toBe(true)
  expect(form.errors.value.fieldErrors).toEqual({})
  expect(form.errors.value.formErrors).toEqual([])
})

test('validateField() добавляет ошибку только проверяемого поля', () => {
  const form = createForm()
  form.values.title = 'Ок'

  expect(form.validateField('note')).toBe(false)
  expect(form.errors.value.fieldErrors.note).toEqual(['Заполните заметку'])
  expect(form.errors.value.fieldErrors.title).toBeUndefined()
})

test('validateField() не трогает ошибки других полей', () => {
  const form = createForm()
  expect(form.validate()).toBe(false)

  form.values.note = 'Заметка'
  expect(form.validateField('note')).toBe(true)

  expect(form.errors.value.fieldErrors.note).toBeUndefined()
  expect(form.errors.value.fieldErrors.title).toEqual(['Не короче 3 символов'])
})

test('ошибка поля снимается при вводе, ошибки соседних полей остаются', async () => {
  const form = createForm()
  form.validate()
  expect(form.errors.value.fieldErrors.title).toBeDefined()

  form.values.title = 'Новая'

  await nextTick()

  expect(form.errors.value.fieldErrors.title).toBeUndefined()
  expect(form.errors.value.fieldErrors.note).toEqual(['Заполните заметку'])
})

test('reset() возвращает начальные значения, ошибки и isSubmitting', () => {
  const form = createForm()

  form.values.title = 'Что-то'
  form.validate()
  form.isSubmitting.value = true

  form.reset()

  expect(form.values).toEqual({ title: '', note: '' })
  expect(form.errors.value).toEqual({ formErrors: [], fieldErrors: {} })
  expect(form.isSubmitting.value).toBe(false)
})
