# Instrucciones para Testing (Frontend - Patitas)

## Principios

* **Cobertura mínima:** El proyecto debe superar el 70% de cobertura en componentes y lógica reactiva para garantizar estabilidad.
* **Aislamiento por componente:** Cada test unitario debe ejecutarse de forma aislada, montando el componente de forma independiente sin depender del estado de otros tests.
* **Nomenclatura clara:** Usa el sufijo `.test.js` para tests unitarios e integración (ej: `SiteHeader.test.js`) y `.spec.js` para tests E2E (ej: `home.spec.js`).

> **Estado actual:** Los tests descritos en este documento **aún no están implementados**. Constituyen el plan de pruebas a desarrollar durante el sprint. Los tests unitarios cubren los 4 componentes base ya implementados (FE-01 a FE-04). Los tests de vistas futuras (login, tienda, comunidad) se documentarán cuando se implementen las historias correspondientes.

---

## Tests Unitarios y de Integración

### Estructura de carpetas de tests

Siguiendo la arquitectura de carpetas del proyecto, los tests se centralizan para facilitar su ejecución local y en CI/CD:

```
patitas-project/
├── src/
│   ├── assets/                   # Recursos estáticos (imágenes, video)
│   ├── components/               # Componentes Vue actuales (FE-01 a FE-04)
│   ├── App.vue
│   └── main.js
├── tests/                        # 🔜 Carpeta a crear — no existe aún
│   ├── setup.js                  # 🔜 Configuración global de Vitest
│   ├── unit/                     # 🔜 Tests unitarios por componente
│   │   ├── SiteHeader.test.js    # 🔜 Nav, hamburger, login btn
│   │   ├── HeroBanner.test.js    # 🔜 Hero, video badge, stats, CTAs
│   │   ├── InfoCards.test.js     # 🔜 Cards, colores de acento, CTA banner
│   │   └── SiteFooter.test.js    # 🔜 Footer, newsletter, redes sociales
│   ├── integration/              # 🔜 Tests de interacción entre componentes
│   │   ├── navigation.test.js    # 🔜 Layout global App.vue
│   │   └── newsletter.test.js    # 🔜 Formulario de suscripción
│   └── e2e/                      # 🔜 Flujos completos con Playwright
│       ├── home.spec.js          # 🔜 Carga de la página de inicio
│       ├── navigation.spec.js    # 🔜 Navegación y enlaces
│       └── responsive.spec.js    # 🔜 Comportamiento en móvil
├── vite.config.js                # Requiere actualización para Vitest
├── playwright.config.js          # 🔜 A crear
└── package.json                  # Requiere nuevos scripts
```

### Contextos de Prueba Obligatorios

```
patitas-project/
├── src/                    # Código fuente
├── tests/                  # 🔜 Carpeta a crear
│   ├── unit/               # Tests de componentes aislados
│   ├── integration/        # Tests de interacción entre componentes
│   └── e2e/                # Flujos completos en el navegador real
└── ...
```

---

## Contextos de Prueba Obligatorios

Para cumplir con los criterios de calidad del proyecto, la suite de pruebas debe cubrir:

* 1. **Renderizado de componentes (FE-01 / FE-02 / FE-03 / FE-04):** Validar que cada componente renderiza correctamente su contenido: textos, imágenes, botones, links y elementos decorativos.
* 2. **Interactividad del Header (FE-01):** Verificar que el menú hamburguesa abre y cierra correctamente, que el enlace activo tiene la clase `active` y que el botón de login es visible.
* 3. **Video badge del Hero (FE-02):** Validar que el video `vido_patitas.mp4` se renderiza con los atributos `autoplay`, `muted` y `loop` para garantizar la reproducción automática en todos los navegadores.
* 4. **Formulario de Newsletter (FE-04):** Asegurar que el formulario acepta input de email, tiene el atributo `required` y previene el comportamiento por defecto del submit (`@submit.prevent`).
* 5. **Responsive (FE-01 / FE-02):** Validar que el nav desktop se oculta en móvil, el menú hamburguesa aparece, y el hero colapsa a una sola columna en pantallas menores a 860px.

---

## Instalación

Antes de escribir los tests, instalar las dependencias necesarias:

```bash
cd patitas-project

# Vitest + Vue Test Utils (unitarios e integración)
npm install -D vitest @vue/test-utils jsdom @vitest/coverage-v8

# Playwright (E2E)
npm install -D @playwright/test
npx playwright install
```

Actualizar `vite.config.js` para incluir la configuración de Vitest:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  },
})
```

Agregar los scripts en `package.json`:

```json
{
  "scripts": {
    "dev":           "vite",
    "build":         "vite build",
    "preview":       "vite preview",
    "test":          "vitest",
    "test:run":      "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e":      "playwright test",
    "test:e2e:ui":   "playwright test --ui"
  }
}
```

---

## Comandos para Ejecutar Tests

```bash
# Ejecutar toda la suite en modo watch (desarrollo)
npm run test

# Ejecutar toda la suite una sola vez (CI/CD y entrega)
npm run test:run

# Ejecutar con reporte de cobertura (Meta: >= 70%)
npm run test:coverage

# Ejecutar un archivo específico
npx vitest tests/unit/SiteHeader.test.js

# Ejecutar todos los tests E2E
npm run test:e2e

# Abrir la interfaz visual de Playwright
npm run test:e2e:ui

# Ejecutar un archivo E2E específico
npx playwright test tests/e2e/home.spec.js
```

---

## Casos de Prueba Planificados

> Los siguientes bloques de código representan los tests **a implementar**, no tests existentes.

### `SiteHeader.test.js` — a implementar

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteHeader from '../../src/components/SiteHeader.vue'

describe('SiteHeader', () => {
  it('renderiza el nombre de la marca "patitas"', () => {
    const wrapper = mount(SiteHeader)
    expect(wrapper.find('.brand-name').text()).toBe('patitas')
  })

  it('renderiza los 5 enlaces de navegación', () => {
    const wrapper = mount(SiteHeader)
    expect(wrapper.findAll('.main-nav a')).toHaveLength(5)
  })

  it('el primer enlace tiene la clase "active" por defecto', () => {
    const wrapper = mount(SiteHeader)
    expect(wrapper.findAll('.main-nav a')[0].classes()).toContain('active')
  })

  it('abre el menú móvil al hacer clic en el hamburger', async () => {
    const wrapper = mount(SiteHeader)
    await wrapper.find('.hamburger').trigger('click')
    expect(wrapper.find('.mobile-nav').classes()).toContain('open')
  })

  it('cierra el menú móvil al hacer clic en un enlace', async () => {
    const wrapper = mount(SiteHeader)
    await wrapper.find('.hamburger').trigger('click')
    await wrapper.find('.mobile-nav a').trigger('click')
    expect(wrapper.find('.mobile-nav').classes()).not.toContain('open')
  })

  it('renderiza el botón "Iniciar sesión"', () => {
    const wrapper = mount(SiteHeader)
    expect(wrapper.find('.login-btn').text()).toBe('Iniciar sesión')
  })
})
```

---

### `HeroBanner.test.js` — a implementar

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroBanner from '../../src/components/HeroBanner.vue'

describe('HeroBanner', () => {
  it('renderiza la palabra destacada del título', () => {
    const wrapper = mount(HeroBanner)
    expect(wrapper.find('.hero-highlight').text()).toBe('más pequeños')
  })

  it('renderiza los dos botones CTA con texto correcto', () => {
    const wrapper = mount(HeroBanner)
    expect(wrapper.find('.btn-primary').text()).toBe('Comenzar ahora')
    expect(wrapper.find('.btn-secondary').text()).toBe('Conocer recursos')
  })

  it('renderiza las 3 estadísticas de confianza', () => {
    const wrapper = mount(HeroBanner)
    expect(wrapper.findAll('.stat-item')).toHaveLength(3)
  })

  it('la primera estadística muestra "+2.4k"', () => {
    const wrapper = mount(HeroBanner)
    expect(wrapper.findAll('.stat-num')[0].text()).toBe('+2.4k')
  })

  it('el video badge tiene los atributos autoplay, muted y loop', () => {
    const wrapper = mount(HeroBanner)
    const video = wrapper.find('.video-badge video')
    expect(video.attributes('autoplay')).toBeDefined()
    expect(video.attributes('muted')).toBeDefined()
    expect(video.attributes('loop')).toBeDefined()
  })

  it('el chip flotante muestra "Diagnóstico temprano"', () => {
    const wrapper = mount(HeroBanner)
    expect(wrapper.find('.hero-chip').text()).toContain('Diagnóstico temprano')
  })
})
```

---

### `InfoCards.test.js` — a implementar

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InfoCards from '../../src/components/InfoCards.vue'

describe('InfoCards', () => {
  it('renderiza exactamente 3 cards', () => {
    const wrapper = mount(InfoCards)
    expect(wrapper.findAll('.info-card')).toHaveLength(3)
  })

  it('los títulos de las cards son los correctos', () => {
    const wrapper = mount(InfoCards)
    const titles = wrapper.findAll('.card-title').map(t => t.text())
    expect(titles).toContain('QUÉ ES EL AUTISMO')
    expect(titles).toContain('GUÍA DE ATENCIÓN TEMPRANA')
    expect(titles).toContain('COMUNIDAD PATITAS')
  })

  it('cada card tiene botón "Leer más"', () => {
    const wrapper = mount(InfoCards)
    wrapper.findAll('.card-btn').forEach(btn => {
      expect(btn.text()).toContain('Leer más')
    })
  })

  it('el banner CTA tiene el botón "Únete a la comunidad"', () => {
    const wrapper = mount(InfoCards)
    expect(wrapper.find('.cta-btn').text()).toBe('Únete a la comunidad')
  })

  it('el badge de sección muestra "Recursos"', () => {
    const wrapper = mount(InfoCards)
    expect(wrapper.find('.section-badge').text()).toBe('Recursos')
  })
})
```

---

### `SiteFooter.test.js` — a implementar

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteFooter from '../../src/components/SiteFooter.vue'

describe('SiteFooter', () => {
  it('renderiza el nombre de la marca "Patitas"', () => {
    const wrapper = mount(SiteFooter)
    expect(wrapper.find('.footer-brand-name').text()).toBe('Patitas')
  })

  it('renderiza los 5 íconos de redes sociales con aria-label', () => {
    const wrapper = mount(SiteFooter)
    const socials = wrapper.findAll('.social-link')
    expect(socials).toHaveLength(5)
    socials.forEach(s => expect(s.attributes('aria-label')).toBeTruthy())
  })

  it('el input de newsletter tiene el atributo required', () => {
    const wrapper = mount(SiteFooter)
    expect(wrapper.find('input[type="email"]').attributes('required')).toBeDefined()
  })

  it('el formulario previene recarga al enviarse (@submit.prevent)', async () => {
    const wrapper = mount(SiteFooter)
    await wrapper.find('.newsletter-form').trigger('submit')
    expect(wrapper.find('.newsletter-form').exists()).toBe(true)
  })

  it('renderiza el copyright con el año 2026', () => {
    const wrapper = mount(SiteFooter)
    expect(wrapper.find('.copyright').text()).toContain('2026')
  })

  it('renderiza los links legales', () => {
    const wrapper = mount(SiteFooter)
    expect(wrapper.findAll('.footer-legal-links a').length).toBeGreaterThanOrEqual(3)
  })
})
```

---

### `navigation.test.js` — a implementar (Integración)

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../../src/App.vue'

describe('Integración — Layout global', () => {
  it('la app renderiza header, main y footer en orden correcto', () => {
    const wrapper = mount(App)
    const children = wrapper.find('.app-wrapper').element.children
    expect(children[0].tagName).toBe('HEADER')
    expect(children[1].tagName).toBe('MAIN')
    expect(children[children.length - 1].tagName).toBe('FOOTER')
  })

  it('el hero banner y las cards están dentro del main', () => {
    const wrapper = mount(App)
    expect(wrapper.find('main .hero-banner').exists()).toBe(true)
    expect(wrapper.find('main .info-section').exists()).toBe(true)
  })
})
```

---

### `home.spec.js` — a implementar (E2E)

```javascript
import { test, expect } from '@playwright/test'

test.describe('Página de Inicio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('la página carga sin errores de consola', async ({ page }) => {
    const errors = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
  })

  test('el header, hero, cards y footer son visibles', async ({ page }) => {
    await expect(page.locator('.site-header')).toBeVisible()
    await expect(page.locator('.hero-banner')).toBeVisible()
    await expect(page.locator('.info-section')).toBeVisible()
    await page.locator('.site-footer').scrollIntoViewIfNeeded()
    await expect(page.locator('.site-footer')).toBeVisible()
  })

  test('el video de los patitos se reproduce en el hero', async ({ page }) => {
    const video = page.locator('.video-badge video')
    await expect(video).toBeVisible()
    await expect(video).toHaveAttribute('autoplay')
    await expect(video).toHaveAttribute('muted')
  })

  test('el menú hamburguesa abre y cierra en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.locator('.hamburger').click()
    await expect(page.locator('.mobile-nav')).toBeVisible()
    await page.locator('.mobile-nav a').first().click()
    await expect(page.locator('.mobile-nav')).toBeHidden()
  })
})
```

---

## Reporte de Cobertura

El reporte de cobertura se generará en `coverage/index.html` una vez instalado Vitest. Los umbrales mínimos del proyecto son:

| Métrica | Mínimo |
| :--- | :--- |
| Statements | 70% |
| Branches | 65% |
| Functions | 70% |
| Lines | 70% |

---

## Estado de Implementación de Tests

| Componente | Tests unitarios | Tests integración | E2E | Estado |
| :--- | :---: | :---: | :---: | :--- |
| `SiteHeader.vue` | 🔜 6 casos | 🔜 navigation.test | 🔜 navigation.spec | Pendiente |
| `HeroBanner.vue` | 🔜 6 casos | 🔜 navigation.test | 🔜 home.spec | Pendiente |
| `InfoCards.vue` | 🔜 5 casos | 🔜 navigation.test | 🔜 home.spec | Pendiente |
| `SiteFooter.vue` | 🔜 6 casos | 🔜 newsletter.test | 🔜 navigation.spec | Pendiente |
| `App.vue` | — | 🔜 navigation.test | 🔜 home.spec | Pendiente |
| **Responsive** | — | — | 🔜 responsive.spec | Pendiente |

---