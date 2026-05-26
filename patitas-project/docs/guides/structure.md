# Estructura del Proyecto — Frontend (Patitas)

Este documento detalla la arquitectura de directorios **actual** del frontend de **Patitas** (Vue 3 + Vite), y la estructura proyectada a medida que se implementen las historias de usuario del backlog.

---

## Estado actual del proyecto

> **Sprint actual:** Las historias de usuario FE-01 a FE-04 están en curso. Los componentes base del layout (header, hero, cards y footer) están implementados. Las funcionalidades de router, autenticación, tienda y comunidad aún no están desarrolladas.

---

## Jerarquía de Directorios — Estado Actual

```text
patitas-project/
├── public/                         # Archivos estáticos servidos sin procesamiento
│   ├── favicon.svg                 # Ícono del sitio
│   └── icons.svg                   # Íconos auxiliares
│
├── src/                            # Código fuente principal de la aplicación
│   │
│   ├── assets/                     # Recursos estáticos gestionados por Vite
│   │   ├── fondo_azul.png          # Imagen de fondo de la sección hero
│   │   ├── fondo_morado.png        # Imagen de fondo del header y footer
│   │   ├── hero.png                # Imagen principal de la sección hero
│   │   ├── logo.png                # Logo circular de Patitas
│   │   └── vido_patitas.mp4        # Video decorativo de los patitos (badge del hero)
│   │
│   ├── components/                 # Componentes Vue del layout actual
│   │   ├── SiteHeader.vue          # Header global: logo, navegación y acciones
│   │   ├── HeroBanner.vue          # Sección hero: título, CTAs, stats y video badge
│   │   ├── InfoCards.vue           # Cards informativas de recursos + banner CTA
│   │   └── SiteFooter.vue          # Footer global: marca, links, newsletter y pagos
│   │
│   ├── App.vue                     # Componente raíz: orquesta header, main y footer
│   ├── main.js                     # Punto de entrada: monta la app Vue en el DOM
│   └── style.css                   # Estilos globales base
│
├── index.html                      # HTML raíz — Vite lo usa como plantilla de entrada
├── vite.config.js                  # Configuración de Vite y plugins
├── package.json                    # Dependencias, scripts y metadata del proyecto
└── package-lock.json               # Versiones exactas de dependencias (no editar)
```

---

## Descripción de Archivos Clave

### Punto de Entrada

| Archivo | Responsabilidad |
| :--- | :--- |
| `index.html` | Plantilla HTML base. Vite inyecta automáticamente los scripts del bundle al hacer build. Contiene el `<div id="app">` donde Vue monta la aplicación. |
| `src/main.js` | Inicializa la aplicación Vue con `createApp(App).mount('#app')`. Aquí se registrarán plugins globales en sprints futuros (Vue Router, Pinia). |
| `src/App.vue` | Componente raíz que ensambla el layout global: `<SiteHeader>`, `<main>` con las secciones y `<SiteFooter>`. Define las variables CSS globales en `<style>`. |

---

### Componentes actuales (`src/components/`)

Cada componente es **autocontenido**: tiene su template, lógica y estilos en un solo archivo `.vue` (Single File Component).

| Componente | Estado | Responsabilidad |
| :--- | :--- | :--- |
| `SiteHeader.vue` | ✅ Implementado | Header con logo animado, nav con estado activo, botones de búsqueda y carrito, botón de login y menú hamburguesa móvil. |
| `HeroBanner.vue` | ✅ Implementado | Sección hero con layout de dos columnas, título, CTAs, estadísticas de confianza, chip flotante y video badge (`vido_patitas.mp4`). |
| `InfoCards.vue` | ✅ Implementado | Grilla de tres cards generadas con `v-for`. Cada card tiene color de acento propio vía CSS custom property `--card-accent`. Banner CTA inferior. |
| `SiteFooter.vue` | ✅ Implementado | Footer en tres columnas: marca + redes sociales, links de navegación generados con `v-for`, newsletter con `@submit.prevent` y chips de pagos. |

---

### Assets (`src/assets/`)

Los archivos en esta carpeta son **procesados por Vite** en el build: se optimizan, se les añade hash de versión al nombre y se referencian con rutas absolutas en el bundle final.

| Asset | Uso | Tipo |
| :--- | :--- | :--- |
| `fondo_morado.png` | Fondo de `SiteHeader` y `SiteFooter` | Imagen PNG |
| `fondo_azul.png` | Fondo de `HeroBanner` | Imagen PNG |
| `hero.png` | Imagen principal del lado derecho del hero | Imagen PNG |
| `logo.png` | Logo circular en header y footer | Imagen PNG |
| `vido_patitas.mp4` | Video de patos en badge circular del hero | Video MP4 |

> Los assets se importan con `import videoUrl from '../assets/vido_patitas.mp4'` para que Vite los gestione correctamente en producción.

---

### Configuración actual

| Archivo | Responsabilidad |
| :--- | :--- |
| `vite.config.js` | Configura Vite con `@vitejs/plugin-vue`. En sprints futuros se agregarán aliases de rutas (`@/`) y proxy hacia la API. |
| `package.json` | Define las dependencias del proyecto y los scripts: `dev`, `build` y `preview`. |

---

## Scripts Disponibles

```bash
# Levantar servidor de desarrollo con hot-reload
npm run dev

# Compilar para producción (genera la carpeta dist/)
npm run build

# Previsualizar el build de producción localmente
npm run preview
```

---

## Dependencias actuales

### Producción
| Paquete | Versión | Propósito |
| :--- | :--- | :--- |
| `vue` | ^3.5.34 | Framework principal — Composition API, reactividad y componentes |

### Desarrollo
| Paquete | Versión | Propósito |
| :--- | :--- | :--- |
| `vite` | ^8.0.12 | Bundler y servidor de desarrollo |
| `@vitejs/plugin-vue` | ^6.0.6 | Plugin para procesar archivos `.vue` |
| `tailwindcss` | ^4.3.0 | Framework CSS — instalado, pendiente de configurar |
| `@tailwindcss/vite` | ^4.3.0 | Integración de Tailwind con Vite |

---

## Convenciones del Proyecto

- **Componentes:** PascalCase → `SiteHeader.vue`, `HeroBanner.vue`
- **Variables y funciones:** camelCase → `menuOpen`, `navItems`, `videoUrl`
- **Variables CSS:** kebab-case con prefijo `--` → `--button-purple`, `--text-blue`
- **Estilos:** Scoped por componente con `<style scoped>`. Variables CSS globales en `App.vue`
- **Idioma:** español para contenido visible, inglés para variables, funciones y comentarios técnicos
- **Assets:** siempre importados con `import` para que Vite los procese en el build

---

## Estructura Proyectada — Sprints Futuros

> Las carpetas y archivos marcados con 🔜 **no existen aún**. Se crearán al implementar las historias de usuario correspondientes.

```text
src/
├── assets/                          # ✅ Existe
├── components/                      # ✅ Existe — layout base implementado
├── views/                           # 🔜 FE-05 al FE-14 — vistas por ruta
│   ├── HomePage.vue                 # 🔜 FE-01/02/03/04
│   ├── LoginPage.vue                # 🔜 FE-05
│   ├── RegisterPage.vue             # 🔜 FE-06
│   ├── RecursosPage.vue             # 🔜 FE-07
│   ├── TiendaPage.vue               # 🔜 FE-08
│   ├── ComunidadPage.vue            # 🔜 FE-09
│   ├── CentrosPage.vue              # 🔜 FE-10
│   ├── PerfilPage.vue               # 🔜 FE-11
│   ├── BlogPage.vue                 # 🔜 FE-14
│   └── NotFound.vue                 # 🔜 FE-12
├── router/
│   └── index.js                     # 🔜 FE-12 — Vue Router con guards de auth
├── stores/
│   ├── auth.js                      # 🔜 FE-13 — Pinia: sesión de usuario
│   └── cart.js                      # 🔜 FE-08 — Pinia: carrito de la tienda
├── composables/                     # 🔜 sprints futuros
├── services/
│   └── api.js                       # 🔜 FE-07 al FE-14 — consumo de API REST
└── utils/                           # 🔜 sprints futuros
```

---