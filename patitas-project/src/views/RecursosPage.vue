<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import ResourceCard from '../components/ResourceCard.vue';
import ResourceSkeleton from '../components/ResourceSkeleton.vue';

const route = useRoute();
const router = useRouter();

// Estados
const recursos = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const activeCategory = ref('todos');
const currentPage = ref(1);

// Categorías del catálogo
const categories = [
  { id: 'todos', label: 'Todos', icon: 'grid_view' },
  { id: 'articulos', label: 'Artículos', icon: 'menu_book' },
  { id: 'guias', label: 'Guías', icon: 'auto_stories' },
  { id: 'videos', label: 'Videos', icon: 'play_circle' },
  { id: 'centros', label: 'Centros', icon: 'distance' }
];

// Petición a la API
const fetchRecursos = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/recursos');
    recursos.value = response.data;
  } catch (error) {
    console.error('Error al obtener recursos:', error);
  } finally {
    isLoading.value = false;
  }
};

// Sincronización inicial desde la URL
onMounted(async () => {
  if (route.query.categoria) {
    activeCategory.value = route.query.categoria;
  }
  if (route.query.pagina) {
    currentPage.value = parseInt(route.query.pagina) || 1;
  }
  await fetchRecursos();
});

// Sincronización reactiva del estado hacia la URL
const updateUrlParams = () => {
  const query = {};
  if (activeCategory.value !== 'todos') {
    query.categoria = activeCategory.value;
  }
  if (currentPage.value > 1) {
    query.pagina = currentPage.value.toString();
  }
  router.replace({ query });
};

watch([activeCategory, currentPage], () => {
  updateUrlParams();
});

// Resetear página a 1 al cambiar de categoría o realizar una búsqueda nueva
watch(activeCategory, () => {
  currentPage.value = 1;
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

// Filtrado local reactivo
const filteredRecursos = computed(() => {
  let result = recursos.value;

  // 1. Filtrar por categoría
  if (activeCategory.value !== 'todos') {
    result = result.filter(r => r.category === activeCategory.value);
  }

  // 2. Filtrar por buscador (mínimo 3 caracteres)
  const query = searchQuery.value.trim().toLowerCase();
  if (query.length >= 3) {
    result = result.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
    );
  }

  return result;
});

// Paginación
const itemsPerPage = 9;
const totalPages = computed(() => Math.ceil(filteredRecursos.value.length / itemsPerPage));

const paginatedRecursos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredRecursos.value.slice(start, end);
});

// Cambiar de página
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Limpiar búsqueda
const clearSearch = () => {
  searchQuery.value = '';
};

// Abrir detalle
const openDetail = (resource) => {
  router.push(`/recursos/${resource.id}`);
};
</script>

<template>
  <div class="recursos-page">
    <!-- Encabezado de la página -->
    <header class="page-header">
      <div class="header-content container">
        <h1 class="page-title">Recursos de Apoyo</h1>
        <p class="page-subtitle">
          Explora nuestra biblioteca de artículos, guías descargables, videos explicativos y centros recomendados para acompañar el desarrollo de tu hijo.
        </p>

        <!-- Barra de herramientas: Búsqueda y Filtros -->
        <div class="search-filter-bar">
          <!-- Buscador -->
          <div class="search-box">
            <span class="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Buscar recursos (min. 3 caracteres)..."
              class="search-input"
              :disabled="isLoading"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="btn-clear"
              title="Limpiar búsqueda"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Filtros de categoría -->
          <div class="category-filters">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="activeCategory = cat.id"
              class="filter-pill"
              :class="{ active: activeCategory === cat.id }"
              :disabled="isLoading"
            >
              <span class="material-symbols-outlined pill-icon">{{ cat.icon }}</span>
              {{ cat.label }}
            </button>
          </div>
        </div>
      </div>
      <div class="header-wave-bottom">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="var(--page-bg, #f0f8ff)"/>
        </svg>
      </div>
    </header>

    <!-- Sección principal de contenido -->
    <main class="recursos-content container">
      <!-- Indicador de carga (Skeletons) -->
      <div class="resources-grid" v-if="isLoading">
        <ResourceSkeleton v-for="n in 6" :key="n" />
      </div>

      <!-- Contenido listo -->
      <div v-else>
        <!-- Grilla de Cards si existen resultados -->
        <div class="resources-grid" v-if="paginatedRecursos.length > 0">
          <ResourceCard
            v-for="res in paginatedRecursos"
            :key="res.id"
            :resource="res"
            @view-details="openDetail"
          />
        </div>

        <!-- Vista vacía si no hay resultados -->
        <div class="no-results" v-else>
          <span class="material-symbols-outlined no-results-icon">search_off</span>
          <h2>No encontramos recursos para tu búsqueda</h2>
          <p>Prueba escribiendo otra palabra o cambia la categoría seleccionada.</p>
          <div class="no-results-suggestions">
            <button @click="clearSearch" class="btn-suggest">Limpiar búsqueda</button>
            <button @click="activeCategory = 'todos'" class="btn-suggest secondary">Ver todas las categorías</button>
          </div>
        </div>

        <!-- Paginación -->
        <div class="pagination" v-if="totalPages > 1 && paginatedRecursos.length > 0">
          <button
            class="btn-page arrow"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          
          <button
            v-for="page in totalPages"
            :key="page"
            class="btn-page"
            :class="{ active: currentPage === page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>

          <button
            class="btn-page arrow"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.recursos-page {
  background-color: #f7fafc;
  min-height: 80vh;
  padding-bottom: 5rem;
}

/* Encabezado */
.page-header {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 4.5rem 0 5.5rem;
  text-align: center;
}

.header-wave-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3.11rem;
  z-index: 2;
}

.header-wave-bottom svg {
  width: 100%;
  height: 100%;
  display: block;
}

.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.75rem;
}

.page-subtitle {
  font-size: 1.05rem;
  color: var(--text-blue);
  opacity: 0.85;
  max-width: 38rem;
  margin: 0 auto 2.5rem;
  line-height: 1.6;
}

/* Barra de herramientas */
.search-filter-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  max-width: 55rem;
  margin: 0 auto;
}

.search-box {
  background: white;
  width: 100%;
  max-width: 32rem;
  border-radius: 5.5rem;
  border: 1.5px solid rgba(197, 140, 242, 0.3);
  padding: 0.45rem 1rem 0.45rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(26, 91, 130, 0.05);
  transition: all 0.25s ease;
}

.search-box:focus-within {
  border-color: var(--button-purple);
  box-shadow: 0 4px 20px rgba(197, 140, 242, 0.15);
}

.search-icon {
  color: #718096;
  font-size: 1.4rem;
}

.search-input {
  border: none;
  background: transparent;
  flex-grow: 1;
  font-size: 0.95rem;
  color: var(--text-blue);
  font-weight: 500;
  outline: none;
}

.search-input:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-clear {
  border: none;
  background: transparent;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.btn-clear:hover {
  background: #edf2f7;
  color: #4a5568;
}

/* Filtros de categoría */
.category-filters {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-pill {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.92rem;
  font-weight: 600;
  background: white;
  border: 1.5px solid rgba(26, 91, 130, 0.08);
  color: var(--text-blue);
  padding: 0.5rem 1.25rem;
  border-radius: 5.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 2px 5px rgba(26, 91, 130, 0.02);
}

.filter-pill:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(197, 140, 242, 0.6);
  background: rgba(197, 140, 242, 0.03);
}

.filter-pill.active {
  background: var(--button-purple);
  border-color: var(--button-purple);
  color: white;
  box-shadow: var(--shadow-purple);
}

.filter-pill:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pill-icon {
  font-size: 1.1rem;
}

/* Contenido Principal */
.recursos-content {
  padding-top: 3.5rem;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18.5rem, 1fr));
  gap: 2rem;
}

/* No resultados */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(26, 91, 130, 0.03);
  border: 1px solid rgba(26, 91, 130, 0.05);
  max-width: 35rem;
  margin: 0 auto;
}

.no-results-icon {
  font-size: 4rem;
  color: #a0aec0;
  margin-bottom: 1rem;
}

.no-results h2 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.4rem;
  color: var(--text-blue);
  margin-bottom: 0.5rem;
}

.no-results p {
  color: #718096;
  font-size: 0.95rem;
  margin-bottom: 1.75rem;
}

.no-results-suggestions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-suggest {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  background: var(--button-purple);
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 5.5rem;
  cursor: pointer;
  box-shadow: var(--shadow-purple);
  transition: all 0.25s ease;
}

.btn-suggest:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

.btn-suggest.secondary {
  background: white;
  border: 1.5px solid rgba(197, 140, 242, 0.45);
  color: var(--button-purple);
  box-shadow: none;
}

.btn-suggest.secondary:hover {
  background: rgba(197, 140, 242, 0.05);
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 4rem;
}

.btn-page {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  border: 1.5px solid rgba(26, 91, 130, 0.08);
  background: white;
  color: var(--text-blue);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.btn-page:hover:not(:disabled):not(.active) {
  border-color: var(--button-purple);
  background: rgba(197, 140, 242, 0.04);
}

.btn-page.active {
  background: var(--button-purple);
  border-color: var(--button-purple);
  color: white;
  box-shadow: var(--shadow-purple);
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-page.arrow span {
  font-size: 1.25rem;
}

/* Modal Detalle Recurso */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(26, 32, 44, 0.65);
  backdrop-filter: blur(6px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  background: white;
  width: 100%;
  max-width: 38rem;
  border-radius: 2rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  animation: modal-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.85);
  color: #2d3748;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.modal-close:hover {
  background: white;
  transform: scale(1.05);
}

.modal-hero {
  height: 14rem;
  position: relative;
}

.modal-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-hero-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0; height: 4rem;
  background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));
}

.modal-body {
  padding: 1.5rem 2rem 2rem;
  overflow-y: auto;
}

.modal-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: #718096;
}

.modal-category {
  padding: 0.25rem 0.65rem;
  border-radius: 5rem;
  font-weight: 700;
}

.modal-category.tag-articulos { background: #e3f2fd; color: #1976d2; }
.modal-category.tag-guias { background: #e8f5e9; color: #2e7d32; }
.modal-category.tag-videos { background: #fff3e0; color: #e65100; }
.modal-category.tag-centros { background: #f3e5f5; color: #7b1fa2; }

.modal-author {
  font-weight: 600;
  color: var(--text-blue);
}

.modal-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  color: var(--text-blue);
  margin-bottom: 1.25rem;
  line-height: 1.3;
}

.modal-content-text {
  font-size: 0.98rem;
  color: #2d3748;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-close-modal {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--button-purple);
  color: white;
  border: none;
  padding: 0.65rem 1.5rem;
  border-radius: 5.5rem;
  cursor: pointer;
  box-shadow: var(--shadow-purple);
  transition: all 0.25s ease;
}

.btn-close-modal:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

/* Transiciones y animaciones */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .search-filter-bar {
    width: 100%;
  }
  
  .filter-pill {
    padding: 0.45rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
