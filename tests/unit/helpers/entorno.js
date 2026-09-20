/* ============================================================
   SSTech SaaS — Entorno de pruebas unitarias (Node)
   Carga util.js + validacion.js (frontend) en Node con stubs
   y expone las funciones puras + esquemas de formatos.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ_SSTECH = path.resolve(__dirname, '../../..');
const DIR_PLATFORM = path.join(RAIZ_SSTECH, 'Proyecto', 'platform');
const DIR_FORMATOS = path.join(RAIZ_SSTECH, 'Proyecto', 'formatos');

/* ids de todos los formatos con esquema.js */
function idsFormatos() {
  return fs.readdirSync(DIR_FORMATOS)
    .filter(f => fs.existsSync(path.join(DIR_FORMATOS, f, 'esquema.js')))
    .sort();
}

/* Carga un esquema (módulo CommonJS) por id */
function cargarEsquema(id) {
  return require(path.join(DIR_FORMATOS, id, 'esquema.js'));
}

/* Stubs mínimos de navegador para poder evaluar util.js / validacion.js */
function instalarStubsNavegador() {
  global.window = global.window || {};
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
  global.document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    querySelectorAllRecursive: () => []
  };
  global.fetch = async () => ({ ok: false, status: 500, json: async () => ({ error: 'sin servidor en unit tests' }) });
}

/* Evalúa util.js + validacion.js en un closure y devuelve las funciones puras */
function cargarMotor() {
  instalarStubsNavegador();
  const util = fs.readFileSync(path.join(DIR_PLATFORM, 'public', 'js', 'util.js'), 'utf8');
  const val = fs.readFileSync(path.join(DIR_PLATFORM, 'public', 'js', 'validacion.js'), 'utf8');
  const src = util + '\n' + val;
  const factory = new Function(src + '; return { validarFormulario, aplicarAutoFechas, hoyISO, coerce, VALIDACION_FORMATOS, inicialData, getByPath, setByPath, estadoPermiso };');
  return factory();
}

module.exports = { RAIZ_SSTECH, DIR_PLATFORM, DIR_FORMATOS, idsFormatos, cargarEsquema, cargarMotor };