/* ============================================================
   Tests unitarios de utilidades (public/js/util.js)
   Inicialización de datos, getByPath/setByPath, estadoPermiso.
   Ejecutar: node --test tests/unit/util.test.js
   ============================================================ */
'use strict';
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { cargarEsquema, cargarMotor } = require('./helpers/entorno');

const M = cargarMotor();
const { inicialData, getByPath, setByPath, estadoPermiso } = M;

describe('getByPath / setByPath', () => {
  it('getByPath lee rutas anidadas', () => {
    const obj = { a: { b: { c: 1 } }, d: null };
    assert.equal(getByPath(obj, 'a.b.c'), 1);
    assert.equal(getByPath(obj, 'd'), null);
    assert.equal(getByPath(obj, 'x.y.z'), undefined);
    assert.equal(getByPath(null, 'a'), undefined);
  });

  it('setByPath crea objetos intermedios si faltan', () => {
    const obj = {};
    setByPath(obj, 'satisfaccion.fecha', '2026-09-20');
    assert.equal(obj.satisfaccion.fecha, '2026-09-20');
  });

  it('setByPath no machaca objetos existentes', () => {
    const obj = { grupos: { a: 1 } };
    setByPath(obj, 'grupos.b', 2);
    assert.equal(obj.grupos.a, 1);
    assert.equal(obj.grupos.b, 2);
  });
});

describe('inicialData', () => {
  it('crea tareas con sus números vacíos', () => {
    const d = inicialData(cargarEsquema('ft-ope-06'));
    assert.deepEqual(Object.keys(d.tareas).sort(), ['1', '2', '3', '4', '5', '6']);
    assert.equal(d.tareas['1'], '');
  });

  it('crea checklists por grupo con array de ítems vacíos', () => {
    const d = inicialData(cargarEsquema('ft-ope-06'));
    assert.ok(Array.isArray(d.verif.general));
    assert.equal(d.verif.general.length, 20);
    assert.ok(d.verif.izaje.every(v => v === ''));
  });

  it('crea la tabla dinámica con una fila vacía por defecto', () => {
    const d = inicialData(cargarEsquema('ft-ope-06'));
    assert.ok(Array.isArray(d.ejecutantes));
    assert.deepEqual(d.ejecutantes[0], {});
  });

  it('radios y text quedan en vacío salvo default definido', () => {
    const d56 = inicialData(cargarEsquema('ft-ope-56'));
    assert.equal(d56.fecha, '');
    assert.equal(d56.cliente, '');
  });
});

describe('estadoPermiso', () => {
  it('sin NO → CONCEDIDO', () => {
    assert.equal(estadoPermiso({ verif: { general: ['SI', 'SI', 'NA'] } }), 'CONCEDIDO');
  });

  it('con algún NO → NO CONCEDIDO', () => {
    assert.equal(estadoPermiso({ verif: { general: ['SI', 'NO', 'SI'] } }), 'NO CONCEDIDO');
  });

  it('sin verif → CONCEDIDO', () => {
    assert.equal(estadoPermiso({}), 'CONCEDIDO');
  });
});