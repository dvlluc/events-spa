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

<script setup lang="ts">
import { APP_MESSAGES } from '@/shared/config'
</script>
