<script setup lang="ts">
import { computed, type StyleValue } from 'vue'

import { formatDateTime, formatDuration, type EventItem } from '@/entities/event'
import { BaseButton } from '@/shared/ui'

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
      <p class="event-row-description line-clamp-2">{{ event.description }}</p>
    </div>
    <p class="event-row-dates">
      <time :datetime="event.startAt">{{ formatDateTime(event.startAt) }}</time>
      <time :datetime="event.endAt">{{ formatDateTime(event.endAt) }}</time>
    </p>
    <p class="event-row-duration">{{ formatDuration(event.durationMinutes) }}</p>
    <div class="event-row-actions">
      <BaseButton @click="emit('edit', event)">{{ LIST_MESSAGES.EDIT }}</BaseButton>
      <BaseButton variant="danger" @click="emit('delete', event)">
        {{ LIST_MESSAGES.DELETE }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
@layer components {
  .event-row {
    display: grid;
    grid-template-columns: var(--event-row-columns);
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3);
    border-bottom: 1px solid var(--border);
    text-align: left;
    content-visibility: auto;
  }

  .event-row-main {
    min-width: 0;
  }

  .event-row-actions {
    display: flex;
    gap: var(--space-2);
  }

  .event-row:last-child {
    border-bottom: none;
  }

  .event-row-title {
    margin: 0;
    font-weight: 600;
  }

  .event-row-description {
    margin: 0;
    color: var(--muted);
  }

  .event-row-dates {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 0;
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--fill-subtle);
    color: var(--text);
    font-size: 0.8125rem;
    line-height: 1.35;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .event-row-duration {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    color: var(--muted);
    font-variant-numeric: tabular-nums;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (width <= 40rem) {
    .event-row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: var(--space-1) var(--space-4);
      padding: var(--space-1) var(--space-2);
    }

    .event-row-main {
      flex: 1 0 100%;
    }

    .event-row-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .event-row-dates {
      padding: 0 var(--space-1);
    }

    .event-row-duration {
      font-size: 0.8125rem;
    }

    .event-row-actions button {
      padding: var(--space-1) var(--space-2);
      font-size: 0.8125rem;
    }
  }
}
</style>
