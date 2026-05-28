<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import SiteHeader from './components/SiteHeader.vue';
import SiteFooter from './components/SiteFooter.vue';
import LoginModal from './components/LoginModal.vue';

const route  = useRoute();
const router = useRouter();
const auth   = useAuthStore();

// ── Mostrar Header/Footer solo fuera del dashboard ──────────────────────────
const isDashboard = computed(() => route.path.startsWith('/dashboard'));

// ── Login modal ─────────────────────────────────────────────────────────────
const showLogin = ref(false);

function checkAuthQuery() {
  if (route.query.auth === 'login') {
    showLogin.value = true;
    router.replace({ query: { ...route.query, auth: undefined } });
  }
}
watch(() => route.query.auth, (v) => {
  if (v === 'login') {
    showLogin.value = true;
    router.replace({ query: { ...route.query, auth: undefined } });
  }
});

// ── Toasts ───────────────────────────────────────────────────────────────────
const toasts = ref([]);

function handleShowToast(e) {
  const { message, type = 'info' } = e.detail || {};
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 3500);
}

const openLoginModal = () => { showLogin.value = true; };

onMounted(() => {
  checkAuthQuery();
  window.addEventListener('show-toast',       handleShowToast);
  window.addEventListener('open-login-modal', openLoginModal);
});
onUnmounted(() => {
  window.removeEventListener('show-toast',       handleShowToast);
  window.removeEventListener('open-login-modal', openLoginModal);
});
</script>

<template>
  <div class="app-wrapper">

    <!-- Header y Footer SOLO en páginas públicas, nunca en el dashboard -->
    <SiteHeader v-if="!isDashboard" @open-login="showLogin = true" />

    <main :class="isDashboard ? 'dashboard-root' : 'main-content'">
      <RouterView />
    </main>

    <SiteFooter v-if="!isDashboard" />

    <!-- Modal de login global -->
    <LoginModal v-model="showLogin" />

    <!-- Toasts globales -->
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="toast.type"
        >
          <span class="material-symbols-outlined icon">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info' }}
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            @click="toasts = toasts.filter(t => t.id !== toast.id)"
            class="toast-close-btn"
            aria-label="Cerrar"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </TransitionGroup>
    </div>

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined');

html { font-size: 18px; scroll-behavior: smooth; }
@media (max-width: 768px) { html { font-size: 16px; } }

:root {
  --primary-bg:          #e0f7fa;
  --nav-bg:              #ffffff;
  --text-blue:           #1a5b82;
  --button-purple:       #c58cf2;
  --button-purple-hover: #b373e6;
  --button-purple-soft:  rgba(197, 140, 242, 0.15);
  --page-bg:             #f0f8ff;
  --hero-bg:             #b2ebf2;
  --footer-pink:         #f8c8d8;
  --footer-purple:       #e2c2f4;
  --card-bg:             rgba(255, 255, 255, 0.85);
  --white:               #ffffff;
  --shadow-soft:         0 4px 20px rgba(26, 91, 130, 0.08);
  --shadow-mid:          0 8px 32px rgba(26, 91, 130, 0.14);
  --shadow-purple:       0 4px 20px rgba(197, 140, 242, 0.35);
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Fredoka', sans-serif;
  background-color: var(--page-bg);
  color: var(--text-blue);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

a  { text-decoration: none; color: inherit; }
ul { list-style: none; }

.container {
  max-width: 66.67rem;
  margin: 0 auto;
  padding: 0 1.55rem;
}
</style>

<style scoped>
.app-wrapper    { display: flex; flex-direction: column; min-height: 100vh; }
.main-content   { flex-grow: 1; }
/* El dashboard ocupa el 100% sin flex-grow para no heredar el flex del app-wrapper */
.dashboard-root { flex-grow: 1; display: flex; flex-direction: column; }

/* ── Toasts ── */
.toast-container {
  position: fixed; bottom: 2rem; right: 2rem; z-index: 9999;
  display: flex; flex-direction: column; gap: 0.67rem;
  max-width: 22rem; width: calc(100% - 4rem);
}
.toast-item {
  background: white; border-radius: 1rem; padding: 0.89rem 1.11rem;
  display: flex; align-items: center; gap: 0.67rem;
  box-shadow: 0 0.56rem 1.78rem rgba(26,91,130,.15);
  border-left: 0.33rem solid var(--button-purple);
}
.toast-item.success { border-left-color: #319795; }
.toast-item.success .icon { color: #319795; }
.toast-item.error   { border-left-color: #e53e3e; }
.toast-item.error   .icon { color: #e53e3e; }
.toast-item .icon   { font-size: 1.33rem; flex-shrink: 0; color: var(--button-purple); }
.toast-message      { font-family: 'Fredoka',sans-serif; font-size: .89rem; font-weight: 600; color: var(--text-blue); flex-grow: 1; line-height: 1.3; }
.toast-close-btn    { background:none;border:none;color:var(--text-blue);opacity:.5;cursor:pointer;display:flex;align-items:center;transition:opacity .2s; }
.toast-close-btn:hover { opacity:1; }
.toast-close-btn .material-symbols-outlined { font-size:1.11rem; }

.toast-enter-from  { opacity:0; transform:translateY(1.11rem); }
.toast-enter-to    { opacity:1; transform:translateY(0); }
.toast-leave-from  { opacity:1; transform:scale(1); }
.toast-leave-to    { opacity:0; transform:scale(.9); }
</style>
