/*
 * Indicadores — FT-OPE-56 CONTROL DE ASISTENCIA DE OPERACIONES
 */
module.exports = [
  {
    codigo: 'KP13',
    nombre: 'Asistencia total registrada',
    tipo: 'contador',
    calcular: regs => regs.reduce((acc, r) => {
      const reg = (r.data && r.data.asistencia) || [];
      return acc + reg.length;
    }, 0)
  },
  {
    codigo: 'KP14',
    nombre: 'Asistencia promedio por sesión',
    tipo: 'contador',
    calcular: regs => {
      if (!regs.length) return 0;
      const suma = regs.reduce((acc, r) => acc + (((r.data && r.data.asistencia) || []).length), 0);
      return Math.round((suma / regs.length) * 10) / 10;
    }
  },
  {
    codigo: 'KP15',
    nombre: 'Sesiones registradas',
    tipo: 'contador',
    calcular: regs => regs.length
  },
  {
    codigo: 'KP15b',
    nombre: 'Sesiones por regional',
    tipo: 'lista',
    calcular: regs => {
      const mapa = {};
      regs.forEach(r => {
        const reg = (r.data && r.data.regional) || 'SIN REGIONAL';
        mapa[reg] = (mapa[reg] || 0) + 1;
      });
      return Object.entries(mapa).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—';
    }
  }
];