<template>
  <div class="pedido-page">

    <!-- ░░ HERO ░░ -->
    <header class="page-header">
      <div class="header-content container">
        <div class="success-badge" v-if="fromCheckout">
          <span class="material-symbols-outlined">check_circle</span>
          ¡Pago completado con éxito!
        </div>
        <h1 class="page-title">
          {{ activeOrder ? 'Estado de tu pedido' : (authStore.isAuthenticated ? 'Mis pedidos' : 'Consultar pedido') }}
        </h1>
        <p class="page-subtitle">
          {{ activeOrder
              ? 'Sigue en tiempo real el estado de tu envío.'
              : (authStore.isAuthenticated
                  ? 'Todos tus pedidos en un solo lugar.'
                  : 'Introduce tu código de pedido para ver su estado.')
          }}
        </p>
      </div>
      <div class="hero-wave">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="#f0f8ff"/>
        </svg>
      </div>
    </header>

    <div class="pedido-body container">

      <!-- ══════════ USUARIO LOGUEADO ══════════ -->
      <template v-if="authStore.isAuthenticated">

        <!-- Historial de pedidos (no se ha seleccionado ninguno) -->
        <template v-if="!activeOrder">

          <!-- Sin pedidos aún -->
          <div v-if="userOrders.length === 0" class="empty-state">
            <span class="material-symbols-outlined empty-icon">shopping_bag</span>
            <h2>Aún no tienes pedidos</h2>
            <p>Cuando realices una compra aparecerá aquí con todos sus detalles y estado de envío.</p>
            <RouterLink to="/tienda" class="btn-cta">
              <span class="material-symbols-outlined">storefront</span>
              Explorar tienda
            </RouterLink>
          </div>

          <!-- Lista de pedidos -->
          <div v-else class="orders-list">
            <div class="orders-list-header">
              <h2>Tus pedidos ({{ userOrders.length }})</h2>
              <span class="orders-list-sub">Haz clic en cualquier pedido para ver su estado completo</span>
            </div>

            <div
              v-for="ord in userOrders"
              :key="ord.id"
              class="order-card"
              @click="selectOrder(ord)"
            >
              <!-- Cabecera de la card -->
              <div class="ocard-top">
                <div class="ocard-id-date">
                  <span class="ocard-id">{{ ord.id }}</span>
                  <span class="ocard-date">{{ fmtShort(ord.createdAt) }}</span>
                </div>
                <div class="ocard-right">
                  <span class="status-chip" :class="'chip-' + ord.status">
                    <span class="material-symbols-outlined">{{ statusIcon(ord.status) }}</span>
                    {{ statusLabel(ord.status) }}
                  </span>
                  <span class="ocard-total">{{ fmt(ord.total) }}</span>
                </div>
              </div>

              <!-- Productos en miniatura -->
              <div class="ocard-products">
                <div v-for="item in ord.items" :key="item.productId" class="ocard-product">
                  <img :src="item.image" :alt="item.name" />
                  <div class="ocard-product-info">
                    <span>{{ item.name }}</span>
                    <small>×{{ item.quantity }} · {{ fmt(item.subtotal) }}</small>
                  </div>
                </div>
              </div>

              <!-- Footer de la card -->
              <div class="ocard-footer">
                <span class="ocard-hint">
                  <span class="material-symbols-outlined">local_shipping</span>
                  Entrega est. {{ fmtShort(ord.estimatedDelivery) }}
                </span>
                <div class="ocard-actions" @click.stop>
                  <button class="ocard-btn-primary" @click="selectOrder(ord)">
                    <span class="material-symbols-outlined">visibility</span>
                    Ver estado
                  </button>
                  <RouterLink
                    class="ocard-btn-secondary"
                    :to="{ name: 'devoluciones', query: { order: ord.id } }"
                  >
                    <span class="material-symbols-outlined">assignment_return</span>
                    Cambio / Dev.
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Detalle del pedido seleccionado (usuario logueado) -->
        <template v-else>
          <button class="back-to-list" @click="activeOrder = null">
            <span class="material-symbols-outlined">arrow_back</span>
            Volver a mis pedidos
          </button>
          <OrderDetail
            :order="activeOrder"
            @order-cancelled="handleOrderCancelled"
            @order-updated="handleOrderUpdated"
          />
        </template>

      </template>

      <!-- ══════════ INVITADO ══════════ -->
      <template v-else>

        <!-- Gate: buscar por código -->
        <div v-if="!guestOrder" class="code-gate">
          <div class="code-gate-card">
            <span class="material-symbols-outlined gate-icon">local_shipping</span>
            <h2>Consulta el estado de tu pedido</h2>
            <p>
              Introduce el código de pedido que recibiste en el email de confirmación.<br />
              Ejemplo: <strong>PT-48291</strong>
            </p>
            <div class="code-input-wrap" :class="{ error: codeError, success: guestOrder }">
              <span class="material-symbols-outlined code-prefix">receipt_long</span>
              <input
                v-model="inputCode"
                type="text"
                placeholder="PT-XXXXX"
                class="code-input"
                autocomplete="off"
                @input="codeError = false"
                @keyup.enter="verifyCode"
              />
              <button class="code-search-btn" @click="verifyCode" :disabled="!inputCode.trim()">
                <span class="material-symbols-outlined">search</span>
                Buscar
              </button>
            </div>
            <p v-if="codeError" class="code-error-msg">
              <span class="material-symbols-outlined">error</span>
              Código no encontrado. Comprueba que lo has escrito correctamente.
            </p>
            <div class="gate-hint">
              <span class="material-symbols-outlined">info</span>
              <span>¿Tienes cuenta? <RouterLink to="/login">Inicia sesión</RouterLink> y verás todos tus pedidos aquí automáticamente.</span>
            </div>
          </div>
        </div>

        <!-- Detalle del pedido encontrado (invitado) -->
        <template v-else>
          <button class="back-to-list" @click="guestOrder = null; inputCode = ''">
            <span class="material-symbols-outlined">arrow_back</span>
            Buscar otro pedido
          </button>
          <OrderDetail
            :order="guestOrder"
            @order-cancelled="handleOrderCancelled"
            @order-updated="handleOrderUpdated"
          />
        </template>

      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import OrderDetail from '../components/OrderDetail.vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

const route     = useRoute();
const router    = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

// ── Estado global ──────────────────────────────────────────
const fromCheckout = ref(route.query.new === '1');

// ── Usuario logueado: historial ────────────────────────────
const userOrders  = computed(() =>
  authStore.user?.id ? cartStore.getOrdersByUser(authStore.user.id) : []
);
const activeOrder = ref(null);   // pedido seleccionado del historial

function selectOrder(ord) { activeOrder.value = ord; }

// Si viene con ?id= en la URL, seleccionar ese pedido directamente
onMounted(() => {
  const id = route.params.id || route.query.id;
  if (id && authStore.isAuthenticated) {
    const found = cartStore.getOrder(id);
    if (found && String(found.userId) === String(authStore.user.id)) {
      activeOrder.value = found;
    }
  }
});

// ── Invitado: buscar por código ────────────────────────────
const inputCode  = ref('');
const codeError  = ref(false);
const guestOrder = ref(null);

// Si viene con ?id= sin sesión, pre-rellenar
onMounted(() => {
  const id = route.params.id || route.query.id;
  if (id && !authStore.isAuthenticated) {
    inputCode.value = id;
    verifyCode();
  }
});

function verifyCode() {
  const code = inputCode.value.trim().toUpperCase();
  const found = cartStore.getOrder(code);
  if (found) {
    guestOrder.value = found;
    codeError.value  = false;
  } else {
    codeError.value  = true;
    guestOrder.value = null;
  }
}

function handleOrderCancelled(orderId) {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message: `Pedido ${orderId} cancelado y eliminado correctamente.`, type: 'success' }
  }));

  activeOrder.value = null;
  guestOrder.value = null;
  inputCode.value = '';
}

function handleOrderUpdated(updatedOrder) {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message: `Producto eliminado del pedido. Nuevo total: ${fmt(updatedOrder.total)}`, type: 'success' }
  }));

  if (activeOrder.value && activeOrder.value.id === updatedOrder.id) {
    activeOrder.value = updatedOrder;
  }
  if (guestOrder.value && guestOrder.value.id === updatedOrder.id) {
    guestOrder.value = updatedOrder;
  }
}

// ── Helpers ────────────────────────────────────────────────
function fmt(val) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val ?? 0);
}
function fmtShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
function statusLabel(s) {
  return { preparing: 'En preparación', shipped: 'En camino', delivered: 'Entregado' }[s] ?? 'Recibido';
}
function statusIcon(s) {
  return { preparing: 'inventory_2', shipped: 'local_shipping', delivered: 'home' }[s] ?? 'receipt_long';
}

// ══════════════════════════════════════════════════════════
// Componente interno: detalle completo de un pedido
// (se reutiliza tanto para logueado como para invitado)
// ══════════════════════════════════════════════════════════
</script>

<style scoped>
/* ─── BASE ─────────────────────────────────────────── */
.pedido-page {
  background: #f0f8ff;
  min-height: 100vh;
  padding-bottom: 5rem;
  font-family: 'Fredoka', sans-serif;
  color: #1a5b82;
}

/* ─── HERO ─── */
.page-header {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover; background-position: center;
  position: relative; padding: 3.5rem 0 5.5rem; text-align: center;
}
.hero-wave { position: absolute; bottom: 0; left: 0; right: 0; height: 3.11rem; z-index: 2; }
.hero-wave svg { width: 100%; height: 100%; display: block; }
.success-badge {
  display: inline-flex; align-items: center; gap: .5rem;
  background: rgba(52,211,153,.15); color: #059669;
  border: 1.5px solid rgba(52,211,153,.35);
  padding: .4rem 1.1rem; border-radius: 5rem;
  font-size: .9rem; font-weight: 700; margin-bottom: 1rem;
}
.success-badge .material-symbols-outlined { font-size: 1.2rem; }
.page-title { font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 700; color: #1a5b82; margin-bottom: .5rem; }
.page-subtitle { font-size: 1.05rem; opacity: .85; }

/* ─── BODY ─── */
.pedido-body { padding-top: 2.5rem; }

/* ─── BACK ─── */
.back-to-list {
  display: inline-flex; align-items: center; gap: .4rem;
  background: white; border: 1.5px solid rgba(26,91,130,.15);
  border-radius: 5rem; padding: .55rem 1.2rem;
  font-family: 'Fredoka', sans-serif; font-size: .95rem; font-weight: 700;
  color: #1a5b82; cursor: pointer; margin-bottom: 1.75rem;
  transition: all .2s;
}
.back-to-list:hover { border-color: #c58cf2; background: #fdf9ff; }
.back-to-list .material-symbols-outlined { font-size: 1.1rem; }

/* ─── EMPTY STATE ─── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 1rem; padding: 4rem 2rem; text-align: center;
}
.empty-icon { font-size: 4rem; color: #c58cf2; opacity: .5; }
.empty-state h2 { font-size: 1.6rem; font-weight: 700; }
.empty-state p { font-size: .95rem; opacity: .7; max-width: 28rem; line-height: 1.6; }
.btn-cta {
  display: inline-flex; align-items: center; gap: .5rem;
  background: #c58cf2; color: white; border-radius: 5rem;
  padding: .8rem 1.6rem; font-family: 'Fredoka', sans-serif;
  font-size: 1rem; font-weight: 700; text-decoration: none;
  transition: all .22s; box-shadow: 0 4px 15px rgba(197,140,242,.3);
}
.btn-cta:hover { background: #b373e6; transform: translateY(-1px); }

/* ─── LISTA DE PEDIDOS ─── */
.orders-list-header { margin-bottom: 1.25rem; }
.orders-list-header h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: .2rem; }
.orders-list-sub { font-size: .88rem; opacity: .6; }

.orders-list { display: flex; flex-direction: column; gap: 1rem; }

.order-card {
  background: white;
  border-radius: 1.25rem;
  border: 1.5px solid rgba(26,91,130,.08);
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 16px rgba(26,91,130,.04);
  cursor: pointer;
  transition: all .22s;
}
.order-card:hover {
  border-color: rgba(197,140,242,.4);
  box-shadow: 0 8px 28px rgba(197,140,242,.12);
  transform: translateY(-2px);
}

.ocard-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap;
}
.ocard-id-date { display: flex; flex-direction: column; gap: .15rem; }
.ocard-id { font-size: 1.05rem; font-weight: 700; color: #c58cf2; }
.ocard-date { font-size: .8rem; opacity: .6; }
.ocard-right { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.ocard-total { font-size: 1.1rem; font-weight: 700; }

/* Status chips */
.status-chip {
  display: inline-flex; align-items: center; gap: .35rem;
  border-radius: 5rem; padding: .25rem .85rem;
  font-size: .8rem; font-weight: 700;
}
.status-chip .material-symbols-outlined { font-size: .95rem; }
.chip-preparing { background: rgba(245,158,11,.12); color: #b45309; border: 1px solid rgba(245,158,11,.3); }
.chip-shipped   { background: rgba(59,130,246,.1);  color: #1d4ed8; border: 1px solid rgba(59,130,246,.25); }
.chip-delivered { background: rgba(52,211,153,.12); color: #059669; border: 1px solid rgba(52,211,153,.3); }

.ocard-products { display: flex; flex-direction: column; gap: .55rem; margin-bottom: 1rem; }
.ocard-product { display: flex; align-items: center; gap: .75rem; }
.ocard-product img {
  width: 2.8rem; height: 2.8rem; object-fit: cover;
  border-radius: .6rem; border: 1px solid rgba(0,0,0,.06); flex-shrink: 0;
}
.ocard-product-info { display: flex; flex-direction: column; gap: .05rem; }
.ocard-product-info span { font-size: .9rem; font-weight: 600; }
.ocard-product-info small { font-size: .78rem; opacity: .6; }

.ocard-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 1rem; border-top: 1px dashed rgba(26,91,130,.1); flex-wrap: wrap; gap: .75rem;
}
.ocard-hint {
  display: flex; align-items: center; gap: .35rem;
  font-size: .82rem; opacity: .6;
}
.ocard-hint .material-symbols-outlined { font-size: 1rem; }
.ocard-actions { display: flex; gap: .5rem; flex-wrap: wrap; }

.ocard-btn-primary {
  display: inline-flex; align-items: center; gap: .35rem;
  background: #c58cf2; color: white; border: none;
  border-radius: 5rem; padding: .5rem 1rem;
  font-family: 'Fredoka', sans-serif; font-size: .88rem; font-weight: 700;
  cursor: pointer; transition: all .2s;
}
.ocard-btn-primary:hover { background: #b373e6; }
.ocard-btn-primary .material-symbols-outlined { font-size: 1rem; }

.ocard-btn-secondary {
  display: inline-flex; align-items: center; gap: .35rem;
  background: white; color: #1a5b82;
  border: 1.5px solid rgba(26,91,130,.18);
  border-radius: 5rem; padding: .48rem .95rem;
  font-family: 'Fredoka', sans-serif; font-size: .88rem; font-weight: 700;
  text-decoration: none; transition: all .2s;
}
.ocard-btn-secondary:hover { border-color: #c58cf2; background: #fdf9ff; }
.ocard-btn-secondary .material-symbols-outlined { font-size: 1rem; }

/* ─── CODE GATE ─── */
.code-gate { display: flex; justify-content: center; padding: 1rem 0 3rem; }
.code-gate-card {
  background: white; border-radius: 1.5rem; padding: 3rem 2.5rem;
  max-width: 30rem; width: 100%; text-align: center;
  box-shadow: 0 12px 40px rgba(26,91,130,.07);
  border: 1.5px solid rgba(26,91,130,.06);
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.gate-icon { font-size: 3rem; color: #c58cf2; }
.code-gate-card h2 { font-size: 1.5rem; font-weight: 700; }
.code-gate-card p { font-size: .9rem; line-height: 1.65; opacity: .75; }

.code-input-wrap {
  display: flex; align-items: center; gap: .4rem;
  width: 100%; background: #f7f9fc;
  border: 2px solid rgba(26,91,130,.15); border-radius: 1rem;
  padding: .4rem .4rem .4rem 1rem; transition: all .22s;
}
.code-input-wrap:focus-within { border-color: #c58cf2; background: white; box-shadow: 0 0 0 3px rgba(197,140,242,.12); }
.code-input-wrap.error { border-color: #fc8181; }
.code-input-wrap.success { border-color: #34d399; }
.code-prefix { font-size: 1.2rem; color: #c58cf2; flex-shrink: 0; }
.code-input {
  flex: 1; background: transparent; border: none; outline: none;
  font-family: 'Fredoka', sans-serif; font-size: 1.15rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em; color: #1a5b82;
  min-width: 0;
}
.code-input::placeholder { color: rgba(26,91,130,.3); font-weight: 500; font-size: 1rem; text-transform: none; letter-spacing: 0; }
.code-search-btn {
  display: inline-flex; align-items: center; gap: .35rem;
  background: #c58cf2; color: white; border: none;
  border-radius: .7rem; padding: .6rem 1.1rem;
  font-family: 'Fredoka', sans-serif; font-size: .95rem; font-weight: 700;
  cursor: pointer; flex-shrink: 0; transition: background .2s;
}
.code-search-btn:hover:not(:disabled) { background: #b373e6; }
.code-search-btn:disabled { opacity: .4; cursor: not-allowed; }
.code-search-btn .material-symbols-outlined { font-size: 1.1rem; }

.code-error-msg {
  display: flex; align-items: center; gap: .4rem;
  color: #e53e3e; font-size: .88rem; text-align: left; width: 100%;
}
.code-error-msg .material-symbols-outlined { font-size: 1rem; flex-shrink: 0; }
.gate-hint {
  display: flex; align-items: center; gap: .4rem;
  font-family: 'Outfit', sans-serif; font-size: .85rem; opacity: .65;
}
.gate-hint .material-symbols-outlined { font-size: 1rem; }
.gate-hint a { color: #c58cf2; font-weight: 600; }
</style>
