<template>
  <div class="tienda-page">

    <!-- HERO -->
    <div class="tienda-hero">
      <div class="hero-inner container">
        <span class="hero-tag">🛍️ Tienda Patitas</span>
        <h1>Juguetes y recursos<br><em>para cada patita</em></h1>
        <p>Material especializado recomendado por terapeutas para potenciar el desarrollo en casa.</p>
      </div>
    </div>

    <div class="tienda-body container">

      <!-- TOP BAR: buscador + filtros -->
      <div class="top-bar">

        <!-- Buscador -->
        <div class="search-pill" :class="{ focused: searchFocused }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar productos..."
            @focus="searchFocused = true"
            @blur="searchFocused = false"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-x">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Pills de filtro -->
        <div class="filter-pills">

          <div
            v-for="f in filterDefs"
            :key="f.key"
            class="fpill"
            :class="{ 'is-open': openFilter === f.key }"
            v-click-outside="closeDropdowns"
          >
            <button
              class="fpill-btn"
              :class="{
                'is-active': activeFilters[f.key] !== 'todos',
                'is-open': openFilter === f.key
              }"
              @click="toggleFilter(f.key)"
            >
              <span>{{ getLabel(f) }}</span>
              <svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            <!-- Dropdown -->
            <div class="fpill-dropdown">
              <div
                v-for="opt in f.options"
                :key="opt.value"
                class="dopt"
                :class="{ selected: activeFilters[f.key] === opt.value }"
                @click="selectFilter(f.key, opt)"
              >
                <span class="dopt-icon">{{ opt.emoji }}</span>
                <span>{{ opt.label }}</span>
                <span class="dopt-check">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Results row -->
      <div class="results-row">
        <span class="results-txt">
          <strong>{{ filteredProducts.length }}</strong>
          {{ filteredProducts.length === 1 ? 'producto' : 'productos' }}
        </span>
        <button v-if="hasActiveFilters" @click="clearAll" class="clear-all">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          Limpiar filtros
        </button>
      </div>

      <!-- Skeleton -->
      <div v-if="isLoading" class="products-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card">
          <div class="sk-img"></div>
          <div class="sk-body">
            <div class="sk-line w70"></div>
            <div class="sk-line w50"></div>
            <div class="sk-line w90"></div>
            <div class="sk-line w40"></div>
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div v-else-if="filteredProducts.length > 0" class="products-grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          @add-to-cart="addToCart"
        />
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No encontramos productos</h3>
        <p>Prueba con otros filtros o términos de búsqueda.</p>
        <button @click="clearAll" class="empty-btn">Ver todos los productos</button>
      </div>

    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toastVisible" class="cart-toast">
        <span>🛒</span>
        <span>¡Producto añadido al carrito!</span>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../services/api';
import ProductCard from '../components/ProductCard.vue';
import { useCartStore } from '../stores/cart';

const cartStore  = useCartStore();
const products   = ref([]);
const isLoading  = ref(true);
const searchQuery = ref('');
const searchFocused = ref(false);
const toastVisible  = ref(false);
const openFilter    = ref(null);

const activeFilters = ref({ tipo: 'todos', edad: 'todos', precio: 'todos' });

const filterDefs = [
  {
    key: 'tipo', label: 'Tipo',
    options: [
      { value: 'todos',  emoji: '🎁', label: 'Todos'     },
      { value: 'cognitivo', emoji: '🧠', label: 'Cognitivo' },
      { value: 'sensorial', emoji: '✨', label: 'Sensorial' },
      { value: 'motor',     emoji: '🤸', label: 'Motor'     },
    ]
  },
  {
    key: 'edad', label: 'Edad',
    options: [
      { value: 'todos', emoji: '👶', label: 'Todas las edades' },
      { value: '0-3',   emoji: '🍼', label: '0 – 3 años'       },
      { value: '3-6',   emoji: '🧒', label: '3 – 6 años'       },
      { value: '7+',    emoji: '🧑', label: 'Más de 7 años'    },
    ]
  },
  {
    key: 'precio', label: 'Precio',
    options: [
      { value: 'todos', emoji: '💶', label: 'Cualquier precio' },
      { value: 'bajo',  emoji: '🟢', label: 'Hasta 20 €'       },
      { value: 'medio', emoji: '🟡', label: '20 € – 40 €'      },
      { value: 'alto',  emoji: '🔴', label: 'Más de 40 €'      },
    ]
  },
];

function getLabel(f) {
  if (activeFilters.value[f.key] === 'todos') return f.label;
  return f.options.find(o => o.value === activeFilters.value[f.key])?.label || f.label;
}

function toggleFilter(key) {
  openFilter.value = openFilter.value === key ? null : key;
}

function closeDropdowns() {
  openFilter.value = null;
}

function selectFilter(key, opt) {
  activeFilters.value[key] = opt.value;
  openFilter.value = null;
}

const hasActiveFilters = computed(() =>
  activeFilters.value.tipo !== 'todos' ||
  activeFilters.value.edad !== 'todos' ||
  activeFilters.value.precio !== 'todos' ||
  searchQuery.value.trim() !== ''
);

const filteredProducts = computed(() =>
  products.value.filter(p => {
    if (activeFilters.value.tipo !== 'todos' && p.category !== activeFilters.value.tipo) return false;
    if (activeFilters.value.edad !== 'todos') {
      if (activeFilters.value.edad === '0-3' && p.ageRange !== '0-3 años') return false;
      if (activeFilters.value.edad === '3-6' && p.ageRange !== '3-6 años') return false;
      if (activeFilters.value.edad === '7+'  && p.ageRange !== '7+ años')  return false;
    }
    if (activeFilters.value.precio !== 'todos') {
      if (activeFilters.value.precio === 'bajo'  && p.price >= 20) return false;
      if (activeFilters.value.precio === 'medio' && (p.price < 20 || p.price > 40)) return false;
      if (activeFilters.value.precio === 'alto'  && p.price <= 40) return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  })
);

function clearAll() {
  activeFilters.value = { tipo: 'todos', edad: 'todos', precio: 'todos' };
  searchQuery.value = '';
  openFilter.value = null;
}

function showToast() {
  toastVisible.value = true;
  setTimeout(() => { toastVisible.value = false; }, 2500);
}

function addToCart(product) {
  cartStore.addItem(product);
  showToast();
}

// Cerrar dropdown al hacer clic fuera
function handleClickOutside(e) {
  if (!e.target.closest('.fpill')) closeDropdowns();
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  try {
    const res = await api.get('/productos');
    products.value = res.data;
  } catch (e) {
    console.error('Error cargando productos:', e);
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.tienda-page { min-height: 100vh; background: #f0f8ff; padding-bottom: 60px; }

/* ── HERO ── */
.tienda-hero {
  background: linear-gradient(135deg, #e8f4fd 0%, #ede4ff 60%, #e0f2fe 100%);
  padding: 48px 0 44px;
  text-align: center;
}
.hero-inner { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.hero-tag {
  display: inline-block;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(197,140,242,0.35);
  color: #1a5b82;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem; font-weight: 600;
  padding: 5px 16px; border-radius: 99px;
}
.tienda-hero h1 {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(1.9rem, 4vw, 2.7rem);
  font-weight: 700; color: #1a5b82; line-height: 1.15;
}
.tienda-hero h1 em { font-style: normal; color: #c58cf2; }
.tienda-hero p { font-size: 1rem; color: #1a5b82; opacity: 0.75; max-width: 480px; line-height: 1.6; }

/* ── BODY ── */
.tienda-body { padding-top: 32px; }

/* ── TOP BAR ── */
.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

/* Buscador */
.search-pill {
  display: flex; align-items: center; gap: 10px;
  background: white;
  border: 1.5px solid rgba(197,140,242,0.18);
  border-radius: 99px;
  padding: 10px 18px;
  flex: 1; min-width: 200px; max-width: 380px;
  box-shadow: 0 1px 8px rgba(26,91,130,0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-pill.focused {
  border-color: #c58cf2;
  box-shadow: 0 0 0 3px rgba(197,140,242,0.12);
}
.search-pill svg { color: rgba(26,91,130,0.35); flex-shrink: 0; }
.search-pill input {
  flex: 1; border: none; outline: none;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem; color: #1a5b82; background: transparent; min-width: 0;
}
.search-pill input::placeholder { color: rgba(26,91,130,0.35); }
.clear-x {
  background: rgba(197,140,242,0.12); border: none; border-radius: 50%;
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #c58cf2; transition: background 0.2s; flex-shrink: 0;
}
.clear-x:hover { background: rgba(197,140,242,0.25); }

/* Pills container */
.filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }

/* Cada pill */
.fpill { position: relative; }

.fpill-btn {
  display: flex; align-items: center; gap: 7px;
  background: white;
  border: 1.5px solid rgba(26,91,130,0.1);
  border-radius: 99px;
  padding: 8px 16px;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.88rem; font-weight: 500; color: #1a5b82;
  cursor: pointer; transition: all 0.2s; white-space: nowrap; user-select: none;
}
.fpill-btn:hover { border-color: rgba(197,140,242,0.4); background: #faf7ff; }
.fpill-btn.is-open { border-color: #c58cf2; background: #faf7ff; color: #7c3aed; }
.fpill-btn.is-active {
  background: #c58cf2; border-color: #c58cf2; color: white;
  box-shadow: 0 2px 10px rgba(197,140,242,0.35);
}

.arrow { transition: transform 0.22s ease; flex-shrink: 0; }
.fpill-btn.is-open .arrow { transform: rotate(180deg); }
.fpill-btn.is-active .arrow { transform: rotate(180deg); }

/* Dropdown */
.fpill-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  border: 1.5px solid rgba(197,140,242,0.18);
  border-radius: 18px;
  padding: 6px;
  min-width: 195px;
  box-shadow: 0 8px 32px rgba(26,91,130,0.1);
  z-index: 200;
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
  pointer-events: none;
  transition: all 0.22s cubic-bezier(.34,1.56,.64,1);
}
.fpill.is-open .fpill-dropdown {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: all;
}

.dopt {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 12px;
  cursor: pointer; font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem; font-weight: 500; color: #1a5b82;
  transition: background 0.15s;
}
.dopt:hover { background: rgba(197,140,242,0.07); }
.dopt.selected { background: rgba(197,140,242,0.1); color: #7c3aed; font-weight: 600; }

.dopt-icon { font-size: 1.05rem; width: 22px; text-align: center; flex-shrink: 0; }

.dopt-check {
  width: 18px; height: 18px; border-radius: 50%;
  border: 1.5px solid rgba(197,140,242,0.3);
  margin-left: auto; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.dopt.selected .dopt-check { background: #c58cf2; border-color: #c58cf2; color: white; }
.dopt-check svg { display: none; }
.dopt.selected .dopt-check svg { display: block; }

/* ── RESULTS ROW ── */
.results-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; padding: 0 2px;
}
.results-txt { font-family: 'Fredoka', sans-serif; font-size: 0.9rem; color: #1a5b82; opacity: 0.62; }
.results-txt strong { opacity: 1; }
.clear-all {
  font-family: 'Fredoka', sans-serif; font-size: 0.85rem; font-weight: 600;
  color: #c58cf2; background: none; border: none; cursor: pointer;
  display: flex; align-items: center; gap: 5px; padding: 0; transition: color 0.2s;
}
.clear-all:hover { color: #9b59b6; }

/* ── GRID ── */
.products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }

/* ── SKELETON ── */
.skeleton-card { background: white; border-radius: 22px; overflow: hidden; border: 1.5px solid rgba(197,140,242,0.08); }
.sk-img { height: 180px; background: linear-gradient(90deg,#f0f4f8 25%,#e8edf2 50%,#f0f4f8 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 9px; }
.sk-line { height: 10px; border-radius: 99px; background: linear-gradient(90deg,#f0f4f8 25%,#e8edf2 50%,#f0f4f8 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.w40 { width: 40%; } .w50 { width: 50%; } .w70 { width: 70%; } .w90 { width: 90%; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── EMPTY ── */
.empty-state { text-align: center; padding: 72px 20px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.empty-icon { font-size: 3.5rem; }
.empty-state h3 { font-family: 'Fredoka', sans-serif; font-size: 1.4rem; font-weight: 700; color: #1a5b82; }
.empty-state p { font-size: 0.95rem; color: #1a5b82; opacity: 0.65; }
.empty-btn { font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; background: #c58cf2; color: white; border: none; border-radius: 99px; padding: 11px 28px; cursor: pointer; transition: all 0.22s; box-shadow: 0 4px 16px rgba(197,140,242,0.4); margin-top: 4px; }
.empty-btn:hover { background: #b373e6; transform: translateY(-2px); }

/* ── TOAST ── */
.cart-toast { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: #1a5b82; color: white; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; padding: 14px 28px; border-radius: 99px; display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 32px rgba(26,91,130,0.3); z-index: 999; white-space: nowrap; }
.toast-enter-active, .toast-leave-active { transition: all 0.35s cubic-bezier(.34,1.56,.64,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }

/* ── RESPONSIVE ── */
@media (max-width: 900px) { .products-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 640px) {
  .tienda-body { padding-top: 24px; }
  .top-bar { gap: 10px; }
  .search-pill { max-width: 100%; }
  .products-grid { grid-template-columns: repeat(2,1fr); gap: 14px; }
}
@media (max-width: 430px) { .products-grid { grid-template-columns: 1fr; } }
</style>
