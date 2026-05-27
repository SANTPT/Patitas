<template>
  <div class="tienda-page">

    <!-- HERO -->
    <header class="page-header">
      <div class="header-content container">
        <span class="header-tag">🛍️ Tienda Patitas</span>
        <h1 class="page-title">Juguetes y Recursos para cada patita</h1>
        <p class="page-subtitle">Material especializado recomendado por terapeutas para potenciar el desarrollo en casa.</p>
      </div>
      <div class="header-wave-bottom">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="var(--page-bg, #f0f8ff)"/>
        </svg>
      </div>
    </header>

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

      <!-- CTA: Consultar estado de pedido (mejorado con modal inline) -->
      <div class="order-status-cta">
        <div class="cta-left">
          <span class="cta-icon">📦</span>
          <div>
            <strong>¿Ya realizaste una compra?</strong>
            <span>Consulta el estado de tu envío o gestiona cambios y devoluciones.</span>
          </div>
        </div>
        <div class="cta-actions">
          <button class="cta-btn-primary" @click="orderModalOpen = true">
            <span class="material-symbols-outlined">local_shipping</span>
            Estado del pedido
          </button>
          <RouterLink to="/devoluciones" class="cta-btn-secondary">
            <span class="material-symbols-outlined">assignment_return</span>
            Cambios y devoluciones
          </RouterLink>
        </div>
      </div>

    <!-- Modal: Rastreo rápido de pedido -->
    <Transition name="modal-fade">
      <div v-if="orderModalOpen" class="order-modal-overlay" @click.self="orderModalOpen = false">
        <div class="order-modal">
          <div class="omodal-header">
            <span class="material-symbols-outlined omodal-icon">local_shipping</span>
            <div>
              <h3>Consultar estado de pedido</h3>
              <p>Introduce el código de tu pedido (PT-XXXXX)</p>
            </div>
            <button class="omodal-close" @click="orderModalOpen = false" aria-label="Cerrar">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div v-if="!modalOrderFound && !modalError" class="omodal-search">
            <div class="omodal-input-wrap">
              <input
                v-model="modalOrderCode"
                type="text"
                placeholder="PT-XXXXX"
                class="omodal-input"
                @keyup.enter="findModalOrder"
                autocomplete="off"
              />
              <button class="omodal-search-btn" @click="findModalOrder">
                <span class="material-symbols-outlined">search</span>
              </button>
            </div>
            <p class="omodal-hint">El código lo encontrarás en el email de confirmación de tu compra.</p>
          </div>

          <div v-if="modalError" class="omodal-error">
            <span class="material-symbols-outlined">error</span>
            Código no encontrado. Comprueba que lo has escrito correctamente.
            <button class="omodal-retry" @click="modalError = false; modalOrderCode = ''">Intentar de nuevo</button>
          </div>

          <div v-if="modalOrderFound" class="omodal-result">
            <div class="omodal-status-row">
              <div class="omodal-status-badge" :class="modalOrder.status">
                <span class="material-symbols-outlined">{{ statusIcon(modalOrder.status) }}</span>
                {{ statusLabel(modalOrder.status) }}
              </div>
              <span class="omodal-order-id">{{ modalOrder.id }}</span>
            </div>
            <div class="omodal-meta">
              <div><small>Fecha</small><strong>{{ fmtDate(modalOrder.createdAt) }}</strong></div>
              <div><small>Entrega estimada</small><strong class="green">{{ fmtDate(modalOrder.estimatedDelivery) }}</strong></div>
              <div><small>Total</small><strong>{{ fmt(modalOrder.total) }}</strong></div>
            </div>
            <div class="omodal-actions">
              <RouterLink :to="{ name: 'pedido', params: { id: modalOrder.id } }" class="omodal-full-btn" @click="orderModalOpen = false">
                <span class="material-symbols-outlined">open_in_new</span>
                Ver detalle completo
              </RouterLink>
              <RouterLink :to="{ name: 'devoluciones', query: { order: modalOrder.id, tab: 'devoluciones' } }" class="omodal-dev-btn" @click="orderModalOpen = false">
                <span class="material-symbols-outlined">assignment_return</span>
                Solicitar cambio / devolución
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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
import { RouterLink } from 'vue-router';
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

// ── Modal rastreo de pedido
const orderModalOpen   = ref(false);
const modalOrderCode   = ref('');
const modalOrderFound  = ref(false);
const modalError       = ref(false);
const modalOrder       = ref(null);

function findModalOrder() {
  const code = modalOrderCode.value.trim().toUpperCase();
  const found = cartStore.getOrder(code);
  if (found) {
    modalOrder.value = found;
    modalOrderFound.value = true;
    modalError.value = false;
  } else {
    modalError.value = true;
    modalOrderFound.value = false;
  }
}
function statusIcon(status) {
  const map = { preparing: 'inventory_2', shipped: 'local_shipping', delivered: 'home' };
  return map[status] || 'receipt_long';
}
function statusLabel(status) {
  const map = { preparing: 'En preparación', shipped: 'En camino', delivered: 'Entregado' };
  return map[status] || 'Pedido recibido';
}
function fmt(val) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

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
.page-header {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 4.5rem 0 5.5rem;
  text-align: center;
  margin-bottom: 2rem;
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
  margin: 0 auto;
  line-height: 1.6;
}

.hero-tag {
  display: inline-block;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(197,140,242,0.35);
  color: #1a5b82;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem; font-weight: 600;
  padding: 5px 16px; border-radius: 99px;
  margin-bottom: 1rem;
}

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

/* ── ORDER STATUS CTA ───────────────────────────────────────── */
.order-status-cta {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1.25rem; flex-wrap: wrap;
  background: white;
  border: 1.5px solid rgba(197,140,242,.2);
  border-radius: 1.25rem;
  padding: 1.25rem 1.75rem;
  margin-top: 3rem;
  box-shadow: 0 4px 20px rgba(26,91,130,.04);
}
.cta-left {
  display: flex; align-items: center; gap: 1rem;
}
.cta-icon { font-size: 2rem; }
.cta-left strong { display: block; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700; color: var(--text-blue); }
.cta-left span { font-size: .85rem; color: var(--text-blue); opacity: .65; }
.cta-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  background: #c58cf2; color: white; padding: .75rem 1.5rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: .95rem; font-weight: 700; text-decoration: none;
  transition: all .22s; white-space: nowrap;
  box-shadow: 0 4px 15px rgba(197,140,242,.3);
}
.cta-btn:hover { background: #b373e6; transform: translateY(-1px); }
.cta-btn .material-symbols-outlined { font-size: 1.1rem; }

/* ── TOAST ──────────────────────────────────────────────────── */
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

/* ── ORDER MODAL & UPDATED CTA ─────────────────────────────── */
.cta-actions { display: flex; gap: .6rem; flex-wrap: wrap; }
.cta-btn-primary {
  display: inline-flex; align-items: center; gap: .5rem;
  background: #c58cf2; color: white; padding: .75rem 1.5rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: .95rem; font-weight: 700; border: none; cursor: pointer;
  text-decoration: none; transition: all .22s; white-space: nowrap;
  box-shadow: 0 4px 15px rgba(197,140,242,.3);
}
.cta-btn-primary:hover { background: #b373e6; transform: translateY(-1px); }
.cta-btn-secondary {
  display: inline-flex; align-items: center; gap: .5rem;
  background: white; color: var(--text-blue);
  border: 1.5px solid rgba(197,140,242,.4);
  padding: .7rem 1.3rem; border-radius: 5rem;
  font-family: 'Fredoka', sans-serif;
  font-size: .95rem; font-weight: 700;
  text-decoration: none; transition: all .22s; white-space: nowrap;
}
.cta-btn-secondary:hover { border-color: #c58cf2; background: #faf7ff; }
.cta-btn-secondary .material-symbols-outlined { font-size: 1.1rem; }

.order-modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(26,91,130,.45); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.order-modal {
  background: white; border-radius: 1.5rem; padding: 2rem;
  width: 100%; max-width: 26rem;
  box-shadow: 0 20px 60px rgba(26,91,130,.18);
  border: 1.5px solid rgba(197,140,242,.2);
}
.omodal-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
.omodal-icon { font-size: 2rem; color: #c58cf2; flex-shrink: 0; }
.omodal-header h3 { font-family: 'Fredoka', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--text-blue); margin: 0 0 .2rem; }
.omodal-header p { font-size: .85rem; opacity: .65; margin: 0; }
.omodal-close {
  margin-left: auto; background: none; border: none; cursor: pointer;
  color: var(--text-blue); opacity: .5; display: flex; padding: .2rem;
  transition: opacity .2s;
}
.omodal-close:hover { opacity: 1; }
.omodal-input-wrap { display: flex; gap: .5rem; margin-bottom: .75rem; }
.omodal-input {
  flex: 1; font-family: 'Fredoka', sans-serif; font-size: 1.1rem; font-weight: 700;
  text-align: center; letter-spacing: .08em; text-transform: uppercase;
  padding: .7rem 1rem; border-radius: .75rem;
  border: 1.5px solid rgba(197,140,242,.3); background: #fcf8ff;
  color: var(--text-blue); outline: none; transition: all .22s;
}
.omodal-input:focus { border-color: #c58cf2; box-shadow: 0 0 0 3px rgba(197,140,242,.12); }
.omodal-search-btn {
  background: #c58cf2; color: white; border: none;
  border-radius: .75rem; padding: .7rem 1rem; cursor: pointer;
  display: flex; align-items: center; transition: background .2s;
}
.omodal-search-btn:hover { background: #b373e6; }
.omodal-hint { font-size: .8rem; opacity: .6; }
.omodal-error {
  display: flex; flex-direction: column; align-items: center; gap: .75rem;
  color: #e53e3e; font-size: .9rem; text-align: center; padding: .5rem 0;
}
.omodal-error .material-symbols-outlined { font-size: 2.5rem; }
.omodal-retry {
  background: none; border: 1.5px solid rgba(229,62,62,.3);
  color: #e53e3e; border-radius: 5rem; padding: .4rem 1rem;
  font-family: 'Fredoka', sans-serif; font-size: .9rem; cursor: pointer;
}
.omodal-status-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.omodal-status-badge {
  display: inline-flex; align-items: center; gap: .4rem;
  border-radius: 5rem; padding: .3rem .9rem;
  font-size: .85rem; font-weight: 700;
  background: rgba(197,140,242,.12); color: #7c3aed;
  border: 1px solid rgba(197,140,242,.3);
}
.omodal-status-badge.delivered { background: rgba(52,211,153,.12); color: #059669; border-color: rgba(52,211,153,.3); }
.omodal-order-id { font-size: .85rem; font-weight: 700; color: #c58cf2; }
.omodal-meta { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.omodal-meta > div { display: flex; flex-direction: column; gap: .1rem; }
.omodal-meta small { font-size: .72rem; text-transform: uppercase; letter-spacing: .04em; opacity: .55; }
.omodal-meta strong { font-size: .95rem; }
.omodal-meta .green { color: #059669; }
.omodal-actions { display: flex; flex-direction: column; gap: .6rem; }
.omodal-full-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  background: #c58cf2; color: white; padding: .8rem 1.25rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: .95rem; font-weight: 700; text-decoration: none;
  transition: all .22s; justify-content: center;
}
.omodal-full-btn:hover { background: #b373e6; }
.omodal-dev-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  background: white; color: var(--text-blue);
  border: 1.5px solid rgba(197,140,242,.35); padding: .75rem 1.25rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: .95rem; font-weight: 700; text-decoration: none;
  transition: all .22s; justify-content: center;
}
.omodal-dev-btn:hover { background: #faf7ff; border-color: #c58cf2; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
