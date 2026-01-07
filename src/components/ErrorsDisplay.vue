<script>
export default {
  name: 'ErrorsDisplay',
  props: {
    errors: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

<template>
  <ul v-if="errors.length" class="errors" role="alert">
    <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
  </ul>
</template>

<style scoped>
.errors {
  margin: 16px 0 0;
  padding: 12px 14px;
  list-style: none;
  display: grid;
  gap: 6px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--accent-red) 40%, transparent);
  background: rgba(255, 77, 109, 0.08);
  color: var(--accent-red-soft);
  font-size: 14px;
}
</style>
