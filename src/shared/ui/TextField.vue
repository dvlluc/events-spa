<script setup lang="ts">
import FormField from './FormField.vue'

defineProps<{
  label: string
  error?: string | undefined
  modelValue: string
  type?: 'text' | 'datetime-local'
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

defineOptions({ inheritAttrs: false })

function onInput(event: Event): void {
  if (event.target instanceof HTMLInputElement) {
    emit('update:modelValue', event.target.value)
  }
}
</script>

<template>
  <FormField :label="label" :error="error">
    <template #default="control">
      <input
        v-bind="{ ...control, ...$attrs }"
        :type="type ?? 'text'"
        :value="modelValue"
        @input="onInput"
      />
    </template>
  </FormField>
</template>

<style scoped>
@layer components {
  input {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--surface);
    color: var(--text);
    font: inherit;
  }

  input:focus {
    border-color: var(--primary);
    outline: 2px solid var(--primary);
    outline-offset: 1px;
  }
}
</style>
