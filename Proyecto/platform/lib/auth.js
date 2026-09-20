/*
 * Autenticación y autorización — usuarios, hash de contraseñas, sesiones de token.
 * Almacén: data/usuarios.json  (contraseñas guardadas como scrypt hash + salt)
 * Sesiones: data/sesiones.json  (token -> { usuarioId, expira })
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const USERS_FILE = path.join(__dirname, '..', 'data', 'usuarios.json');
const SESSIONS_FILE = path.join(__dirname, '..', 'data', 'sesiones.json');

function leerArchivo(archivo, defecto) {
  if (!fs.existsSync(archivo)) return defecto;
  try { return JSON.parse(fs.readFileSync(archivo, 'utf8')); } catch { return defecto; }
}
function escribirArchivo(archivo, data) {
  fs.writeFileSync(archivo, JSON.stringify(data, null, 2), 'utf8');
}

/* ---------- Usuarios ---------- */
function leerUsuarios() {
  return leerArchivo(USERS_FILE, []);
}
function guardarUsuarios(users) { escribirArchivo(USERS_FILE, users); }

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verificarPassword(password, almacenado) {
  const [salt, hash] = String(almacenado || '').split(':');
  if (!salt || !hash) return false;
  const prueba = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(prueba, 'hex'));
}

function listarUsuarios() {
  return leerUsuarios().map(u => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo }));
}

function crearUsuario({ nombre, email, password, rol }) {
  const users = leerUsuarios();
  const existe = users.find(u => u.email === String(email).toLowerCase());
  if (existe) return { error: 'Ya existe un usuario con ese email' };
  const nuevo = {
    id: crypto.randomUUID(),
    nombre, email: String(email).toLowerCase(), rol,
    activo: true,
    passwordHash: hashPassword(password)
  };
  users.push(nuevo);
  guardarUsuarios(users);
  return { ok: true, usuario: listarUsuarios().find(u => u.id === nuevo.id) };
}

function autenticar(email, password) {
  const usuario = leerUsuarios().find(u =>
    u.email === String(email).toLowerCase().trim() && u.activo !== false);
  if (!usuario) return { error: 'Credenciales inválidas' };
  if (!verificarPassword(password, usuario.passwordHash)) return { error: 'Credenciales inválidas' };
  return { ok: true, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } };
}

/* ---------- Sesiones ---------- */
function leerSesiones() { return leerArchivo(SESSIONS_FILE, {}); }
function guardarSesiones(s) { escribirArchivo(SESSIONS_FILE, s); }

function crearSesion(usuario) {
  const sesiones = leerSesiones();
  const token = crypto.randomBytes(32).toString('hex');
  const expira = Date.now() + 12 * 3600 * 1000; // 12 horas
  sesiones[token] = { usuarioId: usuario.id, expira };
  guardarSesiones(sesiones);
  return token;
}

function usuarioPorToken(token) {
  const sesiones = leerSesiones();
  const s = token && sesiones[token];
  if (!s) return null;
  if (Date.now() > s.expira) {
    delete sesiones[token];
    guardarSesiones(sesiones);
    return null;
  }
  const u = leerUsuarios().find(x => x.id === s.usuarioId && x.activo !== false);
  return u ? { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol } : null;
}

function cerrarSesion(token) {
  const sesiones = leerSesiones();
  if (token && sesiones[token]) {
    delete sesiones[token];
    guardarSesiones(sesiones);
  }
}

/* ---------- Middleware Express ---------- */
function extraerToken(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return req.headers['x-token'] || null;
}

function requireAuth(req, res, next) {
  const token = extraerToken(req);
  const usuario = usuarioPorToken(token);
  if (!usuario) return res.status(401).json({ error: 'No autenticado. Inicie sesión.' });
  req.usuario = usuario;
  req.token = token;
  next();
}

function requireRol(roles) {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ error: 'No autenticado' });
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: `Acceso denegado. Requiere rol: ${roles.join(' o ')}` });
    }
    next();
  };
}

module.exports = {
  crearUsuario,
  listarUsuarios,
  autenticar,
  crearSesion,
  usuarioPorToken,
  cerrarSesion,
  requireAuth,
  requireRol,
  hashPassword,
  verificarPassword
};