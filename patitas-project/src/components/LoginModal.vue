<template>
  <!-- Overlay que cubre toda la pantalla -->
  <Transition name="overlay-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <Transition name="modal-slide">
        <div v-if="modelValue" class="login-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
          
          <!-- Botón cerrar -->
          <button class="close-btn" @click="$emit('update:modelValue', false)" aria-label="Cerrar">
            <span class="material-symbols-outlined">close</span>
          </button>

          <!-- Panel izquierdo: ilustración y bienvenida -->
          <div class="modal-left">
            <div class="brand-tag">
              <img :src="logoImg" alt="Patitas Logo" class="brand-logo" />
              <span class="brand-name">patitas</span>
            </div>
            <h2 class="welcome-title">Bienvenidos<br />a casa</h2>
            <p class="welcome-sub">
              Un espacio seguro y diseñado con amor para acompañar el desarrollo neurodiverso de los más pequeños.
            </p>
            <div class="hero-img-wrapper">
              <img :src="heroImg" alt="Niño jugando" class="hero-img" />
            </div>
          </div>

          <!-- Panel derecho: formulario -->
          <div class="modal-right">
            <h3 id="login-title" class="form-title">Ingresar</h3>
            <p class="form-sub">Nos alegra verte de nuevo.</p>

            <form @submit.prevent="handleLogin" class="login-form">
              <!-- Campo email -->
              <div class="field-group">
                <label for="email">Correo electrónico</label>
                <div class="input-wrapper">
                  <span class="material-symbols-outlined input-icon">mail</span>
                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="tu@ejemplo.com"
                    autocomplete="email"
                    required
                  />
                </div>
              </div>

              <!-- Campo contraseña -->
              <div class="field-group">
                <div class="label-row">
                  <label for="password">Contraseña</label>
                  <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
                </div>
                <div class="input-wrapper">
                  <span class="material-symbols-outlined input-icon">lock</span>
                  <input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    autocomplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    class="toggle-pass"
                    @click="showPassword = !showPassword"
                    :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  >
                    <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>

              <!-- Botón principal -->
              <button type="submit" class="btn-ingresar" :disabled="authStore.isLoading">
                <span v-if="authStore.isLoading" class="spinner"></span>
                <span v-else>Ingresar</span>
              </button>

              <!-- Mensaje error -->
              <p v-if="localError" class="error-msg">{{ localError }}</p>
            </form>

            <!-- Separador -->
            <div class="divider">
              <span>o continuar con</span>
            </div>

            <!-- Botones sociales -->
            <div class="social-btns">
              <button class="social-btn google-btn" @click="loginGoogle">
                <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button class="social-btn facebook-btn" @click="loginFacebook">
                <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
                Facebook
              </button>
            </div>

            <!-- Registro -->
            <p class="register-cta">
              ¿No tienes cuenta?
              <a href="#" class="register-link" @click.prevent>Regístrate</a>
            </p>
          </div>

        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import logoImg from '../assets/logo.png';
import heroImg from '../assets/hero.png';

const authStore = useAuthStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'login-success']);

const email = ref('');
const password = ref('');
const showPassword = ref(false);

// isLoading y error vienen del store — se sincronizan automáticamente
const localError = ref('');

async function handleLogin() {
  localError.value = '';

  if (!email.value || !password.value) {
    localError.value = 'Por favor completa todos los campos.';
    return;
  }

  if (!email.value.includes('@')) {
    localError.value = 'Ingresa un email válido.';
    return;
  }

  const result = await authStore.login(email.value, password.value);

  if (result.success) {
    emit('login-success', authStore.user);
    emit('update:modelValue', false);
    // Limpiar campos al cerrar
    email.value = '';
    password.value = '';
  } else {
    localError.value = result.error || 'Email o contraseña incorrectos.';
    // Limpiar solo la contraseña (buena práctica de seguridad)
    password.value = '';
  }
}

function loginGoogle() {
  // TODO (FE-05): Implementar OAuth 2.0 con Google
  console.log('Login con Google — pendiente OAuth 2.0');
}

function loginFacebook() {
  // TODO (FE-05): Implementar OAuth 2.0 con Facebook
  console.log('Login con Facebook — pendiente OAuth 2.0');
}
</script>

<style scoped>
/* ── Overlay ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(20, 10, 40, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* ── Modal container ── */
.login-modal {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 860px;
  min-height: 520px;
  border-radius: 2rem;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(100, 40, 180, 0.35);
  background: white;
}

/* ── Botón cerrar ── */
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  background: rgba(255,255,255,0.85);
  border: none;
  border-radius: 50%;
  width: 2.2rem;
  height: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: background 0.2s, transform 0.2s;
  color: #555;
}

.close-btn:hover {
  background: #f0e6ff;
  transform: rotate(90deg);
}

.close-btn .material-symbols-outlined {
  font-size: 1.25rem;
}

/* ── Panel Izquierdo ── */
.modal-left {
  flex: 1;
  background: linear-gradient(150deg, var(--primary-bg) 0%, var(--footer-purple) 100%);
  padding: 2.5rem 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
}

.brand-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.brand-logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  object-fit: cover;
}

.brand-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-blue);
}

.welcome-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-blue);
  line-height: 1.2;
  margin-bottom: 0.75rem;
}

.welcome-sub {
  font-size: 0.9rem;
  color: var(--text-blue);
  opacity: 0.8;
  line-height: 1.6;
  max-width: 280px;
  margin-bottom: 1rem;
}

.hero-img-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
}

.hero-img {
  width: 85%;
  max-width: 240px;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(100, 50, 200, 0.2));
  animation: floatImg 3.5s ease-in-out infinite;
}

@keyframes floatImg {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* ── Panel Derecho ── */
.modal-right {
  flex: 1;
  padding: 2.5rem 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fafafa;
}

.form-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.25rem;
}

.form-sub {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 1.5rem;
}

/* ── Campos del formulario ── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 0.78rem;
  color: var(--button-purple);
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: var(--button-purple-hover);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border: 1.5px solid transparent;
  border-radius: 0.75rem;
  padding: 0 0.75rem;
  transition: border-color 0.25s, background 0.25s;
}

.input-wrapper:focus-within {
  background: white;
  border-color: var(--button-purple);
  box-shadow: 0 0 0 3px var(--button-purple-soft);
}

.input-icon {
  font-size: 1.1rem;
  color: #aaa;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.input-wrapper input {
  border: none;
  background: transparent;
  padding: 0.7rem 0;
  font-size: 0.95rem;
  font-family: inherit;
  flex: 1;
  color: #333;
  outline: none;
}

.input-wrapper input::placeholder {
  color: #bbb;
}

.toggle-pass {
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
}

.toggle-pass:hover { color: var(--button-purple); }

.toggle-pass .material-symbols-outlined {
  font-size: 1.1rem;
}

/* ── Botón Ingresar ── */
.btn-ingresar {
  width: 100%;
  padding: 0.85rem;
  background: var(--button-purple);
  color: white;
  border: none;
  border-radius: 2rem;
  font-family: 'Fredoka', sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.25rem;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: var(--shadow-purple);
}

.btn-ingresar:hover:not(:disabled) {
  background: var(--button-purple-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(197, 140, 242, 0.45);
}

.btn-ingresar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ── Spinner ── */
.spinner {
  width: 1.1rem;
  height: 1.1rem;
  border: 2.5px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Mensaje de error ── */
.error-msg {
  font-size: 0.82rem;
  color: #e53e3e;
  text-align: center;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 0.5rem;
  padding: 0.4rem 0.75rem;
}

/* ── Divider ── */
.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0 0.75rem;
  color: #bbb;
  font-size: 0.82rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e5e5;
}

/* ── Botones sociales ── */
.social-btns {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.social-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: 1.5px solid #e0e0e0;
  border-radius: 2rem;
  background: white;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  color: #333;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.social-btn:hover {
  border-color: var(--button-purple);
  box-shadow: 0 2px 10px var(--button-purple-soft);
  transform: translateY(-1px);
}

.social-icon {
  width: 1.1rem;
  height: 1.1rem;
}

/* ── Registro ── */
.register-cta {
  text-align: center;
  font-size: 0.85rem;
  color: #888;
}

.register-link {
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  color: var(--button-purple);
  transition: color 0.2s;
}

.register-link:hover {
  color: var(--button-purple-hover);
}

/* ── Transiciones ── */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.35s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.modal-slide-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.96);
}
.modal-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.97);
}

/* ── Responsivo ── */
@media (max-width: 640px) {
  .login-modal {
    flex-direction: column;
    max-width: 100%;
    border-radius: 1.5rem;
  }

  .modal-left {
    padding: 1.5rem 1.5rem 1rem;
    min-height: 180px;
  }

  .hero-img-wrapper {
    display: none;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .modal-right {
    padding: 1.5rem;
  }
}
</style>
