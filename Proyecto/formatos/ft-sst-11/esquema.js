/*
 * Esquema FT-SST-11 — Reporte de Investigación de A.T e I.T
 */
module.exports = {
  id: 'ft-sst-11',
  codigo: 'FT-SST-11',
  nombre: 'Reporte de Investigación de A.T e I.T',
  fecha: 'jun-23',
  version: '04',
  color: '#8c1d1d',
  icono: '📑',
  listado: [
    { key: 'responsable', label: 'Responsable' },
    { key: 'afectado', label: 'Afectado' },
    { key: 'clasificacion', label: 'Clasificación' },
    { key: 'fechaEvento', label: 'Fecha del evento', tipo: 'fecha' },
    { key: 'estado', label: 'Estado' }
  ],
  secciones: [
    {
      titulo: 'INFORMACIÓN GENERAL',
      campos: [
        { type: 'radio', key: 'clasificacion', opciones: ['INCIDENTE', 'ACCIDENTE', 'EMERGENCIA', 'DAÑOS EN PROPIEDAD', 'DAÑOS EN MEDIO AMBIENTE'] },
        { type: 'text', key: 'afectado', label: 'Nombre colaborador o cliente afectado' },
        { type: 'text', key: 'nit', label: 'Cédula o NIT' },
        { type: 'date', key: 'fechaIngreso', label: 'Fecha de ingreso' },
        { type: 'text', key: 'cargo', label: 'Cargo' },
        { type: 'text', key: 'ciudad', label: 'Ciudad del evento' },
        { type: 'number', key: 'diasIncapacidad', label: 'Días de incapacidad o paro de actividades' },
        { type: 'text', key: 'responsable', label: 'Responsable del reporte' },
        { type: 'text', key: 'cargoResponsable', label: 'Cargo responsable' },
        { type: 'date', key: 'fechaReporte', label: 'Fecha del reporte' },
        { type: 'date', key: 'fechaEvento', label: 'Fecha del evento' },
        { type: 'text', key: 'diaSemana', label: 'Día de la semana' },
        { type: 'time', key: 'horaEvento', label: 'Hora del evento' },
        { type: 'text', key: 'turno', label: 'Turno' },
        { type: 'text', key: 'areaProceso', label: 'Área o proceso' },
        { type: 'textarea', key: 'sitioOcurrencia', label: 'Sitio de ocurrencia (especifique el lugar)' },
        { type: 'radio', key: 'impactoPersonas', opciones: ['6 SI', '6 NO'], label: 'Impactó personas' },
        { type: 'radio', key: 'impactoPropiedad', opciones: ['6 SI', '6 NO'], label: 'Impactó propiedad' },
        { type: 'radio', key: 'impactoMedioAmbiente', opciones: ['6 SI', '6 NO'], label: 'Impactó medio ambiente' }
      ]
    },
    {
      titulo: 'CRITERIOS DEL REPORTE',
      campos: [
        { type: 'textarea', key: 'queOcurrio', label: '¿Qué ocurrió?' },
        { type: 'textarea', key: 'dondeOcurrio', label: '¿Dónde ocurrió?' },
        { type: 'textarea', key: 'cuandoOcurrio', label: '¿Cuándo ocurrió?' },
        { type: 'textarea', key: 'comoOcurrio', label: '¿Cómo ocurrió?' },
        { type: 'textarea', key: 'queLesion', label: '¿Qué lesión generó?' },
        { type: 'textarea', key: 'informeTestigos', label: 'Informe de testigos' }
      ]
    },
    {
      titulo: 'ANÁLISIS DE CAUSAS',
      campos: [
        { type: 'textarea', key: 'causaManoObra', label: 'MANO DE OBRA (Ej. Falta de capacitación, supervisión, inexperiencia, problemas personales)' },
        { type: 'textarea', key: 'causaMetodo', label: 'MÉTODO (Ej. Políticas inadecuadas, incumplimiento de procedimiento)' },
        { type: 'textarea', key: 'causaMaquinaria', label: 'MAQUINARIA (Ej. Falta de mantenimiento preventivo, falla u obsolescencia)' },
        { type: 'textarea', key: 'causaMateriales', label: 'MATERIALES (Ej. Material que no cumple con especificaciones)' },
        { type: 'textarea', key: 'causaMedioAmbiente', label: 'MEDIO AMBIENTE (Ej. Sustancias químicas, humedad, condiciones del entorno)' },
        { type: 'textarea', key: 'causaMedicion', label: 'MEDICIÓN (Ej. Indicadores de gestión, falta de calibración)' },
        { type: 'textarea', key: 'eventoOcurrido', label: 'EVENTO OCURRIDO' }
      ]
    },
    {
      titulo: 'CON BASE EN LA NTC 3701 SELECCIONE LOS ITEMS APLICABLES',
      campos: [
        { type: 'textarea', key: 'causasInmediatas', label: 'CAUSAS INMEDIATAS — Actos inseguros / Condiciones inseguras' },
        { type: 'textarea', key: 'causasBasicas', label: 'CAUSAS BÁSICAS — Factores del trabajo / Factores personales' }
      ]
    },
    {
      titulo: 'PLAN DE ACCIÓN',
      tabla: {
        key: 'planAccion',
        min: 3,
        columnas: [
          { key: 'control', label: 'Controles a implementar' },
          { key: 'responsable', label: 'Responsable' },
          { key: 'cargo', label: 'Cargo' },
          { key: 'fechaProgramada', label: 'Fecha programada' },
          { key: 'fechaCumplimiento', label: 'Fecha de cumplimiento' },
          { key: 'evidencia', label: 'Cómo se evidencia' }
        ]
      }
    },
    {
      titulo: 'OBSERVACIONES Y DATOS DE LA INVESTIGACIÓN',
      campos: [
        { type: 'textarea', key: 'observaciones', label: 'Observaciones' },
        { type: 'text', key: 'personaAfectada', label: 'Persona afectada' },
        { type: 'text', key: 'lugar', label: 'Lugar' },
        { type: 'date', key: 'investigacion.fecha', label: 'Fecha de la investigación' },
        { type: 'time', key: 'investigacion.hora', label: 'Hora' },
        { type: 'text', key: 'jefePersona', label: 'Jefe persona accidentada' },
        { type: 'text', key: 'cargoJefe', label: 'Cargo' },
        { type: 'text', key: 'representanteCopasst', label: 'Representante COPASST - SISO' },
        { type: 'text', key: 'cargoCopasst', label: 'Cargo' },
        { type: 'text', key: 'testigo', label: 'Testigo(s)' },
        { type: 'text', key: 'cargoTestigo', label: 'Cargo' }
      ]
    }
  ]
};