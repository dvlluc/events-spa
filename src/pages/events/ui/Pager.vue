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
  <nav class="pager" :aria-label="PAGER_MESSAGES.NAV_LABEL">
    <BaseButton :disabled="isFirstPage" :aria-label="PAGER_MESSAGES.PREV" @click="emit('prev')">
      ←
    </BaseButton>
    <template v-for="slot in pageSlots" :key="String(slot)">
      <span v-if="slot === 'gap'" class="pager-gap" aria-hidden="true">…</span>
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
    <label class="pager-size">
      <span class="pager-label">{{ PAGER_MESSAGES.PAGE_SIZE_LABEL }}</span>
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
  .pager {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-2);
  }

  .pager-size {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: 0;
    font-weight: 500;
  }

  .pager-gap {
    padding-inline: var(--space-1);
    color: var(--muted);
  }

  @media (width <= 40rem) {
    .pager {
      width: 100%;
      justify-content: center;
      gap: var(--space-1);
    }

    .pager-size {
      gap: var(--space-1);
    }

    .pager-label {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .pager button {
      padding: var(--space-1) var(--space-2);
    }
  }
}
</style>
