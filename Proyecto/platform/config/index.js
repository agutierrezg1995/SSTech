/*
 * Índice de formatos registrados en la plataforma.
 * Cada formato vive en su carpeta: Proyecto/formatos/<id>/
 *   - esquema.js      → definición del formato (campos, tablas, tareas, checklists)
 *   - indicadores.js  → KPIs específicos del formato (opcional)
 * Agregar un formato nuevo = crear su carpeta (no tocar el motor).
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', '..', 'formatos');

const formatos = fs.readdirSync(DIR)
  .filter(f => fs.existsSync(path.join(DIR, f, 'esquema.js')))
  .sort()
  .map(f => {
    const def = require(path.join(DIR, f, 'esquema.js'));
    const indicadores = fs.existsSync(path.join(DIR, f, 'indicadores.js'))
      ? require(path.join(DIR, f, 'indicadores.js'))
      : [];
    return {
      id: def.id,
      codigo: def.codigo,
      nombre: def.nombre,
      fecha: def.fecha,
      version: def.version,
      color: def.color || '#0f2a43',
      icono: def.icono || '📄',
      listado: def.listado || [],
      esquema: def,
      indicadores: indicadores || []
    };
  });

module.exports = formatos;

function obtenerFormato(id) {
  return formatos.find(f => f.id === id) || null;
}

module.exports.obtenerFormato = obtenerFormato;