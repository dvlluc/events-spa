<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

import type { EventItem } from '@/entities/event'

import EventRow from './EventRow.vue'

defineProps<{
  items: EventItem[]
  isVirtualized: boolean
}>()

const emit = defineEmits<{ edit: [event: EventItem]; delete: [event: EventItem] }>()

const EventsVirtualList = defineAsyncComponent(() => import('./EventsVirtualList.vue'))
</script>

<template>
  <EventsVirtualList
    v-if="isVirtualized"
    :items="items"
    @edit="emit('edit', $event)"
    @delete="emit('delete', $event)"
  />
  <div v-else class="event-list" role="list">
    <EventRow
      v-for="event in items"
      :key="event.id"
      :event="event"
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
