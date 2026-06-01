<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

// Pedidos del usuario logueado, ordenados por fecha descendente
const orders = computed(() => {
  const userId = authStore.user?.id;
  if (!userId) return [];
  return cartStore.getOrdersByUser(userId)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

function formatDate(isoStr) {
  if (!isoStr) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(isoStr));
}

function formatPrice(val) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
}

const statusMap = {
  preparing: { label: 'En preparación', icon: 'inventory_2', color: 'orange' },
  shipped:   { label: 'Enviado',         icon: 'local_shipping', color: 'blue' },
  delivered: { label: 'Entregado',       icon: 'check_circle',   color: 'green' },
  cancelled: { label: 'Cancelado',       icon: 'cancel',         color: 'red' },
};

function getStatus(status) {
  return statusMap[status] || { label: status, icon: 'help', color: 'grey' };
}

function goToDetail(orderId) {
  router.push({ name: 'pedido', params: { id: orderId } });
}

function goToReturn(orderId) {
  router.push({ path: '/devoluciones', query: { order: orderId } });
}
</script>

<template>
  <div class="order-history-view">
    <!-- Cabecera -->
    <div class="section-header">
      <div class="header-left">
        <span class="material-symbols-outlined header-icon">local_shipping</span>
        <div>
          <h2 class="section-title">Mis Pedidos</h2>
          <p class="section-subtitle">Historial completo de tus compras en Patitas.</p>
        </div>
      </div>
      <span class="orders-count" v-if="orders.length > 0">{{ orders.length }} pedido{{ orders.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Estado vacío -->
    <div v-if="orders.length === 0" class="empty-state">
      <div class="empty-icon-wrap">
        <span class="material-symbols-outlined empty-icon">shopping_bag</span>
      </div>
      <h3>Aún no tienes pedidos</h3>
      <p>Cuando realices una compra, aparecerá aquí con toda la información de tu envío.</p>
      <RouterLink to="/tienda" class="shop-btn">
        <span class="material-symbols-outlined">storefront</span>
        Explorar tienda
      </RouterLink>
    </div>

    <!-- Lista de pedidos -->
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <!-- Cabecera de la tarjeta -->
        <div class="order-card-header">
          <div class="order-id-block">
            <span class="order-id">{{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="status-badge" :class="getStatus(order.status).color">
            <span class="material-symbols-outlined status-icon">{{ getStatus(order.status).icon }}</span>
            {{ getStatus(order.status).label }}
          </div>
        </div>

        <!-- Productos -->
        <div class="order-items">
          <div v-for="item in order.items" :key="item.productId" class="order-item">
            <img :src="item.image" :alt="item.name" class="item-img" />
            <div class="item-info">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-meta">{{ item.quantity }} ud. · {{ formatPrice(item.price) }}/ud.</span>
            </div>
            <span class="item-subtotal">{{ formatPrice(item.subtotal) }}</span>
          </div>
        </div>

        <!-- Footer: total + acciones -->
        <div class="order-card-footer">
          <div class="order-total-block">
            <span class="total-label">Total del pedido</span>
            <span class="total-value">{{ formatPrice(order.total) }}</span>
          </div>
          <div class="order-actions">
            <button class="action-btn primary" @click="goToDetail(order.id)" :id="`order-detail-${order.id}`">
              <span class="material-symbols-outlined">visibility</span>
              Ver detalle
            </button>
            <button
              class="action-btn secondary"
              @click="goToReturn(order.id)"
              :disabled="order.status === 'preparing'"
              :title="order.status === 'preparing' ? 'Solo disponible tras el envío' : 'Solicitar cambio o devolución'"
              :id="`order-return-${order.id}`"
            >
              <span class="material-symbols-outlined">swap_horiz</span>
              Cambio / Devolución
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-history-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header ── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem 1.75rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  font-size: 2.2rem;
  color: var(--button-purple, #c58cf2);
  background: rgba(197, 140, 242, 0.1);
  padding: 0.75rem;
  border-radius: 1rem;
  flex-shrink: 0;
}

.section-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
  margin: 0;
}

.section-subtitle {
  font-size: 0.85rem;
  color: #7c8ba1;
  margin: 0.15rem 0 0;
}

.orders-count {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--button-purple, #c58cf2);
  background: rgba(197, 140, 242, 0.1);
  padding: 0.35rem 0.9rem;
  border-radius: 5rem;
}

/* ── Empty ── */
.empty-state {
  background: white;
  border-radius: 1.5rem;
  padding: 3.5rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
}

.empty-icon-wrap {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: rgba(197, 140, 242, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 2.8rem;
  color: var(--button-purple, #c58cf2);
}

.empty-state h3 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

.empty-state p {
  font-size: 0.9rem;
  color: #7c8ba1;
  max-width: 24rem;
  line-height: 1.5;
}

.shop-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--button-purple, #c58cf2);
  color: white;
  padding: 0.7rem 1.5rem;
  border-radius: 5rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.22s ease;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.25);
  margin-top: 0.5rem;
}

.shop-btn:hover {
  background: #b373e6;
  transform: translateY(-2px);
}

/* ── Orders list ── */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.order-card {
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
  overflow: hidden;
  border: 1.5px solid transparent;
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}

.order-card:hover {
  border-color: rgba(197, 140, 242, 0.2);
  box-shadow: 0 8px 30px rgba(26, 91, 130, 0.08);
}

/* Card header */
.order-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(26, 91, 130, 0.05);
  flex-wrap: wrap;
  gap: 0.75rem;
}

.order-id-block {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.order-id {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
  letter-spacing: 0.04em;
}

.order-date {
  font-size: 0.8rem;
  color: #7c8ba1;
}

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.9rem;
  border-radius: 5rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.orange  { background: #fff7ed; color: #d97706; }
.status-badge.blue    { background: #eff6ff; color: #2563eb; }
.status-badge.green   { background: #f0fdf4; color: #059669; }
.status-badge.red     { background: #fef2f2; color: #ef4444; }
.status-badge.grey    { background: #f8fafc; color: #64748b; }

.status-icon {
  font-size: 1rem;
}

/* Products list */
.order-items {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.65rem;
  border-radius: 0.75rem;
  background: #f8fafc;
  transition: background 0.18s ease;
}

.order-item:hover {
  background: #f1f5f9;
}

.item-img {
  width: 3rem;
  height: 3rem;
  border-radius: 0.6rem;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-blue, #1a5b82);
}

.item-meta {
  font-size: 0.75rem;
  color: #7c8ba1;
}

.item-subtotal {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--button-purple, #c58cf2);
  white-space: nowrap;
}

/* Card footer */
.order-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.5rem;
  border-top: 1px solid rgba(26, 91, 130, 0.05);
  background: #fafbfc;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.order-total-block {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.total-label {
  font-size: 0.75rem;
  color: #7c8ba1;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.total-value {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}

/* Action buttons */
.order-actions {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1.1rem;
  border-radius: 5rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.22s ease;
  white-space: nowrap;
}

.action-btn .material-symbols-outlined {
  font-size: 1.05rem;
}

.action-btn.primary {
  background: var(--button-purple, #c58cf2);
  color: white;
  box-shadow: 0 4px 12px rgba(197, 140, 242, 0.25);
}

.action-btn.primary:hover {
  background: #b373e6;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: white;
  color: var(--text-blue, #1a5b82);
  border: 1.5px solid rgba(26, 91, 130, 0.12);
}

.action-btn.secondary:hover:not(:disabled) {
  border-color: var(--button-purple, #c58cf2);
  color: var(--button-purple, #c58cf2);
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .order-card-footer {
    flex-direction: column;
    align-items: stretch;
  }
  .order-actions {
    flex-direction: column;
  }
  .action-btn {
    justify-content: center;
  }
}
</style>
