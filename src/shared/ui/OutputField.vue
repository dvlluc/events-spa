<script setup lang="ts">
import FormField from './FormField.vue'

defineProps<{
  label: string
  hint?: boolean | undefined
}>()

defineOptions({ inheritAttrs: false })
</script>

<template>
  <FormField :label="label">
    <template #default="control">
      <output v-bind="{ ...control, ...$attrs }" :data-hint="hint ? '' : null"><slot /></output>
    </template>
  </FormField>
</template>

<style scoped>
@layer components {
  output {
    display: block;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--fill-subtle);
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }

  output[data-hint] {
    border-style: dashed;
    background-color: transparent;
    color: var(--muted);
    font-style: italic;
  }
}
</style>
