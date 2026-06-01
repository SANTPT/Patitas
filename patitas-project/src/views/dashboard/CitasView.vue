<template>
  <div class="dash-view">
    <div class="view-header">
      <div class="header-row">
        <div>
          <h1><span class="material-symbols-outlined">calendar_month</span> Gestión de Citas</h1>
          <p>Agenda y administra las citas terapéuticas del centro.</p>
        </div>
        <button class="btn-primary" @click="openCreate">
          <span class="material-symbols-outlined">add</span> Nueva cita
        </button>
      </div>
    </div>

    <!-- Rescheduling Request Alert Banner -->
    <div v-if="pendingReschedules.length > 0" class="reschedule-alert-card">
      <div class="alert-header">
        <span class="material-symbols-outlined warning-icon">pending_actions</span>
        <h3>Solicitudes de reprogramación pendientes ({{ pendingReschedules.length }})</h3>
      </div>
      <div class="alert-list">
        <div v-for="c in pendingReschedules" :key="c.id" class="alert-item">
          <div class="alert-info">
            <p><strong>{{ c.childName }}</strong> con <strong>{{ c.professionalName }}</strong></p>
            <p class="prop-date">Propuesta: <span>{{ c.newDate }}</span> a las <span>{{ c.newTime }}</span></p>
            <p class="prop-reason">Motivo: "{{ c.rescheduleReason }}"</p>
          </div>
          <div class="alert-actions">
            <button class="btn btn-success btn-sm" @click="handleReschedule(c, true)">Aceptar</button>
            <button class="btn btn-secondary btn-sm" @click="handleReschedule(c, false)">Rechazar</button>
          </div>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <select v-model="filterStatus">
        <option value="">Todos los estados</option>
        <option value="programada">Programadas</option>
        <option value="completada">Completadas</option>
        <option value="cancelada">Canceladas</option>
      </select>
    </div>

    <div class="citas-list">
      <div v-if="citasStore.isLoading" class="loading-state">
        <p>Cargando citas del centro...</p>
      </div>

      <template v-else>
        <div class="cita-card" v-for="c in filtered" :key="c.id">
          <div class="cita-date">
            <span class="cita-day">{{ getDay(c.date) }}</span>
            <span class="cita-month">{{ getMonth(c.date) }}</span>
            <span class="cita-time">{{ c.time }}</span>
          </div>
          <div class="cita-info">
            <h3>{{ c.childName }} <span class="with-text">con</span> {{ c.professionalName }}</h3>
            <p><span class="material-symbols-outlined">medical_services</span> {{ c.type }}</p>
            <p><span class="material-symbols-outlined">schedule</span> {{ c.duration }} min</p>
            <p v-if="c.notes" class="cita-notes-text"><em>Nota: "{{ c.notes }}"</em></p>
          </div>
          <div class="cita-actions">
            <span class="status-chip" :class="c.status">{{ statusLabel(c.status) }}</span>
            <button v-if="c.status==='programada'" class="btn-icon" title="Editar" @click="openEdit(c)">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button v-if="c.status==='programada'" class="btn-icon danger" title="Cancelar" @click="cancelCita(c.id)">
              <span class="material-symbols-outlined">cancel</span>
            </button>
          </div>
        </div>

        <div v-if="filtered.length === 0" class="empty-state">
          <span class="material-symbols-outlined">event_busy</span>
          <p>No hay citas con ese filtro.</p>
        </div>
      </template>
    </div>

    <!-- Appointment Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm=false">
      <div class="modal-box">
        <h2>{{ isEditing ? 'Modificar Cita' : 'Nueva Cita' }}</h2>
        <div class="form-fields">
          <label>Niño</label>
          <select v-model="form.childId" required>
            <option value="">Seleccionar niño...</option>
            <option v-for="child in childrenStore.children" :key="child.id" :value="child.id">
              {{ child.name }}
            </option>
          </select>

          <label>Profesional</label>
          <select v-model="form.professionalId" required>
            <option value="">Seleccionar profesional...</option>
            <option v-for="p in professionals" :key="p.id" :value="p.id">
              {{ p.name }} ({{ p.specialty || 'General' }})
            </option>
          </select>

          <label>Fecha</label><input v-model="form.date" type="date" required />
          <label>Hora</label><input v-model="form.time" type="time" required />
          <label>Tipo de terapia</label><input v-model="form.type" placeholder="Ej: Logopedia" required />
          <label>Duración (min)</label><input v-model="form.duration" type="number" placeholder="45" required />
          
          <label style="grid-column: span 2">Notas adicionales</label>
          <textarea v-model="form.notes" style="grid-column: span 2; min-height: 4rem; padding: 0.6rem; border-radius: 0.75rem; border: 1.5px solid rgba(26,91,130,.15); outline: none" placeholder="Indicaciones específicas..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" @click="showForm=false">Cancelar</button>
          <button class="btn-primary" @click="saveCita">Guardar cita</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useCitasStore } from '../../stores/citas';
import { useChildrenStore } from '../../stores/children';
import { useAdminsStore } from '../../stores/admins';

const authStore = useAuthStore();
const citasStore = useCitasStore();
const childrenStore = useChildrenStore();
const adminsStore = useAdminsStore();

const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const filterStatus = ref('');

const form = ref({
  childId: '',
  professionalId: '',
  date: '',
  time: '',
  type: '',
  duration: 45,
  notes: ''
});

onMounted(async () => {
  if (authStore.user && authStore.user.centroId) {
    await citasStore.fetchCitas({ centroId: authStore.user.centroId });
    await childrenStore.fetchChildren({ centroId: authStore.user.centroId });
    await adminsStore.fetchAdmins();
  }
});

const professionals = computed(() => {
  if (!authStore.user || !authStore.user.centroId) return [];
  return adminsStore.admins.filter(a => 
    a.role === 'admin_profesional' && a.centroId === authStore.user.centroId
  );
});

const pendingReschedules = computed(() => {
  return citasStore.citas.filter(c => c.reprogramacionSolicitada);
});

const filtered = computed(() => {
  let list = citasStore.citas;
  if (filterStatus.value) {
    list = list.filter(c => c.status === filterStatus.value);
  }
  return list;
});

function getDay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts[2] || '';
}

function getMonth(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleString('es', { month: 'short' });
}

function statusLabel(s) {
  return { programada: 'Programada', completada: 'Completada', cancelada: 'Cancelada' }[s] || s;
}

function openCreate() {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    childId: '',
    professionalId: '',
    date: '',
    time: '',
    type: '',
    duration: 45,
    notes: ''
  };
  showForm.value = true;
}

function openEdit(cita) {
  isEditing.value = true;
  editingId.value = cita.id;
  form.value = {
    childId: cita.childId || '',
    professionalId: cita.professionalId || '',
    date: cita.date || '',
    time: cita.time || '',
    type: cita.type || '',
    duration: cita.duration || 45,
    notes: cita.notes || ''
  };
  showForm.value = true;
}

async function saveCita() {
  const child = childrenStore.children.find(c => c.id === parseInt(form.value.childId));
  const prof = professionals.value.find(p => p.id === parseInt(form.value.professionalId));

  if (!child || !prof) {
    alert('Por favor selecciona un niño y un profesional.');
    return;
  }

  const payload = {
    childId: child.id,
    childName: child.name,
    professionalId: prof.id,
    professionalName: prof.name,
    date: form.value.date,
    time: form.value.time,
    type: form.value.type,
    duration: parseInt(form.value.duration) || 45,
    notes: form.value.notes || '',
    centroId: authStore.user.centroId,
    status: 'programada'
  };

  if (isEditing.value) {
    const res = await citasStore.updateCita(editingId.value, payload);
    if (res.success) {
      showForm.value = false;
    } else {
      alert(res.error || 'Error al actualizar cita.');
    }
  } else {
    const res = await citasStore.createCita(payload);
    if (res.success) {
      showForm.value = false;
    } else {
      alert(res.error || 'Error al crear cita.');
    }
  }
}

async function cancelCita(id) {
  if (confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
    const res = await citasStore.deleteCita(id);
    if (!res.success) {
      alert(res.error || 'Error al cancelar la cita.');
    }
  }
}

async function handleReschedule(cita, approve) {
  const actionText = approve ? 'aceptar' : 'rechazar';
  if (confirm(`¿Estás seguro de que deseas ${actionText} la solicitud de reprogramación?`)) {
    const res = await citasStore.respondReprogramacion(cita.id, approve);
    if (!res.success) {
      alert(res.error || 'Error al responder a la reprogramación.');
    }
  }
}
</script>
<style scoped>
.dash-view{display:flex;flex-direction:column;gap:1.25rem}
.view-header h1{font-family:'Fredoka',sans-serif;font-size:1.8rem;font-weight:700;color:#1a5b82;display:flex;align-items:center;gap:.5rem;margin-bottom:.3rem}
.view-header .material-symbols-outlined{font-size:2rem;color:#c58cf2}
.view-header p{color:#7c8ba1;font-size:.95rem}
.header-row{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem}
.filter-bar select{font-family:'Fredoka',sans-serif;font-size:.9rem;padding:.5rem 1rem;border-radius:.75rem;border:1.5px solid rgba(26,91,130,.15);background:white;color:#1a5b82;outline:none}
.citas-list{display:flex;flex-direction:column;gap:.75rem}
.cita-card{background:white;border-radius:1.1rem;padding:1.1rem 1.25rem;display:flex;align-items:center;gap:1.25rem;box-shadow:0 4px 16px rgba(26,91,130,.04);border:1.5px solid rgba(26,91,130,.06)}
.cita-date{display:flex;flex-direction:column;align-items:center;min-width:3rem;text-align:center}
.cita-day{font-family:'Fredoka',sans-serif;font-size:1.6rem;font-weight:700;color:#1a5b82;line-height:1}
.cita-month{font-size:.7rem;text-transform:uppercase;color:#94a3b8;font-weight:700}
.cita-time{font-size:.8rem;font-weight:600;color:#c58cf2;margin-top:.2rem}
.cita-info{flex:1}
.cita-info h3{font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;color:#1a5b82;margin:0 0 .3rem}
.with-text{font-weight:400;color:#94a3b8}
.cita-info p{font-size:.8rem;color:#7c8ba1;margin:.1rem 0;display:flex;align-items:center;gap:.3rem}
.cita-info .material-symbols-outlined{font-size:.9rem;color:#c58cf2}
.cita-notes-text {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}
.cita-actions{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;justify-content:flex-end}
.status-chip{display:inline-flex;padding:.2rem .65rem;border-radius:5rem;font-size:.72rem;font-weight:700}
.programada{background:rgba(59,130,246,.1);color:#1d4ed8}
.completada{background:rgba(52,211,153,.1);color:#059669}
.cancelada{background:rgba(148,163,184,.1);color:#64748b}
.btn-icon{background:none;border:1px solid rgba(26,91,130,.12);border-radius:.5rem;padding:.3rem;cursor:pointer;display:flex;align-items:center;color:#1a5b82;transition:all .2s}
.btn-icon:hover{background:rgba(197,140,242,.1);border-color:#c58cf2}
.btn-icon.danger:hover{background:rgba(229,62,62,.08);border-color:#e53e3e;color:#e53e3e}
.btn-icon .material-symbols-outlined{font-size:.95rem}
.btn-primary{display:inline-flex;align-items:center;gap:.4rem;background:#c58cf2;color:white;border:none;border-radius:5rem;padding:.65rem 1.25rem;font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer}
.btn-secondary{display:inline-flex;align-items:center;gap:.4rem;background:white;color:#1a5b82;border:1.5px solid rgba(26,91,130,.15);border-radius:5rem;padding:.65rem 1.25rem;font-family:'Fredoka',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer}
.empty-state{display:flex;flex-direction:column;align-items:center;gap:.75rem;padding:3rem;background:white;border-radius:1.1rem;border:1.5px solid rgba(26,91,130,.06);color:#94a3b8;text-align:center}
.empty-state .material-symbols-outlined{font-size:3rem}
.modal-overlay{position:fixed;inset:0;background:rgba(26,91,130,.45);backdrop-filter:blur(4px);z-index:999;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal-box{background:white;border-radius:1.5rem;padding:2rem;width:100%;max-width:26rem;box-shadow:0 20px 60px rgba(26,91,130,.18);max-height:90vh;overflow-y:auto}
.modal-box h2{font-family:'Fredoka',sans-serif;font-size:1.35rem;font-weight:700;color:#1a5b82;margin-bottom:1.25rem}
.form-fields{display:grid;grid-template-columns:1fr 1fr;gap:.55rem .85rem;margin-bottom:1.5rem}
.form-fields label{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;align-self:end}
.form-fields input, .form-fields select{font-family:'Fredoka',sans-serif;font-size:.9rem;padding:.6rem 1rem;border-radius:.75rem;border:1.5px solid rgba(26,91,130,.15);background:#fcfaff;color:#1a5b82;outline:none}
.form-fields input:focus, .form-fields select:focus{border-color:#c58cf2}
.modal-actions{display:flex;gap:.75rem;justify-content:flex-end}

/* Reschedule styles */
.reschedule-alert-card {
  background: #fffbeb;
  border: 1.5px solid #fef3c7;
  border-radius: 1.1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.04);
}
.alert-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.alert-header h3 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #b45309;
  margin: 0;
}
.warning-icon {
  color: #f59e0b;
}
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #fde68a;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.alert-info p {
  margin: 0.15rem 0;
  font-size: 0.88rem;
  color: #1a5b82;
}
.prop-date span {
  font-weight: 700;
  color: #b45309;
}
.prop-reason {
  font-style: italic;
  color: #6b7280;
}
.alert-actions {
  display: flex;
  gap: 0.5rem;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 5rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-success {
  background: #10b981;
  color: white;
}
.btn-success:hover {
  background: #059669;
}
.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}
.btn-secondary:hover {
  background: #d1d5db;
}
.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}
</style>
