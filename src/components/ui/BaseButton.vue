<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  to: {
    type: [String, Object],
    default: null,
  },
  href: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: 'button',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

const isLink = computed(() => Boolean(props.to || props.href))
const isDisabled = computed(() => props.disabled || props.loading)
const componentTag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})

const handleClick = (event) => {
  if (isDisabled.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="componentTag"
    :to="to"
    :href="href"
    :type="!isLink ? type : undefined"
    class="base-button"
    :class="[
      `variant-${variant}`,
      { 'is-loading': loading },
    ]"
    :disabled="!isLink && isDisabled"
    :aria-disabled="isLink && isDisabled ? 'true' : undefined"
    :tabindex="isLink && isDisabled ? -1 : undefined"
    :aria-label="ariaLabel || undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" />
    <span class="button-content" :class="{ 'is-hidden': loading }">
      <slot />
    </span>
  </component>
</template>

<style scoped>
.base-button {
  --btn-bg: transparent;
  --btn-border: transparent;
  --btn-text: var(--text);
  --btn-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 16px;
  min-height: 40px;
  border-radius: 999px;
  border: 1px solid var(--btn-border);
  background: var(--btn-bg);
  color: var(--btn-text);
  font-weight: 600;
  letter-spacing: 0.2px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease,
    background 0.2s ease, color 0.2s ease;
  position: relative;
  isolation: isolate;
}

.base-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent-pink) 70%, transparent);
  outline-offset: 2px;
}

.base-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft);
}

.base-button:active {
  transform: translateY(0);
}

.base-button:disabled,
.base-button[aria-disabled='true'] {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.variant-primary {
  --btn-bg: linear-gradient(130deg, var(--accent-cyan), var(--accent-pink));
  --btn-border: transparent;
  --btn-text: #06080f;
  box-shadow: 0 12px 28px rgba(72, 209, 255, 0.25);
}

.variant-secondary {
  --btn-bg: rgba(255, 255, 255, 0.08);
  --btn-border: var(--border-subtle);
}

.variant-ghost {
  --btn-bg: transparent;
  --btn-border: var(--border-subtle);
}

.variant-danger {
  --btn-bg: var(--accent-red);
  --btn-text: #fff;
  --btn-border: transparent;
  box-shadow: 0 10px 22px rgba(255, 77, 109, 0.25);
}

.variant-icon {
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 12px;
  --btn-bg: rgba(255, 255, 255, 0.06);
  --btn-border: var(--border-subtle);
}

.is-loading .button-content {
  opacity: 0;
}

.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--btn-text) 40%, transparent);
  border-top-color: var(--btn-text);
  animation: spin 0.8s linear infinite;
  position: absolute;
}

.button-content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
