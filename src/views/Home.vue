<script>
import api from '@/api'
import ErrorsDisplay from '@/components/ErrorsDisplay.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import InfoBanner from '@/components/ui/InfoBanner.vue'
import { LogIn, Plus } from 'lucide-vue-next'

export default {
  name: 'HomeView',
  components: {
    ErrorsDisplay,
    BaseCard,
    BaseButton,
    InfoBanner,
    LogIn,
    Plus,
  },
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
  <main class="page home">
    <BaseCard class="hero fade-in">
      <header class="page-header">
        <p class="eyebrow">Morpion en ligne</p>
        <h1 class="title-xl">Morpion</h1>
        <p class="subtitle">Joue en 1v1 en temps réel et partage le code de partie.</p>
      </header>

      <div class="actions">
        <BaseButton
          variant="primary"
          :loading="isCreating"
          :disabled="isCreating"
          @click="createGame"
        >
          <Plus class="icon" aria-hidden="true" />
          Nouvelle partie
        </BaseButton>
        <BaseButton variant="secondary" to="/join">
          <LogIn class="icon" aria-hidden="true" />
          Rejoindre une partie
        </BaseButton>
      </div>

      <InfoBanner>Astuce : partage le code de partie à ton adversaire.</InfoBanner>

      <ErrorsDisplay :errors="errors" />
    </BaseCard>
  </main>
</template>

<style scoped>
.home {
  display: grid;
}

.hero {
  max-width: 620px;
  margin: 0 auto;
  display: grid;
  gap: 20px;
}

.actions {
  display: grid;
  gap: 12px;
}

@media (min-width: 720px) {
  .actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.icon {
  width: 18px;
  height: 18px;
}
</style>
