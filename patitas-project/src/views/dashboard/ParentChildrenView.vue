<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useChildrenStore } from '../../stores/children';

const authStore = useAuthStore();
const childrenStore = useChildrenStore();
const router = useRouter();

const inviteCodeInput = ref('');
const isLinking = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

onMounted(async () => {
  if (authStore.user?.id) {
    await childrenStore.fetchChildren({ parentId: authStore.user.id });
  }
});

async function handleLink() {
  const code = inviteCodeInput.value.trim().toUpperCase();
  if (!code) {
    errorMsg.value = 'Por favor, introduce un código de invitación.';
    return;
  }

  errorMsg.value = '';
  successMsg.value = '';
  isLinking.value = true;

  const res = await childrenStore.linkChildByCode(code, authStore.user.id);
  isLinking.value = false;

  if (res.success) {
    successMsg.value = `¡Se ha vinculado con éxito el perfil de ${res.child.name}!`;
    inviteCodeInput.value = '';
    // Recargar listado
    await childrenStore.fetchChildren({ parentId: authStore.user.id });
  } else {
    errorMsg.value = res.error || 'Código incorrecto. Compruebe con el centro de atención.';
  }
}

// Age helper
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

function viewChildProgress(id) {
  router.push(`/dashboard/usuario/mis-hijos/${id}`);
}
</script>

<template>
  <div class="parent-children-container">
    <!-- Header -->
    <header class="page-header">
      <div class="header-text">
        <h2 class="title">
          <span class="material-symbols-outlined header-icon">family_history</span>
          Mis Hijos
        </h2>
        <p class="subtitle">
          Consulta el avance, bitácora de sesiones y terapias de tus pequeños vinculados.
        </p>
      </div>
    </header>

    <!-- Linking Form Card -->
    <section class="link-card">
      <div class="link-header">
        <span class="material-symbols-outlined link-icon">vpn_key</span>
        <div>
          <h3 class="link-title">Vincular Código Familia</h3>
          <p class="link-desc">
            Introduce el código alfanumérico proporcionado por tu centro local de Patitas para asociar el expediente de tu hijo.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleLink" class="link-form">
        <div class="input-group">
          <input 
            v-model="inviteCodeInput" 
            type="text" 
            placeholder="Ej. SOF-5678" 
            class="invite-input"
            required
          />
          <button type="submit" class="btn-link-submit" :disabled="isLinking">
            <span v-if="isLinking" class="spinner"></span>
            <span v-else class="material-symbols-outlined">add</span>
            <span>Vincular</span>
          </button>
        </div>

        <!-- Feedback alerts -->
        <div v-if="errorMsg" class="feedback-alert error">
          <span class="material-symbols-outlined">error</span>
          <span>{{ errorMsg }}</span>
        </div>

        <div v-if="successMsg" class="feedback-alert success">
          <span class="material-symbols-outlined">check_circle</span>
          <span>{{ successMsg }}</span>
        </div>
      </form>
    </section>

    <!-- Children List Section -->
    <section class="list-section">
      <h3 class="section-title">Expedientes Vinculados</h3>

      <div v-if="childrenStore.isLoading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Buscando expedientes familiares...</p>
      </div>

      <div v-else-if="childrenStore.children.length === 0" class="empty-state">
        <span class="material-symbols-outlined empty-icon">child_care</span>
        <h4>Aún no has vinculado a ningún hijo</h4>
        <p>Para comenzar a supervisar el progreso de tu hijo, introduce arriba su código de invitación familiar.</p>
      </div>

      <div v-else class="children-grid">
        <div 
          v-for="child in childrenStore.children" 
          :key="child.id" 
          class="child-card"
        >
          <div class="card-header">
            <div class="avatar-box" v-html="child.avatar || ''"></div>
            <div class="meta-box">
              <h4 class="name">{{ child.name }}</h4>
              <span class="age">{{ getAge(child.birthDate) }}</span>
            </div>
          </div>

          <div class="card-body">
            <div class="info-item">
              <span class="material-symbols-outlined info-icon">healing</span>
              <div class="info-text">
                <span class="label">Diagnóstico</span>
                <span class="val">{{ child.diagnostico }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <button class="btn-view-progress" @click="viewChildProgress(child.id)">
              <span>Ver Expediente y Avance</span>
              <span class="material-symbols-outlined">trending_up</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.parent-children-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  flex-direction: column;
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

/* Link Card */
.link-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1.5px solid #edf2f7;
}

.link-header {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
}

.link-icon {
  font-size: 1.8rem;
  color: var(--button-purple, #c58cf2);
  background: #fdf4ff;
  padding: 0.5rem;
  border-radius: 0.75rem;
}

.link-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
  margin-bottom: 0.15rem;
}

.link-desc {
  font-size: 0.85rem;
  color: #7c8ba1;
  line-height: 1.4;
}

.link-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-group {
  display: flex;
  gap: 0.75rem;
  max-width: 30rem;
}

.invite-input {
  flex-grow: 1;
  padding: 0.65rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  outline: none;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.invite-input::placeholder {
  font-family: 'Outfit', sans-serif;
  font-weight: 400;
}

.invite-input:focus {
  border-color: var(--button-purple, #c58cf2);
}

.btn-link-submit {
  background: var(--button-purple, #c58cf2);
  color: white;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(197, 140, 242, 0.2);
  transition: all 0.2s;
}

.btn-link-submit:hover:not(:disabled) {
  background: #b273e3;
  transform: translateY(-1px);
}

.btn-link-submit:disabled {
  opacity: 0.7;
}

.spinner {
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

.feedback-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  max-width: 30rem;
}

.feedback-alert.error {
  background: #fef2f2;
  color: #b91c1c;
}

.feedback-alert.success {
  background: #f0fdf4;
  color: #166534;
}

/* List section */
.list-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  gap: 0.8rem;
  color: #7c8ba1;
}

.spinner-large {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(197, 140, 242, 0.15);
  border-top-color: var(--button-purple, #c58cf2);
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #7c8ba1;
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e0;
}

.empty-state h4 {
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue, #1a5b82);
  font-size: 1.1rem;
}

.empty-state p {
  font-size: 0.85rem;
  max-width: 25rem;
}

/* Children Grid */
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
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1.5px solid transparent;
  transition: all 0.2s ease;
}

.child-card:hover {
  transform: translateY(-2px);
  border-color: #f3e8ff;
  box-shadow: 0 10px 25px rgba(197, 140, 242, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-box {
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  overflow: hidden;
  background: #fdf4ff;
  border: 2px solid #fae8ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.avatar-box svg) {
  width: 100%;
  height: 100%;
}

.meta-box {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.meta-box .name {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.meta-box .age {
  background: #fdf4ff;
  color: #a855f7;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 50px;
  width: max-content;
}

.card-body {
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.info-icon {
  font-size: 1.25rem;
  color: #f43f5e;
  margin-top: 0.1rem;
}

.info-text {
  display: flex;
  flex-direction: column;
}

.info-text .label {
  font-size: 0.7rem;
  color: #7c8ba1;
  font-weight: 500;
}

.info-text .val {
  font-size: 0.85rem;
  color: #334155;
  font-weight: 700;
}

.btn-view-progress {
  width: 100%;
  background: #fdf4ff;
  color: #a855f7;
  border: none;
  padding: 0.55rem;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: all 0.2s;
}

.btn-view-progress:hover {
  background: #fae8ff;
  color: #9333ea;
}

.btn-view-progress .material-symbols-outlined {
  font-size: 1rem;
}
</style>
