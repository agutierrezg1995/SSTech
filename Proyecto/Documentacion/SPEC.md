# ESPECIFICACIÓN DE SOFTWARE — SSTech SaaS

**Proyecto:** Plataforma de digitalización de formatos de Seguridad y Salud en el Trabajo (SST)
**Código del sistema:** SSTech-SaaS
**Versión del documento:** 1.0
**Fecha:** 2026-09-20
**Unidad de negocio:** SST / Seguridad Industrial — Proyecto de Formulación de Ingeniería
**Estatus con el usuario:** Aprobado en alcance inicial (validación académica; documento de referencia para el desarrollo y la evaluación del proyecto)

---

## 1. INTRODUCCIÓN

SSTech SaaS es una plataforma web para **digitalizar los formatos** de Seguridad y Salud en el Trabajo
que hoy se diligencian en papel. El objetivo es doble:

1. **Reemplazo del papel:** capturar datos a través de formularios electrónicos fieles a los formatos
   físicos (FT-OPE-06, FT-OPE-51, FT-OPE-56, FT-SST-08, FT-SST-11, FT-SST-37, FT-SST-39).
2. **Coordinación y seguimiento:** permitir que un **Coordinador SST** consulte el estado de todos los
   trabajos, apruebe/revise permisos, haga seguimiento de las actividades y analice **indicadores**
   calculados a partir de los datos capturados en cada formato.

**Regla de negocio central:** los formatos tipo "permiso" se aprueban solo si todas las respuestas de
las listas de verificación son **SI** o **NA**. Cualquier **NO** → estado **NO CONCEDIDO**.

---

## 2. ALCANCE

### 2.1. Dentro del alcance
- Captura digital de los 7 formatos SST.
- Generación de PDF fiel al formato físico (servidor, Puppeteer).
- CRUD (crear, consultar, editar, eliminar) por formato.
- Trazabilidad/historial de cada registro (auditoría).
- Roles: Coordinador SST y SISO.
- Tablero de indicadores por formato.
- Autenticación y control de acceso por rol.
- Almacenamiento persistente (JSON en esta fase, migrable a base real).

### 2.2. Fuera del alcance (fase actual)
- Notificaciones por correo/SMS.
- App móvil nativa.
- Firma electrónica certificada (la firma será captura textual/caja).
- Integración con ERP/SAP.
- Multi-empresa/multi-tenant real (diseñado para una empresa en esta fase).

---

## 3. ENTENDIMIENTO GENERAL

La idea general es que un **Coordinador SST** pueda **ver y hacer seguimiento a los distintos trabajos**
que se presentan. Para ello:

- Los **SISO** (Profesionales en Seguridad y Salud Ocupacional) diligencian los formatos en campo.
- Los formatos capturan datos estructurados (campos, tablas dinámicas, tareas SI/NO/NA, listas de verificación SI/NO).
- Cada formato genera indicadores específicos a partir de sus datos.
- El Coordinador revisa cada registro, ve su estado, consulta los PDF y usa los indicadores para la toma de decisiones.

### 3.1. Roles

| Rol | Descripción | Alcance |
|-----|-------------|---------|
| **Coordinador SST** | Supervisor del sistema. Ve todo, hace seguimiento, aprueba/revoca permisos, consulta indicadores. | Lectura total + aprobación + indicadores + gestión de usuarios (admin). |
| **SISO** | Profesional de campo. Crea y diligencia registros de su área, genera PDF. | Crear/editar sus registros, generar PDF, consultar sus registros. |

### 3.2. Flujo de uso principal

```
SISO diligencia formato → estado BORRADOR → Coordinador revisa → 
CONCEDIDO / NO CONCEDIDO (por regla de negocio) / CANCELADO →
Seguimiento + PDF + indicadores
```

---

## 4. REQUERIMIENTOS FUNCIONALES

### Módulo: Autenticación y Sesión

| ID | Requerimiento |
|----|---------------|
| RF-01 | El sistema debe permitir iniciar/cerrar sesión con usuario y contraseña. |
| RF-02 | El sistema debe mostrar el nombre, rol y empresa del usuario autenticado. |
| RF-03 | El Coordinador SST debe poder crear y gestionar cuentas de SISO. |
| RF-04 | Las acciones deben registrarse con el usuario que las realiza (auditoría). |

### Módulo: Catálogo de Formatos

| ID | Requerimiento |
|----|---------------|
| RF-10 | El sistema debe listar en un panel lateral cada formato SST con código, nombre y versión. |
| RF-11 | Debe soportarse la configuración de formatos vía esquema JSON (agregar formatos sin cambiar código del motor). |
| RF-12 | Al seleccionar un formato, el sistema debe mostrar sus registros en tabla CRUD. |

### Módulo: CRUD de Registros

| ID | Requerimiento |
|----|---------------|
| RF-20 | Crear un registro nuevo de un formato (con datos vacíos por defecto según esquema). |
| RF-21 | Editar los datos de un registro mediante formulario dinámico generado del esquema. |
| RF-22 | Eliminar un registro (solo Coordinador). |
| RF-23 | Consultar/leer un registro, incluida su trazabilidad (historial de cambios). |
| RF-24 | Buscar y filtrar registros por texto y por estado. |

### Módulo: Formulario Dinámico

| ID | Requerimiento |
|----|---------------|
| RF-30 | Renderizar los campos según el esquema: texto, textarea, número, fecha, hora, radio, checkbox, select. |
| RF-31 | Tablas dinámicas con filas agregables/quitableas (p. ej. ejecutantes, registro de asistencia). |
| RF-32 | Tareas tipo "SI / NO / NA" con respuesta individual. |
| RF-33 | Listas de verificación (checklists) SI/NO, algunas condicionadas (`soloSi`) a una tarea específica. |
| RF-34 | Contador del número de trabajadores que intervienen (campo número auto-incrementable). |

### Módulo: PDF

| ID | Requerimiento |
|----|---------------|
| RF-40 | Generar PDF de un registro con el formato fiel al documento físico (con Puppeteer). |
| RF-41 | El PDF debe ser descargable y visible en el navegador. |
| RF-42 | El nombre del archivo debe ser predecible: `<codigo>-<id registro>.pdf`. |
| RF-43 | El PDF debe incorporar firma/identificación del emisor y representantes según el formato. |

### Módulo: Estado del Permiso (Regla de Negocio)

| ID | Requerimiento |
|----|---------------|
| RF-50 | Estados posibles: `BORRADOR`, `CONCEDIDO`, `NO CONCEDIDO`, `CANCELADO`. |
| RF-51 | **Regla automática:** si alguna respuesta de verificación o tarea es `NO`, el estado pasa a `NO CONCEDIDO`. |
| RF-52 | Si no hay ningún `NO`, la regla propone `CONCEDIDO` (el Coordinador confirma/sobrescribe). |
| RF-53 | Solo el Coordinador SST puede aprobar (→ CONCEDIDO) o cancelar (→ CANCELADO) registros. |
| RF-54 | Revalidación/cancelación de permisos según las secciones del formato (FT-OPE-06, FT-OPE-51). |

### Módulo: Trazabilidad / Auditoría

| ID | Requerimiento |
|----|---------------|
| RF-60 | Cada registro debe guardar historial: fecha, acción (CREADO / ACTUALIZADO / ESTADO: X / ELIMINADO), usuario y detalle. |
| RF-61 | El historial debe visualizarse dentro del detalle del registro. |
| RF-62 | No se elimina el historial al eliminar el registro durante la vigencia del sistema (bitácora). |

### Módulo: Indicadores por Formato

| ID | Requerimiento |
|----|---------------|
| RF-70 | Cada pestaña de formato debe mostrar un tablero de indicadores calculados de sus registros. |
| RF-71 | Permitir filtro de indicadores por rango de fechas y por área/localización. |
| RF-72 | Exportar reporte (CSV) de los indicadores derivados. |
| RF-73 | El Coordinador SST es el único que ve indicadores globales de la empresa. |

**Indicadores definidos por formato (detalle en §7).**

### Módulo: Seguridad y Responsabilidades

| ID | Requerimiento |
|----|---------------|
| RF-80 | Las contraseñas deben almacenarse cifradas (hash). |
| RF-81 | Las rutas de la API deben validar autenticación y rol. |
| RF-82 | No exponer datos estructurados internos (esquemas completos solo para rol autorizado). |
| RF-83 | Registrar la fecha/hora y usuario de cada modificación (inmutabilidad del historial). |

---

## 5. REQUERIMIENTOS NO FUNCIONALES

| ID | Requerimiento |
|----|---------------|
| RNF-01 | **Rendimiento:** la generación de PDF debe tardar < 5 s en registros típicos. |
| RNF-02 | **Usabilidad:** el SPA debe ser usable en tablet y escritorio; flujo de captura sin recargar página. |
| RNF-03 | **Portabilidad:** correr en Windows/macOS/Linux con Node ≥ 18. |
| RNF-04 | **Despliegue:** contenedores Docker opcionales; servidor estático + API en el mismo proceso. |
| RNF-05 | **Disponibilidad:** 99% (proyecto académico); backups automáticos del almacén de datos. |
| RNF-06 | **Seguridad:** HTTPS en producción, validación de entrada, tamaño máximo de payload 10 MB. |
| RNF-07 | **Mantenibilidad:** esquemas por formato en archivos separados, documentados. |
| RNF-08 | **Idioma:** interfaz en español (Colombia) con formato de fechas es-CO. |

---

## 6. HISTORIAS DE USUARIO

Formato: `Como [rol], quiero [acción] para [beneficio]`.

### 6.1. Coordinador SST

| ID | Historia |
|----|----------|
| HU-C01 | Como Coordinador SST, quiero ver el listado de los 7 formatos en un panel lateral, para acceder rápidamente a cada uno. |
| HU-C02 | Como Coordinador SST, quiero ver una tabla de registros por formato con sus columnas clave y estado, para hacer seguimiento a los trabajos en curso. |
| HU-C03 | Como Coordinador SST, quiero buscar y filtrar registros por texto o por estado, para localizar un permiso específico entre decenas. |
| HU-C04 | Como Coordinador SST, quiero ver el detalle completo de un registro y su historial de cambios, para auditarlo. |
| HU-C05 | Como Coordinador SST, quiero generar y ver el PDF de un permiso, para adjuntarlo a la trazabilidad formal. |
| HU-C06 | Como Coordinador SST, quiero que el sistema marque automáticamente `NO CONCEDIDO` cuando haya una respuesta NO, para evitar emitir permisos inseguros. |
| HU-C07 | Como Coordinador SST, quiero aprobar/cancelar permisos manualmente, para ejercer el control final. |
| HU-C08 | Como Coordinador SST, quiero ver indicadores por formato (porcentaje de NO, permisos por mes, EPP con mayor no-conformidad, etc.), para priorizar acciones correctivas. |
| HU-C09 | Como Coordinador SST, quiero exportar los datos a CSV, para reportar a dirección. |
| HU-C10 | Como Coordinador SST, quiero crear y gestionar cuentas de SISO, para controlar quién diligencia. |

### 6.2. SISO

| ID | Historia |
|----|----------|
| HU-S01 | Como SISO, quiero crear un registro nuevo de un formato, para capturar la información en campo. |
| HU-S02 | Como SISO, quiero diligenciar un formulario que respete el orden y contenido del formato físico, para evitar errores de captura. |
| HU-S03 | Como SISO, quiero agregar/eliminar filas en tablas (ejecutantes, asistencias, entregas), para adaptarme a la cantidad real de personas. |
| HU-S04 | Como SISO, quiero responder tareas y listas de verificación con SI/NO/NA, para el análisis de riesgo. |
| HU-S05 | Como SISO, quiero que si coloco un NO el sistema lo indique claramente (estado NO CONCEDIDO), para no pasar por alto un riesgo. |
| HU-S06 | Como SISO, quiero guardar el registro como BORRADOR y retomarlo después, para diligenciar en campo con conexión intermitente. |
| HU-S07 | Como SISO, quiero generar el PDF de mi registro, para imprimirlo y firmarlo en formato físico si es necesario. |
| HU-S08 | Como SISO, quiero ver solo mis registros, para enfocarme en mi área. |

---

## 7. CASOS DE USO

### 7.1. Diagrama de casos de uso

Ver `../Diagramas/1-casos-de-uso.mmd`.

### 7.2. Lista de casos de uso

| # | Caso de uso | Actor(es) | Precondición | Flujo principal | Postcondición |
|---|-------------|-----------|--------------|-----------------|---------------|
| CU-01 | Iniciar sesión | Coordinador, SISO | Cuenta activa | Ingresar credenciales → validar → cargar rol | Sesión abierta |
| CU-02 | Ver catálogo de formatos | Ambos | Sesión abierta | Panel lateral muestra formatos | Formato seleccionado |
| CU-03 | Crear registro | SISO | Sesión abierta, formato seleccionado | Click "Nuevo registro" → formulario dinámico | Registro BORRADOR creado |
| CU-04 | Editar registro | SISO (propio), Coordinador (todos) | Registro existe | Abrir → editar campos → guardar | Registro actualizado + historial |
| CU-05 | Eliminar registro | Coordinador | Registro existe | Click eliminar → confirmación → borrar | Registro eliminado + bitácora |
| CU-06 | Buscar/filtrar registros | Ambos | Registros existentes | Escribir término/filtrar estado | Tabla filtrada |
| CU-07 | Generar PDF | Ambos | Registro existe | Click "PDF" → Puppeteer renderiza → abre visor | PDF generado/descargable (URL) |
| CU-08 | Aprobar permiso | Coordinador | Registro sin NO, o decisión manual | Cambiar estado → CONCEDIDO | Permiso autorizado |
| CU-09 | Aplicar regla de NO | Sistema | Respuesta NO registrada | Motor calcula estado | Estado NO CONCEDIDO |
| CU-10 | Ver trazabilidad | Coordinador | Registro existe | Abrir detalle → pestaña historial | Historial visible |
| CU-11 | Ver indicadores | Coordinador | Registros existentes | Abrir tablero de formato → filtrar → ver KPIs | Indicadores calculados |
| CU-12 | Exportar CSV | Coordinador | Registros filtrados | Click exportar → descarga CSV | Archivo descargado |
| CU-13 | Gestionar usuarios | Coordinador | Sesión Coordinador | Alta/baja de SISOs | Cuenta creada/modificada |
| CU-14 | Revalidar/cancelar permiso | Coordinador | Permiso CONCEDIDO | Actualizar sección revalidación → estado | Permiso revalidado/cancelado |

### 7.3. Detalle del caso de uso crítico — CU-09 "Aplicar regla de NO"

```
Actor: Sistema (automático)
1. El SISO responde un ítem de checklists/tareas con NO.
2. El formulario captura el valor NO en data.verif[grupo][i].
3. El motor calcula estadoPermiso(data).
4. Si existe cualquier NO → resultado NO CONCEDIDO.
5. El frontend actualiza el estado visible y el backend lo persiste.
Regla especial: si el estado actual es CANCELADO, no se sobrescribe.
```

---

## 8. INDICADORES POR FORMATO

Los indicadores son calculados con SQL/consulta sobre los registros. Definición por formato:

### FT-OPE-06 — Permiso de Trabajo en Campo
- **KP1:** Total de permisos emitidos (mes / rango).
- **KP2:** % de permisos CONCEDIDOS vs NO CONCEDIDOS.
- **KP3:** Índice de NO-conformidad: nº de NO / nº total de ítems verificados.
- **KP4:** Permisos por localización (PLANTA, PARQUE, PUNTO DE VENTA, GRANJA, OTRO).
- **KP5:** Distribución por tipo de tarea (izaje, trabajo en caliente, etc.).
- **KP6:** Trabajadores promedio por permiso (suma ejecutantes / nº permisos).
- **KP7:** Top EPP no disponible en registros con NO (si se registra causa).
- **KP8:** Duración promedio del permiso (hora fin − hora inicio).

### FT-OPE-51 — Permiso de Trabajo en Alturas
- **KP9:** % permisos de altura con sistemas de prevención completos (arnés+eslinga).
- **KP10:** % permisos que declaran ayudante de seguridad designado.
- **KP11:** % con distancia de caída calculada dentro del límite permitido.
- **KP12:** NO-conformidad en checklist de alturas.

### FT-OPE-56 — Control de Asistencia de Operaciones
- **KP13:** Asistencia total (suma participantes registrados).
- **KP14:** Asistencia promedio por sesión.
- **KP15:** Sesiones por turno / día / área.

### FT-SST-08 — Control semanal de Pausas Activas
- **KP16:** Sesiones de pausas activas por semana.
- **KP17:** Participantes promedio por sesión.
- **KP18:** % de cumplimiento vs programado (semáforo verde si ≥ objetivo semanal).

### FT-SST-11 — Reporte de Investigación A.T / I.T
- **KP19:** Nº de accidentes de trabajo (A.T.) e incidentes (I.T.) por mes.
- **KP20:** Índice de gravedad (nº días perdidos / nº A.T. * 1000).
- **KP21:** Causas más frecuentes (análisis de causas NTC 3701).
- **KP22:** % de planes de acción con responsable asignado y fecha de cierre.

### FT-SST-37 — Análisis de Trabajo Seguro (ATS)
- **KP23:** % de ATS por tipo de trabajo de alto riesgo.
- **KP24:** % de ATS con peligros registrados vs pasos descritos.
- **KP25:** NO-conformidad en checklists de ATS.

### FT-SST-39 — Control de Entregas de EPP
- **KP26:** Total de elementos entregados (por tipo de EPP).
- **KP27:** Cobertura EPP por trabajador (entregas / trabajadores activos).
- **KP28:** Tendencias mensuales de entrega de EPP.

> El tablero se muestra por pestaña de formato. Al no existir base de datos relacional en esta fase,
> los indicadores se calculan con funciones de agregación del controlador usando los registros JSON.

---

## 9. REGLAS DE NEGOCIO

| ID | Regla |
|----|-------|
| RN-01 | Cualquier `NO` en verificación → `NO CONCEDIDO` (automático). |
| RN-02 | Sin `NO` → el sistema propone `CONCEDIDO`; lo confirma el Coordinador. |
| RN-03 | `CANCELADO` es terminal (no se sobrescribe automáticamente). |
| RN-04 | El SISO solo opera sobre registros propios; el Coordinador sobre todos. |
| RN-05 | Un formato se genera directamente del esquema → la versión del PDF corresponde a `esquema.version`. |
| RN-06 | Eliminar un registro deja bitácora (no elimina la evidencia en el historial del período). |
| RN-07 | El número de trabajadores es contador sugerido; el SISO puede ajustarlo hacia arriba. |

---

## 10. MATRIZ DE TRAZABILIDAD (requisito ↔ caso de uso)

| Requisito | Caso de uso |
|-----------|-------------|
| RF-01..04 | CU-01, CU-13 |
| RF-10..12 | CU-02 |
| RF-20..24 | CU-03, CU-04, CU-05, CU-06 |
| RF-30..34 | CU-03, CU-04 |
| RF-40..43 | CU-07 |
| RF-50..54 | CU-08, CU-09, CU-14 |
| RF-60..62 | CU-10 |
| RF-70..73 | CU-11, CU-12 |
| RF-80..83 | CU-01, CU-05, CU-13 |

---

## 11. CRITERIOS DE ACEPTACIÓN (DEFINITION OF DONE)

1. Los 7 formatos renderizan formularios y PDF idénticos-en-estructura al físico.
2. La regla de NO funciona en los 7 formatos (verificación con datos de prueba).
3. El Coordinador ve indicadores calculados por formato con filtros.
4. El historial registra al menos CREADO/ACTUALIZADO/ESTADO/ELIMINADO con fecha-usuario.
5. Un SISO no puede aprobar ni eliminar registros.
6. Toda respuesta NO queda marcada visualmente en el PDF si corresponde.

---

## 12. GLOSARIO

| Término | Definición |
|---------|------------|
| SISO | Profesional en Seguridad y Salud Ocupacional / Seguridad Industrial. |
| Coordinador SST | Rol supervisor que ve, aprueba y hace seguimiento de todos los trabajos. |
| BORRADOR | Registro en edición, no autorizado. |
| CONCEDIDO | Permiso aprobado y vigente. |
| NO CONCEDIDO | Permiso denegado por respuesta NO en verificación. |
| CANCELADO | Permiso revocado (estado terminal). |
| A.T. / I.T. | Accidente de Trabajo / Incidente de Trabajo. |
| EPP | Equipo de Protección Personal. |
| ATS | Análisis de Trabajo Seguro. |
| NTC 3701 | Norma Técnica Colombiana relacionada con la identificación de peligros. |