<script>
import api from '@/api'
import ErrorsDisplay from '@/components/ErrorsDisplay.vue'

export default {
  name: 'HomeView',
  components: {
    ErrorsDisplay,
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
  <main class="page">
    <section class="panel hero">
      <header>
        <p class="eyebrow">Morpion en ligne</p>
        <h1 class="title-lg">Morpion</h1>
        <p class="subtitle">Joue en 1v1 en temps réel et partage le code de partie.</p>
      </header>

      <div class="actions-row">
        <button type="button" class="btn primary" :disabled="isCreating" @click="createGame">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2v4m0 12v4m10-10h-4M6 12H2m14.95-6.95l-2.83 2.83M7.88 16.12l-2.83 2.83m0-15.66l2.83 2.83m8.24 8.24l2.83 2.83"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
          Nouvelle partie
        </button>
        <RouterLink class="btn secondary" to="/join">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M5 12h14m-4-4l4 4l-4 4"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Rejoindre une partie
        </RouterLink>
        <RouterLink class="btn secondary" to="/profile">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4Zm0 2c-3.31 0-6 1.79-6 4v1h12v-1c0-2.21-2.69-4-6-4Z"
            />
          </svg>
          Mon profil
        </RouterLink>
      </div>

      <div class="tip">
        <span class="tip-icon">🎯</span>
        <span>Astuce : partage le code de partie à ton adversaire.</span>
      </div>

      <ErrorsDisplay :errors="errors" />
    </section>
  </main>
</template>

<style scoped>
.hero {
  max-width: 560px;
  margin: 0 auto;
  display: grid;
  gap: 18px;
  position: relative;
  overflow: hidden;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.12em;
  color: var(--muted);
}

.tip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px dashed var(--border);
  color: var(--muted);
  background: rgba(255, 255, 255, 0.03);
}

.tip-icon {
  font-size: 18px;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.05) 40%,
        transparent 70%
      )
      no-repeat right center,
    radial-gradient(circle at 85% 40%, rgba(255, 255, 255, 0.06), transparent 45%);
  pointer-events: none;
  opacity: 0.45;
}
</style>
