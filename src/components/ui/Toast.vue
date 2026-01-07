<script setup>
import { computed } from 'vue'
import { Info, CheckCircle2, AlertTriangle } from 'lucide-vue-next'
import { toastState } from '@/composables/useToast'

const icon = computed(() => {
  if (toastState.variant === 'success') return CheckCircle2
  if (toastState.variant === 'error') return AlertTriangle
  return Info
})
</script>

<template>
  <Transition name="toast">
    <div v-if="toastState.visible" class="toast" :class="`variant-${toastState.variant}`">
      <component :is="icon" class="icon" aria-hidden="true" />
      <span>{{ toastState.message }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(15, 20, 35, 0.92);
  border: 1px solid var(--border-subtle);
  color: var(--text);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(12px);
  z-index: 1200;
}

.toast.variant-success {
  border-color: color-mix(in srgb, var(--accent-cyan) 50%, transparent);
}

.toast.variant-error {
  border-color: color-mix(in srgb, var(--accent-red) 50%, transparent);
}

.icon {
  width: 18px;
  height: 18px;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 640px) {
  .toast {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }
}
</style>
