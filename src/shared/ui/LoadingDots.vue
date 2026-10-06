<script setup lang="ts">
import { LOADER } from '@/shared/config'
</script>

<template>
  <span class="loader inline-flex gap-1" aria-hidden="true">
    <span v-for="dot in LOADER.DOTS" :key="dot" class="size-2 rounded-full bg-current"></span>
  </span>
</template>

<style scoped>
@layer components {
  .loader {
    color: var(--muted);
  }
}

@keyframes loader-blink {
  50% {
    opacity: 0.25;
  }
}

@media (prefers-reduced-motion: no-preference) {
  @layer components {
    .loader span {
      animation: loader-blink var(--motion-blink) ease-in-out infinite;
    }

    .loader span:nth-child(2) {
      animation-delay: var(--motion-fast);
    }

    .loader span:nth-child(3) {
      animation-delay: calc(var(--motion-fast) * 2);
    }
  }
}
</style>
