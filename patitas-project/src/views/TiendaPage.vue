<template>
  <div class="tienda-page container">
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><RouterLink to="/">Inicio</RouterLink></li>
        <li><span class="material-symbols-outlined separator">chevron_right</span></li>
        <li class="active" aria-current="page">Tienda</li>
      </ol>
    </nav>

    <!-- Cabecera de la sección -->
    <header class="section-header">
      <span class="header-tag">TIENDA DE APOYO</span>
      <h1>Desarrollo Cognitivo y Motriz</h1>
      <p class="header-description">
        Material didáctico y juguetes especializados recomendados por terapeutas para potenciar el desarrollo cognitivo, sensorial y motor en el hogar.
      </p>
    </header>

    <!-- Layout principal: Filtros + Catálogo -->
    <div class="store-layout">
      <!-- Columna Filtros (Izquierda) -->
      <aside class="filters-sidebar">
        <div class="filter-card">
          <div class="filter-card-header">
            <h3>Filtros</h3>
            <button @click="clearAllFilters" class="clear-all-btn" v-if="hasActiveFilters">
              Limpiar todo
            </button>
          </div>

          <!-- Filtro de Categoría -->
          <div class="filter-group">
            <h4>Categoría</h4>
            <div class="radio-group">
              <label 
                v-for="cat in categoryOptions" 
                :key="cat.id" 
                class="radio-label" 
                :class="{ active: activeCategory === cat.id }"
              >
                <input 
                  type="radio" 
                  name="category" 
                  :value="cat.id" 
                  v-model="activeCategory" 
                />
                <span class="custom-radio"></span>
                <span>{{ cat.label }}</span>
              </label>
            </div>
          </div>

          <!-- Filtro de Edad -->
          <div class="filter-group">
            <h4>Edad recomendada</h4>
            <div class="radio-group">
              <label 
                v-for="age in ageOptions" 
                :key="age.id" 
                class="radio-label" 
                :class="{ active: activeAge === age.id }"
              >
                <input 
                  type="radio" 
                  name="age" 
                  :value="age.id" 
                  v-model="activeAge" 
                />
                <span class="custom-radio"></span>
                <span>{{ age.label }}</span>
              </label>
            </div>
          </div>

          <!-- Filtro de Precio -->
          <div class="filter-group">
            <h4>Rango de precio</h4>
            <div class="radio-group">
              <label 
                v-for="pr in priceOptions" 
                :key="pr.id" 
                class="radio-label" 
                :class="{ active: activePriceRange === pr.id }"
              >
                <input 
                  type="radio" 
                  name="price" 
                  :value="pr.id" 
                  v-model="activePriceRange" 
                />
                <span class="custom-radio"></span>
                <span>{{ pr.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      <!-- Columna Catálogo (Derecha) -->
      <main class="catalog-main">

        <!-- Buscador por texto -->
        <div class="search-bar-wrap">
          <div class="search-bar" :class="{ focused: searchFocused }">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar producto (ej: sensorial, madera, puzzle...)"
              @focus="searchFocused = true"
              @blur="searchFocused = false"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search" aria-label="Limpiar búsqueda">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Barra de tags activos y cantidad -->
        <div class="catalog-header-bar">
          <div class="results-count">
            <span class="count-number">{{ filteredProducts.length }}</span> 
            {{ filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados' }}
          </div>

          <!-- Filtros activos en formato de tags -->
          <div class="active-tags-row" v-if="hasActiveFilters">
            <div v-if="activeCategory !== 'todos'" class="filter-tag">
              <span>Categoría: {{ getCategoryLabel(activeCategory) }}</span>
              <button @click="activeCategory = 'todos'" aria-label="Quitar filtro categoría">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div v-if="activeAge !== 'todos'" class="filter-tag">
              <span>Edad: {{ getAgeLabel(activeAge) }}</span>
              <button @click="activeAge = 'todos'" aria-label="Quitar filtro edad">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div v-if="activePriceRange !== 'todos'" class="filter-tag">
              <span>Precio: {{ getPriceLabel(activePriceRange) }}</span>
              <button @click="activePriceRange = 'todos'" aria-label="Quitar filtro precio">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Skeleton loaders al cargar -->
        <div v-if="isLoading" class="products-grid">
          <div v-for="i in 6" :key="i" class="product-skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-text title"></div>
            <div class="skeleton-text short"></div>
            <div class="skeleton-text footer"></div>
          </div>
        </div>

        <!-- Grid de productos -->
        <div v-else-if="filteredProducts.length > 0" class="products-grid">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
          />
        </div>

        <!-- Vista vacía (no resultados) -->
        <div v-else class="empty-results">
          <span class="material-symbols-outlined empty-icon">storefront</span>
          <h3>No encontramos productos para tu búsqueda</h3>
          <p>Prueba a cambiar tus filtros de búsqueda o restablecer la selección actual.</p>
          <button @click="clearAllFilters" class="reset-btn">
            Restablecer filtros
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import ProductCard from '../components/ProductCard.vue';
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

// Estados reactivos
const products = ref([]);
const isLoading = ref(true);

const searchQuery = ref('');
const searchFocused = ref(false);

const activeCategory = ref('todos');
const activeAge = ref('todos');
const activePriceRange = ref('todos');

// Opciones de filtros
const categoryOptions = [
  { id: 'todos', label: 'Todos los productos' },
  { id: 'cognitivo', label: 'Cognitivo' },
  { id: 'sensorial', label: 'Sensorial' },
  { id: 'motor', label: 'Motor' }
];

const ageOptions = [
  { id: 'todos', label: 'Todas las edades' },
  { id: '0-3', label: '0 a 3 años' },
  { id: '3-6', label: '3 a 6 años' },
  { id: '7+', label: 'Más de 7 años' }
];

const priceOptions = [
  { id: 'todos', label: 'Cualquier precio' },
  { id: 'bajo', label: 'Menos de 20 €' },
  { id: 'medio', label: 'Entre 20 y 40 €' },
  { id: 'alto', label: 'Más de 40 €' }
];

// Obtener productos desde API simulada
onMounted(async () => {
  try {
    const response = await api.get('/productos');
    products.value = response.data;
  } catch (error) {
    console.error('Error al obtener productos de la tienda:', error);
  } finally {
    isLoading.value = false;
  }
});

// Comprobar si hay filtros activos
const hasActiveFilters = computed(() => {
  return activeCategory.value !== 'todos' ||
         activeAge.value !== 'todos' ||
         activePriceRange.value !== 'todos' ||
         searchQuery.value.trim() !== '';
});

// Filtrado local reactivo
const filteredProducts = computed(() => {
  return products.value.filter(p => {
    // 1. Filtrar por categoría
    if (activeCategory.value !== 'todos' && p.category !== activeCategory.value) {
      return false;
    }

    // 2. Filtrar por edad
    if (activeAge.value !== 'todos') {
      if (activeAge.value === '0-3' && p.ageRange !== '0-3 años') return false;
      if (activeAge.value === '3-6' && p.ageRange !== '3-6 años') return false;
      if (activeAge.value === '7+' && p.ageRange !== '7+ años') return false;
    }

    // 3. Filtrar por precio
    if (activePriceRange.value !== 'todos') {
      if (activePriceRange.value === 'bajo' && p.price >= 20) return false;
      if (activePriceRange.value === 'medio' && (p.price < 20 || p.price > 40)) return false;
      if (activePriceRange.value === 'alto' && p.price <= 40) return false;
    }

    // 4. Filtrar por búsqueda de texto
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchCat  = p.categoryLabel?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    return true;
  });
});

// Helpers para etiquetas de tags
function getCategoryLabel(id) {
  return categoryOptions.find(o => o.id === id)?.label || id;
}

function getAgeLabel(id) {
  return ageOptions.find(o => o.id === id)?.label || id;
}

function getPriceLabel(id) {
  return priceOptions.find(o => o.id === id)?.label || id;
}

// Limpiar filtros
function clearAllFilters() {
  activeCategory.value = 'todos';
  activeAge.value = 'todos';
  activePriceRange.value = 'todos';
  searchQuery.value = '';
}

// Agregar al carrito
function addToCart(product) {
  const added = cartStore.addItem(product, 1);
  if (added) {
    // Lanzar evento global para el Toast
    const event = new CustomEvent('show-toast', {
      detail: {
        message: `¡${product.name} agregado al carrito!`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  }
}
</script>

<style scoped>
.tienda-page {
  padding-top: 1.5rem;
  padding-bottom: 4rem;
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue);
  min-height: 80vh;
}

/* Breadcrumbs */
.breadcrumbs {
  margin-bottom: 1.5rem;
}

.breadcrumbs ol {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.44rem;
}

.breadcrumbs a {
  font-size: 0.9rem;
  color: var(--text-blue);
  opacity: 0.7;
  text-decoration: none;
  transition: opacity 0.2s ease, color 0.2s ease;
}

.breadcrumbs a:hover {
  opacity: 1;
  color: var(--button-purple);
}

.breadcrumbs .separator {
  font-size: 1rem;
  opacity: 0.4;
  vertical-align: middle;
}

.breadcrumbs .active {
  font-size: 0.9rem;
  color: var(--text-blue);
  font-weight: 600;
}

/* Cabecera */
.section-header {
  margin-bottom: 2.5rem;
}

.header-tag {
  background: var(--button-purple-soft);
  color: var(--button-purple);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.33rem 0.78rem;
  border-radius: 5.5rem;
  letter-spacing: 0.05rem;
  display: inline-block;
  margin-bottom: 0.67rem;
}

.section-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.67rem;
}

.header-description {
  font-size: 1.05rem;
  opacity: 0.8;
  max-width: 45rem;
  line-height: 1.5;
}

/* Layout Tienda */
.store-layout {
  display: grid;
  grid-template-columns: 16rem 1fr;
  gap: 2rem;
  align-items: start;
}

/* Sidebar de filtros */
.filters-sidebar {
  position: sticky;
  top: 6.5rem;
}

.filter-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(26, 91, 130, 0.05);
}

.filter-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed rgba(26, 91, 130, 0.1);
  padding-bottom: 0.89rem;
  margin-bottom: 1.11rem;
}

.filter-card-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

.clear-all-btn {
  background: none;
  border: none;
  color: var(--button-purple);
  font-family: 'Fredoka', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.clear-all-btn:hover {
  color: var(--button-purple-hover);
  text-decoration: underline;
}

.filter-group {
  margin-bottom: 1.33rem;
}

.filter-group h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.67rem;
  opacity: 0.95;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.56rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.56rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s ease;
  user-select: none;
}

.radio-label:hover {
  color: var(--button-purple);
}

.radio-label.active {
  font-weight: 600;
  color: var(--button-purple);
}

.radio-label input {
  display: none;
}

.custom-radio {
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 50%;
  border: 2px solid #cbd5e0;
  display: inline-block;
  position: relative;
  transition: all 0.2s ease;
}

.radio-label input:checked + .custom-radio {
  border-color: var(--button-purple);
  background: white;
}

.radio-label input:checked + .custom-radio::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--button-purple);
}

/* Catálogo */
/* ── SEARCH BAR ── */
.search-bar-wrap {
  margin-bottom: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border: 1.5px solid rgba(197,140,242,0.25);
  border-radius: 99px;
  padding: 10px 16px;
  gap: 10px;
  transition: all 0.22s ease;
  box-shadow: 0 2px 12px rgba(26,91,130,0.06);
}

.search-bar.focused {
  border-color: #c58cf2;
  box-shadow: 0 0 0 3px rgba(197,140,242,0.15);
}

.search-icon {
  color: rgba(26,91,130,0.4);
  flex-shrink: 0;
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  color: #1a5b82;
  background: transparent;
  min-width: 0;
}

.search-bar input::placeholder {
  color: rgba(26,91,130,0.38);
}

.clear-search {
  background: rgba(197,140,242,0.15);
  border: none;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #c58cf2;
  flex-shrink: 0;
  transition: all 0.2s;
}
.clear-search:hover {
  background: rgba(197,140,242,0.3);
}

.catalog-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.catalog-header-bar {
  display: flex;
  flex-direction: column;
  gap: 0.78rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1rem;
  padding: 0.89rem 1.11rem;
  border: 1px solid rgba(26, 91, 130, 0.05);
}

.results-count {
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.85;
}

.count-number {
  font-weight: 700;
  color: var(--button-purple);
}

.active-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.56rem;
}

.filter-tag {
  background: white;
  border: 1px solid rgba(197, 140, 242, 0.3);
  color: var(--button-purple);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.28rem 0.67rem;
  border-radius: 5.5rem;
  display: flex;
  align-items: center;
  gap: 0.33rem;
  box-shadow: 0 0.11rem 0.33rem rgba(0,0,0,0.02);
}

.filter-tag button {
  background: none;
  border: none;
  color: var(--button-purple);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.filter-tag button:hover {
  opacity: 1;
}

.filter-tag button .material-symbols-outlined {
  font-size: 0.9rem;
}

/* Grid de Productos */
.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* Skeletons */
.product-skeleton-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.11rem;
  border: 1px solid rgba(26, 91, 130, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.78rem;
  height: 24rem;
}

.skeleton-img {
  width: 100%;
  height: 12.5rem;
  background: #edf2f7;
  border-radius: 1rem;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-text {
  background: #edf2f7;
  border-radius: 0.22rem;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-text.title {
  width: 80%;
  height: 1.33rem;
}

.skeleton-text.short {
  width: 100%;
  height: 2.2rem;
}

.skeleton-text.footer {
  width: 100%;
  height: 2.5rem;
  margin-top: auto;
  border-radius: 5.5rem;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Resultados Vacíos */
.empty-results {
  text-align: center;
  padding: 3rem 1.5rem;
  background: white;
  border-radius: 1.5rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(26, 91, 130, 0.05);
  max-width: 30rem;
  margin: 2rem auto;
}

.empty-icon {
  font-size: 3.5rem;
  color: var(--button-purple);
  opacity: 0.4;
  margin-bottom: 1rem;
}

.empty-results h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.56rem;
}

.empty-results p {
  font-size: 0.95rem;
  opacity: 0.75;
  line-height: 1.4;
  margin: 0 0 1.5rem;
}

.reset-btn {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  background: var(--button-purple);
  color: white;
  border: none;
  border-radius: 5.5rem;
  padding: 0.56rem 1.33rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-purple);
}

.reset-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

/* Responsivo */
@media (max-width: 960px) {
  .store-layout {
    grid-template-columns: 1fr;
  }
  .filters-sidebar {
    position: static;
  }
  .filter-card {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  .filter-card-header {
    grid-column: 1 / -1;
  }
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .tienda-page {
    padding: 0 16px;
  }
  .filter-card {
    grid-template-columns: 1fr 1fr;
  }
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .section-header h1 {
    font-size: 1.6rem;
  }
  .search-bar input {
    font-size: 0.9rem;
  }
}

@media (max-width: 430px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  .filter-card {
    grid-template-columns: 1fr;
  }
}
</style>
