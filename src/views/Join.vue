<script>
import api from '@/api'
import ErrorsDisplay from '@/components/ErrorsDisplay.vue'

export default {
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
  <main class="join">
    <div class="header">
      <h1>Rejoindre une partie</h1>
      <RouterLink class="close" to="/home" aria-label="Retour à l'accueil">✕</RouterLink>
    </div>

    <form class="form" @submit.prevent="joinGame">
      <label class="field">
        <span>Code</span>
        <input v-model.trim="code" type="text" autocapitalize="characters" />
      </label>
      <button type="submit" :disabled="isJoining">Rejoindre</button>
    </form>

    <ErrorsDisplay :errors="errors" />
  </main>
</template>

<style scoped>
.join {
  max-width: 520px;
  margin: 48px auto;
  padding: 0 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.close {
  text-decoration: none;
  font-size: 20px;
  color: #111;
}

.form {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

.field {
  display: grid;
  gap: 6px;
}

input {
  padding: 10px 12px;
  border: 1px solid #222;
  border-radius: 6px;
}

button {
  padding: 10px 14px;
  border: 1px solid #111;
  background: #111;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>
