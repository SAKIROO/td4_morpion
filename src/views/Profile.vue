<script>
import api from '@/api'
import ErrorsDisplay from '@/components/ErrorsDisplay.vue'

export default {
  name: 'ProfileView',
  components: {
    ErrorsDisplay,
  },
  data() {
    return {
      user: null,
      errors: [],
      isSaving: false,
    }
  },
  methods: {
    async saveProfile() {
      if (!this.user || this.isSaving) return
      this.errors = []
      this.isSaving = true
      try {
        const { data } = await api.put('/api/profile', this.user)
        this.user = data
      } catch (err) {
        const apiErrors = err?.response?.data?.errors
        this.errors = Array.isArray(apiErrors)
          ? apiErrors
          : ['Une erreur est survenue.']
      } finally {
        this.isSaving = false
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    api
      .get('/api/profile')
      .then(({ data }) => {
        next((vm) => {
          vm.user = data
        })
      })
      .catch((err) => {
        const apiErrors = err?.response?.data?.errors
        next((vm) => {
          vm.errors = Array.isArray(apiErrors)
            ? apiErrors
            : ['Impossible de charger le profil.']
        })
      })
  },
}
</script>

<template>
  <main class="page">
    <section class="panel card">
      <div class="card-header">
        <div class="avatar">{{ user?.name?.[0]?.toUpperCase() || 'U' }}</div>
        <div>
          <p class="eyebrow">Profil</p>
          <h1 class="title-lg">Mon profil</h1>
          <p class="subtitle">Visible par ton adversaire pendant la partie.</p>
        </div>
        <RouterLink class="btn ghost close" to="/home" aria-label="Retour à l'accueil">Retour</RouterLink>
      </div>

      <form v-if="user" class="form" @submit.prevent="saveProfile">
        <label class="input-group">
          <span>Surnom</span>
          <input v-model="user.name" class="input" type="text" autocomplete="nickname" />
          <small class="hint">Visible par ton adversaire</small>
        </label>
        <label class="input-group">
          <span>Email</span>
          <input v-model="user.email" class="input" type="email" autocomplete="email" />
        </label>
        <button type="submit" class="btn primary" :disabled="isSaving">Enregistrer</button>
      </form>

      <p v-else class="subtitle">Chargement du profil...</p>

      <ErrorsDisplay :errors="errors" />
    </section>
  </main>
</template>

<style scoped>
.card {
  max-width: 560px;
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
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(142, 243, 255, 0.4), rgba(255, 124, 229, 0.3));
  color: var(--text);
  font-weight: 700;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
}

.form {
  display: grid;
  gap: 14px;
}

.close {
  height: fit-content;
}
</style>
