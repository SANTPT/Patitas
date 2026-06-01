<template>
  <div class="order-detail">

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

    <div class="detail-layout">

      <!-- Timeline de estado -->
      <div class="status-card">
        <h2 class="card-title">Estado del envío</h2>
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

        <!-- Productos -->
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
              <button
                v-if="order.status === 'preparing'"
                class="delete-item-btn"
                @click="onCancelItem(item.productId, item.name)"
                title="Eliminar este producto del pedido"
              >
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
          <div class="order-total-row">
            <strong>Total</strong>
            <strong class="order-total-val">{{ fmt(order.total) }}</strong>
          </div>
        </div>

        <!-- Datos de envío -->
        <div class="shipping-card">
          <h2 class="card-title">Datos de envío</h2>
          <div class="shipping-lines">
            <div class="shipping-line">
              <span class="material-symbols-outlined">person</span>
              <span>{{ order.shippingInfo?.fullName }}</span>
            </div>
            <div class="shipping-line">
              <span class="material-symbols-outlined">mail</span>
              <span>{{ order.shippingInfo?.email }}</span>
            </div>
            <div class="shipping-line">
              <span class="material-symbols-outlined">phone</span>
              <span>{{ order.shippingInfo?.phone }}</span>
            </div>
            <div class="shipping-line">
              <span class="material-symbols-outlined">location_on</span>
              <span>{{ order.shippingInfo?.address }}, {{ order.shippingInfo?.city }} {{ order.shippingInfo?.zip }}, {{ order.shippingInfo?.country }}</span>
            </div>
            <div class="shipping-line">
              <span class="material-symbols-outlined">payment</span>
              <span>{{ paymentLabel(order.paymentMethod) }}</span>
            </div>
          </div>
        </div>

        <!-- CTAs -->
        <div class="detail-ctas">
          <RouterLink to="/tienda" class="keep-shopping-btn">
            <span class="material-symbols-outlined">shopping_bag</span>
            Seguir comprando
          </RouterLink>
          <RouterLink
            :to="{ name: 'devoluciones', query: { order: order.id } }"
            class="devolucion-btn"
          >
            <span class="material-symbols-outlined">assignment_return</span>
            Solicitar cambio o devolución
          </RouterLink>
          <button
            v-if="order.status === 'preparing'"
            class="cancel-order-btn"
            @click="onCancelOrder"
          >
            <span class="material-symbols-outlined">cancel</span>
            Cancelar pedido completo
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useCartStore } from '../stores/cart';

const props = defineProps({
  order: { type: Object, required: true }
});

const emit = defineEmits(['order-cancelled', 'order-updated']);
const cartStore = useCartStore();

const stages = [
  { icon: 'receipt_long',   label: 'Pedido recibido',  desc: 'Hemos recibido tu pedido y el pago ha sido confirmado.' },
  { icon: 'inventory_2',    label: 'En preparación',    desc: 'Tu pedido está siendo preparado en nuestro almacén.' },
  { icon: 'local_shipping', label: 'En camino',          desc: 'Tu paquete está en ruta hacia tu dirección.' },
  { icon: 'home',           label: 'Entregado',          desc: 'Pedido entregado en tu domicilio.' },
];

const stageIndex = computed(() => {
  return { preparing: 1, shipped: 2, delivered: 3 }[props.order?.status] ?? 1;
});

function onCancelItem(productId, productName) {
  if (confirm(`¿Estás seguro de que deseas eliminar "${productName}" de tu pedido?`)) {
    const res = cartStore.cancelOrderItem(props.order.id, productId);
    if (res) {
      if (res.deleted) {
        emit('order-cancelled', props.order.id);
      } else {
        emit('order-updated', res.order);
      }
    }
  }
}

function onCancelOrder() {
  if (confirm(`¿Estás seguro de que deseas cancelar y eliminar por completo el pedido ${props.order.id}?`)) {
    const success = cartStore.cancelOrder(props.order.id);
    if (success) {
      emit('order-cancelled', props.order.id);
    }
  }
}

function fmt(val) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val ?? 0);
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function paymentLabel(id) {
  return { card: '💳 Tarjeta', bizum: '📲 Bizum', transfer: '🏦 Transferencia', paypal: '🅿️ PayPal' }[id] || id;
}
</script>

<style scoped>
/* ─── META BAR ─── */
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
  font-family: 'Fredoka', sans-serif;
}
.meta-label { font-size: .72rem; text-transform: uppercase; letter-spacing: .04em; opacity: .55; }
.meta-value { font-size: 1rem; font-weight: 700; color: #1a5b82; }
.order-id { color: #c58cf2; font-size: 1.1rem; }
.delivery-date { color: #059669; }
.total-paid { font-size: 1.2rem; }

/* ─── LAYOUT ─── */
.detail-layout {
  display: grid; grid-template-columns: 1fr 400px; gap: 2rem; align-items: start;
}
@media (max-width: 900px) { .detail-layout { grid-template-columns: 1fr; } }

/* ─── CARDS ─── */
.status-card, .items-card, .shipping-card {
  background: white; border-radius: 1.5rem; padding: 2rem;
  box-shadow: 0 8px 30px rgba(26,91,130,.04); border: 1px solid rgba(0,0,0,.03);
  margin-bottom: 1.5rem; font-family: 'Fredoka', sans-serif;
}
.card-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 1.5rem; color: #1a5b82; }

/* ─── TIMELINE ─── */
.timeline { display: flex; flex-direction: column; }
.timeline-item { display: grid; grid-template-columns: 3rem auto 1fr; gap: 0 1rem; align-items: start; }
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
.tl-connector { grid-column: 1; width: 2px; height: 2.5rem; background: #e2e8f0; margin: 0 auto; transition: background .3s; }
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
  display: flex; align-items: center; gap: 1rem; margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border-radius: 1rem; border: 1px solid rgba(52,211,153,.2);
}
.delivery-cta .material-symbols-outlined { font-size: 1.8rem; color: #059669; }
.delivery-cta strong { display: block; font-size: .95rem; color: #059669; }
.delivery-cta span { font-size: .8rem; opacity: .7; }

/* ─── ITEMS ─── */
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

/* ─── SHIPPING ─── */
.shipping-lines { display: flex; flex-direction: column; gap: .75rem; }
.shipping-line { display: flex; align-items: flex-start; gap: .75rem; font-family: 'Outfit', sans-serif; font-size: .9rem; }
.shipping-line .material-symbols-outlined { font-size: 1.1rem; color: #c58cf2; margin-top: .05rem; flex-shrink: 0; }

/* ─── CTAs ─── */
.detail-ctas { display: flex; flex-direction: column; gap: .6rem; }
.keep-shopping-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
  background: #c58cf2; color: white; padding: .9rem 1.75rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: 1rem; font-weight: 700; text-decoration: none;
  transition: all .22s; box-shadow: 0 4px 15px rgba(197,140,242,.3);
}
.keep-shopping-btn:hover { background: #b373e6; transform: translateY(-2px); }
.devolucion-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
  background: white; color: #c58cf2;
  border: 1.5px solid rgba(197,140,242,.4); padding: .85rem 1.5rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: 1rem; font-weight: 700; text-decoration: none;
  transition: all .22s;
}
.devolucion-btn:hover { background: rgba(197,140,242,.07); border-color: #c58cf2; }
.right-col { display: flex; flex-direction: column; }

/* Estilos de cancelación */
.cancel-order-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
  background: white; color: #ef4444;
  border: 1.5px solid rgba(239, 68, 68, 0.4); padding: .85rem 1.5rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: all .22s;
}
.cancel-order-btn:hover { background: rgba(239, 68, 68, 0.07); border-color: #ef4444; }

.delete-item-btn {
  background: none; border: none; cursor: pointer; color: #94a3b8;
  display: flex; align-items: center; justify-content: center;
  padding: .4rem; border-radius: 50%; transition: all .2s;
  margin-left: 0.5rem;
}
.delete-item-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.delete-item-btn .material-symbols-outlined { font-size: 1.2rem; }
</style>
