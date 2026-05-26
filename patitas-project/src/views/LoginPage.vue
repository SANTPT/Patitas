<template>
  <div class="login-page-wrapper">
    <!-- Renderizar el modal en estado fijo/abierto -->
    <LoginModal
      :model-value="true"
      @update:model-value="handleClose"
      @open-register="handleOpenRegister"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import LoginModal from '../components/LoginModal.vue';

const router = useRouter();

function handleClose() {
  // Si hay historial de navegación volvemos atrás; si no, vamos al inicio
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}

function handleOpenRegister() {
  // Redirigir a registro con modal abierto
  router.push('/registro');
}
</script>

<style scoped>
.login-page-wrapper {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 2.22rem 1.11rem;
}

.login-page-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(240, 248, 255, 0.45);
  pointer-events: none;
}
</style>
