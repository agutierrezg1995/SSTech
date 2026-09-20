/*
 * Capa de persistencia simple (archivos JSON por formato).
 * Cada registro tiene: id, data (campos), estado, creado y trazabilidad (historial).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const ESTADOS = ['BORRADOR', 'CONCEDIDO', 'NO CONCEDIDO', 'CANCELADO'];

function archivo(formatoId) {
  return path.join(DATA_DIR, formatoId + '.json');
}

function leer(formatoId) {
  const f = archivo(formatoId);
  if (!fs.existsSync(f)) return [];
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    return [];
  }
}

function escribir(formatoId, registros) {
  fs.writeFileSync(archivo(formatoId), JSON.stringify(registros, null, 2), 'utf8');
}

function nuevoId() {
  return crypto.randomUUID();
}

function validarEstado(e) {
  return ESTADOS.includes(e) ? e : 'BORRADOR';
}

/* Filtra registros por alcance del usuario: el SISO solo ve sus propios registros */
function filtrarPorUsuario(registros, usuario) {
  if (!usuario) return registros;
  if (usuario.rol === 'COORDINADOR') return registros;
  return registros.filter(r => !r.usuarioId || r.usuarioId === usuario.id);
}

function listar(formatoId, usuario) {
  const registros = leer(formatoId).sort((a, b) => (b.fechaCreacion || '').localeCompare(a.fechaCreacion || ''));
  return filtrarPorUsuario(registros, usuario);
}

function obtener(formatoId, id) {
  return leer(formatoId).find(r => r.id === id) || null;
}

function usuarioNombre(usuario) {
  return (usuario && (usuario.nombre || usuario.email)) || 'sistema';
}

function crear(formatoId, data, usuario) {
  const registros = leer(formatoId);
  const ahora = new Date().toISOString();
  const nuevo = {
    id: nuevoId(),
    data: data || {},
    estado: 'BORRADOR',
    usuarioId: (usuario && usuario.id) || null,
    usuarioCreador: usuarioNombre(usuario),
    fechaCreacion: ahora,
    fechaActualizacion: ahora,
    historial: [{ fecha: ahora, accion: 'CREADO', usuario: usuarioNombre(usuario), detalle: 'Registro creado' }]
  };
  registros.push(nuevo);
  escribir(formatoId, registros);
  return nuevo;
}

function actualizar(formatoId, id, data, usuario) {
  const registros = leer(formatoId);
  const idx = registros.findIndex(r => r.id === id);
  if (idx < 0) return null;
  const antes = JSON.stringify(registros[idx].data);
  registros[idx].data = data || {};
  registros[idx].fechaActualizacion = new Date().toISOString();
  const despues = JSON.stringify(data);
  registros[idx].historial = registros[idx].historial || [];
  registros[idx].historial.push({
    fecha: registros[idx].fechaActualizacion,
    accion: 'ACTUALIZADO',
    usuario: usuarioNombre(usuario),
    detalle: 'Datos modificados',
    dif: antes !== despues ? 'data' : 'solo estado'
  });
  escribir(formatoId, registros);
  return registros[idx];
}

function cambiarEstado(formatoId, id, estado, usuario) {
  const registros = leer(formatoId);
  const idx = registros.findIndex(r => r.id === id);
  if (idx < 0) return null;
  registros[idx].estado = validarEstado(estado);
  registros[idx].fechaActualizacion = new Date().toISOString();
  registros[idx].historial = registros[idx].historial || [];
  registros[idx].historial.push({
    fecha: registros[idx].fechaActualizacion,
    accion: 'ESTADO: ' + registros[idx].estado,
    usuario: usuarioNombre(usuario),
    detalle: 'Cambio de estado'
  });
  escribir(formatoId, registros);
  return registros[idx];
}

function eliminar(formatoId, id) {
  const registros = leer(formatoId);
  const filtrados = registros.filter(r => r.id !== id);
  if (filtrados.length === registros.length) return false;
  escribir(formatoId, filtrados);
  return true;
}

module.exports = {
  ESTADOS,
  listar, obtener, crear, actualizar, cambiarEstado, eliminar
};