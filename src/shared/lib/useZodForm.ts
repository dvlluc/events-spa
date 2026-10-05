import { reactive, shallowRef, watch } from 'vue'
import { z, type ZodType } from 'zod'

export type FormErrors<Values> = {
  formErrors: string[]
  fieldErrors: { [K in keyof Values]?: string[] }
}

type FieldName<Values> = keyof Values & string

function emptyErrors<Values>(): FormErrors<Values> {
  return { formErrors: [], fieldErrors: {} }
}

export function useZodForm<Values extends object>(
  schema: ZodType<Values, Values>,
  initialValues: Values,
) {
  const defaults = { ...initialValues }
  const values = reactive({ ...defaults }) as Values
  const errors = shallowRef<FormErrors<Values>>(emptyErrors<Values>())
  const isSubmitting = shallowRef(false)

  function validate(): boolean {
    const result = schema.safeParse(values)
    if (result.success) {
      errors.value = emptyErrors<Values>()
      return true
    }
    errors.value = z.flattenError(result.error)
    return false
  }

  function validateField(name: FieldName<Values>): boolean {
    const result = schema.safeParse(values)
    const messages = result.success ? undefined : z.flattenError(result.error).fieldErrors[name]
    const fieldErrors = { ...errors.value.fieldErrors }
    delete fieldErrors[name]
    if (messages) fieldErrors[name] = messages
    errors.value = { formErrors: errors.value.formErrors, fieldErrors }
    return !messages
  }

  function reset(): void {
    for (const key of Object.keys(values)) {
      if (!(key in defaults)) Reflect.deleteProperty(values, key)
    }
    Object.assign(values, defaults)
    errors.value = emptyErrors<Values>()
    isSubmitting.value = false
  }

  watch(
    () => ({ ...values }),
    (next, previous) => {
      const changed = (Object.keys(next) as FieldName<Values>[]).filter(
        (key) => !Object.is(next[key], previous[key]),
      )
      if (changed.length === 0) return
      const fieldErrors = { ...errors.value.fieldErrors }
      let cleared = false
      for (const key of changed) {
        if (key in fieldErrors) {
          delete fieldErrors[key]
          cleared = true
        }
      }
      if (cleared) errors.value = { formErrors: errors.value.formErrors, fieldErrors }
    },
  )

  return {
    values,
    errors,
    isSubmitting,
    validate,
    validateField,
    reset,
  }
}
