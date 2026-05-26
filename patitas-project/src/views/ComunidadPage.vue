<template>
  <div class="comunidad-page">
    <div class="container page-content">
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <router-link to="/recursos">Recursos</router-link>
        <span class="separator-icon">/</span>
        <router-link to="/comunidad" class="active-crumb">Comunidad</router-link>
        <span class="separator-icon">/</span>
        <span class="current-item" aria-current="page">Comunidad Patitas</span>
      </nav>

      <!-- Hero Header Section -->
      <header class="community-hero">
        <div class="hero-text-col">
          <span class="badge-tag">Comunidad</span>
          <h1 class="hero-title">Comunidad Patitas: Un espacio para compartir y sanar</h1>
          <p class="hero-desc">
            Conecta con otras familias en tu misma situación. Encuentra el apoyo, la comprensión y los recursos que solo quienes recorren este camino pueden ofrecer.
          </p>
          <button @click="handleAction('Unirse a la comunidad')" class="btn-join-community">
            <span class="material-symbols-outlined">favorite</span>
            <span>Unirse a la comunidad</span>
          </button>
        </div>
        <div class="hero-image-col">
          <img 
            src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80" 
            alt="Conexión y neurodiversidad en la Comunidad Patitas" 
            class="hero-img"
          />
        </div>
      </header>

      <!-- Layout de Dos Columnas -->
      <div class="main-layout">
        <!-- Columna Izquierda: Sidebar -->
        <aside class="sidebar-col">
          <div class="sidebar-card">
            <h3 class="sidebar-title">Explorar</h3>
            <ul class="explore-menu">
              <li>
                <a href="#" @click.prevent="handleAction('Grupos de apoyo')" class="explore-link">
                  <span class="material-symbols-outlined">groups</span>
                  <span>Grupos de apoyo</span>
                </a>
              </li>
              <li class="active">
                <a href="#" @click.prevent="handleAction('Foros de discusión')" class="explore-link">
                  <span class="material-symbols-outlined">forum</span>
                  <span>Foros de discusión</span>
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="handleAction('Eventos locales')" class="explore-link">
                  <span class="material-symbols-outlined">calendar_today</span>
                  <span>Eventos locales</span>
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="handleAction('Historias de éxito')" class="explore-link">
                  <span class="material-symbols-outlined">workspace_premium</span>
                  <span>Historias de éxito</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Banner de ayuda urgente -->
          <div class="urgent-help-card">
            <h4>¿Necesitas ayuda urgente?</h4>
            <p>Nuestros moderadores están disponibles 24/7 para brindarte orientación.</p>
            <button @click="handleAction('Hablar con un guía')" class="btn-talk-guide">
              Hablar con un guía
            </button>
          </div>
        </aside>

        <!-- Columna Derecha: Contenido Principal -->
        <main class="main-content-col">
          <!-- Tarjetas de Información Superior (Grid 2 columnas) -->
          <div class="info-grid">
            <div class="info-card-box purple-accent">
              <div class="card-icon-wrap purple">
                <span class="material-symbols-outlined">verified_user</span>
              </div>
              <div class="card-text-wrap">
                <h4>Tu seguridad es prioridad</h4>
                <p>
                  Mantenemos un entorno seguro y privado. Todas nuestras interacciones se rigen por normas de respeto mutuo y confidencialidad absoluta para proteger a tu familia.
                </p>
              </div>
            </div>

            <div class="info-card-box blue-accent">
              <div class="card-icon-wrap blue">
                <span class="material-symbols-outlined">share_reviews</span>
              </div>
              <div class="card-text-wrap">
                <h4>El valor de compartir</h4>
                <p>
                  Intercambiar estrategias, recursos y simplemente ser escuchado reduce significativamente el estrés parental y fortalece el desarrollo de los niños.
                </p>
              </div>
            </div>
          </div>

          <!-- Testimonios de la Comunidad -->
          <div class="testimonial-box">
            <span class="testimonial-label">Testimonios de la comunidad</span>
            <span class="quote-giant-icon">99</span>
            <blockquote class="testimonial-quote">
              "Encontrar esta comunidad fue como respirar profundo después de mucho tiempo. Aquí no tengo que explicar por qué mi hijo hace lo que hace, todos entienden."
            </blockquote>
            <div class="testimonial-author">
              <div class="author-avatar">M</div>
              <div class="author-info">
                <strong class="author-name">María G.</strong>
                <span class="author-role">Mamá de Lucas (5 años)</span>
              </div>
            </div>
          </div>

          <!-- Grupos Destacados -->
          <section class="groups-section">
            <div class="section-header">
              <h3>Grupos destacados</h3>
              <a href="#" @click.prevent="handleAction('Ver todos los grupos')" class="link-see-all">
                <span>Ver todos</span>
                <span class="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>

            <div class="groups-grid">
              <!-- Grupo 1 -->
              <article class="notebook-group-card purple">
                <!-- Anillas metálicas de cuaderno en el borde izquierdo -->
                <div class="notebook-rings">
                  <div class="ring" v-for="n in 5" :key="n"></div>
                </div>

                <div class="group-card-body">
                  <div class="group-header">
                    <span class="group-badge purple">Intervención</span>
                    <span class="material-symbols-outlined group-icon purple">sentiment_dissatisfied</span>
                  </div>
                  <h4 class="group-title">Recién Diagnosticados</h4>
                  <p class="group-desc">
                    Un espacio para orientar los primeros pasos y gestionar el impacto emocional inicial.
                  </p>
                  <button @click="handleAction('Explorar grupo Recién Diagnosticados')" class="btn-explore-group purple">
                    <span>Explorar grupo</span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </article>

              <!-- Grupo 2 -->
              <article class="notebook-group-card blue">
                <!-- Anillas metálicas de cuaderno en el borde izquierdo -->
                <div class="notebook-rings">
                  <div class="ring" v-for="n in 5" :key="n"></div>
                </div>

                <div class="group-card-body">
                  <div class="group-header">
                    <span class="group-badge blue">Escolaridad</span>
                    <span class="material-symbols-outlined group-icon blue">school</span>
                  </div>
                  <h4 class="group-title">Etapa Escolar y TEA</h4>
                  <p class="group-desc">
                    Debates sobre inclusión, apoyos escolares y derechos educativos en la primaria.
                  </p>
                  <button @click="handleAction('Explorar grupo Etapa Escolar y TEA')" class="btn-explore-group blue">
                    <span>Explorar grupo</span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </article>
            </div>
          </section>

          <!-- Banner CTA Inferior -->
          <div class="bottom-cta-banner">
            <h3 class="cta-title">¿Listo para conectar?</h3>
            <p class="cta-desc">
              Únete hoy a más de 5,000 familias que ya están compartiendo este viaje con nosotros. La membresía es gratuita.
            </p>
            <div class="cta-actions">
              <button @click="handleAction('Crear cuenta')" class="btn-cta-primary">
                Crear mi cuenta
              </button>
              <button @click="handleAction('Saber más')" class="btn-cta-secondary">
                Saber más
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleAction = (actionName) => {
  if (!authStore.isAuthenticated) {
    // Si no está autenticado, abre el modal de login
    router.push({ query: { auth: 'login' } });
  } else {
    // Si está autenticado, simular entrada a la sección/grupo
    alert(`Te has dirigido a la sección privada: "${actionName}"`);
  }
};
</script>

<style scoped>
.comunidad-page {
  background-color: var(--page-bg, #f0f8ff);
  min-height: 90vh;
  padding: 2rem 0 4rem;
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue, #1a5b82);
}

/* ─── BREADCRUMBS ─── */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.breadcrumbs a {
  color: var(--text-blue, #1a5b82);
  opacity: 0.7;
  text-decoration: none;
  transition: opacity 0.2s;
}

.breadcrumbs a:hover {
  opacity: 1;
  text-decoration: underline;
}

.breadcrumbs .separator-icon {
  opacity: 0.4;
  font-weight: 300;
}

.breadcrumbs .active-crumb {
  opacity: 0.7;
}

.breadcrumbs .current-item {
  opacity: 0.9;
  font-weight: 600;
}

/* ─── HERO HEADER ─── */
.community-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  margin-bottom: 3.5rem;
}

.hero-text-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.badge-tag {
  background-color: #e6fffa;
  color: #0d9488;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  padding: 0.3rem 0.9rem;
  border-radius: 5.5rem;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 1.2rem;
}

.hero-desc {
  font-size: 1.05rem;
  line-height: 1.6;
  opacity: 0.85;
  margin-bottom: 2rem;
}

.btn-join-community {
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  background: var(--button-purple, #c58cf2);
  border: none;
  padding: 0.85rem 1.75rem;
  border-radius: 5.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: var(--shadow-purple, 0 4px 20px rgba(197, 140, 242, 0.35));
  transition: all 0.22s ease;
}

.btn-join-community:hover {
  background: var(--button-purple-hover, #b373e6);
  transform: translateY(-2px);
  box-shadow: 0 0.35rem 1.2rem rgba(197, 140, 242, 0.45);
}

.hero-image-col {
  width: 100%;
  border-radius: 2rem;
  overflow: hidden;
  box-shadow: 0 0.6rem 2rem rgba(26, 91, 130, 0.1);
  background-color: white;
}

.hero-img {
  width: 100%;
  max-height: 22rem;
  object-fit: cover;
  display: block;
}

/* ─── LAYOUT DE COLUMNAS ─── */
.main-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 3rem;
  align-items: start;
}

/* Sidebar Columna */
.sidebar-col {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid rgba(26, 91, 130, 0.05);
  padding: 1.5rem 1.25rem;
  box-shadow: var(--shadow-soft, 0 4px 20px rgba(26, 91, 130, 0.08));
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  padding-left: 0.5rem;
}

.explore-menu {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.explore-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 5.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-blue, #1a5b82);
  opacity: 0.8;
  transition: all 0.2s ease;
}

.explore-link .material-symbols-outlined {
  font-size: 1.3rem;
}

.explore-menu li.active .explore-link {
  background-color: var(--button-purple-soft, rgba(197, 140, 242, 0.15));
  color: var(--button-purple, #c58cf2);
  font-weight: 700;
  opacity: 1;
}

.explore-link:hover:not(.active) {
  opacity: 1;
  background-color: rgba(26, 91, 130, 0.03);
}

/* Tarjeta Ayuda Urgente */
.urgent-help-card {
  background: linear-gradient(135deg, #c58cf2 0%, #a78bfa 100%);
  border-radius: 1.25rem;
  padding: 1.75rem;
  color: white;
  box-shadow: 0 0.5rem 1.5rem rgba(167, 139, 250, 0.25);
  text-align: center;
}

.urgent-help-card h4 {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.urgent-help-card p {
  font-size: 0.88rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.btn-talk-guide {
  font-family: 'Fredoka', sans-serif;
  width: 100%;
  background: white;
  color: #a78bfa;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 5.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.05);
}

.btn-talk-guide:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.3rem 0.8rem rgba(0, 0, 0, 0.1);
}

/* Main Content Column */
.main-content-col {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Info Cards Grid (Top) */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.info-card-box {
  background: white;
  border-radius: 1.25rem;
  padding: 1.75rem;
  display: flex;
  gap: 1.25rem;
  box-shadow: var(--shadow-soft, 0 4px 20px rgba(26, 91, 130, 0.08));
  border: 1.5px solid transparent;
  transition: transform 0.2s ease;
}

.info-card-box:hover {
  transform: translateY(-2px);
}

.info-card-box.purple-accent {
  border-left: 5px solid #c58cf2;
}

.info-card-box.blue-accent {
  border-left: 5px solid #5bbfd6;
}

.card-icon-wrap {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon-wrap.purple {
  background: rgba(197, 140, 242, 0.1);
  color: #c58cf2;
}

.card-icon-wrap.blue {
  background: rgba(91, 191, 214, 0.1);
  color: #5bbfd6;
}

.card-icon-wrap .material-symbols-outlined {
  font-size: 1.5rem;
}

.card-text-wrap h4 {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.card-text-wrap p {
  font-size: 0.88rem;
  line-height: 1.6;
  opacity: 0.8;
}

/* Testimonios Box */
.testimonial-box {
  background: #f0f8ff;
  border-radius: 1.5rem;
  padding: 2.25rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0.25rem 0.8rem rgba(26, 91, 130, 0.02);
}

.testimonial-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #5bbfd6;
  margin-bottom: 1.25rem;
  letter-spacing: 0.04rem;
}

.quote-giant-icon {
  position: absolute;
  top: 1rem;
  right: 2rem;
  font-size: 6rem;
  font-family: 'Georgia', serif;
  font-weight: bold;
  color: rgba(91, 191, 214, 0.12);
  line-height: 1;
}

.testimonial-quote {
  font-size: 1.25rem;
  line-height: 1.6;
  font-weight: 600;
  font-style: italic;
  margin: 0 0 1.5rem;
  opacity: 0.9;
  max-width: 90%;
  position: relative;
  z-index: 2;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  background: #5bbfd6;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0.15rem 0.5rem rgba(91, 191, 214, 0.25);
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 0.95rem;
  font-weight: 700;
}

.author-role {
  font-size: 0.82rem;
  opacity: 0.75;
}

/* Grupos Destacados Section */
.groups-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-size: 1.35rem;
  font-weight: 700;
}

.link-see-all {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--button-purple, #c58cf2);
  transition: gap 0.2s ease;
}

.link-see-all:hover {
  gap: 0.5rem;
}

.link-see-all .material-symbols-outlined {
  font-size: 1.1rem;
}

.groups-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* Notebook Group Cards */
.notebook-group-card {
  background: white;
  border-radius: 1.5rem;
  position: relative;
  box-shadow: var(--shadow-soft, 0 4px 20px rgba(26, 91, 130, 0.08));
  border: 1.5px solid rgba(26, 91, 130, 0.04);
  padding: 1.75rem 1.75rem 1.75rem 2.75rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.notebook-group-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-mid, 0 8px 32px rgba(26, 91, 130, 0.14));
}

/* Anillas metálicas laterales */
.notebook-rings {
  position: absolute;
  left: 0.75rem;
  top: 1.5rem;
  bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  z-index: 3;
}

.ring {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #cbd5e0 0%, #718096 100%);
  box-shadow: inset -1px -1px 2px rgba(0,0,0,0.2), 1px 1px 3px rgba(0,0,0,0.15);
  position: relative;
}

.ring::after {
  content: '';
  position: absolute;
  left: -0.45rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0.55rem;
  height: 0.18rem;
  background: #a0aec0;
  border-radius: 0.1rem;
}

.group-card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.group-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.2rem 0.65rem;
  border-radius: 5.5rem;
  color: white;
}

.group-badge.purple { background-color: #c58cf2; }
.group-badge.blue { background-color: #5bbfd6; }

.group-icon {
  font-size: 1.5rem;
}

.group-icon.purple { color: #c58cf2; }
.group-icon.blue { color: #5bbfd6; }

.group-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.6rem;
}

.group-desc {
  font-size: 0.88rem;
  line-height: 1.55;
  opacity: 0.8;
  margin-bottom: 1.5rem;
  flex: 1;
}

.btn-explore-group {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  background: transparent;
  border: 1.5px solid;
  padding: 0.55rem 1.15rem;
  border-radius: 5.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
  width: max-content;
}

.btn-explore-group.purple {
  color: #c58cf2;
  border-color: #c58cf2;
}

.btn-explore-group.purple:hover {
  background: #c58cf2;
  color: white;
}

.btn-explore-group.blue {
  color: #5bbfd6;
  border-color: #5bbfd6;
}

.btn-explore-group.blue:hover {
  background: #5bbfd6;
  color: white;
}

.btn-explore-group .material-symbols-outlined {
  font-size: 0.95rem;
}

/* Bottom CTA Banner (Dark) */
.bottom-cta-banner {
  background-color: #2d3748;
  background-image: radial-gradient(circle at 10% 20%, rgba(197, 140, 242, 0.08) 0%, transparent 40%);
  border-radius: 1.5rem;
  padding: 2.5rem;
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1);
}

.cta-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.cta-desc {
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.85;
  max-width: 32rem;
  margin-bottom: 1.75rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-cta-primary {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  background: var(--button-purple, #c58cf2);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5.5rem;
  cursor: pointer;
  box-shadow: 0 0.2rem 0.8rem rgba(197, 140, 242, 0.25);
  transition: all 0.22s ease;
}

.btn-cta-primary:hover {
  background: var(--button-purple-hover, #b373e6);
  transform: translateY(-1px);
}

.btn-cta-secondary {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  padding: 0.7rem 1.5rem;
  border-radius: 5.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cta-secondary:hover {
  border-color: white;
  background: rgba(255, 255, 255, 0.05);
}

/* ─── RESPONSIVE ─── */
@media (max-width: 992px) {
  .community-hero {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .hero-image-col {
    order: -1;
  }
  .main-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .sidebar-col {
    flex-direction: row;
    align-items: stretch;
  }
  .sidebar-card, .urgent-help-card {
    flex: 1;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .sidebar-col {
    flex-direction: column;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
  .groups-grid {
    grid-template-columns: 1fr;
  }
}
</style>
