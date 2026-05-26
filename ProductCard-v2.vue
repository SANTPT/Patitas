<template>
  <div class="product-card" :class="{ 'agotado': !product.inStock }" @click="goToDetail">

    <!-- Imagen -->
    <div class="card-img-wrap">
      <img :src="product.image" :alt="product.name" class="card-img" />

      <!-- Badge categoría -->
      <span class="cat-badge" :class="product.category">
        {{ catEmoji }} {{ product.categoryLabel }}
      </span>

      <!-- Overlay agotado -->
      <div v-if="!product.inStock" class="agotado-overlay">
        <span>Agotado</span>
      </div>

      <!-- Botón rápido de carrito -->
      <button
        v-if="product.inStock"
        class="quick-add"
        @click.stop="handleAddToCart"
        aria-label="Agregar al carrito"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
        Añadir
      </button>
    </div>

    <!-- Info -->
    <div class="card-info">
      <div class="card-meta">
        <span class="age-pill">👶 {{ product.ageRange }}</span>
        <span class="stock-dot" :class="product.inStock ? 'in' : 'out'">
          {{ product.inStock ? 'Disponible' : 'Agotado' }}
        </span>
      </div>

      <h3 class="card-name">{{ product.name }}</h3>
      <p class="card-desc">{{ product.description }}</p>

      <div class="card-footer">
        <span class="card-price">{{ formatPrice(product.price) }}</span>
        <button
          class="detail-btn"
          @click.stop="goToDetail"
        >
          Ver detalle
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  product: { type: Object, required: true }
});

const emit = defineEmits(['add-to-cart']);
const router = useRouter();

const catEmoji = computed(() => ({
  cognitivo: '🧠',
  sensorial: '✨',
  motor: '🤸',
}[props.product.category] || '🎁'));

function formatPrice(val) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
}

function goToDetail() {
  router.push(`/tienda/${props.product.id}`);
}

function handleAddToCart() {
  if (props.product.inStock) emit('add-to-cart', props.product);
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  border: 1.5px solid rgba(197,140,242,0.12);
  box-shadow: 0 2px 16px rgba(26,91,130,0.06);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
}
.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 36px rgba(26,91,130,0.13);
}
.product-card.agotado { opacity: 0.72; }

/* ── IMAGEN ── */
.card-img-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: #f7f3ff;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.product-card:hover .card-img { transform: scale(1.06); }

/* Badge categoría */
.cat-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 99px;
  color: white;
  backdrop-filter: blur(4px);
}
.cat-badge.cognitivo { background: rgba(139,92,246,0.9); }
.cat-badge.sensorial  { background: rgba(13,148,136,0.9); }
.cat-badge.motor      { background: rgba(234,88,12,0.9);  }

/* Overlay agotado */
.agotado-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.agotado-overlay span {
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #e53e3e;
  background: white;
  padding: 6px 18px;
  border-radius: 99px;
  border: 1.5px solid rgba(229,62,62,0.2);
}

/* Botón rápido */
.quick-add {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: #c58cf2;
  color: white;
  border: none;
  border-radius: 99px;
  padding: 7px 14px;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(6px);
  transition: all 0.22s ease;
  box-shadow: 0 4px 14px rgba(197,140,242,0.45);
}
.product-card:hover .quick-add {
  opacity: 1;
  transform: translateY(0);
}
.quick-add:hover { background: #b373e6; }

/* ── INFO ── */
.card-info {
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.age-pill {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  color: #1a5b82;
  background: rgba(26,91,130,0.07);
  padding: 3px 10px;
  border-radius: 99px;
}

.stock-dot {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}
.stock-dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.stock-dot.in  { color: #0d9488; }
.stock-dot.in::before  { background: #0d9488; }
.stock-dot.out { color: #e53e3e; }
.stock-dot.out::before { background: #e53e3e; }

.card-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a5b82;
  margin-bottom: 8px;
  line-height: 1.25;
  transition: color 0.2s;
}
.product-card:hover .card-name { color: #c58cf2; }

.card-desc {
  font-size: 0.82rem;
  color: #1a5b82;
  opacity: 0.7;
  line-height: 1.55;
  flex: 1;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(197,140,242,0.12);
  padding-top: 12px;
}

.card-price {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a5b82;
}

.detail-btn {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #c58cf2;
  background: rgba(197,140,242,0.1);
  border: 1px solid rgba(197,140,242,0.25);
  border-radius: 99px;
  padding: 6px 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}
.detail-btn:hover {
  background: #c58cf2;
  color: white;
  border-color: #c58cf2;
}
</style>
