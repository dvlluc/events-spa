<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import type { EventItem } from '@/entities/event'
import { BaseButton, BaseModal, FormError } from '@/shared/ui'

import { EVENT_DELETE_MESSAGES } from '../config/messages'
import { useDeleteEventMutation } from '../model/mutations'

const props = defineProps<{
  event: EventItem
}>()

const emit = defineEmits<{ close: [] }>()

const { isPending, mutateAsync } = useDeleteEventMutation()
const deleteError = shallowRef<string | null>(null)

const title = computed(() => EVENT_DELETE_MESSAGES.TITLE(props.event.title))

async function onConfirm(): Promise<void> {
  if (isPending.value) return
  deleteError.value = null
  try {
    await mutateAsync(props.event.id)
    emit('close')
  } catch (error) {
    deleteError.value = error instanceof Error ? error.message : EVENT_DELETE_MESSAGES.DELETE_ERROR
  }
}
</script>

<template>
  <BaseModal :title="title" :busy="isPending" @close="emit('close')">
    <template #body>
      <div class="flex flex-col gap-3">
        <FormError :message="deleteError" />
        <p>{{ EVENT_DELETE_MESSAGES.PROMPT }}</p>
      </div>
    </template>

    <template #footer>
      <BaseButton variant="danger" :loading="isPending" @click="onConfirm">
        {{ EVENT_DELETE_MESSAGES.CONFIRM }}
      </BaseButton>
      <BaseButton :disabled="isPending" @click="emit('close')">
        {{ EVENT_DELETE_MESSAGES.CANCEL }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
