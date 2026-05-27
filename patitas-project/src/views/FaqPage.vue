<template>
  <div class="faq-page">
    <header class="page-header">
      <div class="header-content container">
        <h1 class="page-title">Preguntas Frecuentes</h1>
        <p class="page-subtitle">Encuentra respuestas rápidas sobre pedidos, envíos, devoluciones y más.</p>
      </div>
      <div class="header-wave-bottom">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="var(--page-bg, #f0f8ff)"/>
        </svg>
      </div>
    </header>

    <div class="faq-body container">

      <!-- Categorías -->
      <div class="faq-cats">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="cat-pill"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          {{ cat.icon }} {{ cat.label }}
        </button>
      </div>

      <!-- Preguntas -->
      <div class="faq-list">
        <div
          v-for="(item, i) in filteredFaqs"
          :key="i"
          class="faq-item"
          :class="{ open: openIndex === i }"
        >
          <button class="faq-question" @click="toggle(i)">
            <span>{{ item.q }}</span>
            <span class="faq-arrow material-symbols-outlined">expand_more</span>
          </button>
          <Transition name="faq-expand">
            <div v-if="openIndex === i" class="faq-answer">
              <p>{{ item.a }}</p>
              <div v-if="item.action" class="faq-action">
                <RouterLink :to="item.action.href" class="faq-action-btn">
                  <span class="material-symbols-outlined">{{ item.action.icon }}</span>
                  {{ item.action.label }}
                </RouterLink>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- ¿No encontraste lo que buscabas? -->
      <div class="faq-cta-card">
        <span class="material-symbols-outlined faq-cta-icon">support_agent</span>
        <div>
          <strong>¿No encontraste tu respuesta?</strong>
          <p>Nuestro equipo está disponible para ayudarte.</p>
        </div>
        <RouterLink to="/contacto" class="faq-cta-btn">Escribirnos</RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';

const openIndex = ref(null);
const activeCategory = ref('all');

function toggle(i) {
  openIndex.value = openIndex.value === i ? null : i;
}

const categories = [
  { id: 'all',       icon: '🔍', label: 'Todas'       },
  { id: 'pedidos',   icon: '📦', label: 'Pedidos'      },
  { id: 'envios',    icon: '🚚', label: 'Envíos'       },
  { id: 'pagos',     icon: '💳', label: 'Pagos'        },
  { id: 'devolver',  icon: '↩️', label: 'Devoluciones' },
  { id: 'productos', icon: '🧸', label: 'Productos'    },
];

const faqs = [
  {
    cat: 'pedidos', q: '¿Cómo puedo consultar el estado de mi pedido?',
    a: 'Puedes consultar el estado de tu pedido en cualquier momento desde la sección "Consultar pedido". Si realizaste la compra como invitado, necesitarás el código de seguimiento que te mostramos al finalizar la compra (formato PT-XXXXX). Si estás registrado, accede a tu perfil → "Mis pedidos".',
    action: { href: '/pedido', icon: 'local_shipping', label: 'Consultar mi pedido' }
  },
  {
    cat: 'pedidos', q: '¿Puedo modificar un pedido después de realizarlo?',
    a: 'Una vez confirmado el pago, el pedido entra en preparación de inmediato. Si necesitas hacer un cambio, contacta con nosotros lo antes posible a través del formulario de contacto. Si el pedido ya ha sido enviado, deberás esperar a recibirlo y solicitar un cambio o devolución.'
  },
  {
    cat: 'pedidos', q: '¿Puedo comprar sin tener una cuenta?',
    a: 'Sí. Puedes realizar tu compra como invitado sin necesidad de registrarte. Al finalizar recibirás un código de seguimiento único para consultar el estado de tu envío. Si te registras, tendrás acceso al historial completo de tus pedidos en cualquier momento.'
  },
  {
    cat: 'envios', q: '¿Cuánto tarda en llegar mi pedido?',
    a: 'El plazo de entrega estándar es de 4 días laborales desde la confirmación del pedido. Este tiempo puede variar ligeramente según la dirección de entrega. Puedes consultar la fecha estimada en el seguimiento de tu pedido.'
  },
  {
    cat: 'envios', q: '¿Tienen envío gratuito?',
    a: 'Sí. Ofrecemos envío gratuito en todos los pedidos superiores a 50 €. Para pedidos de menor importe se aplicará un coste de envío estándar que se mostrará durante el proceso de compra.'
  },
  {
    cat: 'envios', q: '¿Envían fuera de España?',
    a: 'Actualmente realizamos envíos a España, Portugal y Francia. Si necesitas envío a otro país, puedes contactar con nuestro equipo para consultar disponibilidad y costes.'
  },
  {
    cat: 'pagos', q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos pago con tarjeta de crédito o débito (Visa, Mastercard, American Express), Bizum y PayPal. Todos los pagos se procesan de forma segura con cifrado SSL.'
  },
  {
    cat: 'pagos', q: '¿Es seguro pagar en vuestra tienda?',
    a: 'Sí, absolutamente. Utilizamos cifrado SSL en todas las transacciones y no almacenamos datos de tarjetas en nuestros servidores. El procesamiento de pagos se realiza a través de pasarelas de pago certificadas y seguras.'
  },
  {
    cat: 'pagos', q: '¿Cuándo se realiza el cobro?',
    a: 'El cobro se realiza en el momento en que confirmas el pedido. Si el pago es rechazado, el pedido no se procesará y se te notificará para que puedas intentarlo de nuevo.'
  },
  {
    cat: 'devolver', q: '¿Cuál es la política de devoluciones?',
    a: 'Tienes 30 días desde la recepción del pedido para solicitar una devolución. El producto debe estar en su estado original, sin usar y con el embalaje intacto. Los gastos de devolución corren por cuenta del cliente salvo que el artículo llegue defectuoso.',
    action: { href: '/devoluciones', icon: 'assignment_return', label: 'Solicitar devolución' }
  },
  {
    cat: 'devolver', q: '¿Cómo solicito un cambio o devolución?',
    a: 'Ve a la página de cambios y devoluciones, introduce el código de tu pedido, selecciona los artículos y el motivo de la solicitud. Nuestro equipo la procesará en 24-48 horas laborales.',
    action: { href: '/devoluciones', icon: 'assignment_return', label: 'Ir a devoluciones' }
  },
  {
    cat: 'devolver', q: '¿Cuándo recibiré el reembolso?',
    a: 'Una vez aprobada la devolución, el reembolso se realizará en el mismo método de pago utilizado en la compra. El plazo es de 5 a 10 días hábiles dependiendo de tu entidad bancaria.'
  },
  {
    cat: 'productos', q: '¿Los productos están recomendados por especialistas?',
    a: 'Sí. Todos los artículos de nuestra tienda han sido seleccionados y revisados por nuestro equipo de terapeutas ocupacionales y logopedas especializados en desarrollo infantil y TEA. Cada producto incluye información sobre su uso terapéutico.'
  },
  {
    cat: 'productos', q: '¿Cómo elijo el producto adecuado para mi hijo/a?',
    a: 'Puedes usar los filtros de la tienda para buscar por tipo (sensorial, motor, cognitivo) y rango de edad. También encontrarás información detallada en la página de cada producto. Si tienes dudas, nuestro equipo puede orientarte a través del formulario de contacto.'
  },
  {
    cat: 'productos', q: '¿Los productos tienen garantía?',
    a: 'Todos nuestros productos incluyen garantía mínima de 2 años conforme a la legislación europea de consumo. En caso de defecto de fabricación, gestionamos la sustitución sin coste adicional para el cliente.'
  },
];

const filteredFaqs = computed(() =>
  activeCategory.value === 'all'
    ? faqs
    : faqs.filter(f => f.cat === activeCategory.value)
);
</script>

<style scoped>
.faq-page {
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
.header-wave-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 3.11rem; z-index: 2; }
.header-wave-bottom svg { width: 100%; height: 100%; display: block; }
.page-title { font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 700; color: var(--text-blue); margin-bottom: .5rem; }
.page-subtitle { font-size: 1.05rem; color: var(--text-blue); opacity: .85; }

/* ── Body ────────────────────────────────────────────────────── */
.faq-body { padding-top: 2.5rem; max-width: 52rem; margin: 0 auto; padding-left: 1.5rem; padding-right: 1.5rem; }

/* ── Categories ──────────────────────────────────────────────── */
.faq-cats { display: flex; gap: .6rem; flex-wrap: wrap; margin-bottom: 2rem; }
.cat-pill {
  padding: .5rem 1.1rem; border-radius: 5rem;
  border: 1.5px solid rgba(197,140,242,.2); background: white;
  font-family: 'Fredoka', sans-serif; font-size: .9rem; font-weight: 600;
  color: var(--text-blue); cursor: pointer; transition: all .2s;
}
.cat-pill:hover { border-color: #c58cf2; background: #faf5ff; }
.cat-pill.active { background: #c58cf2; border-color: #c58cf2; color: white; box-shadow: 0 4px 12px rgba(197,140,242,.3); }

/* ── FAQ List ────────────────────────────────────────────────── */
.faq-list { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 3rem; }
.faq-item {
  background: white; border-radius: 1.1rem;
  border: 1.5px solid rgba(197,140,242,.12);
  box-shadow: 0 2px 10px rgba(26,91,130,.03); overflow: hidden;
  transition: border-color .22s;
}
.faq-item.open { border-color: rgba(197,140,242,.4); }
.faq-question {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: 1.15rem 1.5rem;
  background: none; border: none; cursor: pointer; text-align: left;
  font-family: 'Fredoka', sans-serif; font-size: 1.05rem; font-weight: 600;
  color: var(--text-blue); transition: background .15s;
}
.faq-question:hover { background: rgba(197,140,242,.04); }
.faq-arrow {
  font-size: 1.3rem; color: #c58cf2; flex-shrink: 0;
  transition: transform .3s cubic-bezier(.34,1.56,.64,1);
}
.faq-item.open .faq-arrow { transform: rotate(180deg); }
.faq-answer {
  padding: 0 1.5rem 1.25rem;
  font-family: 'Outfit', sans-serif; font-size: .95rem;
  line-height: 1.7; color: var(--text-blue); opacity: .8;
}
.faq-action { margin-top: 1rem; }
.faq-action-btn {
  display: inline-flex; align-items: center; gap: .4rem;
  background: rgba(197,140,242,.1); color: #7c3aed;
  border: 1px solid rgba(197,140,242,.25); padding: .45rem 1rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: .88rem; font-weight: 700; text-decoration: none;
  transition: all .2s;
}
.faq-action-btn:hover { background: #c58cf2; color: white; border-color: #c58cf2; }
.faq-action-btn .material-symbols-outlined { font-size: 1rem; }

/* Expand transition */
.faq-expand-enter-active { transition: max-height .3s ease, opacity .25s ease; max-height: 400px; }
.faq-expand-leave-active { transition: max-height .25s ease, opacity .2s ease; max-height: 400px; }
.faq-expand-enter-from, .faq-expand-leave-to { max-height: 0; opacity: 0; }

/* ── Bottom CTA ──────────────────────────────────────────────── */
.faq-cta-card {
  display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;
  background: white; border-radius: 1.25rem; padding: 1.5rem 2rem;
  border: 1.5px solid rgba(197,140,242,.15); box-shadow: 0 4px 20px rgba(26,91,130,.04);
}
.faq-cta-icon { font-size: 2.5rem; color: #c58cf2; flex-shrink: 0; }
.faq-cta-card div { flex: 1; }
.faq-cta-card strong { display: block; font-size: 1.05rem; font-weight: 700; margin-bottom: .2rem; }
.faq-cta-card p { font-family: 'Outfit', sans-serif; font-size: .9rem; opacity: .7; margin: 0; }
.faq-cta-btn {
  background: #c58cf2; color: white; padding: .75rem 1.5rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: .95rem; font-weight: 700; text-decoration: none;
  transition: all .22s; white-space: nowrap;
}
.faq-cta-btn:hover { background: #b373e6; }
</style>
