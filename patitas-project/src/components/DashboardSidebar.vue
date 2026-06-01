<script setup>
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const authStore = useAuthStore();
const route = useRoute();

const role = computed(() => authStore.user?.role || 'user');

// Dynamic menu items based on role
const menuItems = computed(() => {
  const r = role.value;
  if (r === 'superadmin') {
    return [
      { label: 'Inicio', path: '/dashboard/superadmin', icon: 'dashboard' },
      { label: 'Gestión web', path: '/dashboard/superadmin/gestion-web', icon: 'settings_applications' },
      { label: 'Centros', path: '/dashboard/superadmin/centros', icon: 'home_work' },
      { label: 'Admins', path: '/dashboard/superadmin/admins', icon: 'admin_panel_settings' },
      { label: 'Tienda', path: '/dashboard/superadmin/tienda', icon: 'storefront' },
      { label: 'Moderación', path: '/dashboard/superadmin/moderacion', icon: 'gavel' },
      { label: 'Perfil', path: '/dashboard/superadmin/perfil', icon: 'person' },
    ];
  } else if (r === 'admin_centro') {
    return [
      { label: 'Inicio', path: '/dashboard/admin-centro', icon: 'dashboard' },
      { label: 'Mi centro', path: '/dashboard/admin-centro/mi-centro', icon: 'domain' },
      { label: 'Profesionales', path: '/dashboard/admin-centro/profesionales', icon: 'medical_services' },
      { label: 'Niños', path: '/dashboard/admin-centro/ninos', icon: 'child_care' },
      { label: 'Citas', path: '/dashboard/admin-centro/citas', icon: 'calendar_month' },
      { label: 'Contenido', path: '/dashboard/admin-centro/contenido', icon: 'article' },
      { label: 'Perfil', path: '/dashboard/admin-centro/perfil', icon: 'person' },
    ];
  } else if (r === 'admin_profesional') {
    return [
      { label: 'Inicio', path: '/dashboard/admin-profesional', icon: 'dashboard' },
      { label: 'Mis niños', path: '/dashboard/admin-profesional/mis-ninos', icon: 'child_care' },
      { label: 'Citas', path: '/dashboard/admin-profesional/citas', icon: 'calendar_month' },
      { label: 'Progreso', path: '/dashboard/admin-profesional/progreso', icon: 'trending_up' },
      { label: 'Contenido', path: '/dashboard/admin-profesional/contenido', icon: 'article' },
      { label: 'Perfil', path: '/dashboard/admin-profesional/perfil', icon: 'person' },
    ];
  } else {
    // user
    return [
      { label: 'Inicio', path: '/dashboard/usuario', icon: 'dashboard' },
      { label: 'Mis hijos', path: '/dashboard/usuario/mis-hijos', icon: 'child_care' },
      { label: 'Citas', path: '/dashboard/usuario/citas', icon: 'calendar_month' },
      { label: 'Mis eventos', path: '/dashboard/usuario/mis-eventos', icon: 'event' },
      { label: 'Mis pedidos', path: '/dashboard/usuario/mis-pedidos', icon: 'local_shipping' },
      { label: 'Perfil', path: '/dashboard/usuario/perfil', icon: 'person' },
    ];
  }
});

const isLinkActive = (path) => {
  return route.path === path;
};
</script>

<template>
  <div>
    <!-- Mobile Backdrop Overlay -->
    <div 
      v-if="isOpen" 
      class="sidebar-overlay" 
      @click="emit('close')"
    ></div>

    <!-- Sidebar Wrapper -->
    <aside 
      class="dashboard-sidebar" 
      :class="{ 'is-open': isOpen }"
    >
      <div class="sidebar-header">
        <RouterLink to="/" class="sidebar-logo-link">
          <img src="../assets/logo.png" alt="Patitas Logo" class="sidebar-logo-img" />
          <span class="sidebar-logo-text">Patitas</span>
        </RouterLink>
        <button class="sidebar-close-btn" @click="emit('close')" aria-label="Cerrar sidebar">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="sidebar-nav-link"
          :class="{ 'active': isLinkActive(item.path) }"
          @click="emit('close')"
        >
          <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>
      
      <div class="sidebar-footer">
        <span class="role-badge" :class="'role-' + role">
          {{ role.replace('_', ' ') }}
        </span>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.dashboard-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 15.5rem;
  background: white;
  box-shadow: 0 0 30px rgba(26, 91, 130, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar-header {
  height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  border-bottom: 1px solid rgba(26, 91, 130, 0.05);
}

.sidebar-logo-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.sidebar-logo-img {
  width: 2.2rem;
  height: 2.2rem;
  object-fit: contain;
}

.sidebar-close-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-blue, #1a5b82);
  cursor: pointer;
}

.sidebar-nav {
  flex-grow: 1;
  padding: 1.25rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  overflow-y: auto;
}

.sidebar-nav-link {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.75rem 1rem;
  border-radius: 0.8rem;
  color: var(--text-blue, #1a5b82);
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.22s ease;
}

.sidebar-nav-link:hover {
  background: var(--button-purple-soft, rgba(197, 140, 242, 0.08));
  color: var(--button-purple, #c58cf2);
}

.sidebar-nav-link.active {
  background: var(--button-purple, #c58cf2);
  color: white;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.3);
}

.nav-icon {
  font-size: 1.3rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(26, 91, 130, 0.05);
  display: flex;
  justify-content: center;
}

.role-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.35rem 0.8rem;
  border-radius: 5rem;
  letter-spacing: 0.04em;
}

.role-superadmin {
  background: #fef3c7;
  color: #d97706;
}

.role-admin_centro {
  background: #e0f2fe;
  color: #0284c7;
}

.role-admin_profesional {
  background: #f3e8ff;
  color: #9333ea;
}

.role-user {
  background: #d1fae5;
  color: #059669;
}

/* Mobile responsive styling */
@media (max-width: 992px) {
  .dashboard-sidebar {
    transform: translateX(-100%);
  }
  
  .dashboard-sidebar.is-open {
    transform: translateX(0);
  }
  
  .sidebar-close-btn {
    display: block;
  }
  
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    z-index: 999;
  }
}
</style>
