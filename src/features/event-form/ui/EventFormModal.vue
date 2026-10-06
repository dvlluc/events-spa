<script setup lang="ts">
import { computed } from 'vue'

import { formatDuration, type EventItem } from '@/entities/event'
import {
  BaseButton,
  BaseModal,
  FormError,
  OutputField,
  TextField,
  TextareaField,
} from '@/shared/ui'

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

<template>
  <BaseModal :title="title" :busy="isSubmitting" size="wide" @close="emit('close')">
    <template #body>
      <div class="flex flex-col gap-3">
        <FormError :message="detailError" />
        <FormError :message="submitError" />

        <form class="flex flex-col gap-3" @submit.prevent="onSubmit">
          <TextField
            v-model="values.title"
            :label="EVENT_FORM_LABELS.TITLE"
            :error="fieldError('title')"
            autocomplete="off"
            @blur="validateField('title')"
          />

          <TextareaField
            v-model="values.description"
            :label="EVENT_FORM_LABELS.DESCRIPTION"
            :error="fieldError('description')"
            @blur="validateField('description')"
          />

          <TextField
            v-model="values.startAt"
            :label="EVENT_FORM_LABELS.START_AT"
            :error="fieldError('startAt')"
            type="datetime-local"
            @blur="validateField('startAt')"
          />

          <TextField
            v-model="values.endAt"
            :label="EVENT_FORM_LABELS.END_AT"
            :error="fieldError('endAt')"
            type="datetime-local"
            @blur="validateField('endAt')"
          />

          <OutputField :label="EVENT_FORM_LABELS.DURATION" :hint="isDurationHint">{{
            durationText
          }}</OutputField>
        </form>
      </div>
    </template>

    <template #footer>
      <BaseButton :loading="isSubmitting" @click="onSubmit">
        {{ EVENT_FORM_ACTIONS.SAVE }}
      </BaseButton>
      <BaseButton :disabled="isSubmitting" @click="emit('close')">
        {{ EVENT_FORM_ACTIONS.CANCEL }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
