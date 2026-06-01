<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useChildrenStore } from '../../stores/children';
import { useCitasStore } from '../../stores/citas';
import api from '../../services/api';

const authStore = useAuthStore();
const childrenStore = useChildrenStore();
const citasStore = useCitasStore();
const route = useRoute();
const router = useRouter();

const userRole = computed(() => authStore.user?.role);
const userCentroId = computed(() => authStore.user?.centroId);

const child = computed(() => childrenStore.currentChild);
const sessions = computed(() => childrenStore.sessions);

// Modals toggles
const showAssignModal = ref(false);
const showSessionModal = ref(false);
const showProgressModal = ref(false);
const showAgendarModal = ref(false);

// Professional List for assignment
const professionals = ref([]);
const selectedProfId = ref('');
const isAssigning = ref(false);

// Evaluation selection for Radar History
const selectedEvalIndex = ref(-1);

// New Session Form State
const sessionForm = ref({
  fecha: new Date().toISOString().split('T')[0],
  duracion: 45,
  tipo: 'Terapia de Lenguaje',
  observaciones: '',
  objetivos: []
});
const newObjectiveName = ref('');
const isSavingSession = ref(false);

// New Progress Form State
const progressForm = ref({
  comunicacion: 5,
  social: 5,
  cognitivo: 5,
  motor: 5,
  autonomia: 5
});
const isUpdatingProgress = ref(false);

// Agenda Form State
const agendaForm = ref({
  date: new Date().toISOString().split('T')[0],
  time: '10:00',
  type: 'Logopedia',
  duration: 45,
  notes: '',
  professionalId: ''
});
const isAgendando = ref(false);

onMounted(async () => {
  await loadChildData();

  if (userRole.value === 'admin_centro' || userRole.value === 'admin_profesional') {
    // Cargar profesionales para asignar/agendar
    try {
      const resp = await api.get('/admin/users');
      professionals.value = resp.data.filter(
        u => u.role === 'admin_profesional' && u.centroId === userCentroId.value
      );
    } catch (err) {
      console.error(err);
    }
  }
});

async function loadChildData() {
  await childrenStore.fetchChildDetails(route.params.id);
  if (child.value) {
    selectedProfId.value = child.value.profesionalId || '';
    
    // Set initial values for progress sliders
    progressForm.value = {
      comunicacion: child.value.progress?.comunicacion || 5,
      social: child.value.progress?.social || 5,
      cognitivo: child.value.progress?.cognitivo || 5,
      motor: child.value.progress?.motor || 5,
      autonomia: child.value.progress?.autonomia || 5
    };
  }
}

// Age Helper
function getAge(birthDateString) {
  if (!birthDateString) return '';
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let ageYears = today.getFullYear() - birthDate.getFullYear();
  let ageMonths = today.getMonth() - birthDate.getMonth();
  if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birthDate.getDate())) {
    ageYears--;
    ageMonths += 12;
  }
  if (ageYears === 0) {
    return ageMonths === 1 ? '1 mes' : `${ageMonths} meses`;
  }
  return ageYears === 1 ? '1 año' : `${ageYears} años`;
}

// Format date helper
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Format short date helper
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Find professional name
const assignedProfessionalName = computed(() => {
  if (!child.value?.profesionalId) return 'Ninguno';
  const prof = professionals.value.find(p => p.id === child.value.profesionalId);
  return prof ? prof.name : 'Profesional de Apoyo';
});

// Radar SVG Computes
const dimensions = [
  { name: 'Comunicación', key: 'comunicacion' },
  { name: 'Social', key: 'social' },
  { name: 'Cognitivo', key: 'cognitivo' },
  { name: 'Motor', key: 'motor' },
  { name: 'Autonomía', key: 'autonomia' }
];

const center = 150;
const radius = 100;

function getCoords(index, value) {
  const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
  const distance = (value / 10) * radius;
  const x = center + distance * Math.cos(angle);
  const y = center + distance * Math.sin(angle);
  return { x, y };
}

const currentEvaluationValues = computed(() => {
  if (selectedEvalIndex.value !== -1 && child.value?.progressHistory) {
    return child.value.progressHistory[selectedEvalIndex.value];
  }
  return child.value?.progress || {
    comunicacion: 5,
    social: 5,
    cognitivo: 5,
    motor: 5,
    autonomia: 5
  };
});

const dataPoints = computed(() => {
  const values = currentEvaluationValues.value;
  return dimensions.map((dim, i) => {
    const val = values[dim.key] !== undefined ? values[dim.key] : 5;
    const { x, y } = getCoords(i, val);
    return `${x},${y}`;
  }).join(' ');
});

const gridPolygons = computed(() => {
  return [2, 4, 6, 8, 10].map(level => {
    return dimensions.map((dim, i) => {
      const { x, y } = getCoords(i, level);
      return `${x},${y}`;
    }).join(' ');
  });
});

const gridAxes = computed(() => {
  return dimensions.map((dim, i) => {
    const start = { x: center, y: center };
    const end = getCoords(i, 10);
    return { start, end };
  });
});

function getLabelCoords(index) {
  const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
  const distance = radius + 25;
  const x = center + distance * Math.cos(angle);
  const y = center + distance * Math.sin(angle) + 4;
  return { x, y };
}

function getTextAnchor(x) {
  if (Math.abs(x - center) < 10) return 'middle';
  return x < center ? 'end' : 'start';
}

// Copy Code Helper
const copied = ref(false);
async function copyInviteCode() {
  if (!child.value) return;
  try {
    await navigator.clipboard.writeText(child.value.inviteCode);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {
    console.error(err);
  }
}

// Breadcrumb back path
function handleGoBack() {
  if (userRole.value === 'admin_centro') {
    router.push('/dashboard/admin-centro/ninos');
  } else if (userRole.value === 'admin_profesional') {
    router.push('/dashboard/admin-profesional/mis-ninos');
  } else {
    router.push('/dashboard/usuario/mis-hijos');
  }
}

// Edit Profile
function goToEditProfile() {
  router.push(`/dashboard/admin-centro/ninos/${child.value.id}/editar`);
}

// Professional assignment submit
async function handleAssign() {
  isAssigning.value = true;
  const res = await childrenStore.assignProfessional(child.value.id, selectedProfId.value ? parseInt(selectedProfId.value) : null);
  isAssigning.value = false;
  if (res.success) {
    showAssignModal.value = false;
    await loadChildData();
  }
}

// Session form objectives
function addObjective() {
  if (!newObjectiveName.value.trim()) return;
  sessionForm.value.objetivos.push({
    nombre: newObjectiveName.value.trim(),
    score: 3
  });
  newObjectiveName.value = '';
}

function removeObjective(idx) {
  sessionForm.value.objetivos.splice(idx, 1);
}

// Prepopulate default objectives based on Therapy Type
function handleTherapyTypeChange() {
  const type = sessionForm.value.tipo;
  if (type === 'Terapia de Lenguaje') {
    sessionForm.value.objetivos = [
      { nombre: 'Contacto visual prolongado', score: 3 },
      { nombre: 'Articulación de fonemas', score: 3 }
    ];
  } else if (type === 'Terapia Ocupacional') {
    sessionForm.value.objetivos = [
      { nombre: 'Fuerza de pinza digital', score: 3 },
      { nombre: 'Coordinación ojo-mano', score: 3 }
    ];
  } else if (type === 'Terapia de Psicomotricidad') {
    sessionForm.value.objetivos = [
      { nombre: 'Salto y equilibrio', score: 3 },
      { nombre: 'Seguimiento de trayectorias', score: 3 }
    ];
  } else {
    sessionForm.value.objetivos = [];
  }
}

// Open Session Modal with defaults
function openSessionModal() {
  sessionForm.value = {
    fecha: new Date().toISOString().split('T')[0],
    duracion: 45,
    tipo: 'Terapia de Lenguaje',
    observaciones: '',
    objetivos: [
      { nombre: 'Contacto visual prolongado', score: 3 },
      { nombre: 'Articulación de fonemas', score: 3 }
    ]
  };
  showSessionModal.value = true;
}

// Submit Session
async function handleSaveSession() {
  if (!sessionForm.value.observaciones.trim()) return;
  isSavingSession.value = true;
  
  const payload = {
    ...sessionForm.value,
    profesionalId: authStore.user.id,
    profesionalName: authStore.user.name
  };

  const res = await childrenStore.saveSession(child.value.id, payload);
  isSavingSession.value = false;
  
  if (res.success) {
    showSessionModal.value = false;
  }
}

// Submit Progress Radar Update
async function handleSaveProgress() {
  isUpdatingProgress.value = true;
  const res = await childrenStore.updateProgress(child.value.id, progressForm.value);
  isUpdatingProgress.value = false;
  if (res.success) {
    showProgressModal.value = false;
    selectedEvalIndex.value = -1; // reset history selector to current values
    await loadChildData();
  }
}

function openAgendarCitaModal() {
  agendaForm.value = {
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: child.value?.diagnostico?.includes('Lenguaje') ? 'Terapia de Lenguaje' : 'Terapia de Psicomotricidad',
    duration: 45,
    notes: '',
    professionalId: child.value?.profesionalId || ''
  };
  showAgendarModal.value = true;
}

async function handleAgendarCita() {
  if (!agendaForm.value.date || !agendaForm.value.time) return;
  isAgendando.value = true;

  const prof = professionals.value.find(p => p.id === parseInt(agendaForm.value.professionalId));
  const payload = {
    childId: child.value.id,
    childName: child.value.name,
    professionalId: prof ? prof.id : null,
    professionalName: prof ? prof.name : 'Profesional de Apoyo',
    date: agendaForm.value.date,
    time: agendaForm.value.time,
    type: agendaForm.value.type,
    duration: parseInt(agendaForm.value.duration) || 45,
    notes: agendaForm.value.notes || '',
    centroId: authStore.user.centroId || child.value.centroId,
    status: 'programada'
  };

  const res = await citasStore.createCita(payload);
  isAgendando.value = false;
  if (res.success) {
    showAgendarModal.value = false;
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Cita agendada con éxito.', type: 'success' }
    }));
  } else {
    alert(res.error || 'Error al agendar la cita.');
  }
}
</script>

<template>
  <div class="child-detail-container" v-if="child">
    <!-- Breadcrumbs -->
    <header class="detail-header">
      <button class="back-btn" @click="handleGoBack">
        <span class="material-symbols-outlined">arrow_back</span>
        Volver a la lista
      </button>
      
      <div class="header-actions" v-if="userRole === 'admin_centro'">
        <button class="btn-secondary" @click="goToEditProfile">
          <span class="material-symbols-outlined">edit</span>
          Editar Perfil
        </button>
      </div>
    </header>

    <!-- Main Grid -->
    <div class="main-grid">
      <!-- Left Column: Child Info & Therapist -->
      <section class="left-col">
        <!-- Profile Card -->
        <article class="detail-card profile-card">
          <div class="avatar-row">
            <div class="child-avatar" v-html="child.avatar || ''"></div>
            <div class="child-names">
              <h2 class="name">{{ child.name }}</h2>
              <span class="diagnostico-tag">{{ child.diagnostico }}</span>
            </div>
          </div>

          <div class="meta-list">
            <div class="meta-item">
              <span class="material-symbols-outlined icon">calendar_today</span>
              <div class="text">
                <span class="label">Fecha de Nacimiento</span>
                <span class="val">{{ formatDate(child.birthDate) }}</span>
              </div>
            </div>

            <div class="meta-item">
              <span class="material-symbols-outlined icon">schedule</span>
              <div class="text">
                <span class="label">Edad Actual</span>
                <span class="val">{{ getAge(child.birthDate) }}</span>
              </div>
            </div>

            <div class="meta-item">
              <span class="material-symbols-outlined icon">diversity_1</span>
              <div class="text">
                <span class="label">Terapeuta Asignado</span>
                <span class="val">{{ assignedProfessionalName }}</span>
              </div>
              <button 
                v-if="userRole === 'admin_centro'" 
                class="meta-action-btn"
                @click="showAssignModal = true"
              >
                Asignar
              </button>
            </div>
          </div>
        </article>

        <!-- Parent Invite Code Box -->
        <article class="detail-card code-card" v-if="userRole !== 'user'">
          <h3 class="card-title">Vinculación Familiar</h3>
          <p class="card-desc">Comparte este código único con el tutor para que pueda ver el progreso del menor.</p>
          <div class="code-box">
            <code class="code-value">{{ child.inviteCode }}</code>
            <button class="copy-btn" @click="copyInviteCode">
              <span class="material-symbols-outlined">
                {{ copied ? 'check' : 'content_copy' }}
              </span>
              {{ copied ? 'Copiado' : 'Copiar' }}
            </button>
          </div>
        </article>
      </section>

      <!-- Right Column: Radar Chart -->
      <section class="right-col">
        <article class="detail-card radar-card">
          <div class="radar-header">
            <h3 class="card-title">Avance del Desarrollo</h3>
            
            <button 
              v-if="userRole !== 'user'"
              class="btn-radar-update"
              @click="showProgressModal = true"
            >
              <span class="material-symbols-outlined">trending_up</span>
              Actualizar Avance
            </button>
          </div>

          <!-- History Selector -->
          <div class="history-selector-wrapper" v-if="child.progressHistory && child.progressHistory.length > 0">
            <label for="historyEval">Historial de Valoraciones:</label>
            <select id="historyEval" v-model="selectedEvalIndex" class="history-select">
              <option :value="-1">Valoración Actual (Más reciente)</option>
              <option 
                v-for="(hist, idx) in child.progressHistory" 
                :key="idx" 
                :value="idx"
              >
                Evaluación: {{ formatShortDate(hist.date) }}
              </option>
            </select>
          </div>

          <!-- Radar SVG Plot -->
          <div class="radar-chart-wrapper">
            <svg viewBox="0 0 300 300" class="radar-svg">
              <!-- Grid circles/pentagons -->
              <polygon 
                v-for="(polyPoints, idx) in gridPolygons" 
                :key="idx" 
                :points="polyPoints" 
                class="grid-line"
              />
              
              <!-- Grid ticks labels -->
              <text :x="center" :y="center - 20" class="grid-tick">2</text>
              <text :x="center" :y="center - 40" class="grid-tick">4</text>
              <text :x="center" :y="center - 60" class="grid-tick">6</text>
              <text :x="center" :y="center - 80" class="grid-tick">8</text>
              <text :x="center" :y="center - 100" class="grid-tick">10</text>

              <!-- Grid axes -->
              <line 
                v-for="(axis, idx) in gridAxes" 
                :key="idx" 
                :x1="axis.start.x" 
                :y1="axis.start.y" 
                :x2="axis.end.x" 
                :y2="axis.end.y" 
                class="axis-line"
              />

              <!-- Plot Polygon -->
              <polygon :points="dataPoints" class="data-polygon" />

              <!-- Vertex dots -->
              <circle 
                v-for="(dim, idx) in dimensions" 
                :key="idx"
                :cx="getCoords(idx, currentEvaluationValues[dim.key] !== undefined ? currentEvaluationValues[dim.key] : 5).x"
                :cy="getCoords(idx, currentEvaluationValues[dim.key] !== undefined ? currentEvaluationValues[dim.key] : 5).y"
                r="4"
                class="vertex-dot"
              />

              <!-- Outer Labels -->
              <text 
                v-for="(dim, idx) in dimensions" 
                :key="'lbl-' + idx"
                :x="getLabelCoords(idx).x"
                :y="getLabelCoords(idx).y"
                :text-anchor="getTextAnchor(getLabelCoords(idx).x)"
                class="radar-label"
              >
                {{ dim.name }} ({{ currentEvaluationValues[dim.key] !== undefined ? currentEvaluationValues[dim.key] : 5 }})
              </text>
            </svg>
          </div>
        </article>
      </section>
    </div>

    <!-- Sessions Section -->
    <section class="sessions-section">
      <div class="sessions-header">
        <h3 class="section-title">Historial de Sesiones Terapéuticas</h3>
        <div v-if="userRole !== 'user'" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button 
            class="btn-primary" 
            @click="openSessionModal"
          >
            <span class="material-symbols-outlined">add</span>
            Registrar Sesión
          </button>
          <button 
            class="btn-secondary" 
            @click="openAgendarCitaModal"
          >
            <span class="material-symbols-outlined">calendar_today</span>
            Agendar Cita
          </button>
        </div>
      </div>

      <div v-if="!sessions || sessions.length === 0" class="no-sessions-card">
        <span class="material-symbols-outlined card-icon">event_busy</span>
        <h4>No hay sesiones registradas</h4>
        <p>Aún no se ha registrado ninguna intervención en la bitácora de este niño.</p>
      </div>

      <div v-else class="sessions-timeline">
        <div 
          v-for="session in sessions" 
          :key="session.id" 
          class="session-log-card"
        >
          <div class="session-card-header">
            <div class="session-type-row">
              <span class="material-symbols-outlined therapy-icon">medical_services</span>
              <div>
                <h4 class="session-type">{{ session.tipo }}</h4>
                <p class="session-meta">
                  <span>{{ formatDate(session.fecha) }}</span> • 
                  <span>{{ session.duracion }} minutos</span>
                </p>
              </div>
            </div>
            
            <div class="session-author-badge">
              <span class="material-symbols-outlined">person</span>
              <span>Por: {{ session.profesionalName }}</span>
            </div>
          </div>

          <div class="session-card-body">
            <!-- Objectives scales -->
            <div class="session-objectives-box">
              <span class="objectives-title">Objetivos Trabajados:</span>
              <div class="objectives-list">
                <div 
                  v-for="(obj, oIdx) in session.objetivos" 
                  :key="oIdx" 
                  class="objective-item"
                >
                  <span class="obj-name">{{ obj.nombre }}</span>
                  <div class="obj-score">
                    <span 
                      v-for="star in 5" 
                      :key="star" 
                      class="material-symbols-outlined star-icon"
                      :class="{ active: star <= obj.score }"
                    >
                      circle
                    </span>
                    <span class="score-num">{{ obj.score }}/5</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Observations -->
            <div class="session-observations">
              <span class="observations-title">Observaciones Clínicas:</span>
              <p class="observations-text">{{ session.observaciones }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal: Asignar Profesional -->
    <div v-if="showAssignModal" class="modal-overlay">
      <div class="form-modal">
        <h3 class="modal-title">Asignar Terapeuta</h3>
        <p class="modal-desc">Seleccione el profesional de apoyo encargado de guiar las sesiones del niño.</p>

        <form @submit.prevent="handleAssign" class="modal-form-content">
          <div class="form-group">
            <label for="profSelect">Profesionales Activos:</label>
            <select 
              id="profSelect"
              v-model="selectedProfId" 
              class="form-control"
              required
            >
              <option value="">Dejar sin asignar</option>
              <option v-for="prof in professionals" :key="prof.id" :value="prof.id">
                {{ prof.name }}
              </option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showAssignModal = false">
              Cancelar
            </button>
            <button type="submit" class="btn-submit" :disabled="isAssigning">
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Registrar Sesión -->
    <div v-if="showSessionModal" class="modal-overlay">
      <div class="form-modal wide-modal">
        <h3 class="modal-title">Registrar Nueva Sesión de Terapia</h3>
        
        <form @submit.prevent="handleSaveSession" class="modal-form-content">
          <!-- Row 1: Date & Duration -->
          <div class="modal-form-row">
            <div class="form-group flex-1">
              <label for="sessFecha">Fecha de Sesión *</label>
              <input 
                id="sessFecha"
                type="date" 
                v-model="sessionForm.fecha" 
                required 
                class="form-control"
              />
            </div>

            <div class="form-group flex-1">
              <label for="sessDur">Duración (Minutos) *</label>
              <input 
                id="sessDur"
                type="number" 
                v-model="sessionForm.duracion" 
                required 
                min="5" 
                max="180" 
                class="form-control"
              />
            </div>
          </div>

          <!-- Row 2: Therapy Type -->
          <div class="form-group">
            <label for="sessTipo">Tipo de Terapia *</label>
            <select 
              id="sessTipo"
              v-model="sessionForm.tipo" 
              @change="handleTherapyTypeChange"
              required 
              class="form-control"
            >
              <option value="Terapia de Lenguaje">Terapia de Lenguaje / Fonoaudiología</option>
              <option value="Terapia Ocupacional">Terapia Ocupacional</option>
              <option value="Terapia de Psicomotricidad">Terapia de Psicomotricidad</option>
              <option value="Evaluación Diagnóstica">Evaluación Diagnóstica</option>
              <option value="Consulta General">Consulta General</option>
            </select>
          </div>

          <!-- Row 3: Objectives Evaluation -->
          <div class="objectives-creation-box">
            <span class="creation-label">Evaluación de Objetivos en la Sesión</span>
            
            <div class="objectives-creator-row">
              <input 
                type="text" 
                v-model="newObjectiveName" 
                placeholder="Añadir objetivo personalizado..." 
                class="form-control flex-grow"
              />
              <button type="button" class="btn-secondary add-obj-btn" @click="addObjective">
                Añadir
              </button>
            </div>

            <div class="creator-list" v-if="sessionForm.objetivos.length > 0">
              <div 
                v-for="(obj, idx) in sessionForm.objetivos" 
                :key="idx" 
                class="creator-obj-row"
              >
                <span class="obj-name">{{ obj.nombre }}</span>
                <div class="score-input-wrapper">
                  <select v-model="obj.score" class="form-control score-select">
                    <option :value="1">1 - Insuficiente</option>
                    <option :value="2">2 - En proceso bajo</option>
                    <option :value="3">3 - Logrado regular</option>
                    <option :value="4">4 - Progreso óptimo</option>
                    <option :value="5">5 - Sobresaliente</option>
                  </select>
                  <button 
                    type="button" 
                    class="remove-obj-btn"
                    @click="removeObjective(idx)"
                  >
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Row 4: Observations -->
          <div class="form-group">
            <label for="sessObs">Observaciones Clínicas / Bitácora de Avance *</label>
            <textarea 
              id="sessObs"
              v-model="sessionForm.observaciones" 
              placeholder="Describa el comportamiento, respuestas y estado general del menor..." 
              required 
              rows="4" 
              class="form-control textarea-control"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showSessionModal = false">
              Cancelar
            </button>
            <button type="submit" class="btn-submit" :disabled="isSavingSession">
              <span>Guardar Sesión</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Actualizar Avance (Radar 5D) -->
    <div v-if="showProgressModal" class="modal-overlay">
      <div class="form-modal">
        <h3 class="modal-title">Actualizar Escala de Desarrollo</h3>
        <p class="modal-desc">Evalúe el progreso del niño en una escala de 0 a 10 en cada dimensión.</p>

        <form @submit.prevent="handleSaveProgress" class="modal-form-content">
          <div class="sliders-list">
            <div 
              v-for="dim in dimensions" 
              :key="dim.key" 
              class="slider-group"
            >
              <div class="slider-labels">
                <span class="dim-name">{{ dim.name }}</span>
                <span class="dim-val">{{ progressForm[dim.key] }}/10</span>
              </div>
              <input 
                type="range" 
                v-model="progressForm[dim.key]" 
                min="0" 
                max="10" 
                step="1"
                class="slider-input"
              />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showProgressModal = false">
              Cancelar
            </button>
            <button type="submit" class="btn-submit" :disabled="isUpdatingProgress">
              <span>Actualizar Radar</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Agendar Nueva Cita -->
    <div v-if="showAgendarModal" class="modal-overlay">
      <div class="form-modal">
        <h3 class="modal-title">Agendar Nueva Cita</h3>
        <p class="modal-desc">Asigne una fecha, hora y terapeuta para la próxima sesión.</p>

        <form @submit.prevent="handleAgendarCita" class="modal-form-content">
          <div class="form-group">
            <label for="agendaFecha">Fecha *</label>
            <input id="agendaFecha" type="date" v-model="agendaForm.date" required class="form-control" />
          </div>

          <div class="form-group">
            <label for="agendaHora">Hora *</label>
            <input id="agendaHora" type="time" v-model="agendaForm.time" required class="form-control" />
          </div>

          <div class="form-group">
            <label for="agendaTipo">Tipo de Terapia *</label>
            <input id="agendaTipo" type="text" v-model="agendaForm.type" placeholder="Ej: Logopedia" required class="form-control" />
          </div>

          <div class="form-group">
            <label for="agendaDur">Duración (Minutos) *</label>
            <input id="agendaDur" type="number" v-model="agendaForm.duration" required class="form-control" />
          </div>

          <div class="form-group">
            <label for="agendaProf">Profesional Asignado *</label>
            <select id="agendaProf" v-model="agendaForm.professionalId" required class="form-control">
              <option value="">Selecciona un profesional...</option>
              <option v-for="prof in professionals" :key="prof.id" :value="prof.id">
                {{ prof.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="agendaNotes">Notas adicionales</label>
            <textarea id="agendaNotes" v-model="agendaForm.notes" rows="2" class="form-control textarea-control" placeholder="Observaciones breves..."></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showAgendarModal = false">
              Cancelar
            </button>
            <button type="submit" class="btn-submit" :disabled="isAgendando">
              <span>Agendar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.child-detail-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: none;
  border: none;
  color: #7c8ba1;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--text-blue, #1a5b82);
}

.btn-secondary {
  background: #f0f7ff;
  color: var(--text-blue, #1a5b82);
  border: 1.5px solid #1a5b82;
  padding: 0.55rem 1.2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e0f2fe;
}

.btn-secondary .material-symbols-outlined {
  font-size: 1.1rem;
}

/* Grid layout */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

.left-col, .right-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
}

/* Profile Card */
.profile-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 1.25rem;
}

.child-avatar {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: #eff6ff;
  border: 2px solid #e0f2fe;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.child-avatar svg) {
  width: 100%;
  height: 100%;
}

.child-names {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.child-names .name {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.diagnostico-tag {
  background: #fff1f2;
  color: #e11d48;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 50px;
  width: max-content;
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  position: relative;
}

.meta-item .icon {
  font-size: 1.6rem;
  color: var(--button-purple, #c58cf2);
  padding: 0.5rem;
  background: #fdf4ff;
  border-radius: 0.75rem;
}

.meta-item .text {
  display: flex;
  flex-direction: column;
}

.meta-item .label {
  font-size: 0.75rem;
  color: #7c8ba1;
  font-weight: 500;
}

.meta-item .val {
  font-size: 0.95rem;
  color: #334155;
  font-weight: 700;
}

.meta-action-btn {
  position: absolute;
  right: 0;
  background: #f5f3ff;
  color: #6d28d9;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.meta-action-btn:hover {
  background: #ede9fe;
}

/* Invite Code Card */
.code-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.card-desc {
  font-size: 0.8rem;
  color: #7c8ba1;
}

.code-box {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.4rem 0.6rem 0.4rem 0.8rem;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.code-value {
  font-family: monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.code-box .copy-btn {
  background: var(--button-purple, #c58cf2);
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
}

.code-box .copy-btn:hover {
  background: #b273e3;
}

/* Radar Card */
.radar-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 0.75rem;
}

.btn-radar-update {
  background: #f5f3ff;
  color: #6d28d9;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-radar-update:hover {
  background: #ede9fe;
}

.btn-radar-update .material-symbols-outlined {
  font-size: 1rem;
}

.history-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #4b5563;
}

.history-select {
  padding: 0.35rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  outline: none;
  cursor: pointer;
  background: white;
}

.radar-chart-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
}

.radar-svg {
  width: 100%;
  max-width: 17rem;
  height: auto;
}

.grid-line {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 1.5;
}

.grid-tick {
  font-size: 7px;
  fill: #94a3b8;
  font-weight: 600;
}

.axis-line {
  stroke: #e2e8f0;
  stroke-width: 1.5;
  stroke-dasharray: 2 2;
}

.data-polygon {
  fill: rgba(197, 140, 242, 0.22);
  stroke: var(--button-purple, #c58cf2);
  stroke-width: 2.5;
}

.vertex-dot {
  fill: #6d28d9;
  stroke: white;
  stroke-width: 1.5;
}

.radar-label {
  font-family: 'Fredoka', sans-serif;
  font-size: 8px;
  font-weight: 700;
  fill: var(--text-blue, #1a5b82);
}

/* Sessions section */
.sessions-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sessions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.btn-primary {
  background: var(--button-purple, #c58cf2);
  color: white;
  border: none;
  padding: 0.55rem 1.25rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.25);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #b273e3;
  transform: translateY(-1px);
}

.btn-primary .material-symbols-outlined {
  font-size: 1.1rem;
}

.no-sessions-card {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  color: #7c8ba1;
}

.no-sessions-card .card-icon {
  font-size: 3rem;
  color: #cbd5e0;
}

.no-sessions-card h4 {
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue, #1a5b82);
  font-size: 1.1rem;
}

.no-sessions-card p {
  font-size: 0.85rem;
}

.sessions-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.session-log-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
  border-left: 5px solid var(--button-purple, #c58cf2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.session-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 0.75rem;
}

.session-type-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.therapy-icon {
  font-size: 1.5rem;
  color: var(--button-purple, #c58cf2);
  padding: 0.4rem;
  background: #fdf4ff;
  border-radius: 0.5rem;
}

.session-type {
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.session-meta {
  font-size: 0.75rem;
  color: #7c8ba1;
  font-weight: 500;
}

.session-author-badge {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.session-author-badge .material-symbols-outlined {
  font-size: 0.9rem;
}

.session-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.session-objectives-box {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.objectives-title, .observations-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.objectives-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.objective-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
}

.obj-name {
  color: #334155;
  font-weight: 600;
}

.obj-score {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.star-icon {
  font-size: 0.7rem;
  color: #cbd5e1;
}

.star-icon.active {
  color: #fbbf24;
}

.score-num {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  margin-left: 0.2rem;
}

.observations-text {
  font-size: 0.85rem;
  color: #4b5563;
  line-height: 1.5;
  background: #fffbeb;
  border-left: 3px solid #fbbf24;
  padding: 0.6rem 0.8rem;
  border-radius: 0 0.5rem 0.5rem 0;
}

/* Modals */
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

.form-modal {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  max-width: 28rem;
  width: 90%;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wide-modal {
  max-width: 38rem;
}

.modal-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.modal-desc {
  font-size: 0.85rem;
  color: #7c8ba1;
}

.modal-form-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.modal-form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.flex-1 {
  flex: 1;
  min-width: 12rem;
}

.flex-grow {
  flex-grow: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.form-control {
  padding: 0.6rem 0.8rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  outline: none;
}

.form-control:focus {
  border-color: var(--button-purple, #c58cf2);
}

.textarea-control {
  resize: vertical;
}

/* Objectives builder */
.objectives-creation-box {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.8rem;
  background: #f8fafc;
}

.creation-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.objectives-creator-row {
  display: flex;
  gap: 0.5rem;
}

.add-obj-btn {
  padding: 0.45rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
}

.creator-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.4rem;
  max-height: 10rem;
  overflow-y: auto;
}

.creator-obj-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.4rem 0.6rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.score-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-select {
  padding: 0.25rem 0.4rem;
  font-size: 0.75rem;
}

.remove-obj-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.2rem;
}

.remove-obj-btn .material-symbols-outlined {
  font-size: 1.1rem;
}

/* Sliders */
.sliders-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.slider-input {
  width: 100%;
  accent-color: var(--button-purple, #c58cf2);
  cursor: pointer;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  padding: 0.55rem 1.25rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: var(--button-purple, #c58cf2);
  color: white;
  border: none;
  padding: 0.55rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.25);
}

.btn-submit:hover {
  background: #b273e3;
}
</style>
