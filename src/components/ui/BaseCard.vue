<script setup>
const props = defineProps({
  dense: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <section class="base-card" :class="{ 'is-dense': dense }">
    <slot />
  </section>
</template>

<style scoped>
.base-card {
  background: var(--card-bg);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 20px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(14px);
}

.base-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(130deg, rgba(255, 255, 255, 0.08), transparent 45%);
  opacity: 0.6;
  pointer-events: none;
}

.base-card.is-dense {
  padding: 14px 16px;
}
</style>
