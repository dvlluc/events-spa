<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, type VNode } from 'vue'

import { UI_MESSAGES } from '@/shared/config'

const props = defineProps<{
  title: string
  busy?: boolean | undefined
  size?: 'wide' | undefined
}>()

const emit = defineEmits<{ close: [] }>()

const ESCAPE_KEY = 'Escape'

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

function onKeydown(event: KeyboardEvent): void {
  if (event.key === ESCAPE_KEY && props.busy) event.preventDefault()
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
  <dialog
    ref="dialog"
    :data-size="size"
    :aria-labelledby="titleId"
    @keydown="onKeydown"
    @cancel="onCancel"
  >
    <div class="flex items-start justify-between gap-4">
      <h2 class="text-xl font-semibold" :id="titleId">{{ title }}</h2>
      <button type="button" :aria-label="UI_MESSAGES.CLOSE" @click="requestClose">×</button>
    </div>
    <div class="mt-4"><slot name="body" /></div>
    <div v-if="$slots.footer" class="mt-6 flex justify-end gap-2">
      <slot name="footer" />
    </div>
  </dialog>
</template>
