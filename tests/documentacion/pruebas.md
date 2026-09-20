# Guía de pruebas — SSTech SaaS

## 1. Pruebas unitarias (Node)

Cubren el motor de validación y las utilidades puras, sin navegador.

```bash
# desde la raíz del proyecto (carpeta SSTech Saas)
node --test tests/unit/
```

- `tests/unit/validacion.test.js` — cobertura de configuración por formato, campos
  obligatorios, autofecha/bloqueo de futuro, tablas, tareas y checklists (incl. `soloSi`),
  reglas numéricas e integración de formulario completo.
- `tests/unit/util.test.js` — `getByPath`/`setByPath`, `inicialData` y `estadoPermiso`.
- `tests/unit/helpers/entorno.js` — carga `public/js/util.js` + `public/js/validacion.js`
  dentro de Node con stubs mínimos de navegador (`localStorage`, `document`, `fetch`).

Requiere **Node 18+** (usa el runner `node:test`). No requiere npm install ni servidor.

## 2. Pruebas end-to-end (navegador real)

Verifica el flujo completo (login + formulario + validación visual) con **puppeteer-core**
(ya instalado en `Proyecto/platform/node_modules`). Requiere el servidor activo:

```bash
# terminal 1 — servidor
cd Proyecto/platform && npm start

# terminal 2 — pruebas
node tests/e2e/validacion.e2e.js
```

Variables opcionales: `SSTECH_URL`, `SSTECH_EMAIL`, `SSTECH_PASSWORD`.

**Casos cubiertos (10):**
1. Guardar vacío → se bloquea (no crea registro), resalta errores y muestra toast.
2. La fecha de diligenciamiento se autollena con HOY.
3. Llenar datos válidos → guarda correctamente (sin resaltados, toast de éxito).
4. Fecha futura (2099) → bloqueada con error.
5. Tabla dinámica vacía → marcada como error.
6. Editar un campo → limpia su resaltado de error.

## 3. Pruebas manuales

### Cuentas demo
- **Coordinador**: `coordinador@sstech.co` / `coordinador123` (acceso total).
- **SISO**: `siso@sstech.co` / `siso123` (solo módulo de campo).

### Escenarios sugeridos
1. **Login** — credenciales correctas entran; contraseña incorrecta muestra error.
2. **Navegación** — los 7 formatos cargan; "＋ Nuevo registro" abre el modal.
3. **Validación estricta en cada formato**:
   - FT-OPE-06 / FT-OPE-51: intentar guardar vacío → contar errores; completar fecha,
     hora, obligatorios, 1 fila de tabla, tareas y checklist GENERAL → debe guardar.
   - Marcando una tarea como SI, aparece su checklist asociado (grupos `soloSi`) y se
     exige completarlo.
   - FT-SST-11: `días de incapacidad` negativo o texto → error.
   - Tablas (asistencia, participantes, planAccion, pasos/equipo, entregas): menos de una
     fila válida → error; llenar filas requeridas → guarda.
4. **PDF** — con un registro guardado, "📄 Generar PDF" genera/descarga el PDF.
5. **Estados** — al guardar con algún "NO" el estado pasa a `NO CONCEDIDO`;
   si todo es SI/NA pasa a `CONCEDIDO` (auto). Coordinador puede editar estados manualmente.
6. **Historial / trazabilidad** — se registran eventos (fecha, usuario, detalle).
7. **Roles** — el botón "Usuarios" e indicadores solo aparecen para coordinador.

## 4. Comandos útiles

```bash
# todo el paquete unitario
node --test tests/unit/

# solo validación
node --test tests/unit/validacion.test.js

# solo utilidades
node --test tests/unit/util.test.js

# e2e (servidor arriba)
node tests/e2e/validacion.e2e.js
```

## 5. Cobertura verificada en esta sesión

- Motor: 10/10 casos e2e + smoke de los **7 formatos** (vacío → errores sin excepción,
  rutas de configuración válidas, autofechas).
- Funcionalidad base: login, apertura de los 7 "Nuevo registro", guardado, PDF y listado
  de registros.