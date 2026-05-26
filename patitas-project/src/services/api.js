import axios from 'axios';

/**
 * Cliente de Axios centralizado para Patitas — FE-13 / Opción 3
 * Configura las peticiones HTTP y maneja la expiración de sesión (401).
 * Incluye un sistema de simulación (mocking) transparente cuando no hay backend activo.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor de Request: Añadir cabecera Authorization (Bearer Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('patitas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Interceptor de Response: Manejo global de errores (como 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpiar datos locales si la sesión ha expirado o el token es inválido
      localStorage.removeItem('patitas_token');
      localStorage.removeItem('patitas_user');
      // Redirigir al inicio e instruir la apertura del modal de login
      window.location.href = '/?auth=login';
    }
    return Promise.reject(error);
  }
);

// 3. Sistema de Simulación (Mock Fallback)
// Se activa automáticamente en desarrollo si no se especifica una URL de API real
const isMockEnabled = !import.meta.env.VITE_API_BASE_URL;

if (isMockEnabled) {
  api.interceptors.request.use(
    async (config) => {
      const url = config.url || '';

      // Interceptamos rutas de autenticación
      if (url.includes('/auth/')) {
        // Retraso de red simulado para una UX realista (spinners, loaders, etc.)
        await new Promise((resolve) => setTimeout(resolve, 800));

        let mockData = {};

        if (url.endsWith('/login')) {
          const { email } = JSON.parse(config.data || '{}');
          mockData = {
            token: `mock-jwt-token-login-${Date.now()}`,
            user: {
              id: 1,
              name: 'Padre Demo',
              email: email || 'demo@example.com',
              role: 'user',
              createdAt: new Date().toISOString(),
            },
          };
        } else if (url.endsWith('/register')) {
          const { name, email } = JSON.parse(config.data || '{}');
          mockData = {
            token: `mock-jwt-token-register-${Date.now()}`,
            user: {
              id: Math.floor(Math.random() * 1000) + 10,
              name: name || 'Usuario Registrado',
              email: email || 'nuevo@example.com',
              role: 'user',
              createdAt: new Date().toISOString(),
            },
          };
        } else if (url.includes('/oauth')) {
          const { provider, email } = JSON.parse(config.data || '{}');
          const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Social';
          mockData = {
            token: `mock-jwt-token-oauth-${provider}-${Date.now()}`,
            user: {
              id: Math.floor(Math.random() * 1000) + 10,
              name: `${providerName} Demo`,
              email: email || `${provider}-user@example.com`,
              role: 'user',
              createdAt: new Date().toISOString(),
            },
          };
        } else if (url.endsWith('/me')) {
          const token = localStorage.getItem('patitas_token');
          if (!token) {
            // Provocar un error 401 si no hay sesión iniciada
            throw {
              __isMockResponse: true,
              response: {
                status: 401,
                data: { message: 'Token de sesión ausente o inválido.' },
              },
            };
          }

          let savedUser = null;
          try {
            savedUser = JSON.parse(localStorage.getItem('patitas_user') || 'null');
          } catch (_) {}

          mockData = {
            user: savedUser || {
              id: 1,
              name: 'Padre Demo',
              email: 'demo@example.com',
              role: 'user',
              createdAt: new Date().toISOString(),
            },
          };
        }

        // Interrumpimos la llamada real lanzando la simulación
        throw {
          __isMockResponse: true,
          response: {
            status: 200,
            data: mockData,
            statusText: 'OK',
            headers: {},
            config,
          },
        };
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Capturar la excepción de simulación y transformarla en una resolución de éxito (200)
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error && error.__isMockResponse) {
        if (error.response.status === 200) {
          return Promise.resolve(error.response);
        } else {
          return Promise.reject(error.response);
        }
      }
      return Promise.reject(error);
    }
  );
}

export default api;
