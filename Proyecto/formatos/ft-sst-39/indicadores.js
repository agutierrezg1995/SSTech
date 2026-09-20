/*
 * Indicadores — FT-SST-39 CONTROL DE ENTREGAS DE EPP
 */
module.exports = [
  {
    codigo: 'KP26',
    nombre: 'Total de elementos entregados',
    tipo: 'contador',
    calcular: regs => {
      const epps = ['casco', 'barbuquejo', 'guanteKleenguard', 'guanteIngeniero', 'guanteCarnaza', 'gafasClaro', 'gafasOscuro', 'tapaOidos', 'tapabocas', 'delantal'];
      return regs.reduce((acc, r) => {
        const entregas = (r.data && r.data.entregas) || [];
        return acc + entregas.reduce((acc2, f) => acc2 + epps.reduce((a, k) => {
          const v = f[k];
          const si = v === true || String(v).toUpperCase() === 'SI' || String(v).trim() === 'X';
          return a + (si ? 1 : 0);
        }, 0), 0);
      }, 0);
    }
  },
  {
    codigo: 'KP26b',
    nombre: 'Trabajadores a los que se hicieron entregas',
    tipo: 'contador',
    calcular: regs => {
      const cedulas = new Set();
      regs.forEach(r => {
        const entregas = (r.data && r.data.entregas) || [];
        entregas.forEach(f => {
          if (f.cedula) cedulas.add(String(f.cedula).trim());
        });
      });
      return cedulas.size;
    }
  },
  {
    codigo: 'KP27',
    nombre: 'Promedio de EPP por entrega',
    tipo: 'contador',
    calcular: regs => {
      const epps = ['casco', 'barbuquejo', 'guanteKleenguard', 'guanteIngeniero', 'guanteCarnaza', 'gafasClaro', 'gafasOscuro', 'tapaOidos', 'tapabocas', 'delantal'];
      let total = 0, filas = 0;
      regs.forEach(r => {
        const entregas = (r.data && r.data.entregas) || [];
        entregas.forEach(f => {
          filas++;
          epps.forEach(k => {
            const v = f[k];
            if (v === true || String(v).toUpperCase() === 'SI' || (typeof v === 'string' && v.trim() === 'X')) total++;
          });
        });
      });
      if (!filas) return 0;
      return Math.round((total / filas) * 10) / 10;
    }
  },
  {
    codigo: 'KP28',
    nombre: 'Tipo de entrega más frecuente',
    tipo: 'lista',
    calcular: regs => {
      const mapa = {};
      regs.forEach(r => {
        const t = (r.data && r.data.tipoEntrega) || 'SIN ESPECIFICAR';
        mapa[t] = (mapa[t] || 0) + 1;
      });
      return Object.entries(mapa).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—';
    }
  }
];