<script setup lang="ts">
import { computed } from 'vue'

import { PAGINATION } from '../config/constants'
import { PAGER_MESSAGES } from '../config/messages'
import { buildPageWindow } from '../model/pagination'

const props = defineProps<{
  page: number
  pageSize: number
  hasNext: boolean
}>()

const emit = defineEmits<{
  prev: []
  next: []
  go: [page: number]
  'page-size': [size: number]
}>()

defineOptions({ name: 'EventsPager' })

const isFirstPage = computed(() => props.page === PAGINATION.DEFAULT_PAGE)

const pageSlots = computed(() => buildPageWindow(props.page, props.hasNext))

function onPageSizeChange(event: Event): void {
  if (event.target instanceof HTMLSelectElement) {
    emit('page-size', Number(event.target.value))
  }
}
</script>

<template>
  <nav class="flex flex-wrap items-center justify-end gap-2" :aria-label="PAGER_MESSAGES.NAV_LABEL">
    <button
      type="button"
      :disabled="isFirstPage"
      :aria-label="PAGER_MESSAGES.PREV"
      @click="emit('prev')"
    >
      ←
    </button>
    <template v-for="slot in pageSlots" :key="String(slot)">
      <span v-if="slot === 'gap'" class="pager-gap" aria-hidden="true">…</span>
      <button
        v-else
        type="button"
        :aria-label="PAGER_MESSAGES.PAGE(slot)"
        :aria-current="slot === page ? 'page' : undefined"
        @click="emit('go', slot)"
      >
        {{ slot }}
      </button>
    </template>
    <button
      type="button"
      :disabled="!hasNext"
      :aria-label="PAGER_MESSAGES.NEXT"
      @click="emit('next')"
    >
      →
    </button>
    <span class="sr-only" aria-live="polite">{{ PAGER_MESSAGES.PAGE(page) }}</span>
    <label class="mb-0 flex items-center gap-2">
      {{ PAGER_MESSAGES.PAGE_SIZE_LABEL }}
      <span class="select-wrap">
        <select class="w-auto" :value="pageSize" @change="onPageSizeChange">
          <option v-for="size in PAGINATION.PAGE_SIZE_OPTIONS" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </span>
    </label>
  </nav>
</template>
