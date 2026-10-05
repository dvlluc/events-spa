import { z } from 'zod'

import { calcDurationMinutes, localInputToIso } from '@/entities/event'

import { EVENT_VALIDATION } from '../config/constants'
import { EVENT_FORM_ERRORS } from '../config/messages'

const TitleSchema = z
  .string()
  .trim()
  .min(
    EVENT_VALIDATION.TITLE_MIN_LENGTH,
    EVENT_FORM_ERRORS.TITLE_MIN(EVENT_VALIDATION.TITLE_MIN_LENGTH),
  )
  .max(
    EVENT_VALIDATION.TITLE_MAX_LENGTH,
    EVENT_FORM_ERRORS.TITLE_MAX(EVENT_VALIDATION.TITLE_MAX_LENGTH),
  )

const DescriptionSchema = z
  .string()
  .trim()
  .max(
    EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH,
    EVENT_FORM_ERRORS.DESCRIPTION_MAX(EVENT_VALIDATION.DESCRIPTION_MAX_LENGTH),
  )

export const EventFormSchema = z
  .object({
    title: TitleSchema,
    description: DescriptionSchema,
    startAt: z.string(),
    endAt: z.string(),
  })
  .superRefine((values, ctx) => {
    const startMissing = values.startAt.trim() === ''
    const endMissing = values.endAt.trim() === ''

    if (startMissing || endMissing) {
      if (startMissing) {
        ctx.addIssue({
          code: 'custom',
          path: ['startAt'],
          message: EVENT_FORM_ERRORS.START_REQUIRED,
        })
      }
      if (endMissing) {
        ctx.addIssue({ code: 'custom', path: ['endAt'], message: EVENT_FORM_ERRORS.END_REQUIRED })
      }
      return
    }

    const start = new Date(values.startAt)
    const end = new Date(values.endAt)
    const startInvalid = Number.isNaN(start.getTime())
    const endInvalid = Number.isNaN(end.getTime())

    if (startInvalid) {
      ctx.addIssue({ code: 'custom', path: ['startAt'], message: EVENT_FORM_ERRORS.INVALID_DATE })
    }
    if (endInvalid) {
      ctx.addIssue({ code: 'custom', path: ['endAt'], message: EVENT_FORM_ERRORS.INVALID_DATE })
    }
    if (startInvalid || endInvalid) return

    const duration = calcDurationMinutes(
      localInputToIso(values.startAt),
      localInputToIso(values.endAt),
    )

    if (duration <= 0) {
      ctx.addIssue({ code: 'custom', path: ['endAt'], message: EVENT_FORM_ERRORS.RANGE })
      return
    }

    if (duration < EVENT_VALIDATION.MIN_DURATION_MINUTES) {
      ctx.addIssue({
        code: 'custom',
        path: ['endAt'],
        message: EVENT_FORM_ERRORS.MIN_DURATION(EVENT_VALIDATION.MIN_DURATION_MINUTES),
      })
    }
  })

export type EventFormValues = z.infer<typeof EventFormSchema>
