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
  {
    path: '/contacto',
    name: 'contacto',
    component: () => import('../views/ContactoPage.vue'),
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../views/CheckoutPage.vue'),
  },
  {
    path: '/pedido/:id?',
    name: 'pedido',
    component: () => import('../views/PedidoPage.vue'),
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('../views/FaqPage.vue'),
  },
  {
    path: '/devoluciones',
    name: 'devoluciones',
    component: () => import('../views/DevolucionesPage.vue'),
  },

  // ── Rutas privadas (requiresAuth) ────────────────────────────────────────
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('../views/PerfilPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    component: () => import('../components/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    beforeEnter: (to, from, next) => {
      const auth = useAuthStore();
      if (!auth.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
      }
      if (auth.isSuperAdmin) next('/dashboard/superadmin');
      else if (auth.isAdminCentro) next('/dashboard/admin-centro');
      else if (auth.isAdminProfesional) next('/dashboard/admin-profesional');
      else next('/dashboard/usuario');
    },
    children: [
      // superadmin
      {
        path: 'superadmin',
        name: 'dashboard-superadmin',
        component: () => import('../views/dashboard/DashboardHome.vue'),
        meta: { roles: ['superadmin'] }
      },
      {
        path: 'superadmin/perfil',
        name: 'dashboard-superadmin-perfil',
        component: () => import('../views/dashboard/DashboardPerfil.vue'),
        meta: { roles: ['superadmin'] }
      },
      { path: 'superadmin/gestion-web', name: 'dashboard-superadmin-gestion', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['superadmin'] } },
      { path: 'superadmin/centros', name: 'dashboard-superadmin-centros', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['superadmin'] } },
      { path: 'superadmin/admins', name: 'dashboard-superadmin-admins', component: () => import('../views/dashboard/AdminsView.vue'), meta: { roles: ['superadmin'] } },
      { path: 'superadmin/tienda', name: 'dashboard-superadmin-tienda', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['superadmin'] } },
      { path: 'superadmin/moderacion', name: 'dashboard-superadmin-moderacion', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['superadmin'] } },

      // admin_centro
      {
        path: 'admin-centro',
        name: 'dashboard-admin-centro',
        component: () => import('../views/dashboard/DashboardHome.vue'),
        meta: { roles: ['admin_centro'] }
      },
      {
        path: 'admin-centro/perfil',
        name: 'dashboard-admin-centro-perfil',
        component: () => import('../views/dashboard/DashboardPerfil.vue'),
        meta: { roles: ['admin_centro'] }
      },
      { path: 'admin-centro/mi-centro', name: 'dashboard-centro-mi-centro', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['admin_centro'] } },
      { path: 'admin-centro/profesionales', name: 'dashboard-centro-profesionales', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['admin_centro'] } },
      { path: 'admin-centro/ninos', name: 'dashboard-centro-ninos', component: () => import('../views/dashboard/ChildrenView.vue'), meta: { roles: ['admin_centro'] } },
      { path: 'admin-centro/ninos/nuevo', name: 'dashboard-centro-ninos-nuevo', component: () => import('../views/dashboard/ChildFormView.vue'), meta: { roles: ['admin_centro'] } },
      { path: 'admin-centro/ninos/:id', name: 'dashboard-centro-ninos-detalle', component: () => import('../views/dashboard/ChildDetailView.vue'), meta: { roles: ['admin_centro'] } },
      { path: 'admin-centro/ninos/:id/editar', name: 'dashboard-centro-ninos-editar', component: () => import('../views/dashboard/ChildFormView.vue'), meta: { roles: ['admin_centro'] } },
      { path: 'admin-centro/citas', name: 'dashboard-centro-citas', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['admin_centro'] } },
      { path: 'admin-centro/contenido', name: 'dashboard-centro-contenido', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['admin_centro'] } },

      // admin_profesional
      {
        path: 'admin-profesional',
        name: 'dashboard-admin-profesional',
        component: () => import('../views/dashboard/DashboardHome.vue'),
        meta: { roles: ['admin_profesional'] }
      },
      {
        path: 'admin-profesional/perfil',
        name: 'dashboard-admin-profesional-perfil',
        component: () => import('../views/dashboard/DashboardPerfil.vue'),
        meta: { roles: ['admin_profesional'] }
      },
      { path: 'admin-profesional/mis-ninos', name: 'dashboard-profesional-ninos', component: () => import('../views/dashboard/ChildrenView.vue'), meta: { roles: ['admin_profesional'] } },
      { path: 'admin-profesional/mis-ninos/:id', name: 'dashboard-profesional-ninos-detalle', component: () => import('../views/dashboard/ChildDetailView.vue'), meta: { roles: ['admin_profesional'] } },
      { path: 'admin-profesional/citas', name: 'dashboard-profesional-citas', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['admin_profesional'] } },
      { path: 'admin-profesional/progreso', name: 'dashboard-profesional-progreso', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['admin_profesional'] } },
      { path: 'admin-profesional/contenido', name: 'dashboard-profesional-contenido', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['admin_profesional'] } },

      // user
      {
        path: 'usuario',
        name: 'dashboard-usuario',
        component: () => import('../views/dashboard/DashboardHome.vue'),
        meta: { roles: ['user'] }
      },
      {
        path: 'usuario/perfil',
        name: 'dashboard-usuario-perfil',
        component: () => import('../views/dashboard/DashboardPerfil.vue'),
        meta: { roles: ['user'] }
      },
      { path: 'usuario/mis-hijos', name: 'dashboard-usuario-hijos', component: () => import('../views/dashboard/ParentChildrenView.vue'), meta: { roles: ['user'] } },
      { path: 'usuario/mis-hijos/:id', name: 'dashboard-usuario-hijos-detalle', component: () => import('../views/dashboard/ChildDetailView.vue'), meta: { roles: ['user'] } },
      { path: 'usuario/mis-eventos', name: 'dashboard-usuario-eventos', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['user'] } },
      { path: 'usuario/mis-pedidos', name: 'dashboard-usuario-pedidos', component: () => import('../views/dashboard/DashboardSection.vue'), meta: { roles: ['user'] } }
    ]
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

  // 1. Verificar autenticación
  const needsAuth = to.meta.requiresAuth || to.matched.some(record => record.meta.requiresAuth);
  if (needsAuth && !auth.isAuthenticated) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
  }

  // 2. Verificar roles (autorización)
  const matchedRouteWithRoles = to.matched.find(record => record.meta.roles);
  if (matchedRouteWithRoles) {
    const allowedRoles = matchedRouteWithRoles.meta.roles;
    const userRole = auth.user?.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      // Disparar toast de advertencia
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'No tienes permisos para esa sección', type: 'error' }
      }));

      // Redirigir a su dashboard correspondiente
      if (userRole === 'superadmin') return next('/dashboard/superadmin');
      if (userRole === 'admin_centro') return next('/dashboard/admin-centro');
      if (userRole === 'admin_profesional') return next('/dashboard/admin-profesional');
      return next('/dashboard/usuario');
    }
  }

  next();
});

export default router;
