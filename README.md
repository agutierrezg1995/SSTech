# SSTech SaaS

Plataforma web de digitalización de formatos de Seguridad y Salud en el Trabajo (SST).
Permite crear, editar, aprobar y generar PDF de registros con roles (Coordinador SST y SISO).

## 🌐 Sitio web — GitHub Pages

| Qué                          | Dónde                                                        |
|------------------------------|--------------------------------------------------------------|
| **URL pública**              | **https://agutierrezg1995.github.io/SSTech/**                 |
| Carpeta fuente de Pages      | `docs/` (rama `main` → *Deploy from a branch*)                |
| Archivo raíz del sitio       | `docs/index.html`                                             |
| Redirección en la raíz       | `index.html` (redirige a `/SSTech/docs/`)                     |
| Configuración                | Settings → Pages → Source: `main` / `/docs`                   |

El sitio se sirve desde `docs/`. Como Pages está configurado con la raíz del repositorio,
el archivo `index.html` de la raíz redirige a `/SSTech/docs/`, de modo que la URL pública
muestra el sitio completo. Si en Settings → Pages se cambia el origen a `main` / `/docs`,
la redirección deja de ser necesaria y puede eliminarse.

Sitio **estático** (un solo archivo, sin build): presentación del proyecto, diagramas
Mermaid, stack técnico, los 7 formatos digitalizados con link a su PDF original, comandos
de ejecución y cuentas demo. No incluye la app interactiva: esa necesita el servidor Node.js
(ver [Nota sobre GitHub Pages](#nota-sobre-github-pages)).

## 🔗 Acceso a la plataforma

**Link local (después de arrancar el servidor): http://localhost:3200**

## Formatos digitalizados

| Código    | Formato                                            | Versión |
|-----------|----------------------------------------------------|---------|
| FT-OPE-06 | Permiso de Trabajo en Campo                         | v7      |
| FT-OPE-51 | Permiso de Trabajo en Alturas                       | v1      |
| FT-OPE-56 | Control de Asistencia de Operaciones                | v2      |
| FT-SST-08 | Control Semanal de Pausas Activas                   | v1      |
| FT-SST-11 | Reporte de Investigación de A.T e I.T               | v4      |
| FT-SST-37 | Análisis de Trabajo Seguro (ATS)                    | v6      |
| FT-SST-39 | Control de Entregas de EPP                          | v1      |

## Datos

- El almacenamiento es en **archivos JSON** dentro de `Proyecto/platform/data/`
  (`usuarios.json`, `sesiones.json` y un archivo por formato, p. ej. `ft-ope-06.json`).
- Cada registro es un objeto con `data` (contenido según `esquema.js`), estado
  (BORRADOR / CONCEDIDO / NO CONCEDIDO / CANCELADO), creador, fechas e historial
  de trazabilidad.
- La carpeta `data/` está en `.gitignore` y **no se sube al repositorio**: se regenera
  al ejecutar `npm run seed`.
- `npm run seed` crea además **registros de demostración en los 7 formatos**
  (CONCEDIDO, NO CONCEDIDO y BORRADOR) con datos realistas y fechas recientes.

## Perfil de usuario

Cada usuario puede gestionar su perfil desde el botón **⚙️ Configuración de perfil**
en el panel izquierdo: **foto de perfil** (se redimensiona automáticamente en PNG/JPG),
nombre, cargo, cédula y teléfono. La foto queda guardada en `usuarios.json` y se
muestra en la barra superior y en la sidebar.

## Gestión de usuarios (SISOs)

En el panel izquierdo, la pestaña **👥 Usuarios** (visible solo para el rol
Coordinador) permite crear **subalternos SISO**: se asigna nombre, correo y
contraseña, y ese SISO puede iniciar sesión de inmediato con esas credenciales.

## UI mejorada

Se incorporaron las librerías profesionales **SweetAlert2** (cuadros de diálogo y
confirmaciones animadas) y **Animate.css** (animaciones de entrada), servidas de forma
local en `Proyecto/platform/public/vendor/`. Los estilos incluyen degradados,
glassmorphism y sombras para una experiencia más profesional.

## Requisitos

- Node.js **18+** (probado con Node 24).

## Instalación y ejecución

```bash
cd "Proyecto/platform"
npm install      # solo la primera vez
npm run seed     # carga los datos demo (usuarios y registros)
npm start        # arranca el servidor
```

Después abre **http://localhost:3200** en el navegador e inicia sesión con una de las cuentas demo.

### Otros comandos

| Comando        | Qué hace                                   |
|----------------|--------------------------------------------|
| `npm start`    | Inicia el servidor (API + frontend + PDF). |
| `npm run seed` | Siembra usuarios y registros de demostración. |

## Pruebas

```bash
# unitarias (Node 18+, no requiere servidor)
node --test "tests/unit/*.test.js"

# end-to-end (requiere el servidor activo en http://localhost:3200)
node tests/e2e/validacion.e2e.js
```

- Validaciones: motor en `public/js/validacion.js`, reglas detalladas en
  `tests/documentacion/validaciones.md`.
- Guía completa: `tests/documentacion/pruebas.md`.
- Historial de cambios: `CHANGELOG.md`.

## Estructura

```
SSTech Saas/
├── Proyecto/
│   ├── platform/        → Frontend + API REST (Express)
│   │   ├── public/      → app.js, form.js, util.js, validacion.js, css, vendor/(SweetAlert2, Animate.css)
│   │   └── lib/         → db.js, pdf.js, auth.js, indicadores.js, seed-util.js
│   ├── formatos/        → Esquemas de cada formato (esquema.js / indicadores.js)
│   ├── Diagramas/       → Diagramas Mermaid de arquitectura
│   └── Documentacion/   → Especificación, arquitectura y auditoría
├── tests/
│   ├── unit/            → Tests unitarios (node:test) + helper de entorno
│   ├── e2e/             → Prueba end-to-end (puppeteer-core)
│   └── documentacion/   → validaciones.md y pruebas.md
├── Formatos/            → PDF originales de los formatos digitalizados
├── CHANGELOG.md
├── README.md
└── ESTRATEGIAS-DIGITALIZACION-FORMATOS.md
```

## Nota sobre GitHub Pages

La plataforma usa un backend de Node.js/Express (autenticación, base de datos en JSON y
generación de PDF con Puppeteer). GitHub Pages solo publica archivos estáticos, por lo que
**no puede alojar esta aplicación tal cual**. Para publicarla en línea se necesitaría un
servidor Node.js (p. ej. Render o Railway).

---
Proyecto: Formulación de Proyectos de Ingeniería — SSTech SaaS © 2026
