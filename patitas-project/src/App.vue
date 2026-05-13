<script setup>
// Importación de los componentes de la carpeta components
import SiteHeader from './components/SiteHeader.vue'
import HeroBanner from './components/HeroBanner.vue'
import InfoCards from './components/InfoCards.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <div class="app-wrapper">
    
    <SiteHeader />

    <main class="main-content">
      <HeroBanner />
      <InfoCards />
    </main>

    <SiteFooter />
    
  </div>
</template>

<style>
/* Estilos globales (sin scoped para que afecten a toda la app si es necesario) */
:root {
  --primary-bg: #f5f5f5;
  --text-blue: #2c3e50;
  --button-purple: #c58cf2;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  /* Fuente de respaldo por si Fredoka tarda en cargar */
  font-family: 'Fredoka', sans-serif; 
  background-color: var(--primary-bg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>

<style scoped>
/* Estilos específicos de este layout */
.app-wrapper {
  display: flex;
  flex-direction: column;
  /* min-height asegura que el footer no flote si hay poco contenido */
  min-height: 100vh; 
}

.main-content {
  /* flex-grow hace que el contenido ocupe todo el espacio disponible
     empujando el footer hacia la parte inferior de la pantalla */
  flex-grow: 1;
}

/* Transición suave entre secciones */
main > * {
  margin-bottom: 0; /* Ajusta según prefieras el espacio entre componentes */
}
</style>