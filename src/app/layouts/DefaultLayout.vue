<script setup lang="ts">
import { APP_MESSAGES } from '@/shared/config'
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header>
      <div class="mx-auto w-full max-w-7xl px-4">
        <h1>{{ APP_MESSAGES.TITLE }}</h1>
      </div>
    </header>
    <main class="mx-auto w-full max-w-7xl grow px-4 py-6">
      <slot />
    </main>
  </div>
</template>

<style scoped>
@layer components {
  header {
    padding-block: var(--space-3);
    border-bottom: 1px solid var(--border);
    background-color: var(--surface);
  }

  h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
}
</style>
