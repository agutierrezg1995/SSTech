# Estrategias para la Digitalización de Formatos SST en una Plataforma Web

**Plataforma:** SSTech SaaS
**Caso base analizado:** FT-OPE-06 Permiso de Trabajo en Campo v07 (y formatos análogos: FT-OPE-51, FT-OPE-56, FT-SST-08, FT-SST-11, FT-SST-37, FT-SST-39)

---

## 1. Objetivo

Convertir los formatos en PDF (hoy impresos y diligenciados a mano) en **formularios HTML digitales** que permitan:

1. **Capturar datos** de forma estructurada y validada (nada de tachones ni enmendaduras, cumpliendo la regla del "NO" del permiso).
2. **Renderizar / generar** un documento final que se vea **exactamente igual al PDF oficial** (con la imagen corporativa, tablas y firmas) para firma, archivo y trazabilidad.
3. Centralizar todo en una plataforma web (SaaS multiempresa) con historial, seguimiento y controles (COPASST, brigadistas, auditores).

---

## 2. Resultado de conversión PDF → HTML

La estructura del FT-OPE-06 se descompone en **bloques funcionales reutilizables**:

| # | Bloque | Contenido principal | Tipo de campo |
|---|--------|---------------------|---------------|
| 1 | Encabezado | Código, fecha, versión del formato | Fijo (logo) |
| 2 | Instrucciones | Reglas de diligenciamiento | Texto fijo |
| 3 | Localización de la actividad | Planta / Parque Industrial / Punto de Venta / Granja / Otro + "Cuál" | Radio + texto |
| 4 | Datos generales | Lugar específico, solicitante, responsable del área, empresa ejecutora, responsable del equipo, descripción del trabajo | Texto / textarea |
| 5 | Ejecutantes (tabla dinámica) | Nombres, C.C., Afiliación SS, Aptitud médica, Certificación/entrenamiento (SI/NO) — filas 1 a 10 (hasta 30) | Tabla repetible |
| 6 | Datos de vigencia | Fecha diligenciamiento, hora inicio/fin | Fecha + hora |
| 7 | Definición de tareas | 6 tipos de permisos (Izaje, Trabajo en Caliente, Armado/Montaje, Espacios Confinados, Energías Peligrosas, Red de frío/NH3) con SI / N/A | Checkbox condicional |
| 8 | Medidas preventivas / EPP | Lista de EPP exigidos/recomendados | Checkbox |
| 9 | Mediciones atmosféricas | %Comb, %Prop, NH3 ppm, H2S ppm, %O2, CO ppm | Numérico |
| 10 | Herramientas y requisitos | Herramientas a utilizar, requisitos adicionales de seguridad | Texto |
| 11 | Autorización | Firmas: Emisor (código), Representante del cliente, Responsable del equipo ejecutante, Ejecutantes (1-10) | Firma digital/PDF |
| 12 | Revalidación / Cancelación | Fechas, horas, motivos, firmas | Texto + firma |
| 13 | Satisfacción del trabajo | Trabajo terminado (SI/NO), lugar limpio, etiquetas retiradas, fecha, firmas | Radio + firma |
| 14 | Seguimiento a la ejecución | Nombres, hora, observaciones | Tabla repetible |
| 15 | Listas de verificación | 65 ítems agrupados por tipo de tarea (General 1-20, Izaje 1-21, Caliente 22-35, Confinados 36-51, Energías 52-65), con SI/NO/NA | Tabla condicional |

---

## 3. Estrategias principales (comparadas)

### Opción A — Formulario nativo + CSS de impresión (100% Frontend)
Construir el formulario con HTML/CSS/JS y usar **`@media print`** para que el navegador genere el PDF exacto (Ctrl+P → "Guardar como PDF").

**Ventajas:** Cero dependencias externas, el HTML *es* el PDF (misma tipografía, separadores de página A4).
**Desventajas:** El control del PDF queda en el navegador del usuario; difícil automatizar en el servidor.

### Opción B — Formulario + generación de PDF en el backend (recomendada)
Captura en HTML y el backend **construye el PDF byte a byte** (o renderiza un template HTML a PDF) con la plantilla exacta del formato.

- B1. **HTML → PDF con motor headless** (Puppeteer/Playwright en Node, PrinceXML, wkhtmltopdf, WeasyPrint en Python): Tienes un template HTML con CSS A4 y el motor lo rasteriza en el servidor. **Es el que mejor replica el PDF original**.
- B2. **Bibliotecas de generación directa** (pdfmake, jsPDF, JasperReports): construyen el PDF desde objetos JSON. Mayor control de posiciones, pero es más trabajo reproducir tablas complejas como las listas de verificación.

### Opción C — Formulario + HTML relé (híbrida) 
Capturar los datos, renderizar una **vista de "canon"** (previsualización del formulario diligenciado en HTML idéntico al PDF) y luego exportar con B1/B2. El usuario edita y **firma en la vista previa**, luego se genera el PDF final.

### Opción D — Digitalize con facturación/documentos dinámicos
Usar un motor de plantillas documentales (ej. **Docxtemplater** sobre un Word replicado del formato, luego convertir a PDF con LibreOffice/Aspose). Menos control tipográfico; se desaconseja salvo que ya existan plantillas Word.

---

## 4. Comparativa de herramientas de generación PDF

| Herramienta | Enfoque | Fidelidad al PDF original | Complejidad | Observaciones |
|-------------|---------|---------------------------|-------------|---------------|
| **CSS `@media print`** (nativo) | Frontend | Alta (control manual de saltos de página) | Baja | Depende del navegador; ideal para vistas de impresión |
| **html2pdf.js / html2canvas** | Frontend | Media (rasteriza píxeles) | Baja | Texto no seleccionable; peso de archivo mayor |
| **Puppeteer / Playwright** | Backend (Node) | **Alta** | Media | Chrome headless; fidelidad casi perfecta; PDF real con texto |
| **PrinceXML / WeasyPrint** | Backend | Alta (muy buena para CSS paginado) | Media | CSS `@page`, contadores, `page-break`; licencias (Prince es comercial) |
| **pdfmake / jsPDF** | Backend/Mobile | Media-Alta (posicionamiento preciso) | Alta | Buen control de layout por coordenadas |
| **wkhtmltopdf** | Backend | Media-Alta | Media | WebKit viejo; menos mantenido |

**Recomendación:** Backend con **Puppeteer/Playwright** (Node) o **WeasyPrint** (Python), combinado con un CSS de impresión A4 cuidadoso. Para el frontend de captura, un formulario React/Vue/Angular (ver §6).

---

## 5. Apuesta recomendada (estrategia híbrida)

```
┌────────────────────── FRONTEND (formulario de captura) ──────────────────────┐
│  1. Renderizar el formato como <form> dinámico desde un ESQUEMA JSON.        │
│  2. Validación en tiempo real (flujo "SI/NO/NA", regla: un NO → NO concedido).│
│  3. Bloqueos condicionales (se muestran las tablas de solo los permisos       │
│     marcados en "Definición de tareas").                                      │
│  4. Vista previa "canon": se renderiza el formato diligenciado (igual al PDF).│
│  5. Captura de firmas (pad de firma canvas o firma con certificado).          │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                ▼
┌────────────────────── BACKEND / API ─────────────────────────────────────────┐
│  • Guarda el JSON estructurado (base de datos + histórico).                   │
│  • Genera el PDF oficial con Puppeteer (template HTML = formato original).    │
│  • Sella con fecha/hora y metadatos (si aplica, firma electrónica).           │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                ▼
           PDF final idéntico al impreso + versión digital firmada
```

---

## 6. Stack tecnológico sugerido

- **Frontend:** React + TypeScript (o Next.js). Formularios dinámicos guiados por **JSON Schema** (cada formato = un esquema). Bibliotecas: Formik + Yup, o React Hook Form.
- **Estilos/PDF:** CSS de impresión A4 (`@page { size: A4; margin: 0 }`), TailwindCSS con breakpoints de papel.
- **Backend:** Node.js (NestJS/Express) o Python (FastAPI/Django). 
- **Generación de PDF:** Puppeteer (última versión con headless estable) o WeasyPrint.
- **BD:** PostgreSQL (temas estructurados por formato) + almacenamiento de PDFs (S3/MinIO/S3-compatible).
- **Firmas:** Firma manuscrita en canvas (alta enuaciado del permiso), estampado de tiempo del servidor; opcionalmente firma electrónica avanzada (firma digital con certificado) para validez legal.
- **Autenticación:** JWT / OAuth. **Multiempresa:** esquema por tenant (columna `company_id` o BD por cliente).

---

## 7. Diseño del esquema de datos (ejemplo FT-OPE-06)

Cada formato se guarda como un documento de tipo `format` + `data` (JSON). Ejemplo simplificado:

```json
{
  "formCode": "FT-OPE-06",
  "version": "07",
  "issuedAt": "2026-09-20T10:30:00",
  "localization": {
    "placeType": "PLANTA",
    "other": null,
    "specificPlace": "Bodega 2 - Nivel 1"
  },
  "requesters": {
    "solicitante": "Andrés Pérez",
    "responsableArea": "María García",
    "empresaEjecutora": "SSTech Servicios S.A.S.",
    "responsableEquipo": "Luis Ramírez",
    "jobDescription": "Mantenimiento preventivo de banda transportadora"
  },
  "executants": [
    { "name": "Carlos Gómez", "idCard": "1001234567",
      "socialSecurity": "SI", "medicalFitness": "SI", "training": "SI" }
  ],
  "validity": { "date": "2026-09-20", "startTime": "08:00", "endTime": "16:00" },
  "tasks": {
    "izajeCargas": { "status": "SI" },
    "trabajoCaliente": { "status": "N/A" },
    "armadoMontaje": { "status": "NA" },
    "espaciosConfinados": { "status": "N/A" }
  },
  "epp": ["CASCO", "GAFAS_SEGURIDAD", "GUANTES_NITRILO"],
  "atmosphericMeasurements": { "comb": 0.5, "prop": 0.0, "ammoniaPpm": null, "h2sPpm": null, "oxygenPct": 20.9, "coPpm": 5 },
  "authorizations": { "emisor": { "name": "", "id": "" }, "signatures": [] },
  "verification": { "general": [{ "item": 1, "answer": "SI" }], "hotWork": [] },
  "status": "CONCEDIDO" | "NEGADO" | "CANCELADO"
}
```

### Reglas de negocio a implementar (clave para SST)
- **Regla de oro:** si en cualquier checklist o campo obligatorio hay un **`NO`**, el permiso se marca como **NO CONCEDIDO** y se impide la autorización.
- Al cambiar ejecutantes durante la vigencia ⇒ exigir **nuevo permiso** (según el texto de Revalidación/Cancelación).
- Los bloques de listas de verificación solo se generan para los permisos marcados (ej. "Izaje de cargas" ⇒ ítems 1-21 de la sección correspondiente).
- Límite de 10 ejecutantes normales; si hay más, la hoja ampliada 11-30.
- Los **campos obligatorios** vacíos se marcan en rojo y bloquean el envío (reemplaza la regla física de "no espacios en blanco").

---

## 8. Hoja de ruta (fases)

1. **Fase 1 — Plantilla del formato en HTML** (1 formato piloto: FT-OPE-06).
   - Replicar maquetación exacta (tablas, celdas, firmas) con CSS A4.
   - Mapa campo→JSON y render de la vista "canon" (form diligenciado).
2. **Fase 2 — Motor de PDF.**
   - Integrar Puppeteer/WeasyPrint; generar el PDF y comparar visualmente con el original (fit por pixel, pruebas de paginación).
3. **Fase 3 — Lógica de negocio.** Validaciones SI/NO/NA, condicionalidad de bloques, regla del "NO", ejecutantes dinámicos.
4. **Fase 4 — Firma y trazabilidad.** Pad de firmas, estampado de tiempo, historial de versiones, permisos por rol (emisor vs ejecutante vs representante del cliente).
5. **Fase 5 — Abstracción multi-formato.** Definir un **formato de definición JSON** para que otros formatos (FT-OPE-51, FT-SST-37 ATS, FT-SST-39 EPP, etc.) se carguen sin reescribir el motor.
6. **Fase 6 — Productivo.** Login, tenant, auditoría, notificaciones, reportes y firma electrónica avanzada (opcional según requisitos legales).

---

## 9. Consideraciones de diseño del render

- Usar **píxeles exactos en CSS** (proporciones A4 210×297 mm) y `@media print` para hacer saltos controlados (`break-inside: avoid` en tablas).
- Mantener **una sola fuente de verdad** (JSON guardado) y el HTML de salida solo transforma datos → no guardar HTML editado.
- Accesibilidad: etiquetas `<label>`, navegación por teclado, contraste correcto (importante en auditorías de SST).
- Internacionalización del texto del permiso en español por defecto.
- Seguridad: los permisos pueden contener datos personales (C.C.); cifrar en reposo, roles con niveles de acceso y bitácora de auditoría.

---

## 10. Conclusión

Sí, es completamente viable. La mejor relación **fidelidad/costo** es:

> **Frontend de captura (React + esquema JSON) → validación con reglas de negocio → generación de PDF desatendida con Puppeteer o WeasyPrint → almacenamiento estructurado + PDF firmado.**

Este enfoque además es **escalable a los demás formatos** (ATS, permisos de alturas, EPP, investigación de A.T/I.T, etc.) porque cada formato se define como un esquema JSON reutilizable sobre el mismo motor de render y PDF.