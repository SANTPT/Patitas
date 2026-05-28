<script setup>
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const sectionTitle = computed(() => {
  const path = route.path;
  const parts = path.split('/');
  const lastPart = parts[parts.length - 1];
  
  // Format section title nicely
  switch (lastPart) {
    case 'gestion-web': return 'Gestión Web';
    case 'centros': return 'Gestión de Centros';
    case 'admins': return 'Gestión de Administradores';
    case 'tienda': return 'Gestión de Tienda';
    case 'moderacion': return 'Moderación de Contenidos';
    case 'mi-centro': return 'Mi Centro';
    case 'profesionales': return 'Equipo de Profesionales';
    case 'ninos': return 'Expedientes de Niños';
    case 'citas': return 'Gestión de Citas';
    case 'contenido': return 'Gestión de Contenido';
    case 'mis-ninos': return 'Mis Niños Asignados';
    case 'progreso': return 'Seguimiento de Progreso';
    case 'mis-hijos': return 'Mis Hijos';
    case 'mis-eventos': return 'Mis Eventos Inscritos';
    case 'mis-pedidos': return 'Mis Pedidos';
    default: return 'Sección del Panel';
  }
});

const sectionIcon = computed(() => {
  const path = route.path;
  if (path.includes('gestion-web')) return 'settings_applications';
  if (path.includes('centros') || path.includes('mi-centro')) return 'home_work';
  if (path.includes('admins')) return 'admin_panel_settings';
  if (path.includes('tienda')) return 'storefront';
  if (path.includes('moderacion')) return 'gavel';
  if (path.includes('profesionales')) return 'medical_services';
  if (path.includes('ninos') || path.includes('mis-ninos') || path.includes('mis-hijos')) return 'child_care';
  if (path.includes('citas')) return 'calendar_month';
  if (path.includes('contenido')) return 'article';
  if (path.includes('progreso')) return 'trending_up';
  if (path.includes('eventos')) return 'event';
  if (path.includes('pedidos')) return 'local_shipping';
  return 'dashboard';
});

const homePath = computed(() => {
  const role = authStore.user?.role || 'user';
  if (role === 'superadmin') return '/dashboard/superadmin';
  if (role === 'admin_centro') return '/dashboard/admin-centro';
  if (role === 'admin_profesional') return '/dashboard/admin-profesional';
  return '/dashboard/usuario';
});
</script>

<template>
  <div class="dashboard-section-view">
    <div class="section-card">
      <span class="material-symbols-outlined section-large-icon">{{ sectionIcon }}</span>
      <h2 class="section-view-title">{{ sectionTitle }}</h2>
      <p class="section-view-desc">
        La sección de <strong>{{ sectionTitle }}</strong> se encuentra actualmente en mantenimiento o fase de desarrollo.
      </p>
      <div class="development-badge">
        <span class="material-symbols-outlined">construction</span>
        Próximamente disponible
      </div>
      <RouterLink :to="homePath" class="back-home-btn">
        <span class="material-symbols-outlined">arrow_back</span>
        Volver al Inicio
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.dashboard-section-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 9rem);
  padding: 1.5rem;
}

.section-card {
  background: white;
  border-radius: 1.5rem;
  padding: 3rem 2rem;
  max-width: 32rem;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 30px rgba(26, 91, 130, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.section-large-icon {
  font-size: 4.5rem;
  color: var(--button-purple, #c58cf2);
  background: var(--button-purple-soft, rgba(197, 140, 242, 0.1));
  padding: 1.5rem;
  border-radius: 50%;
  margin-bottom: 0.5rem;
}

.section-view-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.section-view-desc {
  font-size: 0.95rem;
  color: #7c8ba1;
  line-height: 1.5;
}

.development-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef3c7;
  color: #d97706;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 1rem;
  border-radius: 5rem;
  margin: 0.5rem 0;
}

.back-home-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--button-purple, #c58cf2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 5rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.22s ease;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.25);
}

.back-home-btn:hover {
  background: var(--button-purple-hover, #b373e6);
  transform: translateY(-2px);
}
</style>
