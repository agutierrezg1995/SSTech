/*
 * Indicadores — FT-OPE-51 PERMISO DE TRABAJO EN ALTURAS
 */
function pct(parte, total) {
  return total ? Math.round((parte / total) * 100) : 0;
}

const conValor = (regs, path) => regs.filter(r => {
  const d = r.data || {};
  const partes = String(path).split('.');
  let cur = d;
  for (const p of partes) {
    if (cur == null) return false;
    cur = cur[p];
  }
  return Boolean(marcado(cur));
});

function marcado(v) {
  if (typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object' && v) return Object.values(v).some(marcado);
  return Boolean(v && String(v).trim() !== '');
}

module.exports = [
  {
    codigo: 'KP9',
    nombre: 'Total de permisos de altura',
    tipo: 'contador',
    calcular: regs => regs.length
  },
  {
    codigo: 'KP10',
    nombre: '% con ayudante de seguridad designado',
    tipo: 'porcentaje',
    calcular: regs => pct(conValor(regs, 'ayudanteNombre'), regs.length)
  },
  {
    codigo: 'KP11',
    nombre: '% con distancia de caída verificada (SI)',
    tipo: 'porcentaje',
    calcular: regs => pct(conValor(regs, 'caida.siNo'), regs.length)
  },
  {
    codigo: 'KP12',
    nombre: 'NO-conformidad en checklist de alturas',
    tipo: 'porcentaje',
    calcular: regs => {
      let no = 0, items = 0;
      regs.forEach(r => {
        const v = (r.data && r.data.verif) || {};
        Object.keys(v).forEach(g => {
          (v[g] || []).forEach(x => { items++; if (String(x).toUpperCase() === 'NO') no++; });
        });
      });
      return pct(no, items);
    }
  },
  {
    codigo: 'KP12b',
    nombre: 'Sistemas de prevención utilizados (top)',
    tipo: 'lista',
    calcular: regs => {
      const mapa = {};
      regs.forEach(r => {
        const d = r.data || {};
        const opc = { prev_barandas: 'Barandas', prev_lineas: 'Líneas de advertencia', prev_ing: 'Sistema de Ingeniería', prev_acceso: 'Control de acceso' };
        Object.keys(opc).forEach(k => {
          if (d[k] === true) mapa[opc[k]] = (mapa[opc[k]] || 0) + 1;
        });
      });
      return Object.entries(mapa).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—';
    }
  }
];