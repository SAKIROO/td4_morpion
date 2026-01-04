<script>
import api from '@/api'
import ErrorsDisplay from '@/components/ErrorsDisplay.vue'

export default {
  name: 'JoinView',
  components: {
    ErrorsDisplay,
  },
  data() {
    return {
      code: '',
      errors: [],
      isJoining: false,
    }
  },
  methods: {
    async joinGame() {
      if (!this.code || this.isJoining) return
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
  <main class="page">
    <section class="panel card">
      <div class="card-header">
        <div class="avatar">↗</div>
        <div>
          <p class="eyebrow">Rejoindre</p>
          <h1 class="title-lg">Rejoindre une partie</h1>
          <p class="subtitle">Entre le code partagé par ton adversaire.</p>
        </div>
        <RouterLink class="btn ghost close" to="/home" aria-label="Retour à l'accueil">Retour</RouterLink>
      </div>

      <form class="form" @submit.prevent="joinGame">
        <label class="input-group">
          <span>Code</span>
          <input
            v-model.trim="code"
            type="text"
            class="input code-input"
            autocapitalize="characters"
            maxlength="6"
            placeholder="Ex: V9M53Z"
          />
          <small class="hint">Ex: N7UJBE</small>
        </label>
        <button type="submit" class="btn primary" :disabled="isJoining || !code">Rejoindre</button>
      </form>

      <ErrorsDisplay :errors="errors" />
    </section>
  </main>
</template>

<style scoped>
.card {
  max-width: 520px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.card-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(120deg, rgba(124, 92, 255, 0.35), rgba(34, 211, 238, 0.25));
  display: grid;
  place-items: center;
  font-weight: 700;
  color: var(--text);
}

.form {
  display: grid;
  gap: 14px;
}

.code-input {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  text-align: center;
  font-family: 'Space Mono', 'Inter', monospace;
}

.close {
  height: fit-content;
}
</style>
