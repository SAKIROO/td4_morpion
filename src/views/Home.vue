<script>
import api from '@/api'

export default {
  data() {
    return {
      errors: [],
      isCreating: false,
    }
  },
  methods: {
    async createGame() {
      if (this.isCreating) return
      this.errors = []
      this.isCreating = true
      try {
        const { data } = await api.post('/api/games', {})
        this.$router.push({ name: 'game', params: { id: data.id } })
      } catch (err) {
        const apiErrors = err?.response?.data?.errors
        this.errors = Array.isArray(apiErrors)
          ? apiErrors
          : ['Impossible de créer la partie.']
      } finally {
        this.isCreating = false
      }
    },
  },
}
</script>

<template>
  <main class="home">
    <h1>Morpion</h1>
    <div class="actions">
      <button type="button" class="primary" :disabled="isCreating" @click="createGame">
        Nouvelle partie
      </button>
      <RouterLink class="secondary" to="/join">Rejoindre une partie</RouterLink>
      <RouterLink class="secondary" to="/profile">Mon profil</RouterLink>
    </div>
    <ul v-if="errors.length" class="errors">
      <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
    </ul>
  </main>
</template>

<style scoped>
.home {
  max-width: 480px;
  margin: 48px auto;
  padding: 0 16px;
  text-align: center;
}

.actions {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

.primary,
.secondary {
  display: inline-block;
  padding: 12px 16px;
  border: 1px solid #222;
  border-radius: 6px;
  text-decoration: none;
  color: #111;
  background: #fff;
  cursor: pointer;
}

.primary {
  background: #111;
  color: #fff;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.errors {
  margin-top: 16px;
  padding-left: 18px;
  color: #b00020;
  text-align: left;
}
</style>
