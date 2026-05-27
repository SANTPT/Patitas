<template>
  <div class="gestion-page">

    <!-- ░░ HERO ░░ -->
    <header class="page-hero">
      <div class="hero-inner container">
        <p class="hero-eyebrow">📦 Gestión de pedidos</p>
        <h1>¿Qué necesitas hacer con tu pedido?</h1>
        <p class="hero-sub">Cuéntanos qué pasó y te guiamos en menos de 2 minutos.</p>
      </div>
      <div class="hero-wave">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 30C480 60 960 0 1440 30L1440 60L0 60Z" fill="#f0f8ff"/>
        </svg>
      </div>
    </header>

    <div class="page-body container">

      <!-- ░░ PASO 0 — Verificar pedido ░░ -->
      <Transition name="step-slide" mode="out-in">
        <section v-if="step === 0" key="s0" class="step-section">
          <div class="step-header">
            <div class="step-pill">Paso 1 de 3</div>
            <h2>Primero, localiza tu pedido</h2>
            <p>Introduce el número de pedido del email que te enviamos al comprar.</p>
          </div>

          <div class="lookup-card">
            <div class="lookup-input-group" :class="{ error: lookupError, success: order }">
              <span class="material-symbols-outlined lookup-prefix">receipt_long</span>
              <input
                v-model="orderCode"
                type="text"
                placeholder="PT-XXXXX"
                class="lookup-input"
                :class="{ error: lookupError }"
                @input="lookupError = false; order = null"
                @keyup.enter="lookupOrder"
                autocomplete="off"
                spellcheck="false"
              />
              <button class="lookup-btn" @click="lookupOrder" :disabled="!orderCode.trim()">
                <span class="material-symbols-outlined">search</span>
                Buscar
              </button>
            </div>

            <p v-if="lookupError" class="lookup-error">
              <span class="material-symbols-outlined">error</span>
              No encontramos ese pedido. Revisa que el código sea exactamente como aparece en tu email (ej: PT-48291).
            </p>

            <!-- Resultado encontrado -->
            <Transition name="found-fade">
              <div v-if="order" class="order-found-card">
                <div class="found-top">
                  <span class="found-badge">
                    <span class="material-symbols-outlined">check_circle</span>
                    Pedido encontrado
                  </span>
                  <span class="found-id">{{ order.id }}</span>
                </div>
                <div class="found-meta">
                  <div class="found-meta-item">
                    <small>Fecha</small>
                    <strong>{{ fmtDate(order.createdAt) }}</strong>
                  </div>
                  <div class="found-meta-item">
                    <small>Total</small>
                    <strong>{{ fmt(order.total) }}</strong>
                  </div>
                  <div class="found-meta-item">
                    <small>Estado</small>
                    <strong :class="'status-' + order.status">{{ statusLabel(order.status) }}</strong>
                  </div>
                </div>
                <div class="found-products">
                  <div v-for="item in order.items" :key="item.productId" class="found-product">
                    <img :src="item.image" :alt="item.name" />
                    <span>{{ item.name }}</span>
                    <small>×{{ item.quantity }}</small>
                  </div>
                </div>
                <button class="next-btn" @click="step = 1">
                  Continuar con este pedido
                  <span class="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </Transition>

            <div class="lookup-hint">
              <span class="material-symbols-outlined">info</span>
              <span>¿No tienes el código? <RouterLink to="/contacto">Escríbenos</RouterLink> y te ayudamos a localizarlo.</span>
            </div>
          </div>
        </section>
      </Transition>

      <!-- ░░ PASO 1 — ¿Qué te ha pasado? ░░ -->
      <Transition name="step-slide" mode="out-in">
        <section v-if="step === 1" key="s1" class="step-section">
          <div class="step-header">
            <div class="step-pill">Paso 2 de 3</div>
            <h2>¿Qué ha pasado con tu pedido?</h2>
            <p>Elige la opción que mejor describe tu situación.</p>
          </div>

          <!-- Order mini summary -->
          <div class="order-mini-bar">
            <span class="material-symbols-outlined">receipt_long</span>
            <span>Pedido <strong>{{ order?.id }}</strong></span>
            <button class="change-order-btn" @click="step = 0; order = null; orderCode = ''">
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
              <div class="reason-emoji">{{ r.emoji }}</div>
              <strong>{{ r.title }}</strong>
              <p>{{ r.desc }}</p>
              <div class="reason-tag" :class="'tag-' + r.type">{{ r.tag }}</div>
              <div class="reason-check">
                <span class="material-symbols-outlined">check</span>
              </div>
            </button>
          </div>
        </section>
      </Transition>

      <!-- ░░ PASO 2 — Formulario contextual ░░ -->
      <Transition name="step-slide" mode="out-in">
        <section v-if="step === 2" key="s2" class="step-section">
          <div class="step-header">
            <div class="step-pill">Paso 3 de 3</div>
            <h2>{{ currentReason?.formTitle }}</h2>
            <p>{{ currentReason?.formSubtitle }}</p>
          </div>

          <!-- Breadcrumb bar -->
          <div class="breadcrumb-bar">
            <button @click="step = 0; order = null; orderCode = ''" class="bc-item">
              <span class="material-symbols-outlined">receipt_long</span>
              {{ order?.id }}
            </button>
            <span class="material-symbols-outlined bc-sep">chevron_right</span>
            <button @click="step = 1" class="bc-item active">
              {{ currentReason?.emoji }} {{ currentReason?.title }}
            </button>
            <span class="material-symbols-outlined bc-sep">chevron_right</span>
            <span class="bc-current">Formulario</span>
          </div>

          <!-- Nota de política según tipo -->
          <div class="policy-note" :class="'policy-' + currentReason?.type">
            <span class="material-symbols-outlined">{{ currentReason?.policyIcon }}</span>
            <div>
              <strong>{{ currentReason?.policyTitle }}</strong>
              <span>{{ currentReason?.policyText }}</span>
            </div>
          </div>

          <!-- Producto(s) afectados -->
          <div class="form-card">
            <h3 class="form-section-title">
              <span class="material-symbols-outlined">inventory_2</span>
              ¿Qué producto(s) está(n) afectados?
            </h3>
            <div class="product-selector">
              <label
                v-for="item in order?.items"
                :key="item.productId"
                class="product-toggle"
                :class="{ selected: selectedProducts.includes(item.productId) }"
              >
                <input
                  type="checkbox"
                  :value="item.productId"
                  v-model="selectedProducts"
                  class="product-checkbox"
                />
                <img :src="item.image" :alt="item.name" />
                <div class="product-toggle-info">
                  <span>{{ item.name }}</span>
                  <small>Cantidad: {{ item.quantity }} · {{ fmt(item.subtotal) }}</small>
                </div>
                <div class="product-toggle-check">
                  <span class="material-symbols-outlined">check</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Detalles específicos según motivo -->
          <div class="form-card">
            <h3 class="form-section-title">
              <span class="material-symbols-outlined">edit_note</span>
              Cuéntanos más detalles
            </h3>

            <!-- Sub-motivos dinámicos -->
            <div class="sub-reason-grid">
              <button
                v-for="s in currentReason?.subReasons"
                :key="s"
                class="sub-reason-btn"
                :class="{ selected: subReason === s }"
                @click="subReason = s"
              >
                {{ s }}
              </button>
            </div>

            <!-- Campo de descripción libre -->
            <div class="field-group" style="margin-top: 1.25rem">
              <label>Descripción adicional <span class="optional">(opcional)</span></label>
              <textarea
                v-model="description"
                rows="4"
                :placeholder="currentReason?.placeholder"
              ></textarea>
            </div>

            <!-- Fotos (si aplica) -->
            <div v-if="currentReason?.allowPhotos" class="field-group">
              <label>
                Adjunta fotos
                <span class="optional">(muy útil si el producto llegó dañado)</span>
              </label>
              <div class="photo-drop" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
                <span class="material-symbols-outlined photo-drop-icon">add_photo_alternate</span>
                <span>Arrastra fotos aquí o haz clic para seleccionar</span>
                <small>JPG, PNG o WEBP · máx. 5 MB por foto</small>
                <input ref="fileInputRef" type="file" accept="image/*" multiple style="display:none" @change="handleFiles" />
              </div>
              <div v-if="photos.length" class="photo-previews">
                <div v-for="(p, i) in photos" :key="i" class="photo-thumb">
                  <img :src="p.url" :alt="'Foto ' + (i+1)" />
                  <button @click="removePhoto(i)" class="remove-photo">
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Email de contacto -->
            <div class="field-group">
              <label>Tu email de contacto</label>
              <input v-model="contactEmail" type="email" placeholder="tu@email.com" />
              <small class="field-hint">Te notificaremos el estado de tu solicitud en este email.</small>
            </div>
          </div>

          <!-- Resumen antes de enviar -->
          <div class="summary-card">
            <h3 class="form-section-title">
              <span class="material-symbols-outlined">summarize</span>
              Resumen de tu solicitud
            </h3>
            <div class="summary-rows">
              <div class="summary-row"><span>Pedido</span><strong>{{ order?.id }}</strong></div>
              <div class="summary-row"><span>Tipo</span><strong>{{ currentReason?.title }}</strong></div>
              <div class="summary-row" v-if="subReason"><span>Motivo</span><strong>{{ subReason }}</strong></div>
              <div class="summary-row">
                <span>Productos</span>
                <strong>{{ selectedProducts.length === 0 ? 'Ninguno seleccionado' : selectedProducts.length + ' producto(s)' }}</strong>
              </div>
              <div class="summary-row"><span>Resolución esperada</span><strong class="highlight">{{ currentReason?.resolution }}</strong></div>
            </div>
          </div>

          <div class="form-actions">
            <button class="back-btn" @click="step = 1">
              <span class="material-symbols-outlined">arrow_back</span>
              Volver
            </button>
            <button
              class="submit-btn"
              @click="submitRequest"
              :disabled="submitted || selectedProducts.length === 0 || !contactEmail || !subReason"
            >
              <span class="material-symbols-outlined">send</span>
              Enviar solicitud
            </button>
          </div>

          <p v-if="selectedProducts.length === 0 || !contactEmail || !subReason" class="form-required-hint">
            <span class="material-symbols-outlined">info</span>
            Selecciona al menos un producto, un motivo y tu email para continuar.
          </p>
        </section>
      </Transition>

      <!-- ░░ CONFIRMACIÓN ░░ -->
      <Transition name="step-slide" mode="out-in">
        <section v-if="step === 3" key="s3" class="step-section confirm-section">
          <div class="confirm-icon">
            <span class="material-symbols-outlined">task_alt</span>
          </div>
          <h2>¡Solicitud recibida!</h2>
          <p class="confirm-desc">
            Hemos registrado tu solicitud para el pedido <strong>{{ order?.id }}</strong>.
            Te enviaremos un email a <strong>{{ contactEmail }}</strong> con el estado y los siguientes pasos.
          </p>

          <div class="confirm-timeline">
            <div class="ctl-item" v-for="(s, i) in currentReason?.confirmSteps" :key="i">
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
              Gestionar otro pedido
            </button>
          </div>
        </section>
      </Transition>

      <!-- ░░ INFO RÁPIDA (envíos / plazos) — siempre visible abajo ░░ -->
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
          <div><strong>Devoluciones</strong><span>14 días · Reembolso en 5–10 días laborales</span></div>
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
import { ref, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useCartStore } from '../stores/cart';

const route = useRoute();
const cartStore = useCartStore();

// ── Flow state ─────────────────────────────────────────────
const step           = ref(0);
const orderCode      = ref(route.query.order || '');
const order          = ref(null);
const lookupError    = ref(false);
const selectedReason = ref(null);
const currentReason  = ref(null);
const subReason      = ref('');
const description    = ref('');
const contactEmail   = ref('');
const selectedProducts = ref([]);
const photos         = ref([]);
const submitted      = ref(false);
const fileInputRef   = ref(null);

// Auto-lookup si viene con ?order= desde PedidoPage
if (orderCode.value) {
  const found = cartStore.getOrder(orderCode.value.trim().toUpperCase());
  if (found) order.value = found;
}

// ── Reasons catalogue ──────────────────────────────────────
const reasons = [
  {
    id: 'damaged',
    emoji: '💔',
    title: 'Me llegó dañado o defectuoso',
    desc: 'El producto llegó roto, con defecto de fabricación o no funciona.',
    tag: 'Devolución gratuita',
    type: 'devolucion',
    formTitle: 'Producto dañado o defectuoso',
    formSubtitle: 'Lamentamos mucho lo ocurrido. Te gestionamos la devolución sin coste y con máxima prioridad.',
    policyIcon: 'verified_user',
    policyTitle: 'Devolución 100% gratuita',
    policyText: 'Si el producto llegó en mal estado, asumimos todos los gastos. Reembolso en 5–7 días laborales.',
    allowPhotos: true,
    placeholder: 'Describe el daño que tiene el producto… (ej: "la caja llegó aplastada y el interior está roto")',
    subReasons: ['Llegó roto / aplastado', 'Defecto de fabricación', 'No enciende / no funciona', 'Piezas faltantes', 'Otro'],
    resolution: 'Reembolso completo o reposición inmediata',
    confirmSteps: [
      'Revisamos tu solicitud en menos de 24 h laborales.',
      'Te enviamos una etiqueta de devolución prepagada por email.',
      'Al recibir el producto, tramitamos el reembolso o reposición en 5–7 días.',
    ],
  },
  {
    id: 'wrong',
    emoji: '📦',
    title: 'Me enviaron el producto equivocado',
    desc: 'Recibiste un artículo diferente al que pediste.',
    tag: 'Cambio urgente',
    type: 'cambio',
    formTitle: 'Producto incorrecto recibido',
    formSubtitle: 'Nos equivocamos y lo corregimos de inmediato. Sin costes para ti.',
    policyIcon: 'local_shipping',
    policyTitle: 'Envío de reposición gratuito',
    policyText: 'Te enviamos el producto correcto sin coste adicional en cuanto recibamos el equivocado.',
    allowPhotos: true,
    placeholder: 'Indica qué producto pediste y cuál recibiste… (ej: "Pedí el puzzle de 48 piezas y llegó el de 24")',
    subReasons: ['Producto diferente al pedido', 'Talla o color incorrecto', 'Cantidad incorrecta', 'Otro'],
    resolution: 'Envío del producto correcto sin coste',
    confirmSteps: [
      'Verificamos tu pedido en nuestro sistema en 24 h.',
      'Te enviamos etiqueta de devolución para el artículo equivocado.',
      'Enviamos el producto correcto al recibir la devolución.',
    ],
  },
  {
    id: 'notwanted',
    emoji: '🔄',
    title: 'Ya no lo quiero / me arrepentí',
    desc: 'El producto está bien pero cambié de opinión y quiero devolverlo.',
    tag: 'Devolución voluntaria',
    type: 'devolucion',
    formTitle: 'Devolución por cambio de opinión',
    formSubtitle: 'Sin problema. Tienes 14 días desde la recepción para devolver cualquier artículo sin usar.',
    policyIcon: 'assignment_return',
    policyTitle: '14 días para arrepentirse',
    policyText: 'El artículo debe estar sin usar y en su embalaje original. Se descuentan 3,99 € de gastos de devolución.',
    allowPhotos: false,
    placeholder: 'Si quieres, cuéntanos el motivo (totalmente opcional)…',
    subReasons: ['Compré por error', 'Ya no lo necesito', 'Era un regalo y no les gustó', 'Encontré algo mejor', 'Otro motivo'],
    resolution: 'Reembolso menos 3,99 € de gestión en 5–10 días',
    confirmSteps: [
      'Te enviamos las instrucciones de empaquetado y la etiqueta de devolución.',
      'Deposita el paquete en cualquier punto de entrega en los próximos 7 días.',
      'Al verificar el artículo, tramitamos el reembolso en 5–10 días laborales.',
    ],
  },
  {
    id: 'change-size',
    emoji: '↕️',
    title: 'Quiero cambiarlo por otra talla o variante',
    desc: 'El producto es correcto pero necesitas otra talla, color o variante.',
    tag: 'Cambio de variante',
    type: 'cambio',
    formTitle: 'Cambio de talla o variante',
    formSubtitle: 'Tienes 30 días para solicitar un cambio. Te ayudamos a encontrar la opción correcta.',
    policyIcon: 'swap_horiz',
    policyTitle: '30 días para cambiar',
    policyText: 'El primer cambio incluye etiqueta de devolución gratuita. A partir del segundo, 3,99 € de gestión.',
    allowPhotos: false,
    placeholder: 'Indica la talla o variante que tienes y cuál necesitas…',
    subReasons: ['Talla demasiado grande', 'Talla demasiado pequeña', 'Color diferente', 'Otra variante del mismo producto', 'Otro'],
    resolution: 'Envío de la variante correcta sin coste extra',
    confirmSteps: [
      'Comprobamos disponibilidad de la variante que necesitas en 24 h.',
      'Te enviamos etiqueta de devolución para el artículo actual.',
      'Enviamos la nueva variante en cuanto recibamos la devolución.',
    ],
  },
  {
    id: 'notarrived',
    emoji: '🔍',
    title: 'Mi pedido no ha llegado',
    desc: 'Ha pasado el plazo estimado de entrega y no has recibido nada.',
    tag: 'Incidencia de envío',
    type: 'incidencia',
    formTitle: 'Pedido no recibido',
    formSubtitle: 'Lo investigamos con la empresa de transporte con urgencia.',
    policyIcon: 'gps_not_fixed',
    policyTitle: 'Investigación de envío en 24–48 h',
    policyText: 'Abrimos una incidencia con el transportista y te damos una solución en máximo 2 días laborales.',
    allowPhotos: false,
    placeholder: '¿Has comprobado el buzón, recibiste algún aviso de intento de entrega? ¿Hay algún vecino que lo haya recogido?',
    subReasons: ['Superó el plazo estimado', 'El tracking no se actualiza', 'Me avisaron de entrega fallida', 'Fue entregado a otra dirección', 'Otro'],
    resolution: 'Investigación urgente + reenvío o reembolso',
    confirmSteps: [
      'Abrimos incidencia con el transportista en las próximas 4 horas.',
      'Investigamos la localización del paquete y te informamos en 24–48 h.',
      'Si el paquete está perdido, reenviamos o reembolsamos en 48 h adicionales.',
    ],
  },
  {
    id: 'other',
    emoji: '💬',
    title: 'Tengo otro problema',
    desc: 'La situación es diferente a las anteriores o tienes alguna duda específica.',
    tag: 'Consulta general',
    type: 'consulta',
    formTitle: 'Cuéntanos qué necesitas',
    formSubtitle: 'Nuestro equipo de atención al cliente te responde en menos de 24 horas laborales.',
    policyIcon: 'support_agent',
    policyTitle: 'Soporte personalizado',
    policyText: 'Respuesta en menos de 24 h laborales de lunes a viernes. Para urgencias, escríbenos por WhatsApp.',
    allowPhotos: true,
    placeholder: 'Describe tu situación con el mayor detalle posible…',
    subReasons: ['Información sobre mi pedido', 'Problema con el pago', 'Factura o documentación', 'Pregunta sobre el producto', 'Otro'],
    resolution: 'Respuesta personalizada en menos de 24 h',
    confirmSteps: [
      'Un agente de atención al cliente revisará tu caso en las próximas 24 h laborales.',
      'Te responderemos al email indicado con la solución o con más preguntas si las necesitamos.',
    ],
  },
];

// ── Actions ────────────────────────────────────────────────
function lookupOrder() {
  const code = orderCode.value.trim().toUpperCase();
  const found = cartStore.getOrder(code);
  if (found) {
    order.value = found;
    lookupError.value = false;
  } else {
    lookupError.value = true;
    order.value = null;
  }
}

function selectReason(r) {
  selectedReason.value = r.id;
  currentReason.value = r;
  subReason.value = '';
  description.value = '';
  selectedProducts.value = [];
  photos.value = [];
  step.value = 2;
}

function submitRequest() {
  // Mock: en producción → api.post('/requests', payload)
  submitted.value = true;
  step.value = 3;
}

function resetAll() {
  step.value = 0;
  orderCode.value = '';
  order.value = null;
  lookupError.value = false;
  selectedReason.value = null;
  currentReason.value = null;
  subReason.value = '';
  description.value = '';
  contactEmail.value = '';
  selectedProducts.value = [];
  photos.value = [];
  submitted.value = false;
}

function triggerFileInput() { fileInputRef.value?.click(); }

function handleFiles(e) {
  [...e.target.files].forEach(f => {
    const url = URL.createObjectURL(f);
    photos.value.push({ url, file: f });
  });
}

function handleDrop(e) {
  [...e.dataTransfer.files].filter(f => f.type.startsWith('image/')).forEach(f => {
    photos.value.push({ url: URL.createObjectURL(f), file: f });
  });
}

function removePhoto(i) { photos.value.splice(i, 1); }

// ── Helpers ────────────────────────────────────────────────
function fmt(val) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val ?? 0);
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
function statusLabel(s) {
  return { preparing: 'En preparación', shipped: 'En camino', delivered: 'Entregado' }[s] ?? 'Recibido';
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════
   BASE
═══════════════════════════════════════════════════════ */
.gestion-page {
  background: #f0f8ff;
  min-height: 100vh;
  padding-bottom: 5rem;
  font-family: 'Fredoka', sans-serif;
  color: #1a5b82;
}

/* ── Hero ── */
.page-hero {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 3.5rem 0 5.5rem;
  text-align: center;
}
.hero-eyebrow {
  display: inline-block;
  background: rgba(255,255,255,.72);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,.9);
  border-radius: 5rem;
  padding: .3rem 1.1rem;
  font-size: .9rem;
  font-weight: 600;
  margin-bottom: .85rem;
  color: #1a5b82;
}
.hero-inner h1 {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  color: #1a5b82;
  margin-bottom: .5rem;
}
.hero-sub { font-size: 1.05rem; opacity: .82; }
.hero-wave { position: absolute; bottom: 0; left: 0; right: 0; height: 3.2rem; z-index: 2; }
.hero-wave svg { width: 100%; height: 100%; display: block; }

/* ── Page body ── */
.page-body { padding-top: 2.5rem; }

/* ── Step transitions ── */
.step-slide-enter-active, .step-slide-leave-active { transition: all .35s cubic-bezier(.4,0,.2,1); }
.step-slide-enter-from { opacity: 0; transform: translateX(24px); }
.step-slide-leave-to   { opacity: 0; transform: translateX(-24px); }

.step-section { max-width: 720px; margin: 0 auto; }

/* ═══════════════════════════════════════════════════════
   STEP HEADER
═══════════════════════════════════════════════════════ */
.step-header { text-align: center; margin-bottom: 2rem; }
.step-pill {
  display: inline-block;
  background: rgba(197,140,242,.14);
  color: #7c3aed;
  border: 1px solid rgba(197,140,242,.3);
  border-radius: 5rem;
  padding: .25rem .9rem;
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  margin-bottom: .75rem;
}
.step-header h2 { font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 700; margin-bottom: .4rem; }
.step-header p { font-size: .95rem; opacity: .7; }

/* ═══════════════════════════════════════════════════════
   PASO 0 — LOOKUP
═══════════════════════════════════════════════════════ */
.lookup-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(26,91,130,.07);
  border: 1.5px solid rgba(26,91,130,.07);
}

.lookup-input-group {
  display: flex;
  align-items: center;
  gap: .5rem;
  background: #f7f9fc;
  border: 2px solid rgba(26,91,130,.15);
  border-radius: 1rem;
  padding: .5rem .5rem .5rem 1rem;
  transition: all .22s;
}
.lookup-input-group:focus-within { border-color: #c58cf2; background: white; box-shadow: 0 0 0 3px rgba(197,140,242,.12); }
.lookup-input-group.error { border-color: #fc8181; background: #fff5f5; }
.lookup-input-group.success { border-color: #34d399; background: #f0fdf8; }

.lookup-prefix { font-size: 1.3rem; color: #c58cf2; flex-shrink: 0; }

.lookup-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Fredoka', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: #1a5b82;
}
.lookup-input::placeholder { color: rgba(26,91,130,.35); font-weight: 500; font-size: 1rem; }

.lookup-btn {
  display: inline-flex; align-items: center; gap: .4rem;
  background: #c58cf2; color: white;
  border: none; border-radius: .7rem;
  padding: .65rem 1.25rem;
  font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700;
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  transition: all .2s;
}
.lookup-btn:hover:not(:disabled) { background: #b373e6; }
.lookup-btn:disabled { opacity: .4; cursor: not-allowed; }
.lookup-btn .material-symbols-outlined { font-size: 1.1rem; }

.lookup-error {
  display: flex; align-items: flex-start; gap: .5rem;
  color: #e53e3e; font-size: .9rem;
  margin-top: .75rem; line-height: 1.5;
}
.lookup-error .material-symbols-outlined { font-size: 1.1rem; flex-shrink: 0; margin-top: .05rem; }

/* Found card */
.found-fade-enter-active { transition: all .35s cubic-bezier(.34,1.56,.64,1); }
.found-fade-enter-from { opacity: 0; transform: translateY(10px) scale(.98); }

.order-found-card {
  margin-top: 1.25rem;
  background: linear-gradient(135deg, #f0fdf8, #f7fff9);
  border: 1.5px solid rgba(52,211,153,.35);
  border-radius: 1.1rem;
  padding: 1.25rem 1.5rem;
}
.found-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: .9rem; }
.found-badge {
  display: inline-flex; align-items: center; gap: .35rem;
  background: rgba(52,211,153,.15); color: #059669;
  border: 1px solid rgba(52,211,153,.3);
  border-radius: 5rem; padding: .25rem .9rem;
  font-size: .82rem; font-weight: 700;
}
.found-badge .material-symbols-outlined { font-size: 1rem; }
.found-id { font-size: .9rem; font-weight: 700; color: #c58cf2; }

.found-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
.found-meta-item { display: flex; flex-direction: column; gap: .1rem; }
.found-meta-item small { font-size: .72rem; text-transform: uppercase; letter-spacing: .04em; opacity: .55; }
.found-meta-item strong { font-size: .95rem; }
.status-preparing { color: #d97706; }
.status-shipped    { color: #2563eb; }
.status-delivered  { color: #059669; }

.found-products { display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1.25rem; }
.found-product {
  display: flex; align-items: center; gap: .75rem;
  font-size: .88rem;
}
.found-product img {
  width: 2.6rem; height: 2.6rem;
  object-fit: cover; border-radius: .55rem;
  border: 1px solid rgba(0,0,0,.06);
  flex-shrink: 0;
}
.found-product span { flex: 1; font-weight: 600; }
.found-product small { opacity: .6; }

.next-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  background: #1a5b82; color: white;
  border: none; border-radius: .85rem;
  padding: .85rem 1.5rem;
  font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700;
  cursor: pointer; transition: all .22s;
  box-shadow: 0 4px 15px rgba(26,91,130,.2);
}
.next-btn:hover { background: #144a6d; transform: translateY(-1px); }
.next-btn .material-symbols-outlined { font-size: 1.1rem; }

.lookup-hint {
  display: flex; align-items: center; gap: .45rem;
  font-family: 'Outfit', sans-serif;
  font-size: .85rem; opacity: .65; margin-top: 1rem;
}
.lookup-hint .material-symbols-outlined { font-size: 1rem; flex-shrink: 0; }
.lookup-hint a { color: #c58cf2; font-weight: 600; }

/* ═══════════════════════════════════════════════════════
   PASO 1 — REASON GRID
═══════════════════════════════════════════════════════ */
.order-mini-bar {
  display: flex; align-items: center; gap: .75rem;
  background: white; border-radius: .85rem;
  padding: .7rem 1.1rem; margin-bottom: 1.5rem;
  border: 1.5px solid rgba(26,91,130,.07);
  font-size: .9rem;
}
.order-mini-bar .material-symbols-outlined { font-size: 1.1rem; color: #c58cf2; }
.order-mini-bar span { flex: 1; }
.change-order-btn {
  display: inline-flex; align-items: center; gap: .3rem;
  background: none; border: 1px solid rgba(26,91,130,.15);
  border-radius: 5rem; padding: .3rem .8rem;
  font-family: 'Fredoka', sans-serif; font-size: .82rem; font-weight: 600;
  color: #1a5b82; cursor: pointer; opacity: .7; transition: all .2s;
}
.change-order-btn:hover { opacity: 1; border-color: #c58cf2; }
.change-order-btn .material-symbols-outlined { font-size: .9rem; }

.reason-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 580px) { .reason-grid { grid-template-columns: 1fr; } }

.reason-card {
  position: relative;
  background: white;
  border: 2px solid rgba(26,91,130,.09);
  border-radius: 1.25rem;
  padding: 1.4rem 1.25rem 1.25rem;
  text-align: left;
  cursor: pointer;
  transition: all .22s;
  overflow: hidden;
  display: flex; flex-direction: column; gap: .4rem;
}
.reason-card:hover {
  border-color: rgba(197,140,242,.45);
  box-shadow: 0 8px 24px rgba(197,140,242,.15);
  transform: translateY(-2px);
}
.reason-card.selected {
  border-color: #c58cf2;
  background: linear-gradient(135deg, #fdf6ff, white);
  box-shadow: 0 8px 28px rgba(197,140,242,.2);
}

.reason-emoji { font-size: 2rem; margin-bottom: .1rem; }
.reason-card strong { font-size: 1rem; font-weight: 700; }
.reason-card p { font-size: .83rem; opacity: .68; line-height: 1.45; margin: 0; flex: 1; }

.reason-tag {
  display: inline-flex;
  border-radius: 5rem;
  padding: .2rem .75rem;
  font-size: .75rem;
  font-weight: 700;
  width: fit-content;
  margin-top: .25rem;
}
.tag-devolucion { background: rgba(252,129,74,.12); color: #c2410c; }
.tag-cambio     { background: rgba(34,197,94,.1);   color: #15803d; }
.tag-incidencia { background: rgba(59,130,246,.1);   color: #1d4ed8; }
.tag-consulta   { background: rgba(197,140,242,.12); color: #7c3aed; }

.reason-check {
  position: absolute; top: .75rem; right: .75rem;
  width: 1.5rem; height: 1.5rem;
  border-radius: 50%;
  background: #c58cf2;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: scale(0);
  transition: all .2s cubic-bezier(.34,1.56,.64,1);
}
.reason-card.selected .reason-check { opacity: 1; transform: scale(1); }
.reason-check .material-symbols-outlined { font-size: .9rem; color: white; }

/* ═══════════════════════════════════════════════════════
   PASO 2 — FORM
═══════════════════════════════════════════════════════ */
.breadcrumb-bar {
  display: flex; align-items: center; gap: .35rem;
  font-size: .85rem; margin-bottom: 1.25rem; flex-wrap: wrap;
}
.bc-item {
  display: inline-flex; align-items: center; gap: .3rem;
  background: none; border: none;
  color: #1a5b82; opacity: .55;
  font-family: 'Fredoka', sans-serif; font-size: .85rem;
  cursor: pointer; padding: 0; transition: opacity .2s;
}
.bc-item:hover { opacity: 1; }
.bc-item.active { opacity: .8; }
.bc-item .material-symbols-outlined { font-size: 1rem; }
.bc-sep { font-size: 1rem; opacity: .35; }
.bc-current { font-weight: 700; color: #c58cf2; }

.policy-note {
  display: flex; align-items: flex-start; gap: .9rem;
  border-radius: 1rem; padding: 1.1rem 1.25rem;
  margin-bottom: 1.5rem;
  border: 1.5px solid;
}
.policy-devolucion { background: #fff7f0; border-color: rgba(234,88,12,.25); color: #c2410c; }
.policy-cambio     { background: #f0fdf4; border-color: rgba(52,211,153,.3);  color: #059669; }
.policy-incidencia { background: #eff6ff; border-color: rgba(59,130,246,.25); color: #1d4ed8; }
.policy-consulta   { background: #fdf4ff; border-color: rgba(197,140,242,.3); color: #7c3aed; }
.policy-note .material-symbols-outlined { font-size: 1.5rem; flex-shrink: 0; margin-top: .05rem; }
.policy-note strong { display: block; font-size: .95rem; margin-bottom: .2rem; }
.policy-note span { font-size: .85rem; opacity: .8; line-height: 1.5; }

.form-card {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  border: 1.5px solid rgba(26,91,130,.07);
  box-shadow: 0 4px 16px rgba(26,91,130,.04);
}

.form-section-title {
  display: flex; align-items: center; gap: .5rem;
  font-size: 1.05rem; font-weight: 700;
  margin-bottom: 1.1rem;
}
.form-section-title .material-symbols-outlined { font-size: 1.2rem; color: #c58cf2; }

/* Product selector */
.product-selector { display: flex; flex-direction: column; gap: .6rem; }
.product-toggle {
  display: flex; align-items: center; gap: 1rem;
  background: #f8f9fb; border: 2px solid transparent;
  border-radius: .9rem; padding: .7rem 1rem;
  cursor: pointer; transition: all .2s; position: relative;
}
.product-toggle:hover { border-color: rgba(197,140,242,.35); background: #fdf9ff; }
.product-toggle.selected { border-color: #c58cf2; background: linear-gradient(135deg, #fdf6ff, white); }
.product-checkbox { position: absolute; opacity: 0; pointer-events: none; }
.product-toggle img {
  width: 2.8rem; height: 2.8rem;
  object-fit: cover; border-radius: .6rem;
  flex-shrink: 0;
}
.product-toggle-info { flex: 1; display: flex; flex-direction: column; gap: .1rem; }
.product-toggle-info span { font-size: .95rem; font-weight: 600; }
.product-toggle-info small { font-size: .8rem; opacity: .6; }
.product-toggle-check {
  width: 1.6rem; height: 1.6rem;
  border-radius: 50%;
  border: 2px solid rgba(197,140,242,.35);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .2s;
}
.product-toggle.selected .product-toggle-check {
  background: #c58cf2; border-color: #c58cf2;
}
.product-toggle-check .material-symbols-outlined { font-size: .9rem; color: white; }

/* Sub reasons */
.sub-reason-grid { display: flex; flex-wrap: wrap; gap: .5rem; }
.sub-reason-btn {
  background: #f0f4f8; border: 1.5px solid transparent;
  border-radius: 5rem; padding: .45rem 1rem;
  font-family: 'Fredoka', sans-serif; font-size: .9rem; font-weight: 600;
  color: #1a5b82; cursor: pointer; transition: all .2s;
}
.sub-reason-btn:hover { border-color: rgba(197,140,242,.4); background: #fdf9ff; }
.sub-reason-btn.selected { background: #c58cf2; border-color: #c58cf2; color: white; }

/* Fields */
.field-group { display: flex; flex-direction: column; gap: .4rem; margin-top: .75rem; }
.field-group label { font-size: .85rem; font-weight: 700; opacity: .7; text-transform: uppercase; letter-spacing: .03em; }
.optional { font-weight: 400; text-transform: none; letter-spacing: 0; opacity: .7; }
.field-group input,
.field-group textarea {
  font-family: 'Fredoka', sans-serif; font-size: 1rem;
  padding: .7rem 1rem; border-radius: .75rem;
  border: 1.5px solid rgba(26,91,130,.15);
  background: #fcfaff; color: #1a5b82; outline: none; transition: all .22s;
}
.field-group input:focus,
.field-group textarea:focus {
  border-color: #c58cf2;
  box-shadow: 0 0 0 3px rgba(197,140,242,.12);
  background: white;
}
.field-group textarea { resize: vertical; min-height: 80px; }
.field-hint { font-size: .8rem; opacity: .6; }

/* Photo drop */
.photo-drop {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: .35rem; padding: 1.5rem;
  background: #f7f9fc;
  border: 2px dashed rgba(26,91,130,.2);
  border-radius: .9rem; cursor: pointer;
  transition: all .2s; text-align: center;
}
.photo-drop:hover { border-color: #c58cf2; background: #fdf9ff; }
.photo-drop-icon { font-size: 2rem; color: #c58cf2; }
.photo-drop span:not(.photo-drop-icon) { font-size: .9rem; font-weight: 600; }
.photo-drop small { font-size: .78rem; opacity: .55; }

.photo-previews { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .75rem; }
.photo-thumb {
  position: relative; width: 5rem; height: 5rem;
}
.photo-thumb img {
  width: 100%; height: 100%;
  object-fit: cover; border-radius: .6rem;
  border: 1.5px solid rgba(197,140,242,.3);
}
.remove-photo {
  position: absolute; top: -.35rem; right: -.35rem;
  background: #e53e3e; color: white; border: none;
  border-radius: 50%; width: 1.2rem; height: 1.2rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.remove-photo .material-symbols-outlined { font-size: .75rem; }

/* Summary */
.summary-card {
  background: linear-gradient(135deg, #fdf6ff, #f7f9fc);
  border: 1.5px solid rgba(197,140,242,.2);
  border-radius: 1.25rem; padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.summary-rows { display: flex; flex-direction: column; gap: .6rem; margin-top: .5rem; }
.summary-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: .9rem;
  padding-bottom: .6rem;
  border-bottom: 1px dashed rgba(26,91,130,.08);
}
.summary-row:last-child { border-bottom: none; padding-bottom: 0; }
.summary-row span { opacity: .65; }
.summary-row strong { font-weight: 700; }
.summary-row .highlight { color: #059669; }

/* Form actions */
.form-actions { display: flex; gap: .75rem; margin-bottom: .75rem; }
.back-btn {
  display: inline-flex; align-items: center; gap: .4rem;
  background: white; border: 1.5px solid rgba(26,91,130,.15);
  border-radius: 5rem; padding: .8rem 1.4rem;
  font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700;
  color: #1a5b82; cursor: pointer; transition: all .2s;
}
.back-btn:hover { border-color: #c58cf2; background: #fdf9ff; }
.submit-btn {
  flex: 1;
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  background: #c58cf2; color: white;
  border: none; border-radius: 5rem; padding: .85rem 1.75rem;
  font-family: 'Fredoka', sans-serif; font-size: 1.05rem; font-weight: 700;
  cursor: pointer; transition: all .22s;
  box-shadow: 0 4px 15px rgba(197,140,242,.3);
}
.submit-btn:hover:not(:disabled) { background: #b373e6; transform: translateY(-1px); }
.submit-btn:disabled { opacity: .5; cursor: not-allowed; }

.form-required-hint {
  display: flex; align-items: center; gap: .4rem;
  font-size: .83rem; opacity: .6;
  font-family: 'Outfit', sans-serif; text-align: center; justify-content: center;
}
.form-required-hint .material-symbols-outlined { font-size: 1rem; }

/* ═══════════════════════════════════════════════════════
   CONFIRMACIÓN
═══════════════════════════════════════════════════════ */
.confirm-section { text-align: center; padding: 2rem 1rem; }
.confirm-icon {
  width: 5rem; height: 5rem;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 0 0 .5rem rgba(52,211,153,.12);
}
.confirm-icon .material-symbols-outlined { font-size: 2.5rem; color: #059669; }
.confirm-section h2 { font-size: 2rem; font-weight: 700; margin-bottom: .6rem; }
.confirm-desc { font-size: 1rem; opacity: .75; line-height: 1.65; max-width: 32rem; margin: 0 auto 2rem; }

.confirm-timeline { display: flex; flex-direction: column; gap: .6rem; max-width: 30rem; margin: 0 auto 2rem; text-align: left; }
.ctl-item { display: flex; align-items: flex-start; gap: .75rem; }
.ctl-dot {
  width: 1.6rem; height: 1.6rem; flex-shrink: 0;
  background: #c58cf2; color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .8rem; font-weight: 700;
}
.ctl-item p { font-size: .9rem; opacity: .8; margin: 0; line-height: 1.5; padding-top: .1rem; }

.confirm-actions { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
.confirm-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  border-radius: 5rem; padding: .8rem 1.5rem;
  font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700;
  text-decoration: none; cursor: pointer; transition: all .22s; border: none;
}
.confirm-btn.primary { background: #c58cf2; color: white; box-shadow: 0 4px 15px rgba(197,140,242,.3); }
.confirm-btn.primary:hover { background: #b373e6; transform: translateY(-1px); }
.confirm-btn.secondary { background: white; color: #1a5b82; border: 1.5px solid rgba(26,91,130,.15); }
.confirm-btn.secondary:hover { border-color: #c58cf2; background: #fdf9ff; }

/* ═══════════════════════════════════════════════════════
   INFO STRIP
═══════════════════════════════════════════════════════ */
.info-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2.5rem;
  border-top: 1px dashed rgba(26,91,130,.12);
}
@media (max-width: 768px) { .info-strip { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .info-strip { grid-template-columns: 1fr; } }

.info-strip-item {
  display: flex; align-items: center; gap: .75rem;
  background: white; border-radius: 1rem;
  padding: .9rem 1rem;
  border: 1.5px solid rgba(26,91,130,.06);
}
.info-strip-item .material-symbols-outlined { font-size: 1.4rem; color: #c58cf2; flex-shrink: 0; }
.info-strip-item > div { display: flex; flex-direction: column; gap: .1rem; }
.info-strip-item strong { font-size: .88rem; font-weight: 700; }
.info-strip-item span { font-size: .8rem; opacity: .65; }
.info-strip-item a { color: #c58cf2; font-weight: 600; font-size: .88rem; }
</style>
