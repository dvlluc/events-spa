<template>
  <div class="flex items-center gap-2">
    <p :role="role">{{ text }}</p>
    <button v-if="kind === 'error'" type="button" @click="emit('retry')">
      {{ UI_MESSAGES.RETRY }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { STATE_MESSAGES, UI_MESSAGES } from '@/shared/config'

type StateKind = 'loading' | 'empty' | 'error'

const props = defineProps<{
  kind: StateKind
  message?: string | undefined
}>()

const emit = defineEmits<{ retry: [] }>()

const KIND_MESSAGES: Record<StateKind, string> = {
  loading: STATE_MESSAGES.LOADING,
  empty: STATE_MESSAGES.EMPTY,
  error: STATE_MESSAGES.ERROR,
}

const text = computed(() => props.message ?? KIND_MESSAGES[props.kind])
const role = computed(() => (props.kind === 'error' ? 'alert' : 'status'))
</script>
