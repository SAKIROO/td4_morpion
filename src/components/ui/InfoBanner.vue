<script setup>
import { Info } from 'lucide-vue-next'
</script>

<template>
  <div class="info-banner">
    <Info class="icon" aria-hidden="true" />
    <div class="text">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.info-banner {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: start;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px dashed var(--border-subtle);
  background: rgba(255, 255, 255, 0.05);
  color: var(--muted);
  font-size: 14px;
}

.icon {
  width: 18px;
  height: 18px;
  color: var(--accent-cyan);
}
</style>
