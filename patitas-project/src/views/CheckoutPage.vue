<template>
  <div class="checkout-page">
    <header class="page-header">
      <div class="header-content container">
        <h1 class="page-title">Finalizar Compra</h1>
        <p class="page-subtitle">Completa tus datos y elige cómo pagar de forma segura.</p>
      </div>
      <div class="header-wave-bottom">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="var(--page-bg, #f0f8ff)"/>
        </svg>
      </div>
    </header>

    <div class="checkout-body container">
      <!-- Carrito vacío -->
      <div v-if="cartStore.items.length === 0 && currentStep === 1 && !completedOrder" class="empty-cart-state">
        <span class="material-symbols-outlined empty-icon">shopping_basket</span>
        <h2>Tu carrito está vacío</h2>
        <p>Añade productos antes de proceder al pago.</p>
        <RouterLink to="/tienda" class="go-shop-btn">Explorar Tienda</RouterLink>
      </div>

      <!-- PANTALLA DE ÉXITO PARA INVITADOS -->
      <div v-else-if="completedOrder && !authStore.isAuthenticated" class="guest-success">
        <div class="guest-success-card">
          <div class="success-icon-wrap">
            <span class="material-symbols-outlined success-icon">check_circle</span>
          </div>
          <h2>¡Pago Completado!</h2>
          <p>Tu pedido ha sido recibido y está siendo preparado. Guarda este código para consultar el estado de tu envío:</p>
          <div class="order-code-display">
            <span class="code-label">Tu código de seguimiento</span>
            <span class="order-code">{{ completedOrder.id }}</span>
            <button class="copy-btn" @click="copyCode" :class="{ copied: codeCopied }">
              <span class="material-symbols-outlined">{{ codeCopied ? 'check' : 'content_copy' }}</span>
              {{ codeCopied ? '¡Copiado!' : 'Copiar código' }}
            </button>
          </div>
          <div class="guest-success-hint">
            <span class="material-symbols-outlined">info</span>
            Necesitarás este código para consultar el estado de tu pedido en cualquier momento.
          </div>
          <div class="guest-success-actions">
            <RouterLink :to="{ name: 'pedido', params: { id: completedOrder.id } }" class="btn-primary">
              <span class="material-symbols-outlined">local_shipping</span>
              Ver estado del pedido
            </RouterLink>
            <RouterLink to="/tienda" class="btn-secondary">Seguir comprando</RouterLink>
          </div>
        </div>
      </div>

      <template v-else-if="!completedOrder">
        <!-- Stepper -->
        <div class="stepper">
          <div v-for="(step, i) in steps" :key="i" class="step" :class="{ active: currentStep === i+1, done: currentStep > i+1 }">
            <div class="step-circle">
              <span v-if="currentStep > i+1" class="material-symbols-outlined">check</span>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="step-label">{{ step }}</span>
            <div v-if="i < steps.length - 1" class="step-line"></div>
          </div>
        </div>

        <div class="checkout-layout">
          <!-- Panel principal -->
          <div class="main-panel">

            <!-- PASO 1: Resumen del carrito -->
            <div v-if="currentStep === 1" class="panel-card">
              <h2 class="panel-title">Tu Pedido</h2>
              <div class="cart-items">
                <div v-for="item in cartStore.items" :key="item.product.id" class="cart-item">
                  <img :src="item.product.image" :alt="item.product.name" class="item-img" />
                  <div class="item-info">
                    <span class="item-name">{{ item.product.name }}</span>
                    <span class="item-unit-price">{{ fmt(item.product.price) }} / ud.</span>
                  </div>
                  <div class="item-qty-controls">
                    <button @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)" :disabled="item.quantity <= 1">−</button>
                    <span>{{ item.quantity }}</span>
                    <button @click="cartStore.updateQuantity(item.product.id, item.quantity + 1)">+</button>
                  </div>
                  <span class="item-subtotal">{{ fmt(item.product.price * item.quantity) }}</span>
                  <button class="item-remove-btn" @click="cartStore.removeItem(item.product.id)" aria-label="Eliminar">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
              <div class="step-actions">
                <button class="btn-primary" @click="currentStep = 2" :disabled="cartStore.items.length === 0">
                  Continuar con mis datos <span class="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>

            <!-- PASO 2: Datos de envío -->
            <div v-if="currentStep === 2" class="panel-card">
              <h2 class="panel-title">Datos de Envío</h2>
              <form @submit.prevent="handleShippingSubmit" class="shipping-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="fullName">Nombre completo *</label>
                    <input id="fullName" v-model="shipping.fullName" type="text" required placeholder="Ana García Martínez" />
                  </div>
                  <div class="form-group">
                    <label for="email">Email *</label>
                    <input id="email" v-model="shipping.email" type="email" required placeholder="tu@email.com" />
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for="phone">Teléfono *</label>
                    <input id="phone" v-model="shipping.phone" type="tel" required placeholder="612 345 678" />
                  </div>
                  <div class="form-group">
                    <label for="country">País *</label>
                    <select id="country" v-model="shipping.country" required>
                      <option value="España">España</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Francia">Francia</option>
                    </select>
                  </div>
                </div>
                <div class="form-group full">
                  <label for="address">Dirección *</label>
                  <input id="address" v-model="shipping.address" type="text" required placeholder="Calle Mayor 12, 3º B" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for="city">Ciudad *</label>
                    <input id="city" v-model="shipping.city" type="text" required placeholder="Bilbao" />
                  </div>
                  <div class="form-group">
                    <label for="zip">Código Postal *</label>
                    <input id="zip" v-model="shipping.zip" type="text" required placeholder="48001" maxlength="5" />
                  </div>
                </div>

                <!-- Guardar dirección opcional para logueados -->
                <div v-if="authStore.isAuthenticated" class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="saveAddressToProfile" id="saveAddressCheckbox" />
                    <span class="checkbox-text">Guardar estos datos en mi perfil para futuras compras</span>
                  </label>
                </div>

                <div class="step-actions two-col">
                  <button type="button" class="btn-secondary" @click="currentStep = 1">
                    <span class="material-symbols-outlined">arrow_back</span> Volver
                  </button>
                  <button type="submit" class="btn-primary">
                    Elegir método de pago <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- PASO 3: Método de pago -->
            <div v-if="currentStep === 3" class="panel-card">
              <h2 class="panel-title">Método de Pago</h2>
              <div class="payment-methods">
                <label v-for="m in paymentMethods" :key="m.id" class="payment-option" :class="{ selected: selectedPayment === m.id }">
                  <input type="radio" :value="m.id" v-model="selectedPayment" class="sr-only" />
                  <span class="pm-icon">{{ m.icon }}</span>
                  <div class="pm-info">
                    <strong>{{ m.label }}</strong>
                    <small>{{ m.desc }}</small>
                  </div>
                  <span class="pm-check material-symbols-outlined">check_circle</span>
                </label>
              </div>

              <!-- Tarjeta crédito -->
              <div v-if="selectedPayment === 'card'" class="card-fields">
                <div class="form-group full">
                  <label>Número de tarjeta</label>
                  <input v-model="cardData.number" type="text" placeholder="1234 5678 9012 3456" maxlength="19" @input="formatCardNumber" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Caducidad (MM/AA)</label>
                    <input v-model="cardData.expiry" type="text" placeholder="08/28" maxlength="5" @input="formatExpiry" />
                  </div>
                  <div class="form-group">
                    <label>CVV</label>
                    <input v-model="cardData.cvv" type="password" placeholder="•••" maxlength="3" />
                  </div>
                </div>
              </div>

              <!-- Bizum -->
              <div v-if="selectedPayment === 'bizum'" class="card-fields">
                <div class="form-group full">
                  <label>Número de teléfono Bizum</label>
                  <input v-model="bizumPhone" type="tel" placeholder="612 345 678" />
                </div>
              </div>

              <!-- PayPal -->
              <div v-if="selectedPayment === 'paypal'" class="paypal-info">
                <span class="paypal-logo">PayPal</span>
                <p>Serás redirigido a PayPal para completar el pago de forma segura.</p>
              </div>

              <div class="step-actions two-col">
                <button class="btn-secondary" @click="currentStep = 2">
                  <span class="material-symbols-outlined">arrow_back</span> Volver
                </button>
                <button class="btn-primary btn-pay" @click="completePurchase" :disabled="paying">
                  <span v-if="paying" class="material-symbols-outlined spin">progress_activity</span>
                  <span v-else class="material-symbols-outlined">lock</span>
                  {{ paying ? 'Procesando...' : 'Completar pago · ' + fmt(cartStore.totalPrice) }}
                </button>
              </div>
            </div>

          </div>

          <!-- Panel lateral: Resumen -->
          <aside class="summary-panel">
            <div class="summary-card">
              <h3>Resumen del pedido</h3>
              <div class="summary-lines">
                <div v-for="item in cartStore.items" :key="item.product.id" class="summary-line">
                  <span class="summary-item-name">{{ item.product.name }} × {{ item.quantity }}</span>
                  <span>{{ fmt(item.product.price * item.quantity) }}</span>
                </div>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-line subtotal-line">
                <strong>Total</strong>
                <strong class="total-price">{{ fmt(cartStore.totalPrice) }}</strong>
              </div>
              <div class="summary-shipping">
                <span class="material-symbols-outlined">local_shipping</span>
                Envío gratuito en pedidos +50 €
              </div>
            </div>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

const currentStep = ref(1);
const paying = ref(false);
const completedOrder = ref(null);
const codeCopied = ref(false);
const steps = ['Tu pedido', 'Datos de envío', 'Pago'];

const shipping = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip: '',
  country: 'España',
});

const selectedPayment = ref('card');
const cardData = ref({ number: '', expiry: '', cvv: '' });
const bizumPhone = ref('');

const paymentMethods = [
  { id: 'card',   icon: '💳', label: 'Tarjeta de crédito / débito', desc: 'Visa, Mastercard, Amex' },
  { id: 'bizum',  icon: '📲', label: 'Bizum',                        desc: 'Pago instantáneo con tu móvil' },
  { id: 'paypal', icon: '🅿️', label: 'PayPal',                       desc: 'Paga de forma segura con PayPal' },
];

function fmt(val) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
}

function formatCardNumber(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 16);
  cardData.value.number = v.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
  cardData.value.expiry = v;
}

const saveAddressToProfile = ref(false);

async function handleShippingSubmit() {
  if (authStore.isAuthenticated && saveAddressToProfile.value) {
    try {
      await authStore.updateProfile({
        phone: shipping.value.phone,
        address: shipping.value.address,
        city: shipping.value.city,
        zip: shipping.value.zip,
        country: shipping.value.country,
      });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Dirección guardada en tu perfil.', type: 'success' }
      }));
    } catch (err) {
      console.error('Error al guardar datos de envío:', err);
    }
  }
  currentStep.value = 3;
}

function completePurchase() {
  paying.value = true;
  setTimeout(() => {
    const order = cartStore.placeOrder({
      shippingInfo: { ...shipping.value },
      paymentMethod: selectedPayment.value,
      userId: authStore.user?.id || null,
    });
    paying.value = false;
    if (authStore.isAuthenticated) {
      // Usuario logueado: ir directo a la página del pedido
      router.push({ name: 'pedido', params: { id: order.id } });
    } else {
      // Invitado: mostrar pantalla de confirmación con el código
      completedOrder.value = order;
    }
  }, 1600);
}

function copyCode() {
  navigator.clipboard.writeText(completedOrder.value.id).then(() => {
    codeCopied.value = true;
    setTimeout(() => { codeCopied.value = false; }, 2000);
  });
}

onMounted(() => {
  // Pre-rellenar con datos del usuario logueado
  if (authStore.user) {
    shipping.value.fullName = authStore.user.name || '';
    shipping.value.email   = authStore.user.email || '';
    shipping.value.phone   = authStore.user.phone || '';
    shipping.value.address = authStore.user.address || '';
    shipping.value.city    = authStore.user.city || '';
    shipping.value.zip     = authStore.user.zip || '';
    shipping.value.country = authStore.user.country || 'España';
  }
});
</script>

<style scoped>
.checkout-page {
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
.page-title { font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 700; color: var(--text-blue); margin-bottom: .5rem; }
.page-subtitle { font-size: 1.05rem; color: var(--text-blue); opacity: .85; }

/* ── Body ────────────────────────────────────────────────────── */
.checkout-body { padding-top: 2.5rem; }

/* Empty */
.empty-cart-state {
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  padding: 5rem 2rem; text-align: center;
}
.empty-icon { font-size: 4rem; color: #c58cf2; }
.empty-cart-state h2 { font-size: 1.6rem; font-weight: 700; }
.empty-cart-state p { opacity: .7; }
.go-shop-btn {
  background: var(--button-purple, #c58cf2); color: white; padding: .75rem 1.75rem;
  border-radius: 5rem; font-weight: 700; font-size: 1rem; text-decoration: none;
  transition: all .22s;
}
.go-shop-btn:hover { background: #b373e6; transform: translateY(-2px); }

/* ── Stepper ─────────────────────────────────────────────────── */
.stepper {
  display: flex; align-items: center; justify-content: center;
  gap: 0; margin-bottom: 2.5rem; flex-wrap: nowrap;
}
.step {
  display: flex; align-items: center; gap: .5rem; position: relative;
}
.step-circle {
  width: 2.2rem; height: 2.2rem; border-radius: 50%;
  background: white; border: 2px solid #c9d6e3;
  display: flex; align-items: center; justify-content: center;
  font-size: .9rem; font-weight: 700; color: #94a3b8;
  transition: all .3s;
}
.step.active .step-circle { border-color: #c58cf2; background: #c58cf2; color: white; }
.step.done .step-circle { border-color: #34d399; background: #34d399; color: white; }
.step-label { font-size: .8rem; font-weight: 600; color: #94a3b8; white-space: nowrap; }
.step.active .step-label { color: var(--text-blue); }
.step.done .step-label { color: #34d399; }
.step-line { width: 4rem; height: 2px; background: #c9d6e3; margin: 0 .5rem; flex-shrink: 0; }

/* ── Layout ──────────────────────────────────────────────────── */
.checkout-layout {
  display: grid; grid-template-columns: 1fr 360px; gap: 2rem; align-items: start;
}
@media (max-width: 900px) { .checkout-layout { grid-template-columns: 1fr; } }

/* Panel cards */
.panel-card {
  background: white; border-radius: 1.5rem;
  padding: 2rem; box-shadow: 0 8px 30px rgba(26,91,130,.04);
  border: 1px solid rgba(0,0,0,.03);
}
.panel-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 1.5rem; }

/* ── Cart items ──────────────────────────────────────────────── */
.cart-items { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
.cart-item {
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem; background: #f8fafc; border-radius: 1rem;
}
.item-img { width: 4rem; height: 4rem; object-fit: cover; border-radius: .75rem; flex-shrink: 0; }
.item-info { flex: 1; display: flex; flex-direction: column; gap: .2rem; }
.item-name { font-weight: 700; font-size: .95rem; }
.item-unit-price { font-size: .8rem; opacity: .6; }
.item-qty-controls {
  display: flex; align-items: center; gap: .5rem;
}
.item-qty-controls button {
  width: 1.8rem; height: 1.8rem; border-radius: 50%; border: 1.5px solid #c58cf2;
  background: white; color: #c58cf2; font-size: 1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.item-qty-controls button:hover:not(:disabled) { background: #c58cf2; color: white; }
.item-qty-controls button:disabled { opacity: .35; cursor: not-allowed; }
.item-qty-controls span { font-weight: 700; min-width: 1.5rem; text-align: center; }
.item-subtotal { font-weight: 700; font-size: 1rem; color: #c58cf2; min-width: 4.5rem; text-align: right; }
.item-remove-btn {
  background: none; border: none; cursor: pointer; color: #fc8181;
  display: flex; align-items: center; padding: .25rem; border-radius: .5rem;
  transition: background .2s;
}
.item-remove-btn:hover { background: rgba(252,129,129,.1); }

/* ── Shipping form ───────────────────────────────────────────── */
.shipping-form { display: flex; flex-direction: column; gap: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
.form-group { display: flex; flex-direction: column; gap: .35rem; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-size: .85rem; font-weight: 600; }
.form-group input, .form-group select {
  font-family: 'Outfit', sans-serif; font-size: .95rem;
  padding: .7rem 1rem; border-radius: .75rem;
  border: 1.5px solid rgba(197,140,242,.2);
  color: var(--text-blue); background: #fcf8ff; outline: none;
  transition: all .22s;
}
.form-group input:focus, .form-group select:focus {
  border-color: #c58cf2; background: white;
  box-shadow: 0 0 0 3px rgba(197,140,242,.12);
}

/* ── Payment methods ─────────────────────────────────────────── */
.payment-methods { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 1.5rem; }
.payment-option {
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem 1.25rem; border-radius: 1rem; cursor: pointer;
  border: 1.5px solid rgba(197,140,242,.2); background: white;
  transition: all .22s;
}
.payment-option.selected { border-color: #c58cf2; background: #faf5ff; }
.pm-icon { font-size: 1.5rem; flex-shrink: 0; }
.pm-info { flex: 1; }
.pm-info strong { display: block; font-size: .95rem; }
.pm-info small { font-size: .8rem; opacity: .6; }
.pm-check { color: #c58cf2; opacity: 0; transition: opacity .2s; }
.payment-option.selected .pm-check { opacity: 1; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

/* Card / Bizum fields */
.card-fields { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }

/* PayPal */
.paypal-info {
  display: flex; flex-direction: column; align-items: center; gap: .75rem;
  padding: 1.5rem; margin-bottom: 1.5rem; background: #f0f4ff;
  border-radius: 1rem; text-align: center;
}
.paypal-logo {
  font-size: 1.8rem; font-weight: 900;
  background: linear-gradient(135deg, #003087, #009cde);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

/* ── Buttons ─────────────────────────────────────────────────── */
.step-actions { display: flex; justify-content: flex-end; margin-top: 1.5rem; }
.step-actions.two-col { justify-content: space-between; }
.btn-primary {
  display: inline-flex; align-items: center; gap: .5rem;
  background: #c58cf2; color: white; border: none;
  padding: .8rem 1.75rem; border-radius: 5rem;
  font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700;
  cursor: pointer; transition: all .22s;
  box-shadow: 0 4px 15px rgba(197,140,242,.3);
}
.btn-primary:hover:not(:disabled) { background: #b373e6; transform: translateY(-1px); }
.btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; box-shadow: none; }
.btn-pay { min-width: 15rem; justify-content: center; }
.btn-secondary {
  display: inline-flex; align-items: center; gap: .5rem;
  background: white; color: var(--text-blue);
  border: 1.5px solid rgba(26,91,130,.15); padding: .8rem 1.5rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: 1rem; font-weight: 600; cursor: pointer; transition: all .22s;
}
.btn-secondary:hover { border-color: #c58cf2; color: #c58cf2; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Summary panel ───────────────────────────────────────────── */
.summary-card {
  background: white; border-radius: 1.5rem; padding: 1.75rem;
  box-shadow: 0 8px 30px rgba(26,91,130,.04);
  border: 1px solid rgba(0,0,0,.03); position: sticky; top: 6rem;
}
.summary-card h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 1.25rem; }
.summary-lines { display: flex; flex-direction: column; gap: .6rem; margin-bottom: 1rem; }
.summary-line { display: flex; justify-content: space-between; font-size: .9rem; }
.summary-item-name { max-width: 60%; opacity: .75; }
.summary-divider { height: 1px; background: rgba(0,0,0,.06); margin: .75rem 0; }
.subtotal-line { font-size: 1.1rem; }
.total-price { color: #c58cf2; font-size: 1.3rem; }
.summary-shipping {
  display: flex; align-items: center; gap: .4rem;
  margin-top: 1rem; padding: .75rem 1rem;
  background: #f0fdf4; border-radius: .75rem;
  color: #059669; font-size: .85rem; font-weight: 600;
}
.summary-shipping .material-symbols-outlined { font-size: 1.1rem; }

/* ── Guest Success Screen ────────────────────────────────────── */
.guest-success {
  display: flex; justify-content: center; padding: 1rem 0 3rem;
}
.guest-success-card {
  background: white; border-radius: 1.5rem; padding: 3rem 2.5rem;
  max-width: 30rem; width: 100%; text-align: center;
  box-shadow: 0 16px 50px rgba(26,91,130,.08);
  border: 1px solid rgba(0,0,0,.03);
  display: flex; flex-direction: column; align-items: center; gap: 1.25rem;
}
.success-icon-wrap {
  width: 5rem; height: 5rem; border-radius: 50%;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  display: flex; align-items: center; justify-content: center;
}
.success-icon { font-size: 3rem; color: #059669; }
.guest-success-card h2 { font-size: 1.7rem; font-weight: 700; }
.guest-success-card p { font-size: .95rem; line-height: 1.6; opacity: .75; }

.order-code-display {
  width: 100%; background: linear-gradient(135deg, #faf5ff, #ede9fe);
  border: 2px dashed rgba(197,140,242,.4); border-radius: 1rem;
  padding: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: .75rem;
}
.code-label {
  font-size: .75rem; text-transform: uppercase; letter-spacing: .08em;
  color: #7c3aed; font-weight: 700;
}
.order-code {
  font-family: 'Fredoka', sans-serif; font-size: 2.2rem; font-weight: 900;
  color: #c58cf2; letter-spacing: .12em;
}
.copy-btn {
  display: inline-flex; align-items: center; gap: .4rem;
  background: white; border: 1.5px solid rgba(197,140,242,.3);
  color: #7c3aed; padding: .4rem 1rem; border-radius: 5rem;
  font-family: 'Fredoka', sans-serif; font-size: .85rem; font-weight: 600;
  cursor: pointer; transition: all .22s;
}
.copy-btn:hover { border-color: #c58cf2; background: #faf5ff; }
.copy-btn.copied { background: #d1fae5; border-color: #34d399; color: #059669; }
.copy-btn .material-symbols-outlined { font-size: 1rem; }

.guest-success-hint {
  display: flex; align-items: flex-start; gap: .5rem;
  background: #fff7ed; border: 1px solid rgba(251,191,36,.3);
  border-radius: .75rem; padding: .75rem 1rem;
  font-family: 'Outfit', sans-serif; font-size: .85rem; color: #92400e;
  text-align: left; width: 100%;
}
.guest-success-hint .material-symbols-outlined { font-size: 1.1rem; flex-shrink: 0; margin-top: .05rem; }

.guest-success-actions {
  display: flex; flex-direction: column; gap: .75rem; width: 100%; margin-top: .5rem;
}
.guest-success-actions .btn-primary,
.guest-success-actions .btn-secondary {
  width: 100%; justify-content: center; text-decoration: none;
}

/* Checkbox group styling */
.checkbox-group {
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
}
.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--text-blue, #1a5b82);
  cursor: pointer;
  user-select: none;
}
.checkbox-label input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--button-purple, #c58cf2);
  cursor: pointer;
  border-radius: 0.25rem;
}
.checkbox-text {
  line-height: 1.2;
}
</style>
