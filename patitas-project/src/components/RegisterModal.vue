<template>
  <Transition name="overlay-fade">
    <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
      <Transition name="modal-slide">
        <div v-if="modelValue" class="register-modal" role="dialog" aria-modal="true" aria-labelledby="register-title">
          
          <!-- Botón Cerrar -->
          <button class="close-btn" @click="closeModal" aria-label="Cerrar">
            <span class="material-symbols-outlined">close</span>
          </button>

          <!-- Contenido del modal -->
          <div class="modal-body" :class="{ 'success-state': isSuccess }">
            
            <!-- ─── ESTADO DE ÉXITO ─── -->
            <div v-if="isSuccess" class="success-content">
              <div class="success-icon-wrap">
                <span class="material-symbols-outlined success-icon">mark_email_read</span>
              </div>
              <h2 class="success-title">¡Registro completado!</h2>
              <p class="success-desc">
                Hemos enviado un correo de verificación a <strong>{{ email }}</strong>.<br />
                Por favor, revisa tu bandeja de entrada para activar tu cuenta.
              </p>
              <button class="btn-primary success-btn" @click="closeModal">Entendido</button>
            </div>

            <!-- ─── FORMULARIO DE REGISTRO ─── -->
            <template v-else>
              <div class="modal-header">
                <!-- Logo de marca circular flotante -->
                <div class="brand-logo-container">
                  <div class="brand-logo-wrap">
                    <img :src="logoImg" alt="Patitas Logo" class="brand-logo" />
                  </div>
                </div>
                <h3 id="register-title" class="form-title">Crear Cuenta</h3>
                <p class="form-sub">Regístrate para guardar recursos y conectar con la comunidad.</p>
              </div>

              <!-- Alerta de error -->
              <div v-if="errorMessage" class="error-alert">
                <span class="material-symbols-outlined">error</span>
                <p>{{ errorMessage }}</p>
              </div>

              <form @submit.prevent="handleRegister" class="register-form">
                <!-- Fila 1: Nombre completo y Correo (en Desktop) -->
                <div class="form-row">
                  <div class="field-group">
                    <label for="reg-name">Nombre completo</label>
                    <div class="input-wrapper">
                      <span class="material-symbols-outlined input-icon">person</span>
                      <input
                        id="reg-name"
                        v-model="name"
                        type="text"
                        placeholder="Ej. María García"
                        required
                        autocomplete="name"
                      />
                    </div>
                  </div>

                  <div class="field-group">
                    <label for="reg-email">Correo electrónico</label>
                    <div class="input-wrapper" :class="{ 'input-error': emailError }">
                      <span class="material-symbols-outlined input-icon">mail</span>
                      <input
                        id="reg-email"
                        v-model="email"
                        type="email"
                        placeholder="tu@ejemplo.com"
                        required
                        autocomplete="email"
                        @blur="validateEmail"
                      />
                    </div>
                    <span v-if="emailError" class="field-error-text">{{ emailError }}</span>
                  </div>
                </div>

                <!-- Fila 2: Contraseña y Confirmar Contraseña -->
                <div class="form-row">
                  <div class="field-group">
                    <label for="reg-password">Contraseña</label>
                    <div class="input-wrapper">
                      <span class="material-symbols-outlined input-icon">lock</span>
                      <input
                        id="reg-password"
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="Mín. 8 caracteres"
                        required
                        autocomplete="new-password"
                        @input="evaluatePasswordStrength"
                      />
                      <button
                        type="button"
                        class="toggle-pass"
                        @click="showPassword = !showPassword"
                        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                      >
                        <span class="material-symbols-outlined">
                          {{ showPassword ? 'visibility_off' : 'visibility' }}
                        </span>
                      </button>
                    </div>

                    <!-- Indicador de fortaleza (Compacto) -->
                    <div v-if="password.length > 0" class="strength-meter-wrap">
                      <div class="strength-bars">
                        <div class="strength-bar" :class="[strengthClass, { active: strengthScore >= 1 }]"></div>
                        <div class="strength-bar" :class="[strengthClass, { active: strengthScore >= 2 }]"></div>
                        <div class="strength-bar" :class="[strengthClass, { active: strengthScore >= 3 }]"></div>
                      </div>
                      <span class="strength-label" :class="strengthClass">{{ strengthLabel }}</span>
                    </div>
                  </div>

                  <div class="field-group">
                    <label for="reg-confirm-password">Confirmar contraseña</label>
                    <div class="input-wrapper" :class="{ 'input-error': passwordMismatch }">
                      <span class="material-symbols-outlined input-icon">lock</span>
                      <input
                        id="reg-confirm-password"
                        v-model="confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        placeholder="Repite la contraseña"
                        required
                        autocomplete="new-password"
                        @blur="validatePasswordMatch"
                        @input="clearPasswordMatchError"
                      />
                      <button
                        type="button"
                        class="toggle-pass"
                        @click="showConfirmPassword = !showConfirmPassword"
                        :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                      >
                        <span class="material-symbols-outlined">
                          {{ showConfirmPassword ? 'visibility_off' : 'visibility' }}
                        </span>
                      </button>
                    </div>
                    <span v-if="passwordMismatch" class="field-error-text">No coincide.</span>
                  </div>
                </div>

                <!-- Fila 3: Canal opcional de procedencia y Aceptación de términos -->
                <div class="form-row items-center">
                  <div class="field-group">
                    <label for="reg-referral">¿Cómo nos conociste? <span class="optional">(Opcional)</span></label>
                    <div class="input-wrapper">
                      <span class="material-symbols-outlined input-icon">campaign</span>
                      <select id="reg-referral" v-model="referral">
                        <option value="" disabled selected>Selecciona</option>
                        <option value="google">Búsqueda en Google</option>
                        <option value="social">Redes Sociales</option>
                        <option value="recommendation">Recomendación</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div class="terms-group">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="acceptTerms" required />
                      <span class="checkbox-custom"></span>
                      <span class="terms-text">
                        Acepto los <a href="/terminos" target="_blank" class="terms-link">Términos</a> y la política de privacidad.
                      </span>
                    </label>
                  </div>
                </div>

                <!-- Botón principal -->
                <button
                  type="submit"
                  class="btn-registrar"
                  :disabled="authStore.isLoading || isFormInvalid"
                >
                  <span v-if="authStore.isLoading" class="spinner"></span>
                  <span v-else>Crear cuenta</span>
                </button>
              </form>

              <!-- Separador -->
              <div class="divider">
                <span>o registrarse con</span>
              </div>

              <!-- Botones sociales -->
              <div class="social-btns">
                <button class="social-btn google-btn" @click="handleSocialRegister('google')" type="button">
                  <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <button class="social-btn facebook-btn" @click="handleSocialRegister('facebook')" type="button">
                  <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                  </svg>
                  Facebook
                </button>
                <button class="social-btn apple-btn" @click="handleSocialRegister('apple')" type="button">
                  <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.62.73-1.16 1.87-1.01 2.98 1.12.09 2.27-.59 2.96-1.43z" fill="#000000"/>
                  </svg>
                  iCloud
                </button>
              </div>

              <!-- Registro -->
              <p class="login-cta">
                ¿Ya tienes cuenta?
                <a href="#" class="login-link" @click.prevent="switchToLogin">Inicia sesión</a>
              </p>
            </template>

          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import logoImg from '../assets/logo.png';

const authStore = useAuthStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'open-login', 'register-success']);

// Campos del formulario
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const referral = ref('');
const acceptTerms = ref(false);

// Control de visibilidad
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Estado de registro
const isSuccess = ref(false);
const errorMessage = ref('');
const emailError = ref('');
const passwordMismatch = ref(false);

// Fortaleza de contraseña
const strengthScore = ref(0);
const strengthLabel = computed(() => {
  if (strengthScore.value === 1) return 'débil';
  if (strengthScore.value === 2) return 'media';
  if (strengthScore.value === 3) return 'fuerte';
  return '';
});
const strengthClass = computed(() => {
  if (strengthScore.value === 1) return 'weak';
  if (strengthScore.value === 2) return 'medium';
  if (strengthScore.value === 3) return 'strong';
  return '';
});

function evaluatePasswordStrength() {
  const pwd = password.value;
  if (!pwd) {
    strengthScore.value = 0;
    return;
  }

  const hasMinLength = pwd.length >= 8;
  const hasNumbersOrUpper = /[0-9]/.test(pwd) || /[A-Z]/.test(pwd);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(pwd);

  if (!hasMinLength) {
    strengthScore.value = 1;
  } else if (hasMinLength && hasNumbersOrUpper && !hasSpecialChar) {
    strengthScore.value = 2;
  } else if (hasMinLength && hasNumbersOrUpper && hasSpecialChar) {
    strengthScore.value = 3;
  } else {
    strengthScore.value = 1;
  }
}

// Validaciones
function validateEmail() {
  emailError.value = '';
  if (!email.value) return;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Email inválido.';
  }
}

function validatePasswordMatch() {
  if (!confirmPassword.value) return;
  passwordMismatch.value = password.value !== confirmPassword.value;
}

function clearPasswordMatchError() {
  passwordMismatch.value = false;
}

// Comprobación de formulario
const isFormInvalid = computed(() => {
  return (
    !name.value ||
    !email.value ||
    !!emailError.value ||
    password.value.length < 8 ||
    passwordMismatch.value ||
    !acceptTerms.value
  );
});

// Registro por formulario
async function handleRegister() {
  errorMessage.value = '';
  validateEmail();
  validatePasswordMatch();

  if (isFormInvalid.value) return;

  const result = await authStore.register(name.value, email.value, password.value);
  if (result.success) {
    isSuccess.value = true;
    emit('register-success', authStore.user);
  } else {
    errorMessage.value = result.error || 'Error en el registro.';
  }
}

// Registro por redes sociales
async function handleSocialRegister(provider) {
  errorMessage.value = '';
  const result = await authStore.loginOAuth(provider);
  if (result.success) {
    emit('register-success', authStore.user);
    closeModal();
  } else {
    errorMessage.value = `Error con ${provider}.`;
  }
}

function closeModal() {
  emit('update:modelValue', false);
  // Limpiar campos tras cierre (y resetear estado éxito para la próxima)
  setTimeout(() => {
    isSuccess.value = false;
    name.value = '';
    email.value = '';
    password.value = '';
    confirmPassword.value = '';
    referral.value = '';
    acceptTerms.value = false;
    errorMessage.value = '';
    emailError.value = '';
    passwordMismatch.value = false;
    strengthScore.value = 0;
  }, 300);
}

function switchToLogin() {
  emit('update:modelValue', false);
  emit('open-login');
}
</script>

<style scoped>
/* ─── OVERLAY Y TRANSICIONES ─── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 91, 130, 0.45);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.11rem;
}

/* Transición del Overlay */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* Transición de la Ventana */
.modal-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
.modal-slide-enter-from {
  opacity: 0;
  transform: translateY(25px) scale(0.96);
}
.modal-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.97);
}

/* ─── VENTANA MODAL ─── */
.register-modal {
  background: white;
  width: 100%;
  max-width: 38rem; /* Formato más estrecho y compacto */
  border-radius: 2rem;
  box-shadow: 0 30px 80px rgba(100, 40, 180, 0.35);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

/* Botón cerrar */
.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.85);
  border: none;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  transition: all 0.2s ease;
  z-index: 10;
}
.close-btn:hover {
  background: white;
  color: var(--button-purple);
  transform: rotate(90deg);
}

.modal-body {
  padding: 2.5rem;
}

/* Cabecera */
.modal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.brand-logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 0.85rem;
  width: 100%;
}

.brand-logo-wrap {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
  box-shadow: 0 4px 20px rgba(197, 140, 242, 0.35);
  flex-shrink: 0;
  animation: logoFloat 4s ease-in-out infinite;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
}

.brand-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
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
}

/* Alertas de error */
.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(229, 62, 62, 0.07);
  border: 1px solid rgba(229, 62, 62, 0.15);
  padding: 0.5rem 0.85rem;
  border-radius: 0.67rem;
  color: #e53e3e;
  font-size: 0.82rem;
  margin-bottom: 1.11rem;
  font-weight: 500;
}

.error-alert span {
  font-size: 1.11rem;
  flex-shrink: 0;
}

/* ─── FORMULARIO COMPACTO ─── */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Fila de Formulario (Grid en Escritorio) */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-row.items-center {
  align-items: center;
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

.optional {
  font-weight: 400;
  opacity: 0.6;
}

/* Inputs con el estilo exacto de LoginModal.vue */
.input-wrapper {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border: 1.5px solid transparent;
  border-radius: 0.75rem;
  padding: 0 0.75rem;
  transition: border-color 0.25s, background 0.25s;
  width: 100%;
}

.input-wrapper:focus-within {
  background: white;
  border-color: var(--button-purple);
  box-shadow: 0 0 0 3px var(--button-purple-soft);
}

.input-wrapper.input-error {
  border-color: #e53e3e;
}

.input-wrapper input,
.input-wrapper select {
  border: none;
  background: transparent;
  padding: 0.7rem 0;
  font-size: 0.95rem;
  font-family: inherit;
  flex: 1;
  color: #333;
  outline: none;
  width: 100%;
}

.input-wrapper input::placeholder {
  color: #bbb;
}

.input-icon {
  font-size: 1.1rem;
  color: #aaa;
  margin-right: 0.5rem;
  flex-shrink: 0;
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
.toggle-pass:hover {
  color: var(--button-purple);
}

.toggle-pass .material-symbols-outlined {
  font-size: 1.1rem;
}

.field-error-text {
  color: #e53e3e;
  font-size: 0.75rem;
  margin-top: 0.15rem;
}

/* Indicador de Fortaleza */
.strength-meter-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.35rem;
}

.strength-bars {
  display: flex;
  gap: 0.2rem;
  width: 4.5rem;
}

.strength-bar {
  flex: 1;
  height: 0.2rem;
  background: #e2e8f0;
  border-radius: 0.1rem;
  transition: background-color 0.2s;
}

.strength-bar.weak.active { background-color: #e53e3e; }
.strength-bar.medium.active { background-color: #dd6b20; }
.strength-bar.strong.active { background-color: #38a169; }

.strength-label {
  font-size: 0.75rem;
  font-weight: 600;
}
.strength-label.weak { color: #e53e3e; }
.strength-label.medium { color: #dd6b20; }
.strength-label.strong { color: #38a169; }

/* Checkbox Términos */
.terms-group {
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  position: relative;
  height: 1rem;
  width: 1rem;
  background-color: white;
  border: 1.5px solid #cbd5e0;
  border-radius: 0.25rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
  transition: all 0.2s ease;
}

.checkbox-label input:checked ~ .checkbox-custom {
  background-color: var(--button-purple);
  border-color: var(--button-purple);
}

.checkbox-custom::after {
  content: "";
  position: absolute;
  display: none;
  left: 0.3rem;
  top: 0.08rem;
  width: 0.25rem;
  height: 0.5rem;
  border: solid white;
  border-width: 0 1.8px 1.8px 0;
  transform: rotate(45deg);
}

.checkbox-label input:checked ~ .checkbox-custom::after {
  display: block;
}

.terms-text {
  font-size: 0.78rem;
  color: #555;
  line-height: 1.3;
}

.terms-link {
  color: var(--button-purple);
  font-weight: 600;
}

/* Botón Registrar (Igual al de LoginModal.vue) */
.btn-registrar {
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

.btn-registrar:hover:not(:disabled) {
  background: var(--button-purple-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(197, 140, 242, 0.45);
}

.btn-registrar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 1.1rem;
  height: 1.1rem;
  border: 2.5px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Separador (Igual al de LoginModal.vue) */
.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.25rem 0 1rem;
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

/* Botones sociales (Igual al de LoginModal.vue) */
.social-btns {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
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
  cursor: pointer;
  color: #555;
  transition: all 0.2s ease;
}

.social-btn:hover {
  border-color: var(--button-purple);
  background: rgba(197, 140, 242, 0.05);
}

.social-icon {
  width: 1.1rem;
  height: 1.1rem;
}

/* Registro CTA */
.login-cta {
  text-align: center;
  font-size: 0.88rem;
  color: #666;
}

.login-link {
  color: var(--button-purple);
  font-weight: 600;
  transition: color 0.2s;
}
.login-link:hover {
  color: var(--button-purple-hover);
  text-decoration: underline;
}

/* ─── ESTADO DE ÉXITO CARD ─── */
.success-content {
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.success-icon-wrap {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: rgba(197, 140, 242, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.success-icon {
  color: var(--button-purple);
  font-size: 2.2rem;
}

.success-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.5rem;
}

.success-desc {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 1.75rem;
}

.success-btn {
  max-width: 12rem;
  padding: 0.75rem 2rem;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .terms-group {
    margin-top: 0.25rem;
  }
  .modal-body {
    padding: 1.5rem;
  }
  .register-modal {
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style>
