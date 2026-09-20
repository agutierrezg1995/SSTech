/*
 * Indicadores — FT-SST-11 REPORTE DE INVESTIGACIÓN DE A.T E I.T
 */
module.exports = [
  {
    codigo: 'KP19',
    nombre: 'Total de eventos reportados (A.T / I.T / otros)',
    tipo: 'contador',
    calcular: regs => regs.length
  },
  {
    codigo: 'KP19b',
    nombre: 'Desglose por clasificación',
    tipo: 'lista',
    calcular: regs => {
      const mapa = {};
      regs.forEach(r => {
        const c = (r.data && r.data.clasificacion) || 'SIN CLASIFICAR';
        mapa[c] = (mapa[c] || 0) + 1;
      });
      return Object.entries(mapa).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—';
    }
  },
  {
    codigo: 'KP20',
    nombre: 'Días totales de incapacidad/paro',
    tipo: 'contador',
    calcular: regs => regs.reduce((acc, r) => {
      const d = (r.data && r.data.diasIncapacidad) ? Number(r.data.diasIncapacidad) : 0;
      return acc + (isNaN(d) ? 0 : d);
    }, 0)
  },
  {
    codigo: 'KP21',
    nombre: 'Causas con mayor contenido (top)',
    tipo: 'lista',
    calcular: regs => {
      const causas = { causaManoObra: 'Mano de obra', causaMetodo: 'Método', causaMaquinaria: 'Maquinaria', causaMateriales: 'Materiales', causaMedioAmbiente: 'Medio ambiente', causaMedicion: 'Medición' };
      const mapa = {};
      regs.forEach(r => {
        const d = r.data || {};
        Object.keys(causas).forEach(k => {
          if (d[k] && String(d[k]).trim().length > 3) mapa[causas[k]] = (mapa[causas[k]] || 0) + 1;
        });
      });
      return Object.entries(mapa).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—';
    }
  },
  {
    codigo: 'KP22',
    nombre: '% plan de acción con responsable asignado',
    tipo: 'porcentaje',
    calcular: regs => {
      if (!regs.length) return 0;
      const ok = regs.filter(r => {
        const pa = (r.data && r.data.planAccion) || [];
        return pa.length > 0 && pa.some(f => f.responsable && String(f.responsable).trim());
      }).length;
      return Math.round((ok / regs.length) * 100);
    }
  },
  {
    codigo: 'KP22b',
    nombre: 'Promedio de acciones por reporte',
    tipo: 'contador',
    calcular: regs => {
      if (!regs.length) return 0;
      const suma = regs.reduce((acc, r) => acc + (((r.data && r.data.planAccion) || []).length), 0);
      return Math.round((suma / regs.length) * 10) / 10;
    }
  }
];