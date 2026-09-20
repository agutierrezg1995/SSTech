/*
 * Sembrar usuarios demo — node seed.js
 * Crea (si no existen) un Coordinador SST y un SISO de ejemplo.
 */
const auth = require('./lib/auth');
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, 'data', 'usuarios.json');

const demo = [
  { nombre: 'Ana Coordinadora', email: 'coordinador@sstech.co', password: 'coordinador123', rol: 'COORDINADOR' },
  { nombre: 'Carlos SISO', email: 'siso@sstech.co', password: 'siso123', rol: 'SISO' }
];

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '[]', 'utf8');
}

let creados = 0;
demo.forEach(u => {
  const r = auth.crearUsuario(u);
  if (r.error && r.error.includes('Ya existe')) {
    console.log(`· ${u.email}: ya existe (omitido)`);
  } else if (r.ok) {
    console.log(`✔ ${u.email}: creado (${u.rol})`);
    creados++;
  } else {
    console.log(`✖ ${u.email}: ${r.error}`);
  }
});

console.log('\nUsuarios demo listos. Contraseñas:');
demo.forEach(u => console.log(`  ${u.email}  /  ${u.password}`));