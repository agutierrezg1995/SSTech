# Diagramas — SSTech SaaS

Carpeta de diagramas arquitectónicos y funcionales de la plataforma (formato **Mermaid**).

## Archivos

| Archivo | Contenido |
|---------|-----------|
| `1-casos-de-uso.mmd` | Casos de uso con actores Coordinador SST y SISO. |
| `2-arquitectura.mmd` | Arquitectura de componentes (frontend, backend, PDF, datos). |
| `3-secuencia-pdf.mmd` | Secuencia: crear registro → generar y ver PDF. |
| `4-modelo-datos.mmd` | Modelo entidad-relación (fase JSON → relacional). |
| `5-roles.mmd` | Roles y permisos + regla de negocio del estado. |
| `ver-diagramas.html` | **Vista previa en navegador** (renderiza todos con Mermaid.js). |

## Cómo verlos

1. Abrir `ver-diagramas.html` en cualquier navegador (necesita conexión a Internet para
   cargar Mermaid.js desde CDN). Pestañas para elegir cada diagrama.
2. Alternativa: copiar el contenido de cada `.mmd` en el editor online **mermaid.live**.

## Cómo exportarlos a imagen/PDF

En `ver-diagramas.html`:
- Ctrl+P → imprimir → guardar como PDF (con el diagrama seleccionado).

O desde **mermaid.live**: pegar el `.mmd` y usar "Download as PNG/SVG".

---
Proyecto: Formulación de Proyectos de Ingeniería — SSTech SaaS © 2026