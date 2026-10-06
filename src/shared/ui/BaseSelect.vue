<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <span class="select-wrap inline-block">
    <select v-bind="$attrs">
      <slot />
    </select>
  </span>
</template>

<style scoped>
@layer components {
  .select-wrap {
    position: relative;
  }

  .select-wrap::after {
    content: '';
    position: absolute;
    top: 50%;
    right: var(--space-3);
    border-style: solid;
    border-width: 4px 4px 0;
    border-color: var(--muted) transparent transparent;
    pointer-events: none;
    transform: translateY(-50%);
  }

  .select-wrap select {
    appearance: none;
    width: 100%;
    padding: var(--space-2) var(--space-3);
    padding-right: var(--space-6);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background-color: var(--surface);
    color: var(--text);
    font: inherit;
    cursor: pointer;
  }

  .select-wrap select:hover,
  .select-wrap select:focus {
    border-color: var(--primary);
  }

  .select-wrap select:focus {
    outline: 2px solid var(--primary);
    outline-offset: 1px;
  }
}
</style>
