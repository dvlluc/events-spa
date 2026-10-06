<script setup lang="ts">
import { APP_MESSAGES } from '@/shared/config'
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="py-3">
      <div class="mx-auto w-full max-w-7xl px-4">
        <h1 class="m-0 text-xl font-semibold">{{ APP_MESSAGES.TITLE }}</h1>
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
    border-bottom: 1px solid var(--border);
    background-color: var(--surface);
  }
}
</style>
