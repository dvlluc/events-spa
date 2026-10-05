<template>
  <div ref="scrollElement" class="event-list" role="list" :style="viewportStyle">
    <div aria-hidden="true" :style="spacerStyle" />
    <EventRow
      v-for="row in rows"
      :key="row.key"
      :event="row.event"
      :position-style="row.positionStyle"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, ref, type StyleValue } from 'vue'

import type { EventItem } from '@/entities/event'

import { VIRTUALIZATION } from '../config/constants'
import EventRow from './EventRow.vue'

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

type RowView = { key: number; event: EventItem; positionStyle: StyleValue }

const rows = computed<RowView[]>(() => {
  const view: RowView[] = []
  for (const item of virtualizer.value.getVirtualItems()) {
    const event = props.items[item.index]
    if (!event) continue
    view.push({
      key: item.index,
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
