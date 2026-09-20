/*
 * Indicadores — FT-OPE-06 PERMISO DE TRABAJO EN CAMPO
 * Cada indicador: { codigo, nombre, tipo, calcular(registros) => valor }
 * Se calculan sobre los registros ya filtrados por rango de fechas y localización.
 */

function total(regs) { return regs.length; }

function conteoPorEstado(regs, estado) {
  return regs.filter(r => r.estado === estado).length;
}

function pct(parte, total) {
  if (!total) return 0;
  return Math.round((parte / total) * 100);
}

module.exports = [
  {
    codigo: 'KP1',
    nombre: 'Total de permisos emitidos',
    tipo: 'contador',
    calcular: total
  },
  {
    codigo: 'KP2',
    nombre: '% permisos CONCEDIDOS',
    tipo: 'porcentaje',
    calcular: regs => pct(conteoPorEstado(regs, 'CONCEDIDO'), regs.length)
  },
  {
    codigo: 'KP3',
    nombre: 'Índice de NO-conformidad (NO / ítems verificados)',
    tipo: 'porcentaje',
    calcular: regs => {
      let no = 0, items = 0;
      regs.forEach(r => {
        const v = (r.data && r.data.verif) || {};
        Object.keys(v).forEach(g => {
          (v[g] || []).forEach(x => {
            items++;
            if (String(x).toUpperCase() === 'NO') no++;
          });
        });
      });
      return pct(no, items);
    }
  },
  {
    codigo: 'KP4',
    nombre: 'Permisos por localización (top)',
    tipo: 'lista',
    calcular: regs => {
      const mapa = {};
      regs.forEach(r => {
        const loc = (r.data && r.data.localizacion) || 'SIN ESPECIFICAR';
        mapa[loc] = (mapa[loc] || 0) + 1;
      });
      return Object.entries(mapa).sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ') || '—';
    }
  },
  {
    codigo: 'KP5',
    nombre: 'Distribución por tipo de tarea',
    tipo: 'lista',
    calcular: regs => {
      const tareas = {
        1: 'IZAJE', 2: 'CALIENTE', 3: 'ARMADO',
        4: 'CONFINADOS', 5: 'ENERGÍAS', 6: 'RED FRÍO'
      };
      const mapa = {};
      regs.forEach(r => {
        const t = (r.data && r.data.tareas) || {};
        Object.keys(tareas).forEach(n => {
          if (t[n] === 'SI') {
            const nombre = tareas[n];
            mapa[nombre] = (mapa[nombre] || 0) + 1;
          }
        });
      });
      return Object.entries(mapa).sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k}: ${v}`).join(' · ') || '—';
    }
  },
  {
    codigo: 'KP6',
    nombre: 'Trabajadores promedio por permiso',
    tipo: 'contador',
    calcular: regs => {
      if (!regs.length) return 0;
      const suma = regs.reduce((acc, r) => {
        const ejec = (r.data && r.data.ejecutantes) || [];
        return acc + ejec.length;
      }, 0);
      return Math.round((suma / regs.length) * 10) / 10;
    }
  },
  {
    codigo: 'KP7',
    nombre: 'Permisos con respuesta NO en lista de verificación',
    tipo: 'contador',
    calcular: regs => regs.filter(r => {
      const v = (r.data && r.data.verif) || {};
      return Object.keys(v).some(g => (v[g] || []).includes('NO'));
    }).length
  },
  {
    codigo: 'KP8',
    nombre: 'Duración promedio (horas)',
    tipo: 'contador',
    calcular: regs => {
      if (!regs.length) return 0;
      const sum = regs.reduce((acc, r) => {
        const d = r.data || {};
        if (!d.horaInicio || !d.horaFin) return acc;
        const hi = new Date(`1970-01-01T${d.horaInicio}:00`);
        const hf = new Date(`1970-01-01T${d.horaFin}:00`);
        let ms = hf - hi;
        if (ms < 0) ms += 24 * 3600 * 1000;
        return acc + ms / 3600000;
      }, 0);
      return Math.round((sum / regs.length) * 10) / 10;
    }
  }
];