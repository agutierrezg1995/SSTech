/*
 * Indicadores — FT-SST-37 ANÁLISIS DE TRABAJO SEGURO (ATS)
 */
function pct(parte, total) {
  return total ? Math.round((parte / total) * 100) : 0;
}

module.exports = [
  {
    codigo: 'KP23',
    nombre: 'Total de ATS',
    tipo: 'contador',
    calcular: regs => regs.length
  },
  {
    codigo: 'KP23b',
    nombre: 'Trabajos de alto riesgo más frecuentes',
    tipo: 'lista',
    calcular: regs => {
      const tareas = { 1: 'IZAJE', 2: 'CALIENTE', 3: 'EXCAVACIONES', 4: 'CONFINADOS', 5: 'ALTURAS', 6: 'ENERGÍAS', 7: 'RED FRÍO' };
      const mapa = {};
      regs.forEach(r => {
        const t = (r.data && r.data.tareasAr) || {};
        Object.keys(tareas).forEach(n => {
          if (t[n] === 'SI') { const nombre = tareas[n]; mapa[nombre] = (mapa[nombre] || 0) + 1; }
        });
      });
      return Object.entries(mapa).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—';
    }
  },
  {
    codigo: 'KP24',
    nombre: 'Promedio de pasos descritos por ATS',
    tipo: 'contador',
    calcular: regs => {
      if (!regs.length) return 0;
      const suma = regs.reduce((acc, r) => acc + (((r.data && r.data.pasos) || []).length), 0);
      return Math.round((suma / regs.length) * 10) / 10;
    }
  },
  {
    codigo: 'KP24b',
    nombre: '% ATS con peligros registrados',
    tipo: 'porcentaje',
    calcular: regs => {
      const ok = regs.filter(r => {
        const d = r.data || {};
        const peligros = d.peligrosIdentificados && String(d.peligrosIdentificados).trim();
        const pasos = (d.pasos || []).filter(p => p.peligros && String(p.peligros).trim()).length;
        return Boolean(peligros || pasos);
      }).length;
      return pct(ok, regs.length);
    }
  },
  {
    codigo: 'KP25',
    nombre: 'Tamaño promedio del equipo de trabajo',
    tipo: 'contador',
    calcular: regs => {
      if (!regs.length) return 0;
      const suma = regs.reduce((acc, r) => acc + (((r.data && r.data.equipo) || []).length), 0);
      return Math.round((suma / regs.length) * 10) / 10;
    }
  }
];