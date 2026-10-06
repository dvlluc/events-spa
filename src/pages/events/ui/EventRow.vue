<script setup lang="ts">
import { computed, type StyleValue } from 'vue'

import { formatDateTime, formatDuration, type EventItem } from '@/entities/event'

import { VIRTUALIZATION } from '../config/constants'
import { LIST_MESSAGES } from '../config/messages'
import type { RowMeasure } from './rowMeasure'

const props = defineProps<{
  event: EventItem
  positionStyle?: StyleValue | undefined
  measure?: RowMeasure | undefined
}>()

const emit = defineEmits<{ edit: [event: EventItem]; delete: [event: EventItem] }>()

const rowStyle = computed<StyleValue>(() => {
  const base: StyleValue = {
    containIntrinsicSize: `auto ${VIRTUALIZATION.ROW_HEIGHT_PX}px`,
    ...(props.positionStyle
      ? { paddingBottom: `${VIRTUALIZATION.ROW_GAP_PX}px` }
      : { marginBottom: `${VIRTUALIZATION.ROW_GAP_PX}px` }),
  }
  return props.positionStyle ? [base, props.positionStyle] : base
})
</script>

<template>
  <div class="event-row" role="listitem" :style="rowStyle" :ref="measure">
    <div class="event-row-main">
      <p class="event-row-title">{{ event.title }}</p>
      <p class="event-row-description">{{ event.description }}</p>
    </div>
    <p class="event-row-dates">
      <time :datetime="event.startAt">{{ formatDateTime(event.startAt) }}</time>
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
</template>
