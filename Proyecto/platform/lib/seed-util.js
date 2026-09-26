/*
 * seed-util.js — Helpers de construcción de datos para la siembra.
 * Replica la lógica de inicialData del frontend (public/js/util.js)
 * para generar estructuras completas acordes al esquema.
 */

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
      d[sec.tabla.key || 'tabla'] = sec.tabla.filas ? sec.tabla.filas.map(() => ({})) : [];
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

module.exports = { inicialData };