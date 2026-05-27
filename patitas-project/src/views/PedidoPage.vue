<template>
  <div class="pedido-page">
    <header class="page-header">
      <div class="header-content container">
        <div class="success-badge" v-if="orderVisible">
          <span class="material-symbols-outlined">check_circle</span>
          ¡Pago Exitoso!
        </div>
        <h1 class="page-title">{{ orderVisible ? 'Estado de tu Pedido' : 'Consultar Pedido' }}</h1>
        <p class="page-subtitle">
          {{ orderVisible
            ? 'Aquí puedes seguir en tiempo real el estado de tu envío.'
            : 'Introduce el código de pedido que recibiste para ver su estado.' }}
        </p>
      </div>
      <div class="header-wave-bottom">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="var(--page-bg, #f0f8ff)"/>
        </svg>
      </div>
    </header>

    <div class="pedido-body container">

      <!-- INVITADO: formulario de código de pedido -->
      <div v-if="!authStore.isAuthenticated && !codeVerified" class="code-gate">
        <div class="code-gate-card">
          <span class="material-symbols-outlined gate-icon">local_shipping</span>
          <h2>Consulta el estado de tu pedido</h2>
          <p>
            Introduce el código de pedido que te proporcionamos al finalizar tu compra.
            <br />Ejemplo: <strong>PT-48291</strong>
          </p>
          <form @submit.prevent="verifyCode" class="code-form">
            <input
              v-model="inputCode"
              type="text"
              id="order-code-input"
              placeholder="PT-XXXXX"
              class="code-input"
              :class="{ error: codeError }"
              autocomplete="off"
              @input="codeError = false"
            />
            <p v-if="codeError" class="code-error">
              <span class="material-symbols-outlined">error</span>
              Código no encontrado. Comprueba que lo has escrito correctamente.
            </p>
            <button type="submit" class="btn-verify">
              <span class="material-symbols-outlined">search</span>
              Buscar pedido
            </button>
          </form>
          <div class="gate-hint">
            <span class="material-symbols-outlined">info</span>
            ¿Tienes cuenta? <RouterLink to="/login">Inicia sesión</RouterLink> para ver todos tus pedidos en tu perfil.
          </div>
        </div>
      </div>

      <!-- PEDIDO NO ENCONTRADO (tras verificar) -->
      <div v-else-if="orderVisible && !order" class="not-found">
        <span class="material-symbols-outlined">search_off</span>
        <h2>Pedido no encontrado</h2>
        <RouterLink to="/tienda" class="back-btn">Volver a la tienda</RouterLink>
      </div>

      <!-- DETALLE DEL PEDIDO -->
      <template v-else-if="orderVisible && order">
        <!-- Meta bar -->
        <div class="order-meta-bar">
          <div class="meta-item">
            <span class="meta-label">Número de pedido</span>
            <span class="meta-value order-id">{{ order.id }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Fecha del pedido</span>
            <span class="meta-value">{{ fmtDate(order.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Entrega estimada</span>
            <span class="meta-value delivery-date">{{ fmtDate(order.estimatedDelivery) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Total pagado</span>
            <span class="meta-value total-paid">{{ fmt(order.total) }}</span>
          </div>
        </div>

        <div class="pedido-layout">
          <!-- Timeline -->
          <div class="status-card">
            <h2 class="card-title">Estado del Envío</h2>
            <div class="timeline">
              <div
                v-for="(stage, i) in stages"
                :key="i"
                class="timeline-item"
                :class="{ done: stageIndex >= i, current: stageIndex === i }"
              >
                <div class="tl-icon-wrap">
                  <span class="material-symbols-outlined tl-icon">{{ stage.icon }}</span>
                </div>
                <div class="tl-connector" v-if="i < stages.length - 1"></div>
                <div class="tl-text">
                  <strong>{{ stage.label }}</strong>
                  <small>{{ stage.desc }}</small>
                  <span v-if="stageIndex === i" class="current-badge">Estado actual</span>
                </div>
              </div>
            </div>
            <div class="delivery-cta">
              <span class="material-symbols-outlined">local_shipping</span>
              <div>
                <strong>Entrega estimada: {{ fmtDate(order.estimatedDelivery) }}</strong>
                <span>4 días laborales desde la confirmación del pedido</span>
              </div>
            </div>
          </div>

          <!-- Columna derecha -->
          <div class="right-col">
            <div class="items-card">
              <h2 class="card-title">Productos</h2>
              <div class="order-items">
                <div v-for="item in order.items" :key="item.productId" class="order-item">
                  <img :src="item.image" :alt="item.name" class="order-item-img" />
                  <div class="order-item-info">
                    <span class="order-item-name">{{ item.name }}</span>
                    <span class="order-item-qty">Cantidad: {{ item.quantity }}</span>
                  </div>
                  <span class="order-item-price">{{ fmt(item.subtotal) }}</span>
                </div>
              </div>
              <div class="order-total-row">
                <strong>Total</strong>
                <strong class="order-total-val">{{ fmt(order.total) }}</strong>
              </div>
            </div>

            <div class="shipping-card">
              <h2 class="card-title">Datos de Envío</h2>
              <div class="shipping-lines">
                <div class="shipping-line">
                  <span class="material-symbols-outlined">person</span>
                  <span>{{ order.shippingInfo.fullName }}</span>
                </div>
                <div class="shipping-line">
                  <span class="material-symbols-outlined">mail</span>
                  <span>{{ order.shippingInfo.email }}</span>
                </div>
                <div class="shipping-line">
                  <span class="material-symbols-outlined">phone</span>
                  <span>{{ order.shippingInfo.phone }}</span>
                </div>
                <div class="shipping-line">
                  <span class="material-symbols-outlined">location_on</span>
                  <span>{{ order.shippingInfo.address }}, {{ order.shippingInfo.city }} {{ order.shippingInfo.zip }}, {{ order.shippingInfo.country }}</span>
                </div>
                <div class="shipping-line">
                  <span class="material-symbols-outlined">payment</span>
                  <span>{{ paymentLabel(order.paymentMethod) }}</span>
                </div>
              </div>
            </div>

            <RouterLink to="/tienda" class="keep-shopping-btn">
              <span class="material-symbols-outlined">shopping_bag</span>
              Seguir comprando
            </RouterLink>
            <RouterLink
              :to="{ name: 'devoluciones', query: { order: order.id } }"
              class="devolucion-btn"
            >
              <span class="material-symbols-outlined">assignment_return</span>
              Solicitar devolución o cambio
            </RouterLink>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();

// Estado de verificación de código para invitados
const inputCode = ref('');
const codeVerified = ref(false);
const codeError = ref(false);

// El pedido encontrado (puede venir del param de URL o del código introducido)
const resolvedOrderId = ref(route.params.id || '');

const order = computed(() => cartStore.getOrder(resolvedOrderId.value));

// Se muestra el pedido si: usuario logueado (sin código), o invitado que verificó su código
const orderVisible = computed(() => {
  return authStore.isAuthenticated || codeVerified.value;
});

function verifyCode() {
  const code = inputCode.value.trim().toUpperCase();
  const found = cartStore.getOrder(code);
  if (found) {
    resolvedOrderId.value = code;
    codeVerified.value = true;
  } else {
    codeError.value = true;
  }
}

onMounted(() => {
  // Si viene con el ID en la URL y está logueado, pre-rellenar el input también
  if (route.params.id) {
    inputCode.value = route.params.id;
  }
});

const stages = [
  { icon: 'receipt_long',   label: 'Pedido recibido',   desc: 'Hemos recibido tu pedido y el pago ha sido confirmado.' },
  { icon: 'inventory_2',    label: 'En preparación',     desc: 'Tu pedido está siendo preparado en nuestro almacén.' },
  { icon: 'local_shipping', label: 'En camino',           desc: 'Tu paquete está en ruta hacia tu dirección.' },
  { icon: 'home',           label: 'Entregado',           desc: 'Pedido entregado en tu domicilio.' },
];

const stageIndex = computed(() => {
  const map = { preparing: 1, shipped: 2, delivered: 3 };
  return map[order.value?.status] ?? 1;
});

function fmt(val) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function paymentLabel(id) {
  const map = { card: '💳 Tarjeta de crédito/débito', bizum: '📲 Bizum', transfer: '🏦 Transferencia bancaria', paypal: '🅿️ PayPal' };
  return map[id] || id;
}
</script>

<style scoped>
.pedido-page {
  background: var(--page-bg, #f0f8ff);
  min-height: 100vh;
  padding-bottom: 5rem;
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue, #1a5b82);
}

/* ── Header ─────────────────────────────────────────────────── */
.page-header {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover; background-position: center;
  position: relative; padding: 4.5rem 0 5.5rem; text-align: center;
}
.header-wave-bottom {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3.11rem; z-index: 2;
}
.header-wave-bottom svg { width: 100%; height: 100%; display: block; }
.success-badge {
  display: inline-flex; align-items: center; gap: .5rem;
  background: rgba(52,211,153,.15); color: #059669;
  border: 1.5px solid rgba(52,211,153,.35);
  padding: .4rem 1.1rem; border-radius: 5rem;
  font-size: .9rem; font-weight: 700; margin-bottom: 1rem;
}
.success-badge .material-symbols-outlined { font-size: 1.2rem; }
.page-title { font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 700; color: var(--text-blue); margin-bottom: .5rem; }
.page-subtitle { font-size: 1.05rem; color: var(--text-blue); opacity: .85; }

/* ── Body ────────────────────────────────────────────────────── */
.pedido-body { padding-top: 2.5rem; }

/* ── Code Gate (invitados) ───────────────────────────────────── */
.code-gate {
  display: flex; justify-content: center; padding: 1rem 0 3rem;
}
.code-gate-card {
  background: white; border-radius: 1.5rem; padding: 3rem 2.5rem;
  max-width: 28rem; width: 100%; text-align: center;
  box-shadow: 0 12px 40px rgba(26,91,130,.07);
  border: 1px solid rgba(0,0,0,.03);
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.gate-icon { font-size: 3.5rem; color: #c58cf2; }
.code-gate-card h2 { font-size: 1.5rem; font-weight: 700; }
.code-gate-card p { font-size: .95rem; line-height: 1.6; opacity: .75; }
.code-form {
  width: 100%; display: flex; flex-direction: column; gap: .75rem; margin-top: .5rem;
}
.code-input {
  font-family: 'Fredoka', sans-serif; font-size: 1.2rem; font-weight: 700;
  text-align: center; letter-spacing: .1em; text-transform: uppercase;
  padding: .85rem 1rem; border-radius: .75rem;
  border: 2px solid rgba(197,140,242,.25); background: #fcf8ff;
  color: var(--text-blue); outline: none; transition: all .22s; width: 100%;
}
.code-input:focus { border-color: #c58cf2; box-shadow: 0 0 0 3px rgba(197,140,242,.12); }
.code-input.error { border-color: #fc8181; background: #fff5f5; }
.code-error {
  display: flex; align-items: center; gap: .4rem;
  color: #e53e3e; font-size: .85rem; font-family: 'Outfit', sans-serif;
}
.code-error .material-symbols-outlined { font-size: 1rem; }
.btn-verify {
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  background: #c58cf2; color: white; border: none; padding: .85rem 1.5rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: 1rem; font-weight: 700; cursor: pointer; transition: all .22s;
  box-shadow: 0 4px 15px rgba(197,140,242,.3);
}
.btn-verify:hover { background: #b373e6; transform: translateY(-1px); }
.gate-hint {
  display: flex; align-items: center; gap: .4rem;
  font-family: 'Outfit', sans-serif; font-size: .85rem; opacity: .7; margin-top: .5rem;
}
.gate-hint .material-symbols-outlined { font-size: 1rem; }
.gate-hint a { color: #c58cf2; font-weight: 600; }

/* ── Not found ───────────────────────────────────────────────── */
.not-found {
  display: flex; flex-direction: column; align-items: center;
  gap: 1rem; padding: 5rem 2rem; text-align: center;
}
.not-found .material-symbols-outlined { font-size: 4rem; color: #c58cf2; }

/* ── Meta bar ────────────────────────────────────────────────── */
.order-meta-bar {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1rem; margin-bottom: 2rem;
}
@media (max-width: 768px) { .order-meta-bar { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .order-meta-bar { grid-template-columns: 1fr; } }

.meta-item {
  background: white; border-radius: 1rem; padding: 1rem 1.25rem;
  display: flex; flex-direction: column; gap: .25rem;
  box-shadow: 0 4px 15px rgba(26,91,130,.04); border: 1px solid rgba(0,0,0,.03);
}
.meta-label { font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; opacity: .6; }
.meta-value { font-size: 1rem; font-weight: 700; }
.order-id { color: #c58cf2; font-size: 1.1rem; }
.delivery-date { color: #059669; }
.total-paid { font-size: 1.2rem; }

/* ── Layout ──────────────────────────────────────────────────── */
.pedido-layout {
  display: grid; grid-template-columns: 1fr 400px; gap: 2rem; align-items: start;
}
@media (max-width: 900px) { .pedido-layout { grid-template-columns: 1fr; } }

/* ── Cards ───────────────────────────────────────────────────── */
.status-card, .items-card, .shipping-card {
  background: white; border-radius: 1.5rem; padding: 2rem;
  box-shadow: 0 8px 30px rgba(26,91,130,.04); border: 1px solid rgba(0,0,0,.03);
  margin-bottom: 1.5rem;
}
.card-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 1.5rem; }

/* ── Timeline ────────────────────────────────────────────────── */
.timeline { display: flex; flex-direction: column; }
.timeline-item {
  display: grid; grid-template-columns: 3rem auto 1fr; gap: 0 1rem; align-items: start;
}
.tl-icon-wrap {
  width: 3rem; height: 3rem; border-radius: 50%;
  background: #f0f4f8; display: flex; align-items: center; justify-content: center;
  border: 2.5px solid #e2e8f0; transition: all .3s; flex-shrink: 0;
}
.timeline-item.done .tl-icon-wrap { background: #d1fae5; border-color: #34d399; }
.timeline-item.current .tl-icon-wrap { background: #ede9fe; border-color: #c58cf2; }
.tl-icon { font-size: 1.3rem; color: #94a3b8; }
.timeline-item.done .tl-icon { color: #059669; }
.timeline-item.current .tl-icon { color: #c58cf2; }
.tl-connector {
  grid-column: 1; width: 2px; height: 2.5rem;
  background: #e2e8f0; margin: 0 auto; transition: background .3s;
}
.timeline-item.done .tl-connector { background: #34d399; }
.tl-text { grid-column: 3; padding-top: .5rem; padding-bottom: 1.5rem; }
.tl-text strong { display: block; font-size: .95rem; margin-bottom: .2rem; }
.tl-text small { font-size: .8rem; opacity: .65; line-height: 1.4; }
.current-badge {
  display: inline-block; margin-top: .4rem;
  background: rgba(197,140,242,.12); color: #c58cf2;
  font-size: .72rem; font-weight: 700; padding: .15rem .6rem;
  border-radius: 5rem; text-transform: uppercase; letter-spacing: .04em;
}
.delivery-cta {
  display: flex; align-items: center; gap: 1rem;
  margin-top: 1rem; padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border-radius: 1rem; border: 1px solid rgba(52,211,153,.2);
}
.delivery-cta .material-symbols-outlined { font-size: 1.8rem; color: #059669; }
.delivery-cta strong { display: block; font-size: .95rem; color: #059669; }
.delivery-cta span { font-size: .8rem; opacity: .7; }

/* ── Order items ─────────────────────────────────────────────── */
.order-items { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 1rem; }
.order-item { display: flex; align-items: center; gap: 1rem; }
.order-item-img { width: 3.5rem; height: 3.5rem; object-fit: cover; border-radius: .75rem; flex-shrink: 0; }
.order-item-info { flex: 1; display: flex; flex-direction: column; gap: .1rem; }
.order-item-name { font-weight: 600; font-size: .9rem; }
.order-item-qty { font-size: .8rem; opacity: .6; }
.order-item-price { font-weight: 700; color: #c58cf2; white-space: nowrap; }
.order-total-row {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 1rem; border-top: 1px solid rgba(0,0,0,.06); font-size: 1.05rem;
}
.order-total-val { color: #c58cf2; font-size: 1.3rem; }

/* ── Shipping lines ──────────────────────────────────────────── */
.shipping-lines { display: flex; flex-direction: column; gap: .75rem; }
.shipping-line {
  display: flex; align-items: flex-start; gap: .75rem;
  font-family: 'Outfit', sans-serif; font-size: .9rem;
}
.shipping-line .material-symbols-outlined { font-size: 1.1rem; color: #c58cf2; margin-top: .05rem; flex-shrink: 0; }

/* ── CTA ─────────────────────────────────────────────────────── */
.keep-shopping-btn {
  display: inline-flex; align-items: center; gap: .6rem;
  background: #c58cf2; color: white; padding: .9rem 1.75rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: 1rem; font-weight: 700; text-decoration: none;
  transition: all .22s; box-shadow: 0 4px 15px rgba(197,140,242,.3);
}
.keep-shopping-btn:hover { background: #b373e6; transform: translateY(-2px); }
.devolucion-btn {
  display: inline-flex; align-items: center; gap: .6rem;
  background: white; color: #c58cf2;
  border: 1.5px solid rgba(197,140,242,.35);
  padding: .85rem 1.5rem; border-radius: 5rem;
  font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700;
  text-decoration: none; transition: all .22s; margin-top: .5rem;
}
.devolucion-btn:hover { background: rgba(197,140,242,.08); border-color: #c58cf2; }
.right-col { display: flex; flex-direction: column; }
.back-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  background: #c58cf2; color: white; padding: .8rem 1.5rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: 1rem; font-weight: 700; text-decoration: none; margin-top: 1rem;
}
</style>
