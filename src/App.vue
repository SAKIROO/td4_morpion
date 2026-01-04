<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="shell-topbar">
      <RouterLink class="brand" to="/home">
        <span class="brand-dot" />
        Morpion
      </RouterLink>
      <nav class="nav-actions">
        <RouterLink class="btn ghost" to="/profile">Profil</RouterLink>
        <RouterLink class="btn secondary" to="/home">Accueil</RouterLink>
      </nav>
    </header>

    <main class="shell-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.shell-topbar {
  max-width: 1040px;
  margin: 0 auto;
  padding: 20px 16px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-decoration: none;
  color: var(--text);
}

.brand-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(120deg, var(--primary), var(--primary2));
  box-shadow: 0 0 14px rgba(255, 124, 229, 0.6);
}

.nav-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.shell-main {
  padding-bottom: 48px;
}
@media (max-width: 640px) {
  .shell-topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .nav-actions {
    width: 100%;
    justify-content: flex-start;
    gap: 10px;
  }
}
</style>
