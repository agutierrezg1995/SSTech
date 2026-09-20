# tests — SSTech SaaS

Pruebas automáticas y documentación del proyecto.

```
tests/
├── unit/                     # Tests unitarios (Node18+, sin navegador)
│   ├── util.test.js          # utilidades: getByPath/setByPath, inicialData, estadoPermiso
│   ├── validacion.test.js    # motor de validaciones (todos los formatos)
│   └── helpers/
│       └── entorno.js        # carga util.js + validacion.js en Node (stubs)
├── e2e/
│   └── validacion.e2e.js     # flujo completo en navegador (puppeteer-core)
└── documentacion/
    ├── validaciones.md       # reglas de validación por formato + motor
    └── pruebas.md            # cómo ejecutar unitarias, e2e y manuales
```

## Ejecutar

```bash
# unitarias (no requiere servidor)
node --test tests/unit/

# e2e (requiere servidor en http://localhost:3200)
cd Proyecto/platform && npm start          # terminal 1
node tests/e2e/validacion.e2e.js           # terminal 2
```

Cuentas demo: `coordinador@sstech.co` / `coordinador123` y `siso@sstech.co` / `siso123`.