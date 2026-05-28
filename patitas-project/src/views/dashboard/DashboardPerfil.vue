<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

// Personal details state
const name = ref('');
const email = ref('');
const selectedColor = ref('#c58cf2');
const isSavingProfile = ref(false);

// Shipping details state (role === 'user' only)
const phone = ref('');
const address = ref('');
const city = ref('');
const zip = ref('');
const country = ref('');
const isSavingShipping = ref(false);

// Password state
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isChangingPassword = ref(false);
const passwordError = ref('');

const role = computed(() => authStore.user?.role || 'user');

const colors = [
  '#c58cf2', // Morado patitas
  '#5bbfd6', // Azul patitas
  '#f6ad55', // Naranja
  '#fc8181', // Rosa
  '#4fd1c5', // Cerceta
  '#68d391', // Verde
  '#63b3ed'  // Celeste
];

// Helper to extract initials from name
const initials = computed(() => {
  if (!name.value) return '?';
  const parts = name.value.trim().split(/\s+/);
  return parts.length > 1 
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
});

// Load user details
onMounted(() => {
  if (authStore.user) {
    name.value = authStore.user.name || '';
    email.value = authStore.user.email || '';
    
    // Shipping info
    phone.value = authStore.user.phone || '';
    address.value = authStore.user.address || '';
    city.value = authStore.user.city || '';
    zip.value = authStore.user.zip || '';
    country.value = authStore.user.country || '';

    // Extract color if stored in avatar SVG or fallback
    const avatarStr = authStore.user.avatar || '';
    const fillMatch = avatarStr.match(/fill='([^']+)'/);
    if (fillMatch && fillMatch[1]) {
      const decodedColor = decodeURIComponent(fillMatch[1]);
      if (colors.includes(decodedColor)) {
        selectedColor.value = decodedColor;
      }
    }
  }
});

// Generate Base64 SVG avatar on the fly
function generateAvatarString(nameVal, colorVal) {
  const init = initials.value;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <circle cx='50' cy='50' r='50' fill='${colorVal.replace('#', '%23')}'/>
    <text x='50%' y='55%' font-family='sans-serif' font-size='40' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'>${init}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

// Save profile action
async function handleSaveProfile() {
  if (!name.value.trim()) {
    triggerToast('El nombre no puede estar vacío.', 'error');
    return;
  }
  isSavingProfile.value = true;
  
  const avatar = generateAvatarString(name.value, selectedColor.value);
  const result = await authStore.updateProfile({
    name: name.value,
    email: email.value,
    avatar
  });
  
  isSavingProfile.value = false;
  if (result.success) {
    triggerToast('Perfil actualizado con éxito.', 'success');
  } else {
    triggerToast(result.error || 'Error al actualizar el perfil.', 'error');
  }
}

// Save shipping details action
async function handleSaveShipping() {
  isSavingShipping.value = true;
  const result = await authStore.updateProfile({
    phone: phone.value,
    address: address.value,
    city: city.value,
    zip: zip.value,
    country: country.value
  });
  
  isSavingShipping.value = false;
  if (result.success) {
    triggerToast('Datos de compra actualizados con éxito.', 'success');
  } else {
    triggerToast(result.error || 'Error al guardar los datos de envío.', 'error');
  }
}

// Save password action
async function handleSavePassword() {
  passwordError.value = '';
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = 'Completa todos los campos de contraseña.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'La nueva contraseña y su confirmación no coinciden.';
    return;
  }
  
  isChangingPassword.value = true;
  const result = await authStore.changePassword(currentPassword.value, newPassword.value);
  isChangingPassword.value = false;
  
  if (result.success) {
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    triggerToast('Contraseña cambiada con éxito.', 'success');
  } else {
    passwordError.value = result.error || 'Error al cambiar la contraseña.';
  }
}

function triggerToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type }
  }));
}
</script>

<template>
  <div class="dashboard-profile-view">
    <div class="profile-grid">
      <!-- Left Column: Personal Data & Avatar -->
      <div class="profile-column">
        <section class="profile-card">
          <h3 class="card-title">Datos Personales</h3>
          <form @submit.prevent="handleSaveProfile" class="profile-form">
            <!-- Live Avatar Preview & Selector -->
            <div class="avatar-selector-section">
              <div class="avatar-preview" :style="{ backgroundColor: selectedColor }">
                {{ initials }}
              </div>
              <div class="color-picker-group">
                <span class="picker-label">Color de perfil</span>
                <div class="colors-row">
                  <button
                    v-for="color in colors"
                    :key="color"
                    type="button"
                    class="color-btn"
                    :style="{ backgroundColor: color }"
                    :class="{ 'active': selectedColor === color }"
                    @click="selectedColor = color"
                    :aria-label="'Seleccionar color ' + color"
                  ></button>
                </div>
              </div>
            </div>

            <!-- Fields -->
            <div class="form-group">
              <label for="profile-name">Nombre Completo</label>
              <input 
                id="profile-name"
                v-model="name"
                type="text"
                required
                placeholder="Tu nombre completo"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="profile-email">Correo Electrónico</label>
              <input 
                id="profile-email"
                v-model="email"
                type="email"
                required
                placeholder="Tu dirección de correo"
                class="form-input"
              />
            </div>

            <button 
              type="submit" 
              class="submit-btn" 
              :disabled="isSavingProfile"
            >
              <span class="material-symbols-outlined">save</span>
              {{ isSavingProfile ? 'Guardando...' : 'Guardar Perfil' }}
            </button>
          </form>
        </section>

        <!-- Change Password Section -->
        <section class="profile-card password-card">
          <h3 class="card-title">Seguridad</h3>
          <form @submit.prevent="handleSavePassword" class="profile-form">
            <p class="form-help-text">Puedes cambiar tu contraseña validando la actual.</p>
            
            <div v-if="passwordError" class="password-error-alert">
              {{ passwordError }}
            </div>

            <div class="form-group">
              <label for="current-password">Contraseña Actual</label>
              <input 
                id="current-password"
                v-model="currentPassword"
                type="password"
                placeholder="••••••••"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="new-password">Nueva Contraseña</label>
              <input 
                id="new-password"
                v-model="newPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="confirm-password">Confirmar Nueva Contraseña</label>
              <input 
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                placeholder="Repite la nueva contraseña"
                class="form-input"
              />
            </div>

            <button 
              type="submit" 
              class="submit-btn outline" 
              :disabled="isChangingPassword"
            >
              <span class="material-symbols-outlined">lock_reset</span>
              {{ isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
            </button>
          </form>
        </section>
      </div>

      <!-- Right Column: Shipping Info (Only visible for 'user') -->
      <div v-if="role === 'user'" class="profile-column">
        <section class="profile-card">
          <h3 class="card-title">Datos de Compra / Envío</h3>
          <p class="form-help-text">Esta información se guardará en tu perfil para agilizar el proceso de compra en la tienda.</p>
          
          <form @submit.prevent="handleSaveShipping" class="profile-form">
            <div class="form-group">
              <label for="shipping-phone">Teléfono de contacto</label>
              <input 
                id="shipping-phone"
                v-model="phone"
                type="tel"
                placeholder="Ej. +34 600 000 000"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="shipping-address">Dirección de Envío</label>
              <input 
                id="shipping-address"
                v-model="address"
                type="text"
                placeholder="Calle, número, piso, puerta"
                class="form-input"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="shipping-city">Ciudad</label>
                <input 
                  id="shipping-city"
                  v-model="city"
                  type="text"
                  placeholder="Ej. Madrid"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label for="shipping-zip">Código Postal</label>
                <input 
                  id="shipping-zip"
                  v-model="zip"
                  type="text"
                  placeholder="Ej. 28001"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="shipping-country">País</label>
              <input 
                id="shipping-country"
                v-model="country"
                type="text"
                placeholder="Ej. España"
                class="form-input"
              />
            </div>

            <button 
              type="submit" 
              class="submit-btn green-btn" 
              :disabled="isSavingShipping"
            >
              <span class="material-symbols-outlined">local_shipping</span>
              {{ isSavingShipping ? 'Guardando...' : 'Guardar Datos de Envío' }}
            </button>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-profile-view {
  width: 100%;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.profile-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-card {
  background: white;
  border-radius: 1.5rem;
  padding: 1.8rem;
  box-shadow: 0 4px 20px rgba(26, 91, 130, 0.04);
}

.card-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
  margin-bottom: 1rem;
}

.form-help-text {
  font-size: 0.85rem;
  color: #7c8ba1;
  margin-bottom: 1.25rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* Avatar Live preview section */
.avatar-selector-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px dashed rgba(26, 91, 130, 0.08);
}

.avatar-preview {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  color: white;
  font-family: 'Fredoka', sans-serif;
  font-weight: 700;
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(26, 91, 130, 0.1);
  user-select: none;
  transition: background-color 0.3s ease;
}

.color-picker-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.picker-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #7c8ba1;
}

.colors-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.color-btn {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: transform 0.2s;
}

.color-btn:hover {
  transform: scale(1.15);
}

.color-btn.active {
  transform: scale(1.2);
  box-shadow: 0 0 0 2px var(--button-purple, #c58cf2);
}

/* Forms controls */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-blue, #1a5b82);
}

.form-input {
  border: 1px solid #e2e8f0;
  border-radius: 0.8rem;
  padding: 0.65rem 0.9rem;
  font-size: 0.92rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.form-input:focus {
  border-color: var(--button-purple, #c58cf2);
  box-shadow: 0 0 0 3px rgba(197, 140, 242, 0.15);
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--button-purple, #c58cf2);
  color: white;
  border: none;
  border-radius: 5rem;
  padding: 0.75rem 1.5rem;
  font-family: 'Fredoka', sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.22s ease;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.25);
  margin-top: 0.4rem;
}

.submit-btn:hover {
  background: var(--button-purple-hover, #b373e6);
  transform: translateY(-1px);
}

.submit-btn.outline {
  background: white;
  color: var(--button-purple, #c58cf2);
  border: 2px solid var(--button-purple, #c58cf2);
  box-shadow: none;
}

.submit-btn.outline:hover {
  background: var(--button-purple-soft, rgba(197, 140, 242, 0.08));
  transform: translateY(-1px);
}

.submit-btn.green-btn {
  background: #10b981;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
}

.submit-btn.green-btn:hover {
  background: #059669;
}

.password-error-alert {
  background: #fee2e2;
  color: #ef4444;
  font-size: 0.85rem;
  padding: 0.6rem 0.8rem;
  border-radius: 0.6rem;
  font-weight: 500;
}
</style>
