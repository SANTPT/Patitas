<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useContentStore } from '../../stores/content';

const authStore = useAuthStore();
const contentStore = useContentStore();
const router = useRouter();

const user = computed(() => authStore.user);
const role = computed(() => user.value?.role || 'admin_centro');

// Search & filters
const searchQuery = ref('');
const selectedType = ref('');
const selectedVisibility = ref('');
const selectedStatus = ref('');

onMounted(async () => {
  if (user.value?.id) {
    await contentStore.fetchMyContent(user.value.id);
  }
});

const filteredContents = computed(() => {
  return contentStore.contents.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesType = !selectedType.value || item.type === selectedType.value;
    const matchesVisibility = !selectedVisibility.value || item.visibility === selectedVisibility.value;
    const matchesStatus = !selectedStatus.value || item.status === selectedStatus.value;
    
    return matchesSearch && matchesType && matchesVisibility && matchesStatus;
  });
});

const navigateToCreate = () => {
  const prefix = role.value === 'admin_centro' ? 'admin-centro' : 'admin-profesional';
  router.push(`/dashboard/${prefix}/contenido/nuevo`);
};

const navigateToEdit = (id) => {
  const prefix = role.value === 'admin_centro' ? 'admin-centro' : 'admin-profesional';
  router.push(`/dashboard/${prefix}/contenido/${id}/editar`);
};

const toggleStatus = async (item) => {
  const newStatus = item.status === 'published' ? 'draft' : 'published';
  await contentStore.updateContent(item.id, { status: newStatus });
};

const deleteItem = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta publicación permanentemente?')) {
    await contentStore.deleteContent(id);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};
</script>

<template>
  <div class="content-list-container">
    <div class="content-header">
      <div>
        <h2 class="title">Mis Publicaciones</h2>
        <p class="subtitle">Crea y gestiona artículos del blog, actividades y videos prácticos.</p>
      </div>
      <button class="btn btn-primary" @click="navigateToCreate">
        <span class="material-symbols-outlined btn-icon">add</span>
        Crear Publicación
      </button>
    </div>

    <!-- Filters Section -->
    <div class="filters-card">
      <div class="search-box">
        <span class="material-symbols-outlined search-icon">search</span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Buscar por título o descripción..." 
          class="search-input"
        />
      </div>
      <div class="select-filters">
        <select v-model="selectedType" class="filter-select">
          <option value="">Todos los tipos</option>
          <option value="post">Artículo / Post</option>
          <option value="video">Video práctico</option>
          <option value="actividad">Actividad / Taller</option>
        </select>

        <select v-model="selectedVisibility" class="filter-select">
          <option value="">Cualquier visibilidad</option>
          <option value="public">Público 🌐</option>
          <option value="private">Privado 🔒</option>
        </select>

        <select v-model="selectedStatus" class="filter-select">
          <option value="">Cualquier estado</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
        </select>
      </div>
    </div>

    <!-- Loading & Error -->
    <div v-if="contentStore.isLoading" class="loading-state">
      <span class="material-symbols-outlined spinner">sync</span>
      Cargando publicaciones...
    </div>

    <div v-else-if="contentStore.error" class="error-state">
      <span class="material-symbols-outlined">warning</span>
      {{ contentStore.error }}
    </div>

    <!-- Content Table -->
    <div v-else class="table-wrapper">
      <table v-if="filteredContents.length > 0" class="content-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Tipo</th>
            <th>Visibilidad</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th class="actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredContents" :key="item.id">
            <td>
              <div class="title-cell">
                <span class="item-title">{{ item.title }}</span>
                <span class="item-desc">{{ item.description }}</span>
              </div>
            </td>
            <td>
              <span class="type-badge" :class="item.type">
                <span class="material-symbols-outlined font-icon">
                  {{ item.type === 'video' ? 'videocam' : item.type === 'actividad' ? 'extension' : 'article' }}
                </span>
                {{ item.type === 'video' ? 'Video' : item.type === 'actividad' ? 'Actividad' : 'Post' }}
              </span>
            </td>
            <td>
              <span class="visibility-badge" :class="item.visibility">
                <span class="material-symbols-outlined font-icon">
                  {{ item.visibility === 'private' ? 'lock' : 'public' }}
                </span>
                {{ item.visibility === 'private' ? 'Privado' : 'Público' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="item.status">
                {{ item.status === 'published' ? 'Publicado' : 'Borrador' }}
              </span>
            </td>
            <td>
              <span class="date-text">{{ formatDate(item.createdAt) }}</span>
            </td>
            <td>
              <div class="actions-cell">
                <button 
                  class="action-btn" 
                  :title="item.status === 'published' ? 'Cambiar a borrador' : 'Publicar'"
                  @click="toggleStatus(item)"
                >
                  <span class="material-symbols-outlined">
                    {{ item.status === 'published' ? 'unpublished' : 'publish' }}
                  </span>
                </button>
                <button 
                  class="action-btn edit" 
                  title="Editar publicación"
                  @click="navigateToEdit(item.id)"
                >
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button 
                  class="action-btn delete" 
                  title="Eliminar permanentemente"
                  @click="deleteItem(item.id)"
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <span class="material-symbols-outlined empty-icon">post_add</span>
        <h3>No se encontraron publicaciones</h3>
        <p>Prueba a cambiar los filtros de búsqueda o crea un nuevo contenido.</p>
        <button class="btn btn-secondary" @click="navigateToCreate">Crear mi primera publicación</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-list-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
  margin-bottom: 0.2rem;
}

.subtitle {
  font-size: 0.95rem;
  color: #7c8ba1;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--button-purple, #c58cf2);
  color: white;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(197, 140, 242, 0.4);
}

.btn-secondary {
  background: #e0f2fe;
  color: #0284c7;
}

.btn-secondary:hover {
  background: #bae6fd;
}

.btn-icon {
  font-size: 1.2rem;
}

.filters-card {
  background: white;
  padding: 1.25rem;
  border-radius: 1.25rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #f8fafc;
  padding: 0.6rem 1rem;
  border-radius: 0.8rem;
  flex-grow: 1;
  max-width: 25rem;
  border: 1.5px solid transparent;
}

.search-box:focus-within {
  border-color: var(--button-purple, #c58cf2);
  background: white;
}

.search-icon {
  color: #a0aec0;
  font-size: 1.25rem;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 0.9rem;
  color: #4a5568;
}

.select-filters {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.6rem 1rem;
  border-radius: 0.8rem;
  border: 1.5px solid #e2e8f0;
  outline: none;
  font-size: 0.85rem;
  color: #4a5568;
  background-color: white;
  cursor: pointer;
}

.filter-select:focus {
  border-color: var(--button-purple, #c58cf2);
}

.table-wrapper {
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
  overflow-x: auto;
  min-height: 20rem;
}

.content-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.content-table th {
  padding: 1.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #7c8ba1;
  border-bottom: 1.5px solid #edf2f7;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.content-table td {
  padding: 1.2rem;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  max-width: 20rem;
}

.item-title {
  font-weight: 600;
  color: var(--text-blue, #1a5b82);
  font-size: 0.95rem;
}

.item-desc {
  font-size: 0.8rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.font-icon {
  font-size: 1.1rem;
}

.type-badge, .visibility-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border-radius: 5rem;
  font-size: 0.78rem;
  font-weight: 600;
}

.type-badge.post {
  background: #eff6ff;
  color: #1d4ed8;
}

.type-badge.video {
  background: #fdf2f8;
  color: #db2777;
}

.type-badge.actividad {
  background: #faf5ff;
  color: #7c3aed;
}

.visibility-badge.public {
  background: #f0fdf4;
  color: #16a34a;
}

.visibility-badge.private {
  background: #fffbeb;
  color: #d97706;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.published {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.draft {
  background: #e2e8f0;
  color: #475569;
}

.date-text {
  font-size: 0.85rem;
  color: #64748b;
}

.actions-col {
  text-align: right;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  background: #f1f5f9;
  border: none;
  padding: 0.4rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #475569;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #e2e8f0;
  color: var(--text-blue, #1a5b82);
}

.action-btn.edit:hover {
  background: #e0f2fe;
  color: #0284c7;
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #7c8ba1;
}

.spinner {
  animation: spin 1s linear infinite;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  color: var(--text-blue, #1a5b82);
  margin-bottom: 0.4rem;
}

.empty-state p {
  font-size: 0.9rem;
  margin-bottom: 1.2rem;
  max-width: 25rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
