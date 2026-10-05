<template>
  <BaseModal :title="title" :busy="isSubmitting" size="wide" @close="emit('close')">
    <template #body>
      <div class="flex flex-col gap-3">
        <p v-if="detailError" class="field-error" role="alert">{{ detailError }}</p>
        <p v-if="submitError" class="field-error" role="alert">{{ submitError }}</p>

        <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
          <FormField :label="EVENT_FORM_LABELS.TITLE" :error="fieldError('title')">
            <template #default="control">
              <input
                v-bind="control"
                v-model="values.title"
                type="text"
                autocomplete="off"
                @blur="validateField('title')"
              />
            </template>
          </FormField>

          <FormField :label="EVENT_FORM_LABELS.DESCRIPTION" :error="fieldError('description')">
            <template #default="control">
              <textarea
                v-bind="control"
                v-model="values.description"
                @blur="validateField('description')"
              ></textarea>
            </template>
          </FormField>

          <FormField :label="EVENT_FORM_LABELS.START_AT" :error="fieldError('startAt')">
            <template #default="control">
              <input
                v-bind="control"
                v-model="values.startAt"
                type="datetime-local"
                @blur="validateField('startAt')"
              />
            </template>
          </FormField>

          <FormField :label="EVENT_FORM_LABELS.END_AT" :error="fieldError('endAt')">
            <template #default="control">
              <input
                v-bind="control"
                v-model="values.endAt"
                type="datetime-local"
                @blur="validateField('endAt')"
              />
            </template>
          </FormField>

          <FormField :label="EVENT_FORM_LABELS.DURATION">
            <template #default="control">
              <output v-bind="control" :data-hint="isDurationHint ? '' : null">{{
                durationText
              }}</output>
            </template>
          </FormField>
        </form>
      </div>
    </template>

    <template #footer>
      <button type="button" :disabled="isSubmitting" @click="onSubmit">
        {{ EVENT_FORM_ACTIONS.SAVE }}
      </button>
      <button type="button" :disabled="isSubmitting" @click="emit('close')">
        {{ EVENT_FORM_ACTIONS.CANCEL }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { formatDuration, type EventItem } from '@/entities/event'
import { BaseModal, FormField } from '@/shared/ui'

import {
  EVENT_FORM_ACTIONS,
  EVENT_FORM_FEEDBACK,
  EVENT_FORM_LABELS,
  EVENT_FORM_TITLES,
} from '../config/messages'
import { useEventForm, type EventFormMode } from '../model/useEventForm'

const props = defineProps<{
  mode: EventFormMode
  event?: EventItem | null | undefined
}>()

const emit = defineEmits<{ close: [] }>()

const {
  values,
  errors,
  isSubmitting,
  validateField,
  submitError,
  detailError,
  durationMinutes,
  submit,
} = useEventForm(props.mode, props.event)

const title = computed(() =>
  props.mode === 'create' ? EVENT_FORM_TITLES.CREATE : EVENT_FORM_TITLES.EDIT,
)

const isDurationHint = computed(() => durationMinutes.value === null)

const durationText = computed(() => {
  const minutes = durationMinutes.value
  return minutes === null ? EVENT_FORM_FEEDBACK.DURATION_HINT : formatDuration(minutes)
})

function fieldError(name: keyof typeof values): string | undefined {
  return errors.value.fieldErrors[name]?.[0]
}

async function onSubmit(): Promise<void> {
  if (await submit()) emit('close')
}
</script>
