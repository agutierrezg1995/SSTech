/*
 * Esquema FT-OPE-56 — Control de asistencia de Operaciones
 */
module.exports = {
  id: 'ft-ope-56',
  codigo: 'FT-OPE-56',
  nombre: 'Control de asistencia de Operaciones',
  fecha: 'jul-2026',
  version: '02',
  color: '#4a7d3a',
  icono: '📋',
  listado: [
    { key: 'fecha', label: 'Fecha', tipo: 'fecha' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'regional', label: 'Regional' },
    { key: 'ot', label: 'OT' },
    { key: 'estado', label: 'Estado' }
  ],
  secciones: [
    {
      titulo: 'INFORMACIÓN GENERAL',
      campos: [
        { type: 'date', key: 'fecha', label: 'Fecha' },
        { type: 'text', key: 'regional', label: 'Regional' },
        { type: 'text', key: 'ot', label: 'OT' },
        { type: 'text', key: 'cliente', label: 'Cliente' }
      ]
    },
    {
      titulo: 'REGISTRO DE ASISTENCIA',
      tabla: {
        key: 'asistencia',
        min: 10,
        columnas: [
          { key: 'nombre', label: 'Nombre' },
          { key: 'cedula', label: 'Cédula' },
          { key: 'cargo', label: 'Cargo' },
          { key: 'horaLlegada', label: 'Hora de llegada' },
          { key: 'firmaLlegada', label: 'Firma' },
          { key: 'horaSalida', label: 'Hora de salida' },
          { key: 'firmaSalida', label: 'Firma' }
        ]
      }
    },
    {
      titulo: 'RESPONSABLE',
      campos: [
        { type: 'text', key: 'responsable', label: 'Responsable' }
      ]
    }
  ]
};