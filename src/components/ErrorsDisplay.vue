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
  <ul v-if="errors.length" class="errors">
    <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
  </ul>
</template>

<style scoped>
.errors {
  margin-top: 16px;
  padding-left: 18px;
  color: #b00020;
}
</style>
