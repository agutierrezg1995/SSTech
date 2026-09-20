/* ============================================================
   SSTech SaaS — Configuración de validaciones por formato
   + Motor genérico de validación del formulario
   ============================================================ */

const VALIDACION_FORMATOS = {
  'ft-ope-06': {
    fechasHoy: ['fecha'],
    requeridos: [
      'localizacion', 'lugarEspecifico', 'solicitante', 'responsableEquipo',
      'responsableArea', 'empresaEjecutora', 'descripcion', 'horaInicio', 'horaFin'
    ],
    tablas: {
      ejecutantes: { requerida: true, columnas: ['nombre', 'cc'] }
    }
  },

  'ft-ope-51': {
    fechasHoy: ['fecha', 'satisfaccion.fecha'],
    requeridos: [
      'lugarEspecifico', 'trabajo', 'descripcion', 'horaInicio', 'horaFin',
      'altura', 'ayudanteNombre', 'caida.a', 'caida.b', 'caida.c', 'caida.e',
      'caida.d', 'caida.f', 'caida.siNo', 'firmas.emisor'
    ],
    tablas: {
      personal: { requerida: true, columnas: ['nombre', 'numero'] }
    }
  },

  'ft-ope-56': {
    fechasHoy: ['fecha'],
    requeridos: ['regional', 'ot', 'cliente', 'responsable'],
    tablas: {
      asistencia: { requerida: true, columnas: ['nombre', 'cedula'] }
    }
  },

  'ft-sst-08': {
    requeridos: ['mes', 'semana', 'anio', 'realiza', 'regional', 'revisa'],
    tablas: {
      participantes: { requerida: true, columnas: ['nombres', 'cc'] }
    }
  },

  'ft-sst-11': {
    fechasHoy: ['fechaReporte'],
    requeridos: [
      'clasificacion', 'afectado', 'nit', 'cargo', 'fechaIngreso', 'ciudad',
      'responsable', 'cargoResponsable', 'fechaReporte', 'fechaEvento',
      'horaEvento', 'turno', 'areaProceso', 'sitioOcurrencia', 'queOcurrio'
    ],
    numeros: { diasIncapacidad: { min: 0 } },
    tablas: {
      planAccion: { requerida: true, columnas: ['control', 'responsable'] }
    }
  },

  'ft-sst-37': {
    fechasHoy: [],
    requeridos: [
      'trabajo', 'sitio', 'cliente', 'ciudad', 'fecha', 'peligrosIdentificados'
    ],
    tablas: {
      pasos: { requerida: true, columnas: ['paso', 'peligros', 'medidas'] },
      equipo: { requerida: true, columnas: ['nombre', 'cedula'] }
    }
  },

  'ft-sst-39': {
    fechasHoy: ['fechaLote'],
    requeridos: ['fechaLote'],
    tablas: {
      entregas: { requerida: true, columnas: ['cedula', 'nombre', 'cargo'] }
    }
  }
};

function coerce(v) {
  return v == null ? '' : String(v).trim();
}

function hoyISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const g = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + g;
}

function validarFormulario(esquema, data) {
  const cfg = VALIDACION_FORMATOS[esquema.id] || {};
  const errores = [];
  const push = (ruta, msg) => errores.push({ ruta, msg });

  (cfg.requeridos || []).forEach(r => {
    if (coerce(getByPath(data, r)) === '') push(r, 'Campo obligatorio');
  });

  (cfg.fechasHoy || []).forEach(r => {
    const v = getByPath(data, r);
    if (coerce(v) === '') { push(r, 'La fecha es obligatoria'); return; }
    if (String(v) > hoyISO()) push(r, 'La fecha no puede ser posterior a hoy');
  });

  Object.entries(cfg.numeros || {}).forEach(([ruta, regla]) => {
    const v = getByPath(data, ruta);
    if (v === '' || v == null) return;
    const n = Number(v);
    if (isNaN(n)) { push(ruta, 'Debe ser un número'); return; }
    if (regla.min != null && n < regla.min) push(ruta, 'Debe ser mayor o igual a ' + regla.min);
    if (regla.max != null && n > regla.max) push(ruta, 'Debe ser menor o igual a ' + regla.max);
  });

  Object.entries(cfg.tablas || {}).forEach(([tablaKey, tcfg]) => {
    const filas = data[tablaKey] || [];
    const conDatos = filas.filter(f => tcfg.columnas.some(c => coerce(f[c]) !== ''));
    if (tcfg.requerida && conDatos.length === 0) {
      push(tablaKey, 'Debe registrar al menos una fila válida');
      return;
    }
    if (tcfg.columnas) {
      filas.forEach((f, i) => tcfg.columnas.forEach(c => {
        if (coerce(f[c]) === '') push(tablaKey + '.' + i + '.' + c, 'Fila ' + (i + 1) + ': campo obligatorio');
      }));
    }
  });

  const secTareas = (esquema.secciones || []).find(s => s.tareas);
  if (secTareas && cfg.tareas !== false) {
    const key = secTareas.tareas.key || 'tareas';
    const items = secTareas.tareas.items || secTareas.tareas.opciones || [];
    items.forEach(t => {
      if (coerce((data[key] || {})[t.n]) === '') {
        push(key + '.' + t.n, 'Debe responder ' + (t.nombre || t.texto || 'la tarea ' + t.n));
      }
    });
  }

  const secChecks = (esquema.secciones || []).find(s => s.checklists);
  if (secChecks) {
    const key = secChecks.checklists.key || 'verif';
    const grupos = Array.isArray(secChecks.checklists.grupos)
      ? secChecks.checklists.grupos
      : Object.keys(secChecks.checklists.grupos || {}).map(k => ({ key: k, ...secChecks.checklists.grupos[k] }));
    grupos.forEach(g => {
      const aplica = g.soloSi ? (data.tareas || {})[g.soloSi] === 'SI' : true;
      if (!aplica) return;
      (g.items || []).forEach((it, i) => {
        const v = (data[key] && data[key][g.key]) ? data[key][g.key][i] : '';
        if (coerce(v) === '') push(key + '.' + g.key + '.' + i, 'Falta marcar SI/NO en ' + (g.titulo || g.key));
      });
    });
  }

  return errores;
}

function aplicarAutoFechas(esquema, data) {
  const cfg = VALIDACION_FORMATOS[esquema.id] || {};
  const hoy = hoyISO();
  (cfg.fechasHoy || []).forEach(r => {
    setByPath(data, r, getByPath(data, r) || hoy);
  });
}

/* ---------- Resaltado de errores en el formulario ---------- */
function limpiarErroresUI() {
  document.querySelectorAll('.invalid').forEach(e => e.classList.remove('invalid'));
}

function quitarErrorUI(ruta) {
  document.querySelectorAll('[data-path="' + ruta + '"]').forEach(el => el.classList.remove('invalid'));
}

function marcarErroresUI(errores) {
  limpiarErroresUI();
  errores.forEach(e => {
    document.querySelectorAll('[data-path="' + e.ruta + '"]').forEach(el => el.classList.add('invalid'));
  });
  const primero = document.querySelector('.invalid');
  if (primero) primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
}