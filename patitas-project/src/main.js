import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

// Pinia ANTES que Router (el guard del router usa useAuthStore)
app.use(pinia)
app.use(router)

// Restaurar sesión si existe token guardado al iniciar la app (T-FE13-04)
const authStore = useAuthStore()
authStore.me()

app.mount('#app')


