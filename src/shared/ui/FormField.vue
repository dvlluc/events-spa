<template>
  <div>
    <label :for="inputId">{{ label }}</label>
    <slot v-bind="control" />
    <p v-if="error" :id="errorId" class="field-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId, type VNode } from 'vue'

type FormControl = {
  id: string
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling' | undefined
  'aria-describedby'?: string | undefined
}

const props = defineProps<{
  label: string
  error?: string | undefined
}>()

defineSlots<{
  default(props: FormControl): VNode | VNode[]
}>()

const inputId = useId()
const errorId = useId()

const control = computed<FormControl>(() => {
  const attributes: FormControl = { id: inputId }
  if (props.error) {
    attributes['aria-invalid'] = 'true'
    attributes['aria-describedby'] = errorId
  }
  return attributes
})
</script>
