<template>
  <header class="site-header" :class="{ 'is-sticky': isSticky }">
    <div class="header-content container">

      <!-- Logo -->
      <div class="logo-area">
        <div class="logo-wrap">
          <img src="../assets/logo.png" alt="Patitas Logo" class="logo" />
        </div>
      </div>

      <!-- Nav desktop -->
      <nav class="main-nav">
        <ul>
          <li v-for="item in navItems" :key="item.label">
            <a :href="item.href" :class="{ active: item.active }">{{ item.label }}</a>
          </li>
        </ul>
      </nav>

      <!-- Acciones -->
      <div class="header-actions">
        <button class="icon-btn" aria-label="Buscar">
          <span class="material-symbols-outlined">search</span>
        </button>
        <button class="icon-btn" aria-label="Carrito">
          <span class="material-symbols-outlined">shopping_cart</span>
        </button>

        <!-- Botón dinámico según estado de sesión -->
        <template v-if="authStore.isAuthenticated">
          <div class="user-pill">
            <span class="user-avatar">{{ authStore.initials }}</span>
            <span class="user-name">{{ authStore.displayName }}</span>
            <button class="logout-btn" @click="authStore.logout()" aria-label="Cerrar sesión">
              <span class="material-symbols-outlined">logout</span>
            </button>
          </div>
        </template>
        <template v-else>
          <button class="login-btn" @click="emit('open-login')" id="header-login-btn">Iniciar sesión</button>
        </template>

        <button class="hamburger" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-label="Menú">
          <span :class="{ open: menuOpen }"></span>
          <span :class="{ open: menuOpen }"></span>
          <span :class="{ open: menuOpen }"></span>
        </button>
      </div>
    </div>

    <!-- Mobile nav -->
    <nav class="mobile-nav" :class="{ open: menuOpen }">
      <ul>
        <li v-for="item in navItems" :key="item.label">
          <a :href="item.href" :class="{ active: item.active }" @click="menuOpen = false">{{ item.label }}</a>
        </li>
        <!-- Sección de Autenticación Móvil -->
        <li class="mobile-auth-item">
          <template v-if="authStore.isAuthenticated">
            <div class="mobile-user-row">
              <span class="user-avatar">{{ authStore.initials }}</span>
              <span class="user-name">{{ authStore.displayName }}</span>
              <button class="mobile-logout-btn" @click="authStore.logout(); menuOpen = false" aria-label="Cerrar sesión">
                <span class="material-symbols-outlined">logout</span>
                Cerrar Sesión
              </button>
            </div>
          </template>
          <template v-else>
            <button class="mobile-login-btn" @click="emit('open-login'); menuOpen = false">
              <span class="material-symbols-outlined">login</span>
              Iniciar sesión
            </button>
          </template>
        </li>
      </ul>
    </nav>

    <!-- Wave inferior que separa limpiamente del hero -->
    <div class="header-wave">
      <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0 0C360 50 1080 0 1440 30L1440 50L0 50Z" fill="#f0f8ff"/>
      </svg>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const emit = defineEmits(['open-login']);
const authStore = useAuthStore();
const menuOpen = ref(false);
const isSticky = ref(false);
const navItems = ref([
  { label: 'inicio',   href: '#', active: true  },
  { label: 'recursos', href: '#', active: false },
  { label: 'tienda',   href: '#', active: false },
  { label: 'nosotros', href: '#', active: false },
  { label: 'contacto', href: '#', active: false },
]);

const handleScroll = () => {
  isSticky.value = window.scrollY > 80;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* ─── HEADER ─── */
.site-header {
  background-image: url('../assets/fondo_morado.png');
  background-size: cover;
  background-position: center;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.site-header.is-sticky {
  box-shadow: 0 0.22rem 1.11rem rgba(26, 91, 130, 0.15);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.11rem;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  transition: padding 0.3s ease;
}

.site-header.is-sticky .header-content {
  padding-top: 0.4rem;
  padding-bottom: 0.4rem;
}

/* ─── LOGO ─── */
.logo-area {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
}

.logo-wrap {
  position: relative;
  width: 3.8rem;
  height: 3.8rem;
  transition: width 0.3s ease, height 0.3s ease;
}

.logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 0.18rem solid rgba(255,255,255,1);
  box-shadow: 0 0.33rem 1.11rem rgba(0,0,0,0.18);
  transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), width 0.3s ease, height 0.3s ease, border-width 0.3s ease;
  display: block;
  z-index: 10;
}
.logo:hover { transform: translate(-50%, -50%) scale(1.08) rotate(-4deg); }

.site-header.is-sticky .logo-wrap {
  width: 3.2rem;
  height: 3.2rem;
}

.site-header.is-sticky .logo {
  width: 4.3rem;
  height: 4.3rem;
  border-width: 0.14rem;
}

.brand-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--text-blue);
  letter-spacing: 0.03rem;
  text-shadow: 0.06rem 0.06rem 0 #fff, -0.06rem -0.06rem 0 #fff, 0.06rem -0.06rem 0 #fff, -0.06rem 0.06rem 0 #fff;
}

/* ─── NAV DESKTOP ─── */
.main-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.main-nav ul {
  display: flex;
  gap: 0.22rem;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(0.56rem);
  border: 0.06rem solid rgba(255,255,255,0.9);
  border-radius: 5.5rem;
  padding: 0.28rem 0.44rem;
  box-shadow: 0 0.11rem 0.67rem rgba(26,91,130,0.08);
}

.main-nav a {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-blue);
  padding: 0.33rem 1.11rem;
  border-radius: 5.5rem;
  transition: all 0.22s ease;
  display: block;
  white-space: nowrap;
}

.main-nav a:hover:not(.active) {
  background-color: var(--button-purple-soft);
  color: var(--text-blue);
}

.main-nav a.active {
  background-color: var(--button-purple);
  color: white;
  box-shadow: 0 0.11rem 0.56rem rgba(197,140,242,0.45);
}

/* ─── ACCIONES ─── */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.44rem;
  flex-shrink: 0;
}

.icon-btn {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(0.44rem);
  border: 0.06rem solid rgba(255,255,255,0.85);
  border-radius: 50%;
  width: 2.33rem;
  height: 2.33rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-blue);
  cursor: pointer;
  transition: all 0.22s ease;
}
.icon-btn:hover {
  background: white;
  box-shadow: 0 0.22rem 0.78rem rgba(26,91,130,0.12);
  transform: translateY(-0.06rem);
}
.icon-btn .material-symbols-outlined { font-size: 1.22rem; }

.login-btn {
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  background: var(--button-purple);
  color: white;
  padding: 0.5rem 1.22rem;
  border: none;
  border-radius: 5.5rem;
  cursor: pointer;
  transition: all 0.22s ease;
  box-shadow: var(--shadow-purple);
  white-space: nowrap;
}
.login-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-0.11rem);
  box-shadow: 0 0.33rem 1.33rem rgba(197,140,242,0.5);
}

/* ─── USER PILL (sesión activa) ─── */
.user-pill {
  display: flex;
  align-items: center;
  gap: 0.44rem;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(0.44rem);
  border: 0.06rem solid rgba(255,255,255,0.9);
  border-radius: 5.5rem;
  padding: 0.28rem 0.67rem 0.28rem 0.28rem;
  box-shadow: var(--shadow-soft);
  transition: all 0.22s ease;
}

.user-avatar {
  width: 1.78rem;
  height: 1.78rem;
  border-radius: 50%;
  background: var(--button-purple);
  color: white;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.03rem;
}

.user-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-blue);
  white-space: nowrap;
  max-width: 7rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-blue);
  opacity: 0.55;
  display: flex;
  align-items: center;
  padding: 0;
  transition: opacity 0.2s, color 0.2s;
  margin-left: 0.11rem;
}
.logout-btn:hover {
  opacity: 1;
  color: #e53e3e;
}
.logout-btn .material-symbols-outlined { font-size: 1.05rem; }

/* ─── HAMBURGER ─── */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 0.28rem;
  background: rgba(255,255,255,0.7);
  border: 0.06rem solid rgba(255,255,255,0.85);
  border-radius: 0.56rem;
  cursor: pointer;
  padding: 0.5rem 0.56rem;
}
.hamburger span {
  display: block;
  width: 1.22rem;
  height: 0.14rem;
  background: var(--text-blue);
  border-radius: 0.11rem;
  transition: all 0.25s ease;
  transform-origin: center;
}
.hamburger span.open:nth-child(1) { transform: translateY(0.42rem) rotate(45deg); }
.hamburger span.open:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger span.open:nth-child(3) { transform: translateY(-0.42rem) rotate(-45deg); }

/* ─── MOBILE NAV ─── */
.mobile-nav {
  display: none;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.35s ease;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(0.67rem);
  border-bottom: 1px solid rgba(26,91,130,0.08);
}
.mobile-nav.open {
  max-height: 25rem;
}
.mobile-nav ul {
  padding: 0.89rem 1.11rem 1.33rem;
  display: flex;
  flex-direction: column;
  gap: 0.33rem;
}
.mobile-nav a {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-blue);
  padding: 0.67rem 1.11rem;
  border-radius: 0.67rem;
  display: block;
  transition: all 0.2s;
}
.mobile-nav a.active { background: var(--button-purple); color: white; }
.mobile-nav a:hover:not(.active) { background: var(--button-purple-soft); }

/* Autenticación en Nav Móvil */
.mobile-auth-item {
  border-top: 1px dashed rgba(26, 91, 130, 0.15);
  margin-top: 0.67rem;
  padding-top: 0.89rem;
}

.mobile-user-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.56rem;
  padding: 0.56rem 0;
}

.mobile-user-row .user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1rem;
}

.mobile-user-row .user-name {
  font-size: 1.05rem;
  max-width: 100%;
}

.mobile-logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.44rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  background: rgba(229, 62, 62, 0.08);
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.15);
  border-radius: 5.5rem;
  padding: 0.56rem 1.11rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-logout-btn:hover {
  background: #e53e3e;
  color: white;
}

.mobile-login-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.44rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  background: var(--button-purple);
  color: white;
  border: none;
  border-radius: 5.5rem;
  padding: 0.67rem 1.11rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-purple);
}

.mobile-login-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

/* ─── WAVE ─── */
.header-wave {
  height: 2.78rem;
  display: block;
  transition: height 0.3s ease;
}
.header-wave svg {
  width: 100%;
  height: 100%;
  display: block;
}

.site-header.is-sticky .header-wave {
  height: 1.22rem;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 960px) {
  .main-nav { display: none; }
  .hamburger { display: flex; }
  .mobile-nav { display: block; }
}

@media (max-width: 576px) {
  .login-btn { display: none; }
  .logo { width: 3.2rem; height: 3.2rem; }
}
</style>
