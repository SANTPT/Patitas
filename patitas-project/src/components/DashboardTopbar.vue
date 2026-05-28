<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const emit = defineEmits(['toggle-sidebar']);

const authStore = useAuthStore();
const router = useRouter();

const userInitials = computed(() => authStore.initials);
const userName = computed(() => authStore.displayName);
const menuOpen = ref(false);

// Ruta de perfil según rol
const perfilRoute = computed(() => {
  const role = authStore.user?.role || 'user';
  if (role === 'superadmin')        return '/dashboard/superadmin/perfil';
  if (role === 'admin_centro')      return '/dashboard/admin-centro/perfil';
  if (role === 'admin_profesional') return '/dashboard/admin-profesional/perfil';
  return '/dashboard/usuario/perfil';
});

function handleLogout() {
  menuOpen.value = false;
  authStore.logout();
  router.push({ name: 'home' });
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message: 'Sesión cerrada correctamente.', type: 'success' }
  }));
}

function goToPerfil() {
  menuOpen.value = false;
  router.push(perfilRoute.value);
}

// Cerrar dropdown al hacer clic fuera
function handleClickOutside(e) {
  if (!e.target.closest('.user-menu-wrapper')) {
    menuOpen.value = false;
  }
}
onMounted(() => window.addEventListener('click', handleClickOutside));
onUnmounted(() => window.removeEventListener('click', handleClickOutside));
</script>

<template>
  <header class="dashboard-topbar">
    <div class="topbar-left">
      <button 
        class="sidebar-toggle-btn" 
        @click="emit('toggle-sidebar')"
        aria-label="Abrir menú"
      >
        <span class="material-symbols-outlined">menu</span>
      </button>
      <h1 class="topbar-title">Mi Panel</h1>
    </div>
    
    <div class="topbar-right">
      <!-- Menú de usuario con dropdown -->
      <div class="user-menu-wrapper">
        <button
          class="user-profile-btn"
          @click="menuOpen = !menuOpen"
          :aria-expanded="menuOpen"
          :title="userName"
          id="topbar-user-btn"
        >
          <div class="user-avatar">
            {{ userInitials }}
          </div>
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ authStore.user?.role?.replace(/_/g, ' ') }}</span>
          </div>
          <span class="material-symbols-outlined dropdown-arrow" :class="{ open: menuOpen }">expand_more</span>
        </button>

        <!-- Dropdown -->
        <Transition name="dropdown">
          <div v-if="menuOpen" class="user-dropdown" role="menu">
            <button class="dropdown-item" @click="goToPerfil" role="menuitem" id="topbar-perfil-btn">
              <span class="material-symbols-outlined">manage_accounts</span>
              Mi perfil
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="handleLogout" role="menuitem" id="topbar-logout-btn">
              <span class="material-symbols-outlined">logout</span>
              Cerrar sesión
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dashboard-topbar {
  height: 4.5rem;
  background: white;
  border-bottom: 1px solid rgba(26, 91, 130, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 900;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-toggle-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-blue, #1a5b82);
  cursor: pointer;
}

.topbar-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* ── User Menu Wrapper ── */
.user-menu-wrapper {
  position: relative;
}

.user-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: rgba(197, 140, 242, 0.06);
  border: 1.5px solid rgba(197, 140, 242, 0.15);
  border-radius: 3rem;
  padding: 0.35rem 0.75rem 0.35rem 0.35rem;
  cursor: pointer;
  transition: all 0.22s ease;
}

.user-profile-btn:hover {
  background: rgba(197, 140, 242, 0.12);
  border-color: rgba(197, 140, 242, 0.35);
  box-shadow: 0 4px 12px rgba(197, 140, 242, 0.15);
}

.user-avatar {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: var(--button-purple, #c58cf2);
  color: white;
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.user-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-blue, #1a5b82);
  line-height: 1.2;
  white-space: nowrap;
}

.user-role {
  font-size: 0.68rem;
  color: #7c8ba1;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 1.1rem;
  color: #7c8ba1;
  transition: transform 0.22s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

/* ── Dropdown menu ── */
.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(26, 91, 130, 0.14);
  border: 1px solid rgba(26, 91, 130, 0.06);
  min-width: 13rem;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-blue, #1a5b82);
  cursor: pointer;
  text-align: left;
  transition: background 0.18s ease;
}

.dropdown-item:hover {
  background: rgba(197, 140, 242, 0.08);
}

.dropdown-item .material-symbols-outlined {
  font-size: 1.15rem;
  color: var(--button-purple, #c58cf2);
}

.dropdown-item.danger {
  color: #ef4444;
}

.dropdown-item.danger .material-symbols-outlined {
  color: #ef4444;
}

.dropdown-item.danger:hover {
  background: #fef2f2;
}

.dropdown-divider {
  height: 1px;
  background: rgba(26, 91, 130, 0.06);
  margin: 0.25rem 0;
}

/* ── Transición dropdown ── */
.dropdown-enter-active {
  transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dropdown-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

@media (max-width: 992px) {
  .sidebar-toggle-btn {
    display: block;
  }
  .user-info {
    display: none;
  }
  .dropdown-arrow {
    display: none;
  }
}
</style>
