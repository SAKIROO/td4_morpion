<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: '',
  },
  inputmode: {
    type: String,
    default: '',
  },
  maxlength: {
    type: [String, Number],
    default: null,
  },
  autocapitalize: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'input', 'focus', 'blur'])

const onInput = (event) => {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}
</script>

<template>
  <label class="input-field" :class="{ 'has-error': error }">
    <span v-if="label" class="label">{{ label }}</span>
    <input
      class="input"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      :autocomplete="autocomplete || undefined"
      :inputmode="inputmode || undefined"
      :maxlength="maxlength || undefined"
      :autocapitalize="autocapitalize || undefined"
      :aria-invalid="error ? 'true' : 'false'"
      @input="onInput"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />
    <span v-if="!error && hint" class="hint">{{ hint }}</span>
    <span v-if="error" class="error">{{ error }}</span>
  </label>
</template>

<style scoped>
.input-field {
  display: grid;
  gap: 6px;
}

.label {
  font-weight: 600;
  color: var(--text);
}

.input {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--accent-cyan) 60%, transparent);
  box-shadow: 0 0 0 3px rgba(72, 209, 255, 0.2);
}

.hint {
  color: var(--muted);
  font-size: 13px;
}

.error {
  color: var(--accent-red-soft);
  font-size: 13px;
}

.has-error .input {
  border-color: color-mix(in srgb, var(--accent-red) 60%, transparent);
}
</style>
