<template>
  <section class="hero-banner">
    <div class="hero-inner container">

      <!-- Lado izquierdo: Texto -->
      <div class="hero-text">
        <span class="hero-tag">🐾 Apoyo para familias</span>
        <h1 class="hero-title">
          Acompañando el<br>
          desarrollo de los<br>
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

      <!-- Lado derecho: Imagen + badge video -->
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
        </div>

        <!-- Pill inferior -->
        <div class="hero-pill">
          <span>💜</span>
          +2,400 familias acompañadas
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
  { num: '35+',   label: 'Centros'  },
]);
</script>

<style scoped>
.hero-banner {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 2.89rem 0 4.44rem;
  overflow: hidden;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.11rem;
  align-items: center;
}

/* ─── TEXTO ─── */
.hero-text {
  display: flex;
  flex-direction: column;
  gap: 1.22rem;
}

.hero-tag {
  display: inline-block;
  background: rgba(255,255,255,0.80);
  border: 0.06rem solid rgba(197,140,242,0.35);
  color: var(--text-blue);
  font-size: 0.92rem;
  font-weight: 600;
  padding: 0.33rem 0.89rem;
  border-radius: 5.5rem;
  width: fit-content;
  backdrop-filter: blur(0.33rem);
}

.hero-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(2rem, 4vw, 3.1rem);
  font-weight: 700;
  color: var(--text-blue);
  line-height: 1.22;
  letter-spacing: -0.02rem;
  text-shadow: 0 0.11rem 0.67rem rgba(255, 255, 255, 0.95), 0 0.06rem 0.22rem rgba(255, 255, 255, 0.85);
}

.hero-highlight {
  color: #a252e6;
  position: relative;
}
.hero-highlight::after {
  content: '';
  position: absolute;
  bottom: -0.33rem;
  left: 0; right: 0;
  height: 0.22rem;
  background: #a252e6;
  border-radius: 5.5rem;
  opacity: 0.35;
}

.hero-subtitle {
  font-size: 1.05rem;
  line-height: 1.68;
  color: var(--text-blue);
  opacity: 0.82;
  max-width: 24.44rem;
}

.hero-ctas {
  display: flex;
  gap: 0.67rem;
  flex-wrap: wrap;
}

.btn-primary {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  background: var(--button-purple);
  color: white;
  padding: 0.67rem 1.56rem;
  border-radius: 5.5rem;
  box-shadow: var(--shadow-purple);
  transition: all 0.25s ease;
}
.btn-primary:hover {
  background: var(--button-purple-hover);
  transform: translateY(-0.11rem);
  box-shadow: 0 0.44rem 1.56rem rgba(197,140,242,0.5);
}

.btn-secondary {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(0.44rem);
  border: 0.08rem solid rgba(197,140,242,0.4);
  color: var(--text-blue);
  padding: 0.61rem 1.44rem;
  border-radius: 5.5rem;
  transition: all 0.22s ease;
}
.btn-secondary:hover {
  background: white;
  border-color: var(--button-purple);
  transform: translateY(-0.11rem);
}

/* Stats */
.hero-stats {
  display: flex;
  gap: 1.67rem;
  padding-top: 0.22rem;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.06rem;
}
.stat-num {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--text-blue);
  line-height: 1;
}
.stat-label {
  font-size: 0.8rem;
  color: var(--text-blue);
  opacity: 0.65;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.02rem;
}

/* ─── VISUAL ─── */
.hero-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

/* Fondo difuminado pastel para dar profundidad */
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
  box-shadow: 0 1.11rem 2.67rem rgba(26, 91, 130, 0.12), 0 0.28rem 0.83rem rgba(0, 0, 0, 0.05);
}

.hero-img {
  width: 100%;
  max-height: 26.67rem;
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
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(0.56rem);
  border: 0.08rem solid rgba(255, 255, 255, 0.7);
  border-radius: 5.5rem;
  padding: 0.44rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.44rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-blue);
  box-shadow: 0 0.56rem 1.39rem rgba(26, 91, 130, 0.1);
  white-space: nowrap;
  animation: chip-float 4s ease-in-out infinite;
  z-index: 10;
}

.chip-dot {
  width: 0.44rem;
  height: 0.44rem;
  background: var(--button-purple);
  border-radius: 50%;
  flex-shrink: 0;
  animation: dot-pulse 2s ease infinite;
}

.chip-top {
  top: 0.83rem;
  left: -1.39rem;
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
  bottom: -0.83rem;
  right: -0.83rem;
  width: 6.94rem;
  height: 6.94rem;
  border-radius: 50%;
  overflow: hidden;
  border: 0.33rem solid white;
  box-shadow: 0 0.56rem 1.39rem rgba(26, 91, 130, 0.15);
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation: badge-float 5s ease-in-out 1s infinite;
}
.video-badge:hover {
  transform: scale(1.08) rotate(2deg);
  box-shadow: 0 0.78rem 1.78rem rgba(26, 91, 130, 0.22);
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
  margin-top: 1.78rem;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(0.56rem);
  border: 0.08rem solid rgba(197, 140, 242, 0.3);
  color: var(--text-blue);
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.56rem 1.22rem;
  border-radius: 5.5rem;
  display: flex;
  align-items: center;
  gap: 0.44rem;
  box-shadow: 0 0.44rem 1.11rem rgba(26, 91, 130, 0.08);
  animation: pill-float 4.5s ease-in-out infinite alternate;
  position: relative;
  z-index: 2;
}

@keyframes pill-float {
  0% { transform: translateY(0); }
  100% { transform: translateY(-0.33rem); }
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
    gap: 2.22rem;
    text-align: center;
  }
  .hero-tag { margin: 0 auto; }
  .hero-subtitle { margin: 0 auto; }
  .hero-ctas { justify-content: center; }
  .hero-stats { justify-content: center; }
  .chip-top { left: 0.56rem; }
}
@media (max-width: 480px) {
  .hero-banner { padding: 2rem 0 3.33rem; }
  .hero-chip { display: none; }
}
</style>
