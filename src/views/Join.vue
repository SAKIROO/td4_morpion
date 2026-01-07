<script>
import api from '@/api'
import ErrorsDisplay from '@/components/ErrorsDisplay.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { LogIn } from 'lucide-vue-next'

export default {
  name: 'JoinView',
  components: {
    ErrorsDisplay,
    BaseCard,
    BaseInput,
    BaseButton,
    LogIn,
  },
  data() {
    return {
      code: '',
      errors: [],
      isJoining: false,
    }
  },
  computed: {
    isCodeValid() {
      return /^[A-Z0-9]{6}$/.test(this.code)
    },
  },
  watch: {
    code(value) {
      if (!value) return
      const normalized = value.toUpperCase().replace(/\s+/g, '')
      if (normalized !== value) this.code = normalized
    },
  },
  methods: {
    async joinGame() {
      if (!this.isCodeValid || this.isJoining) return
      this.errors = []
      this.isJoining = true
      try {
        const { data } = await api.patch(`/api/games/${this.code}/join`)
        this.$router.push({ name: 'game', params: { id: data.id } })
      } catch (err) {
        const apiErrors = err?.response?.data?.errors
        this.errors = Array.isArray(apiErrors)
          ? apiErrors
          : ['Impossible de rejoindre la partie.']
      } finally {
        this.isJoining = false
      }
    },
  },
}
</script>

<template>
  <main class="page join">
    <BaseCard class="card fade-in">
      <div class="card-header">
        <div class="avatar">
          <LogIn class="icon" aria-hidden="true" />
        </div>
        <div>
          <p class="eyebrow">Rejoindre</p>
          <h1 class="title-xl">Rejoindre une partie</h1>
          <p class="subtitle">Entre le code partagé par ton adversaire.</p>
        </div>
      </div>

      <form class="form" @submit.prevent="joinGame">
        <BaseInput
          v-model.trim="code"
          label="Code"
          placeholder="Ex : V9M53Z"
          autocapitalize="characters"
          maxlength="6"
          hint="Ex : N7UJBE"
          class="code-input"
        />
        <BaseButton
          type="submit"
          variant="primary"
          :loading="isJoining"
          :disabled="isJoining || !isCodeValid"
        >
          <LogIn class="icon" aria-hidden="true" />
          Rejoindre
        </BaseButton>
      </form>

      <ErrorsDisplay :errors="errors" />
    </BaseCard>
  </main>
</template>

<style scoped>
.join {
  display: grid;
}

.card-header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(120deg, rgba(124, 92, 255, 0.25), rgba(72, 209, 255, 0.25));
  display: grid;
  place-items: center;
  font-weight: 700;
  color: var(--text);
  border: 1px solid var(--border-subtle);
}

.form {
  display: grid;
  gap: 14px;
}

.code-input :deep(input) {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  text-align: center;
  font-family: var(--font-mono);
}

.icon {
  width: 18px;
  height: 18px;
}
</style>
