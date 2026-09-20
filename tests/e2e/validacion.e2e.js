/* ============================================================
   SSTech SaaS — Prueba end-to-end de validaciones (puppeteer-core)
   Requiere: servidor activo en http://localhost:3200
   Uso: node tests/e2e/validacion.e2e.js
   ============================================================ */
'use strict';
const path = require('path');

const PLATFORM = require('../unit/helpers/entorno').DIR_PLATFORM;
const puppeteer = require(path.join(PLATFORM, 'node_modules', 'puppeteer-core'));
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const URL = process.env.SSTECH_URL || 'http://localhost:3200/';
const EMAIL = process.env.SSTECH_EMAIL || 'coordinador@sstech.co';
const PASSWORD = process.env.SSTECH_PASSWORD || 'coordinador123';

const resultados = [];
function check(nombre, cond, detalle) {
  resultados.push({ nombre, ok: !!cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + nombre + (detalle ? ' | ' + detalle : ''));
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', executablePath: chrome, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await page.setViewport({ width: 1400, height: 900 });

  const guardar = () => page.evaluate(() => {
    [...document.querySelectorAll('.modal-toolbar button')].find(b => /guardar/i.test(b.textContent)).click();
  });

  // Login
  await page.goto(URL, { waitUntil: 'networkidle2' });
  await page.type('#login-email', EMAIL);
  await page.type('#login-pass', PASSWORD);
  await page.click('#login button');
  await page.waitForSelector('#app:not(.hidden)', { timeout: 8000 });
  await sleep(1200);

  // FT-OPE-06 → nuevo registro
  await page.evaluate(() => {
    [...document.querySelectorAll('#navbar button')].find(b => /ope-06/i.test(b.textContent)).click();
  });
  await sleep(1000);
  await page.evaluate(() => UI.nuevo());
  await sleep(800);

  // 1) Guardar vacío → bloqueado, errores resaltados, toast
  const antes = await page.evaluate(() => App.registros.length);
  await guardar();
  await sleep(1500);
  const nInvalid = await page.evaluate(() => document.querySelectorAll('.invalid').length);
  const toast = await page.evaluate(() => (document.querySelector('#toast') || {}).textContent);
  const despues = await page.evaluate(() => App.registros.length);
  check('guardar vacío: no guarda', antes === despues, `antes=${antes} despues=${despues}`);
  check('guardar vacío: errores resaltados', nInvalid > 0, 'invalid=' + nInvalid);
  check('guardar vacío: toast de advertencia', /corregir/i.test(toast || ''), (toast || '').trim().slice(0, 60));

  // 2) Fecha autollenada con HOY
  const fechaVal = await page.evaluate(() => App.data.fecha);
  const hoy = await page.evaluate(() => hoyISO());
  check('fecha autollenada con hoy', fechaVal === hoy, `data=${fechaVal} hoy=${hoy}`);

  // 3) Llenar datos válidos → guardar OK
  await page.evaluate(() => {
    const set = (p, x) => p.split('.').reduce((o, k, i, a) => { if (i === a.length - 1) o[k] = x; else o[k] = o[k] || {}; return o[k]; }, App.data);
    set('localizacion', 'PLANTA');
    set('lugarEspecifico', 'Área de compresores');
    set('solicitante', 'Juan Pérez');
    set('responsableEquipo', 'Pedro Gómez');
    set('responsableArea', 'Mantenimiento');
    set('empresaEjecutora', 'SSTech SAS');
    set('descripcion', 'Mantenimiento preventivo en compresores.');
    set('horaInicio', '07:00');
    set('horaFin', '15:00');
    App.data.ejecutantes = [{ nombre: 'Ana Torres', cc: '123456' }];
    [1, 2, 3, 4, 5, 6].forEach(n => App.data.tareas[n] = n === 1 ? 'SI' : 'NA');
    App.data.verif = { general: Array(20).fill('SI'), izaje: Array(21).fill('SI') };
    UI.renderForm();
  });
  await sleep(700);
  await guardar();
  await sleep(2000);
  const nInvalid2 = await page.evaluate(() => document.querySelectorAll('.invalid').length);
  const toast2 = await page.evaluate(() => (document.querySelector('#toast') || {}).textContent);
  const despues2 = await page.evaluate(() => App.registros.length);
  check('guardar completo: sin errores', nInvalid2 === 0, 'invalid=' + nInvalid2);
  check('guardar completo: registro creado', despues2 === antes + 1, `antes=${antes} despues=${despues2}`);
  check('guardar completo: toast éxito', /guardado/i.test(toast2 || ''), (toast2 || '').trim().slice(0, 50));

  // 4) Fecha futura → bloquedada
  await page.evaluate(() => { App.data.fecha = '2099-01-01'; UI.renderForm(); });
  await sleep(500);
  await guardar();
  await sleep(1200);
  const nFutura = await page.evaluate(() => document.querySelectorAll('.invalid').length);
  check('fecha futura: bloqueada con error', nFutura > 0, 'invalid=' + nFutura);

  // 5) Tabla vacía → marcada como error
  await page.evaluate(() => {
    App.registro = null;
    App.data = inicialData(App.formato.esquema);
    aplicarAutoFechas(App.formato.esquema, App.data);
    UI.abrirModal();
  });
  await sleep(700);
  await guardar();
  await sleep(1200);
  const noFila = await page.evaluate(() => {
    const el = document.querySelector('.tabla-dinamica[data-path="ejecutantes"]');
    return el ? el.classList.contains('invalid') : false;
  });
  check('tabla vacía: marcada como error', !!noFila, '');

  // 6) Editar limpia el resaltado del campo
  await page.evaluate(() => { UI.setVal('lugarEspecifico', 'Cambio en vivo'); });
  const limpio = await page.evaluate(() => {
    return !document.querySelector('[data-path="lugarEspecifico"]').classList.contains('invalid');
  });
  check('editar limpia el error del campo', !!limpio, '');

  await browser.close();
  const fails = resultados.filter(r => !r.ok);
  console.log('\n===== RESUMEN: ' + (resultados.length - fails.length) + '/' + resultados.length + ' PASS =====');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e.message); process.exit(2); });