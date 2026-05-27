<template>
  <div class="dev-page">

    <!-- HERO -->
    <header class="page-header">
      <div class="header-content container">
        <span class="header-tag">📦 Envíos · Cambios · Devoluciones</span>
        <h1 class="page-title">¿Necesitas ayuda con tu pedido?</h1>
        <p class="page-subtitle">Gestiona envíos, cambios y devoluciones de forma rápida y sencilla.</p>

        <!-- Quick nav tabs -->
        <div class="header-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="htab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="material-symbols-outlined">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>
      <div class="header-wave-bottom">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="var(--page-bg, #f0f8ff)"/>
        </svg>
      </div>
    </header>

    <div class="dev-body container">

      <!-- ══════════ TAB: ENVÍOS ══════════ -->
      <section v-if="activeTab === 'envios'" class="tab-section">
        <div class="info-grid">
          <div class="info-card featured">
            <span class="icard-icon">🚚</span>
            <h3>Envío Estándar</h3>
            <div class="price-badge">Gratis a partir de 50 €</div>
            <ul class="icard-list">
              <li><span class="material-symbols-outlined">check_circle</span> 3–5 días laborales</li>
              <li><span class="material-symbols-outlined">check_circle</span> Seguimiento en tiempo real</li>
              <li><span class="material-symbols-outlined">check_circle</span> Notificaciones por email/SMS</li>
            </ul>
            <p class="icard-note">Pedidos menores de 50 €: <strong>3,99 €</strong></p>
          </div>

          <div class="info-card">
            <span class="icard-icon">⚡</span>
            <h3>Envío Express</h3>
            <div class="price-badge accent">9,99 €</div>
            <ul class="icard-list">
              <li><span class="material-symbols-outlined">check_circle</span> 24–48 h laborales</li>
              <li><span class="material-symbols-outlined">check_circle</span> Entrega garantizada</li>
              <li><span class="material-symbols-outlined">check_circle</span> Prioridad en preparación</li>
            </ul>
            <p class="icard-note">Disponible de lunes a viernes hasta las 13:00 h</p>
          </div>

          <div class="info-card">
            <span class="icard-icon">🌍</span>
            <h3>Envío Internacional</h3>
            <div class="price-badge neutral">Desde 12,99 €</div>
            <ul class="icard-list">
              <li><span class="material-symbols-outlined">check_circle</span> UE: 5–8 días laborales</li>
              <li><span class="material-symbols-outlined">check_circle</span> Resto del mundo: 10–15 días</li>
              <li><span class="material-symbols-outlined">check_circle</span> Seguro de envío incluido</li>
            </ul>
            <p class="icard-note">Los impuestos locales pueden aplicarse según destino</p>
          </div>
        </div>

        <div class="track-cta">
          <div class="track-cta-left">
            <span class="material-symbols-outlined">local_shipping</span>
            <div>
              <strong>¿Dónde está tu pedido?</strong>
              <span>Consulta el estado de tu envío en tiempo real.</span>
            </div>
          </div>
          <RouterLink to="/pedido" class="cta-btn">
            <span class="material-symbols-outlined">search</span>
            Rastrear pedido
          </RouterLink>
        </div>
      </section>

      <!-- ══════════ TAB: CAMBIOS ══════════ -->
      <section v-if="activeTab === 'cambios'" class="tab-section">
        <div class="policy-banner">
          <span class="material-symbols-outlined">swap_horiz</span>
          <div>
            <strong>30 días para cambiar</strong>
            <span>Puedes solicitar un cambio de talla, color o producto en los 30 días siguientes a la recepción.</span>
          </div>
        </div>

        <div class="steps-row">
          <div class="step" v-for="(s, i) in cambioSteps" :key="i">
            <div class="step-num">{{ i + 1 }}</div>
            <div class="step-icon material-symbols-outlined">{{ s.icon }}</div>
            <strong>{{ s.title }}</strong>
            <p>{{ s.desc }}</p>
          </div>
        </div>

        <div class="request-card">
          <h2 class="rcard-title">Solicitar un cambio</h2>
          <form @submit.prevent="submitRequest('cambio')" class="request-form">
            <div class="form-row">
              <label>Número de pedido</label>
              <input v-model="form.orderId" type="text" placeholder="PT-XXXXX" required />
            </div>
            <div class="form-row">
              <label>Email de la compra</label>
              <input v-model="form.email" type="email" placeholder="tu@email.com" required />
            </div>
            <div class="form-row">
              <label>Producto a cambiar</label>
              <input v-model="form.product" type="text" placeholder="Nombre del producto" required />
            </div>
            <div class="form-row">
              <label>Motivo del cambio</label>
              <select v-model="form.reason" required>
                <option value="">Selecciona un motivo…</option>
                <option>Talla incorrecta</option>
                <option>Color diferente al esperado</option>
                <option>Prefiero otro producto</option>
                <option>Otro motivo</option>
              </select>
            </div>
            <div class="form-row full">
              <label>Detalles adicionales</label>
              <textarea v-model="form.details" rows="3" placeholder="Cuéntanos un poco más…"></textarea>
            </div>
            <button type="submit" class="submit-btn" :disabled="submitted">
              <span class="material-symbols-outlined">send</span>
              {{ submitted ? '¡Solicitud enviada!' : 'Enviar solicitud de cambio' }}
            </button>
          </form>
        </div>
      </section>

      <!-- ══════════ TAB: DEVOLUCIONES ══════════ -->
      <section v-if="activeTab === 'devoluciones'" class="tab-section">
        <div class="policy-banner orange">
          <span class="material-symbols-outlined">assignment_return</span>
          <div>
            <strong>14 días para devolver</strong>
            <span>Aceptamos devoluciones dentro de los 14 días tras la recepción, en perfecto estado y con embalaje original.</span>
          </div>
        </div>

        <div class="steps-row">
          <div class="step" v-for="(s, i) in devSteps" :key="i">
            <div class="step-num">{{ i + 1 }}</div>
            <div class="step-icon material-symbols-outlined">{{ s.icon }}</div>
            <strong>{{ s.title }}</strong>
            <p>{{ s.desc }}</p>
          </div>
        </div>

        <div class="request-card">
          <h2 class="rcard-title">Solicitar una devolución</h2>
          <form @submit.prevent="submitRequest('devolucion')" class="request-form">
            <div class="form-row">
              <label>Número de pedido</label>
              <input v-model="form.orderId" type="text" :placeholder="prefilledOrder || 'PT-XXXXX'" required />
            </div>
            <div class="form-row">
              <label>Email de la compra</label>
              <input v-model="form.email" type="email" placeholder="tu@email.com" required />
            </div>
            <div class="form-row">
              <label>Producto a devolver</label>
              <input v-model="form.product" type="text" placeholder="Nombre del producto" required />
            </div>
            <div class="form-row">
              <label>Motivo de la devolución</label>
              <select v-model="form.reason" required>
                <option value="">Selecciona un motivo…</option>
                <option>Producto defectuoso o dañado</option>
                <option>No coincide con la descripción</option>
                <option>Pedido incorrecto</option>
                <option>Ya no lo necesito</option>
                <option>Otro motivo</option>
              </select>
            </div>
            <div class="form-row full">
              <label>Detalles adicionales</label>
              <textarea v-model="form.details" rows="3" placeholder="Describe el estado del producto o el problema…"></textarea>
            </div>
            <p class="refund-note">
              <span class="material-symbols-outlined">info</span>
              El reembolso se tramitará en 5–10 días laborales tras la recepción del artículo devuelto.
            </p>
            <button type="submit" class="submit-btn orange" :disabled="submitted">
              <span class="material-symbols-outlined">send</span>
              {{ submitted ? '¡Solicitud enviada!' : 'Enviar solicitud de devolución' }}
            </button>
          </form>
        </div>
      </section>

      <!-- ══════════ TAB: FAQ ══════════ -->
      <section v-if="activeTab === 'faq'" class="tab-section">
        <div class="faq-list">
          <div
            v-for="(item, i) in faqs"
            :key="i"
            class="faq-item"
            :class="{ open: openFaq === i }"
          >
            <button class="faq-q" @click="openFaq = openFaq === i ? null : i">
              <span>{{ item.q }}</span>
              <span class="material-symbols-outlined arrow">expand_more</span>
            </button>
            <Transition name="expand">
              <div v-if="openFaq === i" class="faq-a">
                <p>{{ item.a }}</p>
                <RouterLink v-if="item.link" :to="item.link.href" class="faq-link">
                  <span class="material-symbols-outlined">{{ item.link.icon }}</span>
                  {{ item.link.label }}
                </RouterLink>
              </div>
            </Transition>
          </div>
        </div>

        <div class="contact-cta">
          <span class="material-symbols-outlined">support_agent</span>
          <div>
            <strong>¿No encuentras lo que buscas?</strong>
            <span>Nuestro equipo está disponible para ayudarte de lunes a viernes de 9:00 a 18:00 h.</span>
          </div>
          <RouterLink to="/contacto" class="cta-btn">
            <span class="material-symbols-outlined">mail</span>
            Contactar soporte
          </RouterLink>
        </div>
      </section>

      <!-- ══════════ TAB: CONTACTO ══════════ -->
      <section v-if="activeTab === 'contacto'" class="tab-section">
        <div class="contact-grid">
          <div class="contact-info-col">
            <h2>Estamos para ayudarte</h2>
            <p class="contact-lead">¿Tienes alguna pregunta sobre tu pedido, un producto o cualquier otra cosa? Escríbenos y te respondemos en menos de 24 h laborales.</p>

            <div class="contact-methods">
              <a href="mailto:hola@patitas.es" class="cmethod">
                <span class="material-symbols-outlined">mail</span>
                <div>
                  <strong>Email</strong>
                  <span>hola@patitas.es</span>
                </div>
              </a>
              <a href="https://wa.me/34600000000" class="cmethod">
                <span class="material-symbols-outlined">chat</span>
                <div>
                  <strong>WhatsApp</strong>
                  <span>+34 600 000 000</span>
                </div>
              </a>
              <div class="cmethod">
                <span class="material-symbols-outlined">schedule</span>
                <div>
                  <strong>Horario</strong>
                  <span>Lunes–Viernes: 9:00–18:00 h</span>
                </div>
              </div>
            </div>
          </div>

          <div class="contact-form-col">
            <form @submit.prevent="submitContact" class="request-form">
              <div class="form-row">
                <label>Nombre</label>
                <input v-model="contactForm.name" type="text" placeholder="Tu nombre" required />
              </div>
              <div class="form-row">
                <label>Email</label>
                <input v-model="contactForm.email" type="email" placeholder="tu@email.com" required />
              </div>
              <div class="form-row">
                <label>Asunto</label>
                <select v-model="contactForm.subject" required>
                  <option value="">Elige un asunto…</option>
                  <option>Consulta sobre pedido</option>
                  <option>Producto o tienda</option>
                  <option>Devolución o cambio</option>
                  <option>Información sobre autismo</option>
                  <option>Colaboración</option>
                  <option>Otro</option>
                </select>
              </div>
              <div class="form-row full">
                <label>Mensaje</label>
                <textarea v-model="contactForm.message" rows="5" placeholder="Cuéntanos en qué podemos ayudarte…" required></textarea>
              </div>
              <button type="submit" class="submit-btn" :disabled="contactSubmitted">
                <span class="material-symbols-outlined">send</span>
                {{ contactSubmitted ? '¡Mensaje enviado! Te responderemos pronto.' : 'Enviar mensaje' }}
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const activeTab = ref('envios');
const openFaq = ref(null);
const submitted = ref(false);
const contactSubmitted = ref(false);
const prefilledOrder = ref('');

const tabs = [
  { id: 'envios',        label: 'Envíos',          icon: 'local_shipping' },
  { id: 'cambios',       label: 'Cambios',          icon: 'swap_horiz' },
  { id: 'devoluciones',  label: 'Devoluciones',     icon: 'assignment_return' },
  { id: 'faq',           label: 'FAQ',              icon: 'help_outline' },
  { id: 'contacto',      label: 'Contacto',         icon: 'support_agent' },
];

const form = ref({ orderId: '', email: '', product: '', reason: '', details: '' });
const contactForm = ref({ name: '', email: '', subject: '', message: '' });

const cambioSteps = [
  { icon: 'search',           title: 'Localiza tu pedido',       desc: 'Ten a mano el número de pedido (PT-XXXXX) del email de confirmación.' },
  { icon: 'edit_note',        title: 'Rellena el formulario',    desc: 'Indica el producto y el motivo del cambio con el máximo detalle.' },
  { icon: 'package_2',        title: 'Devuelve el artículo',     desc: 'Te enviaremos una etiqueta de devolución gratuita por email.' },
  { icon: 'local_shipping',   title: 'Recibe el nuevo producto', desc: 'En cuanto recibamos el artículo, enviamos el cambio en 24–48 h.' },
];

const devSteps = [
  { icon: 'receipt_long',     title: 'Comprueba el plazo',       desc: 'La devolución debe solicitarse dentro de los 14 días desde la recepción.' },
  { icon: 'edit_note',        title: 'Rellena el formulario',    desc: 'Indica el pedido, el producto y el motivo de la devolución.' },
  { icon: 'inventory_2',      title: 'Empaqueta el artículo',    desc: 'En su embalaje original, en perfecto estado y con etiquetas.' },
  { icon: 'payments',         title: 'Recibe el reembolso',      desc: 'Tramitamos el reembolso en 5–10 días laborales tras recibir el producto.' },
];

const faqs = [
  { q: '¿Cuánto tarda en llegar mi pedido?', a: 'El envío estándar tarda entre 3 y 5 días laborales desde la confirmación del pago. El envío express llega en 24–48 h laborales.', link: { href: '/pedido', label: 'Rastrear mi pedido', icon: 'local_shipping' } },
  { q: '¿Cómo puedo hacer un seguimiento de mi pedido?', a: 'Recibirás un email con el número de seguimiento en cuanto tu pedido salga de nuestro almacén. También puedes consultarlo introduciendo el código PT-XXXXX en nuestra página de seguimiento.' },
  { q: '¿Puedo modificar o cancelar un pedido ya realizado?', a: 'Puedes modificar o cancelar tu pedido dentro de las 2 horas siguientes a la compra, siempre que no haya sido preparado aún. Contáctanos a la mayor brevedad posible.' },
  { q: '¿Cuál es el plazo para hacer un cambio o devolución?', a: 'Tienes 30 días para solicitar un cambio y 14 días para una devolución, contados desde la fecha de recepción del pedido.' },
  { q: '¿Quién paga los gastos de devolución?', a: 'En caso de producto defectuoso o error nuestro, los gastos corren a nuestra cuenta. Para devoluciones por cambio de opinión, se descuentan 3,99 € del reembolso (coste de la etiqueta de devolución).' },
  { q: '¿Cuándo recibiré el reembolso?', a: 'Una vez que recibamos y verifiquemos el artículo devuelto, el reembolso se tramita en 5–10 días laborales. Puede tardar unos días más en aparecer según tu entidad bancaria.' },
  { q: '¿Puedo devolver un producto abierto o usado?', a: 'Solo aceptamos devoluciones de productos sin usar y en su embalaje original. Si el producto presenta daños por uso, no podremos tramitar la devolución.' },
  { q: '¿Envían a toda España y al extranjero?', a: 'Sí, enviamos a toda la Península, Baleares, Canarias, Ceuta y Melilla, así como a la Unión Europea y a otros países seleccionados. Consulta las tarifas en la sección de Envíos.' },
];

function submitRequest(type) {
  // Aquí se conectará con el backend en fases futuras
  submitted.value = true;
  setTimeout(() => { submitted.value = false; form.value = { orderId: '', email: '', product: '', reason: '', details: '' }; }, 4000);
}

function submitContact() {
  contactSubmitted.value = true;
  setTimeout(() => { contactSubmitted.value = false; contactForm.value = { name: '', email: '', subject: '', message: '' }; }, 4000);
}

onMounted(() => {
  // Si viene con un número de pedido desde la página de pedidos
  if (route.query.order) {
    prefilledOrder.value = route.query.order;
    form.value.orderId = route.query.order;
    activeTab.value = 'devoluciones';
  }
  // Si viene con tab específica
  if (route.query.tab && tabs.some(t => t.id === route.query.tab)) {
    activeTab.value = route.query.tab;
  }
});
</script>

<style scoped>
.dev-page {
  background: var(--page-bg, #f0f8ff);
  min-height: 100vh;
  padding-bottom: 5rem;
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue, #1a5b82);
}

/* ── Header ─── */
.page-header {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 3.5rem 0 6.5rem;
  text-align: center;
}
.header-tag {
  display: inline-block;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 5rem;
  padding: .3rem 1.1rem;
  font-size: .9rem;
  font-weight: 600;
  margin-bottom: .9rem;
  color: var(--text-blue);
}
.page-title { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 700; color: var(--text-blue); margin-bottom: .5rem; }
.page-subtitle { font-size: 1.05rem; opacity: .85; margin-bottom: 1.8rem; }

.header-tabs {
  display: flex;
  gap: .5rem;
  justify-content: center;
  flex-wrap: wrap;
}
.htab {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(6px);
  border: 1.5px solid rgba(255,255,255,0.85);
  border-radius: 5rem;
  padding: .5rem 1.1rem;
  font-family: 'Fredoka', sans-serif;
  font-size: .95rem;
  font-weight: 600;
  color: var(--text-blue);
  cursor: pointer;
  transition: all .2s;
}
.htab .material-symbols-outlined { font-size: 1.1rem; }
.htab:hover { background: white; box-shadow: 0 4px 15px rgba(26,91,130,.1); }
.htab.active { background: #c58cf2; color: white; border-color: #c58cf2; box-shadow: 0 4px 15px rgba(197,140,242,.35); }

.header-wave-bottom {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3.2rem; z-index: 2;
}
.header-wave-bottom svg { width: 100%; height: 100%; display: block; }

/* ── Body ─── */
.dev-body { padding-top: 2.5rem; }
.tab-section { animation: fadeIn .3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* ── Info grid (Envíos) ─── */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}
@media (max-width: 768px) { .info-grid { grid-template-columns: 1fr; } }

.info-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem 1.5rem;
  box-shadow: 0 8px 30px rgba(26,91,130,.05);
  border: 1.5px solid rgba(26,91,130,.06);
  display: flex; flex-direction: column; gap: .75rem;
  transition: transform .2s, box-shadow .2s;
}
.info-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(26,91,130,.09); }
.info-card.featured { border-color: rgba(197,140,242,.4); background: linear-gradient(135deg, #fdf9ff, white); }

.icard-icon { font-size: 2.2rem; }
.info-card h3 { font-size: 1.25rem; font-weight: 700; margin: 0; }

.price-badge {
  display: inline-flex;
  background: rgba(52,211,153,.12);
  color: #059669;
  border: 1px solid rgba(52,211,153,.3);
  border-radius: 5rem;
  padding: .25rem .9rem;
  font-size: .85rem;
  font-weight: 700;
  width: fit-content;
}
.price-badge.accent { background: rgba(197,140,242,.12); color: #7c3aed; border-color: rgba(197,140,242,.3); }
.price-badge.neutral { background: rgba(26,91,130,.07); color: var(--text-blue); border-color: rgba(26,91,130,.15); }

.icard-list { display: flex; flex-direction: column; gap: .5rem; list-style: none; padding: 0; margin: 0; }
.icard-list li { display: flex; align-items: center; gap: .5rem; font-size: .9rem; }
.icard-list .material-symbols-outlined { font-size: 1rem; color: #059669; flex-shrink: 0; }
.icard-note { font-size: .82rem; opacity: .65; margin: 0; }

/* ── Track CTA ─── */
.track-cta, .contact-cta {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: white;
  border-radius: 1.25rem;
  padding: 1.25rem 1.75rem;
  box-shadow: 0 6px 20px rgba(26,91,130,.05);
  border: 1.5px solid rgba(197,140,242,.2);
  margin-bottom: 2rem;
}
.track-cta-left, .contact-cta > div:first-of-type {
  display: flex; align-items: center; gap: 1rem; flex: 1;
}
.track-cta .material-symbols-outlined, .contact-cta .material-symbols-outlined:first-child {
  font-size: 2rem; color: #c58cf2; flex-shrink: 0;
}
.track-cta strong, .contact-cta strong { display: block; font-size: 1rem; }
.track-cta span, .contact-cta span { font-size: .85rem; opacity: .7; }

.cta-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  background: #c58cf2; color: white;
  border: none; padding: .75rem 1.5rem; border-radius: 5rem;
  font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700;
  cursor: pointer; text-decoration: none; white-space: nowrap;
  transition: all .22s; box-shadow: 0 4px 15px rgba(197,140,242,.3);
}
.cta-btn:hover { background: #b373e6; transform: translateY(-1px); }

/* ── Policy Banner ─── */
.policy-banner {
  display: flex; align-items: center; gap: 1.25rem;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border: 1.5px solid rgba(52,211,153,.3);
  border-radius: 1.25rem;
  padding: 1.25rem 1.75rem;
  margin-bottom: 2rem;
}
.policy-banner.orange {
  background: linear-gradient(135deg, #fff7ed, #fffbf0);
  border-color: rgba(251,146,60,.3);
}
.policy-banner .material-symbols-outlined { font-size: 2rem; color: #059669; flex-shrink: 0; }
.policy-banner.orange .material-symbols-outlined { color: #ea580c; }
.policy-banner strong { display: block; font-size: 1.05rem; }
.policy-banner span { font-size: .9rem; opacity: .75; }

/* ── Steps ─── */
.steps-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
}
@media (max-width: 768px) { .steps-row { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .steps-row { grid-template-columns: 1fr; } }

.step {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem 1.25rem;
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  box-shadow: 0 6px 20px rgba(26,91,130,.04);
  border: 1.5px solid rgba(26,91,130,.06);
}
.step-num {
  width: 1.8rem; height: 1.8rem;
  background: #c58cf2; color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .85rem; font-weight: 700;
}
.step-icon { font-size: 1.8rem; color: var(--text-blue); margin: .25rem 0; }
.step strong { font-size: .95rem; }
.step p { font-size: .82rem; opacity: .7; margin: 0; line-height: 1.5; }

/* ── Request card / form ─── */
.request-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(26,91,130,.05);
  border: 1.5px solid rgba(26,91,130,.06);
}
.rcard-title { font-size: 1.35rem; font-weight: 700; margin-bottom: 1.5rem; }

.request-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; }
@media (max-width: 600px) { .request-form { grid-template-columns: 1fr; } }

.form-row { display: flex; flex-direction: column; gap: .4rem; }
.form-row.full { grid-column: span 2; }
@media (max-width: 600px) { .form-row.full { grid-column: span 1; } }

.form-row label { font-size: .85rem; font-weight: 600; opacity: .75; text-transform: uppercase; letter-spacing: .03em; }
.form-row input,
.form-row select,
.form-row textarea {
  font-family: 'Fredoka', sans-serif; font-size: 1rem;
  padding: .65rem 1rem; border-radius: .75rem;
  border: 1.5px solid rgba(26,91,130,.15);
  background: #fcfaff; color: var(--text-blue);
  outline: none; transition: all .22s;
}
.form-row input:focus,
.form-row select:focus,
.form-row textarea:focus {
  border-color: #c58cf2;
  box-shadow: 0 0 0 3px rgba(197,140,242,.12);
  background: white;
}
.form-row textarea { resize: vertical; min-height: 80px; }

.refund-note {
  grid-column: span 2;
  display: flex; align-items: center; gap: .5rem;
  font-size: .85rem; opacity: .65; margin: 0;
}
.refund-note .material-symbols-outlined { font-size: 1rem; }

.submit-btn {
  grid-column: span 2;
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  background: #c58cf2; color: white;
  border: none; padding: .9rem 1.75rem; border-radius: 5rem;
  font-family: 'Fredoka', sans-serif; font-size: 1.05rem; font-weight: 700;
  cursor: pointer; transition: all .22s;
  box-shadow: 0 4px 15px rgba(197,140,242,.3);
}
.submit-btn:hover:not(:disabled) { background: #b373e6; transform: translateY(-1px); }
.submit-btn:disabled { opacity: .7; cursor: not-allowed; }
.submit-btn.orange { background: #ea580c; box-shadow: 0 4px 15px rgba(234,88,12,.25); }
.submit-btn.orange:hover:not(:disabled) { background: #c2410c; }
@media (max-width: 600px) { .submit-btn { grid-column: span 1; } }
@media (max-width: 600px) { .refund-note { grid-column: span 1; } }

/* ── FAQ ─── */
.faq-list { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 2rem; }
.faq-item {
  background: white; border-radius: 1rem;
  border: 1.5px solid rgba(26,91,130,.07);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(26,91,130,.03);
  transition: border-color .2s;
}
.faq-item.open { border-color: rgba(197,140,242,.4); }
.faq-q {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  gap: 1rem; padding: 1.15rem 1.5rem;
  background: none; border: none; cursor: pointer;
  font-family: 'Fredoka', sans-serif; font-size: 1.05rem; font-weight: 600;
  color: var(--text-blue); text-align: left;
  transition: background .2s;
}
.faq-q:hover { background: #faf7ff; }
.faq-q .arrow { font-size: 1.3rem; color: #c58cf2; flex-shrink: 0; transition: transform .3s; }
.faq-item.open .faq-q .arrow { transform: rotate(180deg); }
.faq-a { padding: 0 1.5rem 1.25rem; }
.faq-a p { font-family: 'Outfit', sans-serif; font-size: .95rem; line-height: 1.6; opacity: .8; margin: 0 0 .75rem; }
.faq-link {
  display: inline-flex; align-items: center; gap: .4rem;
  color: #c58cf2; font-weight: 600; font-size: .9rem; text-decoration: none;
}
.faq-link:hover { text-decoration: underline; }

/* ── Contact ─── */
.contact-grid {
  display: grid; grid-template-columns: 1fr 1.5fr; gap: 2.5rem; align-items: start;
}
@media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }

.contact-info-col h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: .75rem; }
.contact-lead { font-family: 'Outfit', sans-serif; font-size: .95rem; line-height: 1.7; opacity: .75; margin-bottom: 1.5rem; }
.contact-methods { display: flex; flex-direction: column; gap: .75rem; }
.cmethod {
  display: flex; align-items: center; gap: 1rem;
  background: white; border-radius: 1rem; padding: 1rem 1.25rem;
  border: 1.5px solid rgba(26,91,130,.07);
  box-shadow: 0 4px 12px rgba(26,91,130,.04);
  text-decoration: none; color: var(--text-blue);
  transition: all .2s;
}
.cmethod:hover { border-color: rgba(197,140,242,.3); box-shadow: 0 6px 20px rgba(197,140,242,.12); }
.cmethod .material-symbols-outlined { font-size: 1.5rem; color: #c58cf2; flex-shrink: 0; }
.cmethod strong { display: block; font-size: .9rem; }
.cmethod span { font-size: .85rem; opacity: .7; }

.contact-form-col {
  background: white; border-radius: 1.5rem; padding: 2rem;
  box-shadow: 0 8px 30px rgba(26,91,130,.05);
  border: 1.5px solid rgba(26,91,130,.06);
}

/* ── Transitions ─── */
.expand-enter-active, .expand-leave-active { transition: max-height .3s ease, opacity .25s; max-height: 20rem; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }

.contact-cta {
  flex-wrap: wrap;
  margin-top: 1rem;
}
</style>
