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
  <div
    class="event-row grid grid-cols-[var(--event-row-columns)] items-center gap-4 p-3 text-left max-[40rem]:flex max-[40rem]:flex-wrap max-[40rem]:items-start max-[40rem]:gap-x-4 max-[40rem]:gap-y-1 max-[40rem]:px-2 max-[40rem]:py-1"
    role="listitem"
    :style="rowStyle"
    :ref="measure"
  >
    <div
      class="event-row-main min-w-0 max-[40rem]:shrink-0 max-[40rem]:grow max-[40rem]:basis-full"
    >
      <p class="event-row-title m-0 font-semibold max-[40rem]:truncate">{{ event.title }}</p>
      <p class="event-row-description m-0 line-clamp-2">{{ event.description }}</p>
    </div>
    <p
      class="event-row-dates m-0 flex flex-col items-start px-2 py-1 text-[0.8125rem] leading-[1.35] whitespace-nowrap tabular-nums max-[40rem]:px-1 max-[40rem]:py-0"
    >
      <time :datetime="event.startAt">{{ formatDateTime(event.startAt) }}</time>
      <time :datetime="event.endAt">{{ formatDateTime(event.endAt) }}</time>
    </p>
    <p
      class="event-row-duration m-0 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap tabular-nums max-[40rem]:text-[0.8125rem]"
    >
      {{ formatDuration(event.durationMinutes) }}
    </p>
    <div class="event-row-actions flex gap-2">
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
    border-bottom: 1px solid var(--border);
    content-visibility: auto;
  }

  .event-row:last-child {
    border-bottom: none;
  }

  .event-row-description {
    color: var(--muted);
  }

  .event-row-dates {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--fill-subtle);
    color: var(--text);
  }

  .event-row-duration {
    color: var(--muted);
  }

  @media (width <= 40rem) {
    .event-row-actions button {
      padding: var(--space-1) var(--space-2);
      font-size: 0.8125rem;
    }
  }
}
</style>
