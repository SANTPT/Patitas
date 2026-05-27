import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

/**
 * Store global de autenticación — FE-13
 * Centraliza el estado de sesión del usuario para toda la aplicación.
 * En fases futuras conectará con el endpoint real POST /api/auth/login.
 */
export const useAuthStore = defineStore('auth', () => {
  // ── State ─────────────────────────────────────────────────────────────────
  /** Token JWT de sesión (null si no hay sesión activa) */
  const token = ref(localStorage.getItem('patitas_token') || null);

  /** Datos del usuario autenticado */
  const user = ref((() => {
    try {
      const saved = localStorage.getItem('patitas_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })());

  /** Estado de carga durante operaciones async */
  const isLoading = ref(false);

  /** Mensaje de error de la última operación */
  const error = ref(null);

  // ── Getters ───────────────────────────────────────────────────────────────
  /** true si hay un token de sesión activo */
  const isAuthenticated = computed(() => !!token.value);

  /** Nombre visible del usuario (nombre completo o email como fallback) */
  const displayName = computed(() =>
    user.value?.name || user.value?.email?.split('@')[0] || 'Usuario'
  );

  /** true si el rol del usuario es admin o superadmin */
  const isAdmin = computed(() =>
    ['admin', 'superadmin'].includes(user.value?.role)
  );

  /** Iniciales del usuario para el avatar */
  const initials = computed(() => {
    if (!user.value?.name) return '?';
    return user.value.name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Inicia sesión con email y contraseña.
   * Conecta con POST /auth/login.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function login(email, password) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = response.data;

      // Guardar en estado y persistir en localStorage
      _setSession(newToken, newUser);

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Cierra la sesión del usuario actual.
   * Limpia el estado y localStorage, y elimina el token.
   */
  function logout() {
    _clearSession();
  }

  /**
   * Recupera los datos del usuario actual desde la API usando el token guardado.
   * Llamar al arranque de la app para restaurar sesión si existe token.
   * @returns {Promise<void>}
   */
  async function me() {
    if (!token.value) return;

    isLoading.value = true;
    try {
      const response = await api.get('/auth/me');
      user.value = response.data.user;
      localStorage.setItem('patitas_user', JSON.stringify(user.value));
    } catch {
      // Token expirado o inválido — limpiar sesión
      _clearSession();
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Registra un nuevo usuario con nombre, email y contraseña.
   * Conecta con POST /auth/register.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function register(name, email, password, childName) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post('/auth/register', { name, email, password, childName });
      const { token: newToken, user: newUser } = response.data;

      // Guardar en estado y persistir
      _setSession(newToken, newUser);

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al registrarse. Inténtalo de nuevo.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Inicia sesión o registra mediante un proveedor OAuth (Google, Facebook, Apple).
   * @param {string} provider
   * @param {string} email
   * @returns {Promise<{success: boolean}>}
   */
  async function loginOAuth(provider, email = '') {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post('/auth/oauth', { provider, email });
      const { token: newToken, user: newUser } = response.data;

      _setSession(newToken, newUser);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al iniciar sesión social.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Actualiza el perfil del usuario (nombre, avatar, recursos guardados).
   * @param {Object} updatedData
   * @returns {Promise<{success: boolean, error?: string, user?: Object}>}
   */
  async function updateProfile(updatedData) {
    if (!user.value) return { success: false, error: 'Usuario no autenticado' };
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.patch(`/usuarios/${user.value.id}`, updatedData);
      const updatedUser = response.data.user;

      // Actualizar en estado local y persistir
      user.value = updatedUser;
      localStorage.setItem('patitas_user', JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar el perfil. Inténtalo de nuevo.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Cambia la contraseña del usuario tras validar la actual.
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function changePassword(currentPassword, newPassword) {
    if (!user.value) return { success: false, error: 'Usuario no autenticado' };
    isLoading.value = true;
    error.value = null;

    try {
      await api.post('/auth/change-password', {
        userId: user.value.id,
        currentPassword,
        newPassword
      });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al cambiar la contraseña. Inténtalo de nuevo.';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  // ── Helpers privados ──────────────────────────────────────────────────────

  function _setSession(newToken, newUser) {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('patitas_token', newToken);
    localStorage.setItem('patitas_user', JSON.stringify(newUser));
  }

  function _clearSession() {
    token.value = null;
    user.value = null;
    error.value = null;
    localStorage.removeItem('patitas_token');
    localStorage.removeItem('patitas_user');
  }

  return {
    // State
    token,
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    displayName,
    isAdmin,
    initials,
    // Actions
    login,
    logout,
    me,
    register,
    loginOAuth,
    updateProfile,
    changePassword,
  };
});
