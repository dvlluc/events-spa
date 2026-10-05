<script setup lang="ts">
import { computed, type StyleValue } from 'vue'

import { formatDateTime, formatDuration, type EventItem } from '@/entities/event'

import { VIRTUALIZATION } from '../config/constants'
import { LIST_MESSAGES } from '../config/messages'

const props = defineProps<{
  event: EventItem
  positionStyle?: StyleValue | undefined
}>()

const emit = defineEmits<{ edit: [event: EventItem]; delete: [event: EventItem] }>()

const rowStyle = computed<StyleValue>(() => {
  const base: StyleValue = {
    height: `${VIRTUALIZATION.ROW_HEIGHT_PX}px`,
    marginBottom: `${VIRTUALIZATION.ROW_GAP_PX}px`,
  }
  return props.positionStyle ? [base, props.positionStyle] : base
})
</script>

<template>
  <div class="event-row" role="listitem" :style="rowStyle">
    <div class="event-row-main">
      <p class="event-row-title">{{ event.title }}</p>
      <p class="event-row-description">{{ event.description }}</p>
    </div>
    <div class="event-row-meta">
      <p class="event-row-dates">
        <time :datetime="event.startAt">{{ formatDateTime(event.startAt) }}</time>
        <span aria-hidden="true"> — </span>
        <time :datetime="event.endAt">{{ formatDateTime(event.endAt) }}</time>
      </p>
      <p class="event-row-duration">{{ formatDuration(event.durationMinutes) }}</p>
      <div class="event-row-actions">
        <button type="button" @click="emit('edit', event)">{{ LIST_MESSAGES.EDIT }}</button>
        <button type="button" data-variant="danger" @click="emit('delete', event)">
          {{ LIST_MESSAGES.DELETE }}
        </button>
      </div>
    </div>
  </div>
</template>
