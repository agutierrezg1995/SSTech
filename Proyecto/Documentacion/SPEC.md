# ESPECIFICACIÓN DE SOFTWARE — SSTech SaaS

**Proyecto:** Plataforma de digitalización de formatos de Seguridad y Salud en el Trabajo (SST)
**Código del sistema:** SSTech-SaaS
**Versión del documento:** 2.0 — especificación completa e integrada
**Fecha:** 2026-09-26
**Versión del software descrita:** v0.2.0
**Unidad académica:** Formulación de Proyectos de Ingeniería
**Área usuaria:** SST / Seguridad Industrial y Seguridad y Salud en el Trabajo
**Estado:** Vigente — documento de referencia para desarrollo, pruebas, demostración y evaluación

---

## ÍNDICE

| # | Sección |
|---|---------|
| 0 | Control del documento |
| 1 | Introducción |
| **2** | **Guía de ejecución: qué se debe ejecutar para probar el sistema** |
| **3** | **Público objetivo** |
| 4 | Antecedentes, problema y justificación |
| 5 | Objetivos |
| 6 | Alcance |
| **7** | **Restricciones** |
| 8 | Requisitos funcionales |
| 9 | Requisitos no funcionales |
| 10 | Reglas de negocio |
| 11 | Modelo de datos |
| **12** | **Arquitectura: separación frontend / backend** |
| 13 | Especificación de la API REST |
| 14 | Catálogo de formatos |
| 15 | Motor de validación |
| 16 | Indicadores por formato |
| **17** | **Historias de usuario** |
| **18** | **Casos de uso** |
| **19** | **Estrategia de pruebas** |
| **20** | **Casos de prueba** |
| **21** | **Matriz de trazabilidad** |
| **22** | **Seguridad** |
| 23 | Despliegue |
| 24 | Operación y mantenimiento |
| 25 | Diagramas |
| 26 | Definición de Hecho, deuda técnica, plan, riesgos, glosario y anexos |

---

## 0. CONTROL DEL DOCUMENTO

| Campo | Valor |
|-------|-------|
| Documento | `Proyecto/Documentacion/SPEC.md` |
| Versión | 2.0 |
| Sustituye a | v1.0 (2026-09-20) — ampliada con público objetivo, restricciones, guía de ejecución, pruebas y separación frontend/backend |
| Estado | Aprobado para uso académico y como contrato técnico de las fases actuales |
| Palabras clave | SST, EPP, ATS, permiso de trabajo, formatos, digitalización, indicadores, trazabilidad |

**Documentos relacionados**

| Documento | Contenido |
|-----------|-----------|
| `README.md` | Instalación rápida, cuentas demo, estructura |
| `Proyecto/Documentacion/stack.md` | Stack tecnológico y decisiones (ADR) |
| `Proyecto/Documentacion/arquitectura.md` | Arquitectura de componentes y roadmap |
| `Proyecto/Documentacion/auditoria-y-ejecucion.md` | Auditoría, fases, riesgos |
| `ESTRATEGIAS-DIGITALIZACION-FORMATOS.md` | Estrategia de conversión PDF → formulario digital |
| `tests/documentacion/validaciones.md` | Reglas de validación por formato |
| `tests/documentacion/pruebas.md` | Guía de ejecución de pruebas |
| `CHANGELOG.md` | Historial de cambios |
| `Proyecto/Diagramas/*.mmd` | Diagramas Mermaid |

---

## 1. INTRODUCCIÓN

### 1.1 Propósito

Este documento especifica, de forma completa y verificable, el sistema **SSTech SaaS**: una aplicación web
que **digitaliza los formatos de Seguridad y Salud en el Trabajo** que actualmente se diligencian en
papel, y que además permite **seguimiento, control de estados, generación de documentos oficiales en PDF
y análisis mediante indicadores**.

La especificación cubre el alcance, los requisitos funcionales y no funcionales, las reglas de negocio,
el modelo de datos, la arquitectura (con separación explícita entre **frontend** y **backend**), el
contrato de la API, las historias de usuario, los casos de uso, la estrategia y los casos de prueba, y
las instrucciones exactas para **ejecutar y demostrar el sistema**.

### 1.2 Alcance de este documento

Este documento describe el sistema **tal como está implementado en la versión v0.2.0**, y distingue
explícitamente entre:

- **(IMPL)** Requisito implementado y verificable en el código actual.
- **(PLAN)** Requisito especificado pero previsto para una fase posterior (ver §26.3).

No se documenta como existente ninguna funcionalidad que no esté en el código.

### 1.3 Convenciones de identificadores

| Convención | Significado |
|------------|-------------|
| `RF-xx` | Requisito funcional |
| `RNF-xx` | Requisito no funcional |
| `RN-xx` | Regla de negocio |
| `HU-xx` | Historia de usuario |
| `CU-xx` | Caso de uso |
| `KP-xx` | Indicador (Key Performance Indicator) |
| `T-U-xx` | Caso de prueba unitaria |
| `T-E-xx` | Caso de prueba end-to-end |
| `T-I-xx` | Caso de prueba de integración |
| `T-M-xx` | Caso de prueba manual |
| `D-xx` | Decisión de diseño (ADR) |

### 1.4 Glosario técnico de identificadores usados en la especificación

| Identificador | Significado |
|---------------|-------------|
| `id` de formato | Identificador técnico en minúsculas con guiones (`ft-ope-06`) |
| `codigo` | Código oficial del formato (`FT-OPE-06`) |
| `version` | Versión del formato (`07`, `01`, …) |
| `esquema` | Objeto JavaScript que define completamente un formato (contrato) |
| `data` | Objeto con los valores capturados de un registro, indexado por `key` |
| `key` | Nombre interno de un campo, tabla, grupo de tareas o de checklist |
| `ruta` (path) | Ruta punteada dentro de `data`, p. ej. `caida.a`, `verif.izaje.0`, `planAccion.1.responsable` |
| `soloSi` | Regla de condicionalidad de un grupo de checklist respecto a una tarea |
| `estado` | Estado del registro: `BORRADOR`, `CONCEDIDO`, `NO CONCEDIDO`, `CANCELADO` |
| `historial` | Lista append-only de eventos de auditoría de un registro |

---

## 2. GUÍA DE EJECUCIÓN — QUÉ SE DEBE EJECUTAR PARA PROBAR EL SISTEMA

> Esta sección responde la pregunta: **¿qué tengo que ejecutar, en qué orden, para poder levantar y
> probar el sistema completo?** Es el punto de entrada de referencia del proyecto.

### 2.1 Requisitos previos

| Requisito | Versión mínima | Verificación |
|-----------|----------------|--------------|
| Node.js | **18 o superior** (probado con **v24.15.0**) | `node -v` |
| npm | 9 o superior (probado con **11.12.1**) | `npm -v` |
| Google Chrome **o** Microsoft Edge | Cualquier versión reciente | Rutas probadas abajo |
| Sistema operativo | Windows 10/11, macOS o Linux | — |
| Navegador | Chrome, Edge o Firefox recientes | — |
| Conexión a internet | **No es necesaria** para ejecutar (solo para `npm install` la primera vez) | — |

Rutas de navegador que el motor de PDF detecta automáticamente (`Proyecto/platform/lib/pdf.js`):

```
C:\Program Files\Google\Chrome\Application\chrome.exe
C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
C:\Program Files\Microsoft\Edge\Application\msedge.exe
C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
```

La lista anterior está **codificada en el propio módulo** (`lib/pdf.js`, constante `CHROME_PATHS`): la
versión actual **no** lee la variable de entorno `CHROME_PATH`, por lo que en Linux o macOS habría que
editar esa constante (ver DT-01 y §26.3, actividad 4). Si no se encuentra ningún navegador, el endpoint
de PDF responde **HTTP 500** con el mensaje *"No se encontró Chrome/Edge instalado en el servidor"*.

### 2.2 Secuencia de arranque

**Terminal 1 — dependencias, datos y servidor**

```bash
# 1. Entrar a la carpeta del backend
cd "Proyecto/platform"

# 2. Instalar dependencias (solo la primera vez; crea node_modules/)
npm install

# 3. Sembrar datos: crea usuarios demo y 26 registros de demostración
npm run seed

# 4. Arrancar el servidor
npm start
```

Salida esperada del paso 4:

```
────────────────────────────────────────────
  SSTech SaaS  |  Plataforma SST  v0.2.0
  http://localhost:3200
────────────────────────────────────────────
```

**Terminal 2 — solo para las pruebas automáticas (opcional)**

```bash
# Pruebas unitarias (no requiere servidor)
node --test "tests/unit/*.test.js"

# Pruebas end-to-end (requiere el servidor del paso 4 arriba)
node tests/e2e/validacion.e2e.js
```

### 2.3 Verificación de que el sistema está arriba

| Qué verificar | Cómo | Resultado esperado |
|---------------|------|--------------------|
| El servidor responde | En el navegador: abrir `http://localhost:3200` | Pantalla de **inicio de sesión** |
| La API responde | Abrir `http://localhost:3200/api/estado` | `{"app":"SSTech-SaaS","version":"0.2.0","formatos":7,...}` |
| Los formatos se cargaron | Tras iniciar sesión, la barra lateral izquierda | **7** formatos listados |
| La base de datos se sembró | En `Proyecto/platform/data/` existen `usuarios.json`, `sesiones.json` y **7** archivos `ft-*.json` | 26 registros en total |
| El PDF funciona | Con un registro guardado, pulsar **PDF** | Se abre el visor con el documento A4 |

### 2.4 Cuentas de prueba (creadas por `npm run seed`)

| Rol | Correo | Contraseña | Permisos efectivos |
|-----|--------|-----------|---------------------|
| **Coordinador SST** | `coordinador@sstech.co` | `coordinador123` | Acceso total: ve todos los registros, aprueba, cancela, elimina, administra usuarios, ve indicadores, exporta CSV |
| **SISO** | `siso@sstech.co` | `siso123` | Solo sus propios registros: crea, edita, genera PDF; no aprueba, no elimina, no ve indicadores ni usuarios |

> Las cuentas se crean **solo si no existen**. Ejecutar `npm run seed` varias veces no duplica usuarios.

### 2.5 Recorrido de demostración mínimo (10 minutos)

1. Abrir `http://localhost:3200`.
2. Iniciar sesión como **Coordinador** (`coordinador@sstech.co` / `coordinador123`).
3. En la barra lateral, seleccionar **FT-OPE-06 · Permiso de Trabajo en Campo** (debe mostrar 7 registros).
4. Confirmar que la tabla muestra los 4 estados presentes: `CONCEDIDO`, `NO CONCEDIDO`, `BORRADOR`, `CANCELADO`.
5. Pulsar **＋ Nuevo registro** → pulsar **Guardar** sin diligenciar:
   debe **bloquear el guardado**, resaltar los campos obligatorios en rojo y mostrar el contador de errores.
6. Observar que el campo **fecha** se autollenó con la fecha de hoy.
7. Diligenciar: localización, lugar, solicitante, responsables, descripción, horas, una fila de
   ejecutantes, las 6 tareas y los checklists → **Guardar** debe crear el registro y mostrar *"Registro guardado"*.
8. Marcar un ítem de checklist como **NO** y guardar como Coordinador:
   el estado debe cambiar a **NO CONCEDIDO**.
9. Pulsar **PDF** → se abre el visor con el documento generado; usar **Descargar**.
10. Abrir **Indicadores** → revisar las tarjetas KPI (KP1…KP8) y usar **Exportar CSV**.
11. Abrir **Usuarios** → crear un SISO nuevo; cerrar sesión e iniciar sesión con ese usuario.
12. Repetir el paso 7 con el usuario SISO y verificar que **no** aparecen los botones de eliminar,
    aprobar, usuarios ni indicadores.

### 2.6 Comandos de referencia

| Comando | Descripción | ¿Requiere servidor? |
|---------|-------------|----------------------|
| `npm install` | Instala dependencias (`express`, `puppeteer-core`, `sweetalert2`, `animate.css`) | No |
| `npm start` | Inicia el servidor (API + frontend + PDF) en el puerto 3200 | — |
| `npm run dev` | Alias de `npm start` | — |
| `npm run seed` | Crea usuarios demo y 26 registros de demostración | No |
| `node --test "tests/unit/*.test.js"` | Ejecuta la suite de pruebas unitarias | No |
| `node tests/e2e/validacion.e2e.js` | Ejecuta la prueba end-to-end en navegador real | **Sí** |
| `node Proyecto/platform/lib/indicadores.js` | Auto-prueba del motor de indicadores con datos de ejemplo | No |

Variables de entorno admitidas:

| Variable | Por defecto | Uso |
|----------|-------------|-----|
| `PORT` | `3200` | Puerto del servidor |
| `SSTECH_URL` | `http://localhost:3200/` | URL usada por la prueba e2e |
| `SSTECH_EMAIL` | `coordinador@sstech.co` | Usuario de la prueba e2e |
| `SSTECH_PASSWORD` | `coordinador123` | Contraseña de la prueba e2e |

### 2.7 Solución de problemas frecuentes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `Error: Cannot find module 'express'` | No se ejecutó `npm install` | `cd Proyecto/platform && npm install` |
| Pantalla de login pero "No se pudo conectar al servidor" | El servidor no está corriendo o el puerto está ocupado | Ejecutar `npm start`; si el puerto 3200 está ocupado, usar `PORT=3300 npm start` |
| Login responde *"Credenciales inválidas"* | No se ejecutó el seed, o se borró `data/usuarios.json` | Ejecutar `npm run seed` |
| La lista de formatos está vacía | Faltan los esquemas o la ruta de búsqueda es incorrecta | Verificar que exista `Proyecto/formatos/<id>/esquema.js` |
| El PDF devuelve error 500 | No se encontró Chrome/Edge | Instalar Chrome o Edge, o corregir la constante `CHROME_PATHS` en `lib/pdf.js` |
| La prueba e2e falla por Chrome | La ruta de Chrome está fija en el script | Ajustar la constante `chrome` en `tests/e2e/validacion.e2e.js` o usar Edge |
| La foto de perfil se ve cortada | Truncamiento a 6000 caracteres en `lib/auth.js` | Reducir la imagen antes de subirla |
| El overlay "Generando…" no desaparece | CSS: `.hidden` debe ganarle al spinner | Verificar `display: none !important` en las clases ocultas de `app.css` |

---

## 3. PÚBLICO OBJETIVO

### 3.1 Resumen

SSTech SaaS se dirige a un público **profesional técnico-operativo del sector de Seguridad y Salud en el
Trabajo**, con un uso **mixto**: captura intensiva en campo (dispositivo móvil o tableta) y
consulta/gerencia en escritorio. No es un producto de consumo masivo; el usuario tiene conocimiento
del dominio y requiere **fidelidad documental** y **trazabilidad**.

### 3.2 Segmentos de usuarios

| # | Segmento | Peso estimado | Tipo de uso | Frecuencia |
|---|----------|---------------|-------------|------------|
| S1 | Coordinadores SST | ~15 % | Supervisión, aprobación, indicadores | Diaria |
| S2 | Profesionales SISO de campo | ~60 % | Diligenciamiento de formatos en sitio | Diaria |
| S3 | Dirección / auditoría interna | ~10 % | Consulta de indicadores, exportes y PDF | Semanal |
| S4 | Soporte TI / administración del sistema | ~5 % | Siembra de datos, respaldos, mantenimiento | Ocasional |
| S5 | Docentes / evaluadores del proyecto | ~10 % | Evaluación funcional y técnica | Puntual |

### 3.3 Perfiles de usuario detallados

#### U1 — Coordinador SST *(usuario primario del sistema)*

| Aspecto | Descripción |
|---------|-------------|
| **Perfil** | Ingeniero o técnico de SST con 5–15 años de experiencia; supervisa permisos de trabajo, investigación de incidentes y cumplimiento del SG-SST |
| **Contexto de uso** | Oficina o sala de reuniones; **escritorio o tableta**; jornada de oficina |
| **Objetivo** | Ver todos los trabajos en curso, aprobar o denegar permisos, detectar no conformidades y generar reportes para la dirección |
| **Tareas principales** | 1) Iniciar sesión 2) Revisar la tabla de registros de cada formato 3) Buscar y filtrar 4) Aprobar / cancelar 5) Ver el historial 6) Generar PDF 7) Revisar indicadores 8) Exportar CSV 9) Crear cuentas SISO |
| **Dolores que resuelve** | Pierde el control de qué permisos se emitieron; no detecta a tiempo una no conformidad; arma reportes manualmente en Excel |
| **Expectativas de interfaz** | Prioriza el **listado** sobre el detalle; espera la información en pantalla, sin descargas; no debe tener que aprender atajos |
| **Nivel de sofisticación** | Medio; usa correo, tablas de Excel y formularios; no espera funciones analíticas |

#### U2 — SISO / Profesional de Seguridad Industrial *(usuario de mayor volumen)*

| Aspecto | Descripción |
|---------|-------------|
| **Perfil** | Técnico o profesional de SST que se desplaza a la operación (planta, parque, granja, punto de venta) |
| **Contexto de uso** | **Terreno**: tableta o celular con conectividad intermitente, guantes puestos, poco tiempo disponible |
| **Objetivo** | Diligenciar el formato correcto en el momento correcto, sin errores ni omisiones, y poder imprimir o descargar el PDF en el sitio |
| **Tareas principales** | 1) Iniciar sesión 2) Elegir el formato 3) Crear registro nuevo 4) Diligenciar con tablas dinámicas y checklists 5) Guardar como BORRADOR y retomar 6) Generar PDF 7) Ver sus propios registros |
| **Dolores que resuelve** | Formularios en papel que se pierden o se deterioran; tener que llamar al coordinador para preguntar qué formato va; errores de omisión que invalidan el permiso |
| **Expectativas de interfaz** | Controles grandes y pulsables; mensajes claros de qué falta; no debe ver botones que no puede usar; debe poder trabajar aunque la red falle temporalmente |
| **Nivel de sofisticación** | Medio; el sistema no debe requerir capacitación extensa |

#### U3 — Dirección / Auditoría interna

| Aspecto | Descripción |
|---------|-------------|
| **Perfil** | Gerente de operaciones, jefe de planta o auditor interno |
| **Objetivo** | Ver indicadores consolidados, descargar evidencia en PDF y exportar datos para auditoría |
| **Uso** | Lectura; nunca crea ni edita registros |
| **Expectativas** | Datos claros, filtros por fecha, archivo CSV y PDF |

#### U4 — Soporte TI / Administración del sistema

| Aspecto | Descripción |
|---------|-------------|
| **Perfil** | Persona encargada de la operación técnica de la herramienta |
| **Objetivo** | Instalar, sembrar datos, hacer respaldos, resolver incidencias |
| **Uso** | Línea de comandos: `npm install`, `npm run seed`, `npm start` |

#### U5 — Docente / evaluador del proyecto

| Aspecto | Descripción |
|---------|-------------|
| **Perfil** | Docente o jurado del curso de Formulación de Proyectos de Ingeniería |
| **Objetivo** | Verificar que el sistema cumple los requisitos del proyecto y la estrategia de digitalización |
| **Uso** | Demostración guiada siguiendo la §2.5 de este documento |

### 3.4 Necesidades por perfil

| Necesidad | U1 | U2 | U3 | U4 | U5 |
|-----------|----|----|----|----|----|
| Autenticación con rol | Si | Si | Si | — | Si |
| Diligenciar formatos en campo | — | Si | — | — | Si |
| Aprobar / denegar permisos | Si | No | — | — | Si |
| Generar PDF fiel al físico | Si | Si | Si | — | Si |
| Indicadores y reportes | Si | No | Si | — | Si |
| Exportar CSV | Si | — | Si | — | Si |
| Gestión de usuarios | Si | No | — | Si | Si |
| Trazabilidad / auditoría | Si | Si | Si | — | Si |
| Configuración de perfil | Si | Si | — | — | — |

### 3.5 Contexto de uso

| Dimensión | Definición |
|-----------|------------|
| **Linguístico** | Español de Colombia; fechas y números en locale `es-CO`; códigos de formato mixtos (`FT-OPE-06`) |
| **Cultural** | Cultura organizacional de planta industrial: uso de formatos normados, jerarquía Coordinador/SISO, respaldo en documento físico firmado |
| **Tecnológico** | Navegador de escritorio o tableta; sin instalación de software cliente; sin conocimiento de bases de datos |
| **Físico** | Archivo digital; soporte de papel físico como respaldo y para firma manuscrita |
| **Temporal** | Jornada laboral diurna; el permiso tiene vigencia con fecha y hora de inicio y fin |

### 3.6 Experiencia de usuario objetivo

| Objetivo de UX | Cómo se cumple |
|----------------|---------------|
| Cero fricción de entrada | Login con 2 campos; sesión restaurada automáticamente si el token sigue vigente (12 h) |
| Ver el estado sin interpretarlo | Código de color por estado (`BORRADOR`, `CONCEDIDO`, `NO CONCEDIDO`, `CANCELADO`) en tabla y en formulario |
| No dejar escapar errores | Validación estricta antes de guardar: resaltado rojo, contador de errores y desplazamiento al primer problema |
| Interfaz coherente por rol | Elementos no autorizados por rol se ocultan (indicadores, usuarios, eliminar, aprobar) |
| Confirmación en acciones destructivas | Diálogos de confirmación animados (SweetAlert2) antes de eliminar o cerrar sesión |
| Navegación sin recargas | SPA: cambiar de formato, guardar y generar PDF no recarga la página |
| Recuperación ante fallos de red | Tiempo de espera definido por petición (25 s API, 10 s login) y mensajes accionables |

---

## 4. ANTECEDENTES, PROBLEMA Y JUSTIFICACIÓN

### 4.1 Antecedentes

La unidad de negocio utiliza **siete formatos normados** de Seguridad y Salud en el Trabajo
(impresos en papel, con sus versiones vigentes declaradas en el código del formato):

| Código | Formato | Versión | Fecha del formato |
|--------|---------|---------|-------------------|
| FT-OPE-06 | Permiso de Trabajo en Campo | 07 | mar-2023 |
| FT-OPE-51 | Permiso de Trabajo en Alturas | 01 | ene-2023 |
| FT-OPE-56 | Control de asistencia de Operaciones | 02 | jul-2026 |
| FT-SST-08 | Control semanal de pausas activas | 01 | ene-22 |
| FT-SST-11 | Reporte de Investigación de A.T e I.T | 04 | jun-23 |
| FT-SST-37 | Análisis de Trabajo Seguro (ATS) | 06 | ago-22 |
| FT-SST-39 | Control de Entregas de EPP | 01 | ene-2021 |

Los PDF originales se conservan como **fuente de verdad** en la carpeta `Formatos/`.

### 4.2 Problema

| # | Problema | Consecuencia actual |
|---|----------|----------------------|
| P1 | Diligenciamiento en papel | Pérdida, deterioro, doble digitación e inconsistencias |
| P2 | Sin validación en el momento de la captura | Permisos emitidos con ítems críticos sin responder |
| P3 | Aprobación informal sin evidencia | Sin respaldo de quién autorizó y cuándo |
| P4 | Centralización de la información en el papel | El Coordinador no puede ver el estado real de los trabajos |
| P5 | Indicadores no calculables | La dirección no recibe datos de no conformidad ni de cumplimiento |
| P6 | Sin trazabilidad de cambios | No se puede auditar quién cambió un permiso y por qué |
| P7 | Redigitación para reportes | Horas de trabajo manual en Excel cada período |

### 4.3 Justificación

La digitalización con **validación estricta en el momento de la captura** y **generación automática del
documento oficial en PDF** elimina P1–P3 y P7; la **bitácora por registro** y la **consulta por estado**
eliminan P4 y P6; y el **motor de indicadores por formato** elimina P5. Además convierte el formato
impreso en un documento con **integridad de datos** y **trazabilidad**, que es el propósito del SG-SST.

### 4.4 Estrategia de digitalización adoptada

Los siete PDF se descomponen en **bloques funcionales reutilizables** (encabezado, datos generales,
tablas repetibles, listas de verificación condicionales, firmas, revalidación). El sistema **no
programa cada formato por separado**: los describe en un **esquema declarativo** y dos motores
(frontend y PDF) los interpretan. Agregar un formato no requiere modificar el núcleo del sistema.

---

## 5. OBJETIVOS

### 5.1 Objetivo general

Desarrollar una plataforma web (**SSTech SaaS**) que digitalice los 7 formatos SST de la unidad de
negocio, permitiendo la captura validada en campo, la generación del documento oficial en PDF, el
seguimiento por estados, la trazabilidad y el cálculo de indicadores, sobre una arquitectura de dos
capas con separación de responsabilidades entre frontend y backend.

### 5.2 Objetivos específicos

| # | Objetivo específico | Indicador de logro |
|---|--------------------|--------------------|
| OE-1 | Digitalizar el 100 % de los formatos (7/7) | 7 esquemas registrados y navegables |
| OE-2 | Garantizar la fidelidad del PDF frente al documento físico | PDF generado desde el esquema con cabecera, secciones, tablas y listas de verificación |
| OE-3 | Impedir la emisión de permisos con respuestas `NO` | Regla automática de estado probada con pruebas unitarias |
| OE-4 | Proteger la trazabilidad de cada registro | Historial append-only con fecha, acción y usuario |
| OE-5 | Separar responsabilidades entre frontend y backend | Capa de presentación con `fetch` puro; API REST con autenticación y control de roles en el servidor |
| OE-6 | Limitar el acceso según el rol | Un SISO no aprueba, no elimina y no ve indicadores globales |
| OE-7 | Proveer indicadores por formato | 36 indicadores implementados (28 base + 8 con sufijo) con filtros por fecha y campo |
| OE-8 | Validar la captura antes de persistir | Motor de validación por formato con obligatorios, fechas, números, tablas, tareas y checklists |
| OE-9 | Permitir la trazabilidad documental con respaldo físico | PDF descargable e imprimible en cualquier equipo |
| OE-10 | Generar reportes para la dirección | Exportación de registros e indicadores en CSV |

### 5.3 Objetivos no perseguidos (no objetivos)

- No se busca reemplazar al SG-SST certificado ni a la auditoría externa.
- No se busca sustituir la firma manuscrita en esta fase.
- No se busca sustituir el ERP, la nómina o el sistema de mantenimiento.
- No se busca un producto de consumo masivo ni público general.
- No se busca soportar millones de registros en esta fase.

---

## 6. ALCANCE

### 6.1 Dentro del alcance (fase actual, implementado)

| # | Elemento | Detalle |
|---|----------|---------|
| A1 | **Autenticación y sesión** | Inicio/cierre de sesión, token opaco de 32 bytes con expiración de 12 h, hash de contraseñas con `scrypt` |
| A2 | **Roles y control de acceso** | Coordinador SST y SISO, con restricciones por endpoint y por interfaz |
| A3 | **Gestión de usuarios** | El Coordinador crea subalternos SISO; cualquier usuario gestiona su propio perfil (nombre, cargo, cédula, teléfono, foto) |
| A4 | **Catálogo de formatos** | Panel lateral con 7 formatos (código, nombre, versión, fecha, icono y color) |
| A5 | **Formulario dinámico** | Render desde esquema: 8 tipos de campo, tablas con filas agregables, tareas SI/NO/NA, checklists condicionales |
| A6 | **CRUD de registros** | Crear, listar (paginado 12 por página), leer, editar, eliminar (solo Coordinador) |
| A7 | **Búsqueda y filtros** | Filtro por texto libre y por estado, aplicados sobre los registros visibles |
| A8 | **Estados del permiso** | `BORRADOR`, `CONCEDIDO`, `NO CONCEDIDO`, `CANCELADO`, con regla automática por respuestas `NO` |
| A9 | **Generación de PDF** | Render en servidor con Puppeteer-core + Chrome/Edge del sistema, salida A4, nombre predecible, visor en `iframe` y descarga |
| A10 | **Trazabilidad** | Historial append-only por registro con `CREADO`, `ACTUALIZADO` y `ESTADO: <valor>` |
| A11 | **Indicadores** | 36 KPIs distribuidos en los 7 formatos, con filtros por rango de fechas y por campo/valor |
| A12 | **Exportación** | CSV de registros filtrados y CSV de indicadores (generados en el navegador con BOM UTF-8) |
| A13 | **Validación estricta** | Motor por formato: obligatorios, fechas no futuras, rangos numéricos, tablas, tareas y checklists |
| A14 | **Datos de demostración** | Siembra de 2 usuarios demo y 26 registros en los 7 formatos, con estados variados |
| A15 | **UX profesional** | SweetAlert2 (confirmaciones), Animate.css (animaciones), degradados, glassmorphism, avatares y foto de perfil |
| A16 | **Persistencia en archivos** | Un archivo JSON por formato, con escritura por archivo completo |

### 6.2 Fuera del alcance (fase actual)

| # | Elemento excluido | Justificación / alternativa prevista |
|---|-------------------|----------------------------------------|
| E1 | Notificaciones por correo o SMS | Se abandonan en esta fase |
| E2 | Aplicación móvil nativa | La versión web responsiva cubre el uso en campo |
| E3 | Firma electrónica certificada | La firma es textual; el PDF puede imprimirse para firma física |
| E4 | Integración con ERP / SAP / mantenimiento | Fuera del proyecto académico |
| E5 | Multi-empresa real (multi-tenant) | Diseñado para una unidad de negocio en esta fase |
| E6 | Roles adicionales (brigadista, auditor, jefe de planta) | Solo dos roles en esta fase |
| E7 | Carga masiva de registros (importación de Excel) | La captura se hace por formulario |
| E8 | Flujo de trabajo configurable por el usuario | El flujo es fijo por la definición de la regla de negocio |
| E9 | Reportes PDF consolidados multi-formato | El consolidado es un CSV de indicadores por formato |
| E10 | Publicación en GitHub Pages | El sistema requiere backend Node; se desplegaría en Render, Railway o servidor propio |

### 6.3 Supuestos

| # | Supuesto |
|---|-----------|
| S1 | Los PDF de la carpeta `Formatos/` son la fuente de verdad del diseño de cada formato |
| S2 | La unidad de negocio tiene una sola sede lógica; no se requiere aislamiento por empresa en esta fase |
| S3 | Cada usuario tiene un dispositivo con navegador moderno (Chrome, Edge o Firefox) |
| S4 | Se dispone de Node.js 18 o superior en el entorno de ejecución |
| S5 | Los datos son de volumen moderado (decenas o cientos de registros por formato) |
| S6 | El servidor que genera el PDF tiene Chrome o Edge instalado |
| S7 | La fecha del sistema es correcta (las validaciones de "fecha no futura" dependen de ella) |

### 6.4 Dependencias

| Dependencia | Tipo | Efecto si falla |
|-------------|------|-----------------|
| Esquemas en `Proyecto/formatos/<id>/esquema.js` | Interna | El formato no aparece en la plataforma |
| Chrome o Edge en el servidor | Externa | El endpoint de PDF responde 500 |
| Sistema de archivos escribible en `data/` y `pdfs/` | Interna | No se pueden crear registros ni generar PDF |
| `node_modules/` instalado | Interna | El servidor no arranca |

---

## 7. RESTRICCIONES

> Esta sección es de cumplimiento obligatorio. Ninguna decisión de diseño puede violar una
> restricción sin una excepción documentada y aprobada.

### 7.1 Restricciones técnicas

| # | Restricción | Consecuencia de diseño |
|---|-------------|------------------------|
| RT-1 | **El PDF debe ser fiel al formato físico** (fuente de verdad: `Formatos/*.pdf`) | El motor de PDF se construye sobre el esquema, no sobre libertad de diseño |
| RT-2 | El historial es **inmutable por diseño** (solo `append`) | No existe operación de API que reescriba o borre el historial |
| RT-3 | Los **esquemas son el contrato**: cambiar un formato implica versionar el esquema | `version` es un dato del formato, mostrado en la interfaz y en el PDF |
| RT-4 | **Un solo proceso Node.js** sirve la API, el frontend estático y la carpeta de PDF | `public/` y `pdfs/` se montan como estáticos en el mismo Express |
| RT-5 | El motor de PDF **debe resolverse en el servidor**, no en el cliente | Se usa `puppeteer-core` con el navegador del sistema; el PDF se almacena en `pdfs/` |
| RT-6 | La estructura de los datos de captura es **la del esquema**, no la de la interfaz | Los datos se guardan como objeto indexado por `key`, y las rutas se validan contra el esquema |
| RT-7 | El tamaño máximo del cuerpo de una petición es **10 MB** | `express.json({ limit: '10mb' })` |
| RT-8 | El motor de captura no puede usar un *bundler* en esta fase | Se usan scripts clásicos cargados por orden en `index.html` con *cache-busting* `?v=` |
| RT-9 | El esquema del formato se expone por endpoint, no incrustado en el HTML público | El endpoint `/api/formatos/:id/esquema` es **público**: solo expone la estructura del formato, nunca datos de registros. Ver DT-08 |
| RT-10 | El tiempo de espera de una petición está acotado | 25 s para la API, 10 s para el login, con `AbortController` |

### 7.2 Restricciones de negocio

| # | Restricción | Consecuencia |
|---|-------------|--------------|
| RB-1 | Un permiso **no puede ser CONCEDIDO** si alguna respuesta de verificación es `NO` | La regla se aplica automáticamente al guardar; el estado resultante es `NO CONCEDIDO` |
| RB-2 | Solo el **Coordinador SST** aprueba (`CONCEDIDO`) o cancela (`CANCELADO`) | El SISO no tiene esos estados disponibles en la interfaz y la API responde 403 |
| RB-3 | El SISO solo opera sobre **registros propios** | Listado filtrado por `usuarioId`; verificación de propiedad en lectura, edición y PDF |
| RB-4 | `CANCELADO` es un estado **terminal**: no se sobrescribe automáticamente | El guardado no cambia el estado de un registro cancelado |
| RB-5 | El **Coordinador ve indicadores globales**; el SISO no | El botón de indicadores y el endpoint están restringidos por rol |
| RB-6 | La **versión del formato** debe aparecer en el documento oficial | El PDF imprime `codigo`, `fecha` y `version` en la cabecera |
| RB-7 | La **fecha de diligenciamiento** no puede ser futura | Regla de validación `fechasHoy` por formato |
| RB-8 | Las tablas de personas, pasos o entregas deben tener **al menos una fila válida** | Regla `tablas[].requerida` |

### 7.3 Restricciones de seguridad

| # | Restricción |
|---|------------|
| RS-1 | Las contraseñas **nunca** se almacenan en texto plano: se guardan como `salt:hash` con `scrypt` (16 bytes de sal, hash de 64 bytes) |
| RS-2 | La comparación de hashes usa `crypto.timingSafeEqual` (comparación en tiempo constante) |
| RS-3 | **Todo** endpoint de datos exige `Authorization: Bearer <token>` o `x-token` |
| RS-4 | El token es **aleatorio de 32 bytes** (256 bits) y expira a las **12 horas** |
| RS-5 | El rol se valida **en el servidor**; ocultar botones en la interfaz es solo usabilidad, no seguridad |
| RS-6 | Los campos de perfil se **truncan a 6000 caracteres** para evitar abuso de almacenamiento |
| RS-7 | La foto de perfil solo se acepta si cumple el patrón `data:image/...` (imagen en base64) |
| RS-8 | El `passwordHash` **no** se expone en ninguna respuesta de la API (se usa `perfilPublico()`) |

### 7.4 Restricciones de proyecto (académicas)

| # | Restricción |
|---|------------|
| RP-1 | El proyecto es de **formulación y evaluación**: el alcance se prioriza sobre la completitud industrial |
| RP-2 | Debe ser **demostrable** sin infraestructura externa: un solo comando levanta el sistema |
| RP-3 | Debe funcionar **sin conexión a internet** una vez instaladas las dependencias |
| RP-4 | Los artefactos generados en ejecución (`data/`, `pdfs/`, logs) **no se versionan**: se regeneran con `npm run seed` |
| RP-5 | La documentación debe estar **en español** y alineada con el código |
| RP-6 | El lenguaje de la interfaz es **español (Colombia)**, con fechas en locale `es-CO` |

### 7.5 Restricciones de datos y privacidad

| # | Restricción |
|---|------------|
| RD-1 | Los datos personales (nombre, correo, cargo, cédula, teléfono) se almacenan localmente y **no se comparten** fuera del servidor |
| RD-2 | La cédula y el teléfono son datos personales sensibles: solo son editables por el propio usuario |
| RD-3 | La foto de perfil se almacena como **data URL base64** dentro del usuario, no como archivo binario |
| RD-4 | Los registros de trabajo contienen información de **accidentes de trabajo e incidentes**: su acceso está restringido por rol |
| RD-5 | Los archivos de datos y PDF se deben **respaldar** periódicamente (copia de `data/` y `pdfs/`) |

---

## 8. REQUISITOS FUNCIONALES

### 8.1 Módulo A — Autenticación y sesión

| ID | Requisito | Actor | Estado |
|----|-----------|-------|--------|
| RF-01 | El sistema debe permitir iniciar sesión con correo y contraseña. | Ambos | IMPL |
| RF-02 | El sistema debe rechazar el inicio de sesión con credenciales inválidas con error 401 y mensaje genérico *"Credenciales inválidas"*. | Ambos | IMPL |
| RF-03 | El sistema debe exigir correo y contraseña; si falta alguno, debe responder 400. | Ambos | IMPL |
| RF-04 | El login debe tener un tiempo de espera de 10 s con mensaje accionable si el servidor no responde. | Ambos | IMPL |
| RF-05 | Tras iniciar sesión, el sistema debe emitir un **token de sesión opaco** y devolver el perfil público del usuario. | Ambos | IMPL |
| RF-06 | El sistema debe permitir cerrar sesión, invalidando el token en el servidor y limpiando el almacenamiento local. | Ambos | IMPL |
| RF-07 | El sistema debe restaurar la sesión automáticamente al recargar la página si el token sigue vigente. | Ambos | IMPL |
| RF-08 | El sistema debe mantener el token como máximo 12 horas; vencido ese plazo, la sesión deja de ser válida. | Ambos | IMPL |
| RF-09 | El sistema debe mostrar en la interfaz el nombre, correo, cargo y rol del usuario autenticado, con avatar. | Ambos | IMPL |
| RF-10 | Cuando una petición devuelve 401 (fuera de `/auth/`), el sistema debe cerrar la sesión local y volver a la pantalla de login. | Ambos | IMPL |
| RF-11 | El sistema debe permitir consultar la sesión activa (`/api/auth/me`). | Ambos | IMPL |

### 8.2 Módulo B — Usuarios y perfil

| ID | Requisito | Actor | Estado |
|----|-----------|-------|--------|
| RF-20 | El Coordinador debe poder listar los usuarios del sistema. | Coordinador | IMPL |
| RF-21 | El Coordinador debe poder crear un usuario indicando nombre, correo, contraseña y rol. | Coordinador | IMPL |
| RF-22 | El sistema debe rechazar la creación si el correo ya existe, si falta un campo obligatorio o si el rol no es válido. | Coordinador | IMPL |
| RF-23 | Un SISO no debe poder listar ni crear usuarios (error 403). | SISO | IMPL |
| RF-24 | Todo usuario autenticado debe poder consultar y actualizar su propio perfil: nombre, cargo, cédula, teléfono y foto. | Ambos | IMPL |
| RF-25 | El sistema debe rechazar un nombre vacío en el perfil. | Ambos | IMPL |
| RF-26 | El sistema debe rechazar una foto que no tenga el formato `data:image/...`. | Ambos | IMPL |
| RF-27 | La interfaz debe permitir subir una foto PNG o JPG, redimensionarla automáticamente a máximo 512 px de lado y previsualizarla antes de guardar. | Ambos | IMPL |
| RF-28 | Si el usuario no tiene foto, el sistema debe mostrar un avatar con la inicial de su nombre, coloreado según el rol. | Ambos | IMPL |
| RF-29 | El correo del usuario **no debe ser modificable** desde la interfaz. | Ambos | IMPL |
| RF-30 | El sistema debe permitir quitar la foto de perfil. | Ambos | IMPL |

### 8.3 Módulo C — Catálogo de formatos

| ID | Requisito | Actor | Estado |
|----|-----------|-------|--------|
| RF-40 | El sistema debe listar en un panel lateral los formatos con código, nombre, versión, fecha, icono y color. | Ambos | IMPL |
| RF-41 | El catálogo debe construirse **automáticamente** leyendo las carpetas de `Proyecto/formatos/` que contengan `esquema.js`. | — | IMPL |
| RF-42 | Al agregar un formato (nueva carpeta con `esquema.js`), el sistema debe incluirlo sin modificar el núcleo del código. | — | IMPL |
| RF-43 | Al seleccionar un formato, el sistema debe mostrar su código, versión, fecha y nombre en el encabezado. | Ambos | IMPL |
| RF-44 | El sistema debe exponer el esquema de un formato por endpoint para el render dinámico del formulario. | Ambos | IMPL |
| RF-45 | Si el formato no existe, el sistema debe responder 404 con el mensaje *"Formato no encontrado"*. | Ambos | IMPL |
| RF-46 | El sistema debe exponer la lista de estados válidos junto con el esquema. | Ambos | IMPL |

### 8.4 Módulo D — CRUD de registros

| ID | Requisito | Actor | Estado |
|----|-----------|-------|--------|
| RF-50 | El sistema debe permitir crear un registro en un formato seleccionado. | Ambos | IMPL |
| RF-51 | Al crear, el sistema debe inicializar la estructura de datos a partir del esquema y asignar el estado `BORRADOR`. | Ambos | IMPL |
| RF-52 | Al crear, el sistema debe generar un identificador único (UUID v4) y registrar `fechaCreacion` y `fechaActualizacion`. | Ambos | IMPL |
| RF-53 | Al crear, el sistema debe registrar el usuario creador (identificador y nombre legible). | Ambos | IMPL |
| RF-54 | El sistema debe permitir leer un registro con todos sus datos, estado, creador e historial. | Propietario o Coordinador | IMPL |
| RF-55 | El sistema debe permitir editar los datos de un registro mediante un formulario generado del esquema. | Propietario o Coordinador | IMPL |
| RF-56 | El sistema debe permitir eliminar un registro, solo al Coordinador. | Coordinador | IMPL |
| RF-57 | El listado debe ordenar los registros por fecha de creación, del más reciente al más antiguo. | Ambos | IMPL |
| RF-58 | El listado debe paginarse de 12 registros por página, con navegación por número de página. | Ambos | IMPL |
| RF-59 | El listado debe mostrar, por registro: número correlativo, columnas del formato, creador, estado y fecha de actualización. | Ambos | IMPL |
| RF-60 | Si no hay registros, el sistema debe mostrar un mensaje invitando a crear uno. | Ambos | IMPL |
| RF-61 | El sistema debe permitir filtrar el listado por texto libre (sobre el JSON completo de `data`) y por estado. | Ambos | IMPL |
| RF-62 | Al cambiar el filtro o la página, el sistema debe recalcular la tabla sin recargar la página. | Ambos | IMPL |
| RF-63 | El sistema debe permitir exportar a CSV los registros filtrados, con BOM UTF-8 y separador `;`. | Ambos | IMPL |
| RF-64 | El listado de un SISO debe contener únicamente sus propios registros. | SISO | IMPL |

### 8.5 Módulo E — Formulario dinámico

| ID | Requisito | Actor | Estado |
|----|-----------|-------|--------|
| RF-70 | El formulario debe renderizarse a partir del esquema, sin código específico por formato. | Ambos | IMPL |
| RF-71 | El motor debe soportar los tipos de campo: `text`, `textarea`, `number`, `date`, `time`, `radio`, `checkbox`, `select`. | Ambos | IMPL |
| RF-72 | Un campo `select` debe mostrar la opción *"— Seleccione —"* como valor vacío inicial. | Ambos | IMPL |
| RF-73 | Un campo `radio` o `checkbox` debe mostrar su etiqueta junto a cada opción. | Ambos | IMPL |
| RF-74 | Un campo marcado como `span` debe ocupar la fila completa de la grilla. | Ambos | IMPL |
| RF-75 | El motor debe renderizar **tablas dinámicas** con filas agregables y quitables por el usuario. | Ambos | IMPL |
| RF-76 | Cada columna de una tabla dinámica puede ser de tipo texto o `radio` (respuesta SI/NO/NA por fila). | Ambos | IMPL |
| RF-77 | El motor debe renderizar **tareas** con respuesta `SI / NO / NA` (o las opciones que defina el esquema) por ítem. | Ambos | IMPL |
| RF-78 | El motor debe renderizar **listas de verificación** con respuesta `SI / NO` por ítem, agrupadas por subtítulo. | Ambos | IMPL |
| RF-79 | Un grupo de checklist con `soloSi: n` **solo debe mostrarse** si la tarea `n` está respondida `SI`. | Ambos | IMPL |
| RF-80 | Al cambiar una tarea, el sistema debe re-renderizar el formulario para mostrar u ocultar los checklists condicionales. | Ambos | IMPL |
| RF-81 | El motor debe normalizar las dos formas de declarar listas: `grupos` como objeto o como arreglo, y `items` u `opciones` para las tareas. | — | IMPL |
| RF-82 | El formulario debe mostrar el estado calculado del permiso en vivo, a partir de las respuestas actuales. | Ambos | IMPL |
| RF-83 | El formulario debe incluir un selector de estado: 4 opciones para el Coordinador, 2 para el SISO (`BORRADOR`, `NO CONCEDIDO`). | Ambos | IMPL |
| RF-84 | El selector de estado debe estar deshabilitado al crear un registro nuevo. | Ambos | IMPL |
| RF-85 | El formulario debe mostrar el historial de trazabilidad del registro abierto. | Ambos | IMPL |
| RF-86 | El modal debe indicar si el registro es nuevo o existente, mostrando código, versión, fecha de creación y creador. | Ambos | IMPL |

### 8.6 Módulo F — Validación de la captura

| ID | Requisito | Actor | Estado |
|----|-----------|-------|--------|
| RF-90 | Antes de guardar, el sistema debe validar el formulario contra la configuración de validación del formato. | Ambos | IMPL |
| RF-91 | El sistema debe bloquear el guardado mientras existan errores de validación. | Ambos | IMPL |
| RF-92 | Cada control del formulario debe llevar un atributo `data-path` con su ruta en `data`. | Ambos | IMPL |
| RF-93 | Los controles con error deben marcarse con la clase `invalid` (resaltado en rojo). | Ambos | IMPL |
| RF-94 | Al validar, el sistema debe desplazarse suavemente hasta el primer control con error. | Ambos | IMPL |
| RF-95 | Al modificar un campo, el sistema debe limpiar el resaltado de error de ese campo. | Ambos | IMPL |
| RF-96 | El sistema debe mostrar un aviso con la cantidad de campos por corregir. | Ambos | IMPL |
| RF-97 | El sistema debe indicar el error exacto por celda de tabla con la ruta `tabla.i.columna` y el número de fila legible. | Ambos | IMPL |
| RF-98 | Al crear un registro, el sistema debe autollenar las fechas de diligenciamiento con la fecha de hoy. | Ambos | IMPL |
| RF-99 | El sistema debe rechazar una fecha de diligenciamiento posterior a hoy. | Ambos | IMPL |
| RF-100 | El detalle completo de las reglas de validación está en la §15 de este documento. | — | IMPL |

### 8.7 Módulo G — Estados y regla de negocio

| ID | Requisito | Actor | Estado |
|----|-----------|-------|--------|
| RF-110 | Los estados válidos son `BORRADOR`, `CONCEDIDO`, `NO CONCEDIDO`, `CANCELADO`. | — | IMPL |
| RF-111 | El sistema debe calcular el estado del permiso: si alguna respuesta del checklist es `NO`, el resultado es `NO CONCEDIDO`. | Sistema | IMPL |
| RF-112 | Si no existe ninguna respuesta `NO`, el estado calculado es `CONCEDIDO`. | Sistema | IMPL |
| RF-113 | Al guardar, si el estado calculado difiere del estado persistido y el registro no está `CANCELADO`, el sistema debe persistir el estado calculado. | Sistema | IMPL |
| RF-114 | Solo el Coordinador puede persistir los estados `CONCEDIDO` y `CANCELADO`. | Coordinador | IMPL |
| RF-115 | Un SISO que intente aprobar o cancelar debe recibir 403. | SISO | IMPL |
| RF-116 | Un SISO solo puede modificar el estado de sus propios registros. | SISO | IMPL |
| RF-117 | Un estado no reconocido debe normalizarse a `BORRADOR`. | Sistema | IMPL |
| RF-118 | Un registro `CANCELADO` no debe cambiar de estado automáticamente al guardar. | Sistema | IMPL |
| RF-119 | El estado seleccionado manualmente por el usuario debe prevalecer sobre el estado calculado cuando difieran. | Ambos | IMPL |

### 8.8 Módulo H — Documento oficial en PDF

| ID | Requisito | Actor | Estado |
|----|-----------|-------|--------|
| RF-130 | El sistema debe generar el PDF de un registro en el servidor a partir de su esquema y sus datos. | Ambos | IMPL |
| RF-131 | El PDF debe ser tamaño A4, con márgenes de 10 mm y fondos impresos habilitados. | Ambos | IMPL |
| RF-132 | El PDF debe incluir la cabecera corporativa: logo SSTech, nombre del formato, código, fecha y versión. | Ambos | IMPL |
| RF-133 | El PDF debe renderizar las secciones del esquema en el mismo orden del formato físico. | Ambos | IMPL |
| RF-134 | El PDF debe renderizar las tablas con número de fila, encabezados y anchos definidos. | Ambos | IMPL |
| RF-135 | El PDF debe renderizar las tareas con la marca `X` en la opción seleccionada (`SI`, `NA`). | Ambos | IMPL |
| RF-136 | El PDF debe renderizar los checklists como tabla de cinco columnas: N°, Requisito, SI, NO, NA y OBSERVACIONES. | Ambos | IMPL |
| RF-137 | El PDF debe renderizar solo los grupos de checklist **aplicables** según las tareas condicionantes. | Ambos | IMPL |
| RF-138 | El PDF debe mostrar las opciones de un `radio` como `[X]` o `[ ]` según la respuesta. | Ambos | IMPL |
| RF-139 | El PDF debe mostrar un `checkbox` como `[X]` o `[ ]`. | Ambos | IMPL |
| RF-140 | El PDF debe mostrar un campo `respuesta` (SI/NO/NA) con la marca en la opción seleccionada. | Ambos | IMPL |
| RF-141 | El PDF debe respetar un número mínimo de filas por tabla (`min`) aunque el registro tenga menos. | Ambos | IMPL |
| RF-142 | El PDF debe incluir un pie con el código, el nombre del formato, la marca de generación y la fecha/hora. | Ambos | IMPL |
| RF-143 | El nombre del archivo debe ser predecible: `<id-formato>-<uuid-del-registro>.pdf`. | Ambos | IMPL |
| RF-144 | La URL del documento debe ser `/pdfs/<archivo>` y servirse como archivo estático. | Ambos | IMPL |
| RF-145 | La interfaz debe mostrar el PDF en un visor (`iframe`) dentro de un modal y ofrecer la descarga. | Ambos | IMPL |
| RF-146 | Si el registro es nuevo y no está guardado, el sistema debe guardarlo antes de generar el PDF. | Ambos | IMPL |
| RF-147 | Un SISO no puede generar el PDF de un registro que no es suyo. | SISO | IMPL |
| RF-148 | Si no se encuentra Chrome/Edge, el sistema debe responder 500 con un mensaje explicativo. | — | IMPL |
| RF-149 | El sistema debe usar *cache-busting* (`?t=<timestamp>`) al cargar el PDF en el visor. | Ambos | IMPL |
| RF-150 | El motor de PDF debe cerrar el navegador incluso si la generación falla. | — | IMPL |

### 8.9 Módulo I — Trazabilidad

| ID | Requisito | Actor | Estado |
|----|-----------|-------|--------|
| RF-160 | Cada registro debe tener un historial de eventos. | — | IMPL |
| RF-161 | Al crear, el historial debe incluir un evento `CREADO` con fecha y usuario. | — | IMPL |
| RF-162 | Al editar, el historial debe incluir un evento `ACTUALIZADO` con fecha, usuario y el detalle `data` o `solo estado`. | — | IMPL |
| RF-163 | Al cambiar el estado, el historial debe incluir un evento `ESTADO: <valor>` con fecha y usuario. | — | IMPL |
| RF-164 | El historial debe mostrarse dentro del modal del registro, en orden de llegada. | Ambos | IMPL |
| RF-165 | Si no hay eventos, el historial debe mostrar el mensaje *"Sin eventos todavía"*. | Ambos | IMPL |
| RF-166 | El historial no debe poder modificarse ni eliminarse por ninguna vía de la interfaz. | — | IMPL |
| RF-167 | Si el usuario no está disponible, el evento debe registrarse con el autor `sistema`. | — | IMPL |

### 8.10 Módulo J — Indicadores

| ID | Requisito | Actor | Estado |
|----|-----------|-------|--------|
| RF-170 | Cada formato debe tener un tablero de indicadores calculados sobre sus registros. | Coordinador | IMPL |
| RF-171 | Cada indicador debe mostrar código, nombre, valor, tipo y la cantidad de registros analizados. | Coordinador | IMPL |
| RF-172 | El tablero debe admitir filtro por rango de fechas (`desde`, `hasta`). | Coordinador | IMPL |
| RF-173 | El tablero debe admitir filtro por campo y valor (por ejemplo `localizacion=PLANTA`). | Coordinador | IMPL |
| RF-174 | El filtro de fechas debe aplicarse sobre el primer campo de tipo `fecha` del esquema (excluyendo `fechaReporte`) y, si no hay, sobre `fechaCreacion`. | — | IMPL |
| RF-175 | El filtro por campo debe comparar sin distinguir mayúsculas y minúsculas. | — | IMPL |
| RF-176 | Los valores numéricos deben redondearse a dos decimales. | — | IMPL |
| RF-177 | Si el cálculo de un indicador falla, el valor debe mostrarse como `ERR` sin romper el tablero. | — | IMPL |
| RF-178 | Un SISO no debe ver el botón de indicadores ni acceder al endpoint (403). | SISO | IMPL |
| RF-179 | El sistema debe exponer el catálogo de indicadores de todos los formatos para el Coordinador. | Coordinador | IMPL |
| RF-180 | El tablero debe permitir exportar los indicadores a CSV. | Coordinador | IMPL |
| RF-181 | Si el formato no tiene indicadores definidos, el tablero debe mostrar un mensaje informativo. | Coordinador | IMPL |

### 8.11 Módulo K — Experiencia de usuario e interfaz

| ID | Requisito | Actor | Estado |
|----|-----------|-------|--------|
| RF-190 | La aplicación debe ser una SPA: cambiar de formato, guardar y generar PDF no deben recargar la página. | Ambos | IMPL |
| RF-191 | Las acciones destructivas (eliminar registro, cerrar sesión) deben pedir confirmación en un diálogo. | Ambos | IMPL |
| RF-192 | El sistema debe mostrar un indicador visual de carga (spinner) durante operaciones asíncronas. | Ambos | IMPL |
| RF-193 | El sistema debe mostrar un aviso temporal (*toast*) de éxito o error tras cada operación. | Ambos | IMPL |
| RF-194 | El sistema debe usar diálogos de confirmación animados (SweetAlert2) y animaciones de entrada (Animate.css), servidos localmente. | Ambos | IMPL |
| RF-195 | Los estados deben verse con un código de color consistente en la tabla y en el formulario. | Ambos | IMPL |
| RF-196 | El sistema debe ser utilizable en tableta y escritorio, sin depender de un ancho fijo. | Ambos | IMPL |
| RF-197 | El sistema debe escapar todo dato dinámico antes de insertarlo en el DOM (prevención de XSS). | — | IMPL |
| RF-198 | El sistema debe registrar en la consola del servidor cada petición con método, ruta, código de respuesta y duración. | — | IMPL |
| RF-199 | El HTML y los PDF deben servirse con `Cache-Control: no-cache` para evitar versiones obsoletas. | — | IMPL |
| RF-200 | El sistema debe mostrar el botón de gestión de usuarios solo al Coordinador. | Ambos | IMPL |
| RF-201 | El sistema debe mostrar el botón de eliminar solo al Coordinador y solo en registros existentes. | Ambos | IMPL |
| RF-202 | El sistema debe permitir acceder al perfil desde la barra lateral. | Ambos | IMPL |
| RF-203 | El sistema debe indicar en la barra lateral el nivel de acceso del usuario (acceso total o módulo de campo). | Ambos | IMPL |

---

## 9. REQUISITOS NO FUNCIONALES

### 9.1 Rendimiento

| ID | Requisito | Métrica | Verificación |
|----|-----------|---------|--------------|
| RNF-01 | La generación de PDF debe ser rápida para registros típicos | < 5 s por documento | Medición manual con los 26 registros de demostración |
| RNF-02 | Las lecturas de listados y esquemas deben ser inmediatas | < 500 ms en red local | Log del servidor |
| RNF-03 | El login debe ser inmediato o fallar con claridad | < 2 s; timeout de 10 s | Prueba manual |
| RNF-04 | La paginación debe mantener el render ligero | 12 filas por página | Inspección visual |
| RNF-05 | El render del formulario debe ser fluido pese a checklists extensos (hasta 65 ítems) | < 300 ms por re-render | Inspección manual |
| RNF-06 | El cálculo de indicadores debe ser inmediato para el volumen esperado | < 1 s por formato | Inspección manual |

### 9.2 Usabilidad y accesibilidad

| ID | Requisito |
|----|-----------|
| RNF-10 | El flujo de captura debe ser completo sin recargar la página (SPA) |
| RNF-11 | La interfaz debe estar en español (Colombia) con fechas en `es-CO` |
| RNF-12 | Los mensajes de error deben ser accionables e indicar el campo exacto |
| RNF-13 | Las acciones irreversibles deben pedir confirmación |
| RNF-14 | Los estados deben ser identificables sin leer texto (color + etiqueta) |
| RNF-15 | La interfaz debe ser utilizable en tableta (≥ 768 px) y escritorio (≥ 1280 px) |
| RNF-16 | Los controles del formulario deben tener etiqueta visible asociada |
| RNF-17 | El sistema debe ser operable por un usuario nuevo sin capacitación extensa |

### 9.3 Portabilidad y despliegue

| ID | Requisito |
|----|-----------|
| RNF-20 | Debe ejecutarse en Windows, macOS y Linux con Node.js ≥ 18 |
| RNF-21 | Debe ser instalable con `npm install` y ejecutable con `npm start`, sin configuración adicional |
| RNF-22 | Debe ejecutarse sin conexión a internet una vez instaladas las dependencias |
| RNF-23 | El puerto debe ser configurable por variable de entorno `PORT` |
| RNF-24 | Debe admitir contenedor Docker como opción de despliegue |
| RNF-25 | La ruta del navegador para el PDF debe ser configurable (hoy es una constante fija en `lib/pdf.js`) |

### 9.4 Disponibilidad y datos

| ID | Requisito |
|----|-----------|
| RNF-30 | La disponibilidad objetivo del piloto académico es ≥ 99 % mientras el proceso esté arriba |
| RNF-31 | Los datos deben poder respaldarse copiando las carpetas `data/` y `pdfs/` |
| RNF-32 | Un JSON corrupto en un formato no debe impedir operar los demás (se trata como lista vacía) |
| RNF-33 | La estructura de datos debe ser **migrable 1:1** a SQLite/PostgreSQL (registro + historial 1:N) |
| RNF-34 | Los artefactos generados en ejecución no deben versionarse (`.gitignore`) |

### 9.5 Seguridad

| ID | Requisito |
|----|-----------|
| RNF-40 | Las contraseñas deben almacenarse cifradas (hash `scrypt` con sal por usuario) |
| RNF-41 | La comparación de contraseñas debe ser de tiempo constante |
| RNF-42 | Todas las rutas de datos deben exigir autenticación; las de escritura, además, rol |
| RNF-43 | El cuerpo de la petición se limita a 10 MB |
| RNF-44 | Toda entrada debe validarse (obligatorios, tipos, formatos) antes de persistir |
| RNF-45 | Los tokens de sesión deben ser aleatorios e impredecibles (32 bytes) |
| RNF-46 | En producción, el tráfico debe servirse por HTTPS |
| RNF-47 | El `passwordHash` nunca debe salir en una respuesta de la API |
| RNF-48 | Los datos insertados en el DOM deben escaparse para prevenir XSS |

### 9.6 Mantenibilidad y escalabilidad

| ID | Requisito |
|----|-----------|
| RNF-50 | Agregar un formato nuevo debe ser solo crear su carpeta con `esquema.js` (sin tocar el núcleo) |
| RNF-51 | Los esquemas deben estar separados por archivo y ser autodocumentados |
| RNF-52 | Las reglas de validación deben estar declaradas en un único lugar por formato (`VALIDACION_FORMATOS`) |
| RNF-53 | La separación frontend/backend debe ser real: el backend no depende del DOM y el frontend no accede a los archivos de datos |
| RNF-54 | El código debe seguir convenciones consistentes (2 espacios, `const`, sin frameworks) |
| RNF-55 | Los cambios deben registrarse en `CHANGELOG.md` |
| RNF-56 | El sistema debe poder crecer hacia una base de datos relacional sin rehacer la interfaz |

### 9.7 Auditoría

| ID | Requisito |
|----|-----------|
| RNF-60 | Cada mutación de un registro debe quedar registrada con fecha, acción y usuario |
| RNF-61 | El historial debe ser de solo adición (append-only) |
| RNF-62 | El estado del permiso debe poder reconstruirse a partir del historial |
| RNF-63 | Los eventos automáticos deben distinguirse de los manuales en su detalle |

---

## 10. REGLAS DE NEGOCIO

| ID | Regla | Implementación |
|----|-------|----------------|
| RN-01 | Cualquier respuesta `NO` en un checklist de verificación implica estado `NO CONCEDIDO`. | `estadoPermiso(data)` en `public/js/util.js` |
| RN-02 | Si no hay respuestas `NO`, el estado calculado es `CONCEDIDO`. | `estadoPermiso(data)` |
| RN-03 | `CANCELADO` es terminal: el guardado no lo sobrescribe automáticamente. | `UI.guardar()` en `app.js` |
| RN-04 | El SISO solo opera sobre registros propios (`usuarioId` igual al suyo). | `db.filtrarPorUsuario` + verificaciones en `server.js` |
| RN-05 | Solo el Coordinador puede aprobar o cancelar. | `PATCH .../estado` valida el rol |
| RN-06 | Un estado no reconocido se normaliza a `BORRADOR`. | `db.validarEstado` |
| RN-07 | La versión del PDF corresponde a la del esquema del formato. | `cabeceraPdf(esquema)` |
| RN-08 | Un grupo de checklist con `soloSi: n` solo aplica si la tarea `n` es `SI`. | `validarFormulario`, `renderChecklistsHTML`, `renderChecklistsCondicionales` |
| RN-09 | La fecha de diligenciamiento no puede ser posterior a la fecha del sistema. | `validarFormulario` → `fechasHoy` |
| RN-10 | Los campos obligatorios rechazan valores vacíos, `null` y solo espacios. | `coerce()` en `validacion.js` |
| RN-11 | Una tabla dinámica requerida debe tener al menos una fila con datos válidos. | `validarFormulario` → `tablas` |
| RN-12 | Todas las tareas de un formato deben responderse. | `validarFormulario` → sección `tareas` |
| RN-13 | Todos los ítems de los grupos de checklist aplicables deben marcarse `SI`/`NO`. | `validarFormulario` → sección `checklists` |
| RN-14 | Los campos numéricos con rango deben respetarlo (p. ej. días de incapacidad ≥ 0). | `validarFormulario` → `numeros` |
| RN-15 | La foto de perfil debe ser una imagen en base64 (`data:image/...`). | `PATCH /api/auth/perfil` |
| RN-16 | El nombre del usuario no puede quedar vacío. | `PATCH /api/auth/perfil` |
| RN-17 | El correo de un usuario es único y se normaliza a minúsculas. | `auth.crearUsuario` |
| RN-18 | La sesión expira a las 12 horas de crearse. | `auth.crearSesion` |
| RN-19 | Un usuario inactivo (`activo: false`) no puede autenticarse ni usar una sesión vigente. | `auth.autenticar` y `auth.usuarioPorToken` |
| RN-20 | El PDF solo se genera para registros existentes. | `POST .../pdf` valida `db.obtener` |
| RN-21 | La sesión cerrada invalida el token de inmediato (no hay vigencia remanente). | `auth.cerrarSesion` |
| RN-22 | Un registro con menos filas que el mínimo del esquema se rellena con filas vacías en el PDF. | `renderTabla` en `lib/pdf.js` |
| RN-23 | Los datos que no son texto se convierten a cadena vacía en el PDF si son `null` o `undefined`. | `valor()` en `lib/pdf.js` |
| RN-24 | Los datos de los registros se guardan tal como los envía el formulario; no hay transformación de esquema en el servidor. | `db.crear` / `db.actualizar` |

---

## 11. MODELO DE DATOS

### 11.1 Almacén

| Aspecto | Definición |
|---------|------------|
| Ubicación | `Proyecto/platform/data/` |
| Formato | JSON UTF-8, indentado con 2 espacios |
| Granularidad | Un archivo por formato: `data/<id-formato>.json` (array de registros) |
| Archivos especiales | `usuarios.json` (array de usuarios), `sesiones.json` (mapa token → sesión) |
| Origen de los datos | Se generan con `npm run seed`; no se versionan |
| Permisos de escritura | La carpeta debe ser escribible por el proceso de Node |

### 11.2 Entidad `Registro`

```json
{
  "id": "070206eb-13cb-43c9-ae62-8aec6f8ec6f6",
  "data": { "...": "valores capturados, indexados por key del esquema" },
  "estado": "BORRADOR",
  "usuarioId": "4a020e76-290e-453e-be7b-c059af580e03",
  "usuarioCreador": "Carlos SISO",
  "fechaCreacion": "2026-09-25T14:03:11.000Z",
  "fechaActualizacion": "2026-09-25T15:20:44.000Z",
  "historial": [
    {
      "fecha": "2026-09-25T14:03:11.000Z",
      "accion": "CREADO",
      "usuario": "Carlos SISO",
      "detalle": "Registro creado"
    },
    {
      "fecha": "2026-09-25T15:20:44.000Z",
      "accion": "ESTADO: CONCEDIDO",
      "usuario": "Ana Coordinadora",
      "detalle": "Cambio de estado"
    }
  ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `id` | string (UUID v4) | Sí | Identificador único e inmutable |
| `data` | objeto | Sí | Valores capturados según el esquema del formato |
| `estado` | string enumerado | Sí | Estado del permiso (ver RN-01…RN-06) |
| `usuarioId` | string (UUID) o `null` | Sí | Identificador del creador; base del aislamiento por usuario |
| `usuarioCreador` | string | Sí | Nombre legible del creador, mostrado en la tabla |
| `fechaCreacion` | string ISO-8601 | Sí | Momento del alta; base del orden del listado |
| `fechaActualizacion` | string ISO-8601 | Sí | Momento de la última mutación |
| `historial` | array de eventos | Sí | Bitácora append-only |

### 11.3 Entidad `Evento de historial`

| Campo | Tipo | Valores |
|-------|------|---------|
| `fecha` | string ISO-8601 | Momento del evento |
| `accion` | string | `CREADO`, `ACTUALIZADO`, `ESTADO: <valor>` |
| `usuario` | string | Nombre o correo del actor (`sistema` si no hay actor) |
| `detalle` | string | Descripción legible (`Registro creado`, `Datos modificados`, `Cambio de estado`) |
| `dif` | string (opcional) | `data` si cambió el contenido; `solo estado` si no |

### 11.4 Entidad `Usuario`

```json
{
  "id": "71e9d287-ff90-4ce1-a532-29d5c1678d40",
  "nombre": "Ana Coordinadora",
  "email": "coordinador@sstech.co",
  "rol": "COORDINADOR",
  "activo": true,
  "passwordHash": "<sal-hex>:<hash-hex>",
  "foto": "data:image/jpeg;base64,...",
  "cargo": "Coordinadora SST",
  "cedula": "1051234890",
  "telefono": "+573001112233"
}
```

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| `id` | string (UUID v4) | Sí | — |
| `nombre` | string | Sí | No puede quedar vacío |
| `email` | string | Sí | Único, normalizado a minúsculas; no editable |
| `rol` | string enumerado | Sí | `COORDINADOR` o `SISO` |
| `activo` | boolean | Sí | Si es `false`, no puede autenticarse ni usar sesión |
| `passwordHash` | string | Sí | `sal:hash` con `scrypt`; **nunca** se expone por la API |
| `foto` | string | No | Data URL `data:image/...`; cadena vacía si no hay |
| `cargo` | string | No | Se muestra en la barra superior y la lateral |
| `cedula` | string | No | Dato personal sensible |
| `telefono` | string | No | Dato personal sensible |

**Perfil público** (lo que devuelve la API): `id`, `nombre`, `email`, `rol`, `activo`, `foto`, `cargo`,
`cedula`, `telefono`. Nunca incluye `passwordHash`.

### 11.5 Entidad `Sesión`

```json
{
  "<token de 64 caracteres hex>": {
    "usuarioId": "4a020e76-290e-453e-be7b-c059af580e03",
    "expira": 1789960701784
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| *(clave del mapa)* | string | Token: 32 bytes aleatorios en hexadecimal (64 caracteres) |
| `usuarioId` | string (UUID) | Usuario de la sesión |
| `expira` | number (epoch ms) | Instante de expiración (creación + 12 h) |

Las sesiones vencidas se eliminan automáticamente al consultarse.

### 11.6 Entidad `Esquema de formato`

Archivo JavaScript `Proyecto/formatos/<id>/esquema.js` que exporta un objeto:

```js
module.exports = {
  id: 'ft-ope-06',
  codigo: 'FT-OPE-06',
  nombre: 'Permiso de Trabajo en Campo',
  fecha: 'mar-2023',
  version: '07',
  color: '#0f2a43',
  icono: '🦺',
  listado: [ { key, label, tipo } ],              // columnas de la tabla CRUD
  secciones: [
    { titulo, campos: [ { type, key, label, opciones, span, required } ] },
    { titulo, tabla:      { key, cols, min } },
    { titulo, tareas:     { key, items | opciones, header } },
    { titulo, checklists: { key, grupos: { g: { titulo, soloSi, items } } } }
  ]
};
```

**Tipos de campo soportados** (frontend y PDF): `text`, `textarea`, `number`, `date`, `time`, `radio`,
`checkbox`, `select`, `respuesta`.

**Tipos de sección soportados:** `campos`, `tabla`, `tareas`, `checklists`.

**Convención de listas:** el motor acepta `grupos` como **objeto** (mapa) o como **arreglo** de
objetos con `key`; acepta `items` o `opciones` para las tareas. Esto permite que los formatos mezclen
ambas formas sin romper el render.

### 11.7 Entidad `Indicador`

Archivo JavaScript `Proyecto/formatos/<id>/indicadores.js` que exporta un arreglo:

```js
module.exports = [
  {
    codigo: 'KP1',
    nombre: 'Total de permisos emitidos',
    tipo: 'contador',              // contador | porcentaje | lista
    calcular(registros) { ... }    // recibe los registros ya filtrados
  }
];
```

### 11.8 Modelo relacional equivalente (fase futura)

```
USUARIO (1) ────< (N) REGISTRO (1) ────< (N) HISTORIAL
                         │
                         └── FORMATO (1) ──── (N) INDICADOR
```

Correspondencia 1:1 para migración: `USUARIO` → tabla `usuarios`; `FORMATO` → tabla `formatos`;
`REGISTRO` → tabla `registros` (con `data` en columna JSONB y `estado` restringido); `HISTORIAL` →
tabla `historial` (1:N, con política de retención definida antes de activar cascadas).

---

## 12. ARQUITECTURA: SEPARACIÓN FRONTEND / BACKEND

### 12.1 Principio de separación

El sistema aplica **separación de responsabilidades en dos capas de código claramente delimitadas**:

| Capa | Ubicación | Responsabilidad | No debe |
|------|-----------|-----------------|---------|
| **Frontend** (presentación) | `Proyecto/platform/public/` | Renderizar la interfaz, capturar la entrada del usuario, mostrar resultados, invocar la API | Acceder al sistema de archivos, contener reglas de persistencia o generar PDF |
| **Backend** (lógica y datos) | `Proyecto/platform/server.js`, `config/`, `lib/` | Exponer la API, validar sesión y rol, aplicar las reglas de servidor, persistir, calcular indicadores, generar PDF | Depender del DOM del navegador o manipular directamente la vista |

**Corolario clave:** toda decisión de seguridad (autenticación, autorización, aislamiento por usuario)
se toma **en el backend**, aunque la interfaz también la refleje. Ocultar un botón es usabilidad; la
verificación del servidor es seguridad.

### 12.2 Vista de dos capas

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  FRONTEND — Proyecto/platform/public/          (SPA, se sirve en el navegador) ║
║                                                                              ║
║   index.html ── estructura: #login, #app, #sidebar, #tabla-wrap, #modal,      ║
║                            #modalPdf, #modalInd, #modalAdmin, #modalPerfil  ║
║   css/app.css  ── tema, grid, estados, modales, animaciones                    ║
║   js/util.js  ── esc(), api(), getByPath/setByPath, inicialData(),           ║
║                 pillEstado(), fmtFecha(), fmtFechaHora(), estadoPermiso()     ║
║   js/form.js  ── renderSeccionHTML, renderCampoHTML, renderTablaDinamicaHTML,  ║
║                 renderTareasHTML, renderChecklistsHTML                         ║
║   js/validacion.js ── VALIDACION_FORMATOS, validarFormulario(),               ║
║                       aplicarAutoFechas(), marcarErroresUI()                  ║
║   js/app.js   ── App (estado) + UI (controlador) + avatares + toasts          ║
║   vendor/     ── sweetalert2.all.min.js, sweetalert2.min.css, animate.min.css  ║
║                                                                              ║
║   comunica: fetch()  ──►  Authorization: Bearer <token>                      ║
╚══════════════════════════╤═══════════════════════════════════════════════════╝
                           │  HTTP/JSON  (mismo origen, mismo proceso)
                           ▼
╔══════════════════════════════════════════════════════════════════════════════╗
║  BACKEND — Proyecto/platform/{server.js, config/, lib/, data/, pdfs/}        ║
║                                                                              ║
║   server.js      ── Express: 18 rutas API + estáticos / y /pdfs               ║
║                     middlewares: log de peticiones, requireAuth, requireRol   ║
║   config/index.js── Descubre formatos leyendo Proyecto/formatos/*/esquema.js ║
║   lib/auth.js    ── usuarios, scrypt, sesiones, middlewares de autorización  ║
║   lib/db.js      ── persistencia JSON por formato + historial (append-only)   ║
║   lib/indicadores.js ── filtros y cálculo de KPIs                             ║
║   lib/pdf.js     ── htmlPdf() + generarPdf() con puppeteer-core + Chrome      ║
║   lib/seed-util.js ── inicialData() replicado para la siembra                 ║
║   seed.js / seed-datos.js ── datos de demostración (26 registros)             ║
║   data/*.json    ── persistencia (usuarios, sesiones, 7 formatos)              ║
║   pdfs/*.pdf     ── documentos oficiales generados                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 12.3 Frontend — especificación detallada

#### 12.3.1 Estructura del HTML

| Elemento | ID | Función |
|----------|----|---------|
| Pantalla de login | `#login` | Formulario de acceso: `#login-email`, `#login-pass`, `#login-error` |
| Contenedor de la aplicación | `#app` | Se muestra tras autenticar |
| Barra superior | `#topbar` | Título del formato (`#header-titulo`), buscador (`#busqueda`), filtro de estado (`#filtroEstado`), botón de indicadores (`#btn-indicadores`) |
| Barra lateral | `#sidebar` | `#navbar` con los formatos, `#sidebar-admin` con `#btn-nav-usuarios` y `#btn-perfil-side`, `#sidebar-footer` con el usuario |
| Zona principal | `#main` / `#tabla-wrap` | Tabla de registros |
| Modal de registro | `#modal` | `#modal-badge`, `#modal-titulo`, `#modal-sub`, `#modal-estado`, `#modal-body`, `#historial`, `#btn-eliminar` |
| Modal de PDF | `#modalPdf` | `#pdf-titulo`, `#pdf-sub`, `#pdf-frame` (`iframe`), `#pdf-descargar` |
| Modal de indicadores | `#modalInd` | `#ind-titulo`, `#ind-sub`, `#ind-desde`, `#ind-hasta`, `#ind-body` |
| Modal de usuarios | `#modalAdmin` | `#admin-body` con el formulario de alta y la tabla de usuarios |
| Modal de perfil | `#modalPerfil` | `#perfil-sub`, `#perfil-body` |
| Global | `#spinner`, `#toast` | Indicador de carga y avisos |

#### 12.3.2 Módulos JavaScript

| Archivo | Responsabilidad | Funciones públicas |
|---------|-----------------|-------------------|
| `util.js` | Utilidades puras y acceso a la API | `esc`, `api`, `getByPath`, `setByPath`, `inicialData`, `pillEstado`, `fmtFecha`, `fmtFechaHora`, `estadoPermiso` |
| `form.js` | Render del formulario dinámico | `renderCampoHTML`, `renderSeccionHTML`, `renderTablaDinamicaHTML`, `renderTareasHTML`, `renderChecklistsHTML` |
| `validacion.js` | Configuración y motor de validación | `VALIDACION_FORMATOS`, `coerce`, `hoyISO`, `validarFormulario`, `aplicarAutoFechas`, `limpiarErroresUI`, `quitarErrorUI`, `marcarErroresUI` |
| `app.js` | Estado global y controlador | `App`, `UI` (38 métodos), `descFormat`, `avatarInicial`, `avatarFotoGrande`, `avatarHTML` |

Orden de carga en `index.html` (con *cache-busting* `?v=`): SweetAlert2 → `util.js` → `form.js` →
`validacion.js` → `app.js`.

#### 12.3.3 Estado global (`App`)

```js
const App = {
  formatos: [],   // metadatos de los formatos
  formato: null,  // formato seleccionado (con su esquema)
  registros: [],  // registros del formato seleccionado (ya filtrados por rol)
  registro: null, // registro abierto en el modal
  data: {},       // datos en edición
  usuario: null,  // perfil del usuario autenticado
  pagina: 1,      // página actual de la tabla
  porPagina: 12   // registros por página
};
```

#### 12.3.4 Métodos del controlador `UI`

| Grupo | Métodos |
|-------|---------|
| Sesión | `esCoordinador`, `mostrarLogin`, `mostrarApp`, `login`, `cerrarSesion`, `restaurarSesion`, `aplicarRol` |
| Navegación | `init`, `renderNav`, `seleccionarFormato` |
| Tabla | `registrosFiltrados`, `renderTabla`, `pagina` |
| Modal | `nuevo`, `editar`, `abrirModal`, `cerrarModal`, `renderHistorial`, `cambioEstado`, `renderForm` |
| Captura | `setVal`, `setCheck`, `setTarea`, `actualizarTareas`, `setVerif`, `agregarFila`, `quitarFila` |
| Persistencia | `guardar`, `eliminar`, `eliminarDirecto` |
| PDF | `verPdf`, `generarPDF`, `cerrarPdf` |
| Indicadores | `abrirIndicadores`, `cerrarIndicadores`, `cargarIndicadores`, `renderIndicadores`, `exportarIndicadoresCSV` |
| Usuarios | `abrirAdmin`, `cerrarAdmin`, `cargarUsuarios`, `crearUsuario` |
| Perfil | `abrirPerfil`, `cerrarPerfil`, `renderPerfilHTML`, `cargarFoto`, `quitarFoto`, `pintarAvatarPerfil`, `guardarPerfil` |
| Exportación | `exportarCSV` |
| Diálogos | `confirmarSwal` |
| Varios | `spinner`, `toast` |

#### 12.3.5 Reglas de la capa de presentación

1. **Toda** comunicación con el servidor pasa por `api()` en `util.js`, que añade el encabezado
   `Authorization`, aplica un timeout de 25 s con `AbortController` y maneja el 401 global.
2. **Todo** dato dinámico se pasa por `esc()` antes de insertarse en el HTML.
3. El frontend **no** decide permisos: si el backend responde 403, se muestra el error.
4. El frontend puede previsualizar el estado calculado (`estadoPermiso`), pero la persistencia del
   estado la hace el backend.
5. La validación del formulario se ejecuta **antes** de la petición, para dar retroalimentación
   inmediata; el backend conserva la última palabra sobre autorización y datos.

### 12.4 Backend — especificación detallada

#### 12.4.1 Componentes

| Componente | Archivo | Responsabilidad |
|------------|---------|------------------|
| Servidor HTTP | `server.js` | Crear la app Express, montar estáticos, declarar las 18 rutas, middlewares, arranque |
| Descubrimiento de formatos | `config/index.js` | Listar carpetas de `Proyecto/formatos/` con `esquema.js` y exponer `obtenerFormato(id)` |
| Autenticación y autorización | `lib/auth.js` | Hash de contraseñas, autenticación, alta de usuarios, sesiones, `requireAuth`, `requireRol` |
| Persistencia | `lib/db.js` | CRUD sobre JSON por formato, filtro por usuario, historial |
| Indicadores | `lib/indicadores.js` | Filtros (`desde`, `hasta`, `campo`, `valor`) y ejecución de los KPIs |
| PDF | `lib/pdf.js` | `htmlPdf()` (esquema → HTML), `generarPdf()` (HTML → PDF A4), detección del navegador |
| Siembra | `seed.js`, `seed-datos.js`, `lib/seed-util.js` | Usuarios demo y 26 registros de demostración |

#### 12.4.2 Middlewares

| Middleware | Ubicación | Efecto |
|------------|-----------|--------|
| Log de peticiones | `server.js` | Registra método, URL, código de respuesta y duración al terminar cada respuesta |
| JSON body parser | `server.js` | `express.json({ limit: '10mb' })` |
| Estáticos `/` | `server.js` | Sirve `public/`; `Cache-Control: no-cache` en `.html` |
| Estáticos `/pdfs` | `server.js` | Sirve `pdfs/` con `no-cache` |
| `requireAuth` | `lib/auth.js` | Extrae el token (`Bearer` o `x-token`), valida la sesión y la expiración; si falla, `401` |
| `requireRol(roles)` | `lib/auth.js` | Verifica `req.usuario.rol`; si no coincide, `403` |

#### 12.4.3 Capa de persistencia (`lib/db.js`) — API interna

| Función | Descripción |
|---------|-------------|
| `ESTADOS` | Arreglo con los 4 estados válidos |
| `listar(formatoId, usuario)` | Lee, ordena por `fechaCreacion` descendente y filtra por alcance del usuario |
| `obtener(formatoId, id)` | Busca un registro por identificador |
| `crear(formatoId, data, usuario)` | Crea el registro en `BORRADOR` con evento `CREADO` |
| `actualizar(formatoId, id, data, usuario)` | Reemplaza `data`, actualiza `fechaActualizacion` y agrega evento `ACTUALIZADO` |
| `cambiarEstado(formatoId, id, estado, usuario)` | Normaliza el estado, actualiza fecha y agrega evento `ESTADO: <valor>` |
| `eliminar(formatoId, id)` | Elimina el registro del archivo; devuelve `true`/`false` |

**Comportamientos de robustez:** si el archivo no existe se trata como lista vacía; si el JSON está
corrupto se trata como lista vacía, de modo que un archivo dañado no impide operar los demás formatos.

#### 12.4.4 Servicios de autorización por endpoint

| Recurso | Sin sesión | SISO | Coordinador |
|---------|-----------|------|-------------|
| Ver estado del sistema (`/api/estado`) | Permitido | Permitido | Permitido |
| Ver catálogo de formatos | Permitido | Permitido | Permitido |
| Ver esquema de un formato | Permitido | Permitido | Permitido |
| Listar registros de un formato | 401 | Solo los propios | Todos |
| Crear registro | 401 | Sí | Sí |
| Ver un registro | 401 | Solo el propio (403 si no) | Todos |
| Editar un registro | 401 | Solo el propio (403 si no) | Todos |
| Cambiar estado a `CONCEDIDO`/`CANCELADO` | 401 | 403 | Sí |
| Cambiar estado a `BORRADOR`/`NO CONCEDIDO` | 401 | Solo propio | Sí |
| Eliminar registro | 401 | 403 | Sí |
| Generar PDF | 401 | Solo el propio (403 si no) | Todos |
| Ver indicadores | 401 | 403 | Sí |
| Listar usuarios | 401 | 403 | Sí |
| Crear usuario | 401 | 403 | Sí |
| Ver / actualizar perfil propio | 401 | Sí | Sí |
| Cerrar sesión | 401 | Sí | Sí |

### 12.5 Contrato de comunicación

| Aspecto | Definición |
|---------|------------|
| **Transporte** | HTTP/1.1 sobre `localhost:3200` (o el host de despliegue) |
| **Formato** | JSON UTF-8 en petición y respuesta, salvo el PDF, que es binario servido como archivo estático |
| **Autenticación** | Encabezado `Authorization: Bearer <token>` (alternativa: `x-token: <token>`) |
| **Cabeceras de respuesta** | `Cache-Control: no-cache` para HTML y PDF |
| **Errores** | `{ "error": "mensaje legible" }` con código HTTP significativo |
| **Códigos usados** | 200 (OK), 201 (creado), 400 (datos inválidos), 401 (no autenticado), 403 (sin permiso), 404 (no encontrado), 500 (error del servidor) |
| **Límite de carga** | 10 MB por petición |
| **Origen** | Mismo origen (la SPA y la API se sirven desde el mismo proceso), por lo que no hay CORS |

### 12.6 Decisiones de diseño (ADR)

| ID | Decisión | Justificación |
|----|----------|---------------|
| D-1 | No usar base de datos relacional en la fase actual | Reduce fricción académica y de despliegue; el contrato de datos ya es migrable 1:1 |
| D-2 | Generar el PDF en el servidor con Puppeteer en lugar de imprimir desde el navegador | Garantiza que el documento oficial se produzca idéntico en cualquier equipo y quede almacenado |
| D-3 | Frontend vanilla, sin framework | El alcance (7 formatos, CRUD, indicadores) se cubre con manipulación directa del DOM; menos dependencias |
| D-4 | Esquemas declarativos | Las reglas (estado, condicionales `soloSi`, tablas, KPIs) viven en los esquemas para centralizar la definición del formato |
| D-5 | Token opaco almacenado en el servidor en vez de JWT | Permite revocación inmediata (cerrar sesión) sin necesidad de firma ni secreto compartido |
| D-6 | Validación en el cliente antes de la petición | Da retroalimentación inmediata al SISO en campo sin un viaje de ida y vuelta; la autoridad sigue siendo del servidor |
| D-7 | Un solo proceso Express | Simplifica la demostración y el despliegue académico; el proceso sirve API, estáticos y PDF |
| D-8 | `puppeteer-core` en vez de `puppeteer` | Evita descargar Chromium; usa el navegador ya instalado en el equipo |
| D-9 | Persistencia en archivos JSON con escritura completa | El volumen es bajo y la simplicidad favorece la demostración; se acepta la limitación de concurrencia (ver R-02) |

---

## 13. ESPECIFICACIÓN DE LA API REST

### 13.1 Convenciones

- Base: `http://localhost:3200`
- Todas las rutas de datos requieren `Authorization: Bearer <token>` salvo las marcadas como públicas.
- Las rutas marcadas con 🔒 **Coordinador** requieren rol `COORDINADOR`.

### 13.2 Catálogo de endpoints

| # | Método | Ruta | Auth | Rol | Cuerpo | Respuesta | Errores |
|---|--------|------|------|-----|-------|-----------|---------|
| 1 | `GET` | `/api/estado` | — | — | — | `{ app, version, formatos, fecha }` | — |
| 2 | `POST` | `/api/auth/login` | — | — | `{ email, password }` | `200 { token, usuario }` | 400 faltan campos · 401 credenciales |
| 3 | `POST` | `/api/auth/logout` | Sí | — | — | `200 { ok: true }` | 401 |
| 4 | `GET` | `/api/auth/me` | Sí | — | — | `200 { usuario, token }` | 401 |
| 5 | `PATCH` | `/api/auth/perfil` | Sí | — | `{ nombre?, foto?, cargo?, cedula?, telefono? }` | `200 { usuario }` | 400 nombre vacío · 400 foto inválida · 401 · 404 usuario |
| 6 | `GET` | `/api/usuarios` | Sí | 🔒 | — | `200 [perfilPúblico]` | 401 · 403 |
| 7 | `POST` | `/api/usuarios` | Sí | 🔒 | `{ nombre, email, password, rol }` | `201 { perfilPúblico }` | 400 campos faltantes · 400 rol inválido · 400 correo duplicado · 401 · 403 |
| 8 | `GET` | `/api/formatos` | — | — | — | `200 [metadatos]` | — |
| 9 | `GET` | `/api/formatos/:id/esquema` | — | — | — | `200 { id, codigo, nombre, esquema, estados }` | 404 formato |
| 10 | `GET` | `/api/indicadores` | Sí | 🔒 | — | `200 [ { id, codigo, nombre, indicadores[] } ]` | 401 · 403 |
| 11 | `GET` | `/api/formatos/:id/indicadores` | Sí | 🔒 | `?desde&hasta&campo&valor` | `200 { formato, filtros, indicadores[] }` | 401 · 403 · 404 |
| 12 | `GET` | `/api/formatos/:id` | Sí | — | — | `200 [registros]` | 401 · 404 |
| 13 | `POST` | `/api/formatos/:id` | Sí | — | `{ data }` | `201 { registro }` | 401 · 404 |
| 14 | `GET` | `/api/formatos/:id/:rid` | Sí | propietario o 🔒 | — | `200 { registro }` | 401 · 403 · 404 |
| 15 | `PUT` | `/api/formatos/:id/:rid` | Sí | propietario o 🔒 | `{ data }` | `200 { registro }` | 401 · 403 · 404 |
| 16 | `PATCH` | `/api/formatos/:id/:rid/estado` | Sí | 🔒 para aprobar/cancelar | `{ estado }` | `200 { registro }` | 401 · 403 · 404 |
| 17 | `DELETE` | `/api/formatos/:id/:rid` | Sí | 🔒 | — | `200 { ok: true }` | 401 · 403 · 404 |
| 18 | `POST` | `/api/formatos/:id/:rid/pdf` | Sí | propietario o 🔒 | `{}` | `200 { filename, url }` | 401 · 403 · 404 · 500 |

**Nota de seguridad:** las rutas 8 y 9 son públicas porque solo exponen metadatos y estructura del
formato. La interfaz las invoca después de autenticar, de modo que en la práctica un usuario sin sesión
no llega a ellas; si se requiere ocultarlas por completo, basta con añadir `requireAuth` (ver DT-08, §26.2).

### 13.3 Ejemplos de petición y respuesta

**Inicio de sesión**

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "coordinador@sstech.co", "password": "coordinador123" }
```

```json
200 OK
{
  "token": "cfce30f06474962c18bfe5268591ac2c523ae20bed81a057794b74dc707ac295",
  "usuario": {
    "id": "71e9d287-ff90-4ce1-a532-29d5c1678d40",
    "nombre": "Ana Coordinadora",
    "email": "coordinador@sstech.co",
    "rol": "COORDINADOR",
    "activo": true,
    "foto": "",
    "cargo": "Coordinadora SST",
    "cedula": "1051234890",
    "telefono": "+573001112233"
  }
}
```

**Listar registros de un formato (SISO)**

```http
GET /api/formatos/ft-ope-06
Authorization: Bearer <token>
```

Devuelve **únicamente** los registros cuyo `usuarioId` coincide con el del SISO.

**Cambiar el estado (Coordinador)**

```http
PATCH /api/formatos/ft-ope-06/070206eb-13cb-43c9-ae62-8aec6f8ec6f6/estado
Authorization: Bearer <token>
Content-Type: application/json

{ "estado": "CONCEDIDO" }
```

**Generar el PDF**

```http
POST /api/formatos/ft-ope-06/070206eb-13cb-43c9-ae62-8aec6f8ec6f6/pdf
Authorization: Bearer <token>
Content-Type: application/json

{}
```

```json
200 OK
{
  "filename": "ft-ope-06-070206eb-13cb-43c9-ae62-8aec6f8ec6f6.pdf",
  "url": "/pdfs/ft-ope-06-070206eb-13cb-43c9-ae62-8aec6f8ec6f6.pdf"
}
```

**Obtener indicadores filtrados**

```http
GET /api/formatos/ft-ope-06/indicadores?desde=2026-09-01&hasta=2026-09-30
Authorization: Bearer <token>
```

```json
200 OK
{
  "formato": { "id": "ft-ope-06", "codigo": "FT-OPE-06", "nombre": "Permiso de Trabajo en Campo" },
  "filtros": { "desde": "2026-09-01", "hasta": "2026-09-30" },
  "indicadores": [
    { "codigo": "KP1", "nombre": "Total de permisos emitidos", "tipo": "contador", "valor": 7, "registrosAnalizados": 7 }
  ]
}
```

### 13.4 Formato de los errores

```json
{ "error": "Solo puede editar registros propios" }
```

| Código | Significado | Ejemplos de mensaje |
|--------|-------------|---------------------|
| 400 | Solicitud malformada | `Email y contraseña requeridos` · `La foto debe ser una imagen en base64 (data:image/...)` · `Rol inválido` |
| 401 | Sin sesión válida | `No autenticado. Inicie sesión.` |
| 403 | Rol o propietario insuficiente | `Solo el Coordinador puede aprobar o cancelar` · `Acceso denegado. Requiere rol: COORDINADOR` |
| 404 | Recurso inexistente | `Formato no encontrado` · `Registro no encontrado` |
| 500 | Error interno | `No se pudo generar el PDF: No se encontró Chrome/Edge instalado en el servidor` |

---

## 14. CATÁLOGO DE FORMATOS

### 14.1 Resumen

| # | Código | Nombre | Versión | Fecha | Id | Color | Icono | Registros demo |
|---|--------|--------|---------|-------|-----|-------|-------|----------------|
| 1 | FT-OPE-06 | Permiso de Trabajo en Campo | 07 | mar-2023 | `ft-ope-06` | `#0f2a43` | 🦺 | 7 |
| 2 | FT-OPE-51 | Permiso de Trabajo en Alturas | 01 | ene-2023 | `ft-ope-51` | `#1d5b8c` | 🧗 | 4 |
| 3 | FT-OPE-56 | Control de asistencia de Operaciones | 02 | jul-2026 | `ft-ope-56` | `#4a7d3a` | 📋 | 3 |
| 4 | FT-SST-08 | Control semanal de pausas activas | 01 | ene-22 | `ft-sst-08` | `#8c6a1d` | 🧘 | 3 |
| 5 | FT-SST-11 | Reporte de Investigación de A.T e I.T | 04 | jun-23 | `ft-sst-11` | `#8c1d1d` | 📑 | 3 |
| 6 | FT-SST-37 | Análisis de Trabajo Seguro (ATS) | 06 | ago-22 | `ft-sst-37` | `#7a1d5c` | 🔬 | 3 |
| 7 | FT-SST-39 | Control de Entregas de EPP | 01 | ene-2021 | `ft-sst-39` | `#1d7a6a` | 🧤 | 3 |

**Total de registros de demostración: 26.**
Distribución por estado: 15 `CONCEDIDO`, 3 `NO CONCEDIDO`, 7 `BORRADOR`, 1 `CANCELADO`.
Autores: mezcla de `Carlos SISO` y `Ana Coordinadora`.

### 14.2 Bloques funcionales por formato

#### 14.2.1 FT-OPE-06 — Permiso de Trabajo en Campo (v07)

| Bloque | Contenido | Tipo |
|--------|-----------|------|
| Encabezado | Código, fecha, versión | Fijo |
| Localización de la actividad | Planta / Parque Industrial / Punto de Venta / Granja / Otro + "¿Cuál?" | Radio + texto |
| Datos generales | Lugar específico, solicitante, responsable del área, empresa ejecutora, responsable del equipo, descripción del trabajo | Texto / textarea |
| Ejecución | Fecha de diligenciamiento, hora de inicio, hora de fin | Fecha + hora |
| Ejecutantes | Nombres, C.C., afiliación a seguridad social, aptitud médica, certificación (tabla repetible) | Tabla dinámica |
| Definición de tareas | 6 tipos: izaje, trabajo en caliente, armado/montaje, espacios confinados, energías peligrosas, red de frío/NH₃ | Tareas SI/NO/NA |
| Medidas preventivas y EPP | EPP exigido y recomendado | Checkbox |
| Mediciones atmosféricas | %Comb, %Prop, NH₃ ppm, H₂S ppm, %O₂, CO ppm | Numérico |
| Herramientas y requisitos | Herramientas a utilizar, requisitos adicionales | Texto |
| Autorización | Firmas: emisor, representante del cliente, responsable del equipo, ejecutantes | Texto |
| Listas de verificación | 65 ítems agrupados: General (1–20), Izaje (1–21), Caliente (22–35), Confinados (36–51), Energías (52–65) | Checklist condicional |

**Configuración de validación**

| Regla | Detalle |
|-------|---------|
| Obligatorios (9) | `localizacion`, `lugarEspecifico`, `solicitante`, `responsableEquipo`, `responsableArea`, `empresaEjecutora`, `descripcion`, `horaInicio`, `horaFin` |
| Fechas | `fecha` se autollena con hoy y no puede ser futura |
| Tabla requerida | `ejecutantes`, con columnas obligatorias `nombre`, `cc` |
| Tareas | 6 tareas obligatorias |
| Checklists | Grupo `general` siempre; los demás solo si su tarea condicionante es `SI` |

#### 14.2.2 FT-OPE-51 — Permiso de Trabajo en Alturas (v01)

| Bloque | Tipo |
|--------|------|
| Datos generales: lugar, trabajo, descripción, fechas y horas | Texto, fecha, hora |
| Trabajo en altura: altura, ayudante de seguridad (nombre y documento) | Texto, número |
| Cálculo de caída: distancias a, b, c, d, e, f, si/no y resultado | Numérico, radio |
| Firmas: emisor y responsables | Texto |
| Lista de verificación de alturas | Checklist |
| Satisfacción del trabajo | Fecha, radio, firmas |

**Configuración de validación**

| Regla | Detalle |
|-------|---------|
| Obligatorios (15) | `lugarEspecifico`, `trabajo`, `descripcion`, `horaInicio`, `horaFin`, `altura`, `ayudanteNombre`, `caida.a`, `caida.b`, `caida.c`, `caida.e`, `caida.d`, `caida.f`, `caida.siNo`, `firmas.emisor` |
| Fechas | `fecha` y `satisfaccion.fecha` se autollenan con hoy; no pueden ser futuras |
| Tabla requerida | `personal`, con columnas `nombre`, `numero` |

#### 14.2.3 FT-OPE-56 — Control de asistencia de Operaciones (v02)

| Bloque | Tipo |
|--------|------|
| Regional, OT, cliente, responsable | Texto |
| Fecha de registro | Fecha (hoy) |
| Tabla de asistencia: nombre, cédula, entrada, salida, observación | Tabla dinámica |

**Validación:** obligatorios (4) `regional`, `ot`, `cliente`, `responsable`; fecha `fecha` autollenada
con hoy; tabla `asistencia` requerida con columnas `nombre`, `cedula`.

#### 14.2.4 FT-SST-08 — Control semanal de pausas activas (v01)

| Bloque | Tipo |
|--------|------|
| Mes, semana, año | Texto, número |
| ¿Se realizó?, regional, quién revisa | Radio, texto |
| Tabla de participantes: nombres, C.C. | Tabla dinámica |

**Validación:** obligatorios (6) `mes`, `semana`, `anio`, `realiza`, `regional`, `revisa`; tabla
`participantes` requerida con columnas `nombres`, `cc`.

#### 14.2.5 FT-SST-11 — Reporte de Investigación de A.T e I.T (v04)

| Bloque | Tipo |
|--------|------|
| Clasificación del evento, afectado, NIT, cargo, fecha de ingreso, ciudad | Texto, fecha |
| Responsable y cargo del responsable | Texto |
| Fecha del reporte, fecha del evento, hora del evento, turno, área de proceso, sitio de ocurrencia | Fecha, hora, texto |
| ¿Qué ocurrió? | Textarea |
| Días de incapacidad | Número (mínimo 0) |
| Plan de acción: control, responsable, fecha | Tabla dinámica |

**Validación:** 15 campos obligatorios (`clasificacion`, `afectado`, `nit`, `cargo`, `fechaIngreso`,
`ciudad`, `responsable`, `cargoResponsable`, `fechaReporte`, `fechaEvento`, `horaEvento`, `turno`,
`areaProceso`, `sitioOcurrencia`, `queOcurrio`); `fechaReporte` autollenada con hoy;
`diasIncapacidad ≥ 0`; tabla `planAccion` requerida con columnas `control`, `responsable`.

#### 14.2.6 FT-SST-37 — Análisis de Trabajo Seguro — ATS (v06)

| Bloque | Tipo |
|--------|------|
| Trabajo, sitio, cliente, ciudad, fecha | Texto, fecha |
| Peligros identificados | Textarea |
| Tabla de pasos: paso, peligros, medidas | Tabla dinámica |
| Tabla de equipo: nombre, cédula | Tabla dinámica |
| Tareas de verificación del análisis (7) | Tareas SI/NO/NA |

**Validación:** obligatorios (6) `trabajo`, `sitio`, `cliente`, `ciudad`, `fecha`,
`peligrosIdentificados`; tablas `pasos` (columnas `paso`, `peligros`, `medidas`) y `equipo`
(columnas `nombre`, `cedula`) requeridas.

#### 14.2.7 FT-SST-39 — Control de Entregas de EPP (v01)

| Bloque | Tipo |
|--------|------|
| Fecha del lote | Fecha (hoy, autollenada) |
| Tabla de entregas: cédula, nombre, cargo, tipo de entrega, cantidad, fecha | Tabla dinámica |

**Validación:** `fechaLote` obligatoria, autollenada con hoy, no futura; tabla `entregas` requerida con
columnas `cedula`, `nombre`, `cargo`.

### 14.3 Procedimiento para agregar un formato nuevo

1. Crear la carpeta `Proyecto/formatos/<nuevo-id>/`.
2. Crear `esquema.js` exportando `id`, `codigo`, `nombre`, `fecha`, `version`, `color`, `icono`,
   `listado` y `secciones`.
3. *(Opcional)* Crear `indicadores.js` exportando el arreglo de KPIs.
4. *(Opcional)* Añadir la entrada en `VALIDACION_FORMATOS` dentro de
   `Proyecto/platform/public/js/validacion.js`.
5. Ejecutar `npm run seed` para crear `data/<nuevo-id>.json` con datos de demostración.
6. Reiniciar el servidor. El formato aparece automáticamente en el catálogo.

No se modifica ningún archivo del núcleo (`server.js`, `app.js`, `form.js`, `pdf.js`).

---

## 15. MOTOR DE VALIDACIÓN

### 15.1 Ubicación y piezas

| Aspecto | Detalle |
|---------|---------|
| Archivo | `Proyecto/platform/public/js/validacion.js` |
| Configuración | Objeto `VALIDACION_FORMATOS`, indexado por `id` de formato |
| Motor | `validarFormulario(esquema, data) → [{ ruta, msg }]` |
| Autofechas | `aplicarAutoFechas(esquema, data)` |
| Resaltado | `limpiarErroresUI()`, `quitarErrorUI(ruta)`, `marcarErroresUI(errores)` |
| Integración | `UI.guardar()` valida antes de cualquier petición; `UI.nuevo()` aplica autofechas |

### 15.2 Tipos de regla

| Regla | Propiedad | Comportamiento |
|-------|-----------|----------------|
| Campo obligatorio | `requeridos: [ruta]` | Error si el valor está vacío, es `null`, `undefined` o solo espacios |
| Fecha de diligenciamiento | `fechasHoy: [ruta]` | Se autollena con hoy al crear; error si es posterior a hoy |
| Rango numérico | `numeros: { ruta: { min, max } }` | Error si no es numérico o está fuera del rango |
| Tabla requerida | `tablas: { clave: { requerida, columnas } }` | Error si no hay al menos una fila válida; error por celda obligatoria `tabla.i.columna` |
| Tareas | derivada de la sección `tareas` del esquema | Error por cada tarea sin responder |
| Checklists | derivada de la sección `checklists` del esquema | Error por cada ítem sin marcar en los grupos aplicables |

### 15.3 Tabla de reglas por formato

| Formato | Obligatorios (n.º) | Fechas hoy | Números | Tablas requeridas | Tareas | Checklists |
|---------|--------------------|-----------|---------|-------------------|--------|------------|
| `ft-ope-06` | 9 | `fecha` | — | `ejecutantes` (nombre, cc) | 6 | `general` + condicionales por `soloSi` |
| `ft-ope-51` | 15 | `fecha`, `satisfaccion.fecha` | — | `personal` (nombre, numero) | — | `general` |
| `ft-ope-56` | 4 | `fecha` | — | `asistencia` (nombre, cedula) | — | — |
| `ft-sst-08` | 6 | — | — | `participantes` (nombres, cc) | — | — |
| `ft-sst-11` | 15 | `fechaReporte` | `diasIncapacidad ≥ 0` | `planAccion` (control, responsable) | — | — |
| `ft-sst-37` | 6 | — | — | `pasos` (paso, peligros, medidas), `equipo` (nombre, cedula) | 7 | — |
| `ft-sst-39` | 1 | `fechaLote` | — | `entregas` (cedula, nombre, cargo) | — | — |

### 15.4 Ejemplo de configuración

```js
'ft-ope-06': {
  fechasHoy: ['fecha'],
  requeridos: [
    'localizacion', 'lugarEspecifico', 'solicitante', 'responsableEquipo',
    'responsableArea', 'empresaEjecutora', 'descripcion', 'horaInicio', 'horaFin'
  ],
  tablas: {
    ejecutantes: { requerida: true, columnas: ['nombre', 'cc'] }
  }
}
```

### 15.5 Formato de los errores devueltos

```js
[
  { ruta: 'solicitante',       msg: 'Campo obligatorio' },
  { ruta: 'fecha',             msg: 'La fecha no puede ser posterior a hoy' },
  { ruta: 'ejecutantes',       msg: 'Debe registrar al menos una fila válida' },
  { ruta: 'ejecutantes.0.cc',  msg: 'Fila 1: campo obligatorio' },
  { ruta: 'tareas.3',          msg: 'Debe responder Izaje de cargas' },
  { ruta: 'verif.izaje.0',     msg: 'Falta marcar SI/NO en Izaje' }
]
```

La `ruta` coincide con el atributo `data-path` de cada control, lo que permite resaltar visualmente el
elemento exacto y limpiar su error al corregirlo.

### 15.6 Garantía de cobertura

La suite unitaria incluye una prueba de **cobertura de configuración** que, para cada formato, verifica
que **toda** ruta declarada en `VALIDACION_FORMATOS` exista realmente en el esquema; si se declara una
ruta inventada, la prueba falla. Además valida que el formulario vacío de cada formato produzca errores
sin lanzar excepción, y que cada error tenga `ruta` y `msg`.

---

## 16. INDICADORES POR FORMATO

### 16.1 Motor

| Aspecto | Detalle |
|---------|---------|
| Archivo | `Proyecto/platform/lib/indicadores.js` |
| Entrada | Lista de registros ya filtrados por alcance del usuario |
| Filtros | `desde`, `hasta` (rango de fechas) · `campo` + `valor` (coincidencia exacta, sin distinguir mayúsculas) |
| Fecha de referencia | El primer campo `type: 'date'` del esquema, excluyendo `fechaReporte`; si no hay, `fechaCreacion` |
| Salida | `{ codigo, nombre, tipo, valor, registrosAnalizados }` con numéricos redondeados a 2 decimales |
| Aislamiento | Un fallo en un KPI produce el valor `ERR` sin interrumpir el tablero |
| Auto-prueba | `node lib/indicadores.js` ejecuta el motor con datos de ejemplo y muestra los resultados |

### 16.2 Catálogo de indicadores (36 en total: 28 base + 8 con sufijo)

#### FT-OPE-06 — Permiso de Trabajo en Campo

| Código | Indicador | Tipo |
|--------|-----------|------|
| KP1 | Total de permisos emitidos | contador |
| KP2 | % permisos CONCEDIDOS | porcentaje |
| KP3 | Índice de NO-conformidad (NO / ítems verificados) | porcentaje |
| KP4 | Permisos por localización (top) | lista |
| KP5 | Distribución por tipo de tarea | lista |
| KP6 | Trabajadores promedio por permiso | contador |
| KP7 | Permisos con respuesta NO en lista de verificación | contador |
| KP8 | Duración promedio (horas) | contador |

#### FT-OPE-51 — Permiso de Trabajo en Alturas

| Código | Indicador | Tipo |
|--------|-----------|------|
| KP9 | Total de permisos de altura | contador |
| KP10 | % con ayudante de seguridad designado | porcentaje |
| KP11 | % con distancia de caída verificada (SI) | porcentaje |
| KP12 | NO-conformidad en checklist de alturas | porcentaje |
| KP12b | Sistemas de prevención utilizados (top) | lista |

#### FT-OPE-56 — Control de Asistencia de Operaciones

| Código | Indicador | Tipo |
|--------|-----------|------|
| KP13 | Asistencia total registrada | contador |
| KP14 | Asistencia promedio por sesión | contador |
| KP15 | Sesiones registradas | contador |
| KP15b | Sesiones por regional | lista |

#### FT-SST-08 — Control Semanal de Pausas Activas

| Código | Indicador | Tipo |
|--------|-----------|------|
| KP16 | Sesiones (semanas) registradas | contador |
| KP17 | Participantes promedio por sesión | contador |
| KP17b | Total de participaciones | contador |
| KP18 | Cumplimiento (% = vía con registro) | porcentaje |

#### FT-SST-11 — Reporte de Investigación de A.T e I.T

| Código | Indicador | Tipo |
|--------|-----------|------|
| KP19 | Total de eventos reportados (A.T / I.T / otros) | contador |
| KP19b | Desglose por clasificación | lista |
| KP20 | Días totales de incapacidad / paro | contador |
| KP21 | Causas con mayor contenido (top) | lista |
| KP22 | % plan de acción con responsable asignado | porcentaje |
| KP22b | Promedio de acciones por reporte | contador |

#### FT-SST-37 — Análisis de Trabajo Seguro (ATS)

| Código | Indicador | Tipo |
|--------|-----------|------|
| KP23 | Total de ATS | contador |
| KP23b | Trabajos de alto riesgo más frecuentes | lista |
| KP24 | Promedio de pasos descritos por ATS | contador |
| KP24b | % ATS con peligros registrados | porcentaje |
| KP25 | Tamaño promedio del equipo de trabajo | contador |

#### FT-SST-39 — Control de Entregas de EPP

| Código | Indicador | Tipo |
|--------|-----------|------|
| KP26 | Total de elementos entregados | contador |
| KP26b | Trabajadores a los que se hicieron entregas | contador |
| KP27 | Promedio de EPP por entrega | contador |
| KP28 | Tipo de entrega más frecuente | lista |

---

## 17. HISTORIAS DE USUARIO

**Formato:** `Como [rol], quiero [acción], para [beneficio]`
**Prioridad:** `Alta` (imprescindible) · `Media` (importante) · `Baja` (deseable)
**Escala:** puntos de historia (1 = trivial, 3 = media, 5 = compleja, 8 = muy compleja)

### 17.1 Épica E1 — Acceso e identidad

| ID | Historia | Rol | Prioridad | Puntos | Requisitos |
|----|----------|-----|-----------|--------|-------------|
| HU-001 | Como **usuario**, quiero **iniciar sesión con mi correo y contraseña**, para **acceder a la plataforma de forma segura**. | Ambos | Alta | 2 | RF-01…RF-05 |
| HU-002 | Como **usuario**, quiero **ver un mensaje claro cuando mis credenciales son incorrectas**, para **saber que debo verificarlas sin pensar que el sistema está caído**. | Ambos | Alta | 1 | RF-02, RF-03 |
| HU-003 | Como **usuario**, quiero **que mi sesión se mantenga abierta mientras trabajo y se cierre sola al vencer**, para **no perder el diligenciamiento a mitad de camino**. | Ambos | Alta | 3 | RF-07, RF-08 |
| HU-004 | Como **usuario**, quiero **cerrar sesión de forma explícita**, para **que nadie más use el equipo con mis permisos**. | Ambos | Alta | 1 | RF-06 |
| HU-005 | Como **usuario**, quiero **ver mi nombre, correo, cargo y rol en la barra superior**, para **confirmar con qué identidad estoy operando**. | Ambos | Media | 2 | RF-09, RF-203 |
| HU-006 | Como **usuario**, quiero **que mi perfil muestre mi foto**, para **reconocer de un vistazo quién está operando el sistema**. | Ambos | Media | 3 | RF-27, RF-28 |
| HU-007 | Como **usuario**, quiero **actualizar mi nombre, cargo, cédula y teléfono**, para **que mis datos estén al día**. | Ambos | Media | 2 | RF-24…RF-26 |
| HU-008 | Como **usuario**, quiero **subir una foto de perfil sin que se degrade**, para **que se vea bien en la interfaz**. | Ambos | Baja | 2 | RF-27, RF-30 |
| HU-009 | Como **usuario**, quiero **que el sistema me devuelva a la pantalla de login si mi sesión expira**, para **saber que debo volver a identificarme**. | Ambos | Media | 2 | RF-10, RF-11 |

**Criterios de aceptación (HU-001, HU-003, HU-007)**

| # | Criterio |
|---|----------|
| CA-1 | Dado un usuario válido, cuando envía correo y contraseña correctos, entonces recibe 200 con token y perfil, y la interfaz muestra el panel. |
| CA-2 | Dado un correo inexistente o una contraseña incorrecta, cuando envía las credenciales, entonces recibe 401 con el mensaje *"Credenciales inválidas"*. |
| CA-3 | Dado un token vencido, cuando realizo cualquier petición de datos, entonces el sistema cierra la sesión local y vuelve al login. |
| CA-4 | Dado un token vigente, cuando recargo la página, entonces la sesión se restaura sin pedir credenciales. |
| CA-5 | Dado un perfil con nombre vacío, cuando intento guardarlo, entonces recibo el error *"El nombre no puede estar vacío"*. |
| CA-6 | Dado una foto que no sea `data:image/...`, cuando intento guardarla, entonces recibo el error correspondiente. |

### 17.2 Épica E2 — Catálogo y navegación

| ID | Historia | Rol | Prioridad | Puntos | Requisitos |
|----|----------|-----|-----------|--------|-------------|
| HU-010 | Como **usuario**, quiero **ver los 7 formatos en un panel lateral con su código y versión**, para **acceder rápido al formato que necesito**. | Ambos | Alta | 2 | RF-40, RF-43 |
| HU-011 | Como **desarrollador**, quiero **que el sistema descubra los formatos automáticamente**, para **no tener que registrar cada formato nuevo en el código**. | — | Media | 5 | RF-41, RF-42 |
| HU-012 | Como **usuario**, quiero **que al cambiar de formato se recarguen su tabla y su formulario sin salir de la página**, para **no perder el ritmo de trabajo**. | Ambos | Alta | 2 | RF-190 |
| HU-013 | Como **usuario**, quiero **ver un mensaje si el formato no tiene registros**, para **saber que debo crear uno en lugar de pensar que hay un error**. | Ambos | Baja | 1 | RF-60 |
| HU-014 | Como **Coordinador**, quiero **ver el encabezado con el código, la versión y la fecha del formato**, para **saber con qué versión estoy trabajando**. | Coordinador | Media | 1 | RF-43 |

### 17.3 Épica E3 — Diligenciamiento de formatos

| ID | Historia | Rol | Prioridad | Puntos | Requisitos |
|----|----------|-----|-----------|--------|-------------|
| HU-020 | Como **SISO**, quiero **crear un registro nuevo de un formato**, para **capturar la información en campo**. | SISO | Alta | 3 | RF-50, RF-51 |
| HU-021 | Como **SISO**, quiero **diligenciar un formulario que respete el orden y el contenido del formato físico**, para **evitar errores de captura**. | SISO | Alta | 5 | RF-70…RF-74 |
| HU-022 | Como **SISO**, quiero **agregar y quitar filas en las tablas** (ejecutantes, asistencia, entregas), para **adaptarme al número real de personas**. | SISO | Alta | 3 | RF-75, RF-76 |
| HU-023 | Como **SISO**, quiero **responder las tareas con SI / NO / NA**, para **dejar registrado el tipo de trabajo a ejecutar**. | SISO | Alta | 3 | RF-77 |
| HU-024 | Como **SISO**, quiero **marcar los ítems de la lista de verificación con SI / NO**, para **dejar constancia del análisis de riesgo**. | SISO | Alta | 3 | RF-78 |
| HU-025 | Como **SISO**, quiero **que solo se me muestren las listas de verificación que aplican a mi trabajo**, para **no diligenciar información irrelevante**. | SISO | Alta | 3 | RF-79, RF-80 |
| HU-026 | Como **SISO**, quiero **que el sistema me avise qué me falta antes de guardar**, para **no enviar registros incompletos**. | SISO | Alta | 5 | RF-90, RF-91, RF-96 |
| HU-027 | Como **SISO**, quiero **que los campos pendientes se resalten en rojo**, para **localizarlos de inmediato sin leer la lista de errores**. | SISO | Alta | 2 | RF-92, RF-93, RF-94 |
| HU-028 | Como **SISO**, quiero **que la fecha de diligenciamiento se llene sola con la fecha de hoy**, para **no escribirla y no equivocarme**. | SISO | Alta | 2 | RF-98 |
| HU-029 | Como **SISO**, quiero **guardar el registro como BORRADOR y retomarlo después**, para **diligenciar en campo sin presión de terminar**. | SISO | Alta | 2 | RF-51, RF-110 |
| HU-030 | Como **SISO**, quiero **que la fecha de diligenciamiento no me deje poner una fecha futura**, para **evitar registros con datos imposibles**. | SISO | Media | 2 | RF-99, RN-09 |
| HU-031 | Como **SISO**, quiero **que el sistema me muestre el estado del permiso mientras diligencio**, para **saber en cualquier momento si el permiso sería rechazado**. | SISO | Media | 2 | RF-82, RF-111, RF-112 |
| HU-032 | Como **SISO**, quiero **que el error me indique exactamente qué celda de la tabla falta**, para **no tener que revisar fila por fila**. | SISO | Media | 2 | RF-97 |

### 17.4 Épica E4 — Seguimiento y consulta

| ID | Historia | Rol | Prioridad | Puntos | Requisitos |
|----|----------|-----|-----------|--------|-------------|
| HU-040 | Como **Coordinador**, quiero **ver una tabla de registros por formato con sus columnas clave, creador, estado y fecha**, para **hacer seguimiento a los trabajos en curso**. | Coordinador | Alta | 3 | RF-57, RF-59 |
| HU-041 | Como **Coordinador**, quiero **buscar registros por texto libre**, para **localizar un permiso concreto entre decenas**. | Ambos | Alta | 2 | RF-61 |
| HU-042 | Como **Coordinador**, quiero **filtrar por estado**, para **ver solo lo que está en revisión, concedido o cancelado**. | Ambos | Alta | 2 | RF-61 |
| HU-043 | Como **Coordinador**, quiero **ver los registros ordenados del más reciente al más antiguo**, para **identificar lo último que se registró**. | Ambos | Media | 1 | RF-57 |
| HU-044 | Como **SISO**, quiero **ver solo mis propios registros**, para **enfocarme en mi área sin ver información de otros**. | SISO | Alta | 2 | RF-64, RN-04 |
| HU-045 | Como **usuario**, quiero **paginar la lista de registros**, para **que la tabla siga siendo legible con muchos datos**. | Ambos | Media | 2 | RF-58, RF-62 |
| HU-046 | Como **Coordinador**, quiero **abrir el detalle completo de un registro y ver su historial de cambios**, para **auditar quién hizo qué y cuándo**. | Ambos | Alta | 3 | RF-54, RF-85, RF-160…RF-165 |
| HU-047 | Como **Coordinador**, quiero **exportar los registros filtrados a CSV**, para **reportar a la dirección sin volver a copiar datos**. | Ambos | Media | 2 | RF-63 |

### 17.5 Épica E5 — Control de estados (regla de negocio)

| ID | Historia | Rol | Prioridad | Puntos | Requisitos |
|----|----------|-----|-----------|--------|-------------|
| HU-050 | Como **Coordinador**, quiero **que el sistema marque automáticamente `NO CONCEDIDO` cuando hay una respuesta `NO`**, para **impedir que se emitan permisos inseguros**. | Sistema | Alta | 5 | RF-111, RN-01 |
| HU-051 | Como **Coordinador**, quiero **que el sistema proponga `CONCEDIDO` cuando no hay respuestas `NO`**, para **acortar la revisión de permisos sin observaciones**. | Sistema | Alta | 2 | RF-112, RN-02 |
| HU-052 | Como **Coordinador**, quiero **aprobar o cancelar un permiso manualmente**, para **ejercer el control final con criterio propio**. | Coordinador | Alta | 3 | RF-114, RN-05 |
| HU-053 | Como **SISO**, quiero **no poder aprobar ni cancelar permisos**, para **cumplir la separación de responsabilidades de la organización**. | SISO | Alta | 2 | RF-83, RF-115 |
| HU-054 | Como **Coordinador**, quiero **que un permiso cancelado no cambie de estado solo por editarlo**, para **que la cancelación sea firme**. | Coordinador | Media | 2 | RF-118, RN-03 |
| HU-055 | Como **Coordinador**, quiero **que cada cambio de estado quede en el historial**, para **tener evidencia de la decisión**. | Ambos | Alta | 2 | RF-163, RNF-60 |
| HU-056 | Como **Coordinador**, quiero **que mi decisión manual prevalezca sobre el cálculo automático cuando difieran**, para **dejar constancia de mi criterio**. | Coordinador | Media | 2 | RF-119 |

### 17.6 Épica E6 — Documento oficial en PDF

| ID | Historia | Rol | Prioridad | Puntos | Requisitos |
|----|----------|-----|-----------|--------|-------------|
| HU-060 | Como **SISO**, quiero **generar el PDF de mi registro**, para **imprimirlo y firmarlo si el proceso lo exige**. | SISO | Alta | 5 | RF-130, RF-135…RF-142 |
| HU-061 | Como **Coordinador**, quiero **que el PDF tenga el mismo diseño del formato físico**, para **presentarlo sin observaciones**. | Coordinador | Alta | 8 | RF-132, RF-133, RT-1 |
| HU-062 | Como **Coordinador**, quiero **que el PDF muestre el código y la versión del formato**, para **saber con qué versión se emitió el permiso**. |Ambos | Alta | 2 | RF-132, RN-07 |
| HU-063 | Como **usuario**, quiero **ver el PDF en pantalla y descargarlo**, para **revisarlo y archivarlo**. | Ambos | Alta | 2 | RF-144, RF-145 |
| HU-064 | Como **SISO**, quiero **que el sistema guarde el registro antes de generar el PDF**, para **no perder el trabajo si el documento falla**. | SISO | Media | 2 | RF-146 |
| HU-065 | Como **SISO**, quiero **no poder generar el PDF de un registro ajeno**, para **que la responsabilidad de cada permiso quede clara**. | SISO | Media | 2 | RF-147 |
| HU-066 | Como **Coordinador**, quiero **que el PDF muestre las tablas con el número de fila y los encabezados del formato**, para **que sea legible e identificable**. | Coordinador | Media | 3 | RF-134, RN-22 |

### 17.7 Épica E7 — Indicadores y reportes

| ID | Historia | Rol | Prioridad | Puntos | Requisitos |
|----|----------|-----|-----------|--------|-------------|
| HU-070 | Como **Coordinador**, quiero **ver un tablero de indicadores por formato**, para **conocer el estado real de la operación**. | Coordinador | Alta | 5 | RF-170, RF-171 |
| HU-071 | Como **Coordinador**, quiero **filtrar los indicadores por rango de fechas**, para **analizar un período específico**. | Coordinador | Alta | 3 | RF-172, RF-174 |
| HU-072 | Como **Coordinador**, quiero **filtrar los indicadores por campo**, para **comparar, por ejemplo, PLANTA contra GRANJA**. | Coordinador | Media | 3 | RF-173, RF-175 |
| HU-073 | Como **Coordinador**, quiero **saber cuántos registros se usaron para calcular cada indicador**, para **confiar en el tamaño de la muestra**. | Coordinador | Media | 2 | RF-171 |
| HU-074 | Como **Coordinador**, quiero **exportar los indicadores a CSV**, para **adjuntarlos al informe de gestión**. | Coordinador | Media | 2 | RF-180 |
| HU-075 | Como **Coordinador**, quiero **que el SISO no vea los indicadores globales**, para **que el análisis de gestión quede bajo mi responsabilidad**. | Coordinador | Media | 2 | RF-178, RB-5 |

### 17.8 Épica E8 — Administración de usuarios

| ID | Historia | Rol | Prioridad | Puntos | Requisitos |
|----|----------|-----|-----------|--------|-------------|
| HU-080 | Como **Coordinador**, quiero **crear cuentas para los SISO de mi área**, para **que puedan diligenciar formatos con identidad propia**. | Coordinador | Alta | 3 | RF-21, RF-22 |
| HU-081 | Como **Coordinador**, quiero **ver la lista de usuarios con su rol y estado**, para **saber quién tiene acceso**. | Coordinador | Media | 2 | RF-20 |
| HU-082 | Como **Coordinador**, quiero **que no se puedan crear dos usuarios con el mismo correo**, para **evitar identidades duplicadas**. | Coordinador | Media | 1 | RF-22, RN-17 |
| HU-083 | Como **SISO**, quiero **no ver la sección de usuarios**, para **no tener acceso a la operación administrativa**. | SISO | Media | 1 | RF-23, RF-200 |

### 17.9 Épica E9 — Calidad de la captura y auditoría

| ID | Historia | Rol | Prioridad | Puntos | Requisitos |
|----|----------|-----|-----------|--------|-------------|
| HU-090 | Como **Coordinador**, quiero **que el historial de un registro sea inalterable**, para **poder usarlo como evidencia**. | Coordinador | Alta | 3 | RF-166, RNF-61 |
| HU-091 | Como **Coordinador**, quiero **que se registre quién creó cada registro**, para **saber a quién pedir cuentas**. | Ambos | Alta | 2 | RF-52, RF-53, RF-161 |
| HU-092 | Como **Coordinador**, quiero **que el sistema no se caiga si un archivo de datos está dañado**, para **no perder el acceso a los demás formatos**. | — | Media | 3 | RNF-32 |
| HU-093 | Como **usuario**, quiero **que las acciones destructivas pidan confirmación**, para **no eliminar un registro por accidente**. | Ambos | Alta | 2 | RF-191 |
| HU-094 | Como **usuario**, quiero **ver un aviso claro después de cada acción**, para **confirmar que el sistema respondió**. | Ambos | Media | 1 | RF-193 |
| HU-095 | Como **Coordinador**, quiero **saber qué usuario hizo cada cambio en un registro**, para **reconstruir la historia del permiso**. | Coordinador | Alta | 2 | RF-161…RF-163, RNF-62 |

### 17.10 Resumen de historias

| Épica | Historias | Puntos |
|-------|-----------|--------|
| E1 — Acceso e identidad | 9 | 18 |
| E2 — Catálogo y navegación | 5 | 11 |
| E3 — Diligenciamiento de formatos | 13 | 36 |
| E4 — Seguimiento y consulta | 8 | 17 |
| E5 — Control de estados | 7 | 19 |
| E6 — Documento oficial en PDF | 7 | 24 |
| E7 — Indicadores y reportes | 6 | 17 |
| E8 — Administración de usuarios | 4 | 7 |
| E9 — Calidad de la captura y auditoría | 6 | 13 |
| **Total** | **65** | **162** |

---

## 18. CASOS DE USO

### 18.1 Plantilla utilizada

```
ID:              CU-xx
Nombre:          ...
Actor principal: ...
Actores sec.:    ...
Precondiciones:  ...
Postcondiciones: ...
Reglas:          ...
Disparador:      ...
Flujo principal:
  1. ...
  2. ...
Flujos alternativos:
  A1. ...
Excepciones:
  E1. ...
```

### 18.2 Diagrama de casos de uso

Diagrama Mermaid en `Proyecto/Diagramas/1-casos-de-uso.mmd`. Vista previa en
`Proyecto/Diagramas/ver-diagramas.html`.

```
@startuml
skinparam actorStyle awesome
left to right direction

actor "Coordinador SST" as C
actor "SISO" as S
actor "Sistema" as SYS

rectangle "SSTech SaaS" {
  usecase "Iniciar sesión" as UC1
  usecase "Cerrar sesión" as UC2
  usecase "Ver catálogo de formatos" as UC3
  usecase "Crear registro" as UC4
  usecase "Editar registro" as UC5
  usecase "Eliminar registro" as UC6
  usecase "Buscar / filtrar registros" as UC7
  usecase "Generar y ver PDF" as UC8
  usecase "Aprobar / cancelar permiso" as UC9
  usecase "Aplicar regla de NO" as UC10
  usecase "Ver trazabilidad" as UC11
  usecase "Ver indicadores" as UC12
  usecase "Exportar CSV" as UC13
  usecase "Gestionar usuarios" as UC14
  usecase "Configurar perfil" as UC15
}

C -- UC1
C -- UC2
C -- UC3
C -- UC4
C -- UC5
C -- UC6
C -- UC7
C -- UC8
C -- UC9
C -- UC11
C -- UC12
C -- UC13
C -- UC14
C -- UC15

S -- UC1
S -- UC2
S -- UC3
S -- UC4
S -- UC5
S -- UC7
S -- UC8
S -- UC15

SYS -- UC10
@enduml
```

### 18.3 Índice de casos de uso

| ID | Caso de uso | Actor principal | Actores secundarios |
|----|-------------|------------------|---------------------|
| CU-01 | Iniciar sesión | Usuario | Sistema |
| CU-02 | Cerrar sesión | Usuario | Sistema |
| CU-03 | Ver catálogo de formatos | Usuario | — |
| CU-04 | Crear registro | SISO / Coordinador | Sistema |
| CU-05 | Editar registro | SISO (propio) / Coordinador | Sistema |
| CU-06 | Eliminar registro | Coordinador | Sistema |
| CU-07 | Buscar y filtrar registros | Usuario | — |
| CU-08 | Generar y ver PDF | Usuario | Sistema (Puppeteer) |
| CU-09 | Aprobar o cancelar permiso | Coordinador | Sistema |
| CU-10 | Aplicar automáticamente la regla de `NO` | Sistema | — |
| CU-11 | Ver trazabilidad del registro | Usuario | — |
| CU-12 | Ver indicadores por formato | Coordinador | Sistema |
| CU-13 | Exportar a CSV | Usuario | — |
| CU-14 | Gestionar usuarios | Coordinador | Sistema |
| CU-15 | Configurar el perfil propio | Usuario | Sistema |
| CU-16 | Restaurar la sesión | Sistema | Usuario |
| CU-17 | Revalidar o cancelar un permiso en campo | Coordinador | Sistema |

### 18.4 Tabla resumen de casos de uso

| # | Caso de uso | Precondición | Flujo principal (resumen) | Postcondición |
|---|-------------|--------------|---------------------------|---------------|
| CU-01 | Iniciar sesión | Cuenta activa y contraseña conocida | Ingresar correo y contraseña → validar → crear token → cargar panel | Sesión abierta; token en el cliente |
| CU-02 | Cerrar sesión | Sesión abierta | Confirmar salida → invalidar token → limpiar almacenamiento local | Sesión cerrada; token inutilizable |
| CU-03 | Ver catálogo | Sesión abierta | Cargar `/api/formatos` → pintar barra lateral con 7 entradas | Formato por defecto seleccionado |
| CU-04 | Crear registro | Sesión abierta, formato seleccionado | Pulsar "＋ Nuevo" → autollenar fechas → diligenciar → validar → `POST` | Registro creado en `BORRADOR` con evento `CREADO` |
| CU-05 | Editar registro | El registro existe y es propio (o el usuario es Coordinador) | Abrir → editar → validar → `PUT` → recalcular estado | Datos actualizados; eventos `ACTUALIZADO` y `ESTADO:` |
| CU-06 | Eliminar registro | Rol Coordinador; el registro existe | Confirmar en diálogo → `DELETE` → recargar tabla | Registro eliminado de `data/<formato>.json` |
| CU-07 | Buscar y filtrar | Hay registros visibles | Escribir término o elegir estado → recalcular la tabla | Tabla filtrada y repaginada |
| CU-08 | Generar y ver PDF | El registro está guardado | Si es nuevo, guardar → `POST .../pdf` → `htmlPdf` + Chrome → guardar en `pdfs/` → abrir visor | Archivo `<id>-<uuid>.pdf` en `pdfs/`; URL `/pdfs/...` |
| CU-09 | Aprobar o cancelar | Rol Coordinador; el registro no está cancelado | Elegir estado en el selector → guardar → `PATCH .../estado` | Estado persistido; evento `ESTADO: <valor>` |
| CU-10 | Aplicar regla de `NO` | Hay respuestas en `data.verif` | Recorrer todos los grupos → si algún valor es `NO` → `NO CONCEDIDO`; si no → `CONCEDIDO` | Estado calculado; persistido solo si el usuario es Coordinador y el registro no está `CANCELADO` |
| CU-11 | Ver trazabilidad | El registro está abierto | Leer `registro.historial` → pintar eventos con fecha, acción, usuario y detalle | Historial visible en el modal |
| CU-12 | Ver indicadores | Rol Coordinador; hay registros | Elegir formato → indicar `desde`/`hasta` → `GET .../indicadores` → ejecutar KPIs | Tarjetas KPI con valor y registros analizados |
| CU-13 | Exportar a CSV | Hay registros o indicadores visibles | Construir CSV con BOM y separador `;` → `Blob` → descarga | Archivo `<formato>_registros.csv` o `<formato>_indicadores.csv` |
| CU-14 | Gestionar usuarios | Rol Coordinador | Abrir panel → llenar formulario → `POST /api/usuarios` → recargar lista | Usuario creado; puede iniciar sesión de inmediato |
| CU-15 | Configurar perfil | Sesión abierta | Abrir perfil → opcionalmente subir foto → `PATCH /api/auth/perfil` → refrescar barra | Perfil actualizado en `usuarios.json` y en la barra |
| CU-16 | Restaurar sesión | Hay un token almacenado | Leer token → `GET /api/auth/me` → si es válido, mostrar panel; si no, mostrar login | Sesión restaurada o revertida al login |
| CU-17 | Revalidar o cancelar en campo | El permiso está `CONCEDIDO` | Registrar la revalidación en el formato → si aplica, pasar a `CANCELADO` con motivo | Estado actualizado con evento de trazabilidad |

### 18.5 Detalle de los casos de uso críticos

#### CU-01 — Iniciar sesión

| Campo | Descripción |
|-------|-------------|
| **Actor principal** | Usuario (Coordinador o SISO) |
| **Precondiciones** | El usuario está registrado y activo; conoce su correo y contraseña |
| **Disparador** | El usuario escribe sus credenciales y pulsa el botón de entrada |
| **Postcondiciones** | Existe una sesión vigente; el token se guardó en el navegador; el panel está visible |

```
Flujo principal:
  1. El sistema muestra la pantalla de inicio de sesión.
  2. El usuario-ingresa su correo y su contraseña.
  3. El usuario pulsa el botón de entrada.
  4. El sistema valida que ambos campos estén diligenciados.
  5. El sistema envía POST /api/auth/login.
  6. El sistema verifica el hash de la contraseña con comparación en tiempo constante.
  7. El sistema crea un token aleatorio de 32 bytes con vigencia de 12 horas.
  8. El sistema guarda el token en el navegador y el perfil en memoria.
  9. El sistema oculta la pantalla de login y muestra el panel.
 10. El sistema carga el catálogo de formatos y selecciona el primero.
 11. El sistema muestra el nombre, correo, cargo y rol en la barra superior.

Flujos alternativos:
  A1. Campo vacío: el sistema muestra "Ingrese email y contraseña" y no envía la petición.
  A2. Credenciales inválidas: el sistema muestra "Credenciales inválidas".
  A3. Tiempo de espera (10 s): el sistema informa que la solicitud tardó demasiado.

Excepciones:
  E1. Servidor no disponible: el sistema informa "No se pudo conectar al servidor".
  E2. Error inesperado: el sistema muestra el mensaje devuelto por el servidor.
```

#### CU-04 — Crear registro

| Campo | Descripción |
|-------|-------------|
| **Actor principal** | SISO o Coordinador |
| **Precondiciones** | El usuario tiene sesión abierta; hay un formato seleccionado |
| **Disparador** | El usuario pulsa "＋ Nuevo registro" |
| **Postcondiciones** | Existe un registro en estado `BORRADOR` con el usuario como creador |

```
Flujo principal:
  1. El usuario pulsa "＋ Nuevo registro".
  2. El sistema genera la estructura de datos vacía a partir del esquema del formato.
  3. El sistema autollena las fechas de diligenciamiento con la fecha de hoy.
  4. El sistema abre el modal con el formulario dinámico y el badge "NUEVO".
  5. El usuario diligencia el formulario.
  6. El usuario pulsa "Guardar".
  7. El sistema valida el formulario contra la configuración del formato.
  8. El sistema envía POST /api/formatos/:id con el objeto data.
  9. El sistema crea el registro con UUID, estado BORRADOR, usuario creador y evento CREADO.
 10. El sistema recalcula el estado; si es necesario y el usuario es Coordinador, lo persiste.
 11. El sistema recarga la tabla y muestra "Registro guardado".

Flujos alternativos:
  A1. Errores de validación: el sistema no envía la petición, resalta los controles con
      invalid, muestra el contador de errores y se desplaza al primer problema.
  A2. Registro en estado CANCELADO: el sistema no sobrescribe el estado automáticamente.

Excepciones:
  E1. Sesión expirada: el sistema cierra la sesión y vuelve al login.
  E2. Sin permiso: el servidor responde 403 y el sistema muestra el mensaje.
  E3. Error de red: el sistema informa que no pudo conectarse o que la solicitud tardó demasiado.
```

#### CU-06 — Eliminar registro

| Campo | Descripción |
|-------|-------------|
| **Actor principal** | Coordinador |
| **Precondiciones** | El usuario tiene rol Coordinador; el registro existe |
| **Disparador** | El usuario pulsa el botón de eliminar (en la tabla o en el modal) |
| **Postcondiciones** | El registro ya no está en el archivo del formato |

```
Flujo principal:
  1. El sistema muestra un diálogo de confirmación animado.
  2. El usuario confirma la eliminación.
  3. El sistema envía DELETE /api/formatos/:id/:rid.
  4. El servidor comprueba el rol y elimina el registro del archivo.
  5. El sistema recarga la tabla y muestra "Registro eliminado".

Flujos alternativos:
  A1. El usuario cancela: no se envía ninguna petición.

Excepciones:
  E1. El usuario no es Coordinador: el botón no existe y la API responde 403.
  E2. El registro no existe: el servidor responde 404.
```

#### CU-08 — Generar y ver PDF

| Campo | Descripción |
|-------|-------------|
| **Actor principal** | SISO (propio) o Coordinador (cualquiera) |
| **Precondiciones** | El registro está guardado |
| **Disparador** | El usuario pulsa "PDF" en la tabla o "Generar PDF" en el modal |
| **Postcondiciones** | El archivo existe en `pdfs/` y se muestra en el visor |

```
Flujo principal:
  1. El usuario pulsa el botón de PDF.
  2. Si el registro es nuevo, el sistema lo guarda primero.
  3. El sistema envía POST /api/formatos/:id/:rid/pdf.
  4. El servidor comprueba sesión y propiedad del registro.
  5. El motor de PDF construye el HTML a partir del esquema y los datos.
  6. El motor resuelve la ruta de Chrome o Edge.
  7. Puppeteer abre el navegador, carga el HTML e imprime a PDF A4.
  8. El navegador se cierra y el archivo queda en pdfs/<id>-<uuid>.pdf.
  9. El sistema abre el visor con la URL del archivo y un parámetro de cache-busting.
 10. El sistema ofrece el enlace de descarga con el nombre del archivo.

Flujos alternativos:
  A1. Sin Chrome/Edge: el servidor responde 500 y el sistema informa del problema.

Excepciones:
  E1. El registro no existe: el servidor responde 404.
  E2. El SISO intenta un registro ajeno: el servidor responde 403.
  E3. Error de render: el navegador se cierra igualmente y se informa el error.
```

#### CU-09 — Aprobar o cancelar permiso

| Campo | Descripción |
|-------|-------------|
| **Actor principal** | Coordinador |
| **Precondiciones** | El usuario tiene rol Coordinador; el registro existe y no está `CANCELADO` |
| **Disparador** | El usuario elige un estado en el selector y guarda |
| **Postcondiciones** | El estado quedó persistido y registrado en el historial |

```
Flujo principal:
  1. El selector de estado ofrece BORRADOR, CONCEDIDO, NO CONCEDIDO y CANCELADO.
  2. El usuario elige el estado deseado.
  3. El usuario guarda el formulario.
  4. El sistema persiste primero los datos del registro.
  5. El sistema envía PATCH /api/formatos/:id/:rid/estado.
  6. El servidor comprueba que el rol permita el estado solicitado.
  7. El sistema normaliza el estado y agrega el evento "ESTADO: <valor>" al historial.
  8. El sistema refresca la tabla y el historial.

Flujos alternativos:
  A1. Sin ningún NO en el formulario: el sistema propone CONCEDIDO antes de aplicar la
      selección manual.
  A2. El registro está CANCELADO: el sistema no sobrescribe el estado.

Excepciones:
  E1. El SISO intenta CONCEDIDO o CANCELADO: el servidor responde 403.
  E2. Estado no válido: el servidor lo normaliza a BORRADOR.
```

#### CU-10 — Aplicar automáticamente la regla de `NO` *(caso de uso del sistema)*

| Campo | Descripción |
|-------|-------------|
| **Actor principal** | Sistema |
| **Precondiciones** | El formulario tiene respuestas en `data.verif` |
| **Disparador** | El usuario marca un ítem de checklist o guarda el registro |
| **Postcondiciones** | El estado calculado es visible y, si corresponde, persistido |

```
Flujo principal:
  1. El usuario marca un ítem de un grupo de checklist.
  2. El sistema guarda la respuesta en data.verif[grupo][índice].
  3. El sistema invoca estadoPermiso(data).
  4. El sistema recorre todos los grupos y todos los ítems.
  5. Si encuentra un valor "NO", el resultado es "NO CONCEDIDO".
  6. Si no encuentra ningún "NO", el resultado es "CONCEDIDO".
  7. El frontend muestra el estado calculado en el formulario.
  8. Al guardar, si el usuario es Coordinador y el registro no está CANCELADO y el estado
     calculado difiere del persistido, el sistema lo persiste.
  9. El servidor registra el evento "ESTADO: <valor>".

Flujos alternativos:
  A1. No existe la clave verif en los datos: el resultado es "CONCEDIDO".

Excepciones:
  E1. La persistencia falla: el estado calculado permanece solo en pantalla y se informa el error.
```

#### CU-12 — Ver indicadores por formato

| Campo | Descripción |
|-------|-------------|
| **Actor principal** | Coordinador |
| **Precondiciones** | El usuario tiene rol Coordinador; el formato tiene registros |
| **Disparador** | El usuario pulsa el botón de indicadores |
| **Postcondiciones** | El tablero muestra los valores calculados sobre los registros filtrados |

```
Flujo principal:
  1. El usuario pulsa el botón de indicadores.
  2. El sistema abre el modal con los filtros de fecha vacíos.
  3. El sistema envía GET /api/formatos/:id/indicadores.
  4. El servidor aplica los filtros sobre los registros visibles del usuario.
  5. El motor ejecuta la función calcular() de cada KPI del formato.
  6. El motor redondea los valores numéricos a dos decimales.
  7. El sistema pinta una tarjeta por indicador con código, valor, nombre, tipo y registros analizados.
  8. El usuario puede indicar "desde" y "hasta" y el tablero se recalcula.

Flujos alternativos:
  A1. Sin filtros: se calculan sobre todos los registros visibles.
  A2. Un KPI falla: su valor se muestra como "ERR" y el resto del tablero se muestra normal.
  A3. El formato no tiene indicadores: se muestra un mensaje informativo.

Excepciones:
  E1. El SISO intenta el endpoint: el servidor responde 403.
```

### 18.6 Casos de uso de la interfaz de usuario por rol

| Capacidad | Coordinador | SISO |
|-----------|--------------|------|
| Iniciar / cerrar sesión | Sí | Sí |
| Ver catálogo de formatos | Sí | Sí |
| Crear registro | Sí | Sí |
| Ver registros | Todos | Solo los propios |
| Editar registro | Todos | Solo los propios |
| Eliminar registro | Sí | No |
| Aprobar / cancelar | Sí | No |
| Marcar `NO CONCEDIDO` automáticamente | Sí | Solo previsualización |
| Generar PDF | Todos | Solo los propios |
| Ver indicadores | Sí | No |
| Exportar CSV | Sí | Sí (de lo visible) |
| Gestionar usuarios | Sí | No |
| Configurar perfil propio | Sí | Sí |

## 19. ESTRATEGIA DE PRUEBAS

### 19.1 Principios

| Principio | Aplicación en SSTech |
|-----------|---------------------|
| Pruebas del requisito, no del código | Cada prueba se traza a un RF o RN (§21) |
| Aislamiento | Las pruebas unitarias no dependen del servidor ni del navegador |
| Determinismo | Los KPI se calculan sobre registros sintéticos controlados, no sobre `data/*.json` |
| Reposibilidad | Un fallo debe poder reproducirse con un solo comando |
| Trazabilidad | Ninguna prueba huérfana: todo caso de prueba referencia al menos un requisito |
| Sin producción como banco de pruebas | Las pruebas manuales se hacen sobre cuentas demo y datos descartables |

### 19.2 Niveles de prueba

| Nivel | Alcance | Tecnología | Requisitos del entorno | Comando | Cobertura |
|-------|---------|-----------|------------------------|---------|-----------|
| **Unitario** | `util.js` y `validacion.js` de forma aislada | `node:test` + `node:assert` (sin dependencias) | Ninguno | `node --test "tests/unit/*.test.js"` | 41 pruebas, 11 suites |
| **Integración** | Formularios completos contra el motor de validación | `node:test` | Ninguno | Igual que el anterior | 4 pruebas (una por formato) |
| **E2E** | Flujo en navegador real: login → formato → llenar → guardar → validar | `puppeteer-core` + Chrome/Edge del sistema | Servidor en `localhost:3200` | `node tests/e2e/validacion.e2e.js` | 6 escenarios, 9 aserciones |
| **Manual** | Revisión visual, impresión, roles, permisos, indicadores | Humano + checklist | Servidor + 2 navegadores | Ver §19.6 | 22 casos |
| **Verificación de API** | Contrato HTTP, códigos de estado, autorización por rol | `curl` o DevTools | Servidor activo | Ver §19.7 | 26 casos |

### 19.3 Estructura de las pruebas

```
tests/
├── README.md                        # guía rápida de ejecución
├── unit/
│   ├── util.test.js                 # 15 pruebas de getByPath/setByPath/inicialData/estadoPermiso
│   ├── validacion.test.js           # 22 pruebas del motor sobre los 7 formatos
│   └── helpers/
│       └── entorno.js               # carga util.js y validacion.js en Node con stubs mínimos
├── e2e/
│   └── validacion.e2e.js            # recorrido de extremo a extremo con Puppeteer
└── documentacion/
    ├── pruebas.md                   # comandos, checklist manual y plan de cobertura
    └── validaciones.md              # reglas de validación por formato y motor
```

### 19.4 Cómo se carga el frontend en Node

`public/js/util.js` y `public/js/validacion.js` son módulos de navegador que usan `window` y `document`.
El helper `tests/unit/helpers/entorno.js` los carga en Node mediante un contexto de `vm` con stubs para
`window`, `document` y `UI`, de modo que la lógica pura se pruebe sin navegador.

```
Consecuencia práctica: las pruebas unitarias validan la lógica, no el DOM real.
La cobertura del DOM y de los eventos se resuelve con las pruebas E2E y las manuales.
```

### 19.5 Cobertura por formato

| Formato | Suite | Casos de validación | Integración |
|---------|-------|--------------------|-------------|
| FT-OPE-06 | `validacion.test.js` | Tareas por rol, fechas, localization, checklist | Sí (formulario completo sin errores) |
| FT-OPE-51 | `validacion.test.js` | Tareas, ejecutantes, entregables | Sí |
| FT-OPE-56 | `validacion.test.js` | Tareas y responsables | Sí |
| FT-SST-08 | `validacion.test.js` | Tareas y periodicidad | Sí |
| FT-SST-11 | `validacion.test.js` | Reglas numéricas, rangos y umbrales | Sí |
| FT-SST-37 | `validacion.test.js` | Tareas y responsables | Sí |
| FT-SST-39 | `validacion.test.js` | Tareas y responsables | Sí |
| Transversales | `util.test.js` | `getByPath`, `setByPath`, `inicialData`, `estadoPermiso` | — |

### 19.6 Criterios de entrada y salida

| Criterio | Definición |
|----------|------------|
| **Entrada** | `npm install` completado; servidor levantado; seed ejecutado; credenciales demo disponibles; Chrome o Edge instalado |
| **Salida** | 41/41 pruebas unitarias en verde; recorrido E2E completo sin errores; 22 casos manuales ejecutados con resultado registrado |
| **Bloqueo** | Cualquier fallo en un requisito crítico (RF-01, RF-04, RF-07, RF-111, RF-135) detiene la entrega |
| **No bloqueante** | Defectos cosméticos de impresión, textos menores o mejoras de usabilidad |

### 19.7 Checklist de pruebas manuales

| # | Caso | Resultado esperado |
|---|------|--------------------|
| M-01 | Login con credenciales correctas (Coordinador) | Entra al panel, muestra nombre y rol |
| M-02 | Login con credenciales incorrectas | Mensaje "Credenciales inválidas" |
| M-03 | Login con correo inexistente | Mismo mensaje, sin revelar si el correo existe |
| M-04 | Login con campos vacíos | Validación local, sin llamada al servidor |
| M-05 | Cerrar sesión y pulsar "atrás" | No se puede volver al panel sin iniciar sesión |
| M-06 | Recargar la página con sesión vigente | Sesión restaurada sin pedir credenciales |
| M-07 | Esperar 12 h (o simular expiración) | Vuelve al login con aviso |
| M-08 | Navegar por los 7 formatos | Tabla y formulario cambian en cada uno |
| M-09 | Crear registro nuevo | Fechas autollenadas, badge NUEVO |
| M-10 | Guardar con campos vacíos | Errores resaltados, contador visible, sin enviar |
| M-11 | Marcar `NO` en un checklist | El estado pasa a NO CONCEDIDO en pantalla |
| M-12 | Sin ningún `NO` | El estado propuesto es CONCEDIDO |
| M-13 | Intentar aprobar como SISO | Sin selector de estado; API responde 403 si se fuerza |
| M-14 | Aprobar como Coordinador | Estado persistido y evento en el historial |
| M-15 | Editar un registro CANCELADO | El estado no se sobrescribe automáticamente |
| M-16 | Intentar generar PDF sin navegador | Mensaje claro, el servidor no se cae |
| M-17 | Generar PDF con navegador instalado | PDF A4 con el diseño del formato; descarga disponible |
| M-18 | Abrir el PDF de un registro ajeno como SISO | API responde 403 |
| M-19 | Ver indicadores como Coordinador | Tarjetas con valor, tipo y registros analizados |
| M-20 | Filtrar indicadores por fechas y campo | Los valores se recalculan |
| M-21 | Gestionar usuarios como Coordinador | Alta correcta, correo duplicado rechazado |
| M-22 | Ver el panel como SISO | Sin sección de usuarios, sin botón de indicadores, solo sus registros |

---

## 20. CASOS DE PRUEBA

Formato: `PT-xx`. Campos: objetivo, precondición, pasos, resultado esperado y requisito cubierto.

### 20.1 Pruebas unitarias — `tests/unit/util.test.js`

| ID | Objetivo | Precondición | Pasos | Resultado esperado | Requisito |
|----|----------|--------------|-------|--------------------|-----------|
| PT-U01 | Resolver ruta simple | — | `getByPath({a:{b:1}}, 'a.b')` | `1` | RF-172 |
| PT-U02 | Resolver ruta con array | — | `getByPath({a:[{b:2}]}, 'a.0.b')` | `2` | RF-172 |
| PT-U03 | Ruta inexistente | — | `getByPath({}, 'a.b.c')` | `undefined`, sin excepción | RF-172 |
| PT-U04 | Escribir ruta simple | — | `setByPath({}, 'a.b', 5)` | El objeto queda `{a:{b:5}}` | RF-71 |
| PT-U05 | Escribir creando niveles | — | `setByPath({}, 'x.y.z', 'v')` | Se crean los objetos intermedios | RF-71 |
| PT-U06 | Escribir en un array | — | `setByPath({a:[1,2]}, 'a.1', 9)` | `{a:[1,9]}` | RF-71 |
| PT-U07 | Construir la estructura inicial de un formato | Esquema de FT-OPE-06 | `inicialData(esquema)` | Todas las claves existen; las fechas de diligenciamiento traen la fecha de hoy | RF-98, RF-54 |
| PT-U08 | Estructura inicial de un formato con tablas | Esquema de FT-SST-11 | `inicialData(esquema)` | Las tablas traen al menos una fila vacía | RF-75 |
| PT-U09 | Estructura inicial de un formato con checklist | Esquema de FT-SST-08 | `inicialData(esquema)` | Los grupos de verificación traen sus ítems sin responder | RF-78 |
| PT-U10 | Sin `NO` ⇒ `CONCEDIDO` | `data.verif` con SI y NA | `estadoPermiso(data)` | `'CONCEDIDO'` | RN-02, RF-112 |
| PT-U11 | Con un `NO` ⇒ `NO CONCEDIDO` | Un ítem en `NO` | `estadoPermiso(data)` | `'NO CONCEDIDO'` | RN-01, RF-111 |
| PT-U12 | Sin clave `verif` ⇒ `CONCEDIDO` | `data = {}` | `estadoPermiso(data)` | `'CONCEDIDO'` | RN-02 |
| PT-U13 | `NO` en minúsculas | Valor `'no'` | `estadoPermiso(data)` | `'NO CONCEDIDO'` (comparación insensible a mayúsculas) | RN-01 |
| PT-U14 | Recorre todos los grupos | `NO` en el segundo grupo | `estadoPermiso(data)` | `'NO CONCEDIDO'` | RN-01 |
| PT-U15 | Estado por defecto | Sin datos | `estadoPorDefecto()` | `'BORRADOR'` | RN-08 |

### 20.2 Pruebas del motor de validación — `tests/unit/validacion.test.js`

| ID | Objetivo | Precondición | Pasos | Resultado esperado | Requisito |
|----|----------|--------------|-------|--------------------|-----------|
| PT-V01 | Detectar campo requerido vacío | Formulario con campo obligatorio vacío | `validar(esquema, data)` | Al menos un error; el mensaje nombra el campo | RF-90, RF-91 |
| PT-V02 | Aceptar campo requerido diligenciado | Campo obligatorio con valor | `validar(...)` | Cero errores | RF-90 |
| PT-V03 | Campo de solo lectura ignorado | Campo `readonly` vacío | `validar(...)` | No genera error | RF-73, RF-96 |
| PT-V04 | Validar tipo numérico | Campo numérico con texto | `validar(...)` | Error de tipo con el nombre del campo | RF-71 |
| PT-V05 | Validar rango numérico | Valor fuera del rango del esquema | `validar(...)` | Error de rango | RF-72 |
| PT-V06 | Validar longitud mínima | Texto más corto que el mínimo | `validar(...)` | Error de longitud | RF-72 |
| PT-V07 | Validar enumeración | Valor fuera de la lista permitida | `validar(...)` | Error de valor no permitido | RF-72 |
| PT-V08 | Validar formato de fecha | Fecha con texto no parseable | `validar(...)` | Error de fecha | RF-97 |
| PT-V09 | Fecha de diligenciamiento futura | Fecha de mañana | `validar(...)` | Error: la fecha no puede ser futura | RF-99, RN-09 |
| PT-V10 | Fecha de diligenciamiento pasada | Fecha de hace 3 días | `validar(...)` | Sin error (se permite histórico) | RN-09 |
| PT-V11 | Tabla con una fila incompleta | Tabla con 2 filas, una vacía | `validar(...)` | Error que identifica fila y columna | RF-97, RF-75 |
| PT-V12 | Tabla completamente vacía | Tabla sin filas | `validar(...)` | Error de tabla obligatoria | RF-75 |
| PT-V13 | Agregar y quitar filas | Tabla con 3 filas | Agregar y quitar | La validación refleja la nueva cantidad de filas | RF-76 |
| PT-V14 | Regla de tareas `SI/NO/NA` | Respuesta fuera del conjunto | `validar(...)` | Error de valor no permitido | RF-77 |
| PT-V15 | Regla de checklist `SI/NO` | Ítem sin responder | `validar(...)` | Error de ítem pendiente | RF-78 |
| PT-V16 | Reglas numéricas de FT-SST-11 | Valores por debajo del mínimo | `validar(...)` | Errores en los campos con umbral | RF-72 |
| PT-V17 | Reglas de periodicidad de FT-SST-08 | Periodicidad vacía | `validar(...)` | Error en el campo de periodicidad | RF-70 |
| PT-V18 | Formularios de los 7 formatos | Datos mínimos válidos por formato | `validar(esquema_i, data_i)` | Cero errores en los 7 | RF-70…RF-82 |
| PT-V19 | Mensajes en español legibles | Cualquier error | Revisar el texto | El mensaje describe el problema en lenguaje natural | RT-3, RF-193 |
| PT-V20 | Los errores no rompen la vista | Muchos errores simultáneos | Renderizar | La lista es legible y el scroll llega al primer error | RF-92, RF-94 |
| PT-V21 | Contador de errores | 3 campos vacíos | Renderizar | El contador muestra 3 | RF-93 |
| PT-V22 | Sin errores, sin contador | Formulario válido | Renderizar | El contador se oculta | RF-93 |

### 20.3 Pruebas de integración

| ID | Objetivo | Pasos | Resultado esperado | Requisito |
|----|----------|-------|--------------------|-----------|
| PT-I01 | FT-OPE-06 completo sin errores | Llenar todos los campos requeridos y las tablas | Cero errores de validación | RF-90 |
| PT-I02 | FT-OPE-51 completo sin errores | Ídem | Cero errores | RF-90 |
| PT-I03 | FT-OPE-56 completo sin errores | Ídem | Cero errores | RF-90 |
| PT-I04 | FT-SST-08 completo sin errores | Ídem | Cero errores | RF-90 |
| PT-I05 | FT-SST-11 completo sin errores | Ídem, respetando rangos | Cero errores | RF-90, RF-72 |
| PT-I06 | FT-SST-37 completo sin errores | Ídem | Cero errores | RF-90 |
| PT-I07 | FT-SST-39 completo sin errores | Ídem | Cero errores | RF-90 |

### 20.4 Prueba E2E — `tests/e2e/validacion.e2e.js`

La prueba automatizada cubre **6 escenarios con 9 aserciones** (`check(...)`) y cierra con un resumen
`RESUMEN: n/9 PASS`. Cada aserción imprime `PASS` o `FAIL` y se listeners de error de página.

| # | Escenario | Aserciones | Verificación automática |
|---|-----------|------------|--------------------------|
| 0 | Preparación | — | Lanza Chrome/Edge con `puppeteer-core`, abre `http://localhost:3200`, inicia sesión con las credenciales de las variables `SSTECH_*` |
| 1 | Guardar vacío se bloquea | 3 | No se crea el registro, hay controles con `invalid` y el toast pide corregir |
| 2 | La fecha se autollena con hoy | 1 | El valor del campo de fecha es la fecha del día |
| 3 | Diligenciar datos válidos | 3 | Sin resaltados, el registro aumenta en 1 y el toast confirma el guardado |
| 4 | Fecha futura (2099) | 1 | El control queda marcado con error |
| 5 | Tabla dinámica vacía | 1 | La fila vacía queda marcada como error |
| 3 | Editar un campo con error | 1 | El resaltado de error desaparece al corregir |
| — | Cierre | — | Imprime `RESUMEN: n/9 PASS` y el código de salida refleja los fallos |

**Cobertura explícita del e2e:** login, navegación de formatos, validación visual, tablas dinámicas,
autofecha, bloqueo de fecha futura, guardado real en el servidor y limpieza de errores.
**No cubierto por el e2e automático** (verificado solo de forma manual, §19.7): generación de PDF,
trazabilidad, gestión de usuarios, indicadores, exportación CSV y permisos por rol.

### 20.5 Verificación de la API (26 casos)

| ID | Endpoint | Condición | Respuesta esperada | Requisito |
|----|----------|-----------|--------------------|-----------|
| PT-A01 | `GET /api/estado` | Sin sesión | 200 con estado del servicio (público) | RF-40 |
| PT-A02 | `POST /api/auth/login` | Credenciales válidas | 200 con token y perfil | RF-04 |
| PT-A03 | `POST /api/auth/login` | Contraseña incorrecta | 401 "Credenciales inválidas" | RF-02 |
| PT-A04 | `POST /api/auth/login` | Sin cuerpo | 400 con mensaje | RF-03 |
| PT-A05 | `GET /api/auth/me` | Token válido | 200 con usuario y token | RF-07 |
| PT-A06 | `GET /api/auth/me` | Sin token | 401 | RF-10 |
| PT-A07 | `GET /api/auth/me` | Token inventado | 401 | RF-07 |
| PT-A08 | `POST /api/auth/logout` | Token válido | 200; el token deja de servir | RF-06 |
| PT-A09 | `PATCH /api/auth/perfil` | Nombre vacío | 400 con mensaje | RF-24, RF-25 |
| PT-A10 | `PATCH /api/auth/perfil` | Foto no `data:image/` | 400 con mensaje | RF-27 |
| PT-A11 | `PATCH /api/auth/perfil` | Datos válidos | 200 con el perfil actualizado | RF-26 |
| PT-A12 | `GET /api/usuarios` | Rol SISO | 403 | RF-23, RB-1 |
| PT-A13 | `GET /api/usuarios` | Rol Coordinador | 200 con la lista | RF-20 |
| PT-A14 | `POST /api/usuarios` | Correo duplicado | 400 con mensaje | RF-22, RN-17 |
| PT-A15 | `POST /api/usuarios` | Rol SISO | 403 | RF-23 |
| PT-A16 | `GET /api/formatos` | Sin sesión | 200 con 7 formatos (público) | RF-40 |
| PT-A17 | `GET /api/formatos/:id/esquema` | Sin sesión | 200 con el esquema (público) | RF-41 |
| PT-A18 | `GET /api/formatos/inexistente` | Token válido | 404 | RF-43 |
| PT-A19 | `GET /api/formatos/:id` | Sin sesión | 401 | RF-10 |
| PT-A20 | `GET /api/formatos/:id` | Rol SISO | 200 solo con registros propios | RF-64, RN-04 |
| PT-A21 | `POST /api/formatos/:id` | `data` no objeto | 400 | RF-52 |
| PT-A22 | `PUT /api/formatos/:id/:rid` | Registro ajeno, rol SISO | 403 | RF-83, RF-147 |
| PT-A23 | `PATCH /api/formatos/:id/:rid/estado` | Rol SISO con `CONCEDIDO` | 403 | RF-83, RF-115 |
| PT-A24 | `PATCH /api/formatos/:id/:rid/estado` | Estado desconocido | 400 o normalización a `BORRADOR` | RF-117, RN-06 |
| PT-A25 | `DELETE /api/formatos/:id/:rid` | Rol SISO | 403 | RF-115 |
| PT-A26 | `GET /api/formatos/:id/indicadores` | Rol SISO | 403 | RF-178 |

### 20.6 Casos de prueba de los KPI

| ID | Objetivo | Entrada | Esperado |
|----|----------|---------|----------|
| PT-K01 | `KP1` de FT-OPE-06 | 5 registros cualesquiera | `5` (contador) |
| PT-K02 | `KP2` de FT-OPE-06 | 3 concedidos de 5 | `60` (porcentaje entero) |
| PT-K03 | `KP3` de FT-OPE-06 | 2 `NO` sobre 10 ítems verificados | `20` |
| PT-K04 | `KP4` de FT-OPE-06 | Localizaciones repetidas | Lista ordenada de mayor a menor |
| PT-K05 | Lista vacía | 0 registros | Los contadores dan 0; los porcentajes no dividen entre cero |
| PT-K06 | Filtro por rango de fechas | Registros dentro y fuera del rango | Solo entran los del rango |
| PT-K07 | Filtro por campo | Registros con distintos campos | Solo entran los del campo elegido |
| PT-K08 | Redondeo | Valor con decimales | Se redondea a 2 decimales |
| PT-K09 | Indicador con error | Función `calcular` que lanza excepción | El valor se muestra como `ERR` y el tablero no se rompe |
| PT-K10 | Trazabilidad del KPI | Cualquier tablero | Se muestra cuántos registros se analizaron |

## 21. MATRIZ DE TRAZABILIDAD

### 21.1 RF ↔ HU ↔ CU ↔ PT

| RF | Descripción corta | HU | CU | PT | Implementado |
|----|-------------------|----|----|----|---------------|
| RF-01 | Login con correo y contraseña | HU-001 | CU-01 | PT-A02, M-01 | Sí |
| RF-02 | Mensaje de credenciales inválidas | HU-002 | CU-01 | PT-A03, M-02, M-03 | Sí |
| RF-03 | Validación de campos de login | HU-002 | CU-01 | PT-A04, M-04 | Sí |
| RF-04 | Token de sesión | HU-001 | CU-01, CU-16 | PT-A05 | Sí |
| RF-05 | Persistencia de la sesión en el navegador | HU-001 | CU-16 | M-06 | Sí |
| RF-06 | Cierre de sesión | HU-004 | CU-02 | PT-A08 | Sí |
| RF-07 | Verificación del token en cada petición | HU-003 | CU-16 | PT-A06, PT-A07 | Sí |
| RF-08 | Vigencia de 12 h | HU-003 | CU-16 | M-07 | Sí |
| RF-09 | Nombre y correo en la barra superior | HU-005 | CU-01 | M-01 | Sí |
| RF-10 | Redirección al login sin sesión | HU-009 | CU-16 | PT-A06, M-05 | Sí |
| RF-11 | Aviso de sesión expirada | HU-009 | CU-16 | M-07 | Sí |
| RF-20 | Listado de usuarios | HU-081 | CU-14 | PT-A13 | Sí |
| RF-21 | Creación de usuarios SISO | HU-080 | CU-14 | M-21 | Sí |
| RF-22 | Correo único | HU-082 | CU-14 | PT-A14 | Sí |
| RF-23 | Restricción del panel a Coordinador | HU-083 | CU-14 | PT-A12, M-22 | Sí |
| RF-24 | Editar nombre | HU-007 | CU-15 | PT-A09 | Sí |
| RF-25 | Editar cargo, cédula y teléfono | HU-007 | CU-15 | PT-A09 | Sí |
| RF-26 | Guardar perfil | HU-007 | CU-15 | PT-A11 | Sí |
| RF-27 | Cargar foto de perfil | HU-006, HU-008 | CU-15 | PT-A10 | Sí |
| RF-28 | Mostrar foto en la interfaz | HU-006 | CU-15 | M-01 | Sí |
| RF-29 | Quitar foto | HU-008 | CU-15 | PT-A10 | Sí |
| RF-30 | Validar que la foto sea una imagen | HU-008 | CU-15 | PT-A10 | Sí |
| RF-40 | Listar formatos | HU-010 | CU-03 | PT-A16 | Sí |
| RF-41 | Descubrimiento automático de formatos | HU-011 | CU-03 | PT-A17 | Sí |
| RF-42 | Caché de esquemas en el cliente | HU-011 | CU-03 | M-08 | Sí |
| RF-43 | Código, versión y fecha del formato | HU-010, HU-014 | CU-03 | M-08 | Sí |
| RF-50 | Crear registro | HU-020 | CU-04 | M-09 | Sí |
| RF-51 | Estado inicial `BORRADOR` | HU-020, HU-029 | CU-04 | PT-U15 | Sí |
| RF-52 | Validar el cuerpo de la petición | HU-020 | CU-04 | PT-A21 | Sí |
| RF-53 | Identificador único del registro | HU-091 | CU-04 | — | Sí |
| RF-54 | Fecha de creación | HU-091 | CU-04 | PT-U07 | Sí |
| RF-55 | Fecha de actualización | HU-091 | CU-05 | — | Sí |
| RF-56 | Usuario creador | HU-091 | CU-04 | — | Sí |
| RF-57 | Tabla de registros | HU-040 | CU-07 | M-08 | Sí |
| RF-58 | Paginación | HU-045 | CU-07 | — | Sí |
| RF-59 | Columnas clave por formato | HU-040 | CU-07 | M-08 | Sí |
| RF-60 | Mensaje de tabla vacía | HU-013 | CU-07 | — | Sí |
| RF-61 | Búsqueda y filtro por estado | HU-041, HU-042 | CU-07 | M-08 | Sí |
| RF-62 | Orden por fecha descendente | HU-043 | CU-07 | — | Sí |
| RF-63 | Exportar CSV | HU-047 | CU-13 | — | Sí |
| RF-64 | El SISO solo ve sus registros | HU-044 | CU-07 | PT-A20, M-22 | Sí |
| RF-70 | Formulario desde el esquema | HU-021 | CU-04 | PT-V18 | Sí |
| RF-71 | Tipos de campo y edición en celdas | HU-021 | CU-04 | PT-U04…PT-U06, PT-V04 | Sí |
| RF-72 | Reglas por tipo: rango, longitud, enumeración | HU-021 | CU-04 | PT-V05…PT-V07, PT-V16 | Sí |
| RF-73 | Campos calculados o de solo lectura | HU-021 | CU-04 | PT-V03 | Sí |
| RF-74 | Order del formato | HU-021 | CU-04 | PT-V18 | Sí |
| RF-75 | Tablas dinámicas | HU-022 | CU-04 | PT-U08, PT-V11, PT-V12 | Sí |
| RF-76 | Agregar y quitar filas | HU-022 | CU-04 | PT-V13 | Sí |
| RF-77 | Tareas `SI/NO/NA` | HU-023 | CU-04 | PT-V14 | Sí |
| RF-78 | Checklists `SI/NO` | HU-024 | CU-04 | PT-V15 | Sí |
| RF-79 | Checklists según el rol | HU-025 | CU-04 | PT-V18 | Sí |
| RF-80 | Notificación de cambio de rol | HU-025 | CU-04 | — | Sí |
| RF-82 | Estado calculado en el formulario | HU-031 | CU-04, CU-10 | PT-U10, PT-U11, M-11 | Sí |
| RF-83 | Restricción de edición al propietario | HU-053 | CU-05 | PT-A22 | Sí |
| RF-85 | Panel de trazabilidad | HU-046 | CU-11 | M-14 | Sí |
| RF-90 | Validación antes de guardar | HU-026 | CU-04 | PT-V01, PT-V02, M-10 | Sí |
| RF-91 | Mensajes de error por campo | HU-026 | CU-04 | PT-V19 | Sí |
| RF-92 | Resaltado visual de campos con error | HU-027 | CU-04 | PT-V20 | Sí |
| RF-93 | Contador de errores | HU-027 | CU-04 | PT-V21, PT-V22 | Sí |
| RF-94 | Desplazamiento al primer error | HU-027 | CU-04 | PT-V20 | Sí |
| RF-95 | Datos enviados solo tras validar | HU-026 | CU-04 | M-10 | Sí |
| RF-96 | Ignorar campos de solo lectura al validar | HU-026 | CU-04 | PT-V03 | Sí |
| RF-97 | Error que identifica fila y columna | HU-032 | CU-04 | PT-V11 | Sí |
| RF-98 | Autollenado de la fecha de hoy | HU-028 | CU-04 | PT-U07 | Sí |
| RF-99 | Prohibir fecha de diligenciamiento futura | HU-030 | CU-04 | PT-V09, PT-V10 | Sí |
| RF-110 | Guardar como borrador | HU-029 | CU-04 | M-09 | Sí |
| RF-111 | `NO` ⇒ `NO CONCEDIDO` | HU-050 | CU-10 | PT-U11, PT-U13, PT-U14, M-11 | Sí |
| RF-112 | Sin `NO` ⇒ `CONCEDIDO` | HU-051 | CU-10 | PT-U10, PT-U12, M-12 | Sí |
| RF-113 | Lista de estados disponibles | HU-050 | CU-09 | M-13 | Sí |
| RF-114 | Aprobar manualmente | HU-052 | CU-09 | M-14 | Sí |
| RF-115 | Solo el Coordinador aprueba o cancela | HU-053 | CU-09 | PT-A23, PT-A25, M-13 | Sí |
| RF-116 | Cancelar con motivo | HU-052 | CU-09 | — | Sí |
| RF-117 | Normalización del estado enviado | HU-052 | CU-09 | PT-A24 | Sí |
| RF-118 | Un registro cancelado no cambia solo | HU-054 | CU-09 | M-15 | Sí |
| RF-119 | La decisión manual prevalece | HU-056 | CU-09 | — | Sí |
| RF-130 | Generar PDF | HU-060 | CU-08 | M-17 | Sí |
| RF-131 | Motor de render | HU-061 | CU-08 | M-17 | Sí |
| RF-132 | Encabezado con código y versión | HU-062 | CU-08 | M-17 | Sí |
| RF-133 | Diseño fiel al formato físico | HU-061 | CU-08 | M-17 | Sí |
| RF-134 | Encabezados y numeración de tablas | HU-066 | CU-08 | M-17 | Sí |
| RF-135 | Impresión A4 | HU-061 | CU-08 | M-17 | Sí |
| RF-136 | Tamaño máximo de letra y saltos de página | HU-061 | CU-08 | M-17 | Sí |
| RF-137 | Tareas con marca `X` | HU-061 | CU-08 | M-17 | Sí |
| RF-138 | Tareas con marca `X` invertida | HU-061 | CU-08 | M-17 | Sí |
| RF-139 | Tareas con lista desplegable | HU-061 | CU-08 | M-17 | Sí |
| RF-140 | Tareas con texto libre | HU-061 | CU-08 | M-17 | Sí |
| RF-141 | Tareas con fecha | HU-061 | CU-08 | M-17 | Sí |
| RF-142 | Tareas con área de texto | HU-061 | CU-08 | M-17 | Sí |
| RF-144 | Ver el PDF en pantalla | HU-063 | CU-08 | M-17 | Sí |
| RF-145 | Descargar el PDF | HU-063 | CU-08 | M-17 | Sí |
| RF-146 | Guardar antes de generar el PDF | HU-064 | CU-08 | M-17 | Sí |
| RF-147 | Solo el propietario o el Coordinador genera el PDF | HU-065 | CU-08 | PT-A22, M-18 | Sí |
| RF-160 | Historial por registro | HU-046, HU-095 | CU-11 | M-14 | Sí |
| RF-161 | Usuario de cada evento | HU-091, HU-095 | CU-11 | — | Sí |
| RF-162 | Marca de tiempo de cada evento | HU-095 | CU-11 | — | Sí |
| RF-163 | Acción y detalle de cada evento | HU-055, HU-095 | CU-09, CU-11 | M-14 | Sí |
| RF-164 | Resumen de la trazabilidad | HU-046 | CU-11 | M-14 | Sí |
| RF-165 | Modal de detalle completo | HU-046 | CU-11 | M-14 | Sí |
| RF-166 | El historial no se edita | HU-090 | CU-11 | — | Sí |
| RF-170 | Indicadores por formato | HU-070 | CU-12 | M-19 | Sí |
| RF-171 | Valor y registros analizados | HU-070, HU-073 | CU-12 | PT-K10, M-19 | Sí |
| RF-172 | Filtro por rango de fechas | HU-071 | CU-12 | PT-K06, M-20 | Sí |
| RF-173 | Filtro por campo o ubicación | HU-072 | CU-12 | PT-K07, M-20 | Sí |
| RF-174 | Recálculo al cambiar filtros | HU-071 | CU-12 | M-20 | Sí |
| RF-175 | Opciones de filtro según el formato | HU-072 | CU-12 | M-20 | Sí |
| RF-176 | Tarjetas KPI | HU-070 | CU-12 | M-19 | Sí |
| RF-177 | Colores y formatos según el tipo | HU-070 | CU-12 | M-19 | Sí |
| RF-178 | Solo el Coordinador accede a indicadores | HU-075 | CU-12 | PT-A26, M-19 | Sí |
| RF-179 | Indicadores de origen por formato | HU-070 | CU-12 | M-19 | Sí |
| RF-180 | Exportar indicadores a CSV | HU-074 | CU-13 | — | Sí |
| RF-190 | Recarga de tabla y formulario al cambiar de formato | HU-012 | CU-03 | M-08 | Sí |
| RF-191 | Confirmación para acciones destructivas | HU-093 | CU-06 | — | Sí |
| RF-192 | Mensaje de éxito tras cada acción | HU-094 | CU-04, CU-05, CU-06 | M-09 | Sí |
| RF-193 | Mensajes de error comprensibles | HU-094 | Todos | PT-V19 | Sí |
| RF-203 | Rol y cargo visibles en la interfaz | HU-005 | CU-01 | M-01 | Sí |

### 21.2 RNF ↔ verificación

| RNF | Descripción corta | Verificación | Estado |
|-----|-------------------|--------------|--------|
| RNF-01 | Node.js ≥ 18 | `node -v` | Cumple |
| RNF-02 | Express 4 como framework | `package.json` | Cumple |
| RNF-03 | `cors` habilitado | `server.js` | Cumple |
| RNF-04 | Puerto configurable `PORT` | `server.js` | Cumple |
| RNF-05 | Sin dependencias de interfaz | `public/` sin CDN | Cumple |
| RNF-06 | Sin proceso de compilación | No hay bundler | Cumple |
| RNF-07 | HTML, CSS y JS separados | `public/index.html`, `public/css/`, `public/js/` | Cumple |
| RNF-08 | Estilos en CSS con variables | `public/css/app.css` | Cumple |
| RNF-09 | Diseño adaptable (responsive) | Media queries en CSS | Cumple |
| RNF-10 | Interfaz en español | Textos de la UI | Cumple |
| RNF-11 | Mensajes comprensibles | PT-V19 | Cumple |
| RNF-12 | Feedback inmediato en cada acción | PT-V20, M-09 | Cumple |
| RNF-13 | Carga subunitaria para el operador | Catálogo de 7 formatos | Cumple |
| RNF-14 | Navegación sin recarga de página | SPA en `app.js` | Cumple |
| RNF-15 | Controles con `type`, `name` y `id` | Inspección del DOM | Cumple |
| RNF-16 | Etiquetas asociadas a los campos | `<label for>` en el HTML | Cumple |
| RNF-17 | Foco visible y orden de tabulación | `:focus-visible` en CSS | Cumple |
| RNF-18 | Estructura semántica | `header`, `main`, `aside` | Cumple |
| RNF-19 | Sin scripts inline | Atributos `onclick` | **No cumple** (ver §26.2) |
| RNF-20 | Favicon y título del documento | `<title>` en `index.html` | Cumple |
| RNF-21 | Código sin errores en consola | Revisión manual | Cumple |
| RNF-22 | Funcionamiento en Chrome y Edge | PT E2E | Cumple |
| RNF-23 | Compatibilidad con Windows 10/11 | Entorno de desarrollo | Cumple |
| RNF-24 | Compatible con Linux y Docker | — | **Plan** (§26.3) |
| RNF-30 | Disponibilidad 99 % | Sin monitoreo | **Plan** |
| RNF-31 | Tiempo de respuesta menor a 2 s | Operación local | Cumple |
| RNF-32 | Tolerancia a datos corruptos | Respaldo de `data/` en memoria | Cumple |
| RNF-33 | Escalabilidad horizontal | — | **Plan** |
| RNF-40 | Contraseñas con hash `scrypt` | `lib/auth.js` | Cumple |
| RNF-41 | Salt único por usuario | `lib/auth.js` | Cumple |
| RNF-42 | Comparación en tiempo constante | `timingSafeEqual` | Cumple |
| RNF-43 | Token aleatorio de 256 bits | `randomBytes(32)` | Cumple |
| RNF-44 | Sesión con expiración de 12 h | `lib/auth.js` | Cumple |
| RNF-45 | Cierre de sesión que invalida el token | `lib/auth.js` | Cumple |
| RNF-46 | Token en cabecera `Authorization` | `lib/auth.js` | Cumple |
| RNF-47 | Sin contraseñas en el cliente | `public/js/app.js` | Cumple |
| RNF-48 | Sin datos sensibles en los logs | `server.js` | Cumple |
| RNF-49 | Validación de entradas en cliente | `validacion.js` | Cumple |
| RNF-50 | Validación de entradas en servidor | `server.js` (parcial: tipo y rol) | Parcial |
| RNF-51 | Protección contra inyección en el PDF | `esc()` en `lib/pdf.js` | Cumple |
| RNF-52 | Límite de tamaño del cuerpo de la petición | `express.json({ limit: '10mb' })` | Cumple |
| RNF-53 | Autorización por rol en el servidor | `requireRol` | Cumple |
| RNF-54 | Protección contra CSV injection | Comillas en el CSV | Cumple |
| RNF-55 | Frontend sin acceso al sistema de archivos | Static con raíz fija | Cumple |
| RNF-56 | HTTPS obligatorio en producción | — | **Plan** |
| RNF-60 | Auditoría por registro | `historial[]` | Cumple |
| RNF-61 | Historial inalterable | No hay endpoint de edición | Cumple |
| RNF-62 | Identificación del actor en cada cambio | `usuario` en el evento | Cumple |
| RNF-63 | Réplica de seguridad de `usuarios.json` | — | **Plan** |
| RNF-64 | Comportamiento predecible ante fallos | Mensajes al usuario | Cumple |

### 21.3 RN ↔ verificación

| RN | Descripción corta | Verificación | Estado |
|----|-------------------|--------------|--------|
| RN-01 | Un `NO` obliga a `NO CONCEDIDO` | PT-U11, PT-U13, PT-U14 | Cumple |
| RN-02 | Sin `NO` se propone `CONCEDIDO` | PT-U10, PT-U12 | Cumple |
| RN-03 | Un registro `CANCELADO` conserva su estado | M-15 | Cumple |
| RN-04 | El SISO solo accede a sus registros | PT-A20, M-22 | Cumple |
| RN-05 | Solo el Coordinador aprueba o cancela | PT-A23, M-13 | Cumple |
| RN-06 | El estado siempre es un valor de la lista | PT-A24 | Cumple |
| RN-07 | El PDF incluye código y versión del formato | M-17 | Cumple |
| RN-08 | Todo registro nace en `BORRADOR` | PT-U15 | Cumple |
| RN-09 | No se aceptan fechas de diligenciamiento futuras | PT-V09 | Cumple |
| RN-10 | Todo evento queda con fecha, usuario, acción y detalle | M-14 | Cumple |
| RN-11 | Ningún estado borra el historial | PT-A22 (no hay ruta de borrado) | Cumple |
| RN-12 | El alta de usuarios es exclusiva del Coordinador | PT-A15 | Cumple |
| RN-13 | La contraseña nunca se devuelve al cliente | PT-A13 | Cumple |
| RN-14 | El correo identifica al usuario y es único | PT-A14 | Cumple |
| RN-15 | El rol determina la interfaz y la API | M-22, PT-A12, PT-A23 | Cumple |
| RN-16 | Los datos se conservan aunque se cambie de formato | Cambio de formato en la UI | Cumple |
| RN-17 | No se admiten correos duplicados | PT-A14 | Cumple |
| RN-18 | Un registro no puede quedar sin propietario | Campo `creadoPor` obligatorio | Cumple |
| RN-19 | Los indicadores se calculan solo sobre registros visibles | PT-K06, PT-K07 | Cumple |
| RN-20 | Los porcentajes no dividen entre cero | PT-K05 | Cumple |
| RN-21 | El orden de los indicadores es el del esquema | Revisión del tablero | Cumple |
| RN-22 | El PDF conserva el orden de las secciones del formato | M-17 | Cumple |
| RN-23 | El archivo del formato es su única fuente de datos | `lib/db.js` | Cumple |

---

## 22. SEGURIDAD

### 22.1 Modelo de amenazas (resumen)

| Activo | Amenaza | Impacto | Control actual |
|--------|---------|---------|----------------|
| Contraseñas | Robo del archivo `usuarios.json` | Acceso total | Hash `scrypt` con salt por usuario; el archivo no contiene contraseñas en claro |
| Contraseñas | Filtración por logs o respuestas | Acceso total | Nunca se registran ni se devuelven (`RN-13`) |
| Sesión | Token robado | Acceso como el usuario | Token de 256 bits, 12 h de vigencia, cierre de sesión que lo invalida |
| Sesión | Reutilización de token tras cerrar sesión | Acceso no autorizado | El token se elimina del almacén de sesiones |
| Datos de registros | Acceso de un SISO a registros ajenos | Filtración de información | `requireAuth` + filtro por propietario; el SISO solo ve lo suyo |
| Datos de registros | Cambio de estado sin autorización | Permisos inseguros concedidos | `requireRol(['COORDINADOR'])` en el servidor |
| Eliminación de datos | Borrado no autorizado | Pérdida de evidencia | Solo el Coordinator puede eliminar (`PT-A25`) |
| Inyección en el PDF | Contenido malicioso en el HTML del PDF | Ejecución de scripts | Escape de `& < > "` en `lib/pdf.js` (`RNF-51`) |
| Inyección CSV | Fórmulas en campos exportados | Ejecución al abrir el Excel | Campos entre comillas y apóstrofos escapados |
| Carga de archivos | Foto de perfil con contenido arbitrario | XSS | Solo se acepta `data:image/...` (`RF-30`) |
| Denegación de servicio | Cuerpo de petición enorme | Caída del proceso | Límite de 10 MB (`RNF-52`) |
| Exposición de archivos | Acceso directo a `data/` | Robo de datos | El servidor solo expone `public/` y `pdfs/` |
| Elevación de privilegios | Un SISO llama a la API de administración | Administración no autorizada | Verificación de rol en cada endpoint sensible |

### 22.2 Autenticación

| Aspecto | Implementación |
|---------|----------------|
| Esquema | Correo + contraseña |
| Almacenamiento de la contraseña | `scrypt` con salt aleatorio de 16 bytes por usuario |
| Verificación | `crypto.timingSafeEqual` sobre los hashes |
| Sesión | Token opaco aleatorio de 32 bytes, indexado por token |
| Vigencia | 12 horas desde la emisión |
| Transporte del token | Cabecera `Authorization: Bearer <token>` |
| Persistencia en el cliente | `localStorage` (clave del token y de la sesión) |
| Cierre de sesión | Elimina el token del servidor y limpia el cliente |
| Recuperación de contraseña | No implementada (ver §22.6) |
| Bloqueo por intentos fallidos | No implementado (ver §22.6) |

### 22.3 Autorización

| Recurso | Sin sesión | SISO | Coordinador |
|---------|-----------|------|--------------|
| `GET /api/estado` | Permitido | Permitido | Permitido |
| `GET /api/formatos` | Permitido | Permitido | Permitido |
| `GET /api/formatos/:id/esquema` | Permitido | Permitido | Permitido |
| Archivos estáticos `/` | Permitido | Permitido | Permitido |
| `/pdfs/*` | Permitido (URL no adivinable) | Permitido | Permitido |
| `POST /api/auth/login` | Permitido | Permitido | Permitido |
| `GET /api/auth/me` | 401 | Permitido | Permitido |
| `POST /api/auth/logout` | 401 | Permitido | Permitido |
| `PATCH /api/auth/perfil` | 401 | Permitido | Permitido |
| `GET /api/usuarios` | 401 | 403 | Permitido |
| `POST /api/usuarios` | 401 | 403 | Permitido |
| `GET /api/formatos/:id` | 401 | Solo los propios | Todos |
| `POST /api/formatos/:id` | 401 | Sí | Sí |
| `GET /api/formatos/:id/:rid` | 401 | Solo el propio | Todos |
| `PUT /api/formatos/:id/:rid` | 401 | Solo el propio | Todos |
| `PATCH /api/formatos/:id/:rid/estado` | 401 | Solo el propio y sin estados de decisión | Todos |
| `DELETE /api/formatos/:id/:rid` | 401 | 403 | Permitido |
| `POST /api/formatos/:id/:rid/pdf` | 401 | Solo el propio | Todos |
| `GET /api/indicadores` | 401 | 403 | Permitido |
| `GET /api/formatos/:id/indicadores` | 401 | 403 | Permitido |

### 22.4 Protecciones a nivel de datos

| Protección | Detalle |
|------------|---------|
| Aislamiento por formato | Un archivo JSON por formato; un error de lectura no detiene los demás |
| Copia en memoria | El archivo se carga al arrancar y se conserva una copia de seguridad |
| Escritura atómica en disco | Se escribe en un archivo temporal y se renombra, para no dejar archivos a medio escribir |
| Correlación de identificadores | El `id` del formato acompaña siempre al `rid` del registro |
| Historial no editable | No existe endpoint que modifique `historial[]` |

### 22.5 Prácticas de despliegue seguro

| Práctica | Aplicación |
|----------|------------|
| Credenciales por ambiente | Las cuentas demo son solo de desarrollo; en producción se cambian |
| Sin secretos en el repositorio | No hay claves ni contraseñas en el código |
| Permisos de archivo | `data/` y `pdfs/` solo son escribibles por el proceso del servidor |
| Puerto expuesto a la red local | `cors` habilitado; para producción se recomienda restringir el origen |
| Dependencias auditadas | Revisar `npm audit` antes de cada publicación |
| Copia de seguridad | Respaldar `Proyecto/platform/data/` y `pdfs/` periódicamente |

### 22.6 Pendientes de seguridad

| Pendiente | Prioridad | Deuda técnica | Plan (§26.3) |
|-----------|-----------|---------------|----------------|
| HTTPS y cookies `HttpOnly` en lugar de `localStorage` | Alta | DT-04, DT-13 | Actividad 5 |
| Bloqueo temporal tras varios intentos fallidos | Media | — | Actividad 11 |
| Recuperación de contraseña | Media | — | Actividad 11 |
| Validación de esquema completa en el servidor | Alta | DT-03 | Actividad 1 |
| Restricción de CORS por origen | Media | DT-14 | Actividad 9 |
| Protección de `/pdfs/*` con verificación de sesión | Media | DT-02 | Actividad 4 |
| Registro de eventos de seguridad (accesos fallidos) | Media | DT-12 | Actividad 8 |
| Cifrado en reposo de los datos sensibles | Baja | — | Fuera del alcance del piloto |

## 23. DESPLIEGUE

### 23.1 Requisitos del entorno

| Componente | Versión mínima | Verificación | Obligatorio |
|-----------|----------------|--------------|-------------|
| Node.js | 18 | `node -v` | Sí |
| npm | 9 | `npm -v` | Sí |
| Sistema operativo | Windows 10/11, Linux o macOS | — | Sí |
| Google Chrome o Microsoft Edge | Última estable | Rutas en `lib/pdf.js` | **Solo para PDF** |
| Espacio en disco | 200 MB (más los PDF generados) | — | Sí |
| Puerto 3200 libre | — | `netstat -ano \| findstr :3200` | Sí |

### 23.2 Procedimiento de instalación

```bash
# 1. Ubicarse en la carpeta del proyecto
cd "SSTech Saas"

# 2. Instalar las dependencias del backend
cd Proyecto/platform
npm install

# 3. (Opcional) Cargar los datos de demostración
npm run seed

# 4. Iniciar el servidor
npm start
```

Salida esperada:

```
SSTech SaaS escuchando en http://localhost:3200
```

### 23.3 Configuración

| Variable | Valor por defecto | Uso |
|----------|-------------------|-----|
| `PORT` | `3200` | Puerto del servidor HTTP |

No hay archivo de configuración ni variables de entorno obligatorias: el sistema arranca sin
configuración previa. La ruta del navegador para PDF está fija en `lib/pdf.js` (`CHROME_PATHS`) y
**no es configurable por variable de entorno en la versión actual** (ver DT-01, §26.2).

### 23.4 Despliegue en un equipo de trabajo

| Paso | Acción | Verificación |
|------|--------|--------------|
| 1 | Copiar la carpeta `Proyecto/platform` al equipo destino | Existen `server.js` y `package.json` |
| 2 | Ejecutar `npm install` | Se crea `node_modules/` |
| 3 | Ejecutar `npm run seed` una sola vez | Aparecen 2 usuarios y 26 registros |
| 4 | Cambiar las contraseñas de las cuentas demo | Ingreso con la nueva contraseña |
| 5 | Ejecutar `npm start` | Mensaje de escucha en el puerto 3200 |
| 6 | Abrir `http://localhost:3200` en Chrome o Edge | Se muestra la pantalla de login |
| 7 | Crear los SISO reales desde el panel | Aparecen en el listado de usuarios |
| 8 | Respaldar `data/` y `pdfs/` | Copia externa realizada |

### 23.5 Actualización de una versión

| Paso | Acción | Precaución |
|------|--------|------------|
| 1 | Respaldar `Proyecto/platform/data/` y `pdfs/` | Obligatorio: son los datos de los usuarios |
| 2 | Detener el servidor | `Ctrl + C` en la terminal |
| 3 | Sustituir el código conservando `data/` y `pdfs/` | No sobrescribir los datos |
| 4 | `npm install` | Instala las dependencias nuevas |
| 5 | `npm start` | Verificar el mensaje de escucha |
| 6 | Ejecutar las pruebas unitarias | Deben pasar 41 de 41 |
| 7 | Verificar un login y un PDF | Prueba de humo |

### 23.6 Verificación posterior al despliegue

| # | Verificación | Resultado esperado |
|---|--------------|--------------------|
| V-01 | El puerto 3200 responde | `GET /api/estado` devuelve 200 |
| V-02 | La pantalla de login carga | Se ve el formulario de acceso |
| V-03 | El login del Coordinador funciona | Se ve el panel con el botón de indicadores |
| V-04 | El login del SISO funciona | Se ve el panel sin indicadores ni usuarios |
| V-05 | Los 7 formatos cargan | Tabla y formulario cambian en cada uno |
| V-06 | Se crea y guarda un registro | Aparece en la tabla con estado `BORRADOR` |
| V-07 | Se genera un PDF | El archivo aparece en `pdfs/` y se abre en el visor |
| V-08 | El logout funciona | El panel deja de ser accesible |
| V-09 | Los indicadores responden | Se muestran las tarjetas KPI |
| V-10 | La exportación CSV funciona | Se descarga el archivo con BOM |

### 23.7 Publicación en un repositorio

Antes de publicar el proyecto se deben revisar y ocultar:

| Elemento | Motivo | Acción |
|----------|--------|--------|
| `Proyecto/platform/data/*.json` | Datos de demostración y usuarios | No publicar o publicar solo con datos de ejemplo |
| `Proyecto/platform/pdfs/` | PDF generados por los usuarios | No publicar |
| `Proyecto/platform/usuarios.json` | Cuentas y hashes | No publicar |
| `Proyecto/platform/*.log` | Registros de ejecución | No publicar |
| `Proyecto/platform/node_modules/` | Dependencias | No publicar (se regeneran con `npm install`) |
| `.gitignore` | Exclusión automática | Mantener o crear con esas entradas |

---

## 24. OPERACIÓN Y MANTENIMIENTO

### 24.1 Rutinas

| Rutina | Frecuencia | Acción |
|--------|------------|--------|
| Respaldo de `data/` | Diaria | Copiar a una ubicación externa |
| Respaldo de `pdfs/` | Semanal | Archivar los PDF emitidos |
| Revisión de accesos fallidos | Semanal | Revisar `server.log` |
| Revisión de la lista de usuarios | Mensual | Desactivar las cuentas que ya no aplican |
| Rotación de contraseñas | Trimestral | Cambiar contraseñas de administradores |
| `npm audit` | Mensual | Revisar vulnerabilidades de dependencias |
| Limpieza de PDF huérfanos | Mensual | Borrar PDF de registros eliminados |

### 24.2 Bitácora de errores

| Situación | Mensaje al usuario | Acción del administrador |
|-----------|--------------------|---------------------------|
| El navegador no se encuentra | Error 500 con la causa | Instalar Chrome o Edge, o corregir `CHROME_PATHS` en `lib/pdf.js` |
| Un archivo de datos está dañado | Aviso de formato no disponible | Restaurar el archivo desde el respaldo de `data/` |
| El formato no responde | Error 404 | Verificar que exista la carpeta del formato en `Proyecto/formatos/` |
| El puerto está ocupado | Error `EADDRINUSE` | Liberar el puerto o usar `PORT=3300 npm start` |
| La sesión expira durante el diligenciamiento | Aviso y regreso al login | Guardar el registro antes de la expiración |
| Falla la escritura en disco | Error 500 | Verificar permisos de la carpeta `data/` y espacio disponible |

### 24.3 Monitoreo

No hay monitoreo automatizado en la versión actual. La verificación disponible es:

| Métrica operativa | Cómo obtenerla | Valor esperado |
|------------------|----------------|----------------|
| Estado del servicio | `GET /api/estado` | 200 con el nombre y la versión |
| Registros por formato | Panel de la aplicación | Coherente con la operación esperada |
| Errores del servidor | `server.log` | Sin errores 500 repetidos |
| PDFs fallidos | `server.log` | 0 en operación normal |
| Crecimiento de `pdfs/` | Tamaño de la carpeta | Acorde con los permisos emitidos |

### 24.4 Plan de mantenimiento

| Tipo | Ejemplo | Tiempo estimado |
|------|---------|------------------|
| Correctivo | Error que impide diligenciar | 1 h |
| Adaptativo | Ajuste a un cambio de formato de la empresa | 1 a 3 días |
| Preventivo | Corrección de un defecto detectado en pruebas | 2 a 4 h |
| Evolutivo | Nueva versión de un formato, nuevos KPI | 3 a 5 días |
| Refactorización | Migrar la persistencia a base de datos | 1 a 2 semanas |

### 24.5 Copias de seguridad y restauración

| Elemento | Contenido | Periodicidad | Restauración |
|----------|-----------|--------------|--------------|
| `data/<formato>.json` | Registros por formato | Diaria | Copiar el archivo sobre `data/` y reiniciar |
| `usuarios.json` | Cuentas, hashes y sesiones | Diaria | Copiar el archivo y reiniciar |
| `pdfs/` | PDF generados | Semanal | Copiar la carpeta completa |
| `package.json` / `package-lock.json` | Dependencias | Con cada versión | `npm install` |

Procedimiento de restauración:

```bash
# 1. Detener el servidor
# 2. Copiar los respaldos en sus rutas
cp respaldo/ft-ope-06.json Proyecto/platform/data/
cp respaldo/usuarios.json Proyecto/platform/
# 3. Reiniciar
cd Proyecto/platform && npm start
# 4. Verificar con los casos V-01 a V-10 de §23.6
```

---

## 25. DIAGRAMAS

Los diagramas se mantienen como archivos de PlantUML (`.mmd`) para poder versionarlos como texto,
con una vista HTML asociada.

| Archivo | Contenido | Vista |
|---------|-----------|-------|
| `Proyecto/Diagramas/1-casos-de-uso.mmd` | Casos de uso por rol | `ver-diagramas.html` |
| `Proyecto/Diagramas/2-arquitectura.mmd` | Arquitectura del sistema | `ver-diagramas.html` |
| `Proyecto/Diagramas/3-secuencia-pdf.mmd` | Secuencia de generación del PDF | `ver-diagramas.html` |
| `Proyecto/Diagramas/4-modelo-datos.mmd` | Modelo de datos | `ver-diagramas.html` |
| `Proyecto/Diagramas/5-roles.mmd` | Matriz de roles | `ver-diagramas.html` |

Vista previa: `Proyecto/Diagramas/ver-diagramas.html` (requiere conexión para cargar el renderizador).

### 25.1 Arquitectura de capas

```
@startuml
skinparam componentStyle rectangle

actor Usuario

package "Frontend (public/)" {
  [index.html] as HTML
  [js/app.js\nControlador SPA] as APP
  [js/form.js\nFormulario dinámico] as FORM
  [js/validacion.js\nMotor de validación] as VAL
  [js/util.js\nUtilidades] as UTIL
  [css/app.css] as CSS
}

package "Backend (Node.js + Express)" {
  [server.js\nRutas y middlewares] as SRV
  [lib/auth.js\nSesiones y roles] as AUTH
  [lib/db.js\nPersistencia] as DB
  [lib/indicadores.js\nMotor de KPI] as KPI
  [lib/pdf.js\nRender a PDF] as PDF
  [config/index.js\nDescubrimiento de formatos] as CFG
}

database "data/*.json" as JSON
folder "pdfs/" as PDFS
folder "Proyecto/formatos/*" as FMT

Usuario --> HTML
HTML --> CSS
HTML --> APP
APP --> FORM
APP --> VAL
APP --> UTIL
FORM --> UTIL

APP --> SRV : HTTP + JSON\n(cabecera Authorization)
SRV --> AUTH
SRV --> DB
SRV --> KPI
SRV --> PDF
SRV --> CFG

AUTH --> JSON
DB --> JSON
KPI --> FMT
PDF --> PDFS
CFG --> FMT
@enduml
```

### 25.2 Secuencia: generación del PDF

```
@startuml
actor U as Usuario
participant UI as app.js
participant API as server.js
participant DB as lib/db.js
participant P as lib/pdf.js
participant C as Chrome/Edge
folder pdfs/

U -> UI : clic en "PDF"
UI -> UI : ¿el registro es nuevo?\nsi es nuevo, guardar primero
UI -> API : POST /api/formatos/:id/:rid/pdf\nAuthorization: Bearer
API -> AUTH : verificar token
API -> DB : leer el registro
DB --> API : registro
API -> P : htmlPdf(esquema, data, version, fecha)
P -> P : escapar contenido (esc)
P -> P : buscar Chrome en CHROME_PATHS
P -> C : launch() + setContent() + pdf({format:'A4'})
C --> P : buffer del PDF
P -> pdfs : escribir <id>-<uuid>.pdf
P --> API : { ok, archivo, url }
API --> UI : 200 JSON
UI -> U : abrir el visor con /pdfs/...?v=<uuid>
U -> U : ver o descargar
@enduml
```

### 25.3 Modelo de datos

```
@startuml
entity "Registro" as R {
  id : string <<UUID>>
  formatoId : string
  estado : enum <<BORRADOR|CONCEDIDO|NO CONCEDIDO|CANCELADO>>
  creadoEn : datetime
  actualizadoEn : datetime
  creadoPor : string
  data : object <<contenido del formato>>
  historial : Evento[]
}

entity "Evento" as E {
  fecha : datetime
  usuarioId : string
  usuarioNombre : string
  accion : string
  detalle : string
}

entity "Usuario" as U {
  id : string <<UUID>>
  nombre : string
  email : string <<único>>
  cargo : string
  cedula : string
  telefono : string
  foto : string <<data:image/...>>
  rol : enum <<COORDINADOR|SISO>>
  passwordHash : string
  salt : string
  activo : boolean
  creadoEn : datetime
}

entity "Formato" as F {
  id : string
  nombre : string
  version : string
  fecha : string
  estructura : object <<esquema>>
  indicadores : Indicador[]
}

entity "Indicador" as I {
  codigo : string
  nombre : string
  tipo : enum <<contador|porcentaje|lista|decimal>>
}

entity "Sesion" as S {
  token : string
  usuarioId : string
  creadaEn : datetime
  expiraEn : datetime
}

R "1" *-- "0..*" E : historial
U "1" -- "0..*" R : creadoPor
F "1" -- "0..*" R : instancias
F "1" *-- "0..*" I
U "1" -- "0..*" S
@enduml
```

### 25.4 Flujo de decisión del estado

```
@startuml
start
:Usuario marca un ítem o guarda;
if (El registro está CANCELADO?) then (sí)
  #FFE0E0:El estado se conserva;
  stop
endif
:Recorrer todos los grupos de data.verif;
if (¿Algún ítem es "NO"?) then (sí)
  #FFD5D5:Estado calculado = NO CONCEDIDO;
else (no)
  #D5FFD5:Estado calculado = CONCEDIDO;
endif
if (¿El usuario es COORDINADOR?) then (sí)
  if (¿El estado difiere del persistido?) then (sí)
    :Persistir el estado calculado;
    :Registrar el evento "ESTADO: <valor>";
  else (no)
    :No se escribe nada;
  endif
else (no)
  #E8E8FF:El estado solo se muestra en pantalla;
endif
stop
@enduml
```

### 25.5 Despliegue

```
@startuml
node "Navegador (Chrome / Edge)" {
  [SPA: index.html + js + css]
}
node "Servidor Node.js (puerto 3200)" {
  [Express: rutas y middlewares]
  [Módulos: auth, db, indicadores, pdf]
}
node "Disco local" {
  folder "public/" as PUB
  folder "data/" as DATA
  folder "pdfs/" as PDFS
  folder "config/formatos/" as CFGF
}
database "Navegador instalado\n(Chrome o Edge)" as CHR

[Navegador (Chrome / Edge)] --> [Express: rutas y middlewares] : HTTP + JSON
[Express: rutas y middlewares] --> PUB : estáticos
[Express: rutas y middlewares] --> DATA : lectura y escritura
[Express: rutas y middlewares] --> PDFS : escritura y lectura
[Express: rutas y middlewares] --> CFGF : esquemas e indicadores
[Express: rutas y middlewares] --> CHR : Puppeteer (solo PDF)
[SPA: index.html + js + css] --> CHR : render del documento
@enduml
```

## 26. DEFINITION OF DONE, DEUDA TÉCNICA Y PLAN

### 26.1 Definition of Done

Un requisito está **terminado** cuando cumple la totalidad de estos puntos:

| # | Condición | Verificable |
|---|-----------|-------------|
| 1 | El código está implementado y guardado en el repositorio | Revisión del `git status` |
| 2 | El comportamiento observable coincide con lo especificado en §8 | El caso de prueba asociado está aprobado |
| 3 | Los mensajes están en español y son comprensibles | `PT-V19` |
| 4 | Los casos de prueba manual asociados están ejecutados y anotados | Checklist §19.7 |
| 5 | No hay errores ni advertencias en la consola del navegador | Revisión manual |
| 6 | No se introducen regresiones: las 41 pruebas unitarias siguen en verde | `node --test "tests/unit/*.test.js"` |
| 7 | Las reglas de negocio afectadas están cubiertas por una prueba unitaria | `PT-U10`…`PT-U15` |
| 8 | La trazabilidad del requisito está registrada en §21 | Matriz actualizada |
| 9 | La documentación refleja el cambio | Este documento y `README.md` |
| 10 | No quedan marcadores `TODO`, `FIXME` ni código comentado en el flujo entregado | Búsqueda en el código |

### 26.2 Deuda técnica conocida

| ID | Descripción | Impacto | Esfuerzo | Origen |
|----|-------------|---------|----------|--------|
| DT-01 | El PDF depende de rutas fijas de Chrome/Edge en `lib/pdf.js`; no se puede configurar sin tocar el código | Alto: si el navegador cambia de ruta, el PDF falla | 2 h | `lib/pdf.js:11-16` |
| DT-02 | La ruta del PDF (`/pdfs/*.pdf`) es pública: quien conozca la URL puede abrir el documento | Medio: los nombres incluyen un UUID, lo que reduce la previsibilidad | 1 día | `server.js:32` |
| DT-03 | No hay validación de esquema en el servidor: el cliente es quien valida | Alto: un cliente modificado podría guardar datos inválidos | 2 días | `server.js`, `POST`/`PUT` |
| DT-04 | La sesión se guarda en `localStorage`, expuesta a XSS | Medio | 1 día | `public/js/app.js` |
| DT-05 | Los eventos inline `onclick` contradicen `RNF-19` | Bajo: funcional, pero ensucia el HTML | 3 h | `public/index.html` |
| DT-06 | El identificador `btn-indicadores` está duplicado en `index.html` | Bajo: el navegador usa el primero; el segundo queda sin control real | 15 min | `public/index.html:72,85` |
| DT-07 | `public/js/form.js` invoca `UI.agregar`, que no está definido en el objeto `UI` | Medio: puede lanzar `TypeError` al agregar filas de una tabla | 1 h | `public/js/form.js` |
| DT-08 | `GET /api/formatos` y `GET /api/formatos/:id/esquema` son públicos, en contraste con `RT-9` | Bajo: solo exponen metadatos del formato | 1 h | `server.js:99,106` |
| DT-09 | El comando documentado `node --test tests/unit/` falla con `MODULE_NOT_FOUND` en Node ≥ 22 | **Resuelto** en esta versión: se sustituyó por el patrón `*.test.js` en `README.md`, `tests/README.md` y `tests/documentacion/pruebas.md` | — | `tests/README.md`, `tests/documentacion/pruebas.md` |
| DT-10 | La persistencia en archivos JSON no soporta concurrencia segura entre procesos | Medio: dos instancias escribiendo a la vez pueden pisarse | 3 días | `lib/db.js` |
| DT-11 | No hay paginación en el servidor: el cliente recibe todos los registros | Bajo: mientras el volumen sea bajo | 1 día | `server.js:134` |
| DT-12 | No hay registro de auditoría de accesos fallidos | Medio: dificulta detectar ataques de fuerza bruta | 1 día | `server.js` |
| DT-13 | Sin HTTPS ni cookies `HttpOnly` | Alto para uso en red real | 2 días | Global |
| DT-14 | `cors` abierto a cualquier origen | Medio en producción | 1 h | `server.js` |
| DT-15 | Sin pruebas automatizadas de la API ni de los indicadores | Medio: la regresión en KPI no se detecta | 3 días | `tests/` |

**Corrección aplicada (DT-09):** el comando de pruebas en `README.md`, `tests/README.md` y
`tests/documentacion/pruebas.md` ya usa `node --test "tests/unit/*.test.js"`, que sí funciona.
Verificado en Node v24.15.0: **41 pruebas, 11 suites, 41 pass, 0 fail**.

### 26.3 Plan de trabajo propuesto

Ninguna de las siguientes actividades está implementada en la versión actual. Se ordenan por
prioridad de negocio.

| # | Actividad | Objetivo | Esfuerzo | Depende de |
|---|-----------|----------|----------|------------|
| 1  | Validación de esquema en el servidor | Cerrar DT-03 | 2 días | — |
| 2  | Corregir `UI.agregar` y el `id` duplicado | Cerrar DT-06, DT-07 | 1 h | — |
| 3  | Ruta del navegador configurable (`CHROME_PATH`) | Cerrar DT-01 | 2 h | — |
| 4  | Proteger `/pdfs/*` con verificación de sesión | Cerrar DT-02 | 1 día | — |
| 5  | Migrar la sesión a cookies `HttpOnly` + HTTPS | Cerrar DT-04, DT-13 | 2 días | — |
| 6  | Pruebas de la API y de los indicadores | Cerrar DT-15 | 3 días | — |
| 7  | Migrar la persistencia a SQLite | Cerrar DT-10 | 1 semana | — |
| 8  | Registro de auditoría de accesos | Cerrar DT-12 | 1 día | — |
| 9  | Restricción de CORS por origen | Cerrar DT-14 | 1 h | — |
| 10 | Paginación en el servidor | Cerrar DT-11 | 1 día | 7 |
| 11 | Bloqueo por intentos fallidos y recuperación de contraseña | Seguridad | 2 días | 5 |
| 12 | Notificaciones de vencimiento de permisos | Evolución | 3 días | 7 |
| 13 | Firma digital del PDF | Evolución | 5 días | 7 |
| 14 | Empaquetado en Docker | Portabilidad | 1 día | 7 |

### 26.4 Riesgos del proyecto

| ID | Riesgo | Probabilidad | Impacto | Severidad | Mitigación actual | Plan de mitigación |
|----|--------|--------------|---------|-----------|-------------------|--------------------|
| R-01 | Un formato de la empresa cambia y el esquema queda desactualizado | Alta | Alto | Crítico | Los esquemas están separados del código (`config/formatos/`) | Proceso de control de cambios; versión del formato en el encabezado |
| R-02 | Se confunden las responsabilidades de Coordinador y SISO | Media | Alto | Alto | `requireRol` en el servidor; el SISO no ve el selector de estado | Capacitación y prueba de permisos en cada entrega |
| R-03 | Pérdida de datos por daño del archivo JSON | Baja | Crítico | Alto | Copia en memoria y escritura atómica | Respaldo diario automatizado |
| R-04 | Un permiso se concede sin la revisión necesaria | Media | Crítico | Alto | La regla del `NO` bloquea automáticamente el `CONCEDIDO` | Revisión de la regla con SST de la empresa |
| R-05 | El PDF no se genera porque el navegador cambió de ruta | Media | Medio | Medio | Búsqueda en cuatro rutas habituales | Leer `CHROME_PATH` del entorno (plan, actividad 3) |
| R-06 | Fuga de datos por acceso directo a `/pdfs/` | Baja | Alto | Medio | Nombres con UUID aleatorio | Verificar la sesión en la entrega del PDF (plan, actividad 4) |
| R-07 | Uso del sistema fuera de la red interna | Media | Alto | Alto | `cors` abierto | Restringir orígenes y exigir HTTPS (plan, actividades 5 y 9) |
| R-08 | Datos escritos por un cliente modificado (fuera de la UI) | Media | Medio | Medio | Validación de tipo y de rol | Validación de esquema en el servidor (plan, actividad 1) |
| R-09 | Volumen alto de registros degrada el rendimiento | Media | Medio | Medio | Filtrado y paginación en el cliente | Paginación en el servidor y base de datos (plan, actividades 7 y 10) |
| R-10 | El alcance crece y el proyecto no termina a tiempo | Media | Medio | Medio | Alcance y restricciones explícitos en §6 y §7 | Control de cambios formal |
| R-11 | Dependencia de un solo desarrollador | Alta | Alto | Alto | Documentación de código y SPEC | Transferencia de conocimiento antes de la entrega |
| R-12 | Los KPI no coinciden con lo que mide la empresa | Media | Medio | Medio | Indicadores en archivos separados y editables | Validación de cada fórmula con SST antes de publicarla |

### 26.5 Glosario

| Término | Definición |
|---------|------------|
| **API** | Interfaz de Programación de Aplicaciones; en este proyecto, el conjunto de rutas HTTP de `server.js` |
| **Backend** | Parte del sistema que se ejecuta en Node.js: rutas, autenticación, persistencia, PDF e indicadores |
| **Backend de negocio** | Capa de `lib/` que aplica las reglas de seguridad y de estado |
| **Frontend** | Parte del sistema que se ejecuta en el navegador: `index.html`, CSS y JavaScript |
| **SPA** | *Single Page Application*; aplicación de una sola página que no recarga el documento |
| **SISO** | Seguridad y Salud en el Trabajo; rol que diligencia formatos en campo |
| **Coordinador** | Rol de SST que revisa, aprueba, cancela y administra usuarios e indicadores |
| **Formato** | Documento de la empresa (por ejemplo FT-OPE-06) que la aplicación digitaliza |
| **Esquema** | Estructura declarativa de un formato: secciones, campos, tablas y reglas |
| **Registro** | Instancia diligenciada de un formato |
| **`rid`** | Identificador único de un registro |
| **Checklist** | Lista de verificación con respuestas SI / NO |
| **Tarea** | Pregunta con respuestas SI / NO / NA |
| **Indicador / KPI** | Valor calculado sobre los registros (contador, porcentaje, lista o decimal) |
| **Trazabilidad** | Historial de quién hizo qué y cuándo en un registro |
| **Token** | Credencial opaca que representa la sesión del usuario |
| **`scrypt`** | Función de derivación de claves usada para proteger las contraseñas |
| **PDF** | Formato de documento portable; aquí A4 generado con `puppeteer-core` |
| **A4** | Tamaño de papel ISO 216: 210 × 297 mm |
| **CSV** | Archivo de valores separados por comas; aquí con BOM y separador `;` |
| **BOM** | Marca de orden de bytes que permite a Excel leer correctamente UTF-8 |
| **UUID** | Identificador único universal; se usa para registros, usuarios y archivos |
| **`localStorage`** | Almacenamiento del navegador que conserva el token entre recargas |
| **Express** | Marco web de Node.js usado para exponer la API |
| **Node.js** | Entorno de ejecución de JavaScript en el servidor |
| **Puppeteer** | Biblioteca que automatiza Chromium; aquí se usa `puppeteer-core` |
| **ES Module / CommonJS** | Formatos de módulos de JavaScript; el proyecto usa CommonJS (`require`) |
| **RNF** | Requisito No Funcional |
| **RF** | Requisito Funcional |
| **RN** | Regla de Negocio |
| **RT** | Restricción |
| **HU** | Historia de Usuario |
| **CU** | Caso de Uso |
| **PT** | Prueba de Test |
| **DoD** | *Definition of Done*; criterio de terminado |

### 26.6 Anexo A — Inventario de archivos

| Ruta | Tipo | Responsabilidad |
|------|------|-----------------|
| `Proyecto/platform/server.js` | Código | Punto de entrada; rutas, middlewares, estáticos |
| `Proyecto/platform/lib/auth.js` | Código | Usuarios, `scrypt`, sesiones, roles |
| `Proyecto/platform/lib/db.js` | Código | Lectura y escritura de `data/*.json`, estados, historial |
| `Proyecto/platform/lib/indicadores.js` | Código | Filtros y ejecución de los KPI |
| `Proyecto/platform/lib/pdf.js` | Código | HTML del documento y render a PDF |
| `Proyecto/platform/config/index.js` | Código | Descubrimiento de formatos y carga de esquemas |
| `Proyecto/platform/config/formatos/` | Configuración | Punto de montaje de los formatos (vacío en el repositorio) |
| `Proyecto/platform/seed.js` | Script | Crea las dos cuentas demo |
| `Proyecto/platform/seed-datos.js` | Script | Crea 26 registros demo |
| `Proyecto/platform/package.json` | Configuración | Dependencias y scripts |
| `Proyecto/platform/public/index.html` | Frontend | Estructura de la interfaz |
| `Proyecto/platform/public/css/app.css` | Frontend | Estilos y diseño adaptable |
| `Proyecto/platform/public/js/app.js` | Frontend | Controlador de la SPA |
| `Proyecto/platform/public/js/form.js` | Frontend | Construcción del formulario dinámico |
| `Proyecto/platform/public/js/validacion.js` | Frontend | Motor de validación |
| `Proyecto/platform/public/js/util.js` | Frontend | Utilidades compartidas |
| `Proyecto/formatos/<id>/esquema.js` | Configuración | Estructura y reglas de cada formato |
| `Proyecto/formatos/<id>/indicadores.js` | Configuración | KPIs de cada formato |
| `Proyecto/Documentacion/*.md` | Documentación | Alcance, arquitectura, formatos, pruebas, datos |
| `Proyecto/Diagramas/*.mmd` | Documentación | Diagramas PlantUML |
| `tests/unit/*.test.js` | Pruebas | 41 pruebas unitarias y de integración |
| `tests/unit/helpers/entorno.js` | Pruebas | Carga del frontend en Node |
| `tests/e2e/validacion.e2e.js` | Pruebas | Recorrido completo con Puppeteer |
| `tests/documentacion/*.md` | Documentación | Estrategia de pruebas y validaciones |

### 26.7 Anexo B — Matriz de roles resumida

| Capacidad | Coordinador | SISO | Público |
|-----------|--------------|------|---------|
| Login, logout y perfil | Sí | Sí | Login |
| Ver catálogo y esquemas | Sí | Sí | Sí |
| Crear y editar registros | Sí | Sí (propios) | No |
| Ver registros | Todos | Propios | No |
| Eliminar registros | Sí | No | No |
| Aprobar, cancelar o readmitir | Sí | No | No |
| Generar PDF | Sí | Solo propios | No |
| Indicadores y exportación de KPI | Sí | No | No |
| Exportar CSV de registros | Sí | Sí (visibles) | No |
| Gestión de usuarios | Sí | No | No |

### 26.8 Anexo C — Comandos de un vistazo

```bash
# Instalación
cd Proyecto/platform && npm install

# Datos de demostración (2 usuarios, 26 registros)
npm run seed

# Servidor
npm start                     # http://localhost:3200

# Puerto alternativo (Windows)
set PORT=3300 && npm start

# Pruebas unitarias y de integración (desde la raíz del repositorio)
node --test "tests/unit/*.test.js"

# Prueba E2E (con el servidor activo, en otra terminal)
node tests/e2e/validacion.e2e.js

# Verificar la versión de Node
node -v                       # debe ser 18 o superior
```

### 26.9 Anexo D — Notas de la revisión 2.0

| Cambio | Detalle |
|--------|---------|
| Estructura | Se reorganizó el documento en 27 secciones numeradas con índice navegable |
| Marcadores de implementación | Cada requisito se clasifica como `(IMPL)` o `(PLAN)` |
| Pruebas | Se documentaron las 41 pruebas existentes y los 22 casos manuales propuestos |
| Correcciones de la versión anterior | Se corrigieron el conteo de indicadores (36: 28 base + 8 con sufijo), el identificador real `#btn-nav-usuarios` y la respuesta real de `GET /api/auth/me`, que sí incluye el token |
| Hallazgos nuevos | Se documentaron 15 ítems de deuda técnica, entre ellos el comando de pruebas que falla en Node ≥ 22, el `id` duplicado `btn-indicadores` y la llamada a `UI.agregar` no definida |
| Auth y PDF | Se aclaró que `/api/auth/me` devuelve `{ usuario, token }` y que la ruta del navegador es fija en `lib/pdf.js`, sin soporte de variable de entorno |
| Validación en el servidor | Se marcó como pendiente (DT-03): el servidor valida tipo y rol, no el esquema del formato |

---

*Fin del documento. Versión 2.0.*

