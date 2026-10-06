<script setup lang="ts">
import { LOADER } from '@/shared/config'
</script>

<template>
  <span class="loader" aria-hidden="true">
    <span v-for="dot in LOADER.DOTS" :key="dot"></span>
  </span>
</template>
