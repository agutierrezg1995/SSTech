/*
 * seed-datos.js — Datos de demostración (registros) para cada formato.
 * Genera registros realistas en data/<formatoId>.json respetando los esquemas
 * y las reglas de validación (fechas no futuras, campos requeridos, checklists).
 *
 * Uso: node seed.js  (los llama automáticamente)
 */
const formatos = require('./config');
const db = require('./lib/db');
const { inicialData } = require('./lib/seed-util');

/* ---------- Helpers de fechas ---------- */
function fechaISO(diasAtras) {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const g = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + g;
}
function haceHora(desdeHoy, hora) {
  return fechaISO(desdeHoy) + 'T' + hora + ':00.000Z';
}

/* ---------- Funciones útiles para construir registros ---------- */
function checklistTodoSI(n) { return Array(n).fill('SI'); }
function checklist(n, noEn) {
  return Array.from({ length: n }, (_, i) => noEn === i ? 'NO' : 'SI');
}

/* ============================================================
   FT-OPE-06 — Permiso de Trabajo en Campo
   ============================================================ */
function ftOpe06(tipo) {
  const d = {
    ...inicialData(esquema('ft-ope-06')),
    localizacion: 'PLANTA',
    lugarEspecifico: 'Área de compresores — Bodega A',
    solicitante: 'Juan Pérez',
    responsableEquipo: 'Pedro Gómez',
    responsableArea: 'Coordinación de Mantenimiento',
    empresaEjecutora: 'SSTech SAS',
    descripcion: 'Mantenimiento preventivo de compresores de aire, cambio de filtros y lubricación de puntos de giro.',
    fecha: fechaISO(1),
    horaInicio: '07:00',
    horaFin: '15:00',
    ejecutantes: [
      { nombre: 'Ana Torres', cc: '1023456789', ss: 'SI', medico: 'SI', cert: 'SI' },
      { nombre: 'Luis Ramírez', cc: '1098452312', ss: 'SI', medico: 'SI', cert: 'SI' },
      { nombre: 'María López', cc: '1012345678', ss: 'SI', medico: 'SI', cert: 'SI' }
    ],
    mediciones: { comb: '0', prop: '0', nh3: '0', h2s: '0', o2: '20.9', co: '2' },
    herramientas: 'Juego de llaves, torquímetro, pistola de grasas, juego de medidores de aire.',
    requisitos: 'Candados de bloqueo propio, formato de bloqueo y etiquetado, extintor en el área.',
    firmas: {
      emisor: 'Andrés Mejía — 1015.203.450',
      representante: 'Carolina Ruiz — 1032.456.789',
      responsable: 'Pedro Gómez — 79.845.321'
    }
  };

  if (tipo === 'borrador') {
    d.localizacion = 'PUNTO DE VENTA';
    d.descripcion = '';
    d.horaFin = '';
    d.tareas = { 1: 'SI', 2: 'NA', 3: 'NA', 4: 'NA', 5: 'NA', 6: 'NA' };
    return d;
  }

  if (tipo === 'noConcedido') {
    d.tareas = { 1: 'SI', 2: 'NA', 3: 'NA', 4: 'NA', 5: 'NA', 6: 'NA' };
    d.verif.general = checklist(20, 4); // ítem 5 "NO"
    d.verif.izaje = checklistTodoSI(21);
    return d;
  }

  const variantes = [
    { loc: 'PLANTA', sitio: 'Planta principal — tanque de almacenamiento', fech: 1 },
    { loc: 'PUNTO DE VENTA', sitio: 'Punto de venta Centro — cuarto eléctrico', fech: 8 },
    { loc: 'GRANJA', sitio: 'Granja La Esperanza — sala de máquinas', fech: 15 },
    { loc: 'PARQUE INDUSTRIAL', sitio: 'Parque industrial — nave 3', fech: 22 }
  ];
  const v = variantes[Math.floor(Math.random() * variantes.length)];
  const tarea = 1 + Math.floor(Math.random() * 4); // 1..4 → izaje, caliente, armado, confinados
  const grupos = { 1: 'izaje', 2: 'caliente', 3: 'armado', 4: 'confinados' };
  const nItems = { izaje: 21, caliente: 14, armado: 4, confinados: 16 };
  d.localizacion = v.loc;
  d.lugarEspecifico = v.sitio;
  d.fecha = fechaISO(v.fech);
  d.tareas = {
    [tarea]: 'SI'
  };
  [1, 2, 3, 4, 5, 6].forEach(n => {
    if (d.tareas[n] === undefined) d.tareas[n] = 'NA';
  });
  d.verif.general = checklistTodoSI(20);
  d.verif['' + grupos[tarea]] = checklistTodoSI(nItems[grupos[tarea]]);
  return d;
}

/* ============================================================
   FT-OPE-51 — Permiso de Trabajo en Alturas
   ============================================================ */
function ftOpe51(tipo) {
  const d = {
    ...inicialData(esquema('ft-ope-51')),
    lugarEspecifico: 'Cubierta nave industrial — fachada norte',
    trabajo: 'Instalación de sistema de protección contra caídas en cubierta y mantenimiento de claraboyas.',
    fecha: fechaISO(2),
    horaInicio: '06:30',
    horaFin: '11:30',
    personal: [
      { nombre: 'Carlos SISO', tipoDoc: 'CC', numero: '1018482536', certificacion: 'SI', afiliacion: 'SI', firma: 'SI' },
      { nombre: 'Andrés Mejía', tipoDoc: 'CC', numero: '1015203450', certificacion: 'SI', afiliacion: 'SI', firma: 'SI' },
      { nombre: 'Luisa Franco', tipoDoc: 'CC', numero: '1023548761', certificacion: 'SI', afiliacion: 'SI', firma: 'SI' }
    ],
    descripcion: 'Trabajo en alturas sobre cubierta metálica para instalación de línea de vida horizontal certificada.',
    secuencia: '1) Inspección de zona y andamio de acceso. 2) Instalación de puntos de anclaje. 3) Tensado de línea de vida. 4) Prueba y certificación in situ.',
    herramientas: 'Llaves de impacto, taladro, remachadora, línea de vida y accesorios certificados.',
    altura: '8',
    prev_barandas: 'SI',
    prev_lineas: 'SI',
    acceso: 'Andamio',
    ayudanteNombre: 'Luis Ramírez',
    ayudanteFirma: 'Luis Ramírez',
    caida: { a: '0.4', b: '1.8', c: '0.9', e: '1.5', d: '1.3', f: '3.4', siNo: 'SI' },
    epp_arnés: 'SI',
    epp_eslinga: 'SI',
    epp_casco: 'SI',
    firmas: {
      emisor: 'Ana Coordinadora — 1051.234.890',
      representante: 'Óscar Pardo — 7978.456.123',
      responsable: 'Andrés Mejía — 1015.203.450',
      emergencia: 'Bomberos 119 · alarma central'
    }
  };

  if (tipo === 'borrador') {
    d.descripcion = '';
    d.ayudanteNombre = '';
    return d;
  }
  if (tipo === 'noConcedido') {
    d.verif.general = checklist(20, 3);
    d.satisfaccion = { terminado: 'NO', limpio: 'SI', etiquetas: 'NA', fecha: fechaISO(2), hora: '11:00' };
    return d;
  }
  d.verif.general = checklistTodoSI(20);
  d.satisfaccion = { terminado: 'SI', limpio: 'SI', etiquetas: 'NA', fecha: fechaISO(2), hora: '11:20' };
  return d;
}

/* ============================================================
   FT-OPE-56 — Control de asistencia de Operaciones
   ============================================================ */
function ftOpe56(n) {
  const d = {
    ...inicialData(esquema('ft-ope-56')),
    fecha: fechaISO(n * 3),
    regional: 'Región Central',
    ot: 'OT-' + (1041 + n),
    cliente: n % 2 === 0 ? 'Supermercados Cofluid S.A.' : 'Logística Andina SAS',
    asistencia: [
      { nombre: 'Carlos SISO', cedula: '1018482536', cargo: 'SISO', horaLlegada: '06:00', firmaLlegada: 'SI', horaSalida: '14:00', firmaSalida: 'SI' },
      { nombre: 'Diana Rojas', cedula: '1098452312', cargo: 'Operaria Bodega', horaLlegada: '06:05', firmaLlegada: 'SI', horaSalida: '14:00', firmaSalida: 'SI' },
      { nombre: 'Kevin Suárez', cedula: '1023987654', cargo: 'Montacarguista', horaLlegada: '06:10', firmaLlegada: 'SI', horaSalida: '14:05', firmaSalida: 'SI' },
      { nombre: 'Paola Narváez', cedula: '1031854241', cargo: 'Asistente logística', horaLlegada: '06:12', firmaLlegada: 'SI', horaSalida: '13:55', firmaSalida: 'SI' }
    ],
    responsable: n % 2 === 0 ? 'Carlos SISO' : 'Ana Coordinadora'
  };
  return d;
}

/* ============================================================
   FT-SST-08 — Control semanal de pausas activas
   ============================================================ */
function ftSst08(n) {
  const now = new Date();
  const mes = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][now.getMonth()];
  const d = {
    ...inicialData(esquema('ft-sst-08')),
    mes,
    semana: 'Semana ' + (3 + n),
    anio: String(now.getFullYear()),
    realiza: 'Carlos SISO',
    regional: 'Región Central',
    revisa: 'Ana Coordinadora',
    participantes: [
      { nombres: 'Carlos SISO', cc: '1018482536', dl: 'SI', dm: 'SI', dj: 'SI', dv: 'SI', ds: 'NO', dd: 'NO', firma: 'SI' },
      { nombres: 'Diana Rojas', cc: '1098452312', dl: 'SI', dm: 'SI', dj: 'SI', dv: 'SI', ds: 'NO', dd: 'NO', firma: 'SI' },
      { nombres: 'Kevin Suárez', cc: '1023987654', dl: 'SI', dm: 'NO', dj: 'SI', dv: 'SI', ds: 'NO', dd: 'NO', firma: 'SI' },
      { nombres: 'Paola Narváez', cc: '1031854241', dl: 'SI', dm: 'SI', dj: 'SI', dv: 'SI', ds: 'NO', dd: 'NO', firma: 'SI' }
    ],
    firmaReviso: 'Ana Coordinadora',
    fechaEntrega: fechaISO(n * 2 + 2),
    firmaRealizo: 'Carlos SISO',
    observaciones: 'Participación del 100% del turno de mañana. Se recomienda incluir pausas en turno nocturno.'
  };
  return d;
}

/* ============================================================
   FT-SST-11 — Reporte de Investigación de A.T e I.T
   ============================================================ */
function ftSst11(n) {
  const esIncidente = n % 3 !== 0;
  const d = {
    ...inicialData(esquema('ft-sst-11')),
    clasificacion: esIncidente ? 'INCIDENTE' : 'ACCIDENTE',
    afectado: ['Luis Ramírez', 'Diana Rojas', 'Kevin Suárez'][n % 3],
    nit: '1018' + String(482536 + n),
    fechaIngreso: fechaISO(120 + n * 10),
    cargo: n % 2 === 0 ? 'Operario de bodega' : 'Montacarguista',
    ciudad: 'Bogotá D.C.',
    diasIncapacidad: esIncidente ? '0' : String(2 + n),
    responsable: 'Carlos SISO',
    cargoResponsable: 'SISO — Supervisor de seguridad',
    fechaReporte: fechaISO(1),
    fechaEvento: fechaISO(n + 1),
    diaSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][n % 5],
    horaEvento: '09:4' + n,
    turno: 'Mañana (06:00–14:00)',
    areaProceso: 'Centro de distribución — muelle 2',
    sitioOcurrencia: 'Rampa de descargue, junto al muelles y a 15 m del parqueadero.',
    impactoPersonas: esIncidente ? '6 NO' : '6 SI',
    impactoPropiedad: '6 NO',
    impactoMedioAmbiente: '6 NO',
    queOcurrio: esIncidente
      ? 'El operario resbaló al subir la rampa móvil con carga en mano; no hubo caída ni lesión, solo un movimiento brusco.'
      : 'El colaborador golpeó su mano derecha con el borde de una estiba al manipular un pallet sin eslingas.',
    dondeOcurrio: 'En el muelle 2 del centro de distribución, sobre la rampa hidráulica de descargue.',
    cuandoOcurrio: 'A las ' + '09:4' + n + ' durante la jornada de la mañana.',
    comoOcurrio: 'Al momento de bajar la mercancía, el pallet se deslizó y el borde impactó la mano del colaborador.',
    queLesion: esIncidente ? 'Sin lesión aparente. Se realizó verificación médica por descarte.' : 'Contusión leve en dorso de mano derecha. Cuenta médica de 3 días.',
    informeTestigos: 'Los compañeros de turno confirman la secuencia descrita. No hay registros previos similares en el último trimestre.',
    causaManoObra: 'Falta de reentrenamiento en manejo manual de cargas y supervisión intermitente del área.',
    causaMetodo: 'El procedimiento de descargue no contempla el uso de ayudas mecánicas para pesos > 15 kg.',
    causaMaquinaria: 'La rampa hidráulica presenta desgaste en el sistema de frenado de seguridad.',
    causaMateriales: 'Las estibas de madera presentan astillas y clavos de punta en zonas de tránsito.',
    causaMedioAmbiente: 'Superficie de la rampa con humedad por lluvia previa.',
    causaMedicion: 'Los indicadores de realización de ATS no reflejan el área de muelle.',
    eventoOcurrido: 'Caída del operario con carga en mano / contacto con borde de estiba.',
    causasInmediatas: 'Condición insegura: estiba astillada. Acto inseguro: no usar guantes de carnaza.',
    causasBasicas: 'Factores del trabajo: procedimiento sin análisis mecánico. Factores personales: no se reportó fatiga visual.',
    planAccion: [
      { control: 'Reentrenar en manejo seguro de cargas y uso de ayudas mecánicas.', responsable: 'Carlos SISO', cargo: 'SISO', fechaProgramada: fechaISO(15), fechaCumplimiento: fechaISO(18), evidencia: 'Acta de capacitación firmada' },
      { control: 'Reparar sistema de frenado de la rampa hidráulica.', responsable: 'Pedro Gómez', cargo: 'Líder de mantenimiento', fechaProgramada: fechaISO(10), fechaCumplimiento: fechaISO(12), evidencia: 'Orden de servicio cerrada' },
      { control: 'Reponer estibas con astillas y demarcar zona de riesgo.', responsable: 'Diana Rojas', cargo: 'Jefe de bodega', fechaProgramada: fechaISO(5), fechaCumplimiento: fechaISO(7), evidencia: 'Inventario actualizado' }
    ],
    observaciones: 'Se recomienda ATS específico para muelles y exigir guantes de carnaza como EPP obligatorio.',
    personaAfectada: ['Luis Ramírez', 'Diana Rojas', 'Kevin Suárez'][n % 3],
    lugar: 'Centro de distribución — muelle 2',
    'investigacion.fecha': fechaISO(n + 1),
    'investigacion.hora': '14:30',
    jefePersona: 'Diana Rojas',
    cargoJefe: 'Jefe de bodega',
    representanteCopasst: 'Carlos SISO',
    cargoCopasst: 'Representante COPPAST',
    testigo: 'Kevin Suárez',
    cargoTestigo: 'Montacarguista'
  };
  return d;
}

/* ============================================================
   FT-SST-37 — Análisis de Trabajo Seguro (ATS)
   ============================================================ */
function ftSst37(n) {
  const d = {
    ...inicialData(esquema('ft-sst-37')),
    trabajo: n % 2 === 0 ? 'Mantenimiento de compresor en cuarto eléctrico' : 'Instalación de luminarias en zona de producción',
    sitio: n % 2 === 0 ? 'Cuarto eléctrico — Planta central' : 'Nave de producción — línea 3',
    cliente: 'SSTech SAS',
    ciudad: 'Bogotá D.C.',
    fecha: fechaISO(n + 1) + ' 07:00',
    tareasAr: { 1: 'SI', 2: 'NA', 3: 'NA', 4: 'NA', 5: 'NA', 6: 'NA', 7: 'NA' },
    pasos: [
      { paso: 'Llegada y chequeo del área, señalamiento y permiso de ingreso.', peligros: '4, 41, 55', efectos: 'Contacto con energías peligrosas, superficies calientes', medidas: 'Bloqueo y rotulado, uso de candados, verificación con detector de tensión' },
      { paso: 'Desenergización del equipo y bloqueo de fuentes.', peligros: '2, 56', efectos: 'Electrocución', medidas: 'Candados de bloqueo, tarjeta de seguridad, prueba de cero energía' },
      { paso: 'Intervención del equipo según manual del fabricante.', peligros: '62, 64', efectos: 'Atrapamiento, golpes', medidas: 'Uso de EPP, herramientas aisladas, trabajo mínimo de dos personas' },
      { paso: 'Prueba de arranque y verificación de condiciones normales.', peligros: '1, 68', efectos: 'Proyección de partículas, ruido', medidas: 'Distancia segura, protectores auditivos, gafas de seguridad' }
    ],
    peligrosIdentificados: '1 Contacto con corriente eléctrica, 2 Energías peligrosas electrostáticas, 4 Esfuerzo físico, 41 Carga suspendida, 55 Alturas, 56 Trabajo en caliente, 62 Atrapamiento, 64 Golpes por objetos.',
    epp_casco: 'SI',
    epp_gafas: 'SI',
    epp_guantes_dielectricos: 'SI',
    epp_botas: 'SI',
    epp_arnes: 'SI',
    equipo: [
      { nombre: 'Carlos SISO', cedula: '1018482536', firma: 'SI' },
      { nombre: 'Andrés Mejía', cedula: '1015203450', firma: 'SI' },
      { nombre: 'Luisa Franco', cedula: '1023548761', firma: 'SI' }
    ],
    realizadoPor: 'Carlos SISO — SISO de seguridad',
    aprobadoPor: 'Ana Coordinadora — Coordinadora SST'
  };
  return d;
}

/* ============================================================
   FT-SST-39 — Control de Entregas de EPP
   ============================================================ */
function ftSst39(n) {
  const d = {
    ...inicialData(esquema('ft-sst-39')),
    tipoEntrega: n % 3 === 0 ? 'PRIMERA VEZ' : (n % 3 === 1 ? 'REPOSICIÓN' : 'AMBAS'),
    fechaLote: fechaISO(n * 2),
    entregas: [
      { cedula: '1018482536', nombre: 'Carlos SISO', cargo: 'SISO', casco: '1', barbuquejo: '1', guanteKleenguard: '2', guanteIngeniero: '2', guanteCarnaza: '0', gafasClaro: '1', gafasOscuro: '0', tapaOidos: '2', tapabocas: '10', delantal: '1' },
      { cedula: '1098452312', nombre: 'Diana Rojas', cargo: 'Operaria Bodega', casco: '1', barbuquejo: '0', guanteKleenguard: '2', guanteIngeniero: '0', guanteCarnaza: '1', gafasClaro: '1', gafasOscuro: '0', tapaOidos: '0', tapabocas: '8', delantal: '0' },
      { cedula: '1023987654', nombre: 'Kevin Suárez', cargo: 'Montacarguista', casco: '1', barbuquejo: '0', guanteKleenguard: '0', guanteIngeniero: '2', guanteCarnaza: '0', gafasClaro: '1', gafasOscuro: '0', tapaOidos: '2', tapabocas: '5', delantal: '0' }
    ]
  };
  return d;
}

/* Encuentra el esquema de un formato por su id */
function esquema(id) {
  const f = formatos.find(x => x.id === id);
  if (!f) throw new Error('Formato no encontrado: ' + id);
  return f.esquema;
}

/* Lista de id de usuario: SISO -> Carlos, Coordinadora -> Ana */
function generaPorFormato(id, ids) {
  const list = [];
  const make = (data, estado, user, dias) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - (dias || 0));
    const reg = db.crear(id, data, { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol });
    if (estado !== 'BORRADOR' && estado) {
      const c = db.cambiarEstado(id, reg.id, estado, { id: ids.coordinador.id, nombre: ids.coordinador.nombre, email: ids.coordinador.email, rol: 'COORDINADOR' });
      reg.estado = c.estado;
    }
    list.push(reg);
  };

  switch (id) {
    case 'ft-ope-06':
      make(ftOpe06('concedido'), 'CONCEDIDO', ids.siso, 1);
      make(ftOpe06('concedido'), 'CONCEDIDO', ids.siso, 3);
      make(ftOpe06('noConcedido'), 'NO CONCEDIDO', ids.siso, 5);
      make(ftOpe06('borrador'), 'BORRADOR', ids.siso, 2);
      make(ftOpe06('concedido'), 'CANCELADO', ids.coordinador, 8);
      break;

    case 'ft-ope-51':
      make(ftOpe51('concedido'), 'CONCEDIDO', ids.siso, 1);
      make(ftOpe51('concedido'), 'CONCEDIDO', ids.siso, 12);
      make(ftOpe51('noConcedido'), 'NO CONCEDIDO', ids.siso, 6);
      make(ftOpe51('borrador'), 'BORRADOR', ids.siso, 0);
      break;

    case 'ft-ope-56':
      make(ftOpe56(1), 'CONCEDIDO', ids.siso, 3);
      make(ftOpe56(2), 'CONCEDIDO', ids.siso, 6);
      make(ftOpe56(3), 'BORRADOR', ids.siso, 1);
      break;

    case 'ft-sst-08':
      make(ftSst08(1), 'CONCEDIDO', ids.siso, 4);
      make(ftSst08(2), 'CONCEDIDO', ids.siso, 11);
      make(ftSst08(3), 'BORRADOR', ids.siso, 2);
      break;

    case 'ft-sst-11':
      make(ftSst11(0), 'CONCEDIDO', ids.siso, 2);
      make(ftSst11(1), 'BORRADOR', ids.siso, 1);
      make(ftSst11(2), 'NO CONCEDIDO', ids.siso, 7);
      break;

    case 'ft-sst-37':
      make(ftSst37(0), 'CONCEDIDO', ids.siso, 2);
      make(ftSst37(1), 'CONCEDIDO', ids.siso, 9);
      make(ftSst37(2), 'BORRADOR', ids.coordinador, 1);
      break;

    case 'ft-sst-39':
      make(ftSst39(0), 'CONCEDIDO', ids.siso, 5);
      make(ftSst39(1), 'CONCEDIDO', ids.coordinador, 12);
      make(ftSst39(2), 'BORRADOR', ids.siso, 2);
      break;

    default:
      throw new Error('Formato sin generador de datos: ' + id);
  }
  return list;
}

function main() {
  const usuarios = require('./lib/auth').listarUsuarios();
  const siso = usuarios.find(u => u.rol === 'SISO');
  const coordinador = usuarios.find(u => u.rol === 'COORDINADOR');
  const ids = {
    siso: siso || { id: 'siso-demo', nombre: 'Carlos SISO', email: 'siso@sstech.co', rol: 'SISO' },
    coordinador: coordinador || { id: 'coord-demo', nombre: 'Ana Coordinadora', email: 'coordinador@sstech.co', rol: 'COORDINADOR' }
  };

  const fs = require('fs');
  const path = require('path');
  const DATA_DIR = path.join(__dirname, 'data');

  console.log('\n── Datos de demostración por formato ──');
  formatos.forEach(f => {
    const archivo = path.join(DATA_DIR, f.id + '.json');
    fs.writeFileSync(archivo, '[]', 'utf8'); // reinicia el archivo del formato
    const regs = generaPorFormato(f.id, ids);
    console.log(`✔ ${f.codigo} (${f.nombre}): ${regs.length} registros generados`);
  });
}

main();