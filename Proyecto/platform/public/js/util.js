/* ============================================================
   SSTech SaaS — Utilidades y helpers
   ============================================================ */

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function api(path, opts) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('sstech_token');
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  let res;
  try {
    res = await fetch(path, {
      headers,
      signal: ctrl.signal,
      ...opts
    });
  } catch (e) {
    clearTimeout(timer);
    throw new Error(e.name === 'AbortError'
      ? 'La solicitud tardó demasiado. Verifica que el servidor esté activo.'
      : 'No se pudo conectar al servidor.');
  }
  clearTimeout(timer);
  if (res.status === 401 && !path.includes('/auth/')) {
    // sesión expirada
    localStorage.removeItem('sstech_token');
    localStorage.removeItem('sstech_usuario');
    if (window.UI) UI.mostrarLogin();
  }
  if (!res.ok) {
    let msg = 'Error ' + res.status;
    try { msg = (await res.json()).error || msg; } catch (e) {}
    throw new Error(msg);
  }
  return res.json();
}

function getByPath(obj, path) {
  if (!path || !obj) return undefined;
  return String(path).split('.').reduce((acc, p) => (acc == null ? undefined : acc[p]), obj);
}

function setByPath(obj, path, value) {
  const partes = String(path).split('.');
  let cur = obj;
  for (let i = 0; i < partes.length - 1; i++) {
    if (cur[partes[i]] == null || typeof cur[partes[i]] !== 'object')
      cur[partes[i]] = {};
    cur = cur[partes[i]];
  }
  cur[partes[partes.length - 1]] = value;
}

/* Inicializa la estructura de datos a partir del esquema */
function inicialData(esquema) {
  const d = {};
  (esquema.secciones || []).forEach(sec => {
    if (sec.campos) sec.campos.forEach(c => {
      if (c.type === 'checklist-sec') return;
      if (c.type === 'tabla') { d[c.key] = []; return; }
      if (c.type === 'tablaDinamica') { d[c.key] = c.filas ? c.filas.map(() => ({})) : [{}]; return; }
      if (c.type === 'radio' && c.opciones) { d[c.key] = c.default || ''; return; }
      if (c.type === 'checkbox' && c.opciones) { d[c.key] = {}; return; }
      d[c.key] = c.default != null ? c.default : '';
    });
    if (sec.tabla) {
      d[sec.tabla.key || 'tabla'] = sec.tabla.filas ? sec.tabla.filas.map(() => ({})) : [{}];
    }
    if (sec.tareas) {
      d[sec.tareas.key || 'tareas'] = {};
      (sec.tareas.items || sec.tareas.opciones || []).forEach(t => {
        d[sec.tareas.key || 'tareas'][t.n] = '';
      });
    }
    if (sec.checklists) {
      d[sec.checklists.key || 'verif'] = {};
      const grupos = Array.isArray(sec.checklists.grupos)
        ? sec.checklists.grupos
        : Object.keys(sec.checklists.grupos || {}).map(k => ({ key: k, ...sec.checklists.grupos[k] }));
      grupos.forEach(g => {
        d[sec.checklists.key || 'verif'][g.key] = (g.items || []).map(() => '');
      });
    }
  });
  return d;
}

/* Estado en formato pill (para tabla) */
function pillEstado(estado) {
  const limpio = String(estado || 'BORRADOR').toUpperCase().replace(/ /g, '_');
  return `<span class="estado-pill estado-${limpio}">${esc(estado || 'BORRADOR')}</span>`;
}

/* Fechas */
function fmtFecha(v) {
  if (!v) return '';
  const d = new Date(v.length === 10 ? v + 'T00:00:00' : v);
  if (isNaN(d)) return v;
  return d.toLocaleDateString('es-CO');
}
function fmtFechaHora(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d)) return v;
  return d.toLocaleString('es-CO');
}

/* Estado del permiso según regla de negocio */
function estadoPermiso(data) {
  const verif = data && data.verif ? data.verif : {};
  let tieneNegativo = false;
  Object.keys(verif).forEach(g => {
    (verif[g] || []).forEach(v => {
      if (String(v).toUpperCase() === 'NO') tieneNegativo = true;
    });
  });
  return tieneNegativo ? 'NO CONCEDIDO' : 'CONCEDIDO';
}