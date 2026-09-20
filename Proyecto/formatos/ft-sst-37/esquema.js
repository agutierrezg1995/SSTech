/*
 * Esquema FT-SST-37 — Análisis de Trabajo Seguro (ATS)
 */
module.exports = {
  id: 'ft-sst-37',
  codigo: 'FT-SST-37',
  nombre: 'Análisis de Trabajo Seguro (ATS)',
  fecha: 'ago-22',
  version: '06',
  color: '#7a1d5c',
  icono: '🔬',
  listado: [
    { key: 'trabajo', label: 'Trabajo a ejecutar' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'fecha', label: 'Fecha y hora', tipo: 'fecha' },
    { key: 'estado', label: 'Estado' }
  ],
  secciones: [
    {
      titulo: 'IDENTIFICACIÓN',
      campos: [
        { type: 'text', key: 'trabajo', label: 'Trabajo a ejecutar' },
        { type: 'text', key: 'sitio', label: 'Área o sitio donde se ejecuta el trabajo' },
        { type: 'text', key: 'cliente', label: 'Cliente' },
        { type: 'text', key: 'ciudad', label: 'Ciudad' },
        { type: 'text', key: 'fecha', label: 'Fecha y hora' }
      ]
    },
    {
      titulo: 'SEÑALE EL TRABAJO DE ALTO RIESGO A REALIZAR (X)',
      tareas: {
        key: 'tareasAr',
        opciones: [
          { n: 1, nombre: 'Izaje de cargas', corto: 'IZAJE' },
          { n: 2, nombre: 'Trabajo en Caliente', corto: 'CALIENTE' },
          { n: 3, nombre: 'Excavaciones', corto: 'EXCAV' },
          { n: 4, nombre: 'Ingreso espacios confinados', corto: 'CONFINADOS' },
          { n: 5, nombre: 'Trabajo en Alturas', corto: 'ALTURAS' },
          { n: 6, nombre: 'Trabajo con energías peligrosas', corto: 'ENERGÍAS' },
          { n: 7, nombre: 'Trabajos sobre Red de frio/ Amoniaco', corto: 'RED FRÍO' }
        ]
      }
    },
    {
      titulo: 'DESCRIBA EL TRABAJO A REALIZAR: PASO A PASO',
      tabla: {
        key: 'pasos',
        min: 3,
        columnas: [
          { key: 'paso', label: 'Pasos de la tarea' },
          { key: 'peligros', label: 'Peligros (marque n° y/o adicione)' },
          { key: 'efectos', label: 'Efectos / consecuencias' },
          { key: 'medidas', label: 'Medidas de intervención y de control' }
        ]
      }
    },
    {
      titulo: 'PELIGROS IDENTIFICADOS (RESALTAR Y SOCIALIZAR)',
      campos: [
        { type: 'textarea', key: 'peligrosIdentificados', label: 'Lista de peligros identificados para la tarea' }
      ]
    },
    {
      titulo: 'EQUIPO DE PROTECCIÓN PERSONAL EXIGIDO / RECOMENDADO',
      campos: [
        { type: 'checkbox', key: 'epp_casco', label: 'Casco' },
        { type: 'checkbox', key: 'epp_barbuquejo', label: 'Casco con barbuquejo' },
        { type: 'checkbox', key: 'epp_gafas', label: 'Gafas de seguridad' },
        { type: 'checkbox', key: 'epp_monogafas', label: 'Monogafas' },
        { type: 'checkbox', key: 'epp_guantes_vaqueta', label: 'Guantes de Vaqueta' },
        { type: 'checkbox', key: 'epp_guantes_nitrilo', label: 'Guantes de Nitrilo' },
        { type: 'checkbox', key: 'epp_guantes_dielectricos', label: 'Guantes dieléctricos' },
        { type: 'checkbox', key: 'epp_delantal', label: 'Delantal' },
        { type: 'checkbox', key: 'epp_mascara_completa', label: 'Máscara completa' },
        { type: 'checkbox', key: 'epp_mascara_filtro', label: 'Máscara con filtro' },
        { type: 'checkbox', key: 'epp_mascarilla', label: 'Mascarilla desechable' },
        { type: 'checkbox', key: 'epp_careta', label: 'Careta' },
        { type: 'checkbox', key: 'epp_polainas', label: 'Polainas y cofia' },
        { type: 'checkbox', key: 'epp_botas', label: 'Botas con puntera' },
        { type: 'checkbox', key: 'epp_gorro', label: 'Gorro para soldador' },
        { type: 'checkbox', key: 'epp_visor', label: 'Visor' },
        { type: 'checkbox', key: 'epp_arnes', label: 'Arnés cuerpo completo' },
        { type: 'checkbox', key: 'epp_eslinga_con', label: 'Eslinga Y con absorbedor' },
        { type: 'checkbox', key: 'epp_eslinga_sin', label: 'Eslinga Y sin absorbedor' },
        { type: 'checkbox', key: 'epp_eslinga_pos', label: 'Eslinga posicionamiento' }
      ]
    },
    {
      titulo: 'EQUIPO DE TRABAJO',
      tabla: {
        key: 'equipo',
        min: 5,
        columnas: [
          { key: 'nombre', label: 'Nombre y apellido' },
          { key: 'cedula', label: 'Número de cédula' },
          { key: 'firma', label: 'Firma' }
        ]
      }
    },
    {
      titulo: 'FIRMAS',
      campos: [
        { type: 'textarea', key: 'realizadoPor', label: 'REALIZADO POR' },
        { type: 'textarea', key: 'aprobadoPor', label: 'APROBADO POR' }
      ]
    }
  ]
};