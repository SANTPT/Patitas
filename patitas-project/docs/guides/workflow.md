# workflow.md — Frontend Patitas

## Principios

* **Agilidad y Autonomía:** El equipo opera de forma autónoma bajo SCRUM, atendiendo ceremonias como Dailys, Sprint Planning y Sprint Retros para coordinar el avance del frontend.
* **Calidad Garantizada:** Ningún componente o vista se considera terminado sin superar una cobertura mínima de tests (objetivo 70%) y validación visual en desktop y móvil.
* **Colaboración Humano-IA:** Se utiliza al agente de IA (Claude) como experto técnico para arquitectura de componentes, generación de tests y validación de criterios de aceptación bajo parámetros SCRUM.
* **Diseño Consistente:** Todo componente debe respetar la paleta de colores originales del proyecto (`#1a5b82`, `#c58cf2`), la tipografía Fredoka y los assets definidos antes de su integración a `main`.

---

## Estado actual del proyecto

> Los componentes base del layout (FE-01 a FE-04) están implementados: `SiteHeader`, `HeroBanner`, `InfoCards` y `SiteFooter`. Las historias de usuario FE-05 en adelante (login, registro, recursos, tienda, comunidad, centros, perfil, router, stores y blog) están **pendientes** de desarrollo.

---

## Proceso para una Historia de Usuario (HU)

### Análisis
Leer la HU y sus **Criterios de Aceptación (CA)**. Identificar los **tests unitarios y E2E** necesarios para validar el comportamiento del componente y el flujo completo en el navegador.

* **Acción del Agente:** Propone el plan de pruebas, los escenarios de interactividad (ej: toggle del menú, submit del formulario) y los casos de responsive.
* **Acción del Humano:** Valida el plan de pruebas propuesto y confirma que los criterios de aceptación están cubiertos.

### Descomposición
Dividir la HU en **Tareas Técnicas** independientes (ej: T-FE01-01, T-FE01-02).

* **Acción del Humano:** Realiza y prioriza esta descomposición en el backlog antes de comenzar el sprint.

### Ciclo por Tarea (Sprints Técnicos)
El humano define el inicio y fin de cada tarea.

**a. Análisis Técnico:** Entender el impacto del componente en el layout global, su relación con los componentes ya implementados y los assets que necesita.

**b. Diseño del Componente:** Definir la estructura del SFC: props, eventos emitidos, estado reactivo (`ref`, `computed`) y slots si aplica.

**c. Validación del Diseño:** El humano valida la estructura propuesta. No se escribe código sin esta aprobación.

**d. Implementación:**
  1. **Código:** Escribir el componente Vue 3 con Composition API siguiendo las convenciones del proyecto (PascalCase, estilos scoped, variables CSS del sistema de diseño).
  2. **Tests Unitarios:** Crear pruebas en `tests/unit/` con Vitest + Vue Test Utils para validar renderizado, props y eventos del componente de forma aislada.
  3. **Tests de Integración:** Desarrollar los tests en `tests/integration/` para validar la interacción del componente con el resto del layout.

**e. Ejecución y Debugging:** Ejecutar `npm run test:run` para asegurar que la tarea cumple con los requisitos sin romper componentes previos. Revisar visualmente en `npm run dev` en desktop y móvil.

**f. Validación final de la tarea:** El humano revisa el código, los resultados de los tests y la apariencia visual antes de hacer commit.

### Validación Final de la Historia de Usuario

* **Integración Total:** Ejecutar `npm run test:run` para verificar que todos los tests pasan sin errores y que la cobertura se mantiene por encima del 70%.
* **Validación E2E:** Correr `npm run test:e2e` para confirmar que el flujo funciona en el navegador real, incluyendo responsive en móvil.
* **Estado "Done":** La HU se marca como terminada solo cuando los tests pasan, el componente es visualmente correcto y está reflejado en el `structure.md`.
* **Sprint Review:** El equipo demuestra la funcionalidad al stakeholder en la URL de preview de Vercel generada automáticamente por el Pull Request.

---

## Flujo de Git

```
main                  ← producción (auto-deploy en Vercel)
  └── develop         ← integración de features del sprint
        └── feature/FE-05-login
        └── feature/FE-06-registro
        └── fix/FE-01-hamburger
```

### Reglas de ramas

* Todo desarrollo parte desde `develop`, nunca desde `main`.
* El nombre de la rama referencia el ID de la historia: `feature/FE-05-login`, `fix/FE-03-card-hover`.
* Ningún commit va directo a `main`. El merge a `main` se hace solo desde `develop` al cerrar el sprint.

### Convención de commits

```
feat(header):    agregar menú hamburguesa con animación
fix(hero):       corregir posición del video badge en móvil
style(footer):   ajustar espaciado del newsletter form
test(header):    agregar tests unitarios del toggle del nav
docs(readme):    actualizar estructura del proyecto
refactor(cards): extraer color de acento a variable CSS
```

---

## Ciclo de un Sprint

```
┌─────────────────────────────────────────────────────────┐
│  SPRINT PLANNING                                         │
│  Seleccionar HUs del backlog · Estimar puntos · Asignar  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  DESARROLLO (por cada HU)                                │
│  Análisis → Diseño → Validación → Código → Tests → PR   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  DAILY STANDUP (diario)                                  │
│  ¿Qué hice? · ¿Qué haré? · ¿Hay bloqueos?              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  SPRINT REVIEW                                           │
│  Demo en URL de preview de Vercel al stakeholder         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  SPRINT RETRO                                            │
│  ¿Qué salió bien? · ¿Qué mejorar? · Acciones concretas  │
└─────────────────────────────────────────────────────────┘
```

---

## Definición de "Done" (DoD)

Una historia de usuario se considera **terminada** solo cuando cumple todos los siguientes criterios:

| Criterio | Validado por |
| :--- | :--- |
| El componente renderiza correctamente en desktop y móvil | Humano (visual) |
| `npm run test:run` pasa sin errores | CI / Humano |
| Cobertura del componente >= 70% | `npm run test:coverage` |
| `npm run test:e2e` pasa en Chromium y Mobile Safari | CI / Humano |
| El código sigue las convenciones del proyecto | Humano (code review) |
| El Pull Request fue revisado y aprobado antes del merge | Humano |
| La funcionalidad fue demostrada en la Sprint Review | Equipo |

---

## Backlog de Historias — Estado actual

| ID | Historia | Puntos | Prioridad | Estado |
| :--- | :--- | :---: | :--- | :--- |
| FE-01 | Header de navegación responsivo | 3 | Alta | ✅ Hecho |
| FE-02 | Hero banner con video badge | 3 | Alta | ✅ Hecho |
| FE-03 | Cards informativas + CTA | 3 | Alta | ✅ Hecho |
| FE-04 | Footer con newsletter y pagos | 3 | Alta | ✅ Hecho |
| FE-05 | Página de Login (modal) | 5 | Crítica | 🟡 Incompleto (UI lista, sin API real) |
| FE-06 | Página de Registro | 5 | Alta | ✅ Hecho (con simulación/mock API) |
| FE-07 | Recursos con filtros | 8 | Alta | 🔴 Pendiente |
| FE-08 | Tienda de productos | 13 | Media | 🔴 Pendiente |
| FE-09 | Comunidad — foro | 13 | Media | 🔴 Pendiente |
| FE-10 | Mapa de centros | 8 | Media | 🔴 Pendiente |
| FE-11 | Perfil de usuario | 8 | Baja | 🔴 Pendiente |
| FE-12 | Vue Router + rutas protegidas | 5 | Crítica | ✅ Hecho |
| FE-13 | Store de auth con Pinia | 5 | Crítica | ✅ Hecho |
| FE-14 | Blog de artículos | 8 | Baja | 🔴 Pendiente |

---