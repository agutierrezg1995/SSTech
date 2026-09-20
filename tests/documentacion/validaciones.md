# Sistema de Validaciones — SSTech SaaS

Motor de validación estricto de los formularios. Vive en `Proyecto/platform/public/js/validacion.js`
(configuración por formato + funciones puras) y se dispara antes de guardar en `UI.guardar()`.

## Reglas generales

| Regla | Comportamiento |
|---|---|
| **Campos obligatorios** | Listados por formato en `VALIDACION_FORMATOS.<id>.requeridos`. Vacío, `null` o **solo espacios** → error `Campo obligatorio`. |
| **Fechas de diligenciamiento** | `fechasHoy`: se **autollenan con la fecha actual** al crear un registro nuevo (`aplicarAutoFechas`) y se **bloquean fechas futuras**. |
| **Números** | `numeros` con `{ min, max }`. Si el valor no es numérico → `Debe ser un número`. |
| **Tablas dinámicas** | `tablas.<key>.requerida` exige **al menos una fila válida**. `columnas` lista las celdas obligatorias de cada fila; el error apunta a `tabla.i.columna`. |
| **Tareas (SI/NO/NA)** | Si el esquema tiene `seccion.tareas`, **todas deben responderse** (salvo `cfg.tareas: false`). |
| **Checklists** | Todos los ítems de los grupos **aplicables** deben marcarse SI/NO. Un grupo con `soloSi: n` solo aplica si la `tarea n = SI`; el grupo `GENERAL` aplica siempre. |
| **Resaltado** | Cada control lleva `data-path`; en error se le añade `.invalid` (borde/outline rojo), con **toast contador** y **scroll al primer error**. Al editar el campo, el resaltado se limpia. |

## Configuración por formato

### FT-OPE-06 — Permiso de trabajo general
- **Obligatorios**: localizacion, lugarEspecifico, solicitante, responsableEquipo, responsableArea, empresaEjecutora, descripcion, horaInicio, horaFin.
- **Fechas auto + bloqueo futuro**: `fecha`.
- **Tabla**: `ejecutantes` (mín. 1 fila; nombre y C.C. obligatorios).
- **Tareas**: 6 (todas obligatorias). **Checklists**: grupos `general` (siempre), `izaje`/`caliente`/`armado`/`confinados`/`energias`/`frio` según la tarea marcada SI.

### FT-OPE-51 — Trabajo en alturas
- **Obligatorios**: lugarEspecifico, trabajo, descripcion, horaInicio, horaFin, altura, ayudanteNombre, caida.a/b/c/d/e/f, caida.siNo, firmas.emisor.
- **Fechas auto + bloqueo futuro**: `fecha`, `satisfaccion.fecha`.
- **Tabla**: `personal` (mín. 1 fila; nombre y N° doc. obligatorios).
- **Checklists**: grupo `general` (siempre, 20 ítems).

### FT-OPE-56 — Asistencia a jornada
- **Obligatorios**: regional, ot, cliente, responsable. **Fecha auto**: `fecha`.
- **Tabla**: `asistencia` (mín. 1 fila; nombre y cédula obligatorios).

### FT-SST-08 — Pausas activas
- **Obligatorios**: mes, semana, anio, realiza, regional, revisa.
- **Tabla**: `participantes` (mín. 1 fila; nombres y CC obligatorios).

### FT-SST-11 — Investigación de incidentes
- **Obligatorios**: clasificacion, afectado, nit, cargo, fechaIngreso, ciudad, responsable, cargoResponsable, fechaReporte, fechaEvento, horaEvento, turno, areaProceso, sitioOcurrencia, queOcurrio.
- **Fecha auto**: `fechaReporte`. **Número**: `diasIncapacidad` ≥ 0.
- **Tabla**: `planAccion` (mín. 1 fila; control y responsable obligatorios).

### FT-SST-37 — Análisis de trabajo seguro (ATS)
- **Obligatorios**: trabajo, sitio, cliente, ciudad, fecha, peligrosIdentificados.
- **Tareas**: `tareasAr` (7, todas obligatorias).
- **Tablas**: `pasos` (paso, peligros, medidas) y `equipo` (nombre, cédula).

### FT-SST-39 — Entrega de EPP
- **Obligatorios**: fechaLote. **Fecha auto**: `fechaLote`.
- **Tabla**: `entregas` (mín. 1 fila; cédula, nombre y cargo obligatorios).

## Archivo de configuración

En `public/js/validacion.js`:

- `VALIDACION_FORMATOS` — reglas por formato (clave = id de la carpeta en `Proyecto/formatos/`).
- `validarFormulario(esquema, data)` → `[{ ruta, msg }, ...]` (función pura, sin DOM).
- `aplicarAutoFechas(esquema, data)` — rellena con hoy las fechas de `fechasHoy` que estén vacías.
- `hoyISO()` → fecha actual en `YYYY-MM-DD`.
- `marcarErroresUI` / `quitarErrorUI` / `limpiarErroresUI` — resaltado en el formulario (DOM).

⚠️ Si se añade un formato nuevo, hay que crear su entrada en `VALIDACION_FORMATOS`; los tests
(`tests/unit/validacion.test.js`) verifican que todas las rutas configuradas existan en el esquema.