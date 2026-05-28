<template>
  <div class="tienda-page">

    <!-- HERO -->
    <header class="page-header">
      <div class="header-content container">
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
          <button class="cta-btn-primary" @click="openModal">
            <span class="material-symbols-outlined">local_shipping</span>
            Estado del pedido
          </button>
          <RouterLink to="/devoluciones" class="cta-btn-secondary">
            <span class="material-symbols-outlined">assignment_return</span>
            Cambios y devoluciones
          </RouterLink>
        </div>
      </div>

    <!-- Modal: Estado de pedidos -->
    <Transition name="modal-fade">
      <div v-if="orderModalOpen" class="order-modal-overlay" @click.self="closeModal">
        <div class="order-modal" :class="{ wide: modalView === 'detail' || modalView === 'orders' }">

          <!-- Header -->
          <div class="omodal-header">
            <span class="material-symbols-outlined omodal-icon">local_shipping</span>
            <div>
              <h3>{{ modalHeaderTitle }}</h3>
              <p>{{ modalHeaderSub }}</p>
            </div>
            <button class="omodal-close" @click="closeModal" aria-label="Cerrar">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- VISTA: Lista de pedidos del usuario logueado -->
          <div v-if="modalView === 'orders'" class="omodal-orders-list">
            <div v-if="userOrders.length === 0" class="omodal-empty">
              <span class="material-symbols-outlined">shopping_bag</span>
              <p>Aún no tienes pedidos realizados.</p>
              <button class="omodal-retry" @click="closeModal">Cerrar</button>
            </div>
            <div v-else>
              <div
                v-for="ord in userOrders"
                :key="ord.id"
                class="omodal-order-row"
                @click="openOrderDetail(ord)"
              >
                <div class="omodal-row-left">
                  <div class="omodal-row-imgs">
                    <img v-for="item in ord.items.slice(0,3)" :key="item.productId" :src="item.image" :alt="item.name" />
                  </div>
                  <div class="omodal-row-info">
                    <span class="omodal-row-id">{{ ord.id }}</span>
                    <span class="omodal-row-date">{{ fmtShort(ord.createdAt) }} · {{ fmt(ord.total) }}</span>
                    <span class="omodal-row-products">{{ ord.items.map(i => i.name).join(', ') }}</span>
                  </div>
                </div>
                <div class="omodal-row-right">
                  <span class="omodal-chip" :class="'chip-' + ord.status">
                    <span class="material-symbols-outlined">{{ statusIcon(ord.status) }}</span>
                    {{ statusLabel(ord.status) }}
                  </span>
                  <span class="material-symbols-outlined omodal-arrow">chevron_right</span>
                </div>
              </div>
            </div>
          </div>

          <!-- VISTA: Búsqueda por código (invitado) -->
          <div v-if="modalView === 'search'" class="omodal-search">
            <div class="omodal-input-wrap" :class="{ error: modalError }">
              <span class="material-symbols-outlined omodal-prefix">receipt_long</span>
              <input
                v-model="modalOrderCode"
                type="text"
                placeholder="PT-XXXXX"
                class="omodal-input"
                @keyup.enter="findModalOrder"
                @input="modalError = false"
                autocomplete="off"
              />
              <button class="omodal-search-btn" @click="findModalOrder" :disabled="!modalOrderCode.trim()">
                <span class="material-symbols-outlined">search</span>
              </button>
            </div>
            <p v-if="modalError" class="omodal-error-msg">
              <span class="material-symbols-outlined">error</span>
              Código no encontrado. Comprueba que lo has escrito correctamente.
            </p>
            <p class="omodal-hint">Encuéntralo en el email de confirmación de tu compra.</p>
          </div>

          <!-- VISTA: Detalle de un pedido concreto -->
          <div v-if="modalView === 'detail' && modalOrder" class="omodal-detail">
            <!-- Botón volver -->
            <button v-if="authStore.isAuthenticated" class="omodal-back" @click="modalView = 'orders'">
              <span class="material-symbols-outlined">arrow_back</span>
              Mis pedidos
            </button>

            <!-- Estado general del pedido -->
            <div class="omodal-detail-header">
              <div class="omodal-chip large" :class="'chip-' + modalOrder.status">
                <span class="material-symbols-outlined">{{ statusIcon(modalOrder.status) }}</span>
                {{ statusLabel(modalOrder.status) }}
              </div>
              <div class="omodal-detail-meta">
                <span class="omodal-row-id">{{ modalOrder.id }}</span>
                <span class="omodal-row-date">{{ fmtDate(modalOrder.createdAt) }} · Entrega est. <strong class="green">{{ fmtShort(modalOrder.estimatedDelivery) }}</strong></span>
              </div>
            </div>

            <!-- Timeline compacto -->
            <div class="omodal-timeline">
              <div v-for="(st, i) in stages" :key="i" class="omodal-tl-item" :class="{ done: stageIndex(modalOrder) >= i, current: stageIndex(modalOrder) === i }">
                <div class="omodal-tl-dot">
                  <span class="material-symbols-outlined">{{ st.icon }}</span>
                </div>
                <div class="omodal-tl-connector" v-if="i < stages.length - 1"></div>
                <span class="omodal-tl-label">{{ st.label }}</span>
              </div>
            </div>

            <!-- Productos del pedido con botón eliminar individual -->
            <div class="omodal-products-section">
              <div class="omodal-section-header">
                <h4 class="omodal-section-title">Productos ({{ modalOrder.items.length }})</h4>
                <span v-if="modalOrder.status === 'cancelled'" class="omodal-cancelled-badge">
                  <span class="material-symbols-outlined">block</span> Cancelado
                </span>
              </div>
              <div class="omodal-product-list">
                <div
                  v-for="item in modalOrder.items"
                  :key="item.productId"
                  class="omodal-product-item"
                  :class="{ 'item-cancelled': item.cancelled }"
                >
                  <img :src="item.image" :alt="item.name" />
                  <div class="omodal-product-info">
                    <span>{{ item.name }}</span>
                    <small>×{{ item.quantity }} · {{ fmt(item.subtotal) }}</small>
                    <span v-if="item.cancelled" class="item-cancelled-tag">Eliminado</span>
                  </div>
                  <!-- Eliminar producto — disponible en cualquier estado activo -->
                  <button
                    v-if="!item.cancelled && modalOrder.status !== 'delivered'"
                    class="omodal-cancel-item-btn"
                    @click.stop="confirmCancelItem(item)"
                    :title="'Eliminar ' + item.name"
                  >
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Acciones del pedido -->
            <div class="omodal-detail-actions">

              <!-- Eliminar pedido completo — siempre visible si no está entregado ni ya cancelado -->
              <button
                v-if="modalOrder.status !== 'delivered' && modalOrder.status !== 'cancelled'"
                class="omodal-cancel-order-btn"
                @click="confirmCancelOrder"
              >
                <span class="material-symbols-outlined">delete_forever</span>
                Eliminar pedido completo
              </button>

              <!-- Ver detalle siempre disponible -->
              <RouterLink
                :to="{ name: 'pedido', params: { id: modalOrder.id } }"
                class="omodal-full-btn"
                @click="closeModal"
              >
                <span class="material-symbols-outlined">open_in_new</span>
                Ver detalle completo
              </RouterLink>

              <!-- Cambio / devolución — visible en todos los estados excepto cancelado -->
              <RouterLink
                v-if="modalOrder.status !== 'cancelled'"
                :to="{ name: 'devoluciones', query: { order: modalOrder.id } }"
                class="omodal-dev-btn"
                @click="closeModal"
              >
                <span class="material-symbols-outlined">assignment_return</span>
                Cambio / devolución
              </RouterLink>
            </div>
          </div>

          <!-- VISTA: Confirmación de cancelación -->
          <div v-if="modalView === 'cancel-confirm'" class="omodal-cancel-confirm">
            <span class="material-symbols-outlined omodal-cancel-icon">warning</span>
            <h4>{{ cancelTarget === 'order' ? '¿Eliminar el pedido completo?' : '¿Eliminar este producto?' }}</h4>
            <p v-if="cancelTarget === 'order'">
              Se eliminará el pedido <strong>{{ modalOrder?.id }}</strong> y todos sus productos. Si ya fue cobrado, recibirás el reembolso en 5–10 días laborales.
            </p>
            <p v-else>
              Se eliminará <strong>{{ cancelItem?.name }}</strong> de tu pedido {{ modalOrder?.id }}. El resto de los productos seguirá su curso normal.
            </p>
            <div class="omodal-cancel-actions">
              <button class="omodal-cancel-back" @click="modalView = 'detail'">Volver</button>
              <button class="omodal-cancel-confirm-btn" @click="executeCancellation">
                <span class="material-symbols-outlined">delete</span>
                Sí, eliminar
              </button>
            </div>
          </div>

          <!-- VISTA: Cancelación completada -->
          <div v-if="modalView === 'cancel-done'" class="omodal-cancel-done">
            <span class="material-symbols-outlined omodal-done-icon">task_alt</span>
            <h4>{{ cancelDoneTitle }}</h4>
            <p>{{ cancelDoneMsg }}</p>
            <div class="omodal-cancel-actions" style="justify-content:center">
              <button class="omodal-full-btn" @click="modalOrder ? modalView = 'detail' : modalView = 'orders'">
                <span class="material-symbols-outlined">{{ modalOrder ? "arrow_back" : "list" }}</span>
                {{ modalOrder ? "Ver pedido" : "Mis pedidos" }}
              </button>
              <button class="omodal-cancel-back" @click="closeModal">Cerrar</button>
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
import { useAuthStore } from '../stores/auth';

const cartStore  = useCartStore();
const authStore  = useAuthStore();
const products   = ref([]);
const isLoading  = ref(true);
const searchQuery = ref('');
const searchFocused = ref(false);
const toastVisible  = ref(false);
const openFilter    = ref(null);

// ── Modal de pedidos ──────────────────────────────────────
const orderModalOpen = ref(false);
const modalView      = ref('search'); // 'search'|'orders'|'detail'|'cancel-confirm'|'cancel-done'
const modalOrderCode = ref('');
const modalError     = ref(false);
const modalOrder     = ref(null);
const cancelTarget   = ref('order');
const cancelItem     = ref(null);

const userOrders = computed(() =>
  authStore.user?.id ? cartStore.getOrdersByUser(authStore.user.id) : []
);

const modalHeaderTitle = computed(() => {
  const v = modalView.value;
  if (v === 'orders') return 'Mis pedidos';
  if (v === 'detail') return 'Estado del pedido';
  if (v === 'cancel-confirm') return 'Confirmar cancelación';
  if (v === 'cancel-done') return 'Cancelación registrada';
  return 'Consultar pedido';
});
const modalHeaderSub = computed(() => {
  if (modalView.value === 'orders') return `${userOrders.value.length} pedido(s) realizados`;
  if (modalView.value === 'detail') return modalOrder.value?.id || '';
  return 'Introduce tu código de pedido';
});

function openModal() {
  if (authStore.isAuthenticated) {
    modalView.value = 'orders';
  } else {
    modalView.value = 'search';
  }
  modalOrderCode.value = '';
  modalError.value = false;
  orderModalOpen.value = true;
}

function closeModal() {
  orderModalOpen.value = false;
  setTimeout(() => {
    modalView.value = authStore.isAuthenticated ? 'orders' : 'search';
    modalOrderCode.value = '';
    modalError.value = false;
    cancelItem.value = null;
  }, 300);
}

function findModalOrder() {
  const code = modalOrderCode.value.trim().toUpperCase();
  const found = cartStore.getOrder(code);
  if (found) {
    modalOrder.value = found;
    modalView.value = 'detail';
    modalError.value = false;
  } else {
    modalError.value = true;
  }
}

function openOrderDetail(ord) {
  modalOrder.value = ord;
  modalView.value = 'detail';
}

function confirmCancelOrder() {
  cancelTarget.value = 'order';
  cancelItem.value = null;
  modalView.value = 'cancel-confirm';
}

function confirmCancelItem(item) {
  cancelTarget.value = 'item';
  cancelItem.value = item;
  modalView.value = 'cancel-confirm';
}

const cancelDoneTitle = ref('Eliminación registrada');
const cancelDoneMsg   = ref('');

async function executeCancellation() {
  if (cancelTarget.value === 'order') {
    const success = await cartStore.cancelOrder(modalOrder.value.id);
    if (success) {
      cancelDoneTitle.value = 'Pedido eliminado';
      cancelDoneMsg.value   = 'El pedido ' + modalOrder.value.id + ' ha sido eliminado. Si ya fue cobrado, recibirás el reembolso en 5–10 días laborales.';
      modalOrder.value = null;
    }
  } else if (cancelTarget.value === 'item' && cancelItem.value) {
    const res = await cartStore.cancelOrderItem(modalOrder.value.id, cancelItem.value.productId);
    if (res) {
      if (res.deleted) {
        cancelDoneTitle.value = 'Pedido eliminado';
        cancelDoneMsg.value   = 'Era el único producto. El pedido completo ha sido eliminado.';
        modalOrder.value = null;
      } else {
        modalOrder.value = JSON.parse(JSON.stringify(res.order));
        cancelDoneTitle.value = 'Producto eliminado';
        cancelDoneMsg.value   = cancelItem.value.name + ' ha sido eliminado del pedido. El resto sigue en curso.';
      }
    }
  }
  modalView.value = 'cancel-done';
}

const stages = [
  { icon: 'receipt_long',   label: 'Recibido'   },
  { icon: 'inventory_2',    label: 'Preparando' },
  { icon: 'local_shipping', label: 'En camino'  },
  { icon: 'home',           label: 'Entregado'  },
];

function stageIndex(ord) {
  return { preparing: 1, shipped: 2, delivered: 3, cancelled: 0 }[ord?.status] ?? 0;
}
function statusIcon(status) {
  return { preparing: 'inventory_2', shipped: 'local_shipping', delivered: 'home', cancelled: 'cancel' }[status] || 'receipt_long';
}
function statusLabel(status) {
  return { preparing: 'En preparación', shipped: 'En camino', delivered: 'Entregado', cancelled: 'Cancelado' }[status] || 'Recibido';
}
function fmt(val) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val ?? 0);
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
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


/* ── MODAL MEJORADO ─────────────────────────────────────── */
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
  max-height: 90vh; overflow-y: auto;
  transition: max-width .3s ease;
}
.order-modal.wide { max-width: 34rem; }
.omodal-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
.omodal-icon { font-size: 2rem; color: #c58cf2; flex-shrink: 0; }
.omodal-header h3 { font-family: 'Fredoka', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--text-blue); margin: 0 0 .2rem; }
.omodal-header p { font-size: .85rem; opacity: .65; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.omodal-close { margin-left: auto; background: none; border: none; cursor: pointer; color: var(--text-blue); opacity: .5; display: flex; padding: .2rem; transition: opacity .2s; }
.omodal-close:hover { opacity: 1; }
/* Lista de pedidos */
.omodal-orders-list { display: flex; flex-direction: column; gap: .5rem; }
.omodal-empty { display: flex; flex-direction: column; align-items: center; gap: .75rem; padding: 1.5rem 0; text-align: center; color: #1a5b82; }
.omodal-empty .material-symbols-outlined { font-size: 2.5rem; color: #c58cf2; opacity: .5; }
.omodal-empty p { font-size: .9rem; opacity: .7; margin: 0; }
.omodal-order-row { display: flex; align-items: center; gap: .75rem; padding: .85rem 1rem; border-radius: .9rem; border: 1.5px solid rgba(26,91,130,.08); background: #f9fafb; cursor: pointer; transition: all .2s; }
.omodal-order-row:hover { border-color: rgba(197,140,242,.4); background: #fdf9ff; transform: translateY(-1px); }
.omodal-row-left { display: flex; align-items: center; gap: .6rem; flex: 1; min-width: 0; }
.omodal-row-imgs { display: flex; }
.omodal-row-imgs img { width: 2.2rem; height: 2.2rem; object-fit: cover; border-radius: .4rem; border: 1.5px solid white; margin-right: -6px; box-shadow: 0 1px 4px rgba(0,0,0,.1); flex-shrink: 0; }
.omodal-row-imgs img:last-child { margin-right: 0; }
.omodal-row-info { display: flex; flex-direction: column; gap: .1rem; min-width: 0; }
.omodal-row-id { font-size: .88rem; font-weight: 700; color: #c58cf2; }
.omodal-row-date { font-size: .75rem; opacity: .6; }
.omodal-row-products { font-size: .75rem; opacity: .55; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; }
.omodal-row-right { display: flex; align-items: center; gap: .4rem; flex-shrink: 0; }
.omodal-arrow { font-size: 1.1rem; opacity: .35; }
/* Status chips */
.omodal-chip { display: inline-flex; align-items: center; gap: .3rem; border-radius: 5rem; padding: .2rem .75rem; font-size: .75rem; font-weight: 700; white-space: nowrap; }
.omodal-chip .material-symbols-outlined { font-size: .85rem; }
.omodal-chip.large { padding: .35rem 1rem; font-size: .88rem; }
.omodal-chip.large .material-symbols-outlined { font-size: 1rem; }
.chip-preparing { background: rgba(245,158,11,.12); color: #b45309; border: 1px solid rgba(245,158,11,.3); }
.chip-shipped   { background: rgba(59,130,246,.1);  color: #1d4ed8; border: 1px solid rgba(59,130,246,.25); }
.chip-delivered { background: rgba(52,211,153,.12); color: #059669; border: 1px solid rgba(52,211,153,.3); }
.chip-cancelled { background: rgba(229,62,62,.1);   color: #e53e3e; border: 1px solid rgba(229,62,62,.25); }
/* Search */
.omodal-search { display: flex; flex-direction: column; gap: .6rem; }
.omodal-input-wrap { display: flex; align-items: center; gap: .4rem; background: #f7f9fc; border: 2px solid rgba(26,91,130,.15); border-radius: 1rem; padding: .4rem .4rem .4rem .85rem; transition: all .22s; }
.omodal-input-wrap:focus-within { border-color: #c58cf2; background: white; box-shadow: 0 0 0 3px rgba(197,140,242,.12); }
.omodal-input-wrap.error { border-color: #fc8181; }
.omodal-prefix { font-size: 1.2rem; color: #c58cf2; flex-shrink: 0; }
.omodal-input { flex: 1; background: transparent; border: none; outline: none; font-family: 'Fredoka', sans-serif; font-size: 1.1rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text-blue); }
.omodal-input::placeholder { text-transform: none; letter-spacing: 0; font-weight: 500; font-size: .95rem; color: rgba(26,91,130,.4); }
.omodal-search-btn { background: #c58cf2; color: white; border: none; border-radius: .7rem; padding: .6rem 1rem; cursor: pointer; display: flex; align-items: center; transition: background .2s; flex-shrink: 0; }
.omodal-search-btn:hover:not(:disabled) { background: #b373e6; }
.omodal-search-btn:disabled { opacity: .4; cursor: not-allowed; }
.omodal-error-msg { display: flex; align-items: center; gap: .4rem; color: #e53e3e; font-size: .85rem; }
.omodal-hint { font-size: .8rem; opacity: .6; margin: 0; }
/* Detalle */
.omodal-back { display: inline-flex; align-items: center; gap: .3rem; background: none; border: 1px solid rgba(26,91,130,.15); border-radius: 5rem; padding: .3rem .85rem; font-family: 'Fredoka', sans-serif; font-size: .85rem; font-weight: 600; color: var(--text-blue); cursor: pointer; margin-bottom: 1rem; opacity: .7; transition: all .2s; }
.omodal-back:hover { opacity: 1; border-color: #c58cf2; }
.omodal-back .material-symbols-outlined { font-size: 1rem; }
.omodal-detail-header { display: flex; align-items: center; gap: .85rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.omodal-detail-meta { display: flex; flex-direction: column; gap: .15rem; }
.green { color: #059669; }
/* Timeline */
.omodal-timeline { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem; position: relative; }
.omodal-tl-item { display: flex; flex-direction: column; align-items: center; gap: .3rem; flex: 1; position: relative; }
.omodal-tl-dot { width: 2rem; height: 2rem; border-radius: 50%; background: #f0f4f8; border: 2px solid #e2e8f0; display: flex; align-items: center; justify-content: center; transition: all .3s; z-index: 1; }
.omodal-tl-dot .material-symbols-outlined { font-size: 1rem; color: #94a3b8; }
.omodal-tl-item.done .omodal-tl-dot { background: #d1fae5; border-color: #34d399; }
.omodal-tl-item.done .omodal-tl-dot .material-symbols-outlined { color: #059669; }
.omodal-tl-item.current .omodal-tl-dot { background: #ede9fe; border-color: #c58cf2; }
.omodal-tl-item.current .omodal-tl-dot .material-symbols-outlined { color: #c58cf2; }
.omodal-tl-connector { position: absolute; top: 1rem; left: 50%; width: 100%; height: 2px; background: #e2e8f0; z-index: 0; }
.omodal-tl-item.done .omodal-tl-connector { background: #34d399; }
.omodal-tl-label { font-size: .7rem; font-weight: 600; opacity: .65; text-align: center; }
.omodal-tl-item.current .omodal-tl-label { color: #c58cf2; opacity: 1; }
.omodal-tl-item.done .omodal-tl-label { color: #059669; opacity: .9; }
/* Productos */
.omodal-section-title { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; opacity: .55; margin-bottom: .6rem; }
.omodal-product-list { display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1.1rem; }
.omodal-product-item { display: flex; align-items: center; gap: .7rem; background: #f9fafb; border-radius: .75rem; padding: .6rem .8rem; }
.omodal-product-item img { width: 2.6rem; height: 2.6rem; object-fit: cover; border-radius: .5rem; flex-shrink: 0; border: 1px solid rgba(0,0,0,.06); }
.omodal-product-info { flex: 1; display: flex; flex-direction: column; gap: .05rem; }
.omodal-product-info span { font-size: .88rem; font-weight: 600; }
.omodal-product-info small { font-size: .75rem; opacity: .6; }
.omodal-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: .6rem; }
.omodal-cancelled-badge { display: inline-flex; align-items: center; gap: .25rem; background: rgba(229,62,62,.1); color: #e53e3e; border: 1px solid rgba(229,62,62,.25); border-radius: 5rem; padding: .15rem .65rem; font-size: .72rem; font-weight: 700; }
.omodal-cancelled-badge .material-symbols-outlined { font-size: .85rem; }
.omodal-product-item.item-cancelled { opacity: .45; }
.item-cancelled-tag { font-size: .7rem; color: #e53e3e; font-weight: 700; }
.omodal-cancel-item-btn { background: none; border: 1.5px solid rgba(229,62,62,.3); border-radius: .5rem; width: 1.9rem; height: 1.9rem; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #e53e3e; flex-shrink: 0; transition: all .2s; }
.omodal-cancel-item-btn:hover { background: rgba(229,62,62,.08); border-color: #e53e3e; }
.omodal-cancel-item-btn .material-symbols-outlined { font-size: .9rem; }
/* Acciones */
.omodal-detail-actions { display: flex; flex-direction: column; gap: .55rem; }
.omodal-cancel-order-btn { display: inline-flex; align-items: center; justify-content: center; gap: .4rem; background: rgba(229,62,62,.07); color: #e53e3e; border: 1.5px solid rgba(229,62,62,.25); border-radius: 5rem; padding: .65rem 1.1rem; font-family: 'Fredoka', sans-serif; font-size: .92rem; font-weight: 700; cursor: pointer; transition: all .2s; }
.omodal-cancel-order-btn:hover { background: rgba(229,62,62,.13); border-color: #e53e3e; }
.omodal-cancel-order-btn .material-symbols-outlined { font-size: 1rem; }
.omodal-full-btn { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; background: #c58cf2; color: white; padding: .75rem 1.25rem; border-radius: 5rem; font-family: 'Fredoka', sans-serif; font-size: .92rem; font-weight: 700; text-decoration: none; border: none; cursor: pointer; transition: all .22s; }
.omodal-full-btn:hover { background: #b373e6; }
.omodal-dev-btn { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; background: white; color: var(--text-blue); border: 1.5px solid rgba(197,140,242,.35); padding: .7rem 1.25rem; border-radius: 5rem; font-family: 'Fredoka', sans-serif; font-size: .92rem; font-weight: 700; text-decoration: none; transition: all .22s; }
.omodal-dev-btn:hover { background: #faf7ff; border-color: #c58cf2; }
/* Cancelación */
.omodal-cancel-confirm { display: flex; flex-direction: column; align-items: center; gap: .75rem; text-align: center; padding: .5rem 0; }
.omodal-cancel-icon { font-size: 3rem; color: #f59e0b; }
.omodal-cancel-confirm h4 { font-size: 1.15rem; font-weight: 700; margin: 0; }
.omodal-cancel-confirm p { font-size: .88rem; opacity: .75; line-height: 1.6; max-width: 22rem; margin: 0; }
.omodal-cancel-actions { display: flex; gap: .6rem; justify-content: center; flex-wrap: wrap; width: 100%; }
.omodal-cancel-back { background: white; border: 1.5px solid rgba(26,91,130,.15); border-radius: 5rem; padding: .65rem 1.25rem; font-family: 'Fredoka', sans-serif; font-size: .92rem; font-weight: 700; color: var(--text-blue); cursor: pointer; transition: all .2s; }
.omodal-cancel-back:hover { border-color: #c58cf2; background: #fdf9ff; }
.omodal-cancel-confirm-btn { display: inline-flex; align-items: center; gap: .35rem; background: #e53e3e; color: white; border: none; border-radius: 5rem; padding: .65rem 1.4rem; font-family: 'Fredoka', sans-serif; font-size: .92rem; font-weight: 700; cursor: pointer; transition: all .2s; }
.omodal-cancel-confirm-btn:hover { background: #c53030; }
.omodal-cancel-confirm-btn .material-symbols-outlined { font-size: 1rem; }
.omodal-cancel-done { display: flex; flex-direction: column; align-items: center; gap: .75rem; text-align: center; padding: .5rem 0; }
.omodal-done-icon { font-size: 3rem; color: #059669; }
.omodal-cancel-done h4 { font-size: 1.15rem; font-weight: 700; margin: 0; }
.omodal-cancel-done p { font-size: .88rem; opacity: .75; line-height: 1.6; margin: 0; }
/* Retry button reutilizado */
.omodal-retry { background: none; border: 1.5px solid rgba(26,91,130,.2); color: var(--text-blue); border-radius: 5rem; padding: .4rem 1rem; font-family: 'Fredoka', sans-serif; font-size: .9rem; cursor: pointer; transition: all .2s; }
.omodal-retry:hover { border-color: #c58cf2; }
/* Transiciones */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

</style>
