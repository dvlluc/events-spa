<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, ref, type StyleValue } from 'vue'

import type { EventItem } from '@/entities/event'

import { VIRTUALIZATION } from '../config/constants'
import EventRow from './EventRow.vue'
import type { RowMeasure } from './rowMeasure'

const props = defineProps<{ items: EventItem[] }>()

const emit = defineEmits<{ edit: [event: EventItem]; delete: [event: EventItem] }>()

const scrollElement = ref<HTMLElement | null>(null)

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.items.length,
    getScrollElement: () => scrollElement.value,
    estimateSize: () => VIRTUALIZATION.ROW_HEIGHT_PX + VIRTUALIZATION.ROW_GAP_PX,
    overscan: VIRTUALIZATION.OVERSCAN,
  })),
)

const viewportStyle: StyleValue = {
  maxHeight: `${VIRTUALIZATION.VIEWPORT_MAX_HEIGHT_VH}vh`,
  overflow: 'auto',
  position: 'relative',
}

const spacerStyle = computed<StyleValue>(() => ({
  height: `${virtualizer.value.getTotalSize()}px`,
}))

type RowView = { key: string; index: number; event: EventItem; positionStyle: StyleValue }

const measureRow: RowMeasure = (element) => {
  if (element instanceof HTMLElement) {
    virtualizer.value.measureElement(element)
  } else if (element === null) {
    virtualizer.value.measureElement(null)
  }
}

const rows = computed<RowView[]>(() => {
  const view: RowView[] = []
  for (const item of virtualizer.value.getVirtualItems()) {
    const event = props.items[item.index]
    if (!event) continue
    view.push({
      key: event.id,
      index: item.index,
      event,
      positionStyle: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        transform: `translateY(${item.start}px)`,
      },
    })
  }
  return view
})
</script>

<template>
  <div ref="scrollElement" class="event-list" role="list" :style="viewportStyle">
    <div aria-hidden="true" :style="spacerStyle" />
    <EventRow
      v-for="row in rows"
      :key="row.key"
      :data-index="row.index"
      :event="row.event"
      :position-style="row.positionStyle"
      :measure="measureRow"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@layer components {
  .event-list {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--surface);
    color: var(--text);
  }

  @media (prefers-reduced-motion: no-preference) {
    .event-list {
      animation: fade-in var(--motion-fast) ease-out;
    }
  }
}
</style>
