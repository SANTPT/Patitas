<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

// Personal details
const name = ref('');
const email = ref('');
const selectedColor = ref('#c58cf2');
const isSavingProfile = ref(false);

// Password
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isChangingPassword = ref(false);
const passwordError = ref('');
const isSavingShipping = ref(false);

// Diálogo eliminar
const showDeleteConfirm = ref(false);

const role = computed(() => authStore.user?.role || 'user');

const colors = ['#c58cf2','#5bbfd6','#f6ad55','#fc8181','#4fd1c5','#68d391','#63b3ed'];

const initials = computed(() => {
  if (!name.value) return '?';
  const parts = name.value.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
});

// ── Direcciones de envío ──────────────────────────────────────────────────────
const addresses = ref([]);

const emptyAddr = () => ({ tag: 'Casa', phone: '', address: '', city: '', zip: '', country: 'España', isDefault: false });
const newAddr = ref(emptyAddr());

onMounted(() => {
  if (authStore.user) {
    name.value  = authStore.user.name  || '';
    email.value = authStore.user.email || '';
    addresses.value = JSON.parse(JSON.stringify(authStore.user.shippingAddresses || []));

    const avatarStr = authStore.user.avatar || '';
    const fillMatch = avatarStr.match(/fill='([^']+)'/);
    if (fillMatch) {
      const dec = decodeURIComponent(fillMatch[1]);
      if (colors.includes(dec)) selectedColor.value = dec;
    }
  }
});

function generateAvatarString() {
  const init = initials.value;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='${selectedColor.value.replace('#','%23')}'/><text x='50%' y='55%' font-family='sans-serif' font-size='40' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'>${init}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

async function handleSaveProfile() {
  if (!name.value.trim()) { triggerToast('El nombre no puede estar vacío.', 'error'); return; }
  isSavingProfile.value = true;
  const result = await authStore.updateProfile({ name: name.value, email: email.value, avatar: generateAvatarString() });
  isSavingProfile.value = false;
  triggerToast(result.success ? 'Perfil actualizado con éxito.' : result.error || 'Error.', result.success ? 'success' : 'error');
}

async function handleSavePassword() {
  passwordError.value = '';
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) { passwordError.value = 'Completa todos los campos.'; return; }
  if (newPassword.value !== confirmPassword.value) { passwordError.value = 'Las contraseñas no coinciden.'; return; }
  isChangingPassword.value = true;
  const result = await authStore.changePassword(currentPassword.value, newPassword.value);
  isChangingPassword.value = false;
  if (result.success) { currentPassword.value = ''; newPassword.value = ''; confirmPassword.value = ''; triggerToast('Contraseña cambiada.', 'success'); }
  else { passwordError.value = result.error || 'Error al cambiar la contraseña.'; }
}

// ── Lógica de direcciones ─────────────────────────────────────────────────────
async function saveAddresses() {
  isSavingShipping.value = true;
  const result = await authStore.updateShippingAddresses(addresses.value);
  isSavingShipping.value = false;
  triggerToast(result.success ? 'Dirección guardada.' : result.error || 'Error.', result.success ? 'success' : 'error');
}

async function handleAddAddress() {
  if (addresses.value.length >= 3) return;
  const addr = { ...newAddr.value };
  // Si es la primera o se marcó como predeterminada, quitar el default de las demás
  if (addr.isDefault || addresses.value.length === 0) {
    addresses.value.forEach(a => a.isDefault = false);
    addr.isDefault = true;
  }
  addresses.value.push(addr);
  newAddr.value = emptyAddr();
  await saveAddresses();
}

async function removeAddress(idx) {
  const wasDefault = addresses.value[idx].isDefault;
  addresses.value.splice(idx, 1);
  // Si eliminamos la predeterminada, marcar la primera como predeterminada
  if (wasDefault && addresses.value.length > 0) addresses.value[0].isDefault = true;
  await saveAddresses();
}

async function setDefault(idx) {
  addresses.value.forEach((a, i) => a.isDefault = i === idx);
  await saveAddresses();
}

async function handleDeleteAll() {
  isSavingShipping.value = true;
  const result = await authStore.deleteShippingAddresses();
  isSavingShipping.value = false;
  if (result.success) {
    addresses.value = [];
    showDeleteConfirm.value = false;
    triggerToast('Datos de compra eliminados.', 'success');
  } else {
    triggerToast(result.error || 'Error al eliminar.', 'error');
  }
}

function triggerToast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
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
        <!-- Badge SSL -->
        <div class="ssl-badge">
          <span class="material-symbols-outlined ssl-icon">lock</span>
          <div>
            <strong>Datos protegidos con cifrado SSL</strong>
            <p>Los datos de tarjeta nunca se almacenan en nuestros servidores. Se procesan de forma segura a través de nuestra pasarela de pago.</p>
          </div>
        </div>

        <!-- ── Métodos de Pago ── -->
        <section class="profile-card">
          <div class="card-title-row">
            <h3 class="card-title">Métodos de Pago</h3>
            <span class="material-symbols-outlined card-title-icon">credit_card</span>
          </div>
          <p class="form-help-text">Formas de pago aceptadas al realizar tus pedidos en la tienda.</p>

          <div class="payment-methods-list">
            <!-- Tarjeta -->
            <div class="payment-method-item">
              <div class="pm-icon-wrap pm-card">
                <span class="material-symbols-outlined">credit_card</span>
              </div>
              <div class="pm-info">
                <span class="pm-name">Tarjeta de crédito / débito</span>
                <div class="pm-logos">
                  <span class="card-logo visa">VISA</span>
                  <span class="card-logo mc">MC</span>
                  <span class="card-logo amex">AMEX</span>
                </div>
                <span class="pm-desc">Pago seguro con cifrado 3D Secure. Sin comisiones.</span>
              </div>
              <span class="pm-badge active-badge">Disponible</span>
            </div>

            <!-- PayPal -->
            <div class="payment-method-item">
              <div class="pm-icon-wrap pm-paypal">
                <span class="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <div class="pm-info">
                <span class="pm-name">PayPal</span>
                <span class="pm-desc">Pago rápido y protegido sin introducir datos de tarjeta.</span>
              </div>
              <span class="pm-badge active-badge">Disponible</span>
            </div>

            <!-- Transferencia -->
            <div class="payment-method-item pm-inactive">
              <div class="pm-icon-wrap pm-transfer">
                <span class="material-symbols-outlined">receipt_long</span>
              </div>
              <div class="pm-info">
                <span class="pm-name">Transferencia bancaria</span>
                <span class="pm-desc">Pago directo desde tu banco. En desarrollo.</span>
              </div>
              <span class="pm-badge soon-badge">Próximamente</span>
            </div>
          </div>

          <div class="payment-security-footer">
            <span class="material-symbols-outlined sec-icon">verified_user</span>
            <span>Nunca almacenamos datos de tu tarjeta. Todos los pagos son procesados de forma segura.</span>
          </div>
        </section>

        <!-- Direcciones guardadas -->
        <section class="profile-card">
          <div class="addresses-header">
            <h3 class="card-title">Direcciones de Envío</h3>
            <span class="addr-count">{{ addresses.length }}/3</span>
          </div>
          <p class="form-help-text">Guarda hasta 3 direcciones para agilizar tus compras.</p>

          <!-- Lista de direcciones existentes -->
          <div v-if="addresses.length > 0" class="addresses-list">
            <div v-for="(addr, idx) in addresses" :key="idx" class="address-item" :class="{ 'is-default': addr.isDefault }">
              <div class="addr-top">
                <div class="addr-label-group">
                  <span class="addr-tag-icon">{{ addr.tag === 'Casa' ? '🏠' : addr.tag === 'Trabajo' ? '💼' : '📍' }}</span>
                  <span class="addr-tag">{{ addr.tag }}</span>
                  <span v-if="addr.isDefault" class="default-chip">Predeterminada</span>
                </div>
                <div class="addr-actions">
                  <button type="button" class="addr-action-btn star" @click="setDefault(idx)" :title="addr.isDefault ? 'Ya es predeterminada' : 'Marcar como predeterminada'" :disabled="addr.isDefault">
                    <span class="material-symbols-outlined">{{ addr.isDefault ? 'star' : 'star_border' }}</span>
                  </button>
                  <button type="button" class="addr-action-btn remove" @click="removeAddress(idx)" title="Eliminar dirección">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
              <p class="addr-text">{{ addr.address }}, {{ addr.city }} {{ addr.zip }}, {{ addr.country }}</p>
              <p v-if="addr.phone" class="addr-phone">📞 {{ addr.phone }}</p>
            </div>
          </div>

          <!-- Formulario de nueva dirección -->
          <div v-if="addresses.length < 3" class="new-addr-form">
            <h4 class="new-addr-title">
              <span class="material-symbols-outlined">add_location_alt</span>
              {{ addresses.length === 0 ? 'Añadir primera dirección' : 'Añadir otra dirección' }}
            </h4>
            <form @submit.prevent="handleAddAddress" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Etiqueta</label>
                  <select v-model="newAddr.tag" class="form-input" id="addr-tag">
                    <option>Casa</option>
                    <option>Trabajo</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="addr-phone">Teléfono</label>
                  <input id="addr-phone" v-model="newAddr.phone" type="tel" placeholder="+34 600 000 000" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label for="addr-street">Dirección *</label>
                <input id="addr-street" v-model="newAddr.address" type="text" required placeholder="Calle, número, piso" class="form-input" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="addr-city">Ciudad *</label>
                  <input id="addr-city" v-model="newAddr.city" type="text" required placeholder="Ej. Madrid" class="form-input" />
                </div>
                <div class="form-group">
                  <label for="addr-zip">C.P. *</label>
                  <input id="addr-zip" v-model="newAddr.zip" type="text" required placeholder="28001" maxlength="5" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label for="addr-country">País *</label>
                <input id="addr-country" v-model="newAddr.country" type="text" required placeholder="España" class="form-input" />
              </div>
              <div class="form-group checkbox-inline">
                <label class="checkbox-label-inline">
                  <input type="checkbox" v-model="newAddr.isDefault" />
                  Establecer como predeterminada
                </label>
              </div>
              <button type="submit" class="submit-btn green-btn" :disabled="isSavingShipping">
                <span class="material-symbols-outlined">save_location</span>
                {{ isSavingShipping ? 'Guardando...' : 'Guardar dirección' }}
              </button>
            </form>
          </div>
          <p v-else class="max-reached">Máximo de 3 direcciones alcanzado. Elimina una para añadir otra.</p>

          <!-- Botón eliminar todo -->
          <div v-if="addresses.length > 0" class="delete-all-wrap">
            <button type="button" class="delete-all-btn" @click="showDeleteConfirm = true" id="delete-all-addresses-btn">
              <span class="material-symbols-outlined">delete_forever</span>
              Eliminar todos mis datos de compra
            </button>
          </div>
        </section>
      </div>

      <!-- Diálogo de confirmación de eliminación -->
      <Transition name="overlay-fade">
        <div v-if="showDeleteConfirm" class="confirm-overlay" @click.self="showDeleteConfirm = false">
          <div class="confirm-dialog" role="dialog" aria-modal="true">
            <span class="material-symbols-outlined confirm-icon">warning</span>
            <h3>¿Eliminar todos los datos de envío?</h3>
            <p>Esta acción borrará todas tus direcciones guardadas y no se puede deshacer.</p>
            <div class="confirm-actions">
              <button class="confirm-btn cancel" @click="showDeleteConfirm = false">Cancelar</button>
              <button class="confirm-btn danger" @click="handleDeleteAll" :disabled="isSavingShipping" id="confirm-delete-btn">
                {{ isSavingShipping ? 'Eliminando...' : 'Sí, eliminar todo' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
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
/* ── SSL Badge ── */
.ssl-badge {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1.5px solid #86efac;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 0.5rem;
}
.ssl-icon { font-size: 1.6rem; color: #16a34a; flex-shrink: 0; margin-top: 0.1rem; }
.ssl-badge strong { font-size: 0.9rem; font-weight: 700; color: #15803d; display: block; margin-bottom: 0.2rem; }
.ssl-badge p { font-size: 0.8rem; color: #166534; line-height: 1.4; margin: 0; }

/* ── Addresses ── */
.addresses-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem; }
.addr-count { font-family: 'Fredoka', sans-serif; font-size: 0.85rem; font-weight: 600; color: var(--button-purple, #c58cf2); background: rgba(197,140,242,0.1); padding: 0.2rem 0.65rem; border-radius: 5rem; }

.addresses-list { display: flex; flex-direction: column; gap: 0.75rem; margin: 1rem 0; }

.address-item {
  border: 1.5px solid rgba(26,91,130,0.08);
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  transition: border-color 0.2s ease;
  background: #fafbfc;
}
.address-item.is-default { border-color: rgba(197,140,242,0.35); background: rgba(197,140,242,0.04); }

.addr-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; }
.addr-label-group { display: flex; align-items: center; gap: 0.4rem; }
.addr-tag-icon { font-size: 1rem; }
.addr-tag { font-family: 'Fredoka', sans-serif; font-size: 0.9rem; font-weight: 700; color: var(--text-blue, #1a5b82); }
.default-chip { font-size: 0.68rem; font-weight: 700; color: #7c3aed; background: #f3e8ff; padding: 0.15rem 0.5rem; border-radius: 5rem; text-transform: uppercase; letter-spacing: 0.04em; }

.addr-actions { display: flex; gap: 0.3rem; }
.addr-action-btn {
  background: none; border: none; cursor: pointer; border-radius: 0.5rem;
  padding: 0.25rem; display: flex; align-items: center; transition: all 0.18s ease;
}
.addr-action-btn .material-symbols-outlined { font-size: 1.1rem; }
.addr-action-btn.star .material-symbols-outlined { color: #f59e0b; }
.addr-action-btn.star:hover { background: #fef3c7; }
.addr-action-btn.star:disabled { opacity: 0.45; cursor: default; }
.addr-action-btn.remove .material-symbols-outlined { color: #ef4444; }
.addr-action-btn.remove:hover { background: #fef2f2; }

.addr-text { font-size: 0.85rem; color: #475569; margin: 0; }
.addr-phone { font-size: 0.8rem; color: #7c8ba1; margin: 0.2rem 0 0; }

/* ── New address form ── */
.new-addr-form { margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px dashed rgba(26,91,130,0.1); }
.new-addr-title { display: flex; align-items: center; gap: 0.45rem; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 700; color: var(--text-blue, #1a5b82); margin: 0 0 1rem; }
.new-addr-title .material-symbols-outlined { font-size: 1.1rem; color: var(--button-purple, #c58cf2); }

.max-reached { font-size: 0.82rem; color: #7c8ba1; text-align: center; margin-top: 1rem; font-style: italic; }

.checkbox-inline { margin-top: 0.25rem; }
.checkbox-label-inline { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; font-weight: 500; color: var(--text-blue, #1a5b82); cursor: pointer; }
.checkbox-label-inline input { accent-color: var(--button-purple, #c58cf2); width: 1rem; height: 1rem; cursor: pointer; }

/* ── Delete all ── */
.delete-all-wrap { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed rgba(239,68,68,0.2); text-align: center; }
.delete-all-btn {
  background: none; border: 1.5px dashed rgba(239,68,68,0.35); color: #ef4444;
  padding: 0.55rem 1.25rem; border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.4rem; transition: all 0.2s ease;
}
.delete-all-btn:hover { background: #fef2f2; border-style: solid; }
.delete-all-btn .material-symbols-outlined { font-size: 1.05rem; }

/* ── Confirm dialog ── */
.confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
  z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.confirm-dialog {
  background: white; border-radius: 1.5rem; padding: 2.5rem 2rem;
  max-width: 24rem; width: 100%; text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex; flex-direction: column; align-items: center; gap: 0.85rem;
}
.confirm-icon { font-size: 3rem; color: #f59e0b; }
.confirm-dialog h3 { font-family: 'Fredoka', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--text-blue, #1a5b82); margin: 0; }
.confirm-dialog p { font-size: 0.88rem; color: #7c8ba1; line-height: 1.5; margin: 0; }
.confirm-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; width: 100%; }
.confirm-btn { flex: 1; padding: 0.7rem; border-radius: 5rem; font-family: 'Fredoka', sans-serif; font-size: 0.95rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s ease; }
.confirm-btn.cancel { background: #f1f5f9; color: var(--text-blue, #1a5b82); }
.confirm-btn.cancel:hover { background: #e2e8f0; }
.confirm-btn.danger { background: #ef4444; color: white; }
.confirm-btn.danger:hover:not(:disabled) { background: #dc2626; }
.confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Transition ── */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.2s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }

/* ── Payment Methods ── */
.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}
.card-title-icon {
  font-size: 1.5rem;
  color: var(--button-purple, #c58cf2);
  background: rgba(197,140,242,0.1);
  padding: 0.4rem;
  border-radius: 0.6rem;
}

.payment-methods-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.payment-method-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1.5px solid rgba(26,91,130,0.08);
  border-radius: 1rem;
  background: #fafbfc;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.payment-method-item:not(.pm-inactive):hover {
  border-color: rgba(197,140,242,0.3);
  box-shadow: 0 2px 12px rgba(197,140,242,0.1);
}
.payment-method-item.pm-inactive {
  opacity: 0.6;
}

.pm-icon-wrap {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pm-icon-wrap .material-symbols-outlined { font-size: 1.4rem; }
.pm-card    { background: #e0f2fe; color: #0284c7; }
.pm-card .material-symbols-outlined { color: #0284c7; }
.pm-paypal  { background: #e8f4fd; color: #003087; }
.pm-paypal .material-symbols-outlined { color: #009cde; }
.pm-transfer { background: #f3e8ff; color: #7c3aed; }
.pm-transfer .material-symbols-outlined { color: #7c3aed; }

.pm-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.pm-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-blue, #1a5b82);
}
.pm-desc {
  font-size: 0.78rem;
  color: #7c8ba1;
  line-height: 1.4;
}
.pm-logos {
  display: flex;
  gap: 0.35rem;
  margin: 0.15rem 0;
}

.card-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  padding: 0.15rem 0.45rem;
  border-radius: 0.35rem;
  border: 1.5px solid currentColor;
  line-height: 1;
}
.card-logo.visa  { color: #1a1f71; border-color: #1a1f71; background: #f0f1fa; }
.card-logo.mc    { color: #eb001b; border-color: #eb001b; background: #fff0f0; }
.card-logo.amex  { color: #007bc1; border-color: #007bc1; background: #e8f4fd; }

.pm-badge {
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 5rem;
  white-space: nowrap;
}
.active-badge {
  background: #d1fae5;
  color: #065f46;
}
.soon-badge {
  background: #fef3c7;
  color: #92400e;
}

.payment-security-footer {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border: 1.5px solid #86efac;
  border-radius: 0.8rem;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #166534;
  line-height: 1.4;
}
.sec-icon {
  font-size: 1.1rem;
  color: #16a34a;
  flex-shrink: 0;
  margin-top: 0.05rem;
}
</style>
