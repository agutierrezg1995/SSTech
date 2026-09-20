# ARQUITECTURA — SSTech SaaS

## 1. Visión general

Aplicación web de tres capas lógicas (Frontend, API, Datos) ejecutada en un único proceso Node.js.
El diseño es **schema-driven**: los formatos son datos (esquemas JSON) interpretados por dos motores:

1. **Motor de captura** (frontend): transforma el esquema en formularios editables.
2. **Motor de PDF** (backend, Puppeteer): transforma el esquema + datos en documento PDF A4.

```
┌──────────────────┐   HTTP/JSON    ┌───────────────────────────────────────────┐
│  Navegador (SPA) │ ─────────────▶ │  Express server.js                        │
│                  │ ◀───────────── │  ├─ GET  /api/formatos                    │
│  index.html      │                │  ├─ GET  /api/formatos/:id/esquema        │
│  css/app.css     │                │  ├─ GET/POST   /api/formatos/:id          │
│  js/{app,form,   │                │  ├─ GET/PUT/DELETE /api/formatos/:id/:rid │
│  util}.js        │                │  ├─ PATCH /api/formatos/:id/:rid/estado   │
│                  │                │  ├─ POST   /api/formatos/:id/:rid/pdf     │
│  iframe 📄 PDF    │  /pdfs/...     │  └─ GET /pdfs/<archivo> (estático)       │
└──────────────────┘ ─────────────▶ └──────┬────────────────────────────────────┘
                                           │
                          ┌────────────────┴───────────────────┐
                          │ config/formatos/*.js (esquemas)    │
                          │ lib/db.js        lib/pdf.js         │
                          │ data/*.json      pdfs/*.pdf         │
                          └─────────────────────────────────────┘
```

## 2. Componentes

### 2.1. Frontend (SPA)
- **Sidebar**: lista los formatos (código, nombre, versión) → navegación de pestañas.
- **Tabla CRUD**: registros del formato con columnas del `listado[x]`, estado y fecha.
- **Modales**: formulario (`renderForm`) y visor de PDF (iframe).
- **Indicadores**: tarjeta de KPIs por formato (calculados sobre `App.registros`).
- **Estado en vivo**: `estadoPermiso(data)` marca NO CONCEDIDO al detectar un NO.

### 2.2. API REST (server.js)
Todas las rutas negocian JSON. Convenciones:
- Colección de registros: `/api/formatos/:formatoId`
- Registro individual:  idem + `/:rid`
- PDF: idem + `/pdf` (POST)
- Esquemas: `/esquema` (GET)

### 2.3. Capa de persistencia (lib/db.js)
- **patrón de repositorio**: `listar`, `obtener`, `crear`, `actualizar`, `cambiarEstado`, `eliminar`.
- Un archivo JSON por formato → concurrencia simple con Operación atómica (escribe archivo completo).
- **Trazabilidad**: cada operación muta `historial` del registro.

### 2.4. Motor de PDF (lib/pdf.js)
- `htmlPdf(esquema, data, registro)` → string HTML.
- `generarPdf(esquema, data, registroId)` → guarda PDF y devuelve `{filename, url}`.
- Resolución de Chrome: `CHROME_PATH` → ruta Windows → Edge; flag `--no-sandbox` en proceso.

## 3. Modelo de datos (persistencia)

### 3.1. Registro
```json
{
  "id": "uuid",
  "data": { ... },
  "estado": "BORRADOR",
  "fechaCreacion": "2026-09-20T10:00:00.000Z",
  "fechaActualizacion": "2026-09-20T10:00:00.000Z",
  "historial": []
}
```

### 3.2. Esquema de formato (`config/formatos/*.js`)
```js
module.exports = {
  id: 'ft-ope-06',
  codigo: 'FT-OPE-06',
  nombre: 'Permiso de Trabajo en Campo',
  fecha: 'mar-2023',
  version: '07',
  color: '#0f2a43',
  icono: '🦺',
  listado: [ {key,label,tipo} ],           // columnas de la tabla CRUD
  secciones: [
    { titulo, campos: [ {type,key,label,opciones} ] },
    { titulo, tabla:  { key, min, columnas:[{key,label,tipo}] } },
    { titulo, tareas: { key, opciones:[{n,nombre,corto}] } },
    { titulo, checklists: { grupos: { g:{ titulo, soloSi, items } } } }
  ]
};
```

**Tipos de campos soportados** en `campos`: `text`, `textarea`, `number`, `date`, `time`, `radio`,
`checkbox`, `select`. Tipos de sección: `campos`, `tabla`, `tareas`, `checklists`.

**Regla `soloSi`**: un grupo de checklist solo se muestra si la tarea `n` está marcada `SI`
(p. ej. FT-OPE-06: grupo `izaje` soloSi 1).

## 4. Diagrama de secuencia (crear + PDF)

```
SISO                    Frontend              Server                lib/pdf      data/*.json
  │  Nuevo registro        │                    │                      │             │
  │───────────────────────▶│ iniciadoData()     │                      │             │
  │  Diligenciar           │  renderForm()       │                      │             │
  │  (respuestas SI/NO)    │  estadoPermiso()──▶│                      │             │
  │  Guardar               │  POST /registros    │──db.crear()────────>│────▶        │
  │                        │                    │◀──201 {registro}────│             │
  │  Generar PDF           │  POST /:rid/pdf     │──generarPdf()───────▶             │
  │                        │                    │  Chrome render ⋯                     │
  │                        │◀──{url:/pdfs/..}───│◀─{filename,url}───  │              │
  │  Ver PDF (iframe)      │  GET /pdfs/...     │  (estático)          │             │
```

## 5. Diseño para escala (roadmap)

| Fase | Cambio |
|------|--------|
| F1 actual | JSON files + API REST + Puppeteer (SPA vanilla). |
| F2 | Autenticación real (JWT) + roles persistidos. |
| F3 | Migrar `data/*.json` → SQLite o PostgreSQL (modelo relacional). |
| F4 | Colas para generación de PDF asíncrona (puppeteer pool). |
| F5 | Multi-tenant + auditoría con índices (aplicación log). |

## 6. Restricciones y decisiones (aspectos no negociables)

- Los PDF deben ser **fieles al formato físico** (fuente de verdad = PDF `Formatos/`).
- El historial es **inmutable por diseño** (solo append).
- Los esquemas son el **contrato**: si se cambia un formato, se versiona el esquema.
- La regla de negocio de estado es **automática y luego confirmada por el Coordinador**.

## 7. Referencias

- Diagrama de arquitectura: `../Diagramas/2-arquitectura.mmd`
- Diagrama de secuencia: `../Diagramas/3-secuencia-pdf.mmd`
- Modelo de datos: `../Diagramas/4-modelo-datos.mmd`
- Diagrama de roles: `../Diagramas/5-roles.mmd`