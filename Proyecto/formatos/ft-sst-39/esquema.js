/*
 * Esquema FT-SST-39 — Control de Entregas de EPP
 */
module.exports = {
  id: 'ft-sst-39',
  codigo: 'FT-SST-39',
  nombre: 'Control de Entregas de EPP',
  fecha: 'ene-2021',
  version: '01',
  color: '#1d7a6a',
  icono: '🧤',
  listado: [
    { key: 'fechaLote', label: 'Fecha', tipo: 'fecha' },
    { key: 'tipoEntrega', label: 'Tipo de entrega' },
    { key: 'estado', label: 'Estado' }
  ],
  secciones: [
    {
      titulo: 'ENTREGA DE ELEMENTOS DE PROTECCIÓN PERSONAL',
      campos: [
        { type: 'radio', key: 'tipoEntrega', opciones: ['PRIMERA VEZ', 'REPOSICIÓN', 'AMBAS'] },
        { type: 'date', key: 'fechaLote', label: 'Fecha de la entrega / lote' }
      ]
    },
    {
      titulo: 'ELEMENTOS DE PROTECCIÓN PERSONAL ENTREGADOS',
      tabla: {
        key: 'entregas',
        min: 5,
        columnas: [
          { key: 'cedula', label: 'Cédula' },
          { key: 'nombre', label: 'Nombres y apellidos' },
          { key: 'cargo', label: 'Cargo' },
          { key: 'casco', label: 'Casco 11-20-39' },
          { key: 'barbuquejo', label: 'Barbuquejo 11-20-50' },
          { key: 'guanteKleenguard', label: 'Guante Kleenguard G40' },
          { key: 'guanteIngeniero', label: 'Guante Ingeniero 11-20-18' },
          { key: 'guanteCarnaza', label: 'Guante Carnaza 11-20-75' },
          { key: 'gafasClaro', label: 'Gafas lente claro 11-20-10' },
          { key: 'gafasOscuro', label: 'Gafas lente oscuro 11-20-26' },
          { key: 'tapaOidos', label: 'Tapa oídos tapón 11-20-13' },
          { key: 'tapabocas', label: 'Tapabocas blanco 11-20-52' },
          { key: 'delantal', label: 'Delantal carnaza 11-20-4' }
        ]
      }
    }
  ]
};