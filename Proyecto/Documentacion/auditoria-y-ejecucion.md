# AUDITORÍA Y EJECUCIÓN — SSTech SaaS

## 1. Objetivo

Definir **cómo se audita** (trazabilidad e integridad) y **cómo se ejecuta** (roadmap, hitos, riesgos)
la plataforma de digitalización de formatos SST.

---

## 2. AUDITORÍA (Trazabilidad e Integridad)

### 2.1. Principios

1. **Registrar, no borrar.** Toda mutación de un registro se agrega al historial.
2. **Inmutabilidad** del historial: `historial` es append-only (no se modifica ni se reordena).
3. **Atribuibilidad:** cada evento se asocia a `usuario` + `fecha`.
4. **Regla de negocio auditable:** estados automáticos (NO CONCEDIDO) se registran como evento
   `ESTADO: NO CONCEDIDO` con detalle de la causa (respuestas con NO).

### 2.2. Eventos de auditoría

| Evento | Origen | Datos mínimos |
|--------|--------|---------------|
| `CREADO` | alta de registro | usuario, fecha |
| `ACTUALIZADO` | edición de datos | usuario, fecha, `dif` (data / solo estado) |
| `ESTADO: <nuevo>` | cambio de estado (manual o automático) | usuario, fecha |
| `PDF GENERADO` | generación de documento | usuario, fecha, archivo |
| `ELIMINADO` | baja de registro | usuario, fecha (marca en bitácora) |

### 2.3. Controles de integridad

- **Checksum por formato:** opcionalmente `SHA-256` de cada archivo de datos (`data/*.json`) para
  detectar manipulación externa (mejora futura).
- **Validación de esquema:** al guardar se valida que los campos existen en el esquema (whitelist).
- **Versión de formato:** el registro conserva implicitamente la `version` del esquema que lo generó
  (el PDF siempre muestra `esquema.version`).
- **Copias de seguridad:** copia automática de `data/` a `backups/` (cron o script) sugerida.

### 2.4. Auditoría funcional (dashboards)

| Reporte | Qué responde |
|---------|--------------|
| Trazabilidad por registro | ¿Quién cambió qué y cuándo? |
| Bitácora de eventos | Secuencia completa de la plataforma. |
| Matriz cumplimiento SST | Registros con estados, reválidas y caducidades. |

---

## 3. EJECUCIÓN

### 3.1. Fases y entregables (roadmap)

| Fase | Alcance | Entregable | Criterio de salida |
|------|---------|------------|--------------------|
| **F0 — Definición** | Análisis de los 7 PDF, estrategia, SPEC. | `SPEC.md`, `stack.md`, `arquitectura.md`, `ESTRATEGIAS-DIGITALIZACION-FORMATOS.md` | Documentos aprobados. |
| **F1 — Prototipo estático** | FT-OPE-06 en una sola página. | `Proyecto/ft-ope-06/` | Regla SI/NO validada con 3 casos. |
| **F2 — Plataforma base** | Servidor Express + JSON + PDF + SPA (7 formatos). | `Proyecto/platform/` | Los 7 formatos crean registros y PDF. |
| **F3 — Roles y seguridad** | Autenticación (usuarios, hash, sesión), permisos Coordinador/SISO. | Backend auth + UI login | Un SISO no aprueba ni elimina. |
| **F4 — Indicadores** | Tablero de KPIs por formato con filtros de fecha/área. | Dashboard `Indicadores` por pestaña | KP1–KP28 calculados y verificados. |
| **F5 — Base de datos** | Migración JSON → SQLite/PostgreSQL. | Modelo relacional + consultas SQL | Migración sin pérdida de historial. |
| **F6 — QA y despliegue** | Pruebas, documentación, Docker, HTTPS. | Releases, wiki de usuario, stack de prod | Definición de Done cumplida. |

### 3.2. Cronograma estimado (académico)

```
F0  Definición       ▓▓▓▓ (completado)
F1  Prototipo        ▓▓▓▓ (completado)
F2  Plataforma base  ▓▓▓▓▓▓ (mayor parte completada)
F3  Roles/seguridad  ▓▓▓▓▓▓▓▓ (en curso cuando se integra auth)
F4  Indicadores      ▓▓▓▓▓▓
F5  Base de datos    ▓▓▓▓▓▓
F6  QA y despliegue  ▓▓▓▓▓▓  → demo final
```

### 3.3. Equipo y responsabilidades

| Rol de proyecto | Persona ideal | Responsabilidades |
|-----------------|---------------|-------------------|
| Product Owner / Académico | — | Valida alcance y criterios de aceptación. |
| Desarrollador | Uso de asistente IA + revisión manual | Backend, frontend, PDF, esquemas. |
| Profesional SST (SISO) | — | Valida cadencia y fidelidad de los formatos. |
| Coordinador SST | — | Usuario de aprobación, indicadores y seguimiento. |

### 3.4. Matriz de riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| PDF no fiel al físico | Media | Alto | Comparación visual iterativa contra `Formatos/`. |
| Pérdida de datos JSON | Baja | Alto | Backups + migración a BD en F5. |
| Regla NO mal aplicada | Baja | Alto | Tests automatizados con 3+ casos por formato. |
| Alcance demasiado amplio | Media | Medio | Roadmap por fases, DoD claro por fase. |
| Chrome no disponible en despliegue | Baja | Medio | Fallback a Edge y `CHROME_PATH`. |
| Curva de aprendizaje del usuario | Media | Medio | Manual breve + plantillas de ejemplo. |

### 3.5. Plan de pruebas (estrategia)

**Pruebas unitarias (node:test):**
- `lib/db.js`: CRUD + historial inmutabilidad.
- `estadoPermiso`: matriz SI/NO/NA → CONCEDIDO / NO CONCEDIDO.

**Pruebas de integración (supertest):**
- Alta/edición/baja vía API.
- Generación de PDF (verifica existencia del archivo y que se sirva por URL).

**Pruebas E2E (manual / futuro Playwright):**
- Flujo SISO: crear → diligenciar → guardar → PDF.
- Flujo Coordinador: revisar → aprobar → ver indicadores.

**Pruebas de regresión con datos fijos:**
- `data/fixtures/*.json` para cada formato → verificar render del PDF.

---

## 4. INDICADORES DE ÉXITO DEL PROYECTO

1. 100% de los formatos operando (7/7).
2. 0 permisos CONCEDIDOS con alguna respuesta NO (regla automática probada).
3. Trazabilidad completa visible en cada registro.
4. Coordinador logra reportes por indicador en < 1 min.
5. Fidelidad del PDF ≥ 95% frente al físico (revisión por SISO).

---

## 5. Anexo — Checklist de auditoría rápida (buscar en cada sesión)

- [ ] ¿El historial contiene CREACIÓN, al menos un ESTADO y el usuario correcto?
- [ ] ¿Los estados respetan BORRADOR → CONCEDIDO / NO CONCEDIDO / CANCELADO?
- [ ] ¿La respuesta NO bloquea el estado CONCEDIDO?
- [ ] ¿El PDF se regenera con la versión actual del esquema?
- [ ] ¿La pestaña de indicadores refleja los mismos números que la tabla de registros?