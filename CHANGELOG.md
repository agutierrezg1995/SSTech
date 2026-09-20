# Changelog — SSTech SaaS

Todos los cambios notables de la plataforma.
El formato sigue el estilo [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [2026-09-20] — Validaciones estrictas, tests y documentación

### Agregado

- **Motor de validación de formularios** — `Proyecto/platform/public/js/validacion.js`
  - Configuración por formato: `VALIDACION_FORMATOS` (reglas separadas por formato).
  - **Campos obligatorios**: listado `requeridos`; rechaza vacíos, `null` y solo espacios.
  - **Fechas de diligenciamiento**: autollenado con la fecha actual al crear registro
    (`aplicarAutoFechas`) y **bloqueo de fechas futuras**.
  - **Números**: reglas `min`/`max` (p. ej. ft-sst-11 `diasIncapacidad ≥ 0`).
  - **Tablas dinámicas**: exige al menos una fila válida (`requerida`) y valida columnas
    obligatorias por fila (error por celda: `tabla.i.columna`).
  - **Tareas (SI/NO/NA)**: todas deben responderse en los formatos que las definen.
  - **Checklists**: todos los ítems de los grupos aplicables deben marcarse SI/NO.
    Un grupo con `soloSi: n` solo aplica si la `tarea n = SI`; `GENERAL` aplica siempre.
  - **Resaltado en la UI**: cada control lleva `data-path`; los errores marcan `.invalid`
    (borde/outline rojo), toast con contador y scroll al primer error.
    Al editar un campo, su resaltado se limpia.
  - Integrado en `UI.guardar()` (bloquea el guardado hasta corregir) y `UI.nuevo()`
    (autofechas). Setters (`setVal`/`setCheck`/`setTarea`/`setVerif`) limpian errores.

- **Suite de pruebas** — carpeta `tests/`
  - Unitarias con el runner nativo de Node (`node:test`): **41 tests** en
    `tests/unit/{validacion,util}.test.js` + helper `tests/unit/helpers/entorno.js`
    que carga `util.js` y `validacion.js` en Node (sin navegador).
  - E2E con **puppeteer-core**: `tests/e2e/validacion.e2e.js` (**10 casos**: bloqueo de
    guardado vacío, autofecha = hoy, guardado completo, fecha futura bloqueada, tabla
    vacía marcada, limpieza de error al editar).
  - Documentación: `tests/documentacion/validaciones.md` (reglas por formato),
    `tests/documentacion/pruebas.md` (guía unitarias/e2e/manuales).

- `.gitignore` — excluye `node_modules/`, datos generados (`data/`), PDFs y logs.

### Cambiado

- `README.md` — se añadió la sección de pruebas y se actualizó la estructura del proyecto.

### Reglas de validación por formato (configuración destacada)

| Formato   | Obligatorios clave                                                                 | Fechas auto/hoy | Tabla requerida       | Tareas | Checklists |
|-----------|-----------------------------------------------------------------------------------|-----------------|-----------------------|--------|------------|
| FT-OPE-06 | localizacion, lugarEspecifico, solicitante, responsable*, empresaEjecutora, descripcion, horas | fecha | ejecutantes | 6      | general + soloSi |
| FT-OPE-51 | lugar, trabajo, descripcion, horas, altura, ayudante, cálculos caída, firmas        | fecha, satisfaccion.fecha | personal | — | general |
| FT-OPE-56 | regional, ot, cliente, responsable                                                 | fecha           | asistencia            | —      | — |
| FT-SST-08 | mes, semana, anio, realiza, regional, revisa                                       | —               | participantes         | —      | — |
| FT-SST-11 | clasificacion, afectado, nit, cargo, fechas, responsable, sitio, queOcurrio        | fechaReporte    | planAccion            | —      | — |
| FT-SST-37 | trabajo, sitio, cliente, ciudad, fecha, peligros                                   | —               | pasos, equipo         | 7 (tareasAr) | — |
| FT-SST-39 | fechaLote                                                                          | fechaLote       | entregas              | —      | — |

## [2026-09-20] — Correcciones y robustez del frontend/backend

- **CSS**: `#spinner { display:flex }` (por ID) ganaba a `.hidden { display:none }`, por
  eso el overlay "Generando…" quedaba siempre visible. Corregido con
  `display: none !important` en las clases ocultas.
- **Render de tareas/checklists** (`form.js` y `util.js`): `checklists.grupos` es un
  **objeto** (mapa por grupo, p. ej. `{general, izaje, ...}`), no un arreglo; `tareas`
  usa `opciones`, no `items`; el texto del ítem vive en `nombre`/`corto`. Todos los
  renders normalizan ambas formas.
- **`renderHistorial()`** faltaba en `app.js` y rompía `abrirModal()`; implementado
  (trazabilidad eventos `{fecha, accion, usuario, detalle}`).
- **Timeouts**: la API usa `AbortController` con límite de 25 s; el login, 10 s.
- **Cache**: cache-busting `?v=20260920` en `index.html` y `Cache-Control: no-cache`
  para HTML y PDFs servidos.
- **Logging**: servidor registra cada petición (`[req] …`).

## [2026-09-20] — Puesta en marcha y documentación base

- `README.md` con requisitos, instalación (`npm install → npm run seed → npm start`),
  cuentas demo y notas sobre GitHub Pages (no aplicable por backend Node).

## [Fecha inicial] — Plataforma base

- API REST Express + frontend estático + generación de PDF (puppeteer-core).
- 7 formatos digitalizados (esquemas en `Proyecto/formatos/`):
  FT-OPE-06, FT-OPE-51, FT-OPE-56, FT-SST-08, FT-SST-11, FT-SST-37, FT-SST-39.
- Autenticación JWT con roles: Coordinador SST y SISO.
- Almacenamiento en archivos JSON; seed de datos demo.