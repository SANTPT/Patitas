<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useChildrenStore } from '../../stores/children';
import { useCitasStore } from '../../stores/citas';

const authStore = useAuthStore();
const childrenStore = useChildrenStore();
const citasStore = useCitasStore();

// State
const selectedChildId = ref('');
const showCancelModal = ref(false);
const citaToCancel = ref(null);

const showRescheduleModal = ref(false);
const citaToReschedule = ref(null);
const rescheduleForm = ref({
  date: '',
  time: '',
  reason: ''
});
const rescheduleError = ref(null);

const isPastCollapsed = ref(true);

onMounted(async () => {
  if (authStore.user) {
    await childrenStore.fetchChildren({ parentId: authStore.user.id });
    await citasStore.fetchCitas({ parentId: authStore.user.id });
  }
});

function triggerToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type }
  }));
}

// Check cancellation policy (6 hours)
function isCancelable(cita) {
  const citaDateTime = new Date(`${cita.date}T${cita.time}`);
  const now = new Date();
  return (citaDateTime - now) > 6 * 3600 * 1000;
}

// Check if appointment is in the past
function isPast(cita) {
  const citaDateTime = new Date(`${cita.date}T${cita.time}`);
  const now = new Date();
  return citaDateTime < now;
}

// Filtered and Sorted Appointments
const filteredCitas = computed(() => {
  let list = [...citasStore.citas];
  if (selectedChildId.value) {
    list = list.filter(c => c.childId === parseInt(selectedChildId.value));
  }
  return list;
});

const upcomingCitas = computed(() => {
  return filteredCitas.value
    .filter(c => !isPast(c))
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
});

const pastCitas = computed(() => {
  return filteredCitas.value
    .filter(c => isPast(c))
    .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));
});

// Cancel appointment
function openCancelModal(cita) {
  if (!isCancelable(cita)) return;
  citaToCancel.value = cita;
  showCancelModal.value = true;
}

async function confirmCancel() {
  if (!citaToCancel.value) return;
  const result = await citasStore.deleteCita(citaToCancel.value.id);
  if (result.success) {
    triggerToast(`La cita de ${citaToCancel.value.childName} ha sido cancelada y el centro ha sido notificado.`, 'success');
    showCancelModal.value = false;
  } else {
    triggerToast(citasStore.error || 'No se pudo cancelar la cita.', 'error');
  }
}

// Reschedule appointment
function openRescheduleModal(cita) {
  citaToReschedule.value = cita;
  rescheduleForm.value = {
    date: '',
    time: '',
    reason: ''
  };
  rescheduleError.value = null;
  showRescheduleModal.value = true;
}

async function confirmReschedule() {
  rescheduleError.value = null;
  if (!rescheduleForm.value.date || !rescheduleForm.value.time) {
    rescheduleError.value = 'Por favor selecciona la nueva fecha y hora.';
    return;
  }
  if (!rescheduleForm.value.reason.trim()) {
    rescheduleError.value = 'Por favor indica el motivo de la reprogramación.';
    return;
  }

  const result = await citasStore.requestReprogramacion(citaToReschedule.value.id, {
    date: rescheduleForm.value.date,
    time: rescheduleForm.value.time,
    reason: rescheduleForm.value.reason.trim()
  });

  if (result.success) {
    triggerToast('Solicitud de reprogramación enviada con éxito.', 'success');
    showRescheduleModal.value = false;
  } else {
    rescheduleError.value = citasStore.error || 'No se pudo enviar la solicitud.';
  }
}
</script>

<template>
  <div class="citas-usuario-view">
    <!-- Header -->
    <div class="view-header">
      <div class="title-section">
        <span class="material-symbols-outlined header-icon">calendar_month</span>
        <div>
          <h1 class="page-title">Mis Citas</h1>
          <p class="page-subtitle">Gestiona las citas de terapias y evaluaciones de tus hijos.</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card" v-if="childrenStore.children.length > 1">
      <div class="filter-group">
        <label for="child-select">Filtrar por hijo:</label>
        <select id="child-select" v-model="selectedChildId">
          <option value="">Todos los hijos</option>
          <option v-for="child in childrenStore.children" :key="child.id" :value="child.id">
            {{ child.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Main Content -->
    <div class="citas-content">
      <div v-if="citasStore.isLoading" class="loading-state">
        <span class="material-symbols-outlined spin-icon">progress_activity</span>
        <p>Cargando información de citas...</p>
      </div>

      <div v-else>
        <!-- Upcoming Appointments -->
        <section class="citas-section">
          <h2 class="section-title">Próximas Citas</h2>
          
          <div v-if="upcomingCitas.length === 0" class="empty-state card">
            <span class="material-symbols-outlined empty-icon">event_busy</span>
            <h3>No tienes citas programadas</h3>
            <p>Las próximas citas confirmadas por tu centro aparecerán aquí.</p>
          </div>

          <div v-else class="citas-grid">
            <div v-for="cita in upcomingCitas" :key="cita.id" class="cita-card card">
              <div class="cita-badge-row">
                <span class="session-type-badge">{{ cita.type }}</span>
                <span v-if="cita.reprogramacionSolicitada" class="reschedule-badge">
                  <span class="material-symbols-outlined icon">pending_actions</span>
                  Reprogramación solicitada
                </span>
              </div>

              <div class="cita-info">
                <div class="info-item">
                  <span class="material-symbols-outlined icon">child_care</span>
                  <span><strong>Hijo:</strong> {{ cita.childName }}</span>
                </div>
                <div class="info-item">
                  <span class="material-symbols-outlined icon">person</span>
                  <span><strong>Profesional:</strong> {{ cita.professionalName }}</span>
                </div>
                <div class="info-item">
                  <span class="material-symbols-outlined icon">calendar_today</span>
                  <span><strong>Fecha:</strong> {{ cita.date }}</span>
                </div>
                <div class="info-item">
                  <span class="material-symbols-outlined icon">schedule</span>
                  <span><strong>Hora:</strong> {{ cita.time }} ({{ cita.duration }} min)</span>
                </div>
                <div v-if="cita.notes" class="info-item notes">
                  <span class="material-symbols-outlined icon">description</span>
                  <span>{{ cita.notes }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="cita-actions">
                <button 
                  @click="openRescheduleModal(cita)" 
                  class="btn btn-secondary"
                  :disabled="cita.reprogramacionSolicitada"
                >
                  <span class="material-symbols-outlined">edit_calendar</span>
                  Reprogramar
                </button>

                <div class="cancel-wrapper">
                  <button 
                    @click="openCancelModal(cita)" 
                    class="btn btn-danger"
                    :disabled="!isCancelable(cita)"
                    :title="!isCancelable(cita) ? 'Solo puedes cancelar con más de 6 h de antelación' : ''"
                  >
                    <span class="material-symbols-outlined">event_busy</span>
                    Cancelar Cita
                  </button>
                  <span v-if="!isCancelable(cita)" class="policy-tooltip">
                    Solo puedes cancelar con más de 6 h de antelación
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Past Appointments (Collapsable) -->
        <section class="citas-section past-section">
          <button @click="isPastCollapsed = !isPastCollapsed" class="collapse-header">
            <span class="section-title">Historial de Citas ({{ pastCitas.length }})</span>
            <span class="material-symbols-outlined toggle-icon" :class="{ rotated: !isPastCollapsed }">
              expand_more
            </span>
          </button>

          <div v-show="!isPastCollapsed" class="collapse-content">
            <div v-if="pastCitas.length === 0" class="empty-state card">
              <p>No hay registro de citas pasadas.</p>
            </div>
            
            <div v-else class="citas-grid">
              <div v-for="cita in pastCitas" :key="cita.id" class="cita-card card past-card">
                <div class="cita-badge-row">
                  <span class="session-type-badge gray">{{ cita.type }}</span>
                  <span class="status-badge" :class="cita.status">{{ cita.status }}</span>
                </div>

                <div class="cita-info">
                  <div class="info-item">
                    <span class="material-symbols-outlined icon">child_care</span>
                    <span><strong>Hijo:</strong> {{ cita.childName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="material-symbols-outlined icon">person</span>
                    <span><strong>Profesional:</strong> {{ cita.professionalName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="material-symbols-outlined icon">calendar_today</span>
                    <span><strong>Fecha:</strong> {{ cita.date }}</span>
                  </div>
                  <div class="info-item">
                    <span class="material-symbols-outlined icon">schedule</span>
                    <span><strong>Hora:</strong> {{ cita.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Modals -->
    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header danger">
          <span class="material-symbols-outlined">warning</span>
          <h2>Confirmar Cancelación</h2>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas cancelar esta cita para <strong>{{ citaToCancel?.childName }}</strong>?</p>
          <div class="policy-warning card">
            <span class="material-symbols-outlined">info</span>
            <p><strong>Política de Cancelación:</strong> Las cancelaciones de citas se notifican inmediatamente al equipo del centro para permitir reasignar la sesión a otra familia.</p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showCancelModal = false" class="btn btn-secondary">Mantener Cita</button>
          <button @click="confirmCancel" class="btn btn-danger">Confirmar Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Reschedule Request Modal -->
    <div v-if="showRescheduleModal" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <span class="material-symbols-outlined">edit_calendar</span>
          <h2>Solicitar Reprogramación</h2>
        </div>
        <div class="modal-body">
          <p>Completa los detalles para proponer un cambio en la cita de <strong>{{ citaToReschedule?.childName }}</strong>.</p>
          
          <div v-if="rescheduleError" class="error-banner">
            {{ rescheduleError }}
          </div>

          <form @submit.prevent="confirmReschedule" class="modal-form">
            <div class="form-group">
              <label>Fecha sugerida</label>
              <input v-model="rescheduleForm.date" type="date" required />
            </div>
            <div class="form-group">
              <label>Hora sugerida</label>
              <input v-model="rescheduleForm.time" type="time" required />
            </div>
            <div class="form-group">
              <label>Motivo del cambio</label>
              <textarea 
                v-model="rescheduleForm.reason" 
                placeholder="Por ejemplo: cita médica, viaje familiar, indisposición del niño..."
                rows="3"
                required
              ></textarea>
            </div>
          </form>
        </div>
        <div class="modal-actions">
          <button @click="showRescheduleModal = false" class="btn btn-secondary">Cerrar</button>
          <button @click="confirmReschedule" class="btn btn-primary">Enviar Solicitud</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.citas-usuario-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  font-size: 2.5rem;
  color: var(--text-blue, #1e3a8a);
  background: rgba(30, 58, 138, 0.08);
  padding: 0.5rem;
  border-radius: 12px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-blue, #1e3a8a);
  margin: 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.filters-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid #f1f5f9;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-group label {
  font-weight: 600;
  color: #334155;
}

.filter-group select {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #334155;
  font-size: 0.95rem;
  outline: none;
}

.citas-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #334155;
  margin: 0;
}

.citas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.cita-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cita-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

.past-card {
  opacity: 0.85;
}

.cita-badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: space-between;
  align-items: center;
}

.session-type-badge {
  background: rgba(147, 51, 234, 0.08);
  color: var(--button-purple, #9333ea);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.session-type-badge.gray {
  background: #f1f5f9;
  color: #64748b;
}

.reschedule-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.reschedule-badge .icon {
  font-size: 1rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
}

.status-badge.completada {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-badge.programada {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.cita-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #475569;
  font-size: 0.95rem;
}

.info-item .icon {
  color: #94a3b8;
  font-size: 1.25rem;
}

.info-item.notes {
  background: #f8fafc;
  padding: 0.5rem;
  border-radius: 8px;
  border-left: 3px solid #cbd5e1;
  font-style: italic;
}

.cita-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.cancel-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

.policy-tooltip {
  display: none;
  position: absolute;
  bottom: 105%;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  width: 180px;
  text-align: center;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.cancel-wrapper:hover .policy-tooltip {
  display: block;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: background 0.2s, opacity 0.2s;
  outline: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--button-purple, #9333ea);
  color: white;
}

.btn-primary:hover {
  background: #7e22ce;
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
}

/* Past section */
.collapse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  padding: 0.5rem 0;
  outline: none;
}

.toggle-icon {
  transition: transform 0.2s;
  color: #64748b;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.empty-icon {
  font-size: 3.5rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modalEnter 0.2s ease-out;
}

@keyframes modalEnter {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header span {
  font-size: 1.75rem;
  color: var(--text-blue, #1e3a8a);
}

.modal-header.danger span {
  color: #ef4444;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-body p {
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.policy-warning {
  display: flex;
  gap: 0.75rem;
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: #b45309;
  font-size: 0.85rem;
}

.policy-warning span {
  font-size: 1.25rem;
}

.policy-warning p {
  color: #b45309;
}

.error-banner {
  background: #fef2f2;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #334155;
  font-size: 0.9rem;
}

.form-group input, .form-group textarea {
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus, .form-group textarea:focus {
  border-color: var(--button-purple, #9333ea);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
</style>
