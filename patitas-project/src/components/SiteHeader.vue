<template>
  <header class="site-header" :class="{ 'is-sticky': isSticky }">
    <div class="header-content container">

      <!-- Logo -->
      <RouterLink to="/" class="logo-area" aria-label="Volver al inicio">
        <div class="logo-wrap">
          <img src="../assets/logo.png" alt="Patitas Logo" class="logo" />
        </div>
      </RouterLink>

      <!-- Nav desktop -->
      <nav class="main-nav">
        <ul>
          <li v-for="item in navItems" :key="item.label">
            <RouterLink
              v-if="item.href.startsWith('/')"
              :to="item.href"
              :class="{ active: route.path === item.href }"
            >
              {{ item.label }}
            </RouterLink>
            <a
              v-else
              :href="item.href"
              :class="{ active: route.path === item.href }"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>

      <!-- Acciones -->
      <div class="header-actions">
        <!-- <button class="icon-btn" aria-label="Buscar">
          <span class="material-symbols-outlined">search</span>
        </button> -->
        <button class="icon-btn cart-btn" aria-label="Carrito" @click="isCartOpen = true">
          <span class="material-symbols-outlined">shopping_cart</span>
          <span v-if="cartStore.totalItems > 0" class="cart-badge">{{ cartStore.totalItems }}</span>
        </button>

        <!-- Botón dinámico según estado de sesión -->
        <template v-if="authStore.isAuthenticated">
          <div class="user-pill">
            <span class="user-avatar">{{ authStore.initials }}</span>
            <span class="user-name">{{ authStore.displayName }}</span>
            <button class="logout-btn" @click="authStore.logout()" aria-label="Cerrar sesión">
              <span class="material-symbols-outlined">logout</span>
            </button>
          </div>
        </template>
        <template v-else>
          <button class="login-btn" @click="emit('open-login')" id="header-login-btn">Iniciar sesión</button>
        </template>

        <button class="hamburger" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-label="Menú">
          <span :class="{ open: menuOpen }"></span>
          <span :class="{ open: menuOpen }"></span>
          <span :class="{ open: menuOpen }"></span>
        </button>
      </div>
    </div>

    <!-- Mobile nav -->
    <nav class="mobile-nav" :class="{ open: menuOpen }">
      <ul>
        <li v-for="item in navItems" :key="item.label">
          <RouterLink
            v-if="item.href.startsWith('/')"
            :to="item.href"
            :class="{ active: route.path === item.href }"
            @click="menuOpen = false"
          >
            {{ item.label }}
          </RouterLink>
          <a
            v-else
            :href="item.href"
            :class="{ active: route.path === item.href }"
            @click="menuOpen = false"
          >
            {{ item.label }}
          </a>
        </li>
        <!-- Sección de Autenticación Móvil -->
        <li class="mobile-auth-item">
          <template v-if="authStore.isAuthenticated">
            <div class="mobile-user-row">
              <span class="user-avatar">{{ authStore.initials }}</span>
              <span class="user-name">{{ authStore.displayName }}</span>
              <button class="mobile-logout-btn" @click="authStore.logout(); menuOpen = false" aria-label="Cerrar sesión">
                <span class="material-symbols-outlined">logout</span>
                Cerrar Sesión
              </button>
            </div>
          </template>
          <template v-else>
            <button class="mobile-login-btn" @click="emit('open-login'); menuOpen = false">
              <span class="material-symbols-outlined">login</span>
              Iniciar sesión
            </button>
          </template>
        </li>
      </ul>
    </nav>

    <!-- Wave inferior que separa limpiamente del hero -->
    <div class="header-wave">
      <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0 0C360 50 1080 0 1440 30L1440 50L0 50Z" fill="#f0f8ff"/>
      </svg>
    </div>

    <!-- Drawer del Carrito -->
    <Transition name="drawer-fade">
      <div v-if="isCartOpen" class="cart-overlay" @click.self="isCartOpen = false">
        <Transition name="drawer-slide">
          <div v-if="isCartOpen" class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div class="drawer-header">
              <h2 id="cart-title">Tu Carrito</h2>
              <button class="close-drawer-btn" @click="isCartOpen = false" aria-label="Cerrar carrito">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- Listado de items -->
            <div class="drawer-body">
              <div v-if="cartStore.items.length === 0" class="empty-cart-view">
                <span class="material-symbols-outlined empty-cart-icon">shopping_basket</span>
                <p>Tu carrito está vacío</p>
                <RouterLink to="/tienda" @click="isCartOpen = false" class="start-shopping-btn">
                  Explorar tienda
                </RouterLink>
              </div>
              <div v-else class="cart-items-list">
                <div v-for="item in cartStore.items" :key="item.product.id" class="cart-item">
                  <img :src="item.product.image" :alt="item.product.name" class="item-img" />
                  <div class="item-details">
                    <h4>{{ item.product.name }}</h4>
                    <span class="item-price">{{ formatPrice(item.product.price) }}</span>
                    <!-- Controles de cantidad -->
                    <div class="item-qty-row">
                      <div class="qty-adjuster">
                        <button @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)" :disabled="item.quantity <= 1" aria-label="Disminuir cantidad">
                          <span class="material-symbols-outlined">remove</span>
                        </button>
                        <span>{{ item.quantity }}</span>
                        <button @click="cartStore.updateQuantity(item.product.id, item.quantity + 1)" aria-label="Aumentar cantidad">
                          <span class="material-symbols-outlined">add</span>
                        </button>
                      </div>
                      <button @click="cartStore.removeItem(item.product.id)" class="remove-item-btn" aria-label="Eliminar artículo">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer con totales -->
            <div v-if="cartStore.items.length > 0" class="drawer-footer">
              <div class="price-summary-row">
                <span>Subtotal</span>
                <span class="total-amount">{{ formatPrice(cartStore.totalPrice) }}</span>
              </div>
              <p class="shipping-info">Envío y tasas calculados al finalizar la compra.</p>
              <button @click="handleCheckout" class="checkout-btn">
                <span>Proceder al pago</span>
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';

const emit = defineEmits(['open-login']);
const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const menuOpen = ref(false);
const isSticky = ref(false);
const isCartOpen = ref(false);
const route = useRoute();

const navItems = ref([
  { label: 'inicio',   href: '/' },
  { label: 'recursos', href: '/recursos' },
  { label: 'comunidad patitas', href: '/comunidad' },
  { label: 'centros',  href: '/centros' },
  { label: 'tienda',   href: '/tienda' },
  { label: 'contacto', href: '/contacto' },
]);

const handleScroll = () => {
  isSticky.value = window.scrollY > 80;
};

function formatPrice(val) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(val);
}

function handleCheckout() {
  isCartOpen.value = false;
  router.push({ name: 'checkout' });
}

const openCartDrawer = () => {
  isCartOpen.value = true;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('open-cart-drawer', openCartDrawer);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('open-cart-drawer', openCartDrawer);
});
</script>

<style scoped>
/* ─── HEADER ─── */
.site-header {
  background-image: url('../assets/fondo_morado.png');
  background-size: cover;
  background-position: center;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.site-header.is-sticky {
  box-shadow: 0 0.22rem 1.11rem rgba(26, 91, 130, 0.15);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.11rem;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  transition: padding 0.3s ease;
}

.site-header.is-sticky .header-content {
  padding-top: 0.4rem;
  padding-bottom: 0.4rem;
}

/* ─── LOGO ─── */
.logo-area {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
}

.logo-wrap {
  position: relative;
  width: 3.8rem;
  height: 3.8rem;
  transition: width 0.3s ease, height 0.3s ease;
}

.logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 50%;
  object-fit: cover;
  border: 0.18rem solid rgba(255,255,255,1);
  box-shadow: 0 0.33rem 1.11rem rgba(0,0,0,0.18);
  transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), width 0.3s ease, height 0.3s ease, border-width 0.3s ease;
  display: block;
  z-index: 10;
}
.logo:hover { transform: translate(-50%, -50%) scale(1.08) rotate(-4deg); }

.site-header.is-sticky .logo-wrap {
  width: 3.2rem;
  height: 3.2rem;
}

.site-header.is-sticky .logo {
  width: 4.3rem;
  height: 4.3rem;
  border-width: 0.14rem;
}

.brand-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--text-blue);
  letter-spacing: 0.03rem;
  text-shadow: 0.06rem 0.06rem 0 #fff, -0.06rem -0.06rem 0 #fff, 0.06rem -0.06rem 0 #fff, -0.06rem 0.06rem 0 #fff;
}

/* ─── NAV DESKTOP ─── */
.main-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.main-nav ul {
  display: flex;
  gap: 0.22rem;
  background: rgba(255,255,255,0.75);
  backdrop-filter: blur(0.56rem);
  border: 0.06rem solid rgba(255,255,255,0.9);
  border-radius: 5.5rem;
  padding: 0.28rem 0.44rem;
  box-shadow: 0 0.11rem 0.67rem rgba(26,91,130,0.08);
}

.main-nav a {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-blue);
  padding: 0.33rem 1.11rem;
  border-radius: 5.5rem;
  transition: all 0.22s ease;
  display: block;
  white-space: nowrap;
}

.main-nav a:hover:not(.active) {
  background-color: var(--button-purple-soft);
  color: var(--text-blue);
}

.main-nav a.active {
  background-color: var(--button-purple);
  color: white;
  box-shadow: 0 0.11rem 0.56rem rgba(197,140,242,0.45);
}

/* ─── ACCIONES ─── */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.44rem;
  flex-shrink: 0;
}

.icon-btn {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(0.44rem);
  border: 0.06rem solid rgba(255,255,255,0.85);
  border-radius: 50%;
  width: 2.33rem;
  height: 2.33rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-blue);
  cursor: pointer;
  transition: all 0.22s ease;
}
.icon-btn:hover {
  background: white;
  box-shadow: 0 0.22rem 0.78rem rgba(26,91,130,0.12);
  transform: translateY(-0.06rem);
}
.icon-btn .material-symbols-outlined { font-size: 1.22rem; }

.login-btn {
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  background: var(--button-purple);
  color: white;
  padding: 0.5rem 1.22rem;
  border: none;
  border-radius: 5.5rem;
  cursor: pointer;
  transition: all 0.22s ease;
  box-shadow: var(--shadow-purple);
  white-space: nowrap;
}
.login-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-0.11rem);
  box-shadow: 0 0.33rem 1.33rem rgba(197,140,242,0.5);
}

/* ─── USER PILL (sesión activa) ─── */
.user-pill {
  display: flex;
  align-items: center;
  gap: 0.44rem;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(0.44rem);
  border: 0.06rem solid rgba(255,255,255,0.9);
  border-radius: 5.5rem;
  padding: 0.28rem 0.67rem 0.28rem 0.28rem;
  box-shadow: var(--shadow-soft);
  transition: all 0.22s ease;
}

.user-avatar {
  width: 1.78rem;
  height: 1.78rem;
  border-radius: 50%;
  background: var(--button-purple);
  color: white;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.03rem;
}

.user-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-blue);
  white-space: nowrap;
  max-width: 7rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-blue);
  opacity: 0.55;
  display: flex;
  align-items: center;
  padding: 0;
  transition: opacity 0.2s, color 0.2s;
  margin-left: 0.11rem;
}
.logout-btn:hover {
  opacity: 1;
  color: #e53e3e;
}
.logout-btn .material-symbols-outlined { font-size: 1.05rem; }

/* ─── HAMBURGER ─── */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 0.28rem;
  background: rgba(255,255,255,0.7);
  border: 0.06rem solid rgba(255,255,255,0.85);
  border-radius: 0.56rem;
  cursor: pointer;
  padding: 0.5rem 0.56rem;
}
.hamburger span {
  display: block;
  width: 1.22rem;
  height: 0.14rem;
  background: var(--text-blue);
  border-radius: 0.11rem;
  transition: all 0.25s ease;
  transform-origin: center;
}
.hamburger span.open:nth-child(1) { transform: translateY(0.42rem) rotate(45deg); }
.hamburger span.open:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger span.open:nth-child(3) { transform: translateY(-0.42rem) rotate(-45deg); }

/* ─── MOBILE NAV ─── */
.mobile-nav {
  display: none;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.35s ease;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(0.67rem);
  border-bottom: 1px solid rgba(26,91,130,0.08);
}
.mobile-nav.open {
  max-height: 25rem;
}
.mobile-nav ul {
  padding: 0.89rem 1.11rem 1.33rem;
  display: flex;
  flex-direction: column;
  gap: 0.33rem;
}
.mobile-nav a {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-blue);
  padding: 0.67rem 1.11rem;
  border-radius: 0.67rem;
  display: block;
  transition: all 0.2s;
}
.mobile-nav a.active { background: var(--button-purple); color: white; }
.mobile-nav a:hover:not(.active) { background: var(--button-purple-soft); }

/* Autenticación en Nav Móvil */
.mobile-auth-item {
  border-top: 1px dashed rgba(26, 91, 130, 0.15);
  margin-top: 0.67rem;
  padding-top: 0.89rem;
}

.mobile-user-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.56rem;
  padding: 0.56rem 0;
}

.mobile-user-row .user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1rem;
}

.mobile-user-row .user-name {
  font-size: 1.05rem;
  max-width: 100%;
}

.mobile-logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.44rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  background: rgba(229, 62, 62, 0.08);
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.15);
  border-radius: 5.5rem;
  padding: 0.56rem 1.11rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-logout-btn:hover {
  background: #e53e3e;
  color: white;
}

.mobile-login-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.44rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  background: var(--button-purple);
  color: white;
  border: none;
  border-radius: 5.5rem;
  padding: 0.67rem 1.11rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-purple);
}

.mobile-login-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

/* ─── WAVE ─── */
.header-wave {
  height: 2.78rem;
  display: block;
  transition: height 0.3s ease;
}
.header-wave svg {
  width: 100%;
  height: 100%;
  display: block;
}

.site-header.is-sticky .header-wave {
  height: 1.22rem;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 960px) {
  .main-nav { display: none; }
  .hamburger { display: flex; }
  .mobile-nav { display: block; }
}

@media (max-width: 576px) {
  .login-btn { display: none; }
  .logo { width: 3.2rem; height: 3.2rem; }
}

/* ─── CARRITO BADGE & DRAWER ─── */
.cart-btn {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -0.22rem;
  right: -0.22rem;
  background-color: #e53e3e;
  color: white;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 50%;
  width: 1.11rem;
  height: 1.11rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
}

/* Overlay & Drawer */
.cart-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(26, 91, 130, 0.45);
  backdrop-filter: blur(0.22rem);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.cart-drawer {
  background: white;
  width: 100%;
  max-width: 24rem;
  height: 100%;
  box-shadow: -0.44rem 0 1.78rem rgba(26, 91, 130, 0.15);
  display: flex;
  flex-direction: column;
  position: relative;
  border-left: 1px solid rgba(26, 91, 130, 0.08);
}

.drawer-header {
  padding: 1.33rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed rgba(26, 91, 130, 0.08);
}

.drawer-header h2 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-blue);
  margin: 0;
}

.close-drawer-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-blue);
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.2s;
  padding: 0.22rem;
}

.close-drawer-btn:hover {
  opacity: 1;
  transform: rotate(90deg);
}

.close-drawer-btn .material-symbols-outlined {
  font-size: 1.4rem;
}

.drawer-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1.33rem;
}

/* Carrito vacío */
.empty-cart-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.78rem;
  color: var(--text-blue);
  opacity: 0.8;
}

.empty-cart-icon {
  font-size: 3.5rem;
  color: var(--button-purple);
  opacity: 0.4;
}

.empty-cart-view p {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0;
}

.start-shopping-btn {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  background: var(--button-purple);
  color: white;
  border: none;
  border-radius: 5.5rem;
  padding: 0.56rem 1.33rem;
  text-decoration: none;
  margin-top: 0.44rem;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-purple);
}

.start-shopping-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

/* Listado de items */
.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 1.11rem;
}

.cart-item {
  display: flex;
  gap: 0.89rem;
  align-items: center;
  padding-bottom: 1.11rem;
  border-bottom: 1px solid rgba(26, 91, 130, 0.05);
}

.item-img {
  width: 4.5rem;
  height: 4.5rem;
  object-fit: cover;
  border-radius: 0.89rem;
  border: 1px solid rgba(26, 91, 130, 0.05);
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
}

.item-details h4 {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-blue);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.85;
}

.item-qty-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.22rem;
}

.qty-adjuster {
  display: flex;
  align-items: center;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 5.5rem;
  padding: 0.11rem;
  gap: 0.44rem;
}

.qty-adjuster button {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 1.44rem;
  height: 1.44rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-blue);
  transition: all 0.15s ease;
}

.qty-adjuster button:hover:not(:disabled) {
  border-color: var(--button-purple);
  color: var(--button-purple);
}

.qty-adjuster button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-adjuster button .material-symbols-outlined {
  font-size: 0.8rem;
}

.qty-adjuster span {
  font-size: 0.85rem;
  font-weight: 700;
  min-width: 0.89rem;
  text-align: center;
}

.remove-item-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  display: flex;
  align-items: center;
  padding: 0.22rem;
  transition: color 0.2s;
}

.remove-item-btn:hover {
  color: #e53e3e;
}

.remove-item-btn .material-symbols-outlined {
  font-size: 1.11rem;
}

/* Footer del drawer */
.drawer-footer {
  padding: 1.33rem;
  background: #f7fafc;
  border-top: 1px dashed rgba(26, 91, 130, 0.08);
}

.price-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.44rem;
}

.total-amount {
  font-size: 1.33rem;
  color: var(--button-purple);
}

.shipping-info {
  font-size: 0.78rem;
  opacity: 0.7;
  margin: 0 0 1.11rem;
  line-height: 1.3;
}

.checkout-btn {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  background: var(--button-purple);
  color: white;
  border: none;
  border-radius: 5.5rem;
  width: 100%;
  padding: 0.78rem 1.11rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-purple);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.44rem;
}

.checkout-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
  box-shadow: 0 0.33rem 1.11rem rgba(197, 140, 242, 0.45);
}

.checkout-btn .material-symbols-outlined {
  font-size: 1.11rem;
}

/* Transiciones */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
