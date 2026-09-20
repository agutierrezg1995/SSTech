const puppeteer = require('puppeteer-core');
const fs = require('fs');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const exec = fs.existsSync(EDGE) ? EDGE : 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: exec, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  let errores = [];
  page.on('pageerror', e => errores.push(e.message));
  await page.goto('http://localhost:3200', { waitUntil: 'networkidle0', timeout: 20000 });
  await page.evaluate(() => {
    document.getElementById('login-email').value = 'coordinador@sstech.co';
    document.getElementById('login-pass').value = 'coordinador123';
    UI.login();
  });
  await page.waitForFunction(() => document.querySelectorAll('.nav-item').length === 7, { timeout: 20000 });

  const filas = await page.evaluate(() => document.querySelectorAll('#tabla-wrap tr').length);
  console.log('filas en tabla:', filas);

  const t0 = Date.now();
  const hecho = await page.evaluate(() => {
    const b = document.querySelector('#tabla-wrap button[onclick*="verPdf"]');
    if (!b) return 'NO-BOTON';
    b.click();
    return 'CLIC';
  });
  console.log('accion:', hecho);
  const pdfOk = await page.waitForFunction(() => !document.getElementById('modalPdf').classList.contains('hidden'), { timeout: 60000 }).then(()=>true).catch(()=>false);
  await new Promise(r => setTimeout(r, 1000));
  const ifr = await page.evaluate(() => document.getElementById('pdf-frame').src);
  console.log('PDF modal abierto:', pdfOk, 'en', Date.now() - t0, 'ms | iframe:', ifr);
  console.log('ERRORES:', errores.length ? errores : 'ninguno');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
