<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminsStore } from '../../stores/admins';
import api from '../../services/api';

const adminsStore = useAdminsStore();

// ── State ─────────────────────────────────────────────────────────────────
const currentTab = ref('admin_centro'); // 'admin_centro' | 'admin_profesional'
const searchQuery = ref('');
const selectedCenterId = ref('');
const selectedStatus = ref('');
const centers = ref([]);

// Modals
const showFormModal = ref(false);
const isEditing = ref(false);
const formUser = ref({
  id: null,
  name: '',
  email: '',
  centroId: '',
  isNewCenter: false,
  newCenterName: ''
});
const formError = ref(null);

const showSuspendModal = ref(false);
const suspendTarget = ref(null);
const suspensionReason = ref('');
const suspendError = ref(null);

const showDeleteModal = ref(false);
const deleteTarget = ref(null);
const deletionReason = ref('');
const deleteError = ref(null);

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  await adminsStore.fetchAdmins();
  await loadCenters();
});

// ── Actions ───────────────────────────────────────────────────────────────
async function loadCenters() {
  try {
    const response = await api.get('/centros');
    centers.value = response.data;
  } catch (err) {
    console.error('Error al cargar centros:', err);
  }
}

// Helpers
function getCenterName(centroId) {
  if (!centroId) return 'Sin Centro';
  const center = centers.value.find(c => c.id === parseInt(centroId));
  return center ? center.name : `Centro #${centroId}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function triggerToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type }
  }));
}

// Filtered Admins list
const filteredAdmins = computed(() => {
  return adminsStore.admins.filter(user => {
    // 1. Role match
    if (user.role !== currentTab.value) return false;

    // 2. Search match (name or email)
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const nameMatch = user.name?.toLowerCase().includes(query);
      const emailMatch = user.email?.toLowerCase().includes(query);
      if (!nameMatch && !emailMatch) return false;
    }

    // 3. Center match
    if (selectedCenterId.value) {
      if (user.centroId !== parseInt(selectedCenterId.value)) return false;
    }

    // 4. Status match
    if (selectedStatus.value) {
      if (user.status !== selectedStatus.value) return false;
    }

    return true;
  });
});

// ── Create / Edit Form Methods ────────────────────────────────────────────
function openCreateModal() {
  isEditing.value = false;
  formUser.value = {
    id: null,
    name: '',
    email: '',
    centroId: '',
    isNewCenter: false,
    newCenterName: ''
  };
  formError.value = null;
  showFormModal.value = true;
}

function openEditModal(user) {
  isEditing.value = true;
  formUser.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    centroId: user.centroId || '',
    isNewCenter: false,
    newCenterName: ''
  };
  formError.value = null;
  showFormModal.value = true;
}

function handleCenterChange() {
  formUser.value.isNewCenter = (formUser.value.centroId === 'new');
}

async function saveAdmin() {
  formError.value = null;

  // Validation
  if (!formUser.value.name.trim()) {
    formError.value = 'El nombre completo es obligatorio.';
    return;
  }
  if (!formUser.value.email.trim()) {
    formError.value = 'El correo electrónico es obligatorio.';
    return;
  }
  if (formUser.value.isNewCenter && !formUser.value.newCenterName.trim()) {
    formError.value = 'Debes especificar el nombre del nuevo centro.';
    return;
  }
  if (!formUser.value.isNewCenter && !formUser.value.centroId) {
    formError.value = 'Debes seleccionar un centro existente.';
    return;
  }

  let finalCentroId = formUser.value.centroId;

  // 1. If it's a new center, create it first
  if (formUser.value.isNewCenter) {
    try {
      const res = await api.post('/centros', { name: formUser.value.newCenterName.trim() });
      finalCentroId = res.data.id;
      // Reload centers
      await loadCenters();
    } catch (err) {
      formError.value = 'No se pudo registrar el nuevo centro. Inténtalo de nuevo.';
      return;
    }
  }

  // 2. Create or Update admin
  let result;
  if (isEditing.value) {
    result = await adminsStore.updateAdminCentro(formUser.value.id, {
      name: formUser.value.name.trim(),
      email: formUser.value.email.trim(),
      centroId: finalCentroId
    });
  } else {
    result = await adminsStore.createAdminCentro({
      name: formUser.value.name.trim(),
      email: formUser.value.email.trim(),
      centroId: finalCentroId
    });
  }

  if (result.success) {
    triggerToast(
      isEditing.value
        ? 'Administrador actualizado correctamente.'
        : 'Administrador registrado con éxito (contraseña por defecto: "password").',
      'success'
    );
    showFormModal.value = false;
  } else {
    formError.value = result.error;
  }
}

// ── Suspension Methods ──────────────────────────────────────────────────
function openSuspendModal(user) {
  suspendTarget.value = user;
  suspensionReason.value = '';
  suspendError.value = null;
  showSuspendModal.value = true;
}

async function confirmSuspension() {
  suspendError.value = null;
  if (!suspensionReason.value.trim()) {
    suspendError.value = 'El motivo de la suspensión es obligatorio.';
    return;
  }

  const result = await adminsStore.suspendUser(suspendTarget.value.id, suspensionReason.value.trim());
  if (result.success) {
    triggerToast(`El usuario ${suspendTarget.value.name} ha sido suspendido.`, 'success');
    showSuspendModal.value = false;
  } else {
    suspendError.value = result.error;
  }
}

async function handleReactivate(user) {
  if (confirm(`¿Estás seguro de que deseas reactivar la cuenta de ${user.name}?`)) {
    const result = await adminsStore.reactivateUser(user.id);
    if (result.success) {
      triggerToast(`La cuenta de ${user.name} ha sido reactivada.`, 'success');
    } else {
      triggerToast(result.error || 'No se pudo reactivar al usuario.', 'error');
    }
  }
}

// ── Deletion Methods ────────────────────────────────────────────────────
function openDeleteModal(user) {
  deleteTarget.value = user;
  deletionReason.value = '';
  deleteError.value = null;
  showDeleteModal.value = true;
}

async function confirmDeletion() {
  deleteError.value = null;
  if (!deletionReason.value.trim()) {
    deleteError.value = 'El motivo de la eliminación es obligatorio.';
    return;
  }

  const result = await adminsStore.deleteUser(deleteTarget.value.id, deletionReason.value.trim());
  if (result.success) {
    triggerToast(`El usuario ${deleteTarget.value.name} ha sido eliminado. Su contenido ha quedado huérfano.`, 'success');
    showDeleteModal.value = false;
  } else {
    deleteError.value = result.error;
  }
}
</script>

<template>
  <div class="admins-view">
    <!-- Header -->
    <div class="admins-header">
      <div class="title-section">
        <span class="material-symbols-outlined header-icon">admin_panel_settings</span>
        <div>
          <h1 class="page-title">Gestión de Administradores</h1>
          <p class="page-subtitle">Control de perfiles administrativos de centros de atención temprana y profesionales asignados.</p>
        </div>
      </div>
      <button 
        v-if="currentTab === 'admin_centro'" 
        @click="openCreateModal" 
        class="create-btn"
      >
        <span class="material-symbols-outlined">add</span>
        Nuevo admin de centro
      </button>
    </div>

    <!-- Tabs Nav -->
    <div class="tabs-navigation">
      <button 
        :class="['tab-btn', { active: currentTab === 'admin_centro' }]" 
        @click="currentTab = 'admin_centro'"
      >
        <span class="material-symbols-outlined">corporate_fare</span>
        Admins de Centro
      </button>
      <button 
        :class="['tab-btn', { active: currentTab === 'admin_profesional' }]" 
        @click="currentTab = 'admin_profesional'"
      >
        <span class="material-symbols-outlined">clinical_notes</span>
        Profesionales de Apoyo
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="filters-card">
      <div class="filters-grid">
        <!-- Search -->
        <div class="filter-group search-group">
          <label>Buscar administrador</label>
          <div class="search-input-wrapper">
            <span class="material-symbols-outlined search-icon">search</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar por nombre o correo electrónico..." 
            />
          </div>
        </div>

        <!-- Filter by Center -->
        <div class="filter-group">
          <label>Filtrar por centro</label>
          <select v-model="selectedCenterId">
            <option value="">Todos los centros</option>
            <option v-for="center in centers" :key="center.id" :value="center.id">
              {{ center.name }}
            </option>
          </select>
        </div>

        <!-- Filter by Status -->
        <div class="filter-group">
          <label>Filtrar por estado</label>
          <select v-model="selectedStatus">
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="suspended">Suspendido</option>
          </select>
        </div>
      </div>
    </div>

    <!-- List Table -->
    <div class="table-container">
      <div v-if="adminsStore.isLoading" class="loading-state">
        <span class="material-symbols-outlined spin-icon">progress_activity</span>
        <p>Cargando lista de administradores...</p>
      </div>

      <div v-else-if="filteredAdmins.length === 0" class="empty-state">
        <span class="material-symbols-outlined empty-icon">group_off</span>
        <h3>No se encontraron resultados</h3>
        <p>Intenta ajustar los criterios de búsqueda o de filtrado para encontrar al usuario.</p>
      </div>

      <table v-else class="admins-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Centro Asignado</th>
            <th>Estado</th>
            <th>Fecha de Creación</th>
            <th class="actions-header">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredAdmins" :key="user.id">
            <td class="user-cell">
              <img :src="user.avatar" class="user-avatar" alt="Avatar" />
              <div class="user-info">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-email">{{ user.email }}</span>
              </div>
            </td>
            <td>
              <span class="center-tag">
                <span class="material-symbols-outlined center-tag-icon">home_work</span>
                {{ getCenterName(user.centroId) }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', user.status === 'suspended' ? 'suspended' : 'active']">
                {{ user.status === 'suspended' ? 'Suspendido' : 'Activo' }}
              </span>
            </td>
            <td>
              <span class="date-text">{{ formatDate(user.createdAt) }}</span>
            </td>
            <td class="actions-cell">
              <button 
                v-if="user.role === 'admin_centro'"
                @click="openEditModal(user)" 
                class="action-btn edit" 
                title="Editar perfil"
              >
                <span class="material-symbols-outlined">edit</span>
              </button>
              
              <button 
                v-if="user.status !== 'suspended'"
                @click="openSuspendModal(user)" 
                class="action-btn suspend" 
                title="Suspender cuenta"
              >
                <span class="material-symbols-outlined">block</span>
              </button>
              <button 
                v-else
                @click="handleReactivate(user)" 
                class="action-btn reactivate" 
                title="Reactivar cuenta"
              >
                <span class="material-symbols-outlined">check_circle</span>
              </button>

              <button 
                @click="openDeleteModal(user)" 
                class="action-btn delete" 
                title="Eliminar permanentemente"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- CREATE/EDIT MODAL -->
    <div v-if="showFormModal" class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Administrador' : 'Nuevo Administrador de Centro' }}</h3>
          <button @click="showFormModal = false" class="close-btn">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="saveAdmin" class="modal-form">
          <div v-if="formError" class="form-error-banner">
            <span class="material-symbols-outlined">error</span>
            {{ formError }}
          </div>

          <div class="form-field">
            <label>Nombre Completo</label>
            <input 
              v-model="formUser.name" 
              type="text" 
              placeholder="Ej. Juan Pérez" 
              required
            />
          </div>

          <div class="form-field">
            <label>Correo Electrónico</label>
            <input 
              v-model="formUser.email" 
              type="email" 
              placeholder="Ej. juan@centro.com" 
              required
            />
          </div>

          <div class="form-field">
            <label>Centro de Atención Temprana</label>
            <select v-model="formUser.centroId" @change="handleCenterChange" required>
              <option value="" disabled>Selecciona un centro</option>
              <option v-for="center in centers" :key="center.id" :value="center.id">
                {{ center.name }}
              </option>
              <option value="new">+ Registrar un nuevo centro...</option>
            </select>
          </div>

          <!-- New Center Option Form Field -->
          <div v-if="formUser.isNewCenter" class="form-field nested-field">
            <label>Nombre del Nuevo Centro</label>
            <input 
              v-model="formUser.newCenterName" 
              type="text" 
              placeholder="Ej. Centro de Terapia Infantil Senda" 
              required
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="showFormModal = false" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              {{ isEditing ? 'Guardar Cambios' : 'Crear Admin' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- SUSPEND DIALOG MODAL -->
    <div v-if="showSuspendModal" class="modal-backdrop">
      <div class="modal-card small-modal">
        <div class="modal-header warning-header">
          <h3>Confirmar Suspensión</h3>
          <button @click="showSuspendModal = false" class="close-btn">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="modal-body">
          <p>Vas a suspender la cuenta de <strong>{{ suspendTarget?.name }}</strong>.</p>
          <p class="warning-subtext">El usuario no podrá volver a iniciar sesión hasta que un administrador reactive su perfil.</p>
          
          <div v-if="suspendError" class="form-error-banner">
            <span class="material-symbols-outlined">error</span>
            {{ suspendError }}
          </div>

          <div class="form-field mt-3">
            <label>Motivo de la suspensión <span class="required-star">*</span></label>
            <textarea 
              v-model="suspensionReason" 
              placeholder="Escribe el motivo detallado de la suspensión..."
              rows="3"
              required
            ></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="showSuspendModal = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="confirmSuspension" class="btn-warning">
            Suspender Cuenta
          </button>
        </div>
      </div>
    </div>

    <!-- DELETE DIALOG MODAL -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal-card small-modal">
        <div class="modal-header danger-header">
          <h3>Eliminar Administrador</h3>
          <button @click="showDeleteModal = false" class="close-btn">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar permanentemente la cuenta de <strong>{{ deleteTarget?.name }}</strong>?</p>
          <p class="warning-subtext text-danger">Esta acción es irreversible. El contenido publicado por este usuario quedará huérfano.</p>
          
          <div v-if="deleteError" class="form-error-banner">
            <span class="material-symbols-outlined">error</span>
            {{ deleteError }}
          </div>

          <div class="form-field mt-3">
            <label>Motivo de la eliminación <span class="required-star">*</span></label>
            <textarea 
              v-model="deletionReason" 
              placeholder="Escribe el motivo de la eliminación para el registro de auditoría..."
              rows="3"
              required
            ></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="confirmDeletion" class="btn-danger">
            Eliminar Definitivamente
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.admins-view {
  padding: 0.5rem 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.admins-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  font-size: 2.8rem;
  color: var(--text-blue, #1a5b82);
  background: rgba(26, 91, 130, 0.05);
  padding: 0.75rem;
  border-radius: 1.25rem;
}

.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #7c8ba1;
  font-size: 0.95rem;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--button-purple, #c58cf2);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.2);
  transition: all 0.2s ease;
}

.create-btn:hover {
  background: var(--button-purple-hover, #b373e6);
  transform: translateY(-2px);
}

/* Tabs */
.tabs-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid rgba(26, 91, 130, 0.05);
  padding-bottom: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0.75rem 1.25rem;
  color: #7c8ba1;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(26, 91, 130, 0.03);
  color: var(--text-blue, #1a5b82);
}

.tab-btn.active {
  background: rgba(26, 91, 130, 0.05);
  color: var(--text-blue, #1a5b82);
}

/* Filters */
.filters-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(26, 91, 130, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.02);
  margin-bottom: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #7c8ba1;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #a0aec0;
  font-size: 1.25rem;
}

.search-input-wrapper input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input-wrapper input:focus {
  border-color: var(--button-purple, #c58cf2);
}

.filter-group select {
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  outline: none;
  cursor: pointer;
  background-color: white;
  transition: border-color 0.2s ease;
}

.filter-group select:focus {
  border-color: var(--button-purple, #c58cf2);
}

/* Table */
.table-container {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 30px rgba(26, 91, 130, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.02);
  overflow-x: auto;
  min-height: 250px;
}

.admins-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admins-table th {
  background: #f8fafc;
  padding: 1.25rem 1.5rem;
  color: #7c8ba1;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1.5px solid #edf2f7;
}

.admins-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
  color: #4a5568;
}

.admins-table tr:hover td {
  background-color: #fcfdfe;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  object-fit: cover;
  background: #f1f5f9;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--text-blue, #1a5b82);
  font-size: 0.95rem;
}

.user-email {
  font-size: 0.85rem;
  color: #7c8ba1;
}

.center-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(26, 91, 130, 0.05);
  color: var(--text-blue, #1a5b82);
  padding: 0.4rem 0.8rem;
  border-radius: 5rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.center-tag-icon {
  font-size: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.75rem;
  border-radius: 5rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.status-badge.active {
  background: #e6f9f0;
  color: #10b981;
}

.status-badge.suspended {
  background: #fee2e2;
  color: #ef4444;
}

.date-text {
  font-size: 0.88rem;
  color: #7c8ba1;
}

/* Actions */
.actions-header {
  text-align: right;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn span {
  font-size: 1.2rem;
}

.action-btn.edit {
  background: #eff6ff;
  color: #3b82f6;
}

.action-btn.edit:hover {
  background: #dbeafe;
  transform: scale(1.05);
}

.action-btn.suspend {
  background: #fffbeb;
  color: #d97706;
}

.action-btn.suspend:hover {
  background: #fef3c7;
  transform: scale(1.05);
}

.action-btn.reactivate {
  background: #e6f9f0;
  color: #10b981;
}

.action-btn.reactivate:hover {
  background: #d1fae5;
  transform: scale(1.05);
}

.action-btn.delete {
  background: #fee2e2;
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #fecaca;
  transform: scale(1.05);
}

/* States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spin-icon {
  font-size: 3rem;
  color: var(--button-purple, #c58cf2);
  animation: spin 1.5s linear infinite;
  margin-bottom: 1rem;
}

.empty-icon {
  font-size: 3.5rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  color: var(--text-blue, #1a5b82);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.9rem;
  color: #7c8ba1;
  max-width: 25rem;
}

/* Modal Backdrops & Cards */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(26, 37, 48, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-card {
  background: white;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 32rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.modal-card.small-modal {
  max-width: 28rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #edf2f7;
}

.modal-header h3 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.modal-header.warning-header h3 {
  color: #d97706;
}

.modal-header.danger-header h3 {
  color: #ef4444;
}

.close-btn {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  display: flex;
}

.close-btn:hover {
  color: #4a5568;
}

.modal-form, .modal-body {
  padding: 1.5rem;
}

.form-error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fee2e2;
  color: #ef4444;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.88rem;
  font-weight: 500;
  margin-bottom: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

.form-field.nested-field {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px dashed #e2e8f0;
}

.form-field label {
  font-size: 0.88rem;
  font-weight: 600;
  color: #4a5568;
}

.form-field input, .form-field select, .form-field textarea {
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-field input:focus, .form-field select:focus, .form-field textarea:focus {
  border-color: var(--button-purple, #c58cf2);
}

.warning-subtext {
  font-size: 0.85rem;
  color: #7c8ba1;
  margin-top: 0.25rem;
}

.required-star {
  color: #ef4444;
}

.mt-3 {
  margin-top: 1rem;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #edf2f7;
}

.btn-secondary {
  background: white;
  border: 1.5px solid #cbd5e1;
  color: #4a5568;
  padding: 0.6rem 1.25rem;
  border-radius: 5rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f1f5f9;
}

.btn-primary {
  background: var(--button-purple, #c58cf2);
  color: white;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 5rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--button-purple-hover, #b373e6);
}

.btn-warning {
  background: #d97706;
  color: white;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 5rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  cursor: pointer;
}

.btn-warning:hover {
  background: #b45309;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 5rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Keyframes */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes scaleUp {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
