/*
 * SSTech SaaS — Servidor principal
 * API REST + autenticación por roles + estáticos + PDF (Puppeteer).
 */
const express = require('express');
const path = require('path');
const formatos = require('./config');
const db = require('./lib/db');
const pdf = require('./lib/pdf');
const auth = require('./lib/auth');
const indic = require('./lib/indicadores');

const app = express();
const PORT = process.env.PORT || 3200;

app.use(express.json({ limit: '10mb' }));

/* Log de cada petición (diagnóstico) */
app.use((req, res, next) => {
  const ini = Date.now();
  res.on('finish', () => {
    console.log(`[req] ${new Date().toISOString()} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - ini} ms)`);
  });
  next();
});

app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.set('Cache-Control', 'no-cache');
  }
}));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs'), {
  setHeaders: (res, filePath) => res.set('Cache-Control', 'no-cache')
}));

/* ---------- Diagnóstico/estado ---------- */
app.get('/api/estado', (req, res) => {
  res.json({
    app: 'SSTech-SaaS',
    version: '0.2.0',
    formatos: formatos.length,
    fecha: new Date().toISOString()
  });
});

/* ---------- Autenticación ---------- */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
  const r = auth.autenticar(email, password);
  if (!r.ok) return res.status(401).json({ error: r.error });
  const token = auth.crearSesion(r.usuario);
  res.json({ token, usuario: r.usuario });
});

app.post('/api/auth/logout', auth.requireAuth, (req, res) => {
  auth.cerrarSesion(req.token);
  res.json({ ok: true });
});

app.get('/api/auth/me', auth.requireAuth, (req, res) => {
  res.json({ usuario: req.usuario, token: req.token });
});

/* ---------- Usuarios (solo Coordinador) ---------- */
app.get('/api/usuarios', auth.requireAuth, auth.requireRol(['COORDINADOR']), (req, res) => {
  res.json(auth.listarUsuarios());
});

app.post('/api/usuarios', auth.requireAuth, auth.requireRol(['COORDINADOR']), (req, res) => {
  const { nombre, email, password, rol } = req.body || {};
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Los campos nombre, email, password y rol son requeridos' });
  }
  if (!['COORDINADOR', 'SISO'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  const r = auth.crearUsuario({ nombre, email, password, rol });
  if (r.error) return res.status(400).json({ error: r.error });
  res.status(201).json(r.usuario);
});

/* ---------- Metadatos de formatos ---------- */
app.get('/api/formatos', (req, res) => {
  res.json(formatos.map(f => ({
    id: f.id, codigo: f.codigo, nombre: f.nombre, fecha: f.fecha,
    version: f.version, color: f.color, icono: f.icono, listado: f.listado
  })));
});

app.get('/api/formatos/:id/esquema', (req, res) => {
  const f = formatos.obtenerFormato(req.params.id);
  if (!f) return res.status(404).json({ error: 'Formato no encontrado' });
  res.json({ id: f.id, codigo: f.codigo, nombre: f.nombre, esquema: f.esquema, estados: db.ESTADOS });
});

/* ---------- Indicadores (solo Coordinador) ---------- */
app.get('/api/indicadores', auth.requireAuth, auth.requireRol(['COORDINADOR']), (req, res) => {
  res.json(indic.listarFormatosIndicadores());
});

app.get('/api/formatos/:id/indicadores', auth.requireAuth, auth.requireRol(['COORDINADOR']), (req, res) => {
  const f = formatos.obtenerFormato(req.params.id);
  if (!f) return res.status(404).json({ error: 'Formato no encontrado' });
  const filtros = {
    desde: req.query.desde || undefined,
    hasta: req.query.hasta || undefined,
    campo: req.query.campo || undefined,
    valor: req.query.valor || undefined
  };
  res.json({
    formato: { id: f.id, codigo: f.codigo, nombre: f.nombre },
    filtros,
    indicadores: indic.calcularIndicadores(f, db.listar(f.id, req.usuario), filtros)
  });
});

/* ---------- CRUD registros (autenticado; SISO solo sobre los suyos) ---------- */
app.get('/api/formatos/:id', auth.requireAuth, (req, res) => {
  const f = formatos.obtenerFormato(req.params.id);
  if (!f) return res.status(404).json({ error: 'Formato no encontrado' });
  res.json(db.listar(req.params.id, req.usuario));
});

app.post('/api/formatos/:id', auth.requireAuth, (req, res) => {
  const f = formatos.obtenerFormato(req.params.id);
  if (!f) return res.status(404).json({ error: 'Formato no encontrado' });
  const reg = db.crear(req.params.id, req.body.data || {}, req.usuario);
  res.status(201).json(reg);
});

app.get('/api/formatos/:id/:rid', auth.requireAuth, (req, res) => {
  const reg = db.obtener(req.params.id, req.params.rid);
  if (!reg) return res.status(404).json({ error: 'Registro no encontrado' });
  if (req.usuario.rol !== 'COORDINADOR' && reg.usuarioId && reg.usuarioId !== req.usuario.id) {
    return res.status(403).json({ error: 'No tiene permiso para ver este registro' });
  }
  res.json(reg);
});

app.put('/api/formatos/:id/:rid', auth.requireAuth, (req, res) => {
  const reg = db.obtener(req.params.id, req.params.rid);
  if (!reg) return res.status(404).json({ error: 'Registro no encontrado' });
  if (req.usuario.rol !== 'COORDINADOR' && (!reg.usuarioId || reg.usuarioId !== req.usuario.id)) {
    return res.status(403).json({ error: 'Solo puede editar registros propios' });
  }
  const actualizado = db.actualizar(req.params.id, req.params.rid, req.body.data, req.usuario);
  res.json(actualizado);
});

app.patch('/api/formatos/:id/:rid/estado', auth.requireAuth, (req, res) => {
  const reg = db.obtener(req.params.id, req.params.rid);
  if (!reg) return res.status(404).json({ error: 'Registro no encontrado' });
  // solo el Coordinador aprueba/cancela; SISO puede cambiar a BORRADOR el suyo
  if (req.usuario.rol !== 'COORDINADOR') {
    if (['CONCEDIDO', 'CANCELADO'].includes(req.body.estado)) {
      return res.status(403).json({ error: 'Solo el Coordinador puede aprobar o cancelar' });
    }
    if (!reg.usuarioId || reg.usuarioId !== req.usuario.id) {
      return res.status(403).json({ error: 'Solo puede modificar registros propios' });
    }
  }
  const r = db.cambiarEstado(req.params.id, req.params.rid, req.body.estado, req.usuario);
  res.json(r);
});

app.delete('/api/formatos/:id/:rid', auth.requireAuth, auth.requireRol(['COORDINADOR']), (req, res) => {
  const ok = db.eliminar(req.params.id, req.params.rid);
  if (!ok) return res.status(404).json({ error: 'Registro no encontrado' });
  res.json({ ok: true });
});

/* ---------- PDF (autenticado; misma restricción de alcance) ---------- */
app.post('/api/formatos/:id/:rid/pdf', auth.requireAuth, async (req, res) => {
  const f = formatos.obtenerFormato(req.params.id);
  if (!f) return res.status(404).json({ error: 'Formato no encontrado' });
  const reg = db.obtener(req.params.id, req.params.rid);
  if (!reg) return res.status(404).json({ error: 'Registro no encontrado' });
  if (req.usuario.rol !== 'COORDINADOR' && reg.usuarioId && reg.usuarioId !== req.usuario.id) {
    return res.status(403).json({ error: 'No tiene permiso para generar el PDF de este registro' });
  }
  try {
    const resultado = await pdf.generarPdf(f.esquema, reg.data || {}, reg.id);
    res.json(resultado);
  } catch (err) {
    console.error('Error generando PDF:', err.message);
    res.status(500).json({ error: 'No se pudo generar el PDF: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log('────────────────────────────────────────────');
  console.log('  SSTech SaaS  |  Plataforma SST  v0.2.0');
  console.log(`  http://localhost:${PORT}`);
  console.log('────────────────────────────────────────────');
});