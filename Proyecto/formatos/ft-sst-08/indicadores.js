/*
 * Indicadores — FT-SST-08 CONTROL SEMANAL DE PAUSAS ACTIVAS
 */
module.exports = [
  {
    codigo: 'KP16',
    nombre: 'Sesiones (semanas) registradas',
    tipo: 'contador',
    calcular: regs => regs.length
  },
  {
    codigo: 'KP17',
    nombre: 'Participantes promedio por sesión',
    tipo: 'contador',
    calcular: regs => {
      if (!regs.length) return 0;
      const suma = regs.reduce((acc, r) => acc + (((r.data && r.data.participantes) || []).length), 0);
      return Math.round((suma / regs.length) * 10) / 10;
    }
  },
  {
    codigo: 'KP17b',
    nombre: 'Total de participaciones',
    tipo: 'contador',
    calcular: regs => regs.reduce((acc, r) => acc + (((r.data && r.data.participantes) || []).length), 0)
  },
  {
    codigo: 'KP18',
    nombre: 'Cumplimiento (%=vía con registro)',
    tipo: 'porcentaje',
    calcular: regs => {
      const objetivo = 1; // al menos una sesión con participantes en el período
      if (!regs.length) return 0;
      const conSesion = regs.filter(r => ((r.data && r.data.participantes) || []).length > 0).length;
      return Math.round((conSesion / regs.length) * 100);
    }
  }
];