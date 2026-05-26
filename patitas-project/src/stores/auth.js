import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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
   * Actualmente simula la llamada a la API — en producción conectar con POST /api/auth/login.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function login(email, password) {
    isLoading.value = true;
    error.value = null;

    try {
      // TODO (FE-05 T-FE05-04): Reemplazar con llamada real a la API:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.message || 'Credenciales incorrectas');
      // }
      // const data = await response.json();

      // Simulación temporal — eliminar cuando haya backend real
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Datos simulados de respuesta exitosa
      const data = {
        token: `mock-token-${Date.now()}`,
        user: {
          id: 1,
          name: 'Padre Demo',
          email,
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      };

      // Guardar en estado y persistir en localStorage
      _setSession(data.token, data.user);

      return { success: true };
    } catch (err) {
      const msg = err.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
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
    // TODO (FE-12): redirigir a '/' con Vue Router: router.push('/')
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
      // TODO (FE-05 T-FE05-04): Conectar con GET /api/auth/me
      // const response = await fetch('/api/auth/me', {
      //   headers: { Authorization: `Bearer ${token.value}` },
      // });
      // if (!response.ok) throw new Error('Token inválido');
      // const data = await response.json();
      // user.value = data.user;

      // Si el usuario ya está en localStorage, se restauró en el init.
      // En producción, verificar el token contra la API aquí.
    } catch {
      // Token expirado o inválido — limpiar sesión
      _clearSession();
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
  };
});
