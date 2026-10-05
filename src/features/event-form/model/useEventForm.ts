import { computed, nextTick, shallowRef, watch } from 'vue'

import {
  calcDurationMinutes,
  isoToLocalInput,
  localInputToIso,
  useEventQuery,
  type EventItem,
  type EventPayload,
} from '@/entities/event'
import { ApiError } from '@/shared/api'
import { HTTP } from '@/shared/config'
import { useZodForm } from '@/shared/lib'

import { EVENT_FORM_FEEDBACK } from '../config/messages'
import { useCreateEventMutation, useUpdateEventMutation } from './mutations'
import { EventFormSchema, type EventFormValues } from './schema'

export type EventFormMode = 'create' | 'edit'

const EMPTY_VALUES: EventFormValues = { title: '', description: '', startAt: '', endAt: '' }

function rowToValues(event: EventItem | null | undefined): EventFormValues {
  if (!event) return { ...EMPTY_VALUES }
  return {
    title: event.title,
    description: event.description,
    startAt: isoToLocalInput(event.startAt),
    endAt: isoToLocalInput(event.endAt),
  }
}

function toPayload(values: EventFormValues): EventPayload {
  const startAt = localInputToIso(values.startAt)
  const endAt = localInputToIso(values.endAt)
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    startAt,
    endAt,
    durationMinutes: calcDurationMinutes(startAt, endAt),
  }
}

export function useEventForm(mode: EventFormMode, event: EventItem | null = null) {
  const detailQuery = useEventQuery(() => event?.id ?? '', {
    enabled: mode === 'edit',
    initialData: () => event ?? undefined,
  })

  const initialValues = rowToValues(mode === 'edit' ? (detailQuery.data.value ?? event) : null)
  let snapshot: EventFormValues = { ...initialValues }

  const form = useZodForm(EventFormSchema, initialValues)
  const createMutation = useCreateEventMutation()
  const updateMutation = useUpdateEventMutation()

  const submitError = shallowRef<string | null>(null)

  const detailError = computed<string | null>(() => {
    const error = detailQuery.error.value
    if (!error) return null
    if (error instanceof ApiError && error.status === HTTP.NOT_FOUND_STATUS) {
      return EVENT_FORM_FEEDBACK.DETAIL_NOT_FOUND
    }
    return error.message
  })

  const durationMinutes = computed<number | null>(() => {
    const { startAt, endAt } = form.values
    const start = new Date(startAt)
    const end = new Date(endAt)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
    if (end.getTime() <= start.getTime()) return null
    return calcDurationMinutes(localInputToIso(startAt), localInputToIso(endAt))
  })

  function isPristine(): boolean {
    return (Object.keys(snapshot) as (keyof EventFormValues)[]).every(
      (key) => form.values[key] === snapshot[key],
    )
  }

  watch(
    () => detailQuery.data.value,
    (fresh) => {
      if (mode !== 'edit' || !fresh || !isPristine()) return
      Object.assign(form.values, rowToValues(fresh))
      snapshot = { ...form.values }
      void nextTick(() => {
        form.validate()
      })
    },
    { immediate: true },
  )

  async function submit(): Promise<boolean> {
    if (form.isSubmitting.value) return false
    submitError.value = null
    if (!form.validate()) return false

    form.isSubmitting.value = true
    try {
      const payload = toPayload(form.values)
      if (mode === 'create') {
        await createMutation.mutateAsync(payload)
      } else {
        if (!event) return false
        await updateMutation.mutateAsync({ id: event.id, payload })
      }
      return true
    } catch (error) {
      submitError.value = error instanceof Error ? error.message : EVENT_FORM_FEEDBACK.SUBMIT_ERROR
      return false
    } finally {
      form.isSubmitting.value = false
    }
  }

  return {
    values: form.values,
    errors: form.errors,
    isSubmitting: form.isSubmitting,
    validateField: form.validateField,
    submitError,
    detailError,
    durationMinutes,
    submit,
  }
}
