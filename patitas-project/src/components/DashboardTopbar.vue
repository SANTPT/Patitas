<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const emit = defineEmits(['toggle-sidebar']);

const authStore = useAuthStore();
const router = useRouter();

const userInitials = computed(() => authStore.initials);
const userName = computed(() => authStore.displayName);

function handleLogout() {
  authStore.logout();
  router.push({ name: 'home' });
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message: 'Sesión cerrada correctamente.', type: 'success' }
  }));
}
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
      <div class="user-profile">
        <div class="user-avatar" :title="userName">
          {{ userInitials }}
        </div>
        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <span class="user-role">{{ authStore.user?.role?.replace('_', ' ') }}</span>
        </div>
      </div>
      
      <button 
        class="logout-btn" 
        @click="handleLogout"
        title="Cerrar sesión"
      >
        <span class="material-symbols-outlined">logout</span>
      </button>
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
  gap: 1.5rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: var(--button-purple-soft, rgba(197, 140, 242, 0.15));
  color: var(--button-purple, #c58cf2);
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 0 10px rgba(197, 140, 242, 0.2);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-blue, #1a5b82);
  line-height: 1.2;
}

.user-role {
  font-size: 0.72rem;
  color: #7c8ba1;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.logout-btn {
  background: none;
  border: none;
  color: var(--text-blue, #1a5b82);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.5rem;
  transition: all 0.22s ease;
}

.logout-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

@media (max-width: 992px) {
  .sidebar-toggle-btn {
    display: block;
  }
}
</style>
