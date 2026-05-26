import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

/**
 * Definición de rutas — FE-12
 * Rutas públicas: accesibles sin sesión.
 * Rutas privadas: meta.requiresAuth = true → redirigen a /login si no hay sesión.
 */
const routes = [
  // ── Rutas públicas ──────────────────────────────────────────────────────
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginPage.vue'),
    // Si ya está autenticado, redirigir al inicio
    beforeEnter: (to, from, next) => {
      const auth = useAuthStore();
      if (auth.isAuthenticated) next({ name: 'home' });
      else next();
    },
  },
  {
    path: '/registro',
    name: 'registro',
    component: () => import('../views/RegisterPage.vue'),
  },
  {
    path: '/recursos',
    name: 'recursos',
    component: () => import('../views/RecursosPage.vue'),
  },
  {
    path: '/recursos/:id',
    name: 'recurso-detalle',
    component: () => import('../views/RecursoDetallePage.vue'),
  },
  {
    path: '/tienda',
    name: 'tienda',
    component: () => import('../views/TiendaPage.vue'),
  },
  {
    path: '/tienda/:id',
    name: 'producto-detalle',
    component: () => import('../views/ProductoDetallePage.vue'),
  },
  {
    path: '/centros',
    name: 'centros',
    component: () => import('../views/CentrosPage.vue'),
  },
  {
    path: '/blog',
    name: 'blog',
    component: () => import('../views/BlogPage.vue'),
  },
  {
    path: '/blog/:slug',
    name: 'articulo',
    component: () => import('../views/ArticuloPage.vue'),
  },
  {
    path: '/comunidad',
    name: 'comunidad',
    component: () => import('../views/ComunidadPage.vue'),
  },
  {
    path: '/comunidad/:id',
    name: 'post-detalle',
    component: () => import('../views/PostDetallePage.vue'),
  },

  // ── Rutas privadas (requiresAuth) ────────────────────────────────────────
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('../views/PerfilPage.vue'),
    meta: { requiresAuth: true },
  },

  // ── 404 ─────────────────────────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Siempre desplazar al top de la página al navegar (T-FE12-05)
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: 'smooth' };
  },
});

/**
 * Guard global — protección de rutas privadas (T-FE12-02)
 * Si la ruta requiere autenticación y el usuario no está logueado:
 * - Redirige a /login con query ?redirect=/ruta-original
 * - Tras login exitoso, router.push() debe leer query.redirect
 */
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
});

export default router;
