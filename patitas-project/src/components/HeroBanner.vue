<template>
  <section class="hero-banner">
    <div class="hero-inner container">

      <!-- Lado izquierdo: Texto -->
      <div class="hero-text">
        <span class="hero-tag">
          <span class="material-symbols-outlined tag-icon">groups</span>
          Apoyo para familias
        </span>
        <h1 class="hero-title">
          <span class="title-line-1">Acompañando el desarrollo de los</span>
          <span class="hero-highlight">más pequeños</span>
        </h1>
        <p class="hero-subtitle">
          Recursos, comunidad y orientación para padres de niños con sospecha o diagnóstico de autismo. Porque cada paso importa.
        </p>
        <div class="hero-ctas">
          <a href="#" class="btn-primary">Comenzar ahora</a>
          <a href="#" class="btn-secondary">Conocer recursos</a>
        </div>
        <!-- Stats -->
        <div class="hero-stats">
          <div class="stat-item" v-for="s in stats" :key="s.label">
            <span class="stat-num">{{ s.num }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <!-- Lado derecho: Imagen + badges flotantes -->
      <div class="hero-visual">
        <div class="hero-card">
          <div class="hero-card-inner">
            <img src="../assets/hero.png" alt="Acompañando el desarrollo" class="hero-img" />
          </div>

          <!-- Chip flotante superior -->
          <div class="hero-chip chip-top">
            <span class="chip-dot"></span>
            <span>Diagnóstico temprano</span>
          </div>

          <!-- Video badge (los patos) -->
          <div class="video-badge">
            <video autoplay muted loop playsinline>
              <source :src="videoUrl" type="video/mp4">
            </video>
          </div>

          <!-- Pill inferior (posicionado de forma absoluta relativo a hero-card) -->
          <div class="hero-pill">
            <span>💜</span>
            +2,400 familias acompañadas
          </div>
        </div>
      </div>
    </div>

    <!-- Separador wave hacia InfoCards -->
    <div class="hero-wave-bottom">
      <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="#f0f8ff"/>
      </svg>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import videoUrl from '../assets/vido_patitas.mp4';
const stats = ref([
  { num: '+2.4k', label: 'Familias' },
  { num: '120+',  label: 'Recursos' },
  { num: '55+',   label: 'Centros'  },
]);
</script>

<style scoped>
.hero-banner {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 3.5rem 0 4.5rem;
  overflow: hidden;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 3.5rem;
  align-items: center;
  max-width: 78rem;
  margin: 0 auto;
}

/* ─── TEXTO ─── */
.hero-text {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.hero-tag {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #e4ece8; /* Soft sage green */
  color: #3a6053; /* Deep sage green */
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.35rem 0.85rem;
  border-radius: 5.5rem;
  width: fit-content;
}

.tag-icon {
  font-size: 1.15rem;
  color: #3a6053;
}

.hero-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(1.7rem, 3.3vw, 2.85rem);
  font-weight: 700;
  color: var(--text-blue);
  line-height: 1.15;
  letter-spacing: -0.01rem;
}

.title-line-1 {
  display: block;
}

@media (min-width: 961px) {
  .title-line-1 {
    white-space: nowrap;
  }
}

.hero-highlight {
  color: var(--button-purple);
  font-style: italic;
  font-weight: 700;
  display: block;
  margin-top: 0.15rem;
}

.hero-subtitle {
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--text-blue);
  opacity: 0.8;
  max-width: 32rem;
}

.hero-ctas {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.btn-primary {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  background: var(--button-purple);
  color: white;
  padding: 0.8rem 1.85rem;
  border-radius: 5.5rem;
  box-shadow: var(--shadow-purple);
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-primary:hover {
  background: var(--button-purple-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(197, 140, 242, 0.45);
}

.btn-secondary {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  background: white;
  border: 1.5px solid rgba(197, 140, 242, 0.45);
  color: var(--button-purple);
  padding: 0.75rem 1.75rem;
  border-radius: 5.5rem;
  transition: all 0.22s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-secondary:hover {
  background: rgba(197, 140, 242, 0.05);
  border-color: var(--button-purple);
  transform: translateY(-2px);
}

/* Stats */
.hero-stats {
  display: flex;
  gap: 3.5rem;
  padding-top: 0.5rem;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.stat-num {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.95rem;
  font-weight: 700;
  color: var(--text-blue);
  line-height: 1;
}
.stat-label {
  font-size: 0.78rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
}

/* ─── VISUAL ─── */
.hero-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  width: 100%;
}

.hero-visual::before {
  content: '';
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(197, 140, 242, 0.25) 0%, rgba(178, 235, 242, 0.25) 100%);
  filter: blur(3.33rem);
  z-index: 0;
  pointer-events: none;
}

.hero-card {
  position: relative;
  width: 100%;
  border-radius: 2rem;
  overflow: visible;
  z-index: 1;
}

.hero-card-inner {
  position: relative;
  width: 100%;
  border-radius: 2rem;
  overflow: hidden;
  border: 0.44rem solid white;
  box-shadow: 0 20px 45px rgba(26, 91, 130, 0.12), 0 4px 15px rgba(0, 0, 0, 0.05);
}

.hero-img {
  width: 100%;
  max-height: 42rem;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hero-card:hover .hero-img {
  transform: scale(1.05);
}

/* Chip flotante */
.hero-chip {
  position: absolute;
  background: white;
  border-radius: 50px;
  padding: 0.45rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  animation: chip-float 4s ease-in-out infinite;
  z-index: 10;
}

.chip-dot {
  width: 0.45rem;
  height: 0.45rem;
  background: #e53e3e;
  border-radius: 50%;
  flex-shrink: 0;
  animation: dot-pulse 2s ease infinite;
}

.chip-top {
  top: -0.75rem;
  left: -0.75rem;
}

@keyframes chip-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-0.44rem); }
}
@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.7; }
}

/* Video badge */
.video-badge {
  position: absolute;
  bottom: -2rem;
  right: -2rem;
  width: 7.5rem;
  height: 7.5rem;
  border-radius: 50%;
  overflow: hidden;
  border: 6px solid white;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  z-index: 11;
  background: #ccdcd2; /* soft green backdrop */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: badge-float 5s ease-in-out 1s infinite;
}
.video-badge:hover {
  transform: scale(1.1) rotate(3deg);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.22);
}
.video-badge video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
@keyframes badge-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-0.33rem) rotate(2deg); }
}

/* Pill inferior */
.hero-pill {
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: #4a5568;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.55rem 1.25rem;
  border-radius: 5.5rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  z-index: 10;
}

/* ─── WAVE ─── */
.hero-wave-bottom {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3.11rem;
  z-index: 2;
}
.hero-wave-bottom svg { width: 100%; height: 100%; display: block; }

/* ─── RESPONSIVE ─── */
@media (max-width: 960px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    text-align: center;
  }
  .hero-tag { margin: 0 auto; }
  .hero-subtitle { margin: 0 auto; }
  .hero-ctas { justify-content: center; }
  .hero-stats { justify-content: center; gap: 2rem; }
  .chip-top { left: 50%; transform: translateX(-50%); top: -1.2rem; }
}
@media (max-width: 480px) {
  .hero-banner { padding: 2rem 0 3.33rem; }
  .hero-chip { display: none; }
}
</style>
