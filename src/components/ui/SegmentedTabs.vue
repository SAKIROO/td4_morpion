<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  tabs: {
    type: Array,
    default: () => [],
  },
})

const route = useRoute()
const router = useRouter()

const normalizedTabs = computed(() =>
  props.tabs.map((tab) => ({
    ...tab,
    isActive: route.path === tab.to || route.path.startsWith(tab.to),
  })),
)

const onSelect = (tab) => {
  if (!tab || tab.isActive) return
  router.push(tab.to)
}
</script>

<template>
  <div class="segmented" role="tablist">
    <button
      v-for="tab in normalizedTabs"
      :key="tab.to"
      class="segment"
      :class="{ active: tab.isActive }"
      type="button"
      role="tab"
      :aria-selected="tab.isActive ? 'true' : 'false'"
      :aria-current="tab.isActive ? 'page' : undefined"
      @click="onSelect(tab)"
    >
      <component :is="tab.icon" class="icon" aria-hidden="true" />
      <span>{{ tab.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.segmented {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.segment {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent-pink) 70%, transparent);
  outline-offset: 2px;
}

.segment:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.08);
}

.segment.active {
  color: var(--text);
  background: linear-gradient(130deg, rgba(72, 209, 255, 0.22), rgba(255, 124, 229, 0.18));
  border-color: color-mix(in srgb, var(--accent-pink) 50%, transparent);
  box-shadow: 0 0 16px rgba(124, 92, 255, 0.25);
}

.icon {
  width: 18px;
  height: 18px;
}
</style>
