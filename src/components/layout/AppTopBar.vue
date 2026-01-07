<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, User, ArrowLeft } from 'lucide-vue-next'
import SegmentedTabs from '@/components/ui/SegmentedTabs.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const tabs = [
  { label: 'Accueil', to: '/home', icon: Home },
  { label: 'Profil', to: '/profile', icon: User },
]

const showBack = computed(() => ['/join', '/profile'].includes(route.path))

const handleBack = () => {
  router.push('/home')
}
</script>

<template>
  <header class="topbar">
    <RouterLink class="brand" to="/home">
      <span class="brand-dot" aria-hidden="true" />
      <span>Morpion</span>
    </RouterLink>

    <div class="nav">
      <BaseButton
        v-if="showBack"
        variant="ghost"
        class="back"
        aria-label="Retour"
        @click="handleBack"
      >
        <ArrowLeft class="icon" aria-hidden="true" />
        Retour
      </BaseButton>
      <SegmentedTabs :tabs="tabs" />
    </div>
  </header>
</template>

<style scoped>
.topbar {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 16px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-decoration: none;
}

.brand-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(120deg, var(--accent-cyan), var(--accent-pink));
  box-shadow: 0 0 18px rgba(124, 92, 255, 0.6);
}

.nav {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.back :deep(.icon) {
  width: 18px;
  height: 18px;
}

@media (max-width: 720px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .nav {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
