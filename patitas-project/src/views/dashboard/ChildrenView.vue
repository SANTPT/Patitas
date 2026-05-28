<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useChildrenStore } from '../../stores/children';
import api from '../../services/api';

const authStore = useAuthStore();
const childrenStore = useChildrenStore();
const router = useRouter();

const userRole = computed(() => authStore.user?.role);
const userCentroId = computed(() => authStore.user?.centroId);

const search = ref('');
const filterDiagnosis = ref('');
const filterProfesional = ref('');
const professionalsList = ref([]);

// Cargar niños y profesionales del centro
onMounted(async () => {
  const filters = {};
  if (userRole.value === 'admin_centro') {
    filters.centroId = userCentroId.value;
    
    // Cargar profesionales para el filtro y para asociar nombres
    try {
      const resp = await api.get('/admin/users');
      professionalsList.value = resp.data.filter(
        u => u.role === 'admin_profesional' && u.centroId === userCentroId.value
      );
    } catch (err) {
      console.error('Error al cargar profesionales:', err);
    }
  } else if (userRole.value === 'admin_profesional') {
    filters.profesionalId = authStore.user.id;
  }
  
  await childrenStore.fetchChildren(filters);
});

// Obtener el nombre del profesional asignado
function getProfessionalName(profesionalId) {
  if (!profesionalId) return 'No asignado';
  const prof = professionalsList.value.find(p => p.id === profesionalId);
  return prof ? prof.name : 'Profesional';
}

// Calcular edad del niño en formato amigable
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

// Filtrar niños en el cliente
const filteredChildren = computed(() => {
  return childrenStore.children.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(search.value.toLowerCase()) || 
                          (child.diagnostico || '').toLowerCase().includes(search.value.toLowerCase());
    
    const matchesDiag = !filterDiagnosis.value || child.diagnostico === filterDiagnosis.value;
    
    const matchesProf = !filterProfesional.value || child.profesionalId === parseInt(filterProfesional.value);
    
    return matchesSearch && matchesDiag && matchesProf;
  });
});

// Listar diagnósticos únicos para el filtro
const diagnoses = computed(() => {
  const all = childrenStore.children.map(c => c.diagnostico).filter(Boolean);
  return [...new Set(all)];
});

// Copiar código de invitación al portapapeles
const copiedCode = ref(null);
async function copyInviteCode(code) {
  try {
    await navigator.clipboard.writeText(code);
    copiedCode.value = code;
    setTimeout(() => {
      copiedCode.value = null;
    }, 2000);
  } catch (err) {
    console.error('Error al copiar:', err);
  }
}

// Navegar a los detalles del niño
function viewChildDetails(id) {
  const prefix = userRole.value === 'admin_centro' ? 'admin-centro/ninos' : 'admin-profesional/mis-ninos';
  router.push(`/dashboard/${prefix}/${id}`);
}

// Navegar a nuevo niño
function goToNewChild() {
  router.push('/dashboard/admin-centro/ninos/nuevo');
}
</script>

<template>
  <div class="children-list-container">
    <!-- Header -->
    <header class="page-header">
      <div class="header-text">
        <h2 class="title">
          <span class="material-symbols-outlined header-icon">child_care</span>
          {{ userRole === 'admin_centro' ? 'Niños del Centro' : 'Mis Niños Asignados' }}
        </h2>
        <p class="subtitle">
          {{ userRole === 'admin_centro' ? 'Gestiona los perfiles del centro y supervisa sus asignaciones.' : 'Consulta los expedientes y registra el progreso de tus niños asignados.' }}
        </p>
      </div>
      <button 
        v-if="userRole === 'admin_centro'"
        class="btn-primary" 
        @click="goToNewChild"
      >
        <span class="material-symbols-outlined">add</span>
        Nuevo Niño
      </button>
    </header>

    <!-- Filters -->
    <section class="filters-bar">
      <div class="search-input-wrapper">
        <span class="material-symbols-outlined search-icon">search</span>
        <input 
          v-model="search" 
          type="text" 
          placeholder="Buscar niño por nombre o diagnóstico..." 
          class="search-input"
        />
      </div>

      <div class="dropdowns-wrapper">
        <select v-model="filterDiagnosis" class="filter-select">
          <option value="">Todos los diagnósticos</option>
          <option v-for="diag in diagnoses" :key="diag" :value="diag">
            {{ diag }}
          </option>
        </select>

        <select 
          v-if="userRole === 'admin_centro'"
          v-model="filterProfesional" 
          class="filter-select"
        >
          <option value="">Todos los profesionales</option>
          <option v-for="prof in professionalsList" :key="prof.id" :value="prof.id">
            {{ prof.name }}
          </option>
        </select>
      </div>
    </section>

    <!-- Content Grid -->
    <div v-if="childrenStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando perfiles infantiles...</p>
    </div>

    <div v-else-if="filteredChildren.length === 0" class="empty-state">
      <span class="material-symbols-outlined empty-icon">assignment_late</span>
      <h3>No se encontraron niños</h3>
      <p>Prueba a cambiar los filtros de búsqueda o registra un nuevo perfil.</p>
      <button 
        v-if="userRole === 'admin_centro'" 
        class="btn-secondary" 
        @click="goToNewChild"
      >
        Registrar Primer Niño
      </button>
    </div>

    <div v-else class="children-grid">
      <div 
        v-for="child in filteredChildren" 
        :key="child.id" 
        class="child-card"
      >
        <div class="child-card-header">
          <div class="child-avatar-wrapper" v-html="child.avatar || ''"></div>
          <div class="child-meta">
            <h3 class="child-name">{{ child.name }}</h3>
            <span class="child-age-badge">{{ getAge(child.birthDate) }}</span>
          </div>
        </div>

        <div class="child-card-body">
          <div class="info-row">
            <span class="material-symbols-outlined info-icon text-pink">healing</span>
            <div class="info-text">
              <span class="info-label">Diagnóstico</span>
              <span class="info-value">{{ child.diagnostico || 'Sin diagnóstico asignado' }}</span>
            </div>
          </div>

          <div class="info-row">
            <span class="material-symbols-outlined info-icon text-blue">diversity_1</span>
            <div class="info-text">
              <span class="info-label">Terapeuta Asignado</span>
              <span class="info-value">{{ getProfessionalName(child.profesionalId) }}</span>
            </div>
          </div>
        </div>

        <div class="child-card-footer">
          <div class="invite-code-box">
            <span class="code-label">Código Familia</span>
            <div class="code-input-group">
              <code class="code-value">{{ child.inviteCode }}</code>
              <button 
                class="copy-btn" 
                title="Copiar código de invitación"
                @click="copyInviteCode(child.inviteCode)"
              >
                <span class="material-symbols-outlined">
                  {{ copiedCode === child.inviteCode ? 'check' : 'content_copy' }}
                </span>
              </button>
            </div>
          </div>

          <button class="btn-view" @click="viewChildDetails(child.id)">
            <span>Ficha Completa</span>
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.children-list-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-text .title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.2rem;
}

.header-icon {
  font-size: 2.2rem;
  color: var(--button-purple, #c58cf2);
}

.header-text .subtitle {
  font-size: 0.9rem;
  color: #7c8ba1;
}

.btn-primary {
  background: var(--button-purple, #c58cf2);
  color: white;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.25);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #b273e3;
  transform: translateY(-1px);
}

.filters-bar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
}

.search-input-wrapper {
  flex-grow: 1;
  position: relative;
  min-width: 15rem;
}

.search-icon {
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
}

.search-input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.4rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--button-purple, #c58cf2);
}

.dropdowns-wrapper {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.6rem 1.5rem 0.6rem 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  background: white;
  outline: none;
  min-width: 12rem;
  cursor: pointer;
}

.filter-select:focus {
  border-color: var(--button-purple, #c58cf2);
}

/* Loading & Empty States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: #7c8ba1;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 4px solid rgba(197, 140, 242, 0.1);
  border-top-color: var(--button-purple, #c58cf2);
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-icon {
  font-size: 3.5rem;
  color: #cbd5e0;
}

.empty-state h3 {
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue, #1a5b82);
  font-size: 1.25rem;
}

.empty-state p {
  color: #7c8ba1;
  font-size: 0.9rem;
  max-width: 25rem;
  margin-bottom: 0.5rem;
}

.btn-secondary {
  background: #f0f7ff;
  color: var(--text-blue, #1a5b82);
  border: 1.5px solid #1a5b82;
  padding: 0.6rem 1.25rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e0f2fe;
}

/* Grid & Cards */
.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1.5rem;
}

.child-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
  border: 1.5px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: all 0.2s ease;
}

.child-card:hover {
  transform: translateY(-2px);
  border-color: #e0e7ff;
  box-shadow: 0 10px 25px rgba(26, 91, 130, 0.07);
}

.child-card-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.child-avatar-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e0f2fe;
}

:deep(.child-avatar-wrapper svg) {
  width: 100%;
  height: 100%;
}

.child-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.child-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.child-age-badge {
  background: #f0f7ff;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 50px;
  width: max-content;
}

.child-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed #e2e8f0;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.info-icon {
  font-size: 1.3rem;
  margin-top: 0.1rem;
}

.text-pink { color: #f43f5e; }
.text-blue { color: #0284c7; }

.info-text {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.75rem;
  color: #7c8ba1;
  font-weight: 500;
}

.info-value {
  font-size: 0.85rem;
  color: #4a5568;
  font-weight: 600;
}

.child-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.5rem;
}

.invite-code-box {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.code-label {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
}

.code-input-group {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.2rem 0.4rem 0.2rem 0.6rem;
  gap: 0.4rem;
}

.code-value {
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
}

.copy-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.15rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #e2e8f0;
  color: var(--text-blue, #1a5b82);
}

.copy-btn .material-symbols-outlined {
  font-size: 1.1rem;
}

.btn-view {
  background: #f5f3ff;
  color: #6d28d9;
  border: none;
  padding: 0.45rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  background: #ede9fe;
  color: #5b21b6;
  gap: 0.4rem;
}

.btn-view .material-symbols-outlined {
  font-size: 0.95rem;
}
</style>
