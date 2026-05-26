<template>
  <div class="product-detail-page container">
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><RouterLink to="/">Inicio</RouterLink></li>
        <li><span class="material-symbols-outlined separator">chevron_right</span></li>
        <li><RouterLink to="/tienda">Tienda</RouterLink></li>
        <li><span class="material-symbols-outlined separator">chevron_right</span></li>
        <li class="active" aria-current="page" v-if="product">{{ product.name }}</li>
      </ol>
    </nav>

    <!-- Botón Volver -->
    <button @click="goBack" class="back-link-btn">
      <span class="material-symbols-outlined">arrow_back</span>
      <span>Volver a la tienda</span>
    </button>

    <!-- Skeletons durante carga -->
    <div v-if="isLoading" class="detail-loading-wrapper">
      <div class="skeleton-col img"></div>
      <div class="skeleton-col info">
        <div class="skeleton-line tag"></div>
        <div class="skeleton-line title"></div>
        <div class="skeleton-line price"></div>
        <div class="skeleton-line desc"></div>
        <div class="skeleton-line action"></div>
      </div>
    </div>

    <template v-else-if="product">
      <!-- Layout Detalle -->
      <div class="detail-layout">
        <!-- Columna Izquierda: Imagen -->
        <div class="image-gallery-col">
          <div class="main-image-wrap">
            <img :src="product.image" :alt="product.name" class="main-img" />
            <span class="category-tag" :class="product.category">
              {{ product.categoryLabel }}
            </span>
          </div>
        </div>

        <!-- Columna Derecha: Información y Acciones -->
        <div class="product-info-col">
          <div class="meta-info">
            <span class="age-badge">
              <span class="material-symbols-outlined">child_care</span>
              <span>Recomendado: {{ product.ageRange }}</span>
            </span>
            <span class="dev-type-badge">
              <span class="material-symbols-outlined">psychology</span>
              <span>Desarrollo: {{ product.developmentType }}</span>
            </span>
          </div>

          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="price-stock-row">
            <span class="price-value">{{ formatPrice(product.price) }}</span>
            <span v-if="product.inStock" class="stock-status in-stock">
              <span class="material-symbols-outlined">check_circle</span>
              Disponible
            </span>
            <span v-else class="stock-status out-of-stock">
              <span class="material-symbols-outlined">cancel</span>
              Agotado
            </span>
          </div>

          <p class="short-desc">{{ product.description }}</p>
          
          <div class="divider"></div>

          <div class="long-desc">
            <h3>Sobre este artículo</h3>
            <p>{{ product.longDescription }}</p>
          </div>

          <div class="divider"></div>

          <!-- Lógica de Compra -->
          <div v-if="product.inStock" class="purchase-controls">
            <!-- Selector de Cantidad -->
            <div class="qty-selector">
              <label for="qty-input">Cantidad</label>
              <div class="qty-btn-group">
                <button @click="decreaseQty" :disabled="quantity <= 1" class="qty-btn" aria-label="Disminuir cantidad">
                  <span class="material-symbols-outlined">remove</span>
                </button>
                <input 
                  id="qty-input" 
                  type="number" 
                  v-model.number="quantity" 
                  min="1" 
                  class="qty-input" 
                  readonly 
                />
                <button @click="increaseQty" class="qty-btn" aria-label="Aumentar cantidad">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="action-buttons">
              <button @click="addToCart" class="add-to-cart-action">
                <span class="material-symbols-outlined">add_shopping_cart</span>
                <span>Añadir al carrito</span>
              </button>
              <button @click="buyNow" class="buy-now-action">
                <span>Comprar ahora</span>
              </button>
            </div>
          </div>

          <div v-else class="out-of-stock-notice">
            <span class="material-symbols-outlined alert-icon">error</span>
            <div>
              <h4>Este artículo no está disponible actualmente</h4>
              <p>Estamos trabajando para reponer el stock lo antes posible. Déjanos tu correo para avisarte.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos Relacionados -->
      <section class="related-products-section" v-if="relatedProducts.length > 0">
        <h2 class="section-title">Productos recomendados</h2>
        <div class="products-grid">
          <ProductCard
            v-for="p in relatedProducts"
            :key="p.id"
            :product="p"
            @add-to-cart="handleRelatedAddToCart"
          />
        </div>
      </section>
    </template>

    <div v-else class="error-state">
      <span class="material-symbols-outlined error-icon">error</span>
      <h2>No encontramos el producto</h2>
      <p>El enlace podría estar roto o el artículo ya no se encuentra en catálogo.</p>
      <RouterLink to="/tienda" class="back-btn">Volver a la tienda</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import ProductCard from '../components/ProductCard.vue';
import { useCartStore } from '../stores/cart';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

// Estados
const product = ref(null);
const allProducts = ref([]);
const isLoading = ref(true);
const quantity = ref(1);

// Cargar producto basado en ID de la ruta
const fetchProductData = async () => {
  isLoading.value = true;
  const productId = route.params.id;
  try {
    const [detailRes, listRes] = await Promise.all([
      api.get(`/productos/${productId}`),
      api.get('/productos')
    ]);
    product.value = detailRes.data;
    allProducts.value = listRes.data;
    quantity.value = 1; // Resetear cantidad
  } catch (error) {
    console.error('Error al cargar datos del producto:', error);
    product.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchProductData);

// Recargar cuando el ID del parámetro cambie (al hacer clic en productos relacionados)
watch(() => route.params.id, fetchProductData);

// Productos relacionados (misma categoría, excluyendo el actual, máx 3)
const relatedProducts = computed(() => {
  if (!product.value) return [];
  return allProducts.value
    .filter(p => p.category === product.value.category && p.id !== product.value.id)
    .slice(0, 3);
});

// Selector de cantidad
function decreaseQty() {
  if (quantity.value > 1) {
    quantity.value--;
  }
}

function increaseQty() {
  quantity.value++;
}

// Formateo de precio
function formatPrice(val) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(val);
}

// Ir atrás
function goBack() {
  router.push('/tienda');
}

// Acciones de compra
function addToCart() {
  if (!product.value) return;
  const added = cartStore.addItem(product.value, quantity.value);
  if (added) {
    // Disparar evento para notificación toast
    const event = new CustomEvent('show-toast', {
      detail: {
        message: `¡${quantity.value}x ${product.value.name} agregado al carrito!`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  }
}

function buyNow() {
  if (!product.value) return;
  const added = cartStore.addItem(product.value, quantity.value);
  if (added) {
    // Abrir Drawer de carrito directamente
    const event = new CustomEvent('open-cart-drawer');
    window.dispatchEvent(event);
  }
}

function handleRelatedAddToCart(relatedProd) {
  const added = cartStore.addItem(relatedProd, 1);
  if (added) {
    const event = new CustomEvent('show-toast', {
      detail: {
        message: `¡${relatedProd.name} agregado al carrito!`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  }
}
</script>

<style scoped>
.product-detail-page {
  padding-top: 1.5rem;
  padding-bottom: 5rem;
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue);
}

/* Breadcrumbs */
.breadcrumbs {
  margin-bottom: 1rem;
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

/* Botón Volver */
.back-link-btn {
  display: flex;
  align-items: center;
  gap: 0.44rem;
  background: none;
  border: none;
  color: var(--text-blue);
  opacity: 0.7;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 2rem;
  transition: opacity 0.2s, color 0.2s, transform 0.2s;
  width: fit-content;
}

.back-link-btn:hover {
  opacity: 1;
  color: var(--button-purple);
  transform: translateX(-0.22rem);
}

.back-link-btn .material-symbols-outlined {
  font-size: 1.22rem;
}

/* Skeletons */
.detail-loading-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
}

.skeleton-col.img {
  background: #edf2f7;
  height: 25rem;
  border-radius: 2rem;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-col.info {
  display: flex;
  flex-direction: column;
  gap: 1.11rem;
}

.skeleton-line {
  background: #edf2f7;
  border-radius: 0.22rem;
  animation: pulse 1.5s infinite ease-in-out;
}

.skeleton-line.tag { width: 40%; height: 1.5rem; border-radius: 5.5rem; }
.skeleton-line.title { width: 90%; height: 2.5rem; }
.skeleton-line.price { width: 30%; height: 2rem; }
.skeleton-line.desc { width: 100%; height: 8rem; }
.skeleton-line.action { width: 70%; height: 3rem; border-radius: 5.5rem; }

/* Layout Detalle */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 5rem;
  align-items: start;
}

/* Columna de Imagen */
.image-gallery-col {
  width: 100%;
}

.main-image-wrap {
  position: relative;
  width: 100%;
  padding-top: 85%; /* Proporción agradable */
  border-radius: 2rem;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  border: 1px solid rgba(26, 91, 130, 0.05);
}

.main-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag {
  position: absolute;
  top: 1.11rem;
  left: 1.11rem;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.33rem 0.89rem;
  border-radius: 5.5rem;
  box-shadow: 0 0.11rem 0.56rem rgba(0,0,0,0.15);
}

.category-tag.cognitivo { background-color: var(--button-purple); }
.category-tag.sensorial { background-color: #319795; }
.category-tag.motor { background-color: #dd6b20; }

/* Columna de Info */
.product-info-col {
  display: flex;
  flex-direction: column;
}

.meta-info {
  display: flex;
  gap: 0.89rem;
  margin-bottom: 0.89rem;
  flex-wrap: wrap;
}

.age-badge, .dev-type-badge {
  background: var(--button-purple-soft);
  color: var(--text-blue);
  padding: 0.33rem 0.78rem;
  border-radius: 5.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.33rem;
}

.age-badge .material-symbols-outlined, 
.dev-type-badge .material-symbols-outlined {
  font-size: 1rem;
}

.product-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 1.11rem;
  line-height: 1.2;
}

.price-stock-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.33rem;
}

.price-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-blue);
}

.stock-status {
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.33rem;
}

.stock-status.in-stock { color: #319795; }
.stock-status.out-of-stock { color: #e53e3e; }
.stock-status .material-symbols-outlined { font-size: 1.22rem; }

.short-desc {
  font-size: 1rem;
  line-height: 1.5;
  opacity: 0.85;
  margin: 0 0 1.33rem;
}

.divider {
  height: 1px;
  background: radial-gradient(circle, rgba(26, 91, 130, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  margin: 1.33rem 0;
}

.long-desc h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.56rem;
}

.long-desc p {
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.8;
  margin: 0;
}

/*purchase controls */
.purchase-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.qty-selector {
  display: flex;
  flex-direction: column;
  gap: 0.44rem;
}

.qty-selector label {
  font-size: 0.9rem;
  font-weight: 700;
}

.qty-btn-group {
  display: flex;
  align-items: center;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 5.5rem;
  padding: 0.22rem;
  width: fit-content;
}

.qty-btn {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 1.89rem;
  height: 1.89rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-blue);
  transition: all 0.2s ease;
  box-shadow: 0 0.11rem 0.33rem rgba(0,0,0,0.03);
}

.qty-btn:hover:not(:disabled) {
  border-color: var(--button-purple);
  color: var(--button-purple);
  box-shadow: 0 0.22rem 0.56rem rgba(197, 140, 242, 0.2);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-btn .material-symbols-outlined {
  font-size: 1rem;
}

.qty-input {
  width: 2.5rem;
  text-align: center;
  border: none;
  background: transparent;
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-blue);
  outline: none;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.add-to-cart-action {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  background: white;
  color: var(--button-purple);
  border: 2px solid var(--button-purple);
  border-radius: 5.5rem;
  padding: 0.78rem 1.78rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.44rem;
}

.add-to-cart-action:hover {
  background: var(--button-purple-soft);
  transform: translateY(-1px);
}

.buy-now-action {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  background: var(--button-purple);
  color: white;
  border: none;
  border-radius: 5.5rem;
  padding: 0.78rem 1.78rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-purple);
  flex-grow: 1;
  text-align: center;
}

.buy-now-action:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
  box-shadow: 0 0.33rem 1.11rem rgba(197, 140, 242, 0.45);
}

/* Aviso fuera de stock */
.out-of-stock-notice {
  background: rgba(229, 62, 62, 0.05);
  border: 1px solid rgba(229, 62, 62, 0.15);
  border-radius: 1.11rem;
  padding: 1.11rem;
  display: flex;
  gap: 0.78rem;
  align-items: flex-start;
}

.out-of-stock-notice h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.22rem;
  color: #e53e3e;
}

.out-of-stock-notice p {
  font-size: 0.85rem;
  opacity: 0.8;
  margin: 0;
  line-height: 1.4;
}

.out-of-stock-notice .alert-icon {
  color: #e53e3e;
  font-size: 1.5rem;
}

/* Recomendados */
.related-products-section {
  border-top: 1px dashed rgba(26, 91, 130, 0.1);
  padding-top: 3.5rem;
}

.related-products-section .section-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* Estado de error */
.error-state {
  text-align: center;
  padding: 4rem 1.5rem;
}

.error-icon {
  font-size: 4rem;
  color: #e53e3e;
  opacity: 0.6;
  margin-bottom: 1.5rem;
}

.error-state h2 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.56rem;
}

.error-state p {
  opacity: 0.75;
  margin: 0 0 2rem;
}

.back-btn {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  background: var(--button-purple);
  color: white;
  border: none;
  border-radius: 5.5rem;
  padding: 0.67rem 1.5rem;
  text-decoration: none;
  display: inline-block;
  box-shadow: var(--shadow-purple);
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Responsivo */
@media (max-width: 960px) {
  .detail-layout, .detail-loading-wrapper {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  .action-buttons {
    flex-direction: column;
  }
  .add-to-cart-action, .buy-now-action {
    width: 100%;
    justify-content: center;
  }
}
</style>
