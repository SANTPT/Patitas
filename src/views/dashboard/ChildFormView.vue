<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useChildrenStore } from '../../stores/children';
import api from '../../services/api';

const authStore = useAuthStore();
const childrenStore = useChildrenStore();
const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => !!route.params.id);
const userCentroId = computed(() => authStore.user?.centroId);

const form = ref({
  name: '',
  birthDate: '',
  diagnostico: '',
  profesionalId: ''
});

const professionals = ref([]);
const isSubmitting = ref(false);
const errorMsg = ref('');
const createdChild = ref(null);
const showSuccessModal = ref(false);

const predefinedDiagnoses = [
  'Trastorno del Espectro Autista (TEA)',
  'Retraso Generalizado del Desarrollo (RGD)',
  'TDAH (Déficit de Atención / Hiperactividad)',
  'Trastorno Específico del Lenguaje (TEL)',
  'Retraso Psicomotor',
  'Parálisis Cerebral Infantil (PCI)',
  'Síndrome de Down',
  'Otro'
];

const customDiagnosis = ref('');
const selectedDiagnosisOption = ref('');

onMounted(async () => {
  // Cargar profesionales del centro para el dropdown
  try {
    const resp = await api.get('/admin/users');
    professionals.value = resp.data.filter(
      u => u.role === 'admin_profesional' && u.centroId === userCentroId.value
    );
  } catch (err) {
    console.error('Error al cargar profesionales:', err);
  }

  // Si está en modo edición, cargar datos del niño
  if (isEditMode.value) {
    try {
      await childrenStore.fetchChildDetails(route.params.id);
      const child = childrenStore.currentChild;
      if (child) {
        form.value.name = child.name;
        form.value.birthDate = child.birthDate;
        form.value.profesionalId = child.profesionalId || '';
        
        if (predefinedDiagnoses.includes(child.diagnostico)) {
          selectedDiagnosisOption.value = child.diagnostico;
        } else {
          selectedDiagnosisOption.value = 'Otro';
          customDiagnosis.value = child.diagnostico || '';
        }
      }
    } catch (err) {
      errorMsg.value = 'No se pudo cargar el expediente del niño.';
    }
  }
});

const finalDiagnosis = computed(() => {
  if (selectedDiagnosisOption.value === 'Otro') {
    return customDiagnosis.value;
  }
  return selectedDiagnosisOption.value;
});

async function handleSubmit() {
  if (!form.value.name || !form.value.birthDate || !finalDiagnosis.value) {
    errorMsg.value = 'Por favor complete todos los campos requeridos.';
    return;
  }

  errorMsg.value = '';
  isSubmitting.value = true;

  const payload = {
    name: form.value.name,
    birthDate: form.value.birthDate,
    diagnostico: finalDiagnosis.value,
    profesionalId: form.value.profesionalId ? parseInt(form.value.profesionalId) : null,
    centroId: userCentroId.value
  };

  let res;
  if (isEditMode.value) {
    res = await childrenStore.updateChild(route.params.id, payload);
  } else {
    res = await childrenStore.createChild(payload);
  }

  isSubmitting.value = false;

  if (res.success) {
    if (isEditMode.value) {
      router.push(`/dashboard/admin-centro/ninos/${route.params.id}`);
    } else {
      createdChild.value = res.child;
      showSuccessModal.value = true;
    }
  } else {
    errorMsg.value = res.error || 'Ocurrió un error al guardar los datos.';
  }
}

function handleGoBack() {
  router.push('/dashboard/admin-centro/ninos');
}

function navigateToNewDetails() {
  if (createdChild.value) {
    router.push(`/dashboard/admin-centro/ninos/${createdChild.value.id}`);
  }
}

const copied = ref(false);
async function copyInviteCode() {
  if (!createdChild.value) return;
  try {
    await navigator.clipboard.writeText(createdChild.value.inviteCode);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {
    console.error(err);
  }
}
</script>

<template>
  <div class="child-form-container">
    <!-- Form Card -->
    <div class="form-card">
      <header class="form-header">
        <button class="back-btn" @click="handleGoBack">
          <span class="material-symbols-outlined">arrow_back</span>
          Volver a la lista
        </button>
        <h2 class="title">
          <span class="material-symbols-outlined header-icon">
            {{ isEditMode ? 'edit_note' : 'person_add' }}
          </span>
          {{ isEditMode ? 'Editar Expediente de Niño' : 'Registrar Nuevo Niño' }}
        </h2>
        <p class="subtitle">
          Complete los campos para {{ isEditMode ? 'actualizar' : 'crear' }} la ficha médica del menor y generar su código de vinculación familiar.
        </p>
      </header>

      <form @submit.prevent="handleSubmit" class="main-form">
        <!-- Error Alert -->
        <div v-if="errorMsg" class="error-alert">
          <span class="material-symbols-outlined alert-icon">error</span>
          <span>{{ errorMsg }}</span>
        </div>

        <!-- Row 1: Name and Birth Date -->
        <div class="form-row">
          <div class="form-group flex-1">
            <label for="name">Nombre Completo del Niño *</label>
            <input 
              id="name"
              v-model="form.name" 
              type="text" 
              placeholder="Ej. Sofía Delgado" 
              required
              class="form-control"
            />
          </div>

          <div class="form-group flex-1">
            <label for="birthDate">Fecha de Nacimiento *</label>
            <input 
              id="birthDate"
              v-model="form.birthDate" 
              type="date" 
              required
              class="form-control"
            />
          </div>
        </div>

        <!-- Row 2: Diagnosis -->
        <div class="form-row">
          <div class="form-group flex-1">
            <label for="diagnosisSelect">Diagnóstico Clínico *</label>
            <select 
              id="diagnosisSelect"
              v-model="selectedDiagnosisOption" 
              required
              class="form-control select-control"
            >
              <option value="" disabled>Seleccione un diagnóstico...</option>
              <option v-for="diag in predefinedDiagnoses" :key="diag" :value="diag">
                {{ diag }}
              </option>
            </select>
          </div>

          <div v-if="selectedDiagnosisOption === 'Otro'" class="form-group flex-1">
            <label for="customDiagnosis">Especifique el diagnóstico *</label>
            <input 
              id="customDiagnosis"
              v-model="customDiagnosis" 
              type="text" 
              placeholder="Escriba el diagnóstico de atención temprana..." 
              required
              class="form-control"
            />
          </div>
        </div>

        <!-- Row 3: Professional Assign (Optional at creation, required later) -->
        <div class="form-group">
          <label for="profesional">Asignar Terapeuta (Opcional)</label>
          <select 
            id="profesional"
            v-model="form.profesionalId" 
            class="form-control select-control"
          >
            <option value="">Dejar sin asignar (se puede asignar luego)</option>
            <option v-for="prof in professionals" :key="prof.id" :value="prof.id">
              {{ prof.name }}
            </option>
          </select>
          <p class="help-text">
            Solo se listan profesionales activos y vinculados a su centro local.
          </p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="handleGoBack">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            <span class="spinner-btn" v-if="isSubmitting"></span>
            <span>{{ isEditMode ? 'Guardar Cambios' : 'Registrar Niño' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="success-modal">
        <span class="material-symbols-outlined success-icon">check_circle</span>
        <h2>¡Expediente Creado con Éxito!</h2>
        <p class="modal-intro">
          Se ha generado la ficha para <strong>{{ createdChild?.name }}</strong>. Comparte este código con la familia para vincular su cuenta:
        </p>

        <div class="code-banner">
          <span class="code-label">Código de Invitación Familiar</span>
          <div class="code-row">
            <code class="code-value">{{ createdChild?.inviteCode }}</code>
            <button class="copy-btn" @click="copyInviteCode">
              <span class="material-symbols-outlined">
                {{ copied ? 'check' : 'content_copy' }}
              </span>
              {{ copied ? 'Copiado' : 'Copiar' }}
            </button>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-secondary" @click="handleGoBack">
            Ir al listado
          </button>
          <button class="btn-primary" @click="navigateToNewDetails">
            Ver Ficha Médica
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.child-form-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 1rem;
}

.form-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(26, 91, 130, 0.05);
  max-width: 45rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.form-header {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.back-btn {
  background: none;
  border: none;
  color: #7c8ba1;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  width: max-content;
  padding: 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--text-blue, #1a5b82);
}

.form-header .title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.4rem;
}

.header-icon {
  font-size: 2rem;
  color: var(--button-purple, #c58cf2);
}

.form-header .subtitle {
  font-size: 0.9rem;
  color: #7c8ba1;
  line-height: 1.4;
}

.main-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.error-alert {
  background: #fef2f2;
  color: #b91c1c;
  padding: 0.8rem 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.alert-icon {
  color: #ef4444;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.flex-1 {
  flex: 1;
  min-width: 15rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a5568;
}

.form-control {
  padding: 0.7rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
}

.form-control:focus {
  border-color: var(--button-purple, #c58cf2);
  box-shadow: 0 0 0 3px rgba(197, 140, 242, 0.15);
}

.select-control {
  cursor: pointer;
  background: white;
}

.help-text {
  font-size: 0.75rem;
  color: #a0aec0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: var(--button-purple, #c58cf2);
  color: white;
  border: none;
  padding: 0.65rem 1.8rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.25);
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background: #b273e3;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-btn {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal success */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.success-modal {
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem;
  max-width: 32rem;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleUp {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.success-icon {
  font-size: 4rem;
  color: #10b981;
}

.success-modal h2 {
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue, #1a5b82);
  font-size: 1.6rem;
  font-weight: 700;
}

.modal-intro {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.5;
}

.code-banner {
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  border-radius: 1rem;
  padding: 1.25rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.code-label {
  font-size: 0.75rem;
  color: #15803d;
  font-weight: 700;
  text-transform: uppercase;
}

.code-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.code-value {
  font-family: monospace;
  font-size: 1.6rem;
  font-weight: 800;
  color: #166534;
  letter-spacing: 1px;
}

.copy-btn {
  background: #15803d;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: #166534;
}

.copy-btn .material-symbols-outlined {
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  margin-top: 0.5rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.7rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-actions .btn-secondary {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
}

.modal-actions .btn-secondary:hover {
  background: #e5e7eb;
}

.modal-actions .btn-primary {
  background: var(--button-purple, #c58cf2);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.25);
}

.modal-actions .btn-primary:hover {
  background: #b273e3;
}
</style>
