import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)

  // Restaurar sesión ANTES de que el router evalúe cualquier guard.
  // Sin esto, auth.user es null cuando el beforeEach corre por primera vez.
  const authStore = useAuthStore()
  await authStore.me()

  app.use(router)

  // Esperar a que el router resuelva la ruta inicial antes de montar
  await router.isReady()

  app.mount('#app')
}

bootstrap()
