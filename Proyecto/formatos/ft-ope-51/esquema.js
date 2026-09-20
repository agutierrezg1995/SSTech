/*
 * Esquema FT-OPE-51 — Permiso de Trabajo en Alturas
 */
module.exports = {
  id: 'ft-ope-51',
  codigo: 'FT-OPE-51',
  nombre: 'Permiso de Trabajo en Alturas',
  fecha: 'ene-2023',
  version: '01',
  color: '#1d5b8c',
  icono: '🧗',
  listado: [
    { key: 'fecha', label: 'Fecha', tipo: 'fecha' },
    { key: 'lugarEspecifico', label: 'Lugar' },
    { key: 'trabajo', label: 'Trabajo a realizar' },
    { key: 'estado', label: 'Estado' }
  ],
  secciones: [
    {
      titulo: 'VALIDEZ DE LA AUTORIZACIÓN',
      campos: [
        { type: 'text', key: 'lugarEspecifico', label: 'Lugar específico' },
        { type: 'text', key: 'trabajo', label: 'Nombre del trabajo a realizar' },
        { type: 'date', key: 'fecha', label: 'Fecha de diligenciamiento' },
        { type: 'time', key: 'horaInicio', label: 'Hora inicio' },
        { type: 'time', key: 'horaFin', label: 'Hora de finalización' }
      ]
    },
    {
      titulo: 'PERSONAL AUTORIZADO',
      tabla: {
        key: 'personal',
        min: 5,
        columnas: [
          { key: 'nombre', label: 'Nombre y Apellido' },
          { key: 'tipoDoc', label: 'Tipo doc.' },
          { key: 'numero', label: 'N° doc.' },
          { key: 'certificacion', label: 'Certificado de competencia laboral' },
          { key: 'afiliacion', label: 'Afiliación SS' },
          { key: 'firma', label: 'Firma' }
        ]
      }
    },
    {
      titulo: 'DESCRIPCIÓN DETALLADA DEL TRABAJO A EJECUTAR',
      campos: [
        { type: 'textarea', key: 'descripcion', label: 'Descripción' },
        { type: 'textarea', key: 'secuencia', label: 'Secuencia de actividades' },
        { type: 'text', key: 'herramientas', label: 'Herramientas a utilizar' },
        { type: 'text', key: 'altura', label: 'Altura aprox. a trabajar (mts)' }
      ]
    },
    {
      titulo: 'SISTEMAS DE PREVENCIÓN A UTILIZAR',
      campos: [
        { type: 'checkbox', key: 'prev_barandas', label: 'Barandas' },
        { type: 'checkbox', key: 'prev_lineas', label: 'Líneas de advertencia' },
        { type: 'checkbox', key: 'prev_ing', label: 'Sistemas de Ingeniería' },
        { type: 'checkbox', key: 'prev_acceso', label: 'Control del Acceso' }
      ]
    },
    {
      titulo: 'SISTEMAS DE ACCESO A UTILIZAR',
      campos: [
        { type: 'radio', key: 'acceso', opciones: ['Escalera', 'Andamio', 'Elevador'] },
        { type: 'text', key: 'accesoOtro', label: 'Otro: ¿Cuál?' }
      ]
    },
    {
      titulo: 'SE DESIGNA UN AYUDANTE DE SEGURIDAD',
      campos: [
        { type: 'text', key: 'ayudanteNombre', label: 'Nombre y Apellido del ayudante de seguridad' },
        { type: 'text', key: 'ayudanteFirma', label: 'Firma' }
      ]
    },
    {
      titulo: 'CÁLCULO DE DISTANCIA DE CAÍDA LIBRE',
      campos: [
        { type: 'text', key: 'caida.a', label: 'A: Altura del trabajador' },
        { type: 'text', key: 'caida.b', label: 'B: Longitud de la Eslinga' },
        { type: 'text', key: 'caida.c', label: 'C: Amortiguador o absorbedor' },
        { type: 'text', key: 'caida.e', label: 'E: Factor de seguridad' },
        { type: 'text', key: 'caida.d', label: 'D: Distancia de caída' },
        { type: 'text', key: 'caida.f', label: 'F: Distancia de caída libre' },
        { type: 'radio', key: 'caida.siNo', opciones: ['SI', 'NO'], label: '¿La distancia anclaje-obstáculo es mayor o igual a la distancia libre de caída?' }
      ]
    },
    {
      titulo: 'EQUIPO DE PROTECCIÓN PERSONAL EXIGIDO / RECOMENDADO',
      campos: (function () {
        const arr = [
          'Casco', 'Casco con Barboquejo', 'Gafas de Seguridad', 'Monogafas', 'Guantes de Vaquetas',
          'Guantes de Nitrilo', 'Guantes Dieléctrico', 'Delantal', 'Máscara Completa', 'Máscara Con Filtro',
          'Mascarilla Desechable', 'Careta', 'Polaina y cofia', 'Botas Con Puntera', 'Gorro para soldador',
          'Visor Contra partículas', 'Filtro Contra amoníaco', 'Protectores Auditivos', 'Arnés Cuerpo Completo',
          'Eslinga Y con Absorbedor', 'Eslinga y sin Absorbedor', 'Eslinga de Posicionamiento'
        ];
        return arr.map(e => ({ type: 'checkbox', key: 'epp_' + e.split(' ')[0].replace(/[^A-Za-zÁÉÍÓÚáéíóú]/g, '').toLowerCase(), label: e }));
      })()
    },
    {
      titulo: 'AUTORIZACIÓN',
      destacada: true,
      campos: [
        { type: 'text', key: 'firmas.emisor', label: 'Firma y cédula del Emisor (Coord. trabajo en alturas con certificado)' },
        { type: 'text', key: 'firmas.representante', label: 'Firma y cédula del Representante del cliente' },
        { type: 'text', key: 'firmas.responsable', label: 'Firma y cédula del Responsable del equipo ejecutante' },
        { type: 'text', key: 'firmas.emergencia', label: 'Responsable de activar el plan de emergencia' }
      ]
    },
    {
      titulo: 'REVALIDACIÓN / CANCELACIÓN',
      campos: [
        { type: 'text', key: 'revalidacion.fecha', label: 'Revalidación fecha' },
        { type: 'time', key: 'revalidacion.desde', label: 'Hora desde' },
        { type: 'time', key: 'revalidacion.hasta', label: 'Hora hasta' },
        { type: 'text', key: 'cancelacion.hora', label: 'Cancelación hora' },
        { type: 'text', key: 'cancelacion.motivo', label: 'Cancelación motivo' }
      ]
    },
    {
      titulo: 'SATISFACCIÓN DEL TRABAJO REALIZADO EN FORMA SEGURA',
      campos: [
        { type: 'radio', key: 'satisfaccion.terminado', opciones: ['SI', 'NO'], label: 'Trabajo terminado?' },
        { type: 'radio', key: 'satisfaccion.limpio', opciones: ['SI', 'NO'], label: 'Lugar limpio y organizado?' },
        { type: 'radio', key: 'satisfaccion.etiquetas', opciones: ['SI', 'NO', 'NA'], label: 'Etiquetas retiradas (energías peligrosas)?' },
        { type: 'date', key: 'satisfaccion.fecha', label: 'Fecha' },
        { type: 'time', key: 'satisfaccion.hora', label: 'Hora' }
      ]
    },
    {
      titulo: 'LISTA DE VERIFICACIÓN PARA EMISIÓN DE PERMISOS',
      checklists: {
        grupos: {
          general: {
            titulo: 'GENERAL - TRABAJO EN ALTURAS',
            items: [
              'Los trabajadores cuentan con certificación actualizada de capacitación y/o competencia laboral para el trabajo en alturas?',
              'El trabajo que va a ser realizado, se verificó en conjunto con el solicitante (usuario) y el ejecutante?',
              'El Ejecutante informó a todos los trabajadores del área sobre la ejecución del respectivo trabajo?',
              'El equipo ejecutante tiene y conoce los procedimientos aplicables al respectivo trabajo?',
              'El equipo ejecutante tiene debidamente planeada la forma de realizar el respectivo trabajo?',
              'El área fue señalizada y/o aislada para impedir el acceso por todos los puntos de ingreso?',
              'Los ejecutantes disponen de los EPP necesarios, los saben emplear y están en adecuado estado?',
              'Las máquinas/equipos y herramientas fueron inspeccionados y están en adecuado estado de funcionamiento?',
              'El ejecutante garantiza la presencia permanente de otro trabajador para la realización con mínimo dos personas?',
              'Los dispositivos de bloqueo y rotulado de máquinas y servicios, son los necesarios de acuerdo al Plan de Bloqueo?',
              'Los huecos en pisos y plataformas están debidamente señalizados y/o aislados para prevenir caídas?',
              'Los andamios y/o accesos son adecuados en armado, barandas y resistencias para ejecutar el trabajo?',
              'Las líneas de equipos fueron despresurizados y/o drenados?',
              'La iluminación en el área es suficiente, inclusive para las personas que están cerca de la zona de trabajo?',
              'Fueron tomadas precauciones para identificar la existencia de tuberías, líneas eléctricas y electroductos enterrados?',
              'El área donde se ejecutará el trabajo, esta determinada como área Clasificada de riesgo Eléctrico (Norma RETIE)?',
              'En caso de que el punto anterior se presente: las luminarias u otros equipos eléctricos son a prueba de explosión?',
              'Están disponibles los recursos para disponer y controlar vertimientos y sustancias agresivas al medio ambiente?',
              'El trabajo que se realizará cuenta con las condiciones atmosféricas idóneas para no generar riesgos adicionales, Ej.: lluvia',
              'El área donde se ejecutará el trabajo u operación está protegida contra ejecuciones no programadas por parte de trabajos externos que afecten la seguridad? (Ej.: Circulación de vehículos, trabajos simultáneos de otros contratistas, etc.)'
            ]
          }
        }
      }
    }
  ]
};