<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import { useRouter } from 'vue-router';
import api from '../services/api';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

// Estados locales
const activeTab = ref('datos'); // 'datos', 'recursos', 'pedidos'
const isEditing = ref(false);
const showPasswordForm = ref(true); // Se muestra por defecto en la pestaña de datos

// Campos de edición de datos personales
const editName = ref('');
const editAvatarColor = ref('#c58cf2'); // Color para iniciales
const isSavingProfile = ref(false);

// Campos de cambio de contraseña
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isChangingPassword = ref(false);
const passwordError = ref('');

// Carga de recursos guardados
const allResources = ref([]);
const savedResources = ref([]);
const isLoadingResources = ref(false);

// Historial de pedidos real del cartStore
const userOrders = computed(() => {
  if (!cartStore.orders || cartStore.orders.length === 0) return [];
  // Si el usuario está logueado, filtrar solo los suyos; si no, mostrar todos
  if (authStore.user) {
    return cartStore.orders.filter(o => o.userId === authStore.user.id || o.userId === null);
  }
  return cartStore.orders;
});

function fmtOrderDate(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtPrice(val) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
}
function orderStatusLabel(status) {
  const map = { preparing: 'En preparación', shipped: 'En camino', delivered: 'Entregado' };
  return map[status] || status;
}
function orderStatusClass(status) {
  const map = { preparing: 'status-preparing', shipped: 'status-shipped', delivered: 'status-delivered' };
  return map[status] || '';
}

// Cargar todos los recursos de la API y cruzarlos con los guardados del usuario
const fetchSavedResources = async () => {
  if (!authStore.user || !authStore.user.savedResources) return;
  isLoadingResources.value = true;
  try {
    const [recursosRes, blogRes] = await Promise.all([
      api.get('/recursos'),
      api.get('/blog')
    ]);

    // Mapear artículos de blog al formato de tarjeta de recursos
    const formattedBlog = blogRes.data.map(art => ({
      id: art.id,
      title: art.title,
      category: 'articulos',
      description: art.description,
      image: art.image,
      isBlog: true,
      slug: art.slug
    }));

    allResources.value = [...recursosRes.data, ...formattedBlog];
    syncSavedResources();
  } catch (error) {
    console.error('Error al obtener recursos para el perfil:', error);
  } finally {
    isLoadingResources.value = false;
  }
};

const syncSavedResources = () => {
  if (!authStore.user || !authStore.user.savedResources) {
    savedResources.value = [];
    return;
  }
  savedResources.value = allResources.value.filter(res => 
    authStore.user.savedResources.includes(res.id)
  );
};

// Formatear fecha de registro
const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  } catch {
    return isoString;
  }
};

// Activar edición de datos personales
const startEdit = () => {
  editName.value = authStore.user?.name || '';
  isEditing.value = true;
};

// Guardar datos personales editados
const saveProfile = async () => {
  if (!editName.value.trim()) return;
  isSavingProfile.value = true;
  
  // Generar nuevo avatar SVG basado en el nuevo nombre
  const response = await authStore.updateProfile({
    name: editName.value
  });
  
  isSavingProfile.value = false;
  if (response.success) {
    isEditing.value = false;
    triggerToast('Perfil actualizado con éxito.', 'success');
  } else {
    triggerToast(response.error || 'Error al actualizar el perfil.', 'error');
  }
};

// Cancelar edición de datos personales
const cancelEdit = () => {
  isEditing.value = false;
};

// Cambiar contraseña
const handlePasswordChange = async () => {
  passwordError.value = '';
  
  // Validaciones locales
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = 'Por favor, completa todos los campos.';
    return;
  }
  
  if (newPassword.value.length < 6) {
    passwordError.value = 'La nueva contraseña debe tener al menos 6 caracteres.';
    return;
  }
  
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Las contraseñas nuevas no coinciden.';
    return;
  }
  
  isChangingPassword.value = true;
  const result = await authStore.changePassword(
    currentPassword.value, 
    newPassword.value
  );
  isChangingPassword.value = false;
  
  if (result.success) {
    // Resetear formulario
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    triggerToast('Contraseña actualizada. Sesión cerrada en otros dispositivos.', 'success');
  } else {
    passwordError.value = result.error || 'Error al cambiar la contraseña.';
  }
};

// Eliminar un recurso guardado desde la pestaña de recursos
const removeSavedResource = async (resourceId) => {
  if (!authStore.user) return;
  
  const updatedList = authStore.user.savedResources.filter(id => id !== resourceId);
  const result = await authStore.updateProfile({
    savedResources: updatedList
  });
  
  if (result.success) {
    syncSavedResources();
    triggerToast('Recurso eliminado de tus guardados.', 'success');
  } else {
    triggerToast('No se pudo eliminar el recurso.', 'error');
  }
};

// Disparar toast global
const triggerToast = (message, type = 'success') => {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type }
  }));
};

// Redirecciones rápidas
const exploreResources = () => {
  router.push('/recursos');
};

const goToResourceDetail = (res) => {
  if (res.isBlog) {
    router.push(`/blog/${res.slug}`);
  } else {
    router.push(`/recursos/${res.id}`);
  }
};

onMounted(async () => {
  // Asegurar que tenemos los datos más recientes del usuario al cargar la página
  await authStore.me();
  await fetchSavedResources();
});
</script>

<template>
  <div class="perfil-page">
    <header class="page-header">
      <div class="header-content container">
        <h1 class="page-title">Mi Perfil</h1>
        <p class="page-subtitle">Gestiona tus datos personales, contraseña, pedidos y tus recursos guardados de Patitas.</p>
      </div>
      <div class="header-wave-bottom">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 28C480 56 960 0 1440 28L1440 56L0 56Z" fill="var(--page-bg, #f0f8ff)"/>
        </svg>
      </div>
    </header>

    <div class="perfil-container container">
      <!-- Encabezado del perfil -->
      <section v-if="authStore.user" class="perfil-header-card">
        <div class="profile-info-wrap">
          <!-- Avatar con iniciales o SVG -->
          <div class="profile-avatar-wrap">
            <div 
              v-if="authStore.user.avatar" 
              v-html="authStore.user.avatar" 
              class="avatar-svg-container"
            ></div>
            <div v-else class="avatar-initials">
              {{ authStore.initials }}
            </div>
          </div>
          
          <div class="profile-text-info">
            <div class="name-edit-row">
              <h1 v-if="!isEditing" class="profile-name">{{ authStore.user.name }}</h1>
              <div v-else class="name-edit-input-group">
                <input 
                  type="text" 
                  v-model="editName" 
                  class="edit-name-input" 
                  placeholder="Tu nombre completo"
                  maxlength="50"
                />
              </div>
            </div>
            
            <p class="profile-email">
              <span class="material-symbols-outlined icon-inline">mail</span>
              {{ authStore.user.email }}
            </p>
            
            <div class="profile-metadata">
              <span class="meta-badge role-badge">
                <span class="material-symbols-outlined">shield_person</span>
                {{ authStore.user.role === 'admin' ? 'Administrador' : 'Usuario Registrado' }}
              </span>
              <span class="meta-badge date-badge">
                <span class="material-symbols-outlined">calendar_today</span>
                Miembro desde: {{ formatDate(authStore.user.createdAt) }}
              </span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button v-if="!isEditing" @click="startEdit" class="btn-outline-edit">
            <span class="material-symbols-outlined">edit</span>
            Editar Datos
          </button>
          <div v-else class="edit-actions-group">
            <button @click="saveProfile" :disabled="isSavingProfile" class="btn-save-profile">
              <span class="material-symbols-outlined">check</span>
              {{ isSavingProfile ? 'Guardando...' : 'Guardar' }}
            </button>
            <button @click="cancelEdit" class="btn-cancel-profile">
              Cancelar
            </button>
          </div>
        </div>
      </section>

      <!-- Panel principal con pestañas -->
      <main class="perfil-main-panel">
        <!-- Navegación de pestañas -->
        <nav class="tabs-nav" aria-label="Navegación del perfil">
          <button 
            @click="activeTab = 'datos'"
            class="tab-btn"
            :class="{ active: activeTab === 'datos' }"
          >
            <span class="material-symbols-outlined">manage_accounts</span>
            Mis datos
          </button>
          <button 
            @click="activeTab = 'recursos'"
            class="tab-btn"
            :class="{ active: activeTab === 'recursos' }"
          >
            <span class="material-symbols-outlined">bookmark</span>
            Recursos guardados
            <span v-if="savedResources.length" class="tab-counter">{{ savedResources.length }}</span>
          </button>
          <button 
            @click="activeTab = 'pedidos'"
            class="tab-btn"
            :class="{ active: activeTab === 'pedidos' }"
          >
            <span class="material-symbols-outlined">local_mall</span>
            Mis pedidos
            <span class="tab-counter">{{ userOrders.length }}</span>
          </button>
        </nav>

        <!-- Contenido de las pestañas -->
        <div class="tab-content-area">
          
          <!-- PESTAÑA: MIS DATOS -->
          <Transition name="fade" mode="out-in">
            <div v-if="activeTab === 'datos'" class="tab-pane-datos">
              <div class="datos-layout">
                <!-- Información personal -->
                <div class="info-card">
                  <h3 class="card-subtitle">
                    <span class="material-symbols-outlined">assignment_ind</span>
                    Datos de la cuenta
                  </h3>
                  <div class="profile-details-list">
                    <div class="detail-item">
                      <span class="detail-label">Nombre completo</span>
                      <span class="detail-val">{{ authStore.user?.name }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Correo electrónico</span>
                      <span class="detail-val">{{ authStore.user?.email }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Tipo de cuenta</span>
                      <span class="detail-val uppercase">{{ authStore.user?.role }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Fecha de alta</span>
                      <span class="detail-val">{{ formatDate(authStore.user?.createdAt) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Formulario de cambio de contraseña -->
                <div class="password-change-card">
                  <h3 class="card-subtitle">
                    <span class="material-symbols-outlined">lock_reset</span>
                    Cambiar contraseña
                  </h3>
                  
                  <form @submit.prevent="handlePasswordChange" class="password-form">
                    <div class="form-group">
                      <label for="curr-pass">Contraseña actual</label>
                      <input 
                        type="password" 
                        id="curr-pass"
                        v-model="currentPassword" 
                        placeholder="••••••••" 
                        class="form-input" 
                      />
                    </div>
                    
                    <div class="form-group">
                      <label for="new-pass">Nueva contraseña</label>
                      <input 
                        type="password" 
                        id="new-pass"
                        v-model="newPassword" 
                        placeholder="Mínimo 6 caracteres" 
                        class="form-input" 
                      />
                    </div>
                    
                    <div class="form-group">
                      <label for="conf-pass">Confirmar nueva contraseña</label>
                      <input 
                        type="password" 
                        id="conf-pass"
                        v-model="confirmPassword" 
                        placeholder="Confirma la contraseña" 
                        class="form-input" 
                      />
                    </div>

                    <p v-if="passwordError" class="password-error-message">
                      <span class="material-symbols-outlined">error</span>
                      {{ passwordError }}
                    </p>

                    <button 
                      type="submit" 
                      :disabled="isChangingPassword" 
                      class="btn-submit-password"
                    >
                      <span class="material-symbols-outlined">vpn_key</span>
                      {{ isChangingPassword ? 'Cambiando...' : 'Actualizar contraseña' }}
                    </button>
                  </form>
                  <p class="password-note">
                    * Al actualizar tu contraseña, se cerrarán todas las demás sesiones activas en otros navegadores y dispositivos por seguridad.
                  </p>
                </div>
              </div>
            </div>
          </Transition>

          <!-- PESTAÑA: RECURSOS GUARDADOS -->
          <Transition name="fade" mode="out-in">
            <div v-if="activeTab === 'recursos'" class="tab-pane-recursos">
              <div v-if="isLoadingResources" class="loading-recursos">
                <div class="loader-spinner"></div>
                <p>Cargando recursos guardados...</p>
              </div>

              <div v-else>
                <!-- Si hay recursos guardados -->
                <div v-if="savedResources.length > 0" class="saved-resources-grid">
                  <div 
                    v-for="res in savedResources" 
                    :key="res.id" 
                    class="saved-resource-card"
                  >
                    <div class="res-card-image-wrap">
                      <img :src="res.image" :alt="res.title" class="res-img" />
                      <span class="res-category-badge" :class="res.category">
                        {{ res.category === 'articulos' ? 'Artículo' : res.category === 'guias' ? 'Guía' : res.category === 'videos' ? 'Video' : 'Centro' }}
                      </span>
                    </div>

                    <div class="res-card-content">
                      <h4 class="res-card-title">{{ res.title }}</h4>
                      <p class="res-card-desc">{{ res.description }}</p>
                      
                      <div class="res-card-actions">
                        <button 
                          @click="goToResourceDetail(res)" 
                          class="btn-res-read"
                        >
                          Leer recurso
                          <span class="material-symbols-outlined">arrow_forward</span>
                        </button>
                        <button 
                          @click="removeSavedResource(res.id)" 
                          class="btn-res-remove"
                          title="Eliminar de guardados"
                        >
                          <span class="material-symbols-outlined">bookmark_remove</span>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Si NO hay recursos guardados -->
                <div v-else class="empty-saved-resources">
                  <span class="material-symbols-outlined empty-icon">bookmark_border</span>
                  <h3>Aún no has guardado recursos</h3>
                  <p>Explora nuestro catálogo de guías, artículos y vídeos y guárdalos para acceder a ellos rápidamente en cualquier momento.</p>
                  <button @click="exploreResources" class="btn-explore-now">
                    ¡Explora la sección de recursos!
                  </button>
                </div>
              </div>
            </div>
          </Transition>

          <!-- PESTAÑA: MIS PEDIDOS -->
          <Transition name="fade" mode="out-in">
            <div v-if="activeTab === 'pedidos'" class="tab-pane-pedidos">
              <!-- Sin pedidos -->
              <div v-if="userOrders.length === 0" class="empty-orders">
                <span class="material-symbols-outlined empty-orders-icon">shopping_bag</span>
                <h3>Aún no tienes pedidos</h3>
                <p>Cuando realices una compra, aquí aparecerá el historial de tus pedidos.</p>
                <RouterLink to="/tienda" class="go-shop-link">Ir a la tienda</RouterLink>
              </div>

              <div v-else class="orders-list">
                <div 
                  v-for="order in userOrders" 
                  :key="order.id" 
                  class="order-card"
                >
                  <!-- Cabecera del pedido -->
                  <div class="order-card-header">
                    <div class="order-header-main">
                      <span class="order-id">Pedido {{ order.id }}</span>
                      <span class="order-date">{{ fmtOrderDate(order.createdAt) }}</span>
                    </div>
                    <div class="order-header-status">
                      <span class="status-badge" :class="orderStatusClass(order.status)">
                        <span class="material-symbols-outlined badge-dot">check_circle</span>
                        {{ orderStatusLabel(order.status) }}
                      </span>
                    </div>
                  </div>

                  <!-- Detalles del pedido -->
                  <div class="order-card-body">
                    <ul class="order-items-list">
                      <li 
                        v-for="(item, idx) in order.items" 
                        :key="idx" 
                        class="order-item-row"
                      >
                        <span class="item-name-qty">
                          <span class="item-qty">{{ item.quantity }}x</span>
                          {{ item.name }}
                        </span>
                        <span class="item-price">{{ fmtPrice(item.subtotal) }}</span>
                      </li>
                    </ul>
                  </div>

                  <!-- Pie del pedido -->
                  <div class="order-card-footer">
                    <span class="footer-label">Total del Pedido:</span>
                    <span class="footer-total">{{ fmtPrice(order.total) }}</span>
                    <RouterLink :to="{ name: 'pedido', params: { id: order.id } }" class="track-order-btn">
                      <span class="material-symbols-outlined">local_shipping</span>
                      Ver estado
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </Transition>

        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.perfil-page {
  background-color: var(--page-bg, #f0f8ff);
  min-height: 90vh;
  padding-bottom: 5rem;
  font-family: 'Fredoka', sans-serif;
  color: var(--text-blue);
}

.page-header {
  background-image: url('../assets/fondo_azul.png');
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 4.5rem 0 5.5rem;
  text-align: center;
  margin-bottom: 3rem;
}

.header-wave-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3.11rem;
  z-index: 2;
}

.header-wave-bottom svg {
  width: 100%;
  height: 100%;
  display: block;
}

.page-title {
  font-family: 'Fredoka', sans-serif;
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--text-blue);
  margin-bottom: 0.75rem;
}

.page-subtitle {
  font-size: 1.05rem;
  color: var(--text-blue);
  opacity: 0.85;
  max-width: 38rem;
  margin: 0 auto;
  line-height: 1.6;
}

.perfil-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Tarjeta Encabezado */
.perfil-header-card {
  background: white;
  border-radius: 1.5rem;
  padding: 2.2rem;
  border: 1px solid rgba(26, 91, 130, 0.05);
  box-shadow: 0 8px 24px rgba(26, 91, 130, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.profile-info-wrap {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.profile-avatar-wrap {
  width: 6.5rem;
  height: 6.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(197, 140, 242, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(197, 140, 242, 0.15);
  border: 3px solid white;
}

.avatar-svg-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-svg-container :deep(svg) {
  width: 100%;
  height: 100%;
}

.avatar-initials {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--button-purple);
}

.profile-text-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.name-edit-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-blue);
}

.name-edit-input-group {
  display: flex;
}

.edit-name-input {
  font-family: 'Fredoka', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-blue);
  border: 1.5px solid var(--button-purple);
  border-radius: 0.5rem;
  padding: 0.25rem 0.75rem;
  outline: none;
  background: rgba(197, 140, 242, 0.03);
}

.profile-email {
  font-size: 1rem;
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.icon-inline {
  font-size: 1.1rem;
  color: var(--button-purple);
}

.profile-metadata {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 0.3rem;
  flex-wrap: wrap;
}

.meta-badge {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.7rem;
  border-radius: 5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.meta-badge span {
  font-size: 0.95rem;
}

.role-badge {
  background-color: #e3f2fd;
  color: #1976d2;
}

.date-badge {
  background-color: #f7fafc;
  color: #4a5568;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Acciones del encabezado */
.header-actions {
  display: flex;
  align-items: center;
}

.btn-outline-edit {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  background: white;
  border: 1.5px solid var(--button-purple);
  color: var(--button-purple);
  padding: 0.6rem 1.2rem;
  border-radius: 5.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.btn-outline-edit:hover {
  background: rgba(197, 140, 242, 0.05);
  box-shadow: 0 4px 10px rgba(197, 140, 242, 0.1);
}

.edit-actions-group {
  display: flex;
  gap: 0.6rem;
}

.btn-save-profile {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  background: var(--button-purple);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 5.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 4px 10px rgba(197, 140, 242, 0.25);
  transition: all 0.2s;
}

.btn-save-profile:hover {
  background: var(--button-purple-hover);
}

.btn-cancel-profile {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  background: #edf2f7;
  color: #4a5568;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 5.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-profile:hover {
  background: #e2e8f0;
}

/* Panel Principal de Pestañas */
.perfil-main-panel {
  background: white;
  border-radius: 1.5rem;
  border: 1px solid rgba(26, 91, 130, 0.05);
  box-shadow: 0 8px 24px rgba(26, 91, 130, 0.04);
  overflow: hidden;
}

.tabs-nav {
  display: flex;
  background-color: #f7fafc;
  border-bottom: 1px solid rgba(26, 91, 130, 0.08);
}

.tab-btn {
  flex-grow: 1;
  font-family: 'Fredoka', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-blue);
  opacity: 0.7;
  padding: 1.2rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  transition: all 0.25s ease;
}

.tab-btn span.material-symbols-outlined {
  font-size: 1.3rem;
}

.tab-btn:hover {
  opacity: 1;
  background-color: rgba(26, 91, 130, 0.02);
}

.tab-btn.active {
  opacity: 1;
  color: var(--button-purple);
  background-color: white;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--button-purple);
  border-radius: 3px 3px 0 0;
}

.tab-counter {
  background: rgba(197, 140, 242, 0.15);
  color: var(--button-purple);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 5rem;
}

/* Área de contenido de pestañas */
.tab-content-area {
  padding: 2.5rem;
}

/* PESTAÑA: MIS DATOS */
.datos-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

@media (max-width: 768px) {
  .datos-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .perfil-header-card {
    flex-direction: column;
    align-items: flex-start;
  }
  .profile-info-wrap {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

.info-card, .password-change-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-subtitle {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-blue);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-subtitle span {
  color: var(--button-purple);
  font-size: 1.5rem;
}

.profile-details-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(26, 91, 130, 0.05);
  padding-bottom: 0.75rem;
}

.detail-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-label {
  font-size: 0.9rem;
  opacity: 0.7;
}

.detail-val {
  font-weight: 600;
  color: var(--text-blue);
}

.uppercase {
  text-transform: uppercase;
}

/* Formulario contraseña */
.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.85;
}

.form-input {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  border: 1.5px solid rgba(26, 91, 130, 0.15);
  border-radius: 0.75rem;
  padding: 0.65rem 1rem;
  outline: none;
  background-color: white;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--button-purple);
  box-shadow: 0 0 0 3px rgba(197, 140, 242, 0.15);
}

.password-error-message {
  color: #e53e3e;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.password-error-message span {
  font-size: 1.1rem;
}

.btn-submit-password {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  background: white;
  border: 1.5px solid var(--button-purple);
  color: var(--button-purple);
  padding: 0.7rem 1.2rem;
  border-radius: 5.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.btn-submit-password:hover {
  background: rgba(197, 140, 242, 0.05);
  box-shadow: 0 4px 10px rgba(197, 140, 242, 0.1);
}

.password-note {
  font-size: 0.78rem;
  opacity: 0.6;
  line-height: 1.4;
}

/* PESTAÑA: RECURSOS GUARDADOS */
.loading-recursos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 15rem;
  gap: 1rem;
  opacity: 0.7;
}

.loader-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid rgba(197, 140, 242, 0.15);
  border-top-color: var(--button-purple);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.saved-resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.saved-resource-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid rgba(26, 91, 130, 0.05);
  box-shadow: 0 4px 15px rgba(26, 91, 130, 0.02);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.saved-resource-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(26, 91, 130, 0.06);
}

.res-card-image-wrap {
  height: 9.5rem;
  overflow: hidden;
  position: relative;
  background-color: #f7fafc;
}

.res-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.res-category-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.res-category-badge.articulos { background-color: #c58cf2; }
.res-category-badge.guias { background-color: #5bbfd6; }
.res-category-badge.videos { background-color: #f09dc0; }
.res-category-badge.centros { background-color: #a78bfa; }

.res-card-content {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 0.6rem;
}

.res-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-blue);
  line-height: 1.35;
}

.res-card-desc {
  font-size: 0.85rem;
  opacity: 0.8;
  line-height: 1.45;
  margin-bottom: 0.8rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.res-card-actions {
  margin-top: auto;
  display: flex;
  gap: 0.5rem;
}

.btn-res-read {
  flex-grow: 1;
  font-family: 'Fredoka', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(197, 140, 242, 0.08);
  color: var(--button-purple);
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  transition: all 0.2s;
}

.btn-res-read:hover {
  background: var(--button-purple);
  color: white;
}

.btn-res-read span {
  font-size: 0.95rem;
}

.btn-res-remove {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  background: white;
  border: 1px solid rgba(229, 62, 62, 0.4);
  color: #e53e3e;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
}

.btn-res-remove:hover {
  background: #fff5f5;
  border-color: #e53e3e;
}

.btn-res-remove span {
  font-size: 1rem;
}

/* Estado vacío recursos */
.empty-saved-resources {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  text-align: center;
  gap: 1rem;
  max-width: 32rem;
  margin: 0 auto;
}

.empty-icon {
  font-size: 3.5rem;
  color: var(--button-purple);
  opacity: 0.5;
}

.empty-saved-resources h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-blue);
}

.empty-saved-resources p {
  font-size: 0.92rem;
  opacity: 0.75;
  line-height: 1.5;
}

.btn-explore-now {
  font-family: 'Fredoka', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  background: var(--button-purple);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(197, 140, 242, 0.35);
  margin-top: 0.5rem;
  transition: all 0.2s;
}

.btn-explore-now:hover {
  background: var(--button-purple-hover);
  transform: translateY(-1px);
}

/* PESTAÑA: MIS PEDIDOS */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid rgba(26, 91, 130, 0.06);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(26, 91, 130, 0.02);
}

.order-card-header {
  background-color: #f7fafc;
  border-bottom: 1px solid rgba(26, 91, 130, 0.06);
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.order-header-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.order-id {
  font-weight: 700;
  color: var(--text-blue);
  font-size: 1.05rem;
}

.order-date {
  font-size: 0.85rem;
  opacity: 0.7;
}

.status-badge {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background-color: #e6fffa;
  color: #234e52;
  border: 1px solid #b2f5ea;
}

.badge-dot {
  font-size: 1rem;
  color: #319795;
}

.order-card-body {
  padding: 1.5rem;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.order-item-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  align-items: center;
}

.item-name-qty {
  opacity: 0.85;
}

.item-qty {
  font-weight: 700;
  color: var(--button-purple);
  margin-right: 0.4rem;
}

.item-price {
  font-weight: 600;
  color: var(--text-blue);
}

.order-card-footer {
  border-top: 1px dashed rgba(26, 91, 130, 0.08);
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.8rem;
}

.footer-label {
  font-size: 0.9rem;
  opacity: 0.7;
  font-weight: 500;
}

.footer-total {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-blue);
}

/* Track order button */
.track-order-btn {
  display: inline-flex; align-items: center; gap: .4rem;
  background: rgba(197, 140, 242, 0.1); color: #c58cf2;
  padding: .4rem .9rem; border-radius: 5rem;
  font-family: 'Fredoka', sans-serif; font-size: .85rem; font-weight: 700;
  text-decoration: none; transition: all .2s; margin-left: auto;
}
.track-order-btn:hover { background: #c58cf2; color: white; }
.track-order-btn .material-symbols-outlined { font-size: 1rem; }

/* Status badges */
.status-preparing { background: rgba(251,191,36,.12); color: #d97706; border-color: rgba(251,191,36,.3); }
.status-shipped { background: rgba(59,130,246,.1); color: #2563eb; border-color: rgba(59,130,246,.2); }

/* Empty orders state */
.empty-orders {
  display: flex; flex-direction: column; align-items: center;
  gap: 1rem; padding: 3rem 1rem; text-align: center;
}
.empty-orders-icon { font-size: 3.5rem; color: #c58cf2; }
.empty-orders h3 { font-size: 1.3rem; font-weight: 700; }
.empty-orders p { font-size: .9rem; opacity: .7; }
.go-shop-link {
  background: #c58cf2; color: white; padding: .7rem 1.5rem;
  border-radius: 5rem; font-family: 'Fredoka', sans-serif;
  font-size: .95rem; font-weight: 700; text-decoration: none;
  transition: all .22s;
}
.go-shop-link:hover { background: #b373e6; }

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
