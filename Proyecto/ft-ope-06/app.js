/* =====================================================================
   SSTech SaaS — FT-OPE-06 Permiso de Trabajo en Campo
   app.js: estado, render (edición + vista previa tipo PDF), reglas
   de negocio e impresión A4.
   ===================================================================== */

const $ = (id) => document.getElementById(id);

/* ---------------------- Estado (persistido) ---------------------- */
function estadoInicial() {
  return {
    localizacion: "PLANTA",
    otroCual: "",
    lugarEspecifico: "",
    solicitante: "",
    responsableArea: "",
    empresaEjecutora: "",
    responsableEquipo: "",
    descripcion: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    ejecutantes: Array.from({ length: 10 }, () => ({ nombre: "", cc: "", ss: "", medico: "", cert: "" })),
    tareas: {},        // {'1': 'SI'|'NA', ...}
    epp: {},           // {0:true,...}
    eppOtro: "",
    mediciones: { comb: "", prop: "", nh3: "", h2s: "", o2: "", co: "" },
    herramientas: "",
    requisitos: "",
    firmas: { emisorCodigo: "", representanteCodigo: "", responsableCodigo: "" },
    // Listas de verificación: { 'general.0':'SI', 'izaje.1':'NA', ... }
    verif: {},
    revalidacion: { fecha: "", horaDesde: "", horaHasta: "", motivo: "" },
    satisfaccion: { terminado: "", limpio: "", etiquetas: "", fecha: "", hora: "" },
    seguimiento: []
  };
}

let estado = estadoInicial();
try { const s = localStorage.getItem('ftope06'); if (s) estado = Object.assign({}, estadoInicial(), JSON.parse(s)); } catch (e) {}
function guardar() { try { localStorage.setItem('ftope06', JSON.stringify(estado)); } catch (e) {} }

/* ---------------------- Utilidades ---------------------- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function aplicar(prop, valor) { setDeep(estado, prop, valor); guardar(); }
function setDeep(obj, path, val) {
  const parts = path.split('.');
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (o[parts[i]] == null) o[parts[i]] = {};
    o = o[parts[i]];
  }
  o[parts[parts.length - 1]] = val;
}
function getDeep(obj, path) {
  return path.split('.').reduce((o, p) => (o == null ? o : o[p]), obj);
}
function marcaje(v) { return (v === 'X') ? 'X' : (v ? 'X' : ''); }

/* ---- Campos SI/NO/NA ---- */
function radios(prop, opciones) {
  return opciones.map(o => {
    const activo = getDeep(estado, prop) === o;
    return '<label class="chip"><input type="radio" name="' + prop + '" value="' + o + '" ' +
      (activo ? 'checked' : '') + ' onchange="aplicar(\'' + prop + '\',\'' + o + '\'); renEdicion(); evalPermiso();">' + o + '</label>';
  }).join('');
}
function radiosCeldas(prop, opciones) {
  return opciones.map(o => {
    const activo = getDeep(estado, prop) === o;
    return '<td class="center"><label class="chip"><input type="radio" name="' + prop + '" value="' + o + '" ' +
      (activo ? 'checked' : '') + ' onchange="aplicar(\'' + prop + '\',\'' + o + '\'); renEdicion(); evalPermiso();">' + o + '</label></td>';
  }).join('');
}

/* =====================================================================
   RENDER DE EDICIÓN
   ===================================================================== */
function cabeceraFormato() {
  let m = DATOS_FORMATO.meta;
  return '<table><tr>' +
    '<td rowspan="2" style="width:20%;text-align:center"><div style="font-size:12pt;font-weight:bold">SSTech</div>' +
    '<div class="smaller">SISTEMA DE GESTIÓN<br>SEGURIDAD Y SALUD EN EL TRABAJO</div></td>' +
    '<td rowspan="2" class="titulo-formato">' + DATOS_FORMATO.titulo + '</td>' +
    '<td style="width:10%"><b>CÓDIGO</b><br>' + m.code + '</td>' +
    '<td style="width:10%"><b>FECHA</b><br>' + m.fecha + '</td>' +
    '<tr><td colspan="2"><b>VERSIÓN</b><br>' + m.version + '</td></tr>' +
    '</table>';
}

function notasInstrucciones() {
  return '<div class="marco just smaller" style="background:#fff7dd;margin:4px 0">' +
    '<p>Este permiso <b>NO</b> debe tener tachones, enmendaduras o espacios en blanco.</p>' +
    '<p>Para el diligenciamiento del permiso solo se utilizarán palabras tales como <b>"SÍ"</b> cuando se cumple el requerimiento, ' +
    '<b>"NO"</b> cuando se incumple con un requerimiento de obligatorio cumplimiento, <b>"NA"</b> cuando no se requiere el aspecto evaluado. ' +
    'Al contestar así sea un solo NO el permiso se dará por <b>NO CONCEDIDO</b>, es decir NO se realizará el trabajo.</p></div>';
}

function campoTexto(prop, ph, w) {
  return '<input type="text" style="width:' + (w || '100%') + '" value="' + esc(getDeep(estado, prop)) + '"' +
    ' oninput="aplicar(\'' + prop + '\',this.value); guardar(); evalPermiso();" placeholder="' + (ph || '') + '">';
}
function areaTexto(prop, rows) {
  return '<textarea rows="' + (rows || 2) + '" oninput="aplicar(\'' + prop + '\',this.value); guardar();">' +
    esc(estado[prop]) + '</textarea>';
}

function seccionLocalizacion() {
  let h = '<div class="seccion-g">LOCALIZACIÓN DE LA ACTIVIDAD (Señale con una "X")</div><table><tr>';
  DATOS_FORMATO.localizacion.forEach(loc => {
    if (loc === 'CUÁL:') {
      h += '<td class="center" style="width:16%">' + loc + '&nbsp;' + campoTexto('otroCual', '', '80px') + '</td>';
    } else {
      const activo = estado.localizacion === loc;
      h += '<td class="center" style="width:16%" onclick="document.querySelector(\'input[name=localizacion][value=' + loc + ']\').checked=true;aplicar(\'localizacion\',\'' + loc + '\');renEdicion();">' +
        '<input type="radio" name="localizacion" value="' + loc + '" ' + (activo ? 'checked' : '') + ' onchange="aplicar(\'localizacion\',this.value);renEdicion();"> ' + loc + '</td>';
    }
  });
  h += '</tr></table>';
  return h;
}

function seccionDatosGenerales() {
  return '<table><tr>' +
    '<td style="width:26%"><b>Lugar específico:</b><br>' + campoTexto('lugarEspecifico') + '</td>' +
    '<td style="width:37%"><b>Nombre del solicitante del trabajo:</b><br>' + campoTexto('solicitante') +
    '<br><b>Responsable del equipo ejecutante del trabajo:</b><br>' + campoTexto('responsableEquipo') + '</td>' +
    '<td style="width:37%"><b>Responsable del área donde se ejecutará el trabajo:</b><br>' + campoTexto('responsableArea') +
    '<br><b>Nombre de empresa responsable de ejecutar el trabajo:</b><br>' + campoTexto('empresaEjecutora') + '</td>' +
    '</tr>' +
    '<tr><td colspan="3"><b>Descripción detallada del trabajo a ejecutar:</b><br>' + areaTexto('descripcion', 2) + '</td></tr></table>';
}

function seccionEjecutantes() {
  let h = '<div class="seccion-g">El ejecutante cuenta con la siguiente documentación vigente (Señale con una "X")</div>';
  h += '<table class="verif"><thead><tr>' +
    '<th style="width:34%">Nombres y apellidos de ejecutantes asignados:<br> C.C.</th>' +
    '<th>Afiliación a la seguridad social</th>' +
    '<th>Certificado de aptitud médico</th>' +
    '<th>Certificación y/o entrenamiento</th>' +
    '</tr></thead><tbody>';
  estado.ejecutantes.forEach((ex, i) => {
    const base = 'ejecutantes.' + i + '.';
    h += '<tr><td>' + (i + 1) + '. ' + campoTexto(base + 'nombre', 'Nombre') +
      '<br>&nbsp;&nbsp;' + campoTexto(base + 'cc', 'C.C.', '130px') + '</td>';
    h += radiosCeldas(base + 'ss', ['SI', 'NO']);
    h += radiosCeldas(base + 'medico', ['SI', 'NO']);
    h += radiosCeldas(base + 'cert', ['SI', 'NO']);
    h += '</tr>';
  });
  h += '</tbody></table>';
  return h;
}

function seccionFechaVigencia() {
  return '<table><tr>' +
    '<td style="width:50%"><b>Fecha de diligenciamiento del permiso:</b><br>' +
    '<input type="date" value="' + esc(estado.fecha) + '" onchange="aplicar(\'fecha\',this.value); guardar();"></td>' +
    '<td><b>Vigencia del permiso</b> — Hora inicio: <input type="time" style="width:90px" value="' + esc(estado.horaInicio) + '" onchange="aplicar(\'horaInicio\',this.value);guardar();">' +
    '&nbsp;Hora de finalización: <input type="time" style="width:90px" value="' + esc(estado.horaFin) + '" onchange="aplicar(\'horaFin\',this.value);guardar();"></td>' +
    '</tr></table>';
}

function seccionTareas() {
  let h = '<div class="seccion-t">DEFINICIÓN DE LAS TAREAS (Señale con una "X" los tipos de Permisos exigidos para la actividad a autorizar en "SI" o "NA")</div>';
  h += '<table><tr>';
  DATOS_FORMATO.tareas.forEach(t => {
    h += '<td class="titulo-col" style="width:16%">' + t.n + '.<br>' + t.short + '</td>';
  });
  h += '</tr><tr>';
  DATOS_FORMATO.tareas.forEach(t => {
    h += '<td class="center">' + radios('tareas.' + t.n, ['SI', 'NA']) + '</td>';
  });
  h += '</tr></table>';
  return h;
}

function seccionEPP() {
  let h = '<div class="seccion-t">MEDIDAS PREVENTIVAS Y DE PROTECCIÓN NECESARIAS PARA LOS CORRESPONDIENTES TRABAJOS (Marque los EPP requeridos)</div>';
  h += '<table><tr><td style="width:24%"><b>EQUIPO DE PROTECCIÓN PERSONAL EXIGIDO / RECOMENDADO</b></td><td>';
  h += '<table style="border:none">';
  const cols = 3;
  const per = Math.ceil(DATOS_FORMATO.epp.length / cols);
  for (let r = 0; r < per; r++) {
    h += '<tr>';
    for (let c = 0; c < cols; c++) {
      const idx = r + c * per;
      if (idx < DATOS_FORMATO.epp.length) {
        const epp = DATOS_FORMATO.epp[idx];
        h += '<td style="border:none"><label class="chip"><input type="checkbox" ' + (estado.epp[idx] ? 'checked' : '') +
          ' onchange="estado.epp[' + idx + ']=this.checked; guardar();"> ' + esc(epp) + '</label></td>';
      } else { h += '<td style="border:none"></td>'; }
    }
    h += '</tr>';
  }
  h += '<tr><td style="border:none">Otro: ' + campoTexto('eppOtro', '', '150px') + '</td><td style="border:none"></td><td style="border:none"></td></tr>';
  h += '</table></td></tr></table>';
  return h;
}

function seccionMediciones() {
  let h = '<div class="seccion-g">Mediciones atmosféricas del entorno (Para los TAR 2,4)</div><table><tr>';
  DATOS_FORMATO.mediciones.forEach(m => {
    h += '<td><b>' + esc(m.l) + ':</b><br><input type="number" step="any" style="width:100px" value="' + esc(estado.mediciones[m.k]) + '"' +
      ' oninput="aplicar(\'mediciones.' + m.k + '\',this.value); guardar();"></td>';
  });
  h += '</tr></table>';
  h += '<table><tr><td><b>Especificar herramientas a utilizar:</b><br>' + areaTexto('herramientas', 1) + '</td></tr>' +
    '<tr><td><b>Requisitos adicionales de seguridad (Si aplican):</b><br>' + areaTexto('requisitos', 1) + '</td></tr></table>';
  return h;
}

function seccionAutorizacion() {
  let h = '<div class="seccion-t">AUTORIZACIÓN (Se firma después de haber diligenciado y verificado el cumplimiento del permiso y listas de verificación)</div>';
  h += '<table><tr><td style="width:35%">' +
    '<b>He verificado las condiciones de acuerdo a la Lista de Verificación adjunta y autorizo el Permiso.</b><br>' +
    '<div class="firma-box">Firma y cédula del Emisor<br>_______________<br>' + campoTexto('firmas.emisorCodigo', 'Nombre y C.C.') + '</div></td>' +
    '<td style="width:65%"><b>Certifico que conozco el trabajo que voy a realizar, he consultado y conozco los procedimientos a emplear, ' +
    'dispongo y sé usar los EPP establecidos; he planeado con mis compañeros la forma segura de realizarlo y certifico que mis condiciones de salud ' +
    'no me impiden la realización de estos trabajos en forma segura (firmas ejecutantes)</b>' +
    '<table class="verif" style="margin-top:3px"><tr><th>N°</th><th>NOMBRE EJECUTANTE</th><th style="width:22%">FIRMA</th><th>N°</th><th>NOMBRE EJECUTANTE</th><th style="width:22%">FIRMA</th></tr>';
  for (let i = 0; i < 5; i++) {
    h += '<tr><td class="center">' + (i + 1) + '</td><td>' + campoTexto('ejecutantes.' + i + '.nombre') + '</td><td></td>' +
      '<td class="center">' + (i + 6) + '</td><td>' + campoTexto('ejecutantes.' + (i + 5) + '.nombre') + '</td><td></td></tr>';
  }
  h += '</table></td></tr>';
  h += '<tr><td><b>Certifico que conozco la realización del trabajo dentro de mi área (firma representante del área)</b><br>' +
    '<div class="firma-box">Firma y cédula del Representante del cliente<br>_______________<br>' + campoTexto('firmas.representanteCodigo', 'Nombre y C.C.') + '</div></td>' +
    '<td><b>Firma y cédula del Responsable del equipo ejecutante del trabajo</b><br>' +
    '<div class="firma-box">_______________<br>' + campoTexto('firmas.responsableCodigo', 'Nombre y C.C.') + '</div></td></tr>';
  h += '</table>';
  return h;
}

/* ---------------------- Listas de verificación dinámicas ---------------------- */
function checklistsActivas() {
  const secciones = [{ key: 'general', tareasSI: true }];
  const mapa = { 1: 'izaje', 2: 'caliente', 3: 'armado', 4: 'confinados', 5: 'energias', 6: 'frio' };
  for (const n in mapa) {
    if (estado.tareas[n] === 'SI') secciones.push({ key: mapa[n] });
  }
  return secciones;
}

function seccionVerificacionEdicion() {
  const secciones = checklistsActivas();
  let h = '';
  secciones.forEach(sec => {
    const cl = DATOS_FORMATO.checklists[sec.key];
    h += '<div class="seccion-t">LISTA DE VERIFICACIÓN PARA EMISIÓN DE PERMISOS — ' + cl.titulo + '</div>';
    h += '<table class="verif"><tr><th class="num">N°</th><th class="texto">Requisito</th><th style="width:7%">SI</th><th style="width:7%">NO</th><th style="width:7%">NA</th></tr>';
    cl.items.forEach((it, i) => {
      const prop = 'verif.' + sec.key + '.' + i;
      h += '<tr><td class="num">' + (i + 1) + '</td><td class="texto">' + esc(it) + '</td>';
      h += radiosCeldas(prop, ['SI', 'NO', 'NA']);
      h += '</tr>';
    });
    h += '</table>';
  });
  return h;
}

/* =====================================================================
   VISTA PREVIA — replica la apariencia del PDF (solo lectura)
   ===================================================================== */
function renderPrevia() {
  let h = '';
  h += cabeceraFormato();
  h += notasInstrucciones();

  // Localización
  h += '<div class="seccion-g">LOCALIZACIÓN DE LA ACTIVIDAD (Señale con una "X")</div>';
  h += '<table><tr>';
  DATOS_FORMATO.localizacion.forEach(loc => {
    if (loc === 'CUÁL:') {
      h += '<td class="center" style="width:16%">CUÁL: <b>' + esc(estado.otroCual || '') + '</b></td>';
    } else {
      const activo = estado.localizacion === loc;
      h += '<td class="center" style="width:16%">' + (activo ? '<b>X</b>' : '') + '&nbsp;' + loc + '</td>';
    }
  });
  h += '</tr></table>';

  // Datos generales
  h += '<table><tr>' +
    '<td style="width:26%"><b>Lugar específico:</b><br><b>' + esc(estado.lugarEspecifico) + '</b></td>' +
    '<td style="width:37%"><b>Nombre del solicitante del trabajo:</b><br><b>' + esc(estado.solicitante) + '</b>' +
    '<br><b>Responsable del equipo ejecutante:</b><br><b>' + esc(estado.responsableEquipo) + '</b></td>' +
    '<td style="width:37%"><b>Responsable del área:</b><br><b>' + esc(estado.responsableArea) + '</b>' +
    '<br><b>Empresa responsable de ejecutar:</b><br><b>' + esc(estado.empresaEjecutora) + '</b></td>' +
    '</tr><tr><td colspan="3"><b>Descripción detallada del trabajo a ejecutar:</b><br>' + esc(estado.descripcion) + '</td></tr></table>';

  // Ejecutantes
  h += '<div class="seccion-g">El ejecutante cuenta con la siguiente documentación vigente (Señale con una "X")</div>';
  h += '<table class="verif"><tr>' +
    '<th style="width:28%">Nombres y apellidos de ejecutantes asignados / C.C.</th>' +
    '<th>Afiliación SS<br>SI | NO</th><th>Aptitud médico<br>SI | NO</th><th>Certificación<br>SI | NO</th>' +
    '</tr>';
  estado.ejecutantes.forEach((ex, i) => {
    if (!ex.nombre && !ex.cc && !ex.ss) return;
    h += '<tr><td>' + (i + 1) + '. <b>' + esc(ex.nombre) + '</b> — C.C. <b>' + esc(ex.cc) + '</b></td>' +
      '<td class="center">' + (ex.ss === 'SI' ? 'X' : '') + ' | ' + (ex.ss === 'NO' ? 'X' : '') + '</td>' +
      '<td class="center">' + (ex.medico === 'SI' ? 'X' : '') + ' | ' + (ex.medico === 'NO' ? 'X' : '') + '</td>' +
      '<td class="center">' + (ex.cert === 'SI' ? 'X' : '') + ' | ' + (ex.cert === 'NO' ? 'X' : '') + '</td></tr>';
  });
  h += '</table>';

  // Fecha / vigencia
  h += '<table><tr><td style="width:50%"><b>Fecha de diligenciamiento del permiso:</b> <b>' + esc(estado.fecha) + '</b></td>' +
    '<td><b>Vigencia:</b> Hora inicio <b>' + esc(estado.horaInicio) + '</b> — finalización <b>' + esc(estado.horaFin) + '</b></td></tr></table>';

  // Tareas
  h += '<div class="seccion-t">DEFINICIÓN DE LAS TAREAS (Señale los Permisos exigidos: "SI" o "NA")</div>';
  h += '<table><tr>';
  DATOS_FORMATO.tareas.forEach(t => { h += '<td class="titulo-col" style="width:16%">' + t.n + '.<br>' + t.short + '</td>'; });
  h += '</tr><tr>';
  DATOS_FORMATO.tareas.forEach(t => {
    const v = estado.tareas[t.n];
    h += '<td class="center">' + (v === 'SI' ? '<b>X</b> SI' : '') + (v === 'NA' ? '<b>X</b> NA' : '') + '</td>';
  });
  h += '</tr></table>';

  // EPP
  h += '<div class="seccion-g">MEDIDAS PREVENTIVAS Y DE PROTECCIÓN NECESARIAS (EPP requeridos para la tarea)</div>';
  h += '<table><tr><td style="width:24%"><b>EQUIPO DE PROTECCIÓN PERSONAL EXIGIDO / RECOMENDADO</b></td><td>';
  const marcados = [];
  Object.keys(estado.epp).forEach(i => { if (estado.epp[i]) marcados.push(DATOS_FORMATO.epp[i] || ('# ' + i)); });
  if (estado.eppOtro) marcados.push('Otro: ' + estado.eppOtro);
  h += marcados.length ? marcados.join(', ') : '&nbsp;';
  h += '</td></tr></table>';

  // Mediciones y requisitos
  h += '<div class="seccion-g">Mediciones atmosféricas del entorno (Para los TAR 2,4)</div><table><tr>';
  DATOS_FORMATO.mediciones.forEach(m => {
    h += '<td><b>' + esc(m.l) + ':</b> <b>' + esc(estado.mediciones[m.k] || '') + '</b></td>';
  });
  h += '</tr></table>';
  h += '<table><tr><td><b>Herramientas a utilizar:</b> ' + esc(estado.herramientas) + '</td></tr>' +
    '<tr><td><b>Requisitos adicionales de seguridad:</b> ' + esc(estado.requisitos) + '</td></tr></table>';

  // Autorización
  h += '<div class="seccion-t">AUTORIZACIÓN (Se firma después de haber diligenciado y verificado el cumplimiento del permiso y listas de verificación)</div>';
  h += '<table><tr><td style="width:38%">' +
    '<b>He verificado las condiciones de acuerdo a la Lista de Verificación adjunta y autorizo el Permiso.</b>' +
    '<div class="firma-box">Firma y cédula del Emisor<br><b>' + esc(estado.firmas.emisorCodigo) + '</b></div></td>' +
    '<td><b>Certifico que conozco el trabajo que voy a realizar... (firmas ejecutantes)</b>' +
    '<table class="verif" style="margin-top:3px"><tr><th>N°</th><th>NOMBRE EJECUTANTE</th><th>FIRMA</th></tr>';
  estado.ejecutantes.forEach((ex, i) => {
    if (!ex.nombre) { h += '<tr><td class="center">' + (i + 1) + '</td><td>&nbsp;</td><td>&nbsp;</td></tr>'; }
    else { h += '<tr><td class="center">' + (i + 1) + '</td><td><b>' + esc(ex.nombre) + '</b></td><td><!--firma--></td></tr>'; }
  });
  h += '</table></td></tr>' +
    '<tr><td><b>Certifico que conozco la realización del trabajo dentro de mi área (firma representante del área)</b>' +
    '<div class="firma-box">Firma y cédula del Representante del cliente<br><b>' + esc(estado.firmas.representanteCodigo) + '</b></div></td>' +
    '<td><b>Firma y cédula del Responsable del equipo ejecutante del trabajo</b>' +
    '<div class="firma-box"><b>' + esc(estado.firmas.responsableCodigo) + '</b></div></td></tr></table>';

  // Revalidación / cancelación
  h += '<div class="seccion-g">REVALIDACIÓN / CANCELACIÓN (Si se cambian los ejecutantes, debe solicitarse un nuevo Permiso)</div>';
  h += '<table><tr><td style="width:50%">' +
    'REVALIDACIÓN<br>Fecha: <b>' + esc(estado.revalidacion.fecha) + '</b> &nbsp; Hora desde: <b>' + esc(estado.revalidacion.horaDesde) + '</b> &nbsp; hasta: <b>' + esc(estado.revalidacion.horaHasta) + '</b><br>' +
    '<div class="firma-box">Firma del Emisor<br>_______________</div>' +
    '<div class="firma-box">Firma del Representante del cliente<br>_______________</div>' +
    '<div class="firma-box">Firma Responsable del equipo ejecutante<br>_______________</div></td>' +
    '<td>CANCELACIÓN<br>Hora: ______ Motivo: <b>' + esc(estado.revalidacion.motivo) + '</b><br>' +
    '<div class="firma-box">Firma del responsable de la Cancelación del Permiso<br>_______________</div></td></tr></table>';

  // Satisfacción del trabajo
  h += '<div class="seccion-g">SATISFACCIÓN DEL TRABAJO REALIZADO EN FORMA SEGURA</div>';
  h += '<table><tr><td><b>Trabajo terminado?</b> SI [' + (estado.satisfaccion.terminado === 'SI' ? 'X' : '') + '] NO [' + (estado.satisfaccion.terminado === 'NO' ? 'X' : '') + ']' +
    '&nbsp;&nbsp;<b>Lugar limpio y organizado?</b> SI [' + (estado.satisfaccion.limpio === 'SI' ? 'X' : '') + '] NO [' + (estado.satisfaccion.limpio === 'NO' ? 'X' : '') + ']</td></tr>' +
    '<tr><td><b>Las etiquetas fueron retiradas en caso de trabajos con energías peligrosas?</b> SI [' + (estado.satisfaccion.etiquetas === 'SI' ? 'X' : '') + '] NA [' + (estado.satisfaccion.etiquetas === 'NA' ? 'X' : '') + ']' +
    '&nbsp;&nbsp;<b>Fecha:</b> ' + esc(estado.satisfaccion.fecha) + ' <b>Hora:</b> ' + esc(estado.satisfaccion.hora) + '</td></tr></table>';

  // Seguimiento
  h += '<div class="seccion-g">SEGUIMIENTO A LA EJECUCIÓN DEL TRABAJO</div>';
  h += '<table class="verif"><tr><th style="width:45%">Nombres y Apellidos del responsable del seguimiento</th><th style="width:15%">Hora</th><th>Observaciones</th></tr>';
  (estado.seguimiento.length ? estado.seguimiento : [{ nombre: '', hora: '', obs: '' }]).forEach(s => {
    h += '<tr><td><b>' + esc(s.nombre) + '</b></td><td class="center">' + esc(s.hora) + '</td><td>' + esc(s.obs) + '</td></tr>';
  });
  h += '</table>';

  // Listas de verificación
  const secciones = checklistsActivas();
  secciones.forEach(sec => {
    const cl = DATOS_FORMATO.checklists[sec.key];
    h += '<div class="seccion-t">LISTA DE VERIFICACIÓN PARA EMISIÓN DE PERMISOS — ' + cl.titulo + '</div>';
    h += '<table class="verif"><tr><th class="num">N°</th><th class="texto">Requisito</th><th style="width:9%">SI</th><th style="width:9%">NO</th><th style="width:9%">NA</th></tr>';
    cl.items.forEach((it, i) => {
      const v = getDeep(estado, 'verif.' + sec.key + '.' + i);
      h += '<tr><td class="num">' + (i + 1) + '</td><td class="texto">' + esc(it) + '</td>' +
        '<td class="center">' + (v === 'SI' ? 'X' : '') + '</td>' +
        '<td class="center">' + (v === 'NO' ? 'X' : '') + '</td>' +
        '<td class="center">' + (v === 'NA' ? 'X' : '') + '</td></tr>';
    });
    h += '</table>';
  });

  return h;
}

/* =====================================================================
   REGLAS DE NEGOCIO
   ===================================================================== */
function evalPermiso() {
  let hayNO = false;
  let completado = true;

  estado.ejecutantes.forEach(ex => {
    if ((ex.ss || ex.medico || ex.cert) && (ex.ss === 'NO' || ex.medico === 'NO' || ex.cert === 'NO')) hayNO = true;
  });
  for (const n in estado.tareas) {
    if (estado.tareas[n] === 'SI') {
      const clave = { 1: 'izaje', 2: 'caliente', 3: 'armado', 4: 'confinados', 5: 'energias', 6: 'frio' }[n];
      DATOS_FORMATO.checklists[clave].items.forEach((it, i) => {
        const v = getDeep(estado, 'verif.' + clave + '.' + i);
        if (v === 'NO') hayNO = true;
        if (!v) completado = false;
      });
    }
  }
  // Solicitante blanca -> no concedido (regla de espacios en blanco)
  if (!estado.solicitante || !estado.lugarEspecifico) completado = false;

  const badge = $('estado');
  if (hayNO) { badge.textContent = 'NO CONCEDIDO'; badge.className = 'badge-no'; }
  else if (completado) { badge.textContent = 'CONCEDIDO'; badge.className = 'badge-ok'; }
  else { badge.textContent = 'INCOMPLETO'; badge.className = 'badge-warn'; }
}

/* =====================================================================
   RENDER + MODO + IMPRESIÓN
   ===================================================================== */
function renEdicion() {
  const hoja = $('hoja-edicion');
  if (!hoja) return;
  let h = cabeceraFormato() + notasInstrucciones();
  h += seccionLocalizacion() + '<br>' + seccionDatosGenerales();
  h += '<br>' + seccionEjecutantes() + '<br>' + seccionFechaVigencia();
  h += '<br>' + seccionTareas() + '<br>' + seccionEPP();
  h += '<br>' + seccionMediciones() + '<br>' + seccionAutorizacion();
  h += '<br>' + seccionVerificacionEdicion();
  hoja.innerHTML = h;
}

function renPrevia() {
  const hoja = $('hoja-previo');
  if (!hoja) return;
  hoja.innerHTML = renderPrevia();
}

function cambiarModo(modo) {
  document.body.className = (modo === 'previo') ? 'modo-previo' : 'modo-edicion';
  renEdicion();
  renPrevia();
}
function imprimir() {
  renEdicion();
  renPrevia();
  cambiarModo('previo');
  window.print();
}
function nuevoPermiso() {
  if (!confirm('¿Crear un nuevo permiso? Se borrará el actual.')) return;
  estado = estadoInicial();
  guardar();
  renEdicion();
  renPrevia();
  evalPermiso();
}

/* Inicialización */
renEdicion();
renPrevia();
evalPermiso();