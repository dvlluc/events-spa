<script setup lang="ts">
import LoadingDots from './LoadingDots.vue'

withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'danger'
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  { variant: 'default', loading: false, type: 'button', disabled: false },
)
</script>

<template>
  <button
    class="base-button relative font-medium"
    :type="type"
    :data-variant="variant === 'default' ? undefined : variant"
    :disabled="disabled || loading"
  >
    <LoadingDots v-if="loading" />
    <span class="base-button-label" :class="{ 'is-loading': loading }"><slot /></span>
  </button>
</template>

<style scoped>
@layer components {
  .base-button {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--surface);
    color: var(--text);
    font: inherit;
    cursor: pointer;
  }

  .base-button:not(:disabled):hover {
    filter: brightness(0.95);
  }

  .base-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .base-button[data-variant='primary'] {
    border-color: var(--primary);
    background-color: var(--primary);
    color: var(--primary-text);
  }

  .base-button[data-variant='danger'] {
    border-color: var(--danger);
    background-color: var(--danger);
    color: var(--danger-text);
  }

  .base-button[aria-current='page'] {
    border-color: var(--primary);
    background-color: var(--primary);
    color: var(--primary-text);
    cursor: default;
  }

  .base-button-label.is-loading {
    opacity: 0;
  }

  .base-button > .loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .base-button:deep(.loader) {
    color: currentcolor;
  }
}
</style>
