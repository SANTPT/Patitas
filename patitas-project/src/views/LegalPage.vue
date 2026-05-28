<template>
  <div class="legal-page">
    <header class="page-header">
      <div class="header-content container">
        <h1 class="page-title">{{ pageData.title }}</h1>
        <p class="page-subtitle">Última actualización: mayo de 2026</p>
      </div>
      <div class="header-wave">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="#f0f8ff"/>
        </svg>
      </div>
    </header>

    <div class="legal-body container">
      <nav class="legal-nav">
        <RouterLink to="/legal/aviso"      :class="{ active: route.params.page === 'aviso' }">Aviso Legal</RouterLink>
        <RouterLink to="/legal/privacidad" :class="{ active: route.params.page === 'privacidad' }">Privacidad</RouterLink>
        <RouterLink to="/legal/terminos"   :class="{ active: route.params.page === 'terminos' }">Términos</RouterLink>
        <RouterLink to="/legal/cookies"    :class="{ active: route.params.page === 'cookies' }">Cookies</RouterLink>
      </nav>
      <article class="legal-content" v-html="pageData.content"></article>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();

const pages = {
  aviso: {
    title: 'Aviso Legal',
    content: `
      <h2>Identificación del titular</h2>
      <p>En cumplimiento del artículo 10 de la Ley 34/2002 de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), el titular del sitio web <strong>patitas.es</strong> es <strong>Asociación Patitas de Atención Temprana</strong>, con domicilio en España.</p>
      <h2>Objeto y ámbito de aplicación</h2>
      <p>El presente Aviso Legal regula el acceso y uso del sitio web patitas.es, así como los servicios ofrecidos. El acceso implica la aceptación plena de este aviso.</p>
      <h2>Propiedad intelectual</h2>
      <p>Todos los contenidos del sitio (textos, imágenes, diseño, código) son propiedad de Patitas o de sus colaboradores y están protegidos por la legislación de propiedad intelectual. Queda prohibida su reproducción sin autorización expresa.</p>
      <h2>Limitación de responsabilidad</h2>
      <p>Patitas no garantiza la disponibilidad continua del sitio y no se responsabiliza de los daños derivados de su uso o de la información contenida en el mismo con fines distintos a los informativos.</p>
    `
  },
  privacidad: {
    title: 'Política de Privacidad',
    content: `
      <h2>Responsable del tratamiento</h2>
      <p>El responsable es <strong>Asociación Patitas</strong>, conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).</p>
      <h2>Datos que recopilamos</h2>
      <ul>
        <li><strong>Datos de registro:</strong> nombre, email y contraseña (cifrada).</li>
        <li><strong>Datos de pedidos:</strong> dirección de envío y datos de contacto.</li>
        <li><strong>Datos de menores:</strong> nombre, fecha de nacimiento y progreso terapéutico. Solo accesibles por el centro vinculado y los padres autorizados.</li>
      </ul>
      <h2>Finalidades del tratamiento</h2>
      <p>Gestión de cuentas de usuario, procesamiento de pedidos, comunicación de novedades (con consentimiento) y mejora del servicio.</p>
      <h2>Derechos del interesado</h2>
      <p>Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <strong>privacidad@patitas.es</strong>.</p>
      <h2>Conservación de datos</h2>
      <p>Los datos se conservan mientras la cuenta esté activa o el periodo legalmente exigible. Los datos de menores se eliminan a petición del padre/tutor o tras 2 años de inactividad del centro.</p>
    `
  },
  terminos: {
    title: 'Términos y Condiciones',
    content: `
      <h2>Aceptación de los términos</h2>
      <p>Al acceder y utilizar los servicios de Patitas, aceptas los presentes Términos y Condiciones en su versión vigente.</p>
      <h2>Registro de cuenta</h2>
      <p>Para acceder a determinadas funcionalidades debes registrarte proporcionando información veraz. Eres responsable de mantener la confidencialidad de tus credenciales.</p>
      <h2>Uso de la plataforma</h2>
      <p>Los usuarios se comprometen a utilizar la plataforma de forma lícita, sin publicar contenido ofensivo, falso o que vulnere derechos de terceros. Patitas se reserva el derecho de suspender cuentas que incumplan estas normas.</p>
      <h2>Compras en la tienda</h2>
      <p>Las condiciones de venta, envío y devolución están disponibles en la sección de Envíos y Devoluciones. Los precios incluyen IVA. El pago se procesa a través de pasarelas seguras certificadas.</p>
      <h2>Modificación de los términos</h2>
      <p>Patitas puede modificar estos términos en cualquier momento. Los cambios se comunicarán con al menos 15 días de antelación por email a los usuarios registrados.</p>
    `
  },
  cookies: {
    title: 'Política de Cookies',
    content: `
      <h2>¿Qué son las cookies?</h2>
      <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Nos ayudan a recordar tus preferencias y mejorar tu experiencia.</p>
      <h2>Cookies que utilizamos</h2>
      <table>
        <thead><tr><th>Nombre</th><th>Tipo</th><th>Finalidad</th><th>Duración</th></tr></thead>
        <tbody>
          <tr><td>patitas_token</td><td>Técnica</td><td>Mantener la sesión de usuario autenticada</td><td>Sesión</td></tr>
          <tr><td>patitas_cart</td><td>Funcional</td><td>Persistir el carrito de compra</td><td>30 días</td></tr>
          <tr><td>patitas_user</td><td>Técnica</td><td>Datos básicos del usuario en sesión</td><td>Sesión</td></tr>
        </tbody>
      </table>
      <h2>Gestión de cookies</h2>
      <p>Puedes gestionar o deshabilitar las cookies desde la configuración de tu navegador. Ten en cuenta que deshabilitar las cookies técnicas puede afectar al funcionamiento de la plataforma.</p>
      <h2>Cookies de terceros</h2>
      <p>En fases futuras podremos integrar servicios de análisis con cookies propias. Te informaremos y solicitaremos tu consentimiento previamente.</p>
    `
  }
};

const pageData = computed(() => {
  const p = route.params.page;
  return pages[p] || { title: 'Página no encontrada', content: '<p>La página legal solicitada no existe.</p>' };
});
</script>

<style scoped>
.legal-page { background: #f0f8ff; min-height: 100vh; padding-bottom: 5rem; font-family: 'Fredoka', sans-serif; }

.page-header {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover; background-position: center;
  position: relative; padding: 3.5rem 0 5.5rem; text-align: center;
}
.header-wave { position: absolute; bottom: 0; left: 0; right: 0; height: 3.11rem; }
.header-wave svg { width: 100%; height: 100%; display: block; }
.page-title    { font-size: clamp(1.8rem,4vw,2.6rem); font-weight: 700; color: #1a5b82; margin-bottom: .5rem; }
.page-subtitle { font-size: .9rem; opacity: .75; }

.legal-body {
  padding-top: 2rem;
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2.5rem;
  align-items: start;
}
@media (max-width: 768px) { .legal-body { grid-template-columns: 1fr; } }

.legal-nav {
  display: flex; flex-direction: column; gap: .4rem;
  position: sticky; top: 5rem;
}
.legal-nav a {
  font-family: 'Fredoka', sans-serif; font-size: .95rem; font-weight: 600;
  color: #1a5b82; opacity: .65; padding: .5rem .85rem; border-radius: .6rem;
  text-decoration: none; transition: all .2s;
}
.legal-nav a:hover { opacity: 1; background: rgba(197,140,242,.1); }
.legal-nav a.active { background: #c58cf2; color: white; opacity: 1; }

.legal-content {
  background: white; border-radius: 1.25rem; padding: 2rem;
  box-shadow: 0 6px 24px rgba(26,91,130,.05);
  border: 1.5px solid rgba(26,91,130,.06);
  font-family: 'Outfit', sans-serif; line-height: 1.75; color: #1a5b82;
}
.legal-content :deep(h2) { font-family:'Fredoka',sans-serif; font-size:1.25rem; font-weight:700; margin: 1.5rem 0 .75rem; }
.legal-content :deep(p), .legal-content :deep(li) { font-size:.95rem; opacity:.85; }
.legal-content :deep(ul) { padding-left:1.25rem; display:flex; flex-direction:column; gap:.5rem; }
.legal-content :deep(table) { width:100%; border-collapse:collapse; margin:1rem 0; font-size:.88rem; }
.legal-content :deep(th), .legal-content :deep(td) { padding:.6rem .85rem; border:1px solid rgba(26,91,130,.1); text-align:left; }
.legal-content :deep(th) { background:rgba(197,140,242,.1); font-weight:700; }
</style>
