# STACK TECNOLÓGICO — SSTech SaaS

## 1. Resumen

SSTech SaaS es una aplicación web **SPA (Single Page Application)** servida por un backend Node.js
con API REST. Se eligió un modelo _schema-driven_: cada formato se describe como un esquema JSON y el
motor (frontend y PDF) lo interpreta; agregar un formato no requiere modificar el núcleo.

## 2. Capa Presentación (Frontend)

| Tecnología | Uso |
|------------|-----|
| **HTML5 + CSS3** | Estructura y estilos (diseño propio, sin framework). |
| **JavaScript ES6+ (vanilla)** | SPA, interacción, render dinámico, llamadas `fetch`. |
| **Vite (opcional en el futuro)** | Bundler/dev-server si se escala. Hoy no se usa bundler. |

**Archivos:**
- `public/index.html` — layout principal (sidebar + tabla + modales).
- `public/css/app.css` — tema visual, grid, modales, estados.
- `public/js/util.js` — helpers (esc, tipos, fechas, estadoPermiso).
- `public/js/form.js` — render del formulario dinámico desde el esquema.
- `public/js/app.js` — controlador de la SPA (nav, CRUD, PDF, CSV, indicadores).

## 3. Capa Servidor (Backend)

| Tecnología | Uso |
|------------|-----|
| **Node.js ≥ 18** | Runtime. (Probado con Node 24.15.0). |
| **Express 4.x** | Servidor HTTP + API REST + estáticos. |
| **express.json** | Parser JSON (límite 10 MB). |

**Archivos:**
- `server.js` — arranque, rutas API, estáticos (`/` y `/pdfs`).
- `config/index.js` — índice de formatos disponibles.
- `config/formatos/*.js` — esquemas de los 7 formatos.
- `lib/db.js` — capa de persistencia (JSON) + trazabilidad.
- `lib/pdf.js` — motor de generación de PDF (Puppeteer).

## 4. Generación de PDF

| Tecnología | Uso |
|------------|-----|
| **Puppeteer-core 23.x** | Render del HTML del permiso a PDF (A4) usando Chrome del sistema. |

**Características:**
- No descarga Chromium: usa el Chrome instalado (o `CHROME_PATH`/fallback a Edge).
- `htmlPdf(esquema, data, registro)` → genera HTML; `generarPdf(...)` → lo imprime a `pdfs/`.
- El HTML producido replica: encabezado corporativo, código/versión del formato, secciones en orden,
  tablas, checklists y firma del emisor.

## 5. Persistencia

| Tecnología | Uso |
|------------|-----|
| **Archivos JSON** | Almacén por formato: `data/<id-formato>.json`. |

**Forma de cada registro:**
```json
{
  "id": "uuid",
  "data": { "...campos del esquema..." },
  "estado": "BORRADOR | CONCEDIDO | NO CONCEDIDO | CANCELADO",
  "fechaCreacion": "ISO-8601",
  "fechaActualizacion": "ISO-8601",
  "historial": [
    { "fecha": "...", "accion": "CREADO|ACTUALIZADO|ESTADO: X|ELIMINADO", "usuario": "...", "detalle": "..." }
  ]
}
```

**Migración futura:** el modelo es trasladable 1:1 a SQLite/Postgres (una tabla `registro`
con datos JSON + tabla `historial` en relación 1:N).

## 6. Diagrama del stack

```
┌─────────────────────────────────────────────┐
│             Navegador (cliente)             │
│  public/ (HTML + CSS + JS vanilla SPA)      │
└──────────────┬──────────────────────────────┘
               │ HTTP (JSON)   /   /pdfs
┌──────────────▼──────────────────────────────┐
│                Node.js + Express            │
│  server.js  ·  config/  ·  lib/db.js        │
└──────────────┬──────────────────────────────┘
               │
        ┌──────▼──────┐        ┌───────────────┐
        │ data/*.json │        │  Puppeteer    │
        │ (persist.)  │        │  → Chrome     │
        └─────────────┘        └───────┬───────┘
                                       ▼
                                 pdfs/*.pdf
```

## 7. Versiones probadas

- Node.js: 24.15.0 (LTS recomendable 18/20+)
- npm: 11.12.1
- Express: ^4.19.2
- puppeteer-core: ^23.0.0
- Chrome: `C:\Program Files\Google\Chrome\Application\chrome.exe` (en desarrollo)

## 8. Comandos

```bash
npm install        # una sola vez
npm start          # arranca servidor en http://localhost:3200
```

## 9. Decisiones técnicas clave (ADR 1-4)

**ADR-1 — No usar base de datos relacional en fase 1.** Para reducir fricción académica y despliegue,
se usan archivos JSON. Se define ya un contrato de datos migrable.

**ADR-2 — PDF generado en servidor (Puppeteer) en lugar de impresión del navegador.** Garantiza que el
documento oficial se produzca idéntico en cualquier equipo y quede almacenado en `pdfs/`.

**ADR-3 — Frontend vanilla, sin React.** El alcance (7 formatos, CRUD, indicadores) se cubre con DOM
manipulación directa; menor dependencia y curva de aprendizaje.

**ADR-4 — Esquemas declarativos.** Las reglas de negocio (ESTADO, condicionales `soloSi`, tablas)
viven en los esquemas para centralizar la definición del formato.