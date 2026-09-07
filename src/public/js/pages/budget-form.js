import api from '../api.js';
import { formatCurrency, formatDate } from '../format.js';

let state = {
  id: null,
  numero: null,
  fechaEmision: null,
  fechaValidez: null,
  clients: [],
  clientId: '',
  inlineTipo: 'empresa',
  nuevoCliente: false,
  activarRetencion: false,
  porcentaje: 15,
  lineas: [],
};

const UI = {};

function calcTotals() {
  const base = state.lineas.reduce(
    (sum, l) => sum + (Number(l.cantidad) || 0) * (Number(l.precio_unitario) || 0),
    0
  );
  const iva = base * 0.21;
  const esParticular = !state.nuevoCliente
    ? state.clientId
      ? (state.clients.find((c) => String(c.id) === String(state.clientId)) || {}).tipo === 'particular'
      : false
    : state.inlineTipo === 'particular';
  const aplicaRetencion = !esParticular && state.activarRetencion;
  const retencion = aplicaRetencion ? (base * state.porcentaje) / 100 : 0;
  const round = (x) => Math.round(x * 100) / 100;
  return {
    base: round(base),
    iva: round(iva),
    retencion: round(retencion),
    total: round(base + iva - retencion),
    esParticular,
  };
}

function renderTotals() {
  const t = calcTotals();
  UI.totalRows.innerHTML = `
    <tr><td>Base imponible</td><td class="num">${formatCurrency(t.base)}</td></tr>
    <tr><td>IVA (21%)</td><td class="num">${formatCurrency(t.iva)}</td></tr>
    ${
      t.retencion > 0
        ? `<tr><td>Retención IRPF (${state.porcentaje}%)</td><td class="num">−${formatCurrency(t.retencion)}</td></tr>`
        : ''
    }
    <tr class="total-row"><td><strong>Total a pagar</strong></td><td class="num"><strong>${formatCurrency(
      t.total
    )}</strong></td></tr>`;
  updateRetencionVisibility(t.esParticular);
}

function updateRetencionVisibility(esParticular) {
  if (!UI.retencionSection) return;
  UI.retencionSection.hidden = esParticular;
  if (esParticular) {
    state.activarRetencion = false;
    UI.retencionToggle.checked = false;
  }
}

function renderLines() {
  if (!state.lineas.length) {
    UI.linesBody.innerHTML =
      '<tr><td colspan="5" class="empty-state">Aún no hay líneas. Añade desde el catálogo o manualmente.</td></tr>';
    return;
  }
  UI.linesBody.innerHTML = state.lineas
    .map(
      (l, idx) => `
      <tr data-idx="${idx}">
        <td><input class="line-desc" data-idx="${idx}" value="${l.descripcion || ''}" placeholder="Descripción" /></td>
        <td class="line-qty"><input type="number" step="any" min="0.01" class="line-cant" data-idx="${idx}" value="${l.cantidad}" /></td>
        <td class="line-price"><input type="number" step="0.01" min="0" class="line-precio" data-idx="${idx}" value="${l.precio_unitario}" /></td>
        <td class="num line-subtotal">${formatCurrency(
          (Number(l.cantidad) || 0) * (Number(l.precio_unitario) || 0)
        )}</td>
        <td><button class="btn btn-sm btn-danger line-remove" data-idx="${idx}">Quitar</button></td>
      </tr>`
    )
    .join('');
  UI.linesBody.querySelectorAll('.line-desc').forEach((el) =>
    el.addEventListener('input', (e) => {
      state.lineas[Number(e.target.dataset.idx)].descripcion = e.target.value;
    })
  );
  UI.linesBody.querySelectorAll('.line-cant').forEach((el) =>
    el.addEventListener('input', (e) => {
      state.lineas[Number(e.target.dataset.idx)].cantidad = Number(e.target.value);
      renderLines();
      renderTotals();
    })
  );
  UI.linesBody.querySelectorAll('.line-precio').forEach((el) =>
    el.addEventListener('input', (e) => {
      state.lineas[Number(e.target.dataset.idx)].precio_unitario = Number(e.target.value);
      renderLines();
      renderTotals();
    })
  );
  UI.linesBody.querySelectorAll('.line-remove').forEach((el) =>
    el.addEventListener('click', (e) => {
      state.lineas.splice(Number(e.target.dataset.idx), 1);
      renderLines();
      renderTotals();
    })
  );
}

function addManualLine() {
  state.lineas.push({ descripcion: '', cantidad: 1, precio_unitario: 0 });
  renderLines();
  renderTotals();
}

function addCatalogLine(service) {
  const existing = state.lineas.find((l) => l.servicio_id === service.id);
  if (existing) {
    existing.cantidad = Number(existing.cantidad) + 1;
  } else {
    state.lineas.push({
      servicio_id: service.id,
      descripcion: service.nombre,
      cantidad: 1,
      precio_unitario: service.precio,
    });
  }
  hideCatalogModal();
  renderLines();
  renderTotals();
}

async function openCatalogModal() {
  let services;
  try {
    services = await api.get('/api/services');
  } catch (err) {
    UI.msg.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    return;
  }
  if (!services.length) {
    UI.msg.innerHTML =
      '<div class="alert alert-info">Tu catálogo está vacío. Añade una línea manual o crea servicios en la sección "Catálogo".</div>';
    return;
  }
  UI.catalogModal.hidden = false;
  UI.catalogList.innerHTML = services
    .map(
      (s) =>
        `<tr><td>${s.nombre}</td><td class="num">${formatCurrency(s.precio)}</td><td><button class="btn btn-sm" data-id="${s.id}">Añadir</button></td></tr>`
    )
    .join('');
  UI.catalogList.querySelectorAll('button').forEach((btn) =>
    btn.addEventListener('click', () => {
      const service = services.find((s) => String(s.id) === btn.dataset.id);
      addCatalogLine(service);
    })
  );
}

function hideCatalogModal() {
  if (UI.catalogModal) UI.catalogModal.hidden = true;
}

function renderClientSelector() {
  const options = state.clients
    .map(
      (c) =>
        `<option value="${c.id}" ${
          String(c.id) === String(state.clientId) ? 'selected' : ''
        }>${c.nombre} (${c.tipo === 'particular' ? 'Particular' : 'Empresa / Autónomo'})</option>`
    )
    .join('');
  UI.clientSelect.innerHTML = `<option value="">Selecciona un cliente…</option>${options}`;
}

async function saveBudget(event) {
  event.preventDefault();
  UI.msg.innerHTML = '';
  let clientId = state.clientId;
  if (state.nuevoCliente) {
    const nombre = UI.inlineNombre.value.trim();
    if (!nombre) {
      UI.msg.innerHTML = '<div class="alert alert-error">Indica el nombre del cliente.</div>';
      return;
    }
    try {
      const created = await api.post('/api/clients', {
        nombre,
        nif_cif: UI.inlineNif.value || null,
        direccion: UI.inlineDireccion.value || null,
        email: UI.inlineEmail.value || null,
        tipo: state.inlineTipo,
      });
      clientId = created.id;
      state.clients.push(created);
    } catch (err) {
      UI.msg.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
      return;
    }
  }
  if (!clientId) {
    UI.msg.innerHTML =
      '<div class="alert alert-error">Selecciona un cliente o crea uno nuevo.</div>';
    return;
  }
  const esParticular =
    (state.clients.find((c) => String(c.id) === String(clientId)) || {}).tipo === 'particular';
  const lineas = state.lineas
    .filter((l) => l.descripcion && l.descripcion.trim() !== '')
    .map((l) => ({
      descripcion: l.descripcion.trim(),
      cantidad: Number(l.cantidad),
      precio_unitario: Number(l.precio_unitario),
      servicio_id: l.servicio_id ?? null,
    }));
  if (!lineas.length) {
    UI.msg.innerHTML =
      '<div class="alert alert-error">Añade al menos una línea con descripción antes de guardar.</div>';
    return;
  }
  try {
    let saved;
    if (state.id) {
      await api.put(`/api/budgets/${state.id}`, {
        activar_retencion: esParticular ? false : state.activarRetencion,
        porcentaje_irpf: state.porcentaje,
      });
      saved = await api.get(`/api/budgets/${state.id}`);
    } else {
      saved = await api.post('/api/budgets', {
        cliente_id: clientId,
        activar_retencion: esParticular ? false : state.activarRetencion,
        porcentaje_irpf: state.porcentaje,
        lineas,
      });
    }
    UI.msg.innerHTML = `<div class="alert alert-success">Presupuesto ${saved.numero} guardado correctamente.</div>`;
    state.id = saved.id;
    state.numero = saved.numero;
    state.fechaEmision = saved.fecha_emision;
    state.fechaValidez = saved.fecha_validez;
    renderReadonlySummary();
    enablePdf(saved);
  } catch (err) {
    UI.msg.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

function renderReadonlySummary() {
  if (!state.id) {
    UI.readonlySummary.innerHTML = '';
    UI.pdfBtn.hidden = true;
    return;
  }
  UI.readonlySummary.innerHTML = `<div class="card">
    <div class="form-group readonly-pair"><label>Número</label><div><strong>${state.numero}</strong></div></div>
    <div class="form-group readonly-pair"><label>Fecha de emisión</label><div>${formatDate(
      state.fechaEmision
    )}</div></div>
    <div class="form-group readonly-pair"><label>Validez</label><div>${formatDate(
      state.fechaValidez
    )} (30 días)</div></div>
  </div>`;
  UI.pdfBtn.hidden = false;
}

function enablePdf(budget) {
  UI.pdfBtn.disabled = !budget.lineas || budget.lineas.length === 0;
  UI.pdfBtn.onclick = () => {
    window.location.href = `/api/budgets/${budget.id}/pdf`;
  };
}

async function loadExisting(id) {
  const budget = await api.get(`/api/budgets/${id}`);
  state.id = budget.id;
  state.numero = budget.numero;
  state.fechaEmision = budget.fecha_emision;
  state.fechaValidez = budget.fecha_validez;
  state.clientId = budget.cliente_id;
  state.activarRetencion = budget.activar_retencion;
  state.porcentaje = budget.porcentaje_irpf;
  state.lineas = budget.lineas.map((l) => ({
    descripcion: l.descripcion,
    cantidad: l.cantidad,
    precio_unitario: l.precio_unitario,
    servicio_id: l.servicio_id,
  }));
}

export async function render(appEl, id) {
  appEl.innerHTML = `<div id="budget-form-container"></div>`;
  const container = appEl.querySelector('#budget-form-container');
  container.innerHTML = `
    <div id="readonly-summary"></div>
    <form id="budget-form" class="card">
      <h2>Datos del cliente</h2>
      <div class="form-group">
        <label for="client-select">Cliente</label>
        <select id="client-select"></select>
        <div class="actions" style="margin-top:8px">
          <button type="button" id="btn-nuevo-cliente" class="btn btn-secondary btn-sm">Crear nuevo cliente</button>
          <button type="button" id="btn-usar-existente" class="btn btn-secondary btn-sm" hidden>Usar cliente existente</button>
        </div>
      </div>
      <div id="inline-client" hidden>
        <div class="form-group"><label>Nombre del cliente *</label><input id="inline-nombre" /></div>
        <div class="form-group"><label>NIF/CIF</label><input id="inline-nif" /></div>
        <div class="form-group"><label>Dirección</label><input id="inline-direccion" /></div>
        <div class="form-group"><label>Email</label><input id="inline-email" /></div>
        <div class="form-group">
          <label>Tipo de cliente</label>
          <select id="inline-tipo">
            <option value="empresa">Empresa / Autónomo</option>
            <option value="particular">Particular</option>
          </select>
        </div>
      </div>

      <div id="retencion-section">
        <h2>Configuración de retención</h2>
        <div class="form-group">
          <label><input type="checkbox" id="retencion-toggle" /> Activar retención de IRPF</label>
        </div>
        <div class="form-group" id="porcentaje-group">
          <label>Porcentaje de IRPF</label>
          <select id="porcentaje-select">
            <option value="15">15% (general)</option>
            <option value="7">7% (nuevos autónomos)</option>
          </select>
        </div>
      </div>

      <h2>Líneas del presupuesto</h2>
      <div class="actions">
        <button type="button" class="btn btn-secondary" id="btn-catalog">Añadir línea desde catálogo</button>
        <button type="button" class="btn btn-secondary" id="btn-manual">Añadir línea manual</button>
      </div>
      <table>
        <thead><tr><th>Descripción</th><th>Cantidad</th><th>Precio unitario (€)</th><th class="num">Subtotal</th><th></th></tr></thead>
        <tbody id="lines-body"></tbody>
      </table>

      <h2>Resumen de totales</h2>
      <table id="totals-table"><tbody id="total-rows"></tbody></table>

      <div id="form-msg"></div>
      <div class="actions">
        <button type="submit" class="btn">Guardar presupuesto</button>
        <button type="button" class="btn btn-secondary" id="btn-pdf" hidden disabled>Descargar PDF</button>
        <button type="button" class="btn btn-secondary" id="btn-cancel">Cancelar</button>
      </div>
    </form>

    <div id="catalog-modal" class="modal-overlay" hidden>
      <div class="modal">
        <h2>Selecciona un servicio</h2>
        <table><thead><tr><th>Nombre</th><th class="num">Precio</th><th></th></tr></thead><tbody id="catalog-list"></tbody></table>
        <div class="actions"><button type="button" class="btn btn-secondary" id="catalog-close">Cerrar</button></div>
      </div>
    </div>
  `;

  UI.readonlySummary = container.querySelector('#readonly-summary');
  UI.clientSelect = container.querySelector('#client-select');
  UI.inlineClient = container.querySelector('#inline-client');
  UI.inlineNombre = container.querySelector('#inline-nombre');
  UI.inlineNif = container.querySelector('#inline-nif');
  UI.inlineDireccion = container.querySelector('#inline-direccion');
  UI.inlineEmail = container.querySelector('#inline-email');
  UI.inlineTipo = container.querySelector('#inline-tipo');
  UI.inlineTipo.addEventListener('change', (e) => {
    state.inlineTipo = e.target.value;
    renderTotals();
  });
  UI.retencionSection = container.querySelector('#retencion-section');
  UI.retencionToggle = container.querySelector('#retencion-toggle');
  UI.retencionToggle.addEventListener('change', (e) => {
    state.activarRetencion = e.target.checked;
    renderTotals();
  });
  UI.porcentajeSelect = container.querySelector('#porcentaje-select');
  UI.porcentajeSelect.addEventListener('change', (e) => {
    state.porcentaje = Number(e.target.value);
    renderTotals();
  });
  UI.linesBody = container.querySelector('#lines-body');
  UI.totalRows = container.querySelector('#total-rows');
  UI.msg = container.querySelector('#form-msg');
  UI.pdfBtn = container.querySelector('#btn-pdf');

  container.querySelector('#btn-catalog').addEventListener('click', openCatalogModal);
  container.querySelector('#btn-manual').addEventListener('click', addManualLine);
  container.querySelector('#catalog-close').addEventListener('click', hideCatalogModal);
  container.querySelector('#btn-cancel').addEventListener('click', () => {
    window.location.hash = '#/presupuestos';
  });
  container.querySelector('#btn-nuevo-cliente').addEventListener('click', () => {
    state.nuevoCliente = true;
    UI.inlineClient.hidden = false;
    container.querySelector('#btn-nuevo-cliente').hidden = true;
    container.querySelector('#btn-usar-existente').hidden = false;
    renderTotals();
  });
  container.querySelector('#btn-usar-existente').addEventListener('click', () => {
    state.nuevoCliente = false;
    UI.inlineClient.hidden = true;
    container.querySelector('#btn-nuevo-cliente').hidden = false;
    container.querySelector('#btn-usar-existente').hidden = true;
    renderTotals();
  });
  UI.clientSelect.addEventListener('change', (e) => {
    state.clientId = e.target.value;
    const tipo = (state.clients.find((c) => String(c.id) === String(state.clientId)) || {}).tipo;
    updateRetencionVisibility(tipo === 'particular');
    renderTotals();
  });
  container.querySelector('#budget-form').addEventListener('submit', saveBudget);

  try {
    const clients = await api.get('/api/clients');
    state.clients = clients;
    renderClientSelector();
    if (id && id !== 'new') {
      await loadExisting(id);
      UI.retencionToggle.checked = state.activarRetencion;
      UI.porcentajeSelect.value = String(state.porcentaje);
      renderClientSelector();
      renderReadonlySummary();
      enablePdf(state);
    }
    renderLines();
    renderTotals();
  } catch (err) {
    UI.msg.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}
