<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, type VNode } from 'vue'

import { UI_MESSAGES } from '@/shared/config'

import BaseButton from './BaseButton.vue'

const props = defineProps<{
  title: string
  busy?: boolean | undefined
  size?: 'wide' | undefined
}>()

const emit = defineEmits<{ close: [] }>()

defineSlots<{
  body(): VNode | VNode[]
  footer?(): VNode | VNode[]
}>()

const dialog = ref<HTMLDialogElement | null>(null)
const titleId = useId()

let opener: HTMLElement | null = null

onMounted(() => {
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  dialog.value?.showModal()
})

onBeforeUnmount(() => {
  const element = dialog.value
  if (element?.open) element.close()
  if (opener && document.contains(opener)) opener.focus()
})

function requestClose(): void {
  if (props.busy) return
  emit('close')
}

function onCancel(event: Event): void {
  if (props.busy) {
    event.preventDefault()
    return
  }
  emit('close')
}
</script>

<template>
  <dialog ref="dialog" :data-size="size" :aria-labelledby="titleId" @cancel="onCancel">
    <div class="flex items-start justify-between gap-4">
      <h2 class="text-xl font-semibold" :id="titleId">{{ title }}</h2>
      <BaseButton :aria-label="UI_MESSAGES.CLOSE" @click="requestClose">×</BaseButton>
    </div>
    <div class="mt-4"><slot name="body" /></div>
    <div v-if="$slots.footer" class="mt-6 flex justify-end gap-2">
      <slot name="footer" />
    </div>
  </dialog>
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
  dialog {
    --modal-width: 30rem;

    width: calc(100% - 2rem);
    max-width: var(--modal-width);
    margin: auto;
    padding: var(--space-6);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--surface);
    color: var(--text);
  }

  dialog[data-size='wide'] {
    --modal-width: 40rem;
  }

  dialog::backdrop {
    background-color: color-mix(in srgb, var(--text) 45%, transparent);
  }

  @media (prefers-reduced-motion: no-preference) {
    dialog[open],
    dialog::backdrop {
      animation: fade-in var(--motion-fast) ease-out;
    }
  }
}
</style>
