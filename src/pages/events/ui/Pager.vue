<script setup lang="ts">
import { computed } from 'vue'

import { BaseButton, BaseSelect } from '@/shared/ui'

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
  <nav
    class="pager flex flex-wrap items-center justify-end gap-2 max-[40rem]:w-full max-[40rem]:justify-center max-[40rem]:gap-1"
    :aria-label="PAGER_MESSAGES.NAV_LABEL"
  >
    <BaseButton :disabled="isFirstPage" :aria-label="PAGER_MESSAGES.PREV" @click="emit('prev')">
      ←
    </BaseButton>
    <template v-for="slot in pageSlots" :key="String(slot)">
      <span v-if="slot === 'gap'" class="pager-gap px-1" aria-hidden="true">…</span>
      <BaseButton
        v-else
        :aria-label="PAGER_MESSAGES.PAGE(slot)"
        :aria-current="slot === page ? 'page' : undefined"
        @click="emit('go', slot)"
      >
        {{ slot }}
      </BaseButton>
    </template>
    <BaseButton :disabled="!hasNext" :aria-label="PAGER_MESSAGES.NEXT" @click="emit('next')">
      →
    </BaseButton>
    <span class="sr-only" aria-live="polite">{{ PAGER_MESSAGES.PAGE(page) }}</span>
    <label class="pager-size flex items-center gap-2 font-medium max-[40rem]:gap-1">
      <span class="pager-label max-[40rem]:sr-only">{{ PAGER_MESSAGES.PAGE_SIZE_LABEL }}</span>
      <BaseSelect class="w-auto" :value="pageSize" @change="onPageSizeChange">
        <option v-for="size in PAGINATION.PAGE_SIZE_OPTIONS" :key="size" :value="size">
          {{ size }}
        </option>
      </BaseSelect>
    </label>
  </nav>
</template>

<style scoped>
@layer components {
  .pager-gap {
    color: var(--muted);
  }

  @media (width <= 40rem) {
    .pager button {
      padding: var(--space-1) var(--space-2);
      font-size: 0.8125rem;
    }
  }
}
</style>
