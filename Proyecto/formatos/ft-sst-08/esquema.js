/*
 * Esquema FT-SST-08 — Control semanal de pausas activas
 */
module.exports = {
  id: 'ft-sst-08',
  codigo: 'FT-SST-08',
  nombre: 'Control semanal de pausas activas',
  fecha: 'ene-22',
  version: '01',
  color: '#8c6a1d',
  icono: '🧘',
  listado: [
    { key: 'mes', label: 'Mes' },
    { key: 'semana', label: 'Semana' },
    { key: 'anio', label: 'Año' },
    { key: 'regional', label: 'Regional' },
    { key: 'estado', label: 'Estado' }
  ],
  secciones: [
    {
      titulo: 'DATOS DEL CONTROL',
      campos: [
        { type: 'text', key: 'mes', label: 'Mes' },
        { type: 'text', key: 'semana', label: 'Semana' },
        { type: 'text', key: 'anio', label: 'Año' },
        { type: 'text', key: 'realiza', label: 'Realiza' },
        { type: 'text', key: 'regional', label: 'Regional' },
        { type: 'text', key: 'revisa', label: 'Revisa' }
      ]
    },
    {
      titulo: 'REGISTRO DE FIRMAS DE PARTICIPANTES EN PAUSAS ACTIVAS',
      tabla: {
        key: 'participantes',
        min: 10,
        columnas: [
          { key: 'nombres', label: 'Nombres' },
          { key: 'cc', label: 'CC' },
          { key: 'dl', label: 'L' },
          { key: 'dm', label: 'M' },
          { key: 'dj', label: 'J' },
          { key: 'dv', label: 'V' },
          { key: 'ds', label: 'S' },
          { key: 'dd', label: 'D' },
          { key: 'firma', label: 'Firma colaborador' }
        ]
      }
    },
    {
      titulo: 'CIERRE',
      campos: [
        { type: 'text', key: 'firmaReviso', label: 'Firma revisó' },
        { type: 'text', key: 'fechaEntrega', label: 'Fecha entrega al SGI' },
        { type: 'text', key: 'firmaRealizo', label: 'Firma realizó' },
        { type: 'textarea', key: 'observaciones', label: 'Observaciones' }
      ]
    }
  ]
};