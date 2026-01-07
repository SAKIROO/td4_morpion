import { reactive } from 'vue'

const toastState = reactive({
  message: '',
  variant: 'info',
  visible: false,
  timeoutId: null,
})

const show = (message, options = {}) => {
  if (!message) return
  toastState.message = message
  toastState.variant = options.variant || 'info'
  toastState.visible = true
  if (toastState.timeoutId) {
    clearTimeout(toastState.timeoutId)
  }
  const duration = options.duration ?? 2200
  toastState.timeoutId = setTimeout(() => {
    toastState.visible = false
  }, duration)
}

const hide = () => {
  toastState.visible = false
  if (toastState.timeoutId) {
    clearTimeout(toastState.timeoutId)
    toastState.timeoutId = null
  }
}

const useToast = () => ({ show, hide, toastState })

export { toastState, useToast }
