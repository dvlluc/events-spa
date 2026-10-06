<script setup lang="ts">
defineProps<{
  message?: string | null | undefined
}>()
</script>

<template>
  <p v-if="message" class="field-error" role="alert">{{ message }}</p>
</template>

<style scoped>
@layer components {
  .field-error {
    margin-top: var(--space-1);
    color: var(--danger);
    font-size: 0.8125rem;
  }
}
</style>
