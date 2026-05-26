<template>
  <div class="not-found">
    <div class="nf-content">
      <div class="nf-number">404</div>
      <h1 class="nf-title">¡Ups! Esta página no existe</h1>
      <p class="nf-sub">
        La página que buscas se ha perdido en el camino, como las huellas de las patitas en la lluvia.
      </p>
      <RouterLink to="/" class="nf-btn">
        <span class="material-symbols-outlined">home</span>
        Volver al inicio
      </RouterLink>
    </div>
    <!-- Patas decorativas de fondo -->
    <div class="paw-bg" aria-hidden="true">
      <span>🐾</span><span>🐾</span><span>🐾</span>
      <span>🐾</span><span>🐾</span><span>🐾</span>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.not-found {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 3rem 1.5rem;
}

.nf-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.2rem;
  position: relative;
  z-index: 1;
}

.nf-number {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(6rem, 20vw, 10rem);
  font-weight: 700;
  color: var(--button-purple);
  line-height: 1;
  opacity: 0.18;
  letter-spacing: -0.05em;
  user-select: none;
}

.nf-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  font-weight: 700;
  color: var(--text-blue);
  margin-top: -4rem;
}

.nf-sub {
  font-size: 1rem;
  color: var(--text-blue);
  opacity: 0.7;
  max-width: 26rem;
  line-height: 1.65;
}

.nf-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  background: var(--button-purple);
  color: white;
  padding: 0.7rem 1.8rem;
  border-radius: 5.5rem;
  box-shadow: var(--shadow-purple);
  transition: all 0.25s ease;
  margin-top: 0.5rem;
}
.nf-btn:hover {
  background: var(--button-purple-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(197, 140, 242, 0.45);
}
.nf-btn .material-symbols-outlined { font-size: 1.2rem; }

/* Patas de fondo decorativas */
.paw-bg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 2rem;
  pointer-events: none;
  opacity: 0.04;
  font-size: 6rem;
}
</style>
