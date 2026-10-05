<template>
  <div class="event-row flex items-center gap-4" role="listitem" :style="[rowStyle, positionStyle]">
    <div class="min-w-0 grow">
      <p class="event-row-title">{{ event.title }}</p>
      <p class="event-row-description">{{ event.description }}</p>
    </div>
    <div class="flex shrink-0 items-center gap-4">
      <p class="event-row-dates">
        <time :datetime="event.startAt">{{ formatDateTime(event.startAt) }}</time>
        <span aria-hidden="true"> — </span>
        <time :datetime="event.endAt">{{ formatDateTime(event.endAt) }}</time>
      </p>
      <p class="event-row-duration">{{ formatDuration(event.durationMinutes) }}</p>
      <div class="flex gap-2">
        <button type="button" @click="emit('edit', event)">{{ LIST_MESSAGES.EDIT }}</button>
        <button type="button" data-variant="danger" @click="emit('delete', event)">
          {{ LIST_MESSAGES.DELETE }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StyleValue } from 'vue'

import { formatDateTime, formatDuration, type EventItem } from '@/entities/event'

import { VIRTUALIZATION } from '../config/constants'
import { LIST_MESSAGES } from '../config/messages'

defineProps<{
  event: EventItem
  positionStyle?: StyleValue | undefined
}>()

const emit = defineEmits<{ edit: [event: EventItem]; delete: [event: EventItem] }>()

const rowStyle: StyleValue = {
  height: `${VIRTUALIZATION.ROW_HEIGHT_PX}px`,
  marginBottom: `${VIRTUALIZATION.ROW_GAP_PX}px`,
}
</script>
