/* ============================================================
   Tests unitarios del motor de validación (public/js/validacion.js)
   Ejecutar: node --test tests/unit/validacion.test.js
   ============================================================ */
'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { idsFormatos, cargarEsquema, cargarMotor } = require('./helpers/entorno');

const M = cargarMotor();
const {
  validarFormulario, aplicarAutoFechas, hoyISO, coerce,
  VALIDACION_FORMATOS, inicialData, getByPath, setByPath
} = M;

const FORMATOS = idsFormatos();
const esquema = id => cargarEsquema(id);

describe('Cobertura de configuración (todos los formatos)', () => {
  FORMATOS.forEach(id => {
    it(`${id}: tiene configuración y todas sus rutas existen en el esquema`, () => {
      const cfg = VALIDACION_FORMATOS[id];
      assert.ok(cfg, 'falta VALIDACION_FORMATOS.' + id);
      const e = esquema(id);
      const rutas = new Set();
      (e.secciones || []).forEach(s => (s.campos || []).forEach(c => rutas.add(c.key)));
      (e.secciones || []).forEach(s => {
        if (s.tabla) rutas.add(s.tabla.key);
        if (s.tareas) rutas.add(s.tareas.key);
        if (s.checklists) rutas.add(s.checklists.key || 'verif');
      });
      const inexistentes = [];
      (cfg.requeridos || []).forEach(r => { if (!rutas.has(r)) inexistentes.push('req:' + r); });
      (cfg.fechasHoy || []).forEach(r => { if (!rutas.has(r)) inexistentes.push('fecha:' + r); });
      Object.keys(cfg.numeros || {}).forEach(r => { if (!rutas.has(r)) inexistentes.push('num:' + r); });
      Object.keys(cfg.tablas || {}).forEach(t => { if (!rutas.has(t)) inexistentes.push('tabla:' + t); });
      assert.deepEqual(inexistentes, [], 'rutas inventadas: ' + inexistentes.join(', '));
    });

    it(`${id}: validar formulario vacío devuelve errores sin lanzar excepción`, () => {
      const data = inicialData(esquema(id));
      aplicarAutoFechas(esquema(id), data);
      const errores = validarFormulario(esquema(id), data);
      assert.ok(Array.isArray(errores));
      assert.ok(errores.length > 0, 'esperaba errores en formulario vacío');
      errores.forEach(e => {
        assert.ok(e.ruta, 'error sin ruta: ' + JSON.stringify(e));
        assert.ok(e.msg, 'error sin mensaje: ' + JSON.stringify(e));
      });
    });
  });
});

describe('Fechas: autollenado con hoy y bloqueo de futuro', () => {
  it('aplicarAutoFechas llena con HOY las fechas de diligenciamiento', () => {
    const data = inicialData(esquema('ft-ope-06'));
    aplicarAutoFechas(esquema('ft-ope-06'), data);
    assert.equal(data.fecha, hoyISO());
  });

  it('una fecha posterior a hoy genera error de bloqueo', () => {
    const data = inicialData(esquema('ft-ope-06'));
    aplicarAutoFechas(esquema('ft-ope-06'), data);
    data.fecha = '2099-01-01';
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    const e = errores.find(x => x.ruta === 'fecha');
    assert.ok(e, 'no se reportó error de fecha');
    assert.match(e.msg, /futura|posterior/i);
  });

  it('una fecha de HOY no genera error', () => {
    const data = inicialData(esquema('ft-ope-06'));
    aplicarAutoFechas(esquema('ft-ope-06'), data);
    assert.equal(data.fecha, hoyISO());
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    assert.ok(!errores.find(x => x.ruta === 'fecha'), 'fecha de hoy no debería fallar');
  });
});

describe('Campos obligatorios (ft-ope-06)', () => {
  it('formulario vacío reporta los obligatorios definidos', () => {
    const data = inicialData(esquema('ft-ope-06'));
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    VALIDACION_FORMATOS['ft-ope-06'].requeridos.forEach(r => {
      assert.ok(errores.find(x => x.ruta === r), 'falta error para ' + r);
    });
  });

  it('un campo obligatorio lleno deja de generar error', () => {
    const data = inicialData(esquema('ft-ope-06'));
    data.lugarEspecifico = 'Área de compresores';
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    assert.ok(!errores.find(x => x.ruta === 'lugarEspecifico'));
  });

  it('espacios en blanco se tratan como vacío (coerce + validación)', () => {
    const data = inicialData(esquema('ft-ope-06'));
    data.solicitante = '   ';
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    assert.ok(errores.find(x => x.ruta === 'solicitante'), 'solo espacios debería contar como vacío');
    assert.equal(coerce('   '), '');
  });
});

describe('Tablas dinámicas', () => {
  it('sin fila válida reporta error de tabla requerida', () => {
    const data = inicialData(esquema('ft-ope-06'));
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    assert.ok(errores.find(x => x.ruta === 'ejecutantes'));
  });

  it('fila con las columnas requeridas permite la tabla', () => {
    const data = inicialData(esquema('ft-ope-06'));
    data.ejecutantes = [{ nombre: 'Ana Torres', cc: '123456' }];
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    assert.ok(!errores.find(x => x.ruta === 'ejecutantes'));
  });

  it('fila incompleta marca la columna exacta (ruta ejecutantes.i.columnas)', () => {
    const data = inicialData(esquema('ft-ope-06'));
    data.ejecutantes = [{ nombre: 'Ana Torres', cc: '' }];
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    assert.ok(errores.find(x => x.ruta === 'ejecutantes.0.cc'), JSON.stringify(errores));
  });
});

describe('Tareas (SI/NO/NA)', () => {
  it('tareas sin responder generan errores', () => {
    const data = inicialData(esquema('ft-ope-06'));
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    [1, 2, 3, 4, 5, 6].forEach(n => {
      assert.ok(errores.find(x => x.ruta === 'tareas.' + n), 'falta error tareas.' + n);
    });
  });

  it('responder todas las tareas elimina sus errores', () => {
    const data = inicialData(esquema('ft-ope-06'));
    [1, 2, 3, 4, 5, 6].forEach(n => { data.tareas[n] = n === 1 ? 'SI' : 'NA'; });
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    assert.ok(!errores.find(x => x.ruta.startsWith('tareas.')), JSON.stringify(errores));
  });
});

describe('Checklists con soloSi', () => {
  it('grupo GENERAL se exige siempre', () => {
    const data = inicialData(esquema('ft-ope-06'));
    [1, 2, 3, 4, 5, 6].forEach(n => { data.tareas[n] = 'NA'; });
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    assert.ok(errores.find(x => x.ruta === 'verif.general.0'), 'falta error del ítem 0 de general');
  });

  it('grupo con soloSi se exige SOLO si su tarea es SI', () => {
    // tarea 1 = SI → izaje (21 ítems) aplica y está vacío → errores
    const a = inicialData(esquema('ft-ope-06'));
    a.tareas[1] = 'SI';
    [2, 3, 4, 5, 6].forEach(n => { a.tareas[n] = 'NA'; });
    const errA = validarFormulario(esquema('ft-ope-06'), a);
    assert.ok(errA.find(x => x.ruta === 'verif.izaje.0'), 'izaje debería exigirse con tarea SI');

    // tarea 1 = NA → izaje no aplica: sin error por izaje
    const b = inicialData(esquema('ft-ope-06'));
    [1, 2, 3, 4, 5, 6].forEach(n => { b.tareas[n] = 'NA'; });
    b.verif.general = Array(20).fill('SI'); // solo resolvemos general
    const errB = validarFormulario(esquema('ft-ope-06'), b);
    assert.ok(!errB.find(x => x.ruta.startsWith('verif.izaje')), 'izaje no debe exigirse con tarea NA');
  });

  it('checklist completo deja de generar errores', () => {
    const data = inicialData(esquema('ft-ope-06'));
    [1, 2, 3, 4, 5, 6].forEach(n => { data.tareas[n] = 'NA'; });
    data.verif.general = Array(20).fill('SI');
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    assert.ok(!errores.find(x => x.ruta.startsWith('verif.')), JSON.stringify(errores));
  });
});

describe('Reglas numéricas (ft-sst-11)', () => {
  it('diasIncapacidad negativo es inválido (min 0)', () => {
    const data = inicialData(esquema('ft-sst-11'));
    data.diasIncapacidad = '-3';
    const errores = validarFormulario(esquema('ft-sst-11'), data);
    assert.ok(errores.find(x => x.ruta === 'diasIncapacidad'));
  });

  it('diasIncapacidad válido (0 o más) si el tipo es numérico', () => {
    const data = inicialData(esquema('ft-sst-11'));
    data.diasIncapacidad = '2';
    const errores = validarFormulario(esquema('ft-sst-11'), data);
    assert.ok(!errores.find(x => x.ruta === 'diasIncapacidad'));
  });
});

describe('Integración: formulario completo sin errores (ft-ope-06)', () => {
  it('llenando todo lo requerido NO devuelve errores', () => {
    const data = inicialData(esquema('ft-ope-06'));
    aplicarAutoFechas(esquema('ft-ope-06'), data);
    data.localizacion = 'PLANTA';
    data.lugarEspecifico = 'Área de compresores';
    data.solicitante = 'Juan Pérez';
    data.responsableEquipo = 'Pedro Gómez';
    data.responsableArea = 'Mantenimiento';
    data.empresaEjecutora = 'SSTech SAS';
    data.descripcion = 'Mantenimiento preventivo.';
    data.horaInicio = '07:00';
    data.horaFin = '15:00';
    data.ejecutantes = [{ nombre: 'Ana Torres', cc: '123456' }];
    [1, 2, 3, 4, 5, 6].forEach(n => { data.tareas[n] = n === 1 ? 'SI' : 'NA'; });
    data.verif.general = Array(20).fill('SI');
    data.verif.izaje = Array(21).fill('SI');
    const errores = validarFormulario(esquema('ft-ope-06'), data);
    assert.deepEqual(errores, [], JSON.stringify(errores));
  });
});