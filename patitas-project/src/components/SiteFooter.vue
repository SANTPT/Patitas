<template>
  <footer class="site-footer">
    <!-- Wave superior -->
    <div class="footer-wave-top">
      <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0 28C480 0 960 56 1440 28L1440 0L0 0Z" fill="#f0f8ff"/>
      </svg>
    </div>

    <div class="footer-inner container">

      <!-- Col 1: Marca -->
      <div class="footer-brand">
        <div class="footer-logo-wrap">
          <img src="../assets/logo.png" alt="Patitas" class="footer-logo" />
        </div>
        <h2 class="footer-brand-name">Patitas</h2>
        <p class="footer-tagline">Acompañando cada patita en su camino con amor y conocimiento.</p>
        <div class="social-row">
          <a v-for="s in socials" :key="s.name" :href="s.href" class="social-link" :aria-label="s.name">
            <span v-html="s.svg"></span>
          </a>
        </div>
      </div>

      <!-- Col 2: Links -->
      <div class="footer-links-grid">
        <div class="link-col" v-for="col in linkCols" :key="col.title">
          <h4 class="col-title">{{ col.title }}</h4>
          <ul>
            <li v-for="l in col.links" :key="l">
              <a href="#">{{ l }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Col 3: Newsletter + Pagos -->
      <div class="footer-right">
        <div class="newsletter-block">
          <h4 class="col-title">Boletín Informativo</h4>
          <p class="newsletter-desc">Recibe recursos y novedades en tu correo.</p>
          <form class="newsletter-form" @submit.prevent>
            <input type="email" placeholder="tu@email.com" required />
            <button type="submit" aria-label="Suscribirse">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </form>
        </div>

        <div class="payment-block">
          <h4 class="col-title">Métodos de pago</h4>
          <div class="payment-row">
            <!-- Visa -->
            <svg viewBox="0 0 38 24" width="42" height="26" fill="none" xmlns="http://www.w3.org/2000/svg" class="pay-card" aria-label="Visa">
              <rect width="38" height="24" rx="4" fill="#1A1F71"/>
              <path d="M16.124 16H14.19l1.209-7.2h1.935L16.124 16zm7.25-7.009c-.313-.828-1.233-1.191-2.42-1.191-2.253 0-3.935 1.157-3.95 2.871-.014 1.213 1.134 1.884 1.996 2.29.886.417 1.182.684 1.178 1.055-.008.57-.71.83-1.365.83-1.144 0-1.758-.168-2.696-.566l-.378-.172-.401 2.395c.67.297 1.91.554 3.19.566 2.396 0 3.962-1.137 3.987-2.899.014-1.025-.635-1.803-2.029-2.441-.845-.414-1.364-.69-1.36-.988.004-.273.315-.563.993-.563.563-.008 1.077.148 1.428.305l.17.078.377-2.328zm2.466 4.757-.156.732h-1.637l.156-.732h1.637zm2.466-4.948h-1.503c-.465 0-.814.26-.998.683l-3.528 8.117h2.031l.405-1.082h2.477l.233 1.082h1.79l-1.564-8.8h-.843zm-1.142 5.518.73-1.956.418 1.956h-1.148z" fill="#FFF"/>
            </svg>
            <!-- Mastercard simple -->
            <svg viewBox="0 0 38 24" width="42" height="26" fill="none" xmlns="http://www.w3.org/2000/svg" class="pay-card" aria-label="Mastercard">
              <rect width="38" height="24" rx="4" fill="#252525"/>
              <circle cx="15" cy="12" r="7" fill="#EB001B"/>
              <circle cx="23" cy="12" r="7" fill="#F79E1B" fill-opacity="0.85"/>
            </svg>
            <!-- PayPal chip -->
            <div class="pay-chip" aria-label="PayPal">PayPal</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra inferior -->
    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <p class="copyright">© 2026 Patitas · Hecho con 💜 para todas las familias</p>
        <div class="footer-legal-links">
          <a href="#">Aviso Legal</a>
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';

const socials = ref([
  { name: 'Facebook', href: '#', svg: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
  { name: 'Instagram', href: '#', svg: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>' },
  { name: 'TikTok', href: '#', svg: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.99-1.72v6.56c.02 3.02-1.39 5.99-4.14 7.23-2.75 1.25-6.24.87-8.59-1.04-2.35-1.91-3.21-5.18-2.09-8.03 1.11-2.85 4.22-4.63 7.27-4.23v4.08c-1.83-.24-3.69.69-4.32 2.4-.63 1.72-.03 3.77 1.43 4.8 1.47 1.03 3.58.91 4.9-.27.83-.75 1.27-1.85 1.25-2.95V.02z"/></svg>' },
  { name: 'YouTube', href: '#', svg: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
  { name: 'X', href: '#', svg: '<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
]);

const linkCols = ref([
  {
    title: 'Recursos',
    links: ['Qué es el autismo', 'Atención temprana', 'Blog', 'Centros de apoyo'],
  },
  {
    title: 'Ayuda',
    links: ['Envíos', 'Cambios y devoluciones', 'FAQ', 'Contacto'],
  },
]);
</script>

<style scoped>
/* ─── FOOTER ─── */
.site-footer {
  background-image: url('../assets/fondo_morado.png');
  background-size: cover;
  background-position: center;
  position: relative;
}

/* overlay suave para mejorar legibilidad */
.site-footer::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(26,91,130,0.30) 0%, rgba(197,140,242,0.20) 100%);
  pointer-events: none;
}

/* ─── WAVE ─── */
.footer-wave-top {
  position: relative;
  height: 3.11rem;
  z-index: 1;
}
.footer-wave-top svg { width: 100%; height: 100%; display: block; }

/* ─── GRID INTERIOR ─── */
.footer-inner {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1.1fr 1.4fr 1.2fr;
  gap: 2.67rem;
  padding-top: 2.22rem;
  padding-bottom: 2.89rem;
  align-items: start;
}

/* ─── BRAND ─── */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 0.78rem;
}

.footer-logo-wrap { display: inline-block; }

.footer-logo {
  width: 8.33rem;
  height: 8.33rem;
  border-radius: 50%;
  object-fit: cover;
  border: 0.17rem solid rgba(255,255,255,0.88);
  box-shadow: 0 0.22rem 1rem rgba(0,0,0,0.14);
  transition: transform 0.3s ease;
  display: block;
}
.footer-logo:hover { transform: scale(1.06) rotate(-3deg); }

.footer-brand-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--text-blue);
  text-shadow: 0.06rem 0.06rem 0 #fff, -0.06rem -0.06rem 0 #fff, 0.06rem -0.06rem 0 #fff, -0.06rem 0.06rem 0 #fff;
  margin: 0;
}

.footer-tagline {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--text-blue);
  opacity: 0.8;
  max-width: 12.22rem;
}

.social-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.22rem;
}

.social-link {
  width: 2.11rem;
  height: 2.11rem;
  border-radius: 50%;
  background: rgba(255,255,255,0.72);
  border: 0.08rem solid rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-blue);
  transition: all 0.22s ease;
  box-shadow: 0 0.11rem 0.44rem rgba(26,91,130,0.08);
}
.social-link:hover {
  background: var(--button-purple);
  border-color: var(--button-purple);
  color: white;
  transform: translateY(-0.17rem);
  box-shadow: 0 0.33rem 1rem rgba(197,140,242,0.45);
}

/* ─── LINKS ─── */
.footer-links-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.11rem;
}

.col-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.89rem;
  text-transform: uppercase;
  letter-spacing: 0.03rem;
  text-shadow: 0 0.06rem 0 rgba(255,255,255,0.6);
  position: relative;
  padding-bottom: 0.56rem;
}
.col-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 1.44rem;
  height: 0.17rem;
  background: var(--button-purple);
  border-radius: 5.5rem;
}

.link-col ul {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.link-col a {
  font-size: 0.9rem;
  color: var(--text-blue);
  opacity: 0.78;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
}
.link-col a::before {
  content: '›';
  font-size: 1.1rem;
  color: var(--button-purple);
  opacity: 0;
  transform: translateX(-0.22rem);
  transition: all 0.2s ease;
}
.link-col a:hover {
  opacity: 1;
  color: var(--text-blue);
  gap: 0.44rem;
}
.link-col a:hover::before {
  opacity: 1;
  transform: translateX(0);
}

/* ─── RIGHT: NEWSLETTER + PAGOS ─── */
.footer-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.newsletter-block, .payment-block {
  display: flex;
  flex-direction: column;
}

.newsletter-desc {
  font-size: 0.85rem;
  color: var(--text-blue);
  opacity: 0.75;
  line-height: 1.55;
  margin: 0.28rem 0 0.78rem;
}

.newsletter-form {
  display: flex;
  background: rgba(255,255,255,0.78);
  border: 0.08rem solid rgba(255,255,255,0.95);
  border-radius: 5.5rem;
  overflow: hidden;
  box-shadow: 0 0.11rem 0.67rem rgba(26,91,130,0.08);
  transition: all 0.22s ease;
  max-width: 16.67rem;
}
.newsletter-form:focus-within {
  background: white;
  border-color: var(--button-purple);
  box-shadow: 0 0 0 0.17rem rgba(197,140,242,0.18);
}

.newsletter-form input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  padding: 0.56rem 0.89rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  color: var(--text-blue);
  min-width: 0;
}
.newsletter-form input::placeholder { color: rgba(26,91,130,0.45); }

.newsletter-form button {
  background: var(--button-purple);
  border: none;
  cursor: pointer;
  width: 2.22rem;
  height: 2.22rem;
  border-radius: 50%;
  margin: 0.17rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  transition: all 0.22s ease;
}
.newsletter-form button:hover {
  background: var(--button-purple-hover);
  transform: scale(1.06);
}

/* Pagos */
.payment-row {
  display: flex;
  align-items: center;
  gap: 0.56rem;
  margin-top: 0.67rem;
  flex-wrap: wrap;
}

.pay-card {
  border-radius: 0.28rem;
  box-shadow: 0 0.11rem 0.44rem rgba(0,0,0,0.12);
  flex-shrink: 0;
}

.pay-chip {
  background: rgba(255,255,255,0.75);
  border: 0.08rem solid rgba(255,255,255,0.9);
  color: var(--text-blue);
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.28rem 0.67rem;
  border-radius: 0.33rem;
  letter-spacing: 0.02rem;
}

/* ─── BOTTOM BAR ─── */
.footer-bottom {
  position: relative;
  z-index: 2;
  border-top: 0.06rem solid rgba(255,255,255,0.35);
}

.footer-bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.11rem;
  padding-top: 1.11rem;
  padding-bottom: 1.33rem;
}

.copyright {
  font-size: 0.85rem;
  color: var(--text-blue);
  opacity: 0.7;
  font-weight: 500;
}

.footer-legal-links {
  display: flex;
  gap: 1.11rem;
  flex-wrap: wrap;
}
.footer-legal-links a {
  font-size: 0.82rem;
  color: var(--text-blue);
  opacity: 0.65;
  font-weight: 600;
  transition: opacity 0.2s;
}
.footer-legal-links a:hover { opacity: 1; }

/* ─── RESPONSIVE ─── */
@media (max-width: 960px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .footer-brand { align-items: center; text-align: center; }
  .footer-tagline { text-align: center; }
  .col-title::after { left: 50%; transform: translateX(-50%); }
  .footer-links-grid { justify-items: center; }
  .link-col ul { align-items: center; }
  .link-col a::before { display: none; }
  .newsletter-form { margin: 0 auto; }
  .footer-right { align-items: center; text-align: center; }
  .payment-row { justify-content: center; }
}
@media (max-width: 560px) {
  .footer-bottom-inner { flex-direction: column; text-align: center; }
  .footer-legal-links { justify-content: center; }
}
</style>
