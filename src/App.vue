<script setup>
import { RouterView } from 'vue-router'
import AppTopBar from '@/components/layout/AppTopBar.vue'
import Toast from '@/components/ui/Toast.vue'
</script>

<template>
  <div class="app-shell">
    <AppTopBar />
    <main class="shell-main">
      <RouterView />
    </main>
    <Toast />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.shell-main {
  padding-bottom: 48px;
}
</style>
