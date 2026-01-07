<script setup>
const props = defineProps({
  code: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <span class="code-pill">{{ code }}</span>
</template>

<style scoped>
.code-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.08);
  font-family: var(--font-mono);
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
</style>
