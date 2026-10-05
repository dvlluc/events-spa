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
