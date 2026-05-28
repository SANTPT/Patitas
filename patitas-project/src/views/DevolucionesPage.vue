<template>
  <div class="gestion-page">

    <!-- ░░ HERO ░░ -->
    <header class="page-header">
      <div class="header-content container">
        <h1 class="page-title">¿Necesitas gestionar algún producto?</h1>
        <p class="page-subtitle">
          {{ authStore.isAuthenticated
              ? 'Elige el producto y te guiamos en menos de 2 minutos.'
              : 'Cuéntanos qué pasó y te guiamos en menos de 2 minutos.' }}
        </p>
      </div>
      <div class="header-wave-bottom">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 30C480 60 960 0 1440 30L1440 60L0 60Z" fill="#f0f8ff"/>
        </svg>
      </div>
    </header>

    <div class="page-body container">

      <!-- ══════════ USUARIO LOGUEADO ══════════ -->
      <template v-if="authStore.isAuthenticated">

        <!-- PASO 0 (logueado): elegir producto de su historial -->
        <Transition name="step-slide" mode="out-in">
          <section v-if="step === 0" key="logged-s0" class="step-section">
            <div class="step-header">
              <div class="step-pill">Paso 1 de 3</div>
              <h2>¿Sobre qué producto necesitas ayuda?</h2>
              <p>Selecciona el producto de tus compras anteriores.</p>
            </div>

            <!-- Sin pedidos entregados -->
            <div v-if="userProducts.length === 0" class="empty-state">
              <span class="material-symbols-outlined empty-icon">local_shipping</span>
              <h2>No tienes pedidos entregados</h2>
              <p>Las devoluciones solo se pueden solicitar una vez que el pedido ha sido entregado.</p>

              <!-- Mostrar pedidos pendientes si los hay -->
              <div v-if="pendingUserProducts.length > 0" class="pending-orders-info">
                <span class="material-symbols-outlined">info</span>
                <div>
                  <strong>Tienes {{ pendingUserProducts.length }} producto(s) en camino</strong>
                  <span>Podrás solicitar cambios o devoluciones cuando sean entregados.</span>
                </div>
              </div>

              <RouterLink to="/tienda" class="btn-cta">Explorar tienda</RouterLink>
            </div>

            <!-- Grid de productos comprados -->
            <div v-else class="product-history-grid">
              <button
                v-for="prod in userProducts"
                :key="prod.productId + '-' + prod.orderId"
                class="product-history-card"
                :class="{ selected: selectedProduct?.productId === prod.productId && selectedProduct?.orderId === prod.orderId }"
                @click="pickProduct(prod)"
              >
                <img :src="prod.image" :alt="prod.name" />
                <div class="phcard-info">
                  <strong>{{ prod.name }}</strong>
                  <span class="phcard-order">Pedido {{ prod.orderId }}</span>
                  <span class="phcard-date">{{ fmtShort(prod.orderDate) }}</span>
                  <span class="phcard-status status-chip" :class="'chip-' + prod.orderStatus">
                    <span class="material-symbols-outlined">{{ statusIcon(prod.orderStatus) }}</span>
                    {{ statusLabel(prod.orderStatus) }}
                  </span>
                </div>
                <div class="phcard-check">
                  <span class="material-symbols-outlined">check</span>
                </div>
              </button>
            </div>
          </section>
        </Transition>

        <!-- PASO 1 (logueado): motivo -->
        <Transition name="step-slide" mode="out-in">
          <section v-if="step === 1" key="logged-s1" class="step-section">
            <div class="step-header">
              <div class="step-pill">Paso 2 de 3</div>
              <h2>¿Qué ha pasado con este producto?</h2>
              <p>Elige la opción que mejor describe tu situación.</p>
            </div>
            <!-- Mini resumen del producto seleccionado -->
            <div class="selected-product-bar">
              <img :src="selectedProduct.image" :alt="selectedProduct.name" />
              <div>
                <strong>{{ selectedProduct.name }}</strong>
                <span>Pedido {{ selectedProduct.orderId }} · {{ fmtShort(selectedProduct.orderDate) }}</span>
              </div>
              <button class="change-btn" @click="step = 0; selectedProduct = null">
                <span class="material-symbols-outlined">edit</span>
                Cambiar
              </button>
            </div>
            <div class="reason-grid">
              <button
                v-for="r in reasons"
                :key="r.id"
                class="reason-card"
                :class="{ selected: selectedReason === r.id }"
                @click="selectReason(r)"
              >
                <div class="reason-icon-wrap" :class="'icon-' + r.type">
                  <span class="material-symbols-outlined reason-icon">{{ r.icon }}</span>
                </div>
                <strong>{{ r.title }}</strong>
                <p>{{ r.desc }}</p>
                <div class="reason-tag" :class="'tag-' + r.type">{{ r.tag }}</div>
                <div class="reason-check"><span class="material-symbols-outlined">check</span></div>
              </button>
            </div>
          </section>
        </Transition>

        <!-- PASO 2 (logueado): formulario -->
        <Transition name="step-slide" mode="out-in">
          <section v-if="step === 2" key="logged-s2" class="step-section">
            <FormStep
              :product="selectedProduct"
              :reason="currentReason"
              :contact-email="authStore.user?.email || ''"
              @back="step = 1"
              @submit="onSubmit"
            />
          </section>
        </Transition>

      </template>

      <!-- ══════════ INVITADO ══════════ -->
      <template v-else>

        <!-- PASO 0 (invitado): lookup por código -->
        <Transition name="step-slide" mode="out-in">
          <section v-if="step === 0" key="guest-s0" class="step-section">
            <div class="step-header">
              <div class="step-pill">Paso 1 de 3</div>
              <h2>Primero, localiza tu pedido</h2>
              <p>Introduce el código del email que recibiste al comprar.</p>
            </div>

            <div class="lookup-card">
              <div class="lookup-input-group" :class="{ error: lookupError, success: guestOrder }">
                <span class="material-symbols-outlined lookup-prefix">receipt_long</span>
                <input
                  v-model="orderCode"
                  type="text" placeholder="PT-XXXXX"
                  class="lookup-input"
                  @input="lookupError = false; guestOrder = null"
                  @keyup.enter="lookupOrder"
                  autocomplete="off" spellcheck="false"
                />
                <button class="lookup-btn" @click="lookupOrder" :disabled="!orderCode.trim()">
                  <span class="material-symbols-outlined">search</span>
                  Buscar
                </button>
              </div>
              <p v-if="lookupError" class="lookup-error">
                <span class="material-symbols-outlined">error</span>
                No encontramos ese pedido. Revisa que el código sea exactamente como aparece en tu email.
              </p>

              <!-- Pedido encontrado: mostrar sus productos para elegir -->
              <Transition name="found-fade">
                <div v-if="guestOrder" class="order-found-card">
                  <div class="found-top">
                    <span class="found-badge" :class="{ 'badge-warning': guestOrder.status !== 'delivered' }">
                      <span class="material-symbols-outlined">{{ guestOrder.status === 'delivered' ? 'check_circle' : 'schedule' }}</span>
                      {{ guestOrder.status === 'delivered' ? 'Pedido encontrado' : 'Pedido ' + statusLabel(guestOrder.status) }}
                    </span>
                    <span class="found-id">{{ guestOrder.id }}</span>
                  </div>

                  <!-- Pedido no entregado: mostrar aviso y bloquear la solicitud -->
                  <div v-if="guestOrder.status !== 'delivered'" class="not-delivered-notice">
                    <span class="material-symbols-outlined">info</span>
                    <div>
                      <strong>Este pedido aún no ha sido entregado</strong>
                      <span>Las devoluciones solo se pueden solicitar una vez que el pedido llegue a tu domicilio. Estado actual: <strong>{{ statusLabel(guestOrder.status) }}</strong>.</span>
                    </div>
                  </div>

                  <!-- Solo mostrar picker si está entregado -->
                  <p v-if="guestOrder.status === 'delivered'" class="found-prompt">Selecciona el producto sobre el que necesitas ayuda:</p>
                  <div v-if="guestOrder.status === 'delivered'" class="found-products-picker">
                    <button
                      v-for="item in guestOrder.items"
                      :key="item.productId"
                      class="found-product-btn"
                      :class="{ selected: guestSelectedProduct?.productId === item.productId }"
                      @click="pickGuestProduct(item)"
                    >
                      <img :src="item.image" :alt="item.name" />
                      <div>
                        <span>{{ item.name }}</span>
                        <small>×{{ item.quantity }} · {{ fmt(item.subtotal) }}</small>
                      </div>
                      <div class="fpp-check"><span class="material-symbols-outlined">check</span></div>
                    </button>
                  </div>
                  <button
                    class="next-btn"
                    :disabled="!guestSelectedProduct || guestOrder.status !== 'delivered'"
                    @click="step = 1"
                  >
                    Continuar
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </Transition>

              <div class="lookup-hint">
                <span class="material-symbols-outlined">info</span>
                <span>¿Tienes cuenta? <RouterLink to="/login">Inicia sesión</RouterLink> y verás tus productos directamente.</span>
              </div>
            </div>
          </section>
        </Transition>

        <!-- PASO 1 (invitado): motivo -->
        <Transition name="step-slide" mode="out-in">
          <section v-if="step === 1" key="guest-s1" class="step-section">
            <div class="step-header">
              <div class="step-pill">Paso 2 de 3</div>
              <h2>¿Qué ha pasado con este producto?</h2>
              <p>Elige la opción que mejor describe tu situación.</p>
            </div>
            <div class="selected-product-bar">
              <img :src="activeProduct.image" :alt="activeProduct.name" />
              <div>
                <strong>{{ activeProduct.name }}</strong>
                <span>Pedido {{ guestOrder?.id }}</span>
              </div>
              <button class="change-btn" @click="step = 0; guestSelectedProduct = null">
                <span class="material-symbols-outlined">edit</span>
                Cambiar
              </button>
            </div>
            <div class="reason-grid">
              <button
                v-for="r in reasons"
                :key="r.id"
                class="reason-card"
                :class="{ selected: selectedReason === r.id }"
                @click="selectReason(r)"
              >
                <div class="reason-icon-wrap" :class="'icon-' + r.type">
                  <span class="material-symbols-outlined reason-icon">{{ r.icon }}</span>
                </div>
                <strong>{{ r.title }}</strong>
                <p>{{ r.desc }}</p>
                <div class="reason-tag" :class="'tag-' + r.type">{{ r.tag }}</div>
                <div class="reason-check"><span class="material-symbols-outlined">check</span></div>
              </button>
            </div>
          </section>
        </Transition>

        <!-- PASO 2 (invitado): formulario -->
        <Transition name="step-slide" mode="out-in">
          <section v-if="step === 2" key="guest-s2" class="step-section">
            <FormStep
              :product="activeProduct"
              :reason="currentReason"
              :contact-email="''"
              @back="step = 1"
              @submit="onSubmit"
            />
          </section>
        </Transition>

      </template>

      <!-- ══════════ CONFIRMACIÓN (ambos flujos) ══════════ -->
      <Transition name="step-slide" mode="out-in">
        <section v-if="step === 3" key="confirm" class="step-section confirm-section">
          <div class="confirm-icon">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <h2>¡Solicitud registrada!</h2>
          <p class="confirm-desc">
            Hemos recibido tu solicitud sobre <strong>{{ activeProduct?.name }}</strong>.
            Te contactaremos al email indicado con los siguientes pasos.
          </p>
          <div class="confirm-timeline">
            <div class="ctl-item" v-for="(s, i) in currentReason?.confirmSteps || []" :key="i">
              <div class="ctl-dot">{{ i + 1 }}</div>
              <p>{{ s }}</p>
            </div>
          </div>
          <div class="confirm-actions">
            <RouterLink to="/tienda" class="confirm-btn primary">
              <span class="material-symbols-outlined">shopping_bag</span>
              Volver a la tienda
            </RouterLink>
            <button class="confirm-btn secondary" @click="resetAll">
              Gestionar otro producto
            </button>
          </div>
        </section>
      </Transition>

      <!-- Info strip -->
      <div v-if="step < 3" class="info-strip">
        <div class="info-strip-item">
          <span class="material-symbols-outlined">local_shipping</span>
          <div><strong>Envío estándar</strong><span>3–5 días laborales · Gratis desde 50 €</span></div>
        </div>
        <div class="info-strip-item">
          <span class="material-symbols-outlined">swap_horiz</span>
          <div><strong>Cambios</strong><span>30 días desde la recepción</span></div>
        </div>
        <div class="info-strip-item">
          <span class="material-symbols-outlined">assignment_return</span>
          <div><strong>Devoluciones</strong><span>14 días · Reembolso en 5–10 días</span></div>
        </div>
        <div class="info-strip-item">
          <span class="material-symbols-outlined">support_agent</span>
          <div><strong>¿Dudas?</strong><RouterLink to="/contacto">Escríbenos</RouterLink></div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import FormStep from '../components/DevolucionFormStep.vue';
import api from '../services/api';

const route     = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();

// ── Flow ───────────────────────────────────────────────────
const step = ref(0);

// ── Logueado: productos de su historial ───────────────────
// Solo productos de pedidos ENTREGADOS — devolución solo aplica a pedidos recibidos
const userProducts = computed(() => {
  if (!authStore.user?.id) return [];
  return cartStore.getProductsByUser(authStore.user.id)
    .filter(p => p.orderStatus === 'delivered');
});

// Pedidos no entregados del usuario (para mostrar estado informativo)
const pendingUserProducts = computed(() => {
  if (!authStore.user?.id) return [];
  return cartStore.getProductsByUser(authStore.user.id)
    .filter(p => p.orderStatus !== 'delivered');
});
const selectedProduct  = ref(null);

function pickProduct(prod) {
  selectedProduct.value = prod;
  step.value = 1;
}

// ── Invitado: lookup + productos del pedido ───────────────
const orderCode          = ref(route.query.order || '');
const guestOrder         = ref(null);
const guestSelectedProduct = ref(null);
const lookupError        = ref(false);

// El producto activo depende del flujo
const activeProduct = computed(() =>
  authStore.isAuthenticated ? selectedProduct.value : guestSelectedProduct.value
);

function lookupOrder() {
  const code = orderCode.value.trim().toUpperCase();
  const found = cartStore.getOrder(code);
  if (found) { guestOrder.value = found; lookupError.value = false; }
  else { lookupError.value = true; guestOrder.value = null; }
}

function pickGuestProduct(item) {
  guestSelectedProduct.value = {
    ...item,
    orderId:     guestOrder.value.id,
    orderDate:   guestOrder.value.createdAt,
    orderStatus: guestOrder.value.status,
  };
}

// Auto-lookup si viene con ?order=
onMounted(() => {
  if (orderCode.value && !authStore.isAuthenticated) lookupOrder();
  if (route.query.tab === 'devoluciones' && authStore.isAuthenticated && userProducts.value.length > 0) {
    step.value = 0; // mostrar picker de productos
  }
});

// ── Razones ────────────────────────────────────────────────
const selectedReason = ref(null);
const currentReason  = ref(null);

const reasons = [
  {
    id: 'damaged', icon: 'heart_broken',
    title: 'Me llegó dañado o defectuoso',
    desc: 'El producto llegó roto, con defecto o no funciona.',
    tag: 'Devolución gratuita', type: 'devolucion',
    formTitle: 'Producto dañado o defectuoso',
    formSubtitle: 'Lo gestionamos sin coste y con máxima prioridad.',
    policyIcon: 'verified_user', policyTitle: 'Devolución 100% gratuita',
    policyText: 'Asumimos todos los gastos. Reembolso en 5–7 días laborales.',
    allowPhotos: true,
    placeholder: 'Describe el daño…',
    subReasons: ['Llegó roto / aplastado', 'Defecto de fabricación', 'No funciona', 'Piezas faltantes', 'Otro'],
    resolution: 'Reembolso completo o reposición inmediata',
    confirmSteps: ['Revisamos tu solicitud en menos de 24 h.', 'Te enviamos etiqueta de devolución prepagada.', 'Tramitamos el reembolso o reposición en 5–7 días.'],
  },
  {
    id: 'wrong', icon: 'inventory',
    title: 'Me enviaron el producto equivocado',
    desc: 'Recibiste un artículo diferente al que pediste.',
    tag: 'Cambio urgente', type: 'cambio',
    formTitle: 'Producto incorrecto recibido',
    formSubtitle: 'Nos equivocamos y lo corregimos de inmediato. Sin costes.',
    policyIcon: 'local_shipping', policyTitle: 'Envío de reposición gratuito',
    policyText: 'Te enviamos el producto correcto en cuanto recibamos el equivocado.',
    allowPhotos: true,
    placeholder: 'Indica qué pediste y qué recibiste…',
    subReasons: ['Producto diferente al pedido', 'Talla o color incorrecto', 'Cantidad incorrecta', 'Otro'],
    resolution: 'Envío del producto correcto sin coste',
    confirmSteps: ['Verificamos tu pedido en 24 h.', 'Te enviamos etiqueta de devolución.', 'Enviamos el producto correcto.'],
  },
  {
    id: 'notwanted', icon: 'assignment_return',
    title: 'Ya no lo quiero / me arrepentí',
    desc: 'El producto está bien pero quieres devolverlo.',
    tag: 'Devolución voluntaria', type: 'devolucion',
    formTitle: 'Devolución por cambio de opinión',
    formSubtitle: 'Tienes 14 días para devolver sin usar y en su embalaje original.',
    policyIcon: 'assignment_return', policyTitle: '14 días para devolver',
    policyText: 'El artículo debe estar sin usar. Se descuentan 3,99 € de gestión.',
    allowPhotos: false,
    placeholder: 'Motivo (opcional)…',
    subReasons: ['Compré por error', 'Ya no lo necesito', 'Era un regalo y no gustó', 'Encontré algo mejor', 'Otro'],
    resolution: 'Reembolso menos 3,99 € de gestión en 5–10 días',
    confirmSteps: ['Te enviamos instrucciones y etiqueta de devolución.', 'Deposita el paquete en 7 días.', 'Tramitamos el reembolso en 5–10 días.'],
  },
  {
    id: 'change-size', icon: 'straighten',
    title: 'Quiero cambiarlo por otra variante',
    desc: 'Necesitas otra talla, color o variante del mismo producto.',
    tag: 'Cambio de variante', type: 'cambio',
    formTitle: 'Cambio de talla o variante',
    formSubtitle: 'Tienes 30 días para solicitar un cambio.',
    policyIcon: 'swap_horiz', policyTitle: '30 días para cambiar',
    policyText: 'Primer cambio con etiqueta gratuita. A partir del segundo, 3,99 € de gestión.',
    allowPhotos: false,
    placeholder: 'Indica la variante que tienes y la que necesitas…',
    subReasons: ['Talla demasiado grande', 'Talla demasiado pequeña', 'Color diferente', 'Otra variante', 'Otro'],
    resolution: 'Envío de la variante correcta sin coste extra',
    confirmSteps: ['Comprobamos disponibilidad en 24 h.', 'Te enviamos etiqueta de devolución.', 'Enviamos la nueva variante.'],
  },
  {
    id: 'notarrived', icon: 'local_shipping',
    title: 'No ha llegado / no aparece el tracking',
    desc: 'Ha pasado el plazo estimado y no has recibido nada.',
    tag: 'Incidencia de envío', type: 'incidencia',
    formTitle: 'Pedido no recibido',
    formSubtitle: 'Investigamos con la empresa de transporte con urgencia.',
    policyIcon: 'gps_not_fixed', policyTitle: 'Investigación urgente en 24–48 h',
    policyText: 'Abrimos incidencia con el transportista y te damos solución en 2 días laborales.',
    allowPhotos: false,
    placeholder: '¿Revisaste el buzón? ¿Hubo algún aviso de entrega fallida?',
    subReasons: ['Superó el plazo estimado', 'El tracking no se actualiza', 'Entrega fallida avisada', 'Entregado a otra dirección', 'Otro'],
    resolution: 'Investigación urgente + reenvío o reembolso',
    confirmSteps: ['Abrimos incidencia con el transportista en 4 h.', 'Investigamos y te informamos en 24–48 h.', 'Si está perdido, reenviamos o reembolsamos.'],
  },
  {
    id: 'other', icon: 'support_agent',
    title: 'Tengo otro problema',
    desc: 'Tu situación no encaja en las anteriores.',
    tag: 'Consulta general', type: 'consulta',
    formTitle: 'Cuéntanos qué necesitas',
    formSubtitle: 'Te respondemos en menos de 24 h laborales.',
    policyIcon: 'support_agent', policyTitle: 'Soporte personalizado',
    policyText: 'Respuesta en menos de 24 h laborales de lunes a viernes.',
    allowPhotos: true,
    placeholder: 'Describe tu situación con el mayor detalle posible…',
    subReasons: ['Información sobre mi pedido', 'Problema con el pago', 'Factura o documentación', 'Pregunta sobre el producto', 'Otro'],
    resolution: 'Respuesta personalizada en menos de 24 h',
    confirmSteps: ['Un agente revisará tu caso en 24 h.', 'Te respondemos con la solución o más preguntas.'],
  },
];

function selectReason(r) {
  selectedReason.value = r.id;
  currentReason.value  = r;
  step.value = 2;
}

async function onSubmit(formData) {
  try {
    const payload = {
      productId: activeProduct.value?.productId || activeProduct.value?.id,
      orderId: activeProduct.value?.orderId || guestOrder.value?.id,
      type: currentReason.value?.type,
      ...formData
    };
    await api.post('/requests', payload);
  } catch (error) {
    console.error('Error submitting return request:', error);
  } finally {
    step.value = 3;
  }
}

function resetAll() {
  step.value = 0;
  selectedProduct.value = null;
  guestOrder.value = null;
  guestSelectedProduct.value = null;
  orderCode.value = '';
  selectedReason.value = null;
  currentReason.value = null;
  lookupError.value = false;
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
</script>

<style scoped>
.gestion-page { background: #f0f8ff; min-height: 100vh; padding-bottom: 5rem; font-family: 'Fredoka', sans-serif; color: #1a5b82; }
button { font-family: 'Fredoka', sans-serif; color: #1a5b82; }

/* Hero */
.page-header {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 4.5rem 0 5.5rem;
  text-align: center;
}
.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 700;
  color: #1a5b82;
  margin-bottom: 0.75rem;
}
.page-subtitle {
  font-size: 1.05rem;
  color: #1a5b82;
  opacity: 0.85;
  max-width: 38rem;
  margin: 0 auto;
  line-height: 1.6;
}
.hero-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(197, 140, 242, 0.35);
  color: #1a5b82;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 5px 16px;
  border-radius: 99px;
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

/* Body */
.page-body { padding-top: 2.5rem; }
.step-section { max-width: 760px; margin: 0 auto; }
.step-slide-enter-active, .step-slide-leave-active { transition: all .3s; }
.step-slide-enter-from { opacity: 0; transform: translateX(20px); }
.step-slide-leave-to   { opacity: 0; transform: translateX(-20px); }

/* Step header */
.step-header { text-align: center; margin-bottom: 2rem; }
.step-pill { display: inline-block; background: rgba(197,140,242,.14); color: #7c3aed; border: 1px solid rgba(197,140,242,.3); border-radius: 5rem; padding: .25rem .9rem; font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; margin-bottom: .75rem; }
.step-header h2 { font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 700; margin-bottom: .4rem; }
.step-header p { font-size: .95rem; opacity: .7; }

/* Empty state */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 3rem 1rem; text-align: center; }
.empty-icon { font-size: 3.5rem; color: #c58cf2; opacity: .4; }
.empty-state h2 { font-size: 1.4rem; }
.empty-state p { font-size: .9rem; opacity: .7; }
.btn-cta { display: inline-flex; align-items: center; background: #c58cf2; color: white; padding: .7rem 1.5rem; border-radius: 5rem; font-family: 'Fredoka', sans-serif; font-size: .95rem; font-weight: 700; text-decoration: none; transition: all .2s; }
.btn-cta:hover { background: #b373e6; }

/* Product history grid (logueado, paso 0) */
.product-history-grid { display: flex; flex-direction: column; gap: .75rem; }
.product-history-card {
  display: flex; align-items: center; gap: 1rem;
  background: white; border: 2px solid rgba(26,91,130,.09);
  border-radius: 1.1rem; padding: .85rem 1.1rem;
  cursor: pointer; transition: all .2s; position: relative; text-align: left;
  font-family: 'Fredoka', sans-serif;
  color: #1a5b82;
}
.product-history-card:hover { border-color: rgba(197,140,242,.4); transform: translateY(-1px); }
.product-history-card.selected { border-color: #c58cf2; background: linear-gradient(135deg, #fdf6ff, white); }
.product-history-card img { width: 3.5rem; height: 3.5rem; object-fit: cover; border-radius: .6rem; flex-shrink: 0; border: 1px solid rgba(0,0,0,.06); }
.phcard-info { flex: 1; display: flex; flex-direction: column; gap: .2rem; }
.phcard-info strong { font-size: .95rem; font-weight: 700; }
.phcard-order, .phcard-date { font-size: .78rem; opacity: .6; }
.phcard-status { margin-top: .25rem; width: fit-content; }
.phcard-check { width: 1.5rem; height: 1.5rem; border-radius: 50%; background: #c58cf2; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0); transition: all .2s cubic-bezier(.34,1.56,.64,1); flex-shrink: 0; }
.product-history-card.selected .phcard-check { opacity: 1; transform: scale(1); }
.phcard-check .material-symbols-outlined { font-size: .85rem; color: white; }

/* Status chips */
.status-chip { display: inline-flex; align-items: center; gap: .3rem; border-radius: 5rem; padding: .2rem .7rem; font-size: .75rem; font-weight: 700; }
.status-chip .material-symbols-outlined { font-size: .85rem; }
.chip-preparing { background: rgba(245,158,11,.12); color: #b45309; border: 1px solid rgba(245,158,11,.3); }
.chip-shipped   { background: rgba(59,130,246,.1);  color: #1d4ed8; border: 1px solid rgba(59,130,246,.25); }
.chip-delivered { background: rgba(52,211,153,.12); color: #059669; border: 1px solid rgba(52,211,153,.3); }

/* Selected product bar */
.selected-product-bar {
  display: flex; align-items: center; gap: .85rem;
  background: white; border-radius: 1rem; padding: 1rem 1.25rem;
  margin-bottom: 2rem; border: 1.5px solid rgba(197,140,242,.2);
  box-shadow: 0 4px 16px rgba(26,91,130,.03);
}
.selected-product-bar img { width: 2.8rem; height: 2.8rem; object-fit: cover; border-radius: .55rem; flex-shrink: 0; }
.selected-product-bar > div { flex: 1; display: flex; flex-direction: column; gap: .1rem; }
.selected-product-bar strong { font-size: .95rem; font-weight: 700; }
.selected-product-bar span { font-size: .78rem; opacity: .6; }
.change-btn {
  display: inline-flex; align-items: center; gap: .35rem;
  background: white; border: 1.5px solid rgba(197, 140, 242, 0.25);
  border-radius: 5rem; padding: .4rem .9rem;
  font-family: 'Fredoka', sans-serif; font-size: .85rem; font-weight: 600;
  color: #1a5b82; cursor: pointer; transition: all .22s ease;
  box-shadow: 0 2px 8px rgba(26,91,130,.03);
}
.change-btn:hover {
  border-color: #c58cf2;
  background: #fdf9ff;
  color: #c58cf2;
  transform: translateY(-1px);
}
.change-btn .material-symbols-outlined { font-size: .95rem; }

/* Reason grid */
.reason-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 580px) { .reason-grid { grid-template-columns: 1fr; } }
.reason-card {
  position: relative; background: white; border: 2px solid rgba(26,91,130,.07); border-radius: 1.5rem; padding: 1.5rem; text-align: left; cursor: pointer; transition: all .22s ease; display: flex; flex-direction: column; gap: .5rem;
  font-family: 'Fredoka', sans-serif;
  color: #1a5b82;
  box-shadow: 0 4px 16px rgba(26,91,130,.02);
}
.reason-card:hover { border-color: rgba(197,140,242,.4); box-shadow: 0 8px 28px rgba(197,140,242,.08); transform: translateY(-3px); }
.reason-card.selected { border-color: #c58cf2; background: linear-gradient(135deg, rgba(197,140,242,0.03), white); box-shadow: 0 8px 28px rgba(197,140,242,.08); }
.reason-icon-wrap {
  width: 3rem; height: 3rem; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: .25rem;
}
.reason-icon-wrap .reason-icon { font-size: 1.55rem; }
.icon-devolucion { background: rgba(252,129,74,.12); color: #c2410c; }
.icon-cambio     { background: rgba(34,197,94,.1);   color: #15803d; }
.icon-incidencia { background: rgba(59,130,246,.1);   color: #1d4ed8; }
.icon-consulta   { background: rgba(197,140,242,.12); color: #7c3aed; }
.reason-card strong { font-family: 'Fredoka', sans-serif; font-size: 1.1rem; font-weight: 700; }
.reason-card p { font-family: 'Outfit', sans-serif; font-size: .88rem; opacity: .75; line-height: 1.5; margin: 0; flex: 1; color: #1a5b82; }
.reason-tag { display: inline-flex; border-radius: 5rem; padding: .25rem .85rem; font-size: .78rem; font-weight: 700; width: fit-content; margin-top: .25rem; font-family: 'Fredoka', sans-serif; }
.tag-devolucion { background: rgba(252,129,74,.12); color: #c2410c; }
.tag-cambio     { background: rgba(34,197,94,.1);   color: #15803d; }
.tag-incidencia { background: rgba(59,130,246,.1);   color: #1d4ed8; }
.tag-consulta   { background: rgba(197,140,242,.12); color: #7c3aed; }
.reason-check { position: absolute; top: .75rem; right: .75rem; width: 1.5rem; height: 1.5rem; border-radius: 50%; background: #c58cf2; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0); transition: all .2s cubic-bezier(.34,1.56,.64,1); }
.reason-card.selected .reason-check { opacity: 1; transform: scale(1); }
.reason-check .material-symbols-outlined { font-size: .9rem; color: white; }

/* Lookup (invitado, paso 0) */
.lookup-card {
  background: white; border-radius: 1.5rem; padding: 3rem 2.5rem;
  max-width: 30rem; width: 100%; text-align: center;
  box-shadow: 0 12px 40px rgba(26,91,130,.07);
  border: 1.5px solid rgba(26,91,130,.06);
  margin: 0 auto;
  display: flex; flex-direction: column; align-items: center; gap: 1.25rem;
}
.lookup-input-group {
  display: flex; align-items: center; gap: .4rem;
  width: 100%; background: #f7f9fc;
  border: 2px solid rgba(26,91,130,.15); border-radius: 1rem;
  padding: .4rem .4rem .4rem 1rem; transition: all .22s;
}
.lookup-input-group:focus-within { border-color: #c58cf2; background: white; box-shadow: 0 0 0 3px rgba(197,140,242,.12); }
.lookup-input-group.error { border-color: #fc8181; }
.lookup-input-group.success { border-color: #34d399; }
.lookup-prefix { font-size: 1.2rem; color: #c58cf2; flex-shrink: 0; }
.lookup-input {
  flex: 1; background: transparent; border: none; outline: none;
  font-family: 'Fredoka', sans-serif; font-size: 1.15rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em; color: #1a5b82;
  min-width: 0;
}
.lookup-input::placeholder { color: rgba(26,91,130,.3); font-weight: 500; font-size: 1rem; text-transform: none; letter-spacing: 0; }
.lookup-btn {
  display: inline-flex; align-items: center; gap: .35rem;
  background: #c58cf2; color: white; border: none;
  border-radius: .7rem; padding: .6rem 1.1rem;
  font-family: 'Fredoka', sans-serif; font-size: .95rem; font-weight: 700;
  cursor: pointer; flex-shrink: 0; transition: background .2s;
}
.lookup-btn:hover:not(:disabled) { background: #b373e6; }
.lookup-btn:disabled { opacity: .4; cursor: not-allowed; }
.lookup-error { display: flex; align-items: center; gap: .4rem; color: #e53e3e; font-size: .88rem; text-align: left; width: 100%; }
.lookup-error .material-symbols-outlined { font-size: 1.1rem; flex-shrink: 0; }
.lookup-hint { display: flex; align-items: center; gap: .4rem; font-family: 'Outfit', sans-serif; font-size: .84rem; opacity: .6; margin-top: 1rem; }
.lookup-hint a { color: #c58cf2; font-weight: 600; }

/* Found card */
.found-fade-enter-active { transition: all .35s cubic-bezier(.34,1.56,.64,1); }
.found-fade-enter-from { opacity: 0; transform: translateY(10px) scale(.98); }
.order-found-card { margin-top: 1.25rem; background: linear-gradient(135deg, #f0fdf8, white); border: 1.5px solid rgba(52,211,153,.35); border-radius: 1.1rem; padding: 1.25rem 1.5rem; }
.found-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: .75rem; }
.found-badge { display: inline-flex; align-items: center; gap: .35rem; background: rgba(52,211,153,.15); color: #059669; border: 1px solid rgba(52,211,153,.3); border-radius: 5rem; padding: .25rem .9rem; font-size: .82rem; font-weight: 700; }
.found-badge .material-symbols-outlined { font-size: 1rem; }
.found-id { font-size: .9rem; font-weight: 700; color: #c58cf2; }
.found-prompt { font-size: .9rem; font-weight: 600; opacity: .75; margin-bottom: .75rem; }

.found-products-picker { display: flex; flex-direction: column; gap: .55rem; margin-bottom: 1rem; }
.found-product-btn { display: flex; align-items: center; gap: .75rem; background: #f7f9fc; border: 2px solid transparent; border-radius: .8rem; padding: .65rem .9rem; cursor: pointer; transition: all .2s; text-align: left; position: relative; }
.found-product-btn:hover { border-color: rgba(197,140,242,.35); background: #fdf9ff; }
.found-product-btn.selected { border-color: #c58cf2; background: linear-gradient(135deg, #fdf6ff, white); }
.found-product-btn img { width: 2.8rem; height: 2.8rem; object-fit: cover; border-radius: .55rem; flex-shrink: 0; border: 1px solid rgba(0,0,0,.06); }
.found-product-btn > div { flex: 1; display: flex; flex-direction: column; gap: .1rem; }
.found-product-btn span { font-size: .9rem; font-weight: 600; color: #1a5b82; }
.found-product-btn small { font-size: .78rem; opacity: .6; color: #1a5b82; }
.fpp-check { width: 1.4rem; height: 1.4rem; border-radius: 50%; background: #c58cf2; display: flex; align-items: center; justify-content: center; opacity: 0; transform: scale(0); transition: all .2s cubic-bezier(.34,1.56,.64,1); flex-shrink: 0; }
.found-product-btn.selected .fpp-check { opacity: 1; transform: scale(1); }
.fpp-check .material-symbols-outlined { font-size: .82rem; color: white; }

.next-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: .5rem; background: #1a5b82; color: white; border: none; border-radius: .85rem; padding: .85rem 1.5rem; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all .22s; box-shadow: 0 4px 15px rgba(26,91,130,.2); }
.next-btn:hover:not(:disabled) { background: #144a6d; transform: translateY(-1px); }
.next-btn:disabled { opacity: .45; cursor: not-allowed; }

/* Confirmación */
.confirm-section { text-align: center; padding: 2rem 1rem; }
.confirm-icon { width: 5rem; height: 5rem; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; box-shadow: 0 0 0 .5rem rgba(52,211,153,.12); }
.confirm-icon .material-symbols-outlined { font-size: 2.5rem; color: #059669; }
.confirm-section h2 { font-size: 2rem; font-weight: 700; margin-bottom: .6rem; }
.confirm-desc { font-size: 1rem; opacity: .75; line-height: 1.65; max-width: 32rem; margin: 0 auto 2rem; }
.confirm-timeline { display: flex; flex-direction: column; gap: .6rem; max-width: 30rem; margin: 0 auto 2rem; text-align: left; }
.ctl-item { display: flex; align-items: flex-start; gap: .75rem; }
.ctl-dot { width: 1.6rem; height: 1.6rem; flex-shrink: 0; background: #c58cf2; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 700; }
.ctl-item p { font-size: .9rem; opacity: .8; margin: 0; line-height: 1.5; padding-top: .1rem; }
.confirm-actions { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
.confirm-btn { display: inline-flex; align-items: center; gap: .5rem; border-radius: 5rem; padding: .8rem 1.5rem; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700; text-decoration: none; cursor: pointer; transition: all .22s; border: none; }
.confirm-btn.primary { background: #c58cf2; color: white; box-shadow: 0 4px 15px rgba(197,140,242,.3); }
.confirm-btn.primary:hover { background: #b373e6; transform: translateY(-1px); }
.confirm-btn.secondary { background: white; color: #1a5b82; border: 1.5px solid rgba(26,91,130,.15); }
.confirm-btn.secondary:hover { border-color: #c58cf2; background: #fdf9ff; }

/* Info strip */
.info-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 3rem; padding-top: 2.5rem; border-top: 1px dashed rgba(26,91,130,.12); }
@media (max-width: 768px) { .info-strip { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .info-strip { grid-template-columns: 1fr; } }
.info-strip-item { display: flex; align-items: center; gap: .75rem; background: white; border-radius: 1rem; padding: .9rem 1rem; border: 1.5px solid rgba(26,91,130,.06); }
.info-strip-item .material-symbols-outlined { font-size: 1.4rem; color: #c58cf2; flex-shrink: 0; }
.info-strip-item > div { display: flex; flex-direction: column; gap: .1rem; }
.info-strip-item strong { font-size: .88rem; font-weight: 700; }
.info-strip-item span { font-size: .8rem; opacity: .65; }
.info-strip-item a { color: #c58cf2; font-weight: 600; font-size: .88rem; }

/* ── Pedidos en camino (aviso) ── */
.pending-orders-info {
  display: flex; align-items: flex-start; gap: .75rem;
  background: rgba(59,130,246,.07); border: 1.5px solid rgba(59,130,246,.2);
  border-radius: .85rem; padding: .85rem 1rem;
  font-family: 'Outfit', sans-serif; color: #1d4ed8;
  max-width: 24rem; text-align: left; margin-top: -.25rem;
}
.pending-orders-info .material-symbols-outlined { font-size: 1.2rem; flex-shrink: 0; margin-top: .1rem; }
.pending-orders-info > div { display: flex; flex-direction: column; gap: .2rem; }
.pending-orders-info strong { font-size: .88rem; font-weight: 700; }
.pending-orders-info span { font-size: .82rem; opacity: .8; line-height: 1.5; }

/* ── Aviso pedido no entregado (invitado) ── */
.not-delivered-notice {
  display: flex; align-items: flex-start; gap: .75rem;
  background: rgba(245,158,11,.08); border: 1.5px solid rgba(245,158,11,.3);
  border-radius: .85rem; padding: .9rem 1rem; margin: .5rem 0 .25rem;
  color: #92400e;
}
.not-delivered-notice .material-symbols-outlined { font-size: 1.2rem; flex-shrink: 0; margin-top: .1rem; }
.not-delivered-notice > div { display: flex; flex-direction: column; gap: .25rem; }
.not-delivered-notice strong { font-size: .88rem; font-weight: 700; display: block; }
.not-delivered-notice span { font-size: .82rem; line-height: 1.55; }

/* ── Badge warning (pedido no entregado) ── */
.found-badge.badge-warning {
  background: rgba(245,158,11,.15); color: #92400e;
  border-color: rgba(245,158,11,.35);
}
.found-badge.badge-warning .material-symbols-outlined { color: #d97706; }
</style>
