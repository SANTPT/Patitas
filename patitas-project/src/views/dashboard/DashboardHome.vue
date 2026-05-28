<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
const role = computed(() => user.value?.role || 'user');

const displayName = computed(() => user.value?.name || 'Usuario');

// Role metadata for labels & cards
const roleLabel = computed(() => {
  switch (role.value) {
    case 'superadmin': return 'Super Administrador';
    case 'admin_centro': return 'Administrador de Centro';
    case 'admin_profesional': return 'Profesional';
    default: return 'Padre / Tutor';
  }
});
</script>

<template>
  <div class="dashboard-home">
    <!-- Welcome Header -->
    <header class="home-header">
      <div class="welcome-box">
        <h2 class="welcome-title">¡Hola, {{ displayName }}! 👋</h2>
        <p class="welcome-subtitle">Bienvenido de nuevo a tu panel de control de <strong>Patitas</strong> como <strong>{{ roleLabel }}</strong>.</p>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <!-- Superadmin Stats -->
      <template v-if="role === 'superadmin'">
        <div class="stat-card blue">
          <span class="material-symbols-outlined stat-icon">group</span>
          <div class="stat-info">
            <span class="stat-value">1,248</span>
            <span class="stat-label">Usuarios Activos</span>
          </div>
        </div>
        <div class="stat-card purple">
          <span class="material-symbols-outlined stat-icon">home_work</span>
          <div class="stat-info">
            <span class="stat-value">8</span>
            <span class="stat-label">Centros de Atención</span>
          </div>
        </div>
        <div class="stat-card pink">
          <span class="material-symbols-outlined stat-icon">payments</span>
          <div class="stat-info">
            <span class="stat-value">€4,320</span>
            <span class="stat-label">Ventas del Mes</span>
          </div>
        </div>
        <div class="stat-card green">
          <span class="material-symbols-outlined stat-icon">gavel</span>
          <div class="stat-info">
            <span class="stat-value">14</span>
            <span class="stat-label">Alertas de Moderación</span>
          </div>
        </div>
      </template>

      <!-- Admin Centro Stats -->
      <template v-else-if="role === 'admin_centro'">
        <div class="stat-card blue">
          <span class="material-symbols-outlined stat-icon">medical_services</span>
          <div class="stat-info">
            <span class="stat-value">14</span>
            <span class="stat-label">Profesionales</span>
          </div>
        </div>
        <div class="stat-card purple">
          <span class="material-symbols-outlined stat-icon">child_care</span>
          <div class="stat-info">
            <span class="stat-value">62</span>
            <span class="stat-label">Niños Registrados</span>
          </div>
        </div>
        <div class="stat-card green">
          <span class="material-symbols-outlined stat-icon">calendar_month</span>
          <div class="stat-info">
            <span class="stat-value">8</span>
            <span class="stat-label">Citas Programadas Hoy</span>
          </div>
        </div>
      </template>

      <!-- Admin Profesional Stats -->
      <template v-else-if="role === 'admin_profesional'">
        <div class="stat-card blue">
          <span class="material-symbols-outlined stat-icon">child_care</span>
          <div class="stat-info">
            <span class="stat-value">9</span>
            <span class="stat-label">Niños Asignados</span>
          </div>
        </div>
        <div class="stat-card purple">
          <span class="material-symbols-outlined stat-icon">history_edu</span>
          <div class="stat-info">
            <span class="stat-value">18</span>
            <span class="stat-label">Informes Creados</span>
          </div>
        </div>
        <div class="stat-card green">
          <span class="material-symbols-outlined stat-icon">schedule</span>
          <div class="stat-info">
            <span class="stat-value">4</span>
            <span class="stat-label">Sesiones para Hoy</span>
          </div>
        </div>
      </template>

      <!-- User Stats -->
      <template v-else>
        <div class="stat-card blue">
          <span class="material-symbols-outlined stat-icon">child_care</span>
          <div class="stat-info">
            <span class="stat-value">2</span>
            <span class="stat-label">Hijos Inscritos</span>
          </div>
        </div>
        <div class="stat-card purple">
          <span class="material-symbols-outlined stat-icon">event</span>
          <div class="stat-info">
            <span class="stat-value">1</span>
            <span class="stat-label">Próximo Evento</span>
          </div>
        </div>
        <div class="stat-card green">
          <span class="material-symbols-outlined stat-icon">shopping_bag</span>
          <div class="stat-info">
            <span class="stat-value">3</span>
            <span class="stat-label">Pedidos Realizados</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <h3 class="section-title">Acciones Rápidas</h3>
      <div class="actions-grid">
        <template v-if="role === 'superadmin'">
          <RouterLink to="/dashboard/superadmin/centros" class="action-card">
            <span class="material-symbols-outlined action-icon">add_business</span>
            <h4>Dar de alta centro</h4>
            <p>Registrar un nuevo centro de atención temprana.</p>
          </RouterLink>
          <RouterLink to="/dashboard/superadmin/admins" class="action-card">
            <span class="material-symbols-outlined action-icon">person_add</span>
            <h4>Crear Administrador</h4>
            <p>Añadir administradores para los centros locales.</p>
          </RouterLink>
          <RouterLink to="/dashboard/superadmin/moderacion" class="action-card">
            <span class="material-symbols-outlined action-icon">verified_user</span>
            <h4>Moderar Foros</h4>
            <p>Revisar publicaciones y comentarios reportados.</p>
          </RouterLink>
        </template>

        <template v-else-if="role === 'admin_centro'">
          <RouterLink to="/dashboard/admin-centro/profesionales" class="action-card">
            <span class="material-symbols-outlined action-icon">person_add</span>
            <h4>Alta de Profesional</h4>
            <p>Registrar un terapeuta en el equipo del centro.</p>
          </RouterLink>
          <RouterLink to="/dashboard/admin-centro/ninos" class="action-card">
            <span class="material-symbols-outlined action-icon">badge</span>
            <h4>Asignar Tutor</h4>
            <p>Asociar expedientes de niños con terapeutas.</p>
          </RouterLink>
          <RouterLink to="/dashboard/admin-centro/citas" class="action-card">
            <span class="material-symbols-outlined action-icon">calendar_add_on</span>
            <h4>Crear Cita</h4>
            <p>Agendar una sesión de consulta o terapia.</p>
          </RouterLink>
        </template>

        <template v-else-if="role === 'admin_profesional'">
          <RouterLink to="/dashboard/admin-profesional/mis-ninos" class="action-card">
            <span class="material-symbols-outlined action-icon">assignment_ind</span>
            <h4>Ver Pacientes</h4>
            <p>Acceder a los expedientes de tus niños asignados.</p>
          </RouterLink>
          <RouterLink to="/dashboard/admin-profesional/progreso" class="action-card">
            <span class="material-symbols-outlined action-icon">trending_up</span>
            <h4>Registrar Progreso</h4>
            <p>Crear informes de avance y observaciones.</p>
          </RouterLink>
          <RouterLink to="/dashboard/admin-profesional/citas" class="action-card">
            <span class="material-symbols-outlined action-icon">calendar_month</span>
            <h4>Consultar Calendario</h4>
            <p>Ver el horario detallado de tus sesiones semanales.</p>
          </RouterLink>
        </template>

        <template v-else>
          <RouterLink to="/dashboard/usuario/mis-hijos" class="action-card">
            <span class="material-symbols-outlined action-icon">family_history</span>
            <h4>Expedientes de Hijos</h4>
            <p>Consultar informes, citas y progresos de tus pequeños.</p>
          </RouterLink>
          <RouterLink to="/dashboard/usuario/mis-eventos" class="action-card">
            <span class="material-symbols-outlined action-icon">event_note</span>
            <h4>Ver Mis Eventos</h4>
            <p>Consultar talleres y actividades a las que te has inscrito.</p>
          </RouterLink>
          <RouterLink to="/tienda" class="action-card">
            <span class="material-symbols-outlined action-icon">shopping_cart</span>
            <h4>Ir a la Tienda</h4>
            <p>Explorar juguetes educativos y materiales de apoyo.</p>
          </RouterLink>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-home {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.home-header {
  background: white;
  border-radius: 1.5rem;
  padding: 1.8rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
}

.welcome-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
  margin-bottom: 0.4rem;
}

.welcome-subtitle {
  font-size: 0.95rem;
  color: #7c8ba1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1.25rem;
}

.stat-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
  transition: transform 0.22s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.2rem;
  padding: 0.8rem;
  border-radius: 1rem;
}

.stat-card.blue .stat-icon { background: #e0f2fe; color: #0284c7; }
.stat-card.purple .stat-icon { background: #f3e8ff; color: #9333ea; }
.stat-card.pink .stat-icon { background: #ffe4e6; color: #f43f5e; }
.stat-card.green .stat-icon { background: #d1fae5; color: #059669; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.8rem;
  color: #7c8ba1;
  font-weight: 500;
}

.quick-actions-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: 1.25rem;
}

.action-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
  border: 2px solid transparent;
  transition: all 0.22s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.action-card:hover {
  border-color: var(--button-purple, #c58cf2);
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(197, 140, 242, 0.15);
}

.action-icon {
  font-size: 2.2rem;
  color: var(--button-purple, #c58cf2);
  margin-bottom: 0.2rem;
}

.action-card h4 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.action-card p {
  font-size: 0.85rem;
  color: #7c8ba1;
  line-height: 1.4;
}
</style>
