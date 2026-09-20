/*
 * Motor de indicadores — calcula los KPIs de un formato aplicando filtros.
 * Filtros admitidos: { desde, hasta, campo, valor }
 *   - desde/hasta: rango sobre el campo fecha del esquema o fechaCreacion.
 *   - campo + valor: filtro por columna del listado (ej. localizacion, regional).
 */
const formatos = require('../config');

function enRango(valor, rango) {
  if (!rango || (!rango.desde && !rango.hasta)) return true;
  const v = new Date(valor);
  if (isNaN(v)) return true;
  const hoy = v.toISOString().slice(0, 10);
  if (rango.desde && hoy < rango.desde) return false;
  if (rango.hasta && hoy > rango.hasta) return false;
  return true;
}

function extraerFecha(registro, esquema) {
  // buscar un campo type 'date' en el esquema
  for (const sec of (esquema.secciones || [])) {
    for (const c of (sec.campos || [])) {
      if (c.type === 'date' && c.key !== 'fechaReporte') {
        const valor = (registro.data || {})[c.key];
        if (valor) return valor;
      }
    }
    for (const c of (sec.campos || [])) {
      if (c.type === 'date') {
        const valor = (registro.data || {})[c.key];
        if (valor) return valor;
      }
    }
  }
  return registro.fechaCreacion || registro.fechaActualizacion;
}

function aplicarFiltros(registros, esquema, filtros) {
  const f = filtros || {};
  return registros.filter(r => {
    if (f.campo && f.valor) {
      const valor = (r.data || {})[f.campo];
      if (String(valor || '').toUpperCase() !== String(f.valor).toUpperCase()) return false;
    }
    if (f.desde || f.hasta) {
      if (!enRango(extraerFecha(r, esquema), { desde: f.desde, hasta: f.hasta })) return false;
    }
    return true;
  });
}

function calcularIndicadores(formato, registros, filtros) {
  const base = aplicarFiltros(registros || [], formato.esquema, filtros);
  return (formato.indicadores || []).map(kpi => {
    let valor;
    try {
      valor = kpi.calcular(base);
    } catch (e) {
      valor = 'ERR';
    }
    return {
      codigo: kpi.codigo,
      nombre: kpi.nombre,
      tipo: kpi.tipo,
      valor: (typeof valor === 'number' ? Math.round(valor * 100) / 100 : valor),
      registrosAnalizados: base.length
    };
  });
}

function listarFormatosIndicadores() {
  return formatos.map(f => ({
    id: f.id, codigo: f.codigo, nombre: f.nombre,
    indicadores: (f.indicadores || []).map(k => ({ codigo: k.codigo, nombre: k.nombre, tipo: k.tipo }))
  }));
}

module.exports = { calcularIndicadores, listarFormatosIndicadores, aplicarFiltros };

// Auto-test si se ejecuta directo (node lib/indicadores.js)
if (require.main === module) {
  const f = formatos[0];
  const regs = [
    { data: { fecha: '2026-09-01', localizacion: 'PLANTA', verif: { general: ['SI', 'NO'] } }, estado: 'NO CONCEDIDO', fechaCreacion: '2026-09-01' },
    { data: { fecha: '2026-09-10', localizacion: 'GRANJA', verif: { general: ['SI', 'SI'] } }, estado: 'CONCEDIDO', fechaCreacion: '2026-09-10' }
  ];
  console.log('=== sin filtros ===');
  calcularIndicadores(f, regs, {}).forEach(k => console.log(k.codigo, k.nombre, '=>', k.valor));
  console.log('=== filtro localizacion=PLANTA ===');
  calcularIndicadores(f, regs, { campo: 'localizacion', valor: 'PLANTA' }).forEach(k => console.log(k.codigo, '=>', k.valor));
  console.log('=== filtro fechas sep ≥ 05 ===');
  calcularIndicadores(f, regs, { desde: '2026-09-05', hasta: '2026-09-30' }).forEach(k => console.log(k.codigo, '=>', k.valor));
}