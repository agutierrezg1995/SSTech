/*
 * Motor de render a PDF (Puppeteer).
 * Genera un PDF A4 fiel al esquema del formato, a partir del registro (data).
 */

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const PDF_DIR = path.join(__dirname, '..', 'pdfs');
const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- helpers de render ---------- */

function valor(data, key) {
  const v = data[key];
  return v == null ? '' : v;
}

function xsegún(valor, objetivo) {
  return valor === objetivo ? 'X' : '';
}

function renderCampo(campo, data, pdf) {
  const key = campo.key;
  const label = campo.label ? '<b>' + esc(campo.label) + '</b> ' : '';
  let ctrl = '';

  switch (campo.type) {
    case 'text':
    case 'textarea':
    case 'number':
    case 'date':
    case 'time':
      ctrl = esc(valor(data, key));
      return (pdf ? '' : label) + '<span class="valor">' + ctrl + '</span>';
    case 'select':
      return esc(valor(data, key));
    case 'radio': {
      const act = valor(data, key);
      return campo.opciones.map(o => {
        const m = xsegún(act, o);
        return '<span class="opc">[' + m + '] ' + esc(o) + '</span>';
      }).join(' ');
    }
    case 'checkbox':
      return (data[key] ? '<span class="opc">[X] ' + esc(campo.label) + '</span>' : '<span class="opc">[ ] ' + esc(campo.label) + '</span>');
    case 'respuesta': { // SI / NO / NA
      const act = valor(data, key);
      return 'SI [' + xsegún(act, 'SI') + '] &nbsp; NO [' + xsegún(act, 'NO') + '] &nbsp; NA [' + xsegún(act, 'NA') + ']';
    }
    default:
      return esc(valor(data, key));
  }
}

function renderGrid(seccion, data) {
  const campos = seccion.campos || [];
  const cols = seccion.columnas || 1;
  const filas = [];
  for (let i = 0; i < campos.length; i += cols) {
    filas.push(campos.slice(i, i + cols));
  }
  let h = '<table>';
  filas.forEach(fila => {
    h += '<tr>';
    fila.forEach(c => {
      const ancho = c.ancho || (100 / fila.length) + '%';
      h += '<td style="width:' + ancho + '"><span class="valor">' + renderCampo(c, data, true) + '</span></td>';
    });
    const faltantes = cols - fila.length;
    for (let i = 0; i < faltantes; i++) h += '<td></td>';
    h += '</tr>';
  });
  h += '</table>';
  return h;
}

function renderTabla(tabla, data) {
  const filas = data[tabla.key] || [];
  // nº de filas mínimas
  const n = tabla.min ? Math.max(filas.length, tabla.min) : filas.length;
  let h = '<table class="tabla">';
  h += '<tr>';
  if (tabla.header !== false) h += '<th style="width:5%">N°</th>';
  (tabla.columnas || []).forEach(c => {
    h += '<th style="width:' + (c.ancho || '') + '">' + esc(c.label) + '</th>';
  });
  h += '</tr>';
  for (let i = 0; i < n; i++) {
    const f = filas[i] || {};
    h += '<tr>';
    if (tabla.header !== false) h += '<td class="center">' + (i + 1) + '</td>';
    (tabla.columnas || []).forEach(c => {
      const v = esc(f[c.key] == null ? '' : f[c.key]);
      h += '<td>' + v + '</td>';
    });
    h += '</tr>';
  }
  h += '</table>';
  return h;
}

function renderChecklistGrupo(grupo, data, prefijo) {
  let h = '<div class="seccion-t">' + esc(grupo.titulo) + '</div>';
  h += '<table class="tabla verif"><tr><th style="width:4%">N°</th><th class="texto">Requisito</th><th style="width:8%">SI</th><th style="width:8%">NO</th><th style="width:8%">NA</th><th style="width:16%">OBSERVACIONES</th></tr>';
  (grupo.items || []).forEach((it, i) => {
    const r = (data.verif && data.verif[prefijo] && data.verif[prefijo][i]) || '';
    h += '<tr><td class="center">' + (i + 1) + '</td><td class="texto">' + esc(it) + '</td>' +
      '<td class="center">' + xsegún(r, 'SI') + '</td>' +
      '<td class="center">' + xsegún(r, 'NO') + '</td>' +
      '<td class="center">' + xsegún(r, 'NA') + '</td>' +
      '<td>' + esc((data.obs && data.obs[prefijo + '.' + i]) || '') + '</td></tr>';
  });
  h += '</table>';
  return h;
}

function renderTareas(seccion, data) {
  let h = '<div class="seccion-t">' + esc(seccion.titulo) + '</div>';
  h += '<table><tr>';
  (seccion.tareas.opciones || []).forEach(t => {
    h += '<td class="titulo-col">' + t.n + '.<br>' + esc(t.corto || t.nombre) + '</td>';
  });
  h += '</tr><tr>';
  (seccion.tareas.opciones || []).forEach(t => {
    const act = (data.tareas && data.tareas[t.n]) || '';
    h += '<td class="center">' +
      'SI [' + xsegún(act, 'SI') + '] &nbsp; NA [' + xsegún(act, 'NA') + ']</td>';
  });
  h += '</tr></table>';

  // checklists condicionales
  (seccion.tareas.opciones || []).forEach(t => {
    if (t.checklist && (data.tareas && data.tareas[t.n] === 'SI')) {
      h += renderChecklistGrupo({ titulo: t.tituloChecklist || t.checklist }, data, t.checklist);
    }
  });
  return h;
}

function renderChecklistsCondicionales(seccion, data) {
  let h = '';
  const grupos = seccion.checklists.grupos || {};
  const cond = seccion.checklists.condicion || (() => true);
  if (typeof cond !== 'function') {
    // si es objeto tipo {tarea: #} evaluamos
  }
  // si hay condicion por tarea:
  const porTarea = seccion.checklists.porTarea;
  if (porTarea) {
    Object.keys(porTarea).forEach(tareaN => {
      if (data.tareas && data.tareas[tareaN] === 'SI') {
        h += renderChecklistGrupo({ titulo: porTarea[tareaN].titulo }, data, porTarea[tareaN].prefijo || tareaN);
      }
    });
    return h;
  }
  // grupos con condicion propia
  Object.keys(grupos).forEach(k => {
    const g = grupos[k];
    const aplica = g.soloSi ? (data.tareas && data.tareas[g.soloSi] === 'SI') : true;
    if (aplica) h += renderChecklistGrupo({ titulo: g.titulo }, data, k);
  });
  return h;
}

/* ---------- render sección ---------- */
function renderSeccion(seccion, data) {
  let h = '';
  if (seccion.titulo) {
    const clase = seccion.destacada ? 'seccion-t' : 'seccion-g';
    h += '<div class="' + clase + '">' + esc(seccion.titulo) + '</div>';
  }
  if (seccion.campos) h += renderGrid(seccion, data);
  else if (seccion.tabla) h += renderTabla(seccion.tabla, data);
  else if (seccion.tareas) h += renderTareas(seccion, data);
  else if (seccion.checklists) h += renderChecklistsCondicionales(seccion, data);
  else if (seccion.titulo) h += '<div class="espacio"></div>';
  return h;
}

/* ---------- encabezado / pie ---------- */
function cabeceraPdf(esquema) {
  return '<table class="cabecera"><tr>' +
    '<td class="logo"><div class="logo-t">SSTech</div><div class="logo-s">SISTEMA DE GESTIÓN SST</div></td>' +
    '<td class="titulo numero">' + esquema.nombre + '</td>' +
    '<td class="meta"><b>CÓDIGO</b><br>' + esquema.codigo + '</td>' +
    '<td class="meta"><b>FECHA</b><br>' + esquema.fecha + '</td>' +
    '<td class="meta"><b>VERSIÓN</b><br>' + esquema.version + '</td>' +
    '</tr></table>';
}

function piePdf(esquema, registro) {
  return '<div class="pie">' + esquema.codigo + ' ' + esc(esquema.nombre) + ' — Generado por SSTech SaaS · ' +
    new Date(registro.updatedAt || Date.now()).toLocaleString('es-CO') + '</div>';
}

/* ---------- HTML completo ---------- */
function htmlPdf(esquema, data, registro) {
  let cuerpo = '';
  (esquema.secciones || []).forEach(sec => {
    cuerpo += renderSeccion(sec, data);
    cuerpo += '<div style="height:3mm"></div>';
  });
  const estilo = `
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #000; line-height: 1.25; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #000; padding: 3px 5px; vertical-align: top; text-align: left; }
    .center { text-align: center; }
    .cabecera td { border: 1px solid #000; }
    .cabecera .logo { width: 18%; text-align: center; }
    .logo-t { font-size: 13pt; font-weight: bold; }
    .logo-s { font-size: 6pt; }
    .cabecera .titulo { text-align: center; font-size: 12pt; font-weight: bold; width: 44%; }
    .cabecera .meta { width: 12.66%; font-size: 7.5pt; }
    .seccion-t { background: #0f2a43; color: #fff; font-weight: bold; font-size: 8.5pt; text-align: center; padding: 3px 6px; }
    .seccion-g { background: #d5dbe0; font-weight: bold; font-size: 8.5pt; padding: 3px 6px; border: 1px solid #000; }
    .tabla td { font-size: 7.5pt; }
    .tabla th { font-size: 7.5pt; text-align: center; }
    .verif td { font-size: 7.5pt; }
    .titulo-col { font-weight: bold; font-size: 7.5pt; text-align: center; }
    .opc { display: inline-block; margin-right: 6px; white-space: nowrap; }
    .valor { }
    .espacio { min-height: 10mm; }
    .pie { margin-top: 4mm; font-size: 7pt; color: #333; text-align: center; }
    p { margin: 0 0 3px 0; }
    .aviso { background: #fff7dd; border: 1px solid #000; padding: 4px; font-size: 8pt; text-align: justify; }
  `;
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + estilo + '</style></head><body>' +
    cabeceraPdf(esquema) + '<div style="height:3mm"></div>' + cuerpo + piePdf(esquema, registro) + '</body></html>';
}

/* ---------- generación PDF ---------- */
async function generarPdf(esquema, data, registroId) {
  const chrome = findChrome();
  if (!chrome) throw new Error('No se encontró Chrome/Edge instalado en el servidor');

  const filename = esquema.id + '-' + registroId + '.pdf';
  const outPath = path.join(PDF_DIR, filename);

  const registro = { updatedAt: new Date().toISOString() };
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlPdf(esquema, data, registro), { waitUntil: 'networkidle0' });
    await page.pdf({ path: outPath, format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } });
  } finally {
    if (browser) await browser.close();
  }
  return { filename, url: '/pdfs/' + filename };
}

module.exports = { generarPdf, htmlPdf, PDF_DIR };