<template>
  <section class="info-section">
    <!-- Encabezado de sección -->
    <div class="section-header">
      <span class="section-badge">Recursos</span>
      <h2 class="section-title">Todo lo que necesitas saber</h2>
      <p class="section-sub">Información clara y empática para acompañar el desarrollo de tu hijo.</p>
    </div>

    <!-- Cards -->
    <div class="cards-grid container">
      <article
        class="info-card"
        v-for="(card, i) in cards"
        :key="i"
        :style="{ '--card-accent': card.color }"
      >
        <!-- Anillas metálicas de cuaderno en el borde izquierdo -->
        <div class="notebook-rings">
          <div class="ring" v-for="n in 5" :key="n"></div>
        </div>

        <!-- Zona superior con imagen placeholder + color de acento suave -->
        <div class="card-top">
          <div class="card-emoji-wrap">
            <span class="card-emoji">{{ card.emoji }}</span>
          </div>
          <span class="card-category">{{ card.category }}</span>
        </div>
        <!-- Cuerpo -->
        <div class="card-body">
          <h3 class="card-title">{{ card.title }}</h3>
          <p class="card-desc">{{ card.desc }}</p>
          <a href="#" class="card-btn">
            Leer más
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </article>
    </div>

    <!-- Banner CTA -->
    <div class="cta-wrap container">
      <div class="cta-banner">
        <div class="cta-text">
          <h3>¿Acabas de recibir un diagnóstico?</h3>
          <p>Estamos aquí para acompañarte. No estás solo/a.</p>
        </div>
        <a href="#" class="cta-btn">Únete a la comunidad</a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
const cards = ref([
  {
    emoji: '🧩',
    category: 'Información',
    title: 'QUÉ ES EL AUTISMO',
    desc: 'Aprende sobre el Trastorno del Espectro Autista, sus señales tempranas y cómo se manifiesta en los primeros años de vida.',
    color: '#c58cf2',
  },
  {
    emoji: '🌱',
    category: 'Intervención',
    title: 'GUÍA DE ATENCIÓN TEMPRANA',
    desc: 'Pasos concretos tras el diagnóstico: terapias, centros de apoyo, derechos de tu hijo y cómo comenzar hoy mismo.',
    color: '#5bbfd6',
  },
  {
    emoji: '🤝',
    category: 'Comunidad',
    title: 'COMUNIDAD PATITAS',
    desc: 'Conecta con otras familias, comparte tu experiencia y encuentra el apoyo que solo alguien que lo vive puede dar.',
    color: '#f09dc0',
  },
]);
</script>

<style scoped>
.info-section {
  background-color: var(--page-bg);
  padding: 4rem 0 3.33rem;
  position: relative;
}

/* ─── ENCABEZADO ─── */
.section-header {
  text-align: center;
  margin-bottom: 2.67rem;
  padding: 0 1.11rem;
}

.section-badge {
  display: inline-block;
  background: rgba(197,140,242,0.15);
  border: 0.06rem solid rgba(197,140,242,0.35);
  color: #9b59b6;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07rem;
  padding: 0.28rem 0.89rem;
  border-radius: 5.5rem;
  margin-bottom: 0.78rem;
}

.section-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.67rem;
  line-height: 1.2;
}

.section-sub {
  font-size: 1rem;
  color: var(--text-blue);
  opacity: 0.72;
  max-width: 25.56rem;
  margin: 0 auto;
  line-height: 1.65;
}

/* ─── CARDS ─── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.33rem;
}

.info-card {
  background: var(--card-bg);
  border-radius: 1.33rem;
  overflow: visible;
  border: 0.08rem solid rgba(197,140,242,0.15);
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease;
  position: relative;
}
.info-card:hover {
  transform: translateY(-0.33rem) rotate(-0.8deg);
  box-shadow: var(--shadow-mid);
}

/* Anillas metálicas del cuaderno */
.notebook-rings {
  position: absolute;
  left: -0.61rem;
  top: 2rem;
  bottom: 2rem;
  width: 1.22rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  z-index: 10;
  pointer-events: none;
}

.ring {
  width: 1.22rem;
  height: 0.67rem;
  background: linear-gradient(180deg, #f1f5f9 0%, #cbd5e1 40%, #94a3b8 70%, #475569 100%);
  border-radius: 0.22rem;
  box-shadow: 0 0.17rem 0.28rem rgba(0,0,0,0.12), inset 0 0.06rem 0.06rem rgba(255,255,255,0.8);
  position: relative;
}

/* El agujero del papel */
.ring::before {
  content: '';
  position: absolute;
  top: 0.11rem;
  right: 0.11rem;
  width: 0.33rem;
  height: 0.44rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 50%;
}

/* Top coloreada de la card */
.card-top {
  background: color-mix(in srgb, var(--card-accent) 12%, white);
  padding: 1.56rem 1.33rem 1.11rem 2.67rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.67rem;
  border-bottom: 0.06rem solid rgba(0,0,0,0.04);
  border-radius: 1.33rem 1.33rem 0 0;
}

.card-emoji-wrap {
  width: 3.33rem;
  height: 3.33rem;
  background: white;
  border-radius: 0.89rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.9rem;
  box-shadow: 0 0.11rem 0.67rem rgba(0,0,0,0.07);
  border: 0.08rem solid color-mix(in srgb, var(--card-accent) 22%, white);
  flex-shrink: 0;
}

.card-emoji { line-height: 1; }

.card-category {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04rem;
  color: var(--card-accent);
  background: white;
  padding: 0.22rem 0.67rem;
  border-radius: 5.5rem;
  border: 0.06rem solid color-mix(in srgb, var(--card-accent) 25%, white);
  margin-top: 0.22rem;
  white-space: nowrap;
}

/* Cuerpo */
.card-body {
  padding: 1.33rem 1.33rem 1.56rem 2.67rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  background-image: repeating-linear-gradient(
    rgba(255, 255, 255, 0) 0rem,
    rgba(255, 255, 255, 0) 1.5rem,
    rgba(26, 91, 130, 0.05) 1.56rem
  );
  background-size: 100% 1.56rem;
  position: relative;
  border-radius: 0 0 1.33rem 1.33rem;
}

/* Línea roja vertical de margen de cuaderno */
.card-body::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 2rem;
  width: 0.08rem;
  background: rgba(240, 157, 192, 0.6);
  z-index: 2;
}

.card-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.67rem;
  line-height: 1.25;
}

.card-desc {
  font-size: 0.93rem;
  line-height: 1.65;
  color: var(--text-blue);
  opacity: 0.75;
  flex: 1;
  margin-bottom: 1.22rem;
}

.card-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.39rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--button-purple);
  color: white;
  padding: 0.5rem 1.11rem;
  border-radius: 5.5rem;
  width: fit-content;
  transition: all 0.22s ease;
  box-shadow: 0 0.11rem 0.56rem rgba(197,140,242,0.35);
}
.card-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-0.11rem);
  box-shadow: 0 0.22rem 1rem rgba(197,140,242,0.5);
}

/* ─── CTA BANNER ─── */
.cta-wrap {
  margin-top: 3.11rem;
}

.cta-banner {
  background-image: url('../assets/fondo_morado.png');
  background-size: cover;
  background-position: center;
  border-radius: 1.56rem;
  padding: 2.22rem 2.67rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.56rem;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0.44rem 1.78rem rgba(197,140,242,0.25);
}

.cta-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(26,91,130,0.4) 0%, rgba(197,140,242,0.3) 100%);
}

.cta-text { position: relative; z-index: 1; }
.cta-text h3 {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.55rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.33rem;
  text-shadow: 0 0.06rem 0.44rem rgba(0,0,0,0.15);
}
.cta-text p {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.82);
}

.cta-btn {
  position: relative;
  z-index: 1;
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  background: white;
  color: var(--text-blue);
  padding: 0.67rem 1.56rem;
  border-radius: 5.5rem;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.22s ease;
  box-shadow: 0 0.22rem 0.89rem rgba(0,0,0,0.12);
}
.cta-btn:hover {
  transform: translateY(-0.11rem);
  box-shadow: 0 0.33rem 1.33rem rgba(0,0,0,0.18);
}

/* ─── RESPONSIVE ─── */
@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 680px) {
  .cards-grid {
    grid-template-columns: 1fr;
    max-width: 25.56rem;
    margin: 0 auto;
  }
}
@media (max-width: 600px) {
  .cta-banner { 
    flex-direction: column; 
    text-align: center; 
    padding: 1.78rem 1.33rem; 
  }
}
</style>
