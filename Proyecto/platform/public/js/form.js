/* ============================================================
   SSTech SaaS — Render del formulario dinámico según esquema
   Usa: App.data, App.formato, UI.renderForm, UI.toast
   ============================================================ */

/* Dispacha el render de un campo según su tipo */
function renderCampoHTML(c) {
  const key = c.key;
  const val = getByPath(App.data, key);
  switch (c.type) {
    case 'textarea':
      return `<label>${esc(c.label)}${c.required ? ' *' : ''}</label>
        <textarea data-path="${key}" oninput="UI.setVal('${key}', this.value)">${esc(val)}</textarea>`;
    case 'number':
      return `<label>${esc(c.label)}${c.required ? ' *' : ''}</label>
        <input type="number" data-path="${key}" value="${esc(val)}" oninput="UI.setVal('${key}', this.value)">
        ${c.agregar !== false ? `<button class="btn btn-secondary sm" style="margin-top:4px" onclick="UI.agregar(${c.valorPorDefecto || 14})">＋ Siguiente ${c.valorPorDefecto || 14}</button>` : ''}`;
    case 'time':
      return `<label>${esc(c.label)}${c.required ? ' *' : ''}</label>
        <input type="time" data-path="${key}" value="${esc(val)}" oninput="UI.setVal('${key}', this.value)">`;
    case 'date':
      return `<label>${esc(c.label)}${c.required ? ' *' : ''}</label>
        <input type="date" data-path="${key}" value="${esc(val)}" oninput="UI.setVal('${key}', this.value)">`;
    case 'radio':
      return `<label>${esc(c.label)}${c.required ? ' *' : ''}</label>
        <div class="opciones" data-path="${key}">
          ${(c.opciones || []).map(o =>
            `<label class="opcion-radio">
              <input type="radio" name="${key}" value="${esc(o.value)}"
                ${val === o.value ? 'checked' : ''}
                ${c.onChange ? `onchange="${c.onChange}"` : `onchange="UI.setVal('${key}', this.value)"`}>
              ${esc(o.label)}
            </label>`).join('')}
        </div>`;
    case 'checkbox':
      return `<label>${esc(c.label)}${c.required ? ' *' : ''}</label>
        <div class="opciones" data-path="${key}">
          ${(c.opciones || []).map(o =>
            `<label class="opcion-check">
              <input type="checkbox" value="${esc(o.value)}"
                ${getByPath(App.data, key + '.' + o.value) ? 'checked' : ''}
                onchange="UI.setCheck('${key}', '${o.value}', this.checked)">
              ${esc(o.label)}
            </label>`).join('')}
        </div>`;
    case 'select':
      return `<label>${esc(c.label)}${c.required ? ' *' : ''}</label>
        <select data-path="${key}" ${c.onChange ? `onchange="${c.onChange}"` : `onchange="UI.setVal('${key}', this.value)"`}>
          <option value="">— Seleccione —</option>
          ${(c.opciones || []).map(o =>
            `<option value="${esc(o.value)}" ${val === o.value ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
        </select>`;
    default:
      return `<label>${esc(c.label)}${c.required ? ' *' : ''}</label>
        <input type="text" data-path="${key}" value="${esc(val)}" oninput="UI.setVal('${key}', this.value)">`;
  }
}

/* Render de una sección completa */
function renderSeccionHTML(sec) {
  let html = '';
  if (sec.titulo) html += `<div class="form-seccion-titulo">${esc(sec.titulo)}</div>`;

  if (sec.campos && sec.campos.filter(c => c.type !== 'checklist-sec').length) {
    html += `<div class="form-grid">`;
    (sec.campos || []).forEach(c => {
      if (c.type === 'checklist-sec') return;
      const classExtra = c.span ? ` style="grid-column: 1/-1"` : '';
      html += `<div class="campo"${classExtra}>${renderCampoHTML(c)}</div>`;
    });
    html += `</div>`;
  }

  if (sec.tabla) html += renderTablaDinamicaHTML(sec.tabla);
  if (sec.tareas) html += renderTareasHTML(sec.tareas);
  if (sec.checklists) html += renderChecklistsHTML(sec.checklists);

  return `<div class="form-seccion">${html}</div>`;
}

/* Tabla dinámica (filas agregables) */
function renderTablaDinamicaHTML(tabla) {
  const key = tabla.key;
  const filas = App.data[key] || [];
  const cols = tabla.cols || [];
  let html = `<div class="tabla-dinamica" data-path="${key}"><table><thead><tr>`;
  (tabla.header || cols.map(c => c.label)).forEach(h => html += `<th>${esc(h)}</th>`);
  html += `<th></th></tr></thead><tbody>`;

  filas.forEach((fila, i) => {
    html += `<tr>`;
    cols.forEach(c => {
      const fk = c.tipo === 'radio' ? `${key}.${i}.${c.key}` : `${key}.${i}.${c.key}`;
      const fval = getByPath(App.data, fk);
      if (c.tipo === 'radio') {
        const op = c.opciones || ['SI', 'NO', 'NA'];
        html += `<td data-path="${fk}"><div class="respu">${op.map(o =>
          `<label><input type="radio" name="${fk}_r" value="${o}"
            ${fval === o ? 'checked' : ''}
            onchange="UI.setVal('${fk}', '${o}')">${o}</label>`).join('')}</div></td>`;
      } else {
        html += `<td><input type="text" data-path="${fk}" value="${esc(fval)}" oninput="UI.setVal('${fk}', this.value)"></td>`;
      }
    });
    html += `<td><button class="btn-quitar" title="Quitar fila" onclick="UI.quitarFila('${key}', ${i})">✕</button></td>`;
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  html += `<button class="boton-agregar-fila" onclick="UI.agregarFila('${key}')">＋ Agregar fila</button></div>`;
  return html;
}

/* Tareas con NATIVO SI / NO (checkPorTarea) */
function renderTareasHTML(tareas) {
  const key = tareas.key;
  const items = tareas.items || tareas.opciones || [];
  let html = `<div class="tabla-verif"><table><thead><tr>`;
  (tareas.header || ['#', 'TAREA A REALIZAR', 'RESPUESTA']).forEach(h => html += `<th>${esc(h)}</th>`);
  html += `</tr></thead><tbody>`;

  items.forEach(t => {
    const val = (App.data[key] || {})[t.n] || '';
    const opciones = t.opciones || ['SI', 'NO'];
    html += `<tr>
      <td>${t.n}</td>
      <td class="texto-item">${esc(t.texto || t.nombre || '')}</td>
      <td><div class="respu" data-path="${key}.${t.n}">${opciones.map(o =>
        `<label><input type="radio" name="${key}_${t.n}" value="${o}"
          ${val === o ? 'checked' : ''}
          onchange="UI.setTarea('${key}', ${t.n}, '${o}')">${o}</label>`).join('')}</div></td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  return html;
}

/* Checklists (grupos con soloSi opcional) */
function renderChecklistsHTML(checklists) {
  const key = checklists.key || 'verif';
  const base = checklists.grupos || [];
  const grupos = Array.isArray(base) ? base : Object.keys(base).map(k => ({ key: k, ...base[k] }));
  let html = `<div class="tabla-verif"><table><thead><tr>
    <th class="texto-item">ACTIVIDAD / ELEMENTO A VERIFICAR</th>
    <th>RESPUESTA</th>
  </tr></thead><tbody>`;

  grupos.forEach(g => {
    const mostrar = g.soloSi ? (App.data.tareas || {})[g.soloSi] === 'SI' : true;
    if (!mostrar) return;
    if (g.titulo) html += `<tr><td colspan="2" style="background:#f0f4f8;font-weight:700">${esc(g.titulo)}</td></tr>`;
    const valores = (App.data[key] || {})[g.key] || [];
    (g.items || []).forEach((item, i) => {
      const v = valores[i] || '';
      html += `<tr>
        <td class="texto-item">${esc(item)}</td>
        <td><div class="respu" data-path="${key}.${g.key}.${i}">
          ${['SI', 'NO'].map(o =>
            `<label><input type="radio" name="${key}_${g.key}_${i}" value="${o}"
              ${v === o ? 'checked' : ''}
              onchange="UI.setVerif('${key}', '${g.key}', ${i}, '${o}')">${o}</label>`).join('')}
        </div></td>
      </tr>`;
    });
  });

  html += `</tbody></table></div>`;
  return html;
}