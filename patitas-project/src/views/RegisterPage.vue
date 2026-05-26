<template>
  <div class="register-page-wrapper">
    <!-- Renderizar el modal en estado fijo/abierto -->
    <RegisterModal
      :model-value="true"
      @update:model-value="handleClose"
      @open-login="handleOpenLogin"
      @register-success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import RegisterModal from '../components/RegisterModal.vue';

const router = useRouter();

function handleClose() {
  // Si hay historial de navegación volvemos atrás; si no, vamos al inicio
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}

function handleOpenLogin() {
  // Redirigir a inicio con la query de abrir login
  router.push({ path: '/', query: { auth: 'login' } });
}

function handleSuccess(user) {
  // Tras registro exitoso (y confirmación en el modal si corresponde),
  // podemos redirigir al home tras un breve lapso o dejar que el usuario decida.
  console.log('Usuario registrado con éxito:', user);
}
</script>

<style scoped>
.register-page-wrapper {
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

.register-page-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(240, 248, 255, 0.45);
  pointer-events: none;
}
</style>
