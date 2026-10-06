<script setup lang="ts">
import FormField from './FormField.vue'

defineProps<{
  label: string
  error?: string | undefined
  modelValue: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

defineOptions({ inheritAttrs: false })

function onInput(event: Event): void {
  if (event.target instanceof HTMLTextAreaElement) {
    emit('update:modelValue', event.target.value)
  }
}
</script>

<template>
  <FormField :label="label" :error="error">
    <template #default="control">
      <textarea v-bind="{ ...control, ...$attrs }" :value="modelValue" @input="onInput"></textarea>
    </template>
  </FormField>
</template>

<style scoped>
@layer components {
  textarea {
    width: 100%;
    min-height: 6rem;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--surface);
    color: var(--text);
    font: inherit;
    resize: vertical;
  }

  textarea:focus {
    border-color: var(--primary);
    outline: 2px solid var(--primary);
    outline-offset: 1px;
  }
}
</style>
