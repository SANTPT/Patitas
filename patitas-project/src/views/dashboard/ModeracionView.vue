<template>
  <div class="dash-view">
    <div class="view-header">
      <h1><span class="material-symbols-outlined">gavel</span> Moderación de Contenidos</h1>
      <p>Gestiona solicitudes de eliminación del foro, historias pendientes y contenido reportado.</p>
    </div>

    <div class="tabs-row">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'requests' }" 
        @click="activeTab = 'requests'"
      >
        Solicitudes de eliminación 
        <span v-if="deleteRequests.length" class="tab-badge">{{ deleteRequests.length }}</span>
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'stories' }" 
        @click="activeTab = 'stories'"
      >
        Historias pendientes 
        <span v-if="pendingStories.length" class="tab-badge">{{ pendingStories.length }}</span>
      </button>
    </div>

    <!-- Cargando -->
    <div v-if="isLoading" class="empty-state">
      <span class="material-symbols-outlined spinner-icon">sync</span>
      <p>Cargando elementos de moderación...</p>
    </div>

    <!-- Colas de Moderación -->
    <div v-else>
      <!-- Solicitudes de eliminación -->
      <div v-if="activeTab === 'requests'" class="items-list">
        <div class="mod-card" v-for="r in deleteRequests" :key="r.id">
          <div class="mod-card-info">
            <span class="mod-type">📝 Post del foro</span>
            <h3>{{ r.title }}</h3>
            <p>Autor: <strong>{{ r.author }}</strong> · {{ r.comments }} comentarios · Solicitado {{ r.date }}</p>
          </div>
          <div class="mod-actions">
            <button class="btn-approve" @click="handleApproveDelete(r.id)">
              <span class="material-symbols-outlined">check</span> Aprobar eliminación
            </button>
            <button class="btn-reject" @click="handleRejectDelete(r.id)">
              <span class="material-symbols-outlined">close</span> Rechazar
            </button>
          </div>
        </div>
        <div v-if="!deleteRequests.length" class="empty-state">
          <span class="material-symbols-outlined">check_circle</span>
          <p>No hay solicitudes de eliminación pendientes.</p>
        </div>
      </div>

      <!-- Historias pendientes -->
      <div v-if="activeTab === 'stories'" class="items-list">
        <div class="mod-card" v-for="s in pendingStories" :key="s.id">
          <div class="mod-card-info">
            <span class="mod-type">⭐ Historia de éxito</span>
            <h3>{{ s.title }}</h3>
            <p>Por: <strong>{{ s.author }}</strong> · Enviada {{ s.date }}</p>
            <p class="story-excerpt">{{ s.excerpt }}</p>
          </div>
          <div class="mod-actions">
            <button class="btn-approve" @click="handleApproveStory(s.id)">
              <span class="material-symbols-outlined">check</span> Aprobar
            </button>
            <button class="btn-reject" @click="handleRejectStory(s.id)">
              <span class="material-symbols-outlined">close</span> Rechazar
            </button>
          </div>
        </div>
        <div v-if="!pendingStories.length" class="empty-state">
          <span class="material-symbols-outlined">check_circle</span>
          <p>No hay historias pendientes de aprobación.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useModerationStore } from '../../stores/moderation';

const activeTab = ref('requests');
const moderationStore = useModerationStore();

const { deleteRequests, pendingStories, isLoading } = storeToRefs(moderationStore);

onMounted(async () => {
  await moderationStore.fetchModerationQueue();
});

async function handleApproveDelete(id) {
  const res = await moderationStore.approveDeleteRequest(id);
  if (res.success) {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Solicitud de eliminación aprobada con éxito.', type: 'success' }
    }));
  } else {
    alert(res.error);
  }
}

async function handleRejectDelete(id) {
  const res = await moderationStore.rejectDeleteRequest(id);
  if (res.success) {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Solicitud de eliminación rechazada con éxito.', type: 'success' }
    }));
  } else {
    alert(res.error);
  }
}

async function handleApproveStory(id) {
  const res = await moderationStore.approveStory(id);
  if (res.success) {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Historia de éxito aprobada y publicada.', type: 'success' }
    }));
  } else {
    alert(res.error);
  }
}

async function handleRejectStory(id) {
  const res = await moderationStore.rejectStory(id);
  if (res.success) {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Historia de éxito rechazada.', type: 'success' }
    }));
  } else {
    alert(res.error);
  }
}
</script>

<style scoped>
.dash-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.view-header h1 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a5b82;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}
.view-header .material-symbols-outlined {
  font-size: 2rem;
  color: #c58cf2;
}
.view-header p {
  color: #7c8ba1;
  font-size: 0.95rem;
}
.tabs-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: white;
  border: 1.5px solid rgba(26, 91, 130, 0.12);
  border-radius: 5rem;
  padding: 0.55rem 1.1rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a5b82;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  background: #c58cf2;
  color: white;
  border-color: #c58cf2;
}
.tab-badge {
  background: rgba(229, 62, 62, 0.15);
  color: #e53e3e;
  border-radius: 5rem;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
}
.tab-btn.active .tab-badge {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.mod-card {
  background: white;
  border-radius: 1.1rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(26, 91, 130, 0.07);
  box-shadow: 0 4px 16px rgba(26, 91, 130, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}
.mod-type {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}
.mod-card-info h3 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a5b82;
  margin: 0.3rem 0 0.2rem;
}
.mod-card-info p {
  font-size: 0.82rem;
  color: #7c8ba1;
  margin: 0.1rem 0;
}
.story-excerpt {
  font-style: italic;
  color: #94a3b8 !important;
}
.mod-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  align-items: flex-start;
  flex-wrap: wrap;
}
.btn-approve {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(52, 211, 153, 0.1);
  color: #059669;
  border: 1.5px solid rgba(52, 211, 153, 0.3);
  border-radius: 5rem;
  padding: 0.5rem 0.9rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-approve:hover {
  background: #059669;
  color: white;
}
.btn-reject {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(229, 62, 62, 0.06);
  color: #e53e3e;
  border: 1.5px solid rgba(229, 62, 62, 0.2);
  border-radius: 5rem;
  padding: 0.5rem 0.9rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-reject:hover {
  background: #e53e3e;
  color: white;
}
.btn-approve .material-symbols-outlined,
.btn-reject .material-symbols-outlined {
  font-size: 0.95rem;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  background: white;
  border-radius: 1.1rem;
  border: 1px solid rgba(26, 91, 130, 0.06);
  color: #94a3b8;
  text-align: center;
}
.empty-state .material-symbols-outlined {
  font-size: 3rem;
  color: #34d399;
}
.spinner-icon {
  animation: spin 1.5s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
