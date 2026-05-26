# Instrucciones de Despliegue — Patitas Frontend

## Objetivo

Este documento detalla el procedimiento para poner en producción el frontend de **Patitas** (Vue 3 + Vite) usando **Vercel**. El objetivo es tener un entorno estable, con despliegue automático desde GitHub y CDN global sin configuración de infraestructura.

> **Estado actual:** El proyecto tiene implementados los componentes base del layout (FE-01 a FE-04). El despliegue cubre exclusivamente el frontend. La integración con backend se documentará en un sprint posterior.

---

## Stack de Despliegue

| Capa | Tecnología |
| :--- | :--- |
| Framework frontend | Vue 3 + Vite |
| Plataforma de despliegue | Vercel |
| Repositorio | GitHub |
| CI/CD | Automático vía Vercel + GitHub |

---

## Prerrequisitos

Antes de comenzar, asegúrate de tener:

- El proyecto subido a un repositorio en **GitHub**
- Una cuenta en **Vercel** → [vercel.com](https://vercel.com) (gratis, puedes registrarte con tu cuenta de GitHub)
- El proyecto construye correctamente en local:

```bash
cd patitas-project
npm run build
```

> Si `npm run build` termina sin errores, el proyecto está listo para desplegar.

---

## Despliegue Inicial — Paso a Paso

### 1. Conectar Vercel con GitHub

1. Entra a [vercel.com](https://vercel.com) y haz clic en **"Sign Up"**
2. Selecciona **"Continue with GitHub"** e inicia sesión
3. Autoriza a Vercel acceso a tus repositorios cuando lo solicite

---

### 2. Importar el proyecto

1. En el dashboard de Vercel, haz clic en **"Add New Project"**
2. Busca tu repositorio `patitas` en la lista y haz clic en **"Import"**

---

### 3. Configurar el proyecto

Vercel detecta automáticamente que es un proyecto Vite. Verifica que la configuración sea:

| Campo | Valor |
| :--- | :--- |
| **Framework Preset** | Vite |
| **Root Directory** | `patitas-project` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

> **Importante:** El campo **Root Directory** debe ser `patitas-project` porque tu repositorio tiene la carpeta del proyecto dentro, no en la raíz.

---

### 4. Desplegar

Haz clic en **"Deploy"**. Vercel ejecutará:

```
1. npm install        ← instala dependencias
2. npm run build      ← genera la carpeta dist/
3. Sube dist/ a CDN   ← disponible globalmente
```

En 1-2 minutos tendrás tu aplicación publicada en una URL como:

```
https://patitas-xxxxxxxx.vercel.app
```

---

## Despliegues Automáticos (CI/CD)

Una vez conectado, **cada push a `main` despliega automáticamente** a producción:

```bash
git add .
git commit -m "feat: mejora del hero banner"
git push origin main
# Vercel detecta el push y despliega solo
```

Cada Pull Request genera automáticamente una **URL de preview** para revisar los cambios antes de hacer merge:

```
https://patitas-git-nombre-de-la-rama.vercel.app
```

---

## Configuración de Vue Router

> ⚠️ **Pendiente — Historia FE-12.** Vue Router aún no está implementado. Cuando se implemente en el sprint correspondiente, será necesario crear el archivo `public/vercel.json` para que las rutas internas funcionen correctamente al refrescar la página.

Una vez implementado Vue Router (FE-12), crear `patitas-project/public/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> Sin este archivo, si el usuario refresca la página en `/recursos` o `/login` obtendrá un error 404, ya que Vercel no encontrará ese archivo físicamente en el build.

---

## Variables de Entorno

> ⚠️ **Pendiente — Sprints futuros.** Actualmente el frontend no consume ninguna API. Cuando el backend esté disponible, las variables se agregarán en Vercel sin modificar el código.

Cuando esté lista la API, agregar en Vercel → **Settings** → **Environment Variables**:

| Variable | Ejemplo | Entorno |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://api.patitas.com` | Production |
| `VITE_APP_NAME` | `Patitas` | All |

> Las variables con prefijo `VITE_` son las únicas que Vite expone al cliente. Nunca colocar secretos (tokens, contraseñas) en variables `VITE_`.

Se acceden en el código así:

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## Dominio Personalizado (opcional)

Para usar un dominio propio como `patitas.com`:

1. Ve a tu proyecto → **Settings** → **Domains**
2. Haz clic en **"Add Domain"** e ingresa tu dominio
3. Agrega los registros DNS indicados en tu proveedor (GoDaddy, Namecheap, etc.)
4. Vercel asigna automáticamente un certificado **SSL/HTTPS** sin costo

---

## Reglas de Despliegue y Git

- **Rama de producción:** Solo se despliega desde `main`. El trabajo diario se desarrolla en ramas `feature/` o `fix/`.
- **Pull Request obligatorio:** Ningún commit va directo a `main` sin revisión.
- **Build limpio:** `npm run build` debe completarse sin errores antes de hacer merge a `main`.
- **Variables de entorno:** Nunca subir archivos `.env` al repositorio. Se configuran en el panel de Vercel.

---

## Verificación Post-Despliegue

Una vez finalizado el deploy, verifica:

### ✅ Aplicación cargando
Abre la URL de Vercel y confirma que la página de inicio carga con el header, hero, cards y footer.

### ✅ Assets cargando
Abre las DevTools → **Network**. Confirma que el video `vido_patitas.mp4`, las imágenes de fondo y el logo cargan sin errores (status 200).

### ✅ Responsive
Revisa en móvil o con DevTools en modo responsive que el menú hamburguesa y los layouts funcionan correctamente.

### ✅ Performance (recomendado)
Corre un análisis en [PageSpeed Insights](https://pagespeed.web.dev/) con la URL de Vercel. Una aplicación Vite en Vercel debería obtener un score de **90+** en Performance.

---

## Evolución del Despliegue — Próximos Pasos

Cuando el backend esté listo, la arquitectura se extenderá:

| Servicio | Plataforma sugerida | Estado |
| :--- | :--- | :--- |
| Frontend (Vue 3) | Vercel | ✅ Sprint actual |
| Backend (API) | Railway / Render / VPS | 🔜 Sprint futuro |
| Base de datos | Railway PostgreSQL / Supabase | 🔜 Sprint futuro |

El frontend solo necesitará agregar `VITE_API_BASE_URL` en Vercel apuntando al backend. No se requieren cambios en la infraestructura del frontend.
