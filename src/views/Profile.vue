<script>
import api from '@/api'
import ErrorsDisplay from '@/components/ErrorsDisplay.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

export default {
  name: 'ProfileView',
  components: {
    ErrorsDisplay,
    BaseCard,
    BaseInput,
    BaseButton,
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
  <main class="page profile">
    <BaseCard class="profile-card fade-in">
      <div class="card-header">
        <div class="avatar">{{ user?.name?.[0]?.toUpperCase() || 'U' }}</div>
        <div>
          <p class="eyebrow">Profil</p>
          <h1 class="title-xl">Mon profil</h1>
          <p class="subtitle">Visible par ton adversaire pendant la partie.</p>
        </div>
      </div>

      <form v-if="user" class="form" @submit.prevent="saveProfile">
        <BaseInput
          v-model="user.name"
          label="Pseudo"
          type="text"
          autocomplete="nickname"
          hint="Visible par ton adversaire."
        />
        <BaseInput
          v-model="user.email"
          label="Email"
          type="email"
          autocomplete="email"
        />
        <BaseButton type="submit" variant="primary" :loading="isSaving" :disabled="isSaving">
          Enregistrer
        </BaseButton>
      </form>

      <p v-else class="subtitle">Chargement du profil...</p>

      <ErrorsDisplay :errors="errors" />
    </BaseCard>
  </main>
</template>

<style scoped>
.profile {
  display: grid;
}

.profile-card {
  max-width: 620px;
  margin: 0 auto;
  display: grid;
  gap: 18px;
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
  background: linear-gradient(135deg, rgba(106, 228, 255, 0.35), rgba(255, 122, 217, 0.35));
  color: var(--text);
  font-weight: 700;
  display: grid;
  place-items: center;
  border: 1px solid var(--border-subtle);
}

.form {
  display: grid;
  gap: 14px;
}
</style>
