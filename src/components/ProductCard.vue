<template>
  <div class="product-card" :class="{ 'is-out-of-stock': !product.inStock }">
    <!-- Imagen del producto -->
    <div class="image-wrapper" @click="goToDetail">
      <img :src="product.image" :alt="product.name" class="product-img" />
      <span class="category-badge" :class="product.category">
        {{ product.categoryLabel }}
      </span>
      <div v-if="!product.inStock" class="out-of-stock-overlay">
        <span>Agotado</span>
      </div>
    </div>

    <!-- Info del producto -->
    <div class="product-info">
      <div class="meta-row">
        <span class="age-tag">
          <span class="material-symbols-outlined icon">child_care</span>
          {{ product.ageRange }}
        </span>
        <span v-if="product.inStock" class="stock-tag in-stock">En Stock</span>
        <span v-else class="stock-tag out-of-stock">Agotado</span>
      </div>

      <h3 class="product-name" @click="goToDetail">{{ product.name }}</h3>
      <p class="product-description">{{ product.description }}</p>

      <!-- Fila inferior: precio y acción -->
      <div class="footer-row">
        <span class="product-price">{{ formatPrice(product.price) }}</span>
        <button
          @click.stop="handleAddToCart"
          class="add-to-cart-btn"
          :disabled="!product.inStock"
          :aria-label="product.inStock ? 'Agregar al carrito' : 'Producto agotado'"
        >
          <span class="material-symbols-outlined">add_shopping_cart</span>
          <span>Añadir</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['add-to-cart']);
const router = useRouter();

function formatPrice(val) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(val);
}

function goToDetail() {
  router.push(`/tienda/${props.product.id}`);
}

function handleAddToCart() {
  if (props.product.inStock) {
    emit('add-to-cart', props.product);
  }
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(26, 91, 130, 0.05);
}

.product-card:hover {
  transform: translateY(-0.35rem);
  box-shadow: 0 0.67rem 1.78rem rgba(26, 91, 130, 0.12);
}

/* Imagen */
.image-wrapper {
  position: relative;
  width: 100%;
  height: 12.5rem;
  overflow: hidden;
  cursor: pointer;
  background: #f7fafc;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.category-badge {
  position: absolute;
  top: 0.89rem;
  left: 0.89rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.67rem;
  border-radius: 5.5rem;
  color: white;
  box-shadow: 0 0.11rem 0.44rem rgba(0,0,0,0.1);
}

/* Colores de badges por categoría */
.category-badge.cognitivo {
  background-color: var(--button-purple);
}

.category-badge.sensorial {
  background-color: #319795; /* Turquesa */
}

.category-badge.motor {
  background-color: #dd6b20; /* Naranja */
}

.out-of-stock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.out-of-stock-overlay span {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #e53e3e;
  background: white;
  padding: 0.44rem 1.11rem;
  border-radius: 5.5rem;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(229, 62, 62, 0.15);
}

/* Info */
.product-info {
  padding: 1.11rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.56rem;
}

.age-tag {
  display: flex;
  align-items: center;
  gap: 0.22rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-blue);
  opacity: 0.8;
}

.age-tag .icon {
  font-size: 0.95rem;
}

.stock-tag {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03rem;
}

.stock-tag.in-stock {
  color: #319795;
}

.stock-tag.out-of-stock {
  color: #e53e3e;
}

.product-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.44rem;
  cursor: pointer;
  line-height: 1.3;
  transition: color 0.2s ease;
}

.product-name:hover {
  color: var(--button-purple);
}

.product-description {
  font-size: 0.85rem;
  color: var(--text-blue);
  opacity: 0.75;
  line-height: 1.4;
  margin-bottom: 1.11rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Footer de la tarjeta */
.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed rgba(26, 91, 130, 0.08);
  padding-top: 0.78rem;
}

.product-price {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-blue);
}

.add-to-cart-btn {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  background: var(--button-purple);
  color: white;
  border: none;
  border-radius: 5.5rem;
  padding: 0.44rem 0.89rem;
  display: flex;
  align-items: center;
  gap: 0.33rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0.11rem 0.56rem rgba(197, 140, 242, 0.3);
}

.add-to-cart-btn:hover:not(:disabled) {
  background: var(--button-purple-hover);
  transform: translateY(-0.06rem);
  box-shadow: 0 0.22rem 0.78rem rgba(197, 140, 242, 0.45);
}

.add-to-cart-btn:disabled {
  background: #cbd5e0;
  color: #718096;
  cursor: not-allowed;
  box-shadow: none;
}

.add-to-cart-btn .material-symbols-outlined {
  font-size: 1.05rem;
}

/* Estado Agotado total */
.is-out-of-stock {
  opacity: 0.78;
}
</style>
