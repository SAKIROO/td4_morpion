<script setup>
const props = defineProps({
  tone: {
    type: String,
    default: 'default',
  },
})
</script>

<template>
  <span class="base-badge" :class="`tone-${tone}`">
    <slot />
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.2px;
}

.tone-live::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-cyan);
  box-shadow: 0 0 0 6px rgba(72, 209, 255, 0.2);
}

.tone-muted {
  color: var(--muted);
}
</style>
