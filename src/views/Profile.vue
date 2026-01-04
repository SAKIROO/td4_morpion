<script>
import api from '@/api'
import ErrorsDisplay from '@/components/ErrorsDisplay.vue'

export default {
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
  <main class="profile">
    <div class="header">
      <h1>Mon profil</h1>
      <RouterLink class="close" to="/home" aria-label="Retour à l'accueil">✕</RouterLink>
    </div>

    <form v-if="user" class="form" @submit.prevent="saveProfile">
      <label class="field">
        <span>Surnom</span>
        <input v-model="user.name" type="text" autocomplete="nickname" />
      </label>
      <label class="field">
        <span>Email</span>
        <input v-model="user.email" type="email" autocomplete="email" />
      </label>
      <button type="submit" :disabled="isSaving">Enregistrer</button>
    </form>

    <p v-else class="loading">Chargement du profil...</p>

    <ErrorsDisplay :errors="errors" />
  </main>
</template>

<style scoped>
.profile {
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

.loading {
  margin-top: 24px;
}

</style>
