<script setup lang="ts">
defineProps<{
  message?: string | null | undefined
}>()
</script>

<template>
  <p v-if="message" class="field-error mt-1 text-[0.8125rem]" role="alert">{{ message }}</p>
</template>

<style scoped>
@layer components {
  .field-error {
    color: var(--danger);
  }
}
</style>
