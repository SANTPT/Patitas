<script setup>
import { ref, watch, onMounted } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import LoginModal from './components/LoginModal.vue'

const showLogin = ref(false);
const route = useRoute();
const router = useRouter();

function checkAuthQuery() {
  if (route.query.auth === 'login') {
    showLogin.value = true;
    // Limpiar el parámetro de la URL de forma limpia
    router.replace({ query: { ...route.query, auth: undefined } });
  }
}

watch(() => route.query.auth, (newVal) => {
  if (newVal === 'login') {
    showLogin.value = true;
    router.replace({ query: { ...route.query, auth: undefined } });
  }
});

onMounted(() => {
  checkAuthQuery();
});
</script>

<template>
  <div class="app-wrapper">
    <SiteHeader @open-login="showLogin = true" />
    <main class="main-content">
      <RouterView />
    </main>
    <SiteFooter />
    <LoginModal v-model="showLogin" />
  </div>
</template>


<style>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined');

html {
  font-size: 18px;
  scroll-behavior: smooth;
}

@media (max-width: 768px) {
  html {
    font-size: 16px;
  }
}

:root {
  /* Colores originales del proyecto */
  --primary-bg: #e0f7fa;
  --nav-bg: #ffffff;
  --text-blue: #1a5b82;
  --button-purple: #c58cf2;
  --button-purple-hover: #b373e6;
  --button-purple-soft: rgba(197, 140, 242, 0.15);
  --page-bg: #f0f8ff;
  --hero-bg: #b2ebf2;
  --footer-pink: #f8c8d8;
  --footer-purple: #e2c2f4;
  --card-bg: rgba(255, 255, 255, 0.85);
  --white: #ffffff;
  --shadow-soft: 0 4px 20px rgba(26, 91, 130, 0.08);
  --shadow-mid: 0 8px 32px rgba(26, 91, 130, 0.14);
  --shadow-purple: 0 4px 20px rgba(197, 140, 242, 0.35);
}

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Fredoka', sans-serif;
  background-color: var(--page-bg);
  color: var(--text-blue);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

a { text-decoration: none; color: inherit; }
ul { list-style: none; }

.container {
  max-width: 66.67rem;
  margin: 0 auto;
  padding: 0 1.55rem;
}
</style>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content { flex-grow: 1; }
</style>
