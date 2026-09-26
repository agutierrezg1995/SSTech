/* ============================================================
   SSTech SaaS — Controlador principal de la SPA
   Roles: COORDINADOR (todo) / SISO (crear, editar y PDF de lo suyo)
   ============================================================ */

const App = {
  formatos: [],
  formato: null,
  registros: [],
  registro: null,
  data: {},
  usuario: null,
  pagina: 1,
  porPagina: 12
};

const ROI_CONCEDIDO = ['CONCEDIDO', 'CANCELADO'];

const UI = {

  /* ---------- Sesión ---------- */
  esCoordinador() { return App.usuario && App.usuario.rol === 'COORDINADOR'; },

  mostrarLogin() {
    $('login').classList.remove('hidden');
    $('app').classList.add('hidden');
  },

  mostrarApp() {
    $('login').classList.add('hidden');
    $('app').classList.remove('hidden');
  },

  async login() {
    const email = $('login-email').value.trim();
    const pass = $('login-pass').value;
    const err = $('login-error');
    err.classList.add('hidden');
    if (!email || !pass) { err.textContent = 'Ingrese email y contraseña'; err.classList.remove('hidden'); return; }
    this.spinner(true);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      let r;
      try {
        r = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass }),
          signal: ctrl.signal
        });
      } catch (e) {
        clearTimeout(timer);
        throw new Error(e.name === 'AbortError'
          ? 'La solicitud tardó demasiado. Verifica que el servidor esté activo y sin bloqueos.'
          : 'No se pudo conectar al servidor.');
      }
      clearTimeout(timer);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Error de autenticación');
      localStorage.setItem('sstech_token', data.token);
      localStorage.setItem('sstech_usuario', JSON.stringify(data.usuario));
      App.usuario = data.usuario;
      this.mostrarApp();
      this.aplicarRol();
      await this.init();
    } catch (e) {
      err.textContent = e.message;
      err.classList.remove('hidden');
    } finally {
      this.spinner(false);
    }
  },

  cerrarSesion() {
    this.confirmarSwal({
      icon: 'question',
      title: 'Cerrar sesión',
      text: '¿Deseas salir de la plataforma?',
      confirmar: 'Sí, salir'
    }).then(ok => {
      if (!ok.isConfirmed) return;
      try { fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('sstech_token') || '') } }); } catch (e) {}
      localStorage.removeItem('sstech_token');
      localStorage.removeItem('sstech_usuario');
      App.usuario = null;
      this.mostrarLogin();
    });
  },

  async restaurarSesion() {
    const token = localStorage.getItem('sstech_token');
    if (!token) { this.mostrarLogin(); return false; }
    try {
      const r = await api('/api/auth/me');
      App.usuario = r.usuario;
      localStorage.setItem('sstech_usuario', JSON.stringify(r.usuario));
      this.mostrarApp();
      this.aplicarRol();
      await this.init();
      return true;
    } catch (e) {
      this.mostrarLogin();
      return false;
    }
  },

  aplicarRol() {
    const esC = this.esCoordinador();
    const u = App.usuario || {};
    const top = $('topbar-usuario');
    top.innerHTML = `
      ${avatarHTML(u, 38)}
      <div>
        <div><b>${esc(u.nombre || 'Usuarios')}</b> <span class="rol-pill rol-${u.rol}">${u.rol}</span></div>
        <div class="muted smaller">${esc(u.email || '')}</div>
      </div>`;
    // sidebar
    document.querySelectorAll('.nav-item').forEach(n => {
      n.style.display = '';
    });
    $('sidebar-footer').innerHTML = `
      <div class="sidebar-usuario" onclick="UI.abrirPerfil()" title="Abrir configuración de perfil">
        ${avatarHTML(u, 42)}
        <div class="su-info">
          <b>${esc(u.nombre || '')} <span class="rol-pill rol-${u.rol}">${u.rol}</span></b>
          <div class="su-mail">${esc(u.cargo || u.email || '')}</div>
        </div>
      </div>
      <div class="sidebar-copy">${esC ? 'Coordinador SST · Acceso total' : 'SISO · Módulo de campo'}<br>SSTech SaaS © 2026</div>`;
    // botones de rol
    const btnAdmin = $('btn-admin');
    if (btnAdmin) btnAdmin.classList.toggle('hidden', !esC);
    $('btn-indicadores').classList.toggle('hidden', !esC);
    $('sidebar-admin').classList.toggle('hidden', !esC);
  },

  /* ---------- Inicialización ---------- */
  async init() {
    try {
      App.formatos = await api('/api/formatos');
      if (!App.formatos.length) {
        $('header-titulo').innerHTML = '<h1>Sin formatos configurados</h1>';
        return;
      }
      this.renderNav();
      await this.seleccionarFormato(App.formatos[0].id);
    } catch (e) {
      this.toast('Error al iniciar: ' + e.message, true);
    }
  },

  renderNav() {
    const nav = $('navbar');
    nav.innerHTML = App.formatos.map(f =>
      `<button class="nav-item ${f.id === App.formato?.id ? 'activo' : ''}"
         onclick="UI.seleccionarFormato('${f.id}')">
        <span class="nav-icono">${f.icono}</span>
        <span class="nav-texto">${esc(f.nombre)}
          <span class="nav-codigo">${f.codigo} · v${f.version}</span>
        </span>
      </button>`).join('');
  },

  async seleccionarFormato(id) {
    this.spinner(true);
    try {
      const f = App.formatos.find(x => x.id === id);
      App.formato = f;
      this.renderNav();
      const info = await api(`/api/formatos/${id}/esquema`);
      App.formato.esquema = info.esquema;
      App.registros = await api(`/api/formatos/${id}`);
      $('header-titulo').innerHTML =
        `<div class="codigo">${f.codigo} · Versión ${f.version} · ${f.fecha}</div>
         <h1>${descFormat(f.esquema)}</h1>`;
      App.pagina = 1;
      this.renderTabla();
    } catch (e) {
      this.toast('Error cargando formato: ' + e.message, true);
    } finally {
      this.spinner(false);
    }
  },

  /* ---------- Tabla CRUD ---------- */
  registrosFiltrados() {
    const q = ($('busqueda')?.value || '').trim().toLowerCase();
    const fEstado = $('filtroEstado')?.value || '';
    return App.registros.filter(r => {
      if (fEstado && r.estado !== fEstado) return false;
      if (!q) return true;
      return JSON.stringify(r.data || {}).toLowerCase().includes(q);
    });
  },

  renderTabla() {
    const filtrados = this.registrosFiltrados();
    const totalPags = Math.max(1, Math.ceil(filtrados.length / App.porPagina));
    if (App.pagina > totalPags) App.pagina = totalPags;
    const inicio = (App.pagina - 1) * App.porPagina;
    const filas = filtrados.slice(inicio, inicio + App.porPagina);
    const cols = App.formato.listado || [];
    const esC = this.esCoordinador();

    let html = `<table class="crud"><thead><tr><th>#</th>`;
    cols.forEach(c => html += `<th>${esc(c.label)}</th>`);
    html += `<th>Creador</th><th>Estado</th><th>Actualizado</th><th class="acciones">Acciones</th></tr></thead><tbody>`;

    if (!filas.length) {
      html += `<tr><td colspan="${cols.length + 5}" class="vacio">No hay registros todavía. Haz clic en "＋ Nuevo registro".</td></tr>`;
    } else {
      filas.forEach((r, i) => {
        const d = r.data || {};
        html += `<tr>`;
        html += `<td>${inicio + i + 1}</td>`;
        cols.forEach(c => {
          let v = getByPath(d, c.key);
          if (c.tipo === 'fecha') v = fmtFecha(v);
          if (Array.isArray(v)) v = v.length + ' ítems';
          html += `<td>${esc(v || '')}</td>`;
        });
        html += `<td class="smaller">${esc(r.usuarioCreador || '—')}</td>`;
        html += `<td>${pillEstado(r.estado)}</td>`;
        html += `<td class="smaller">${fmtFechaHora(r.fechaActualizacion)}</td>`;
        html += `<td class="acciones">
          <button class="btn btn-outline sm" onclick="UI.verPdf('${r.id}')">PDF</button>
          <button class="btn btn-secondary sm" title="Editar / ver" onclick="UI.editar('${r.id}')">✏️</button>
          ${esC ? `<button class="btn btn-warn sm" title="Eliminar" onclick="UI.eliminarDirecto('${r.id}')">🗑</button>` : ''}
        </td></tr>`;
      });
    }
    html += `</tbody></table>`;
    $('tabla-wrap').innerHTML = html;

    let pager = '';
    for (let p = 1; p <= totalPags; p++) {
      pager += `<button class="btn ${p === App.pagina ? 'btn-primary' : 'btn-secondary'} sm"
        onclick="UI.pagina(${p})">${p}</button>`;
    }
    if (totalPags > 1) pager = `<div id="pager">${pager}</div>`;
    document.querySelectorAll('#pager').forEach(e => e.remove());
    const filt = $('filtros');
    if (filt) filt.insertAdjacentHTML('afterend', pager);
  },

  pagina(p) { App.pagina = p; this.renderTabla(); },

  /* ---------- Modal de edición ---------- */
  nuevo() {
    App.registro = null;
    App.data = inicialData(App.formato.esquema);
    aplicarAutoFechas(App.formato.esquema, App.data);
    this.abrirModal();
  },

  async editar(id) {
    this.spinner(true);
    try {
      const full = await api(`/api/formatos/${App.formato.id}/${id}`);
      App.registro = full;
      App.data = JSON.parse(JSON.stringify(full.data || {}));
      this.abrirModal();
    } catch (e) {
      this.toast('Error cargando: ' + e.message, true);
    } finally {
      this.spinner(false);
    }
  },

  abrirModal() {
    const esNuevo = !App.registro;
    const esC = this.esCoordinador();
    $('modal-badge').textContent = esNuevo ? 'NUEVO' : (App.formato.codigo + ' · ' + App.registro.id.slice(0, 8).toUpperCase());
    $('modal-titulo').textContent = `${descFormat(App.formato.esquema)} — ${esNuevo ? 'Nuevo registro' : 'Editar registro'}`;
    $('modal-sub').textContent = esNuevo
      ? `Código: ${App.formato.codigo} · Versión ${App.formato.version}`
      : `Creado: ${fmtFechaHora(App.registro.fechaCreacion)} · por ${esc(App.registro.usuarioCreador || '—')}`;

    const estadoSel = $('modal-estado');
    const estados = esC ? ['BORRADOR', 'CONCEDIDO', 'NO CONCEDIDO', 'CANCELADO']
      : ['BORRADOR', 'NO CONCEDIDO'];
    estadoSel.innerHTML = estados.map(e => `<option ${App.registro?.estado === e ? 'selected' : ''}>${e}</option>`).join('');
    estadoSel.disabled = esNuevo;

    $('btn-eliminar').classList.toggle('hidden', esNuevo || !esC);

    this.renderForm();
    this.renderHistorial();
    $('modal').classList.remove('hidden');
    $('modal-body').scrollTop = 0;
  },

  cerrarModal() { $('modal').classList.add('hidden'); },

  renderHistorial() {
    const el = $('historial');
    const hist = (App.registro && App.registro.historial) || [];
    if (!hist.length) {
      el.innerHTML = '<div class="vacio">Sin eventos todavía</div>';
      return;
    }
    el.innerHTML = hist.map(h => `
      <div class="historial-item">
        <b>${esc(h.accion)}</b> — ${esc(h.detalle || '')}
        <div class="h-fecha">${fmtFechaHora(h.fecha)} · ${esc(h.usuario || 'sistema')}</div>
      </div>`).join('');
  },

  cambioEstado() {
    const e = $('modal-estado').value;
    if (App.registro) this.selectEstadoPersistencia = e;
  },

  renderForm() {
    const esquema = App.formato.esquema;
    $('modal-body').innerHTML = (esquema.secciones || [])
      .map(renderSeccionHTML).join('');
  },

  /* ---------- Setters de datos ---------- */
  setVal(path, value) {
    setByPath(App.data, path, value);
    quitarErrorUI(path);
  },

  setCheck(key, optKey, checked) {
    const checks = App.data[key] || {};
    if (checked) checks[optKey] = optKey; else delete checks[optKey];
    App.data[key] = checks;
    quitarErrorUI(key + '.' + optKey);
    quitarErrorUI(key);
  },

  setTarea(keyT, n, v) {
    if (!App.data[keyT]) App.data[keyT] = {};
    App.data[keyT][n] = v;
    quitarErrorUI(keyT + '.' + n);
    this.actualizarTareas(n, v);
  },

  actualizarTareas(n, v) {
    const esq = App.formato.esquema;
    (esq.secciones || []).forEach(sec => {
      if (sec.checklists) this.renderForm();
    });
  },

  setVerif(keyV, gKey, idx, v) {
    if (!App.data[keyV]) App.data[keyV] = {};
    if (!App.data[keyV][gKey]) App.data[keyV][gKey] = [];
    App.data[keyV][gKey][idx] = v;
    quitarErrorUI(keyV + '.' + gKey + '.' + idx);
    this.estadoAuto = estadoPermiso(App.data);
  },

  /* ---------- Filas dinámicas ---------- */
  agregarFila(tablaKey) {
    if (!App.data[tablaKey]) App.data[tablaKey] = [];
    App.data[tablaKey].push({});
    this.renderForm();
  },

  quitarFila(tablaKey, idx) {
    App.data[tablaKey].splice(idx, 1);
    this.renderForm();
  },

  /* ---------- Guardar / eliminar ---------- */
  async guardar() {
    const errores = validarFormulario(App.formato.esquema, App.data);
    if (errores.length) {
      marcarErroresUI(errores);
      this.toast(errores.length + ' campo(s) por corregir. Revise los resaltados.', true);
      return;
    }
    this.spinner(true);
    try {
      if (!App.registro) {
        App.registro = await api(`/api/formatos/${App.formato.id}`, {
          method: 'POST', body: JSON.stringify({ data: App.data })
        });
      } else {
        App.registro = await api(`/api/formatos/${App.formato.id}/${App.registro.id}`, {
          method: 'PUT', body: JSON.stringify({ data: App.data })
        });
      }
      // aplicar estado automático si hay NO
      const auto = estadoPermiso(App.data);
      if (this.esCoordinador() && App.registro.estado !== 'CANCELADO' && auto !== App.registro.estado) {
        await api(`/api/formatos/${App.formato.id}/${App.registro.id}/estado`, {
          method: 'PATCH', body: JSON.stringify({ estado: auto })
        });
        App.registro.estado = auto;
      }
      // aplicar estado manual seleccionado
      if (this.selectEstadoPersistencia && this.selectEstadoPersistencia !== App.registro.estado) {
        await api(`/api/formatos/${App.formato.id}/${App.registro.id}/estado`, {
          method: 'PATCH', body: JSON.stringify({ estado: this.selectEstadoPersistencia })
        });
        App.registro.estado = this.selectEstadoPersistencia;
      }
      this.selectEstadoPersistencia = null;
      App.registros = await api(`/api/formatos/${App.formato.id}`);
      this.renderTabla();
      this.renderHistorial();
      this.toast('Registro guardado');
    } catch (e) {
      this.toast('Error al guardar: ' + e.message, true);
    } finally {
      this.spinner(false);
    }
  },

  async eliminar() {
    if (!App.registro || !this.esCoordinador()) return;
    const ok = await this.confirmarSwal({
      icon: 'warning',
      title: '¿Eliminar este registro?',
      text: 'Esta acción no se puede deshacer. El registro se eliminará permanentemente.',
      confirmar: 'Sí, eliminar',
      colorPeligro: true
    });
    if (!ok.isConfirmed) return;
    this.spinner(true);
    try {
      await api(`/api/formatos/${App.formato.id}/${App.registro.id}`, { method: 'DELETE' });
      App.registros = await api(`/api/formatos/${App.formato.id}`);
      this.cerrarModal();
      this.renderTabla();
      this.toast('Registro eliminado');
    } catch (e) {
      this.toast('Error al eliminar: ' + e.message, true);
    } finally {
      this.spinner(false);
    }
  },

  async eliminarDirecto(id) {
    const ok = await this.confirmarSwal({
      icon: 'warning',
      title: '¿Eliminar este registro?',
      text: 'Esta acción no se puede deshacer. El registro se eliminará permanentemente.',
      confirmar: 'Sí, eliminar',
      colorPeligro: true
    });
    if (!ok.isConfirmed) return;
    this.spinner(true);
    try {
      await api(`/api/formatos/${App.formato.id}/${id}`, { method: 'DELETE' });
      App.registros = await api(`/api/formatos/${App.formato.id}`);
      this.renderTabla();
      this.toast('Registro eliminado');
    } catch (e) {
      this.toast('Error al eliminar: ' + e.message, true);
    } finally {
      this.spinner(false);
    }
  },

  /* ---------- PDF ---------- */
  async verPdf(id) {
    this.spinner(true);
    try {
      const r = await api(`/api/formatos/${App.formato.id}/${id}/pdf`, {
        method: 'POST', body: '{}'
      });
      $('pdf-titulo').textContent = `${App.formato.codigo} — ${descFormat(App.formato.esquema)}`;
      $('pdf-sub').textContent = `Registro ${String(id).slice(0, 8)} · ${new Date().toLocaleString('es-CO')}`;
      $('pdf-frame').src = r.url + '?t=' + Date.now();
      $('pdf-descargar').href = r.url;
      $('pdf-descargar').setAttribute('download', r.filename);
      $('modalPdf').classList.remove('hidden');
    } catch (e) {
      this.toast('Error PDF: ' + e.message, true);
    } finally {
      this.spinner(false);
    }
  },

  async generarPDF() {
    if (!App.registro) { await this.guardar(); }
    if (App.registro) this.verPdf(App.registro.id);
  },

  cerrarPdf() {
    $('modalPdf').classList.add('hidden');
    $('pdf-frame').src = 'about:blank';
  },

  /* ---------- Indicadores (Coordinador) ---------- */
  async abrirIndicadores() {
    if (!this.esCoordinador()) return;
    $('ind-titulo').textContent = App.formato.codigo + ' — ' + descFormat(App.formato.esquema);
    $('ind-sub').textContent = 'Filtre por rango de fechas. Indicadores calculados sobre los registros visibles.';
    $('ind-desde').value = '';
    $('ind-hasta').value = '';
    $('modalInd').classList.remove('hidden');
    await this.cargarIndicadores();
  },

  cerrarIndicadores() { $('modalInd').classList.add('hidden'); },

  async cargarIndicadores() {
    this.spinner(true);
    try {
      const desde = $('ind-desde').value;
      const hasta = $('ind-hasta').value;
      let url = `/api/formatos/${App.formato.id}/indicadores`;
      const q = [];
      if (desde) q.push('desde=' + desde);
      if (hasta) q.push('hasta=' + hasta);
      if (q.length) url += '?' + q.join('&');
      const r = await api(url);
      this.renderIndicadores(r);
    } catch (e) {
      this.toast('Error indicadores: ' + e.message, true);
    } finally {
      this.spinner(false);
    }
  },

  renderIndicadores(r) {
    const items = r.indicadores || [];
    let html = `<div class="kpis-grid">`;
    items.forEach(k => {
      html += `<div class="kpi-card">
        <div class="kpi-codigo">${esc(k.codigo)}</div>
        <div class="kpi-valor">${esc(k.valor ?? '—')}</div>
        <div class="kpi-nombre">${esc(k.nombre)}</div>
        <div class="kpi-sub muted smaller">${k.tipo} · ${k.registrosAnalizados} registros analizados</div>
      </div>`;
    });
    html += `</div>`;
    if (!items.length) html = '<div class="vacio">Este formato no tiene indicadores definidos.</div>';
    $('ind-body').innerHTML = html;
  },

  exportarIndicadoresCSV() {
    const cards = document.querySelectorAll('#ind-body .kpi-card');
    const filas = [['Codigo', 'Indicador', 'Valor', 'Tipo']];
    cards.forEach(c => {
      filas.push([
        c.querySelector('.kpi-codigo').textContent,
        c.querySelector('.kpi-nombre').textContent,
        c.querySelector('.kpi-valor').textContent,
        c.querySelector('.kpi-sub').textContent
      ]);
    });
    const csv = '\uFEFF' + filas.map(f => f.map(v => `"${v.replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${App.formato.id}_indicadores.csv`;
    a.click();
    this.toast('CSV de indicadores exportado');
  },

  /* ---------- Administración de usuarios (Coordinador) ---------- */
  async abrirAdmin() {
    if (!this.esCoordinador()) return;
    $('modalAdmin').classList.remove('hidden');
    await this.cargarUsuarios();
  },

  cerrarAdmin() { $('modalAdmin').classList.add('hidden'); },

  async cargarUsuarios() {
    this.spinner(true);
    try {
      const usuarios = await api('/api/usuarios');
      const html = `
        <div class="admin-titulo">Nuevo subalterno — SISO</div>
        <div class="admin-form">
          <input type="text" id="nu-nombre" placeholder="Nombre completo">
          <input type="email" id="nu-email" placeholder="correo@sstech.co">
          <input type="password" id="nu-pass" placeholder="Contraseña">
          <button class="btn btn-primary" onclick="UI.crearUsuario()">＋ Crear SISO</button>
        </div>
        <div class="muted smaller" style="margin-top:6px">
          El nuevo SISO podrá iniciar sesión con ese correo y contraseña.
        </div>
        <div class="admin-titulo" style="margin-top:18px">Usuarios existentes</div>
        <table class="crud"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th></tr></thead><tbody>
          ${usuarios.map(u => `<tr><td>${esc(u.nombre)}</td><td>${esc(u.email)}</td>
            <td><span class="rol-pill rol-${u.rol}">${u.rol}</span></td><td>${u.activo ? 'Activo' : 'Inactivo'}</td></tr>`).join('')}
        </tbody></table>`;
      $('admin-body').innerHTML = html;
    } catch (e) {
      this.toast('Error usuarios: ' + e.message, true);
    } finally {
      this.spinner(false);
    }
  },

  async crearUsuario() {
    const nombre = $('nu-nombre').value.trim();
    const email = $('nu-email').value.trim();
    const password = $('nu-pass').value;
    const rol = 'SISO';
    if (!nombre || !email || !password) { this.toast('Complete todos los campos', true); return; }
    this.spinner(true);
    try {
      const creado = await api('/api/usuarios', { method: 'POST', body: JSON.stringify({ nombre, email, password, rol }) });
      this.toast(`SISO ${creado.nombre || ''} creado. Puede ingresar con ${creado.email || email}`);
      $('nu-nombre').value = '';
      $('nu-email').value = '';
      $('nu-pass').value = '';
      await this.cargarUsuarios();
    } catch (e) {
      this.toast('Error al crear usuario: ' + e.message, true);
    } finally {
      this.spinner(false);
    }
  },

  /* ---------- Perfil de usuario (foto y datos) ---------- */
  abrirPerfil() {
    const u = App.usuario || {};
    $('perfil-sub').textContent = u.email ? 'Cuenta: ' + u.email : '';
    $('perfil-body').innerHTML = this.renderPerfilHTML(u);
    $('modalPerfil').classList.remove('hidden');
    $('modalPerfil').querySelector('.modal-box').classList.add('animate__animated', 'animate__fadeInUp');
  },

  cerrarPerfil() { $('modalPerfil').classList.add('hidden'); },

  renderPerfilHTML(u) {
    return `
      <div class="perfil-wrap">
        <div class="perfil-grid">
          <div class="perfil-foto-col">
            <div class="perfil-avatar" id="perfil-avatar">${avatarFotoGrande(u)}</div>
            <input type="file" id="perfil-foto-input" accept="image/png,image/jpeg" hidden
              onchange="UI.cargarFoto(this)">
            <div class="perfil-foto-botones">
              <button class="btn btn-primary sm" onclick="$('perfil-foto-input').click()">📷 Subir foto</button>
              <button class="btn btn-outline sm" onclick="UI.quitarFoto()">🗑 Quitar</button>
            </div>
            <div class="muted smaller" style="margin-top:6px">PNG o JPG · se redimensiona automáticamente</div>
          </div>
          <div class="perfil-fields">
            <div class="campo">
              <label for="pf-nombre">Nombre completo *</label>
              <input type="text" id="pf-nombre" value="${esc(u.nombre || '')}">
            </div>
            <div class="campo">
              <label for="pf-cargo">Cargo</label>
              <input type="text" id="pf-cargo" value="${esc(u.cargo || '')}" placeholder="Ej. Coordinador SST">
            </div>
            <div class="campo">
              <label for="pf-cedula">Cédula</label>
              <input type="text" id="pf-cedula" value="${esc(u.cedula || '')}" placeholder="Número de identificación">
            </div>
            <div class="campo">
              <label for="pf-telefono">Teléfono</label>
              <input type="text" id="pf-telefono" value="${esc(u.telefono || '')}" placeholder="+57 300 000 0000">
            </div>
            <div class="campo">
              <label>Correo electrónico</label>
              <input type="email" value="${esc(u.email || '')}" disabled title="No se puede modificar">
            </div>
            <div class="campo">
              <label>Rol</label>
              <div><span class="rol-pill rol-${u.rol}">${u.rol}</span></div>
            </div>
          </div>
        </div>
        <div class="modal-footer perfil-footer">
          <button class="btn btn-primary" onclick="UI.guardarPerfil()">💾 Guardar cambios</button>
          <button class="btn btn-outline" onclick="UI.cerrarPerfil()">Cancelar</button>
        </div>
      </div>`;
  },

  cargarFoto(input) {
    const file = input && input.files && input.files[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g)$/.test(file.type)) {
      this.toast('Formato no permitido. Usa PNG o JPG.', true);
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const max = 512;
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * escala));
        const h = Math.max(1, Math.round(img.height * escala));
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        this._fotoNueva = cv.toDataURL('image/jpeg', 0.85);
        this.pintarAvatarPerfil();
        this.toast('Foto lista. Haz clic en "Guardar cambios".');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  quitarFoto() {
    this._fotoNueva = '';
    this.pintarAvatarPerfil();
  },

  pintarAvatarPerfil() {
    const el = $('perfil-avatar');
    if (!el) return;
    const foto = this._fotoNueva !== undefined ? this._fotoNueva : (App.usuario.foto || '');
    el.innerHTML = foto ? avatarFotoGrande(foto, true) : avatarInicial(App.usuario, 96);
  },

  async guardarPerfil() {
    const nombre = $('pf-nombre').value.trim();
    if (!nombre) { this.toast('El nombre no puede estar vacío', true); return; }
    const foto = this._fotoNueva !== undefined ? this._fotoNueva : (App.usuario.foto || '');
    this.spinner(true);
    try {
      const r = await api('/api/auth/perfil', {
        method: 'PATCH',
        body: JSON.stringify({
          nombre,
          foto,
          cargo: $('pf-cargo').value.trim(),
          cedula: $('pf-cedula').value.trim(),
          telefono: $('pf-telefono').value.trim()
        })
      });
      App.usuario = r.usuario;
      localStorage.setItem('sstech_usuario', JSON.stringify(r.usuario));
      this._fotoNueva = undefined;
      this.aplicarRol();
      this.cerrarPerfil();
      this.toast('Perfil actualizado');
    } catch (e) {
      this.toast('Error al guardar perfil: ' + e.message, true);
    } finally {
      this.spinner(false);
    }
  },

  /* ---------- Diálogo profesional (SweetAlert2) ---------- */
  confirmarSwal(opciones) {
    const o = opciones || {};
    return Swal.fire({
      title: o.title || '¿Estás seguro?',
      text: o.text || '',
      icon: o.icon || 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: o.confirmar || 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: o.colorPeligro ? '#b02a2a' : '#1d7a46',
      cancelButtonColor: '#94a3b8',
      buttonsStyling: true,
      customClass: {
        popup: 'animate__animated animate__zoomIn'
      }
    });
  },

  /* ---------- Exportar CSV registros ---------- */
  exportarCSV() {
    const cols = App.formato.listado || [];
    const filas = this.registrosFiltrados();
    const escCSV = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const cab = ['#', ...cols.map(c => c.label), 'Creador', 'Estado', 'Actualizado'].map(escCSV).join(';');
    const lineas = [cab];
    filas.forEach((r, i) => {
      const d = r.data || {};
      const celdas = [i + 1,
        ...cols.map(c => {
          let v = getByPath(d, c.key);
          if (c.tipo === 'fecha') v = fmtFecha(v);
          if (Array.isArray(v)) v = v.length + ' ítems';
          return v;
        }),
        r.usuarioCreador || '', r.estado, fmtFechaHora(r.fechaActualizacion)
      ].map(escCSV).join(';');
      lineas.push(celdas);
    });
    const blob = new Blob(['\uFEFF' + lineas.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${App.formato.id}_registros.csv`;
    a.click();
    this.toast('CSV exportado');
  },

  /* ---------- Utilidades ---------- */
  spinner(on) { $('spinner').classList.toggle('hidden', !on); },

  toast(msg, error) {
    const t = $('toast');
    t.textContent = msg;
    t.className = error ? 'error' : '';
    t.classList.remove('hidden');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => t.classList.add('hidden'), 3200);
  }
};

function descFormat(s) {
  return (s && s.nombre) ? s.nombre : '';
}

/* Avatar (con foto del perfil si existe) */
function avatarInicial(u, px) {
  const inicial = esc(String((u && u.nombre) || 'U')[0].toUpperCase());
  const color = u && u.rol === 'COORDINADOR' ? '#1d7a46' : '#1d5b8c';
  return `<div class="avatar" style="--color:${color}">${inicial}</div>`;
}

function avatarFotoGrande(u, esDataUrl) {
  const foto = esDataUrl ? u : ((u && u.foto) || '');
  if (foto) {
    return `<div class="avatar avatar-foto" style="background-image:url('${foto}')"></div>`;
  }
  return avatarInicial(u, 96);
}

function avatarHTML(u, px) {
  const foto = (u && u.foto) || '';
  if (foto) {
    return `<div class="avatar avatar-foto" style="background-image:url('${foto}')"></div>`;
  }
  return avatarInicial(u, px);
}

const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('sstech_token');
  if (token) {
    try { App.usuario = JSON.parse(localStorage.getItem('sstech_usuario') || 'null'); } catch (e) { App.usuario = null; }
  }
  UI.restaurarSesion();
});