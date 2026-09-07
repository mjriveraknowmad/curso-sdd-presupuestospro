import api from '../api.js';
import { formatCurrency } from '../format.js';

async function loadServices(container) {
  const listEl = container.querySelector('#catalog-list');
  let services;
  try {
    services = await api.get('/api/services');
  } catch (err) {
    listEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    return;
  }
  if (!services.length) {
    listEl.innerHTML = `<div class="empty-state">Aún no tienes servicios. Añade tu primero.</div>`;
    return;
  }
  const rows = services
    .map(
      (s) => `
      <tr data-id="${s.id}">
        <td>${s.nombre}</td>
        <td class="num">${formatCurrency(s.precio)}</td>
        <td>
          <button class="btn btn-sm btn-secondary catalog-edit" data-id="${s.id}">Editar</button>
          <button class="btn btn-sm btn-danger catalog-delete" data-id="${s.id}">Eliminar</button>
        </td>
      </tr>`
    )
    .join('');
  listEl.innerHTML = `
    <table>
      <thead><tr><th>Nombre</th><th class="num">Precio (€)</th><th>Acciones</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  container.querySelectorAll('.catalog-edit').forEach((btn) => {
    btn.addEventListener('click', () => editService(services.find((s) => String(s.id) === btn.dataset.id)));
  });
  container.querySelectorAll('.catalog-delete').forEach((btn) => {
    btn.addEventListener('click', () => deleteService(btn.dataset.id));
  });
}

function showForm(container, service) {
  const formEl = container.querySelector('#catalog-form');
  formEl.innerHTML = `
    <div class="card" style="margin-top:16px">
      <h2>${service ? 'Editar servicio' : 'Añadir servicio'}</h2>
      <div class="form-group"><label>Nombre</label><input id="cat-nombre" value="${service ? service.nombre : ''}" /></div>
      <div class="form-group"><label>Precio (€)</label><input id="cat-precio" type="number" step="0.01" min="0.01" value="${service ? service.precio : ''}" /></div>
      <div id="cat-msg"></div>
      <div class="actions">
        <button class="btn" id="cat-save">${service ? 'Guardar' : 'Añadir'}</button>
        <button class="btn btn-secondary" id="cat-cancel">Cancelar</button>
      </div>
    </div>`;
  const msgEl = formEl.querySelector('#cat-msg');
  formEl.querySelector('#cat-save').addEventListener('click', async () => {
    const payload = {
      nombre: formEl.querySelector('#cat-nombre').value,
      precio: Number(formEl.querySelector('#cat-precio').value),
    };
    try {
      if (service) {
        await api.put(`/api/services/${service.id}`, payload);
      } else {
        await api.post('/api/services', payload);
      }
      formEl.innerHTML = '';
      loadServices(container);
      if (container.__onDone) container.__onDone();
    } catch (err) {
      msgEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    }
  });
  formEl.querySelector('#cat-cancel').addEventListener('click', () => {
    formEl.innerHTML = '';
  });
}

function editService(service) {
  showForm(document.querySelector('#catalog-container') || document.body, service);
}

async function deleteService(id) {
  if (!window.confirm('¿Seguro que quieres eliminar este servicio?')) return;
  try {
    await api.del(`/api/services/${id}`);
    const container = document.querySelector('#catalog-container');
    if (container) loadServices(container);
  } catch (err) {
    window.alert(err.message);
  }
}

export function renderCatalogStep(container, { onDone } = {}) {
  container.id = 'catalog-container';
  container.__onDone = onDone;
  container.innerHTML = `
    <div id="catalog-list"></div>
    <div class="actions"><button class="btn" id="catalog-add">Añadir servicio</button></div>
    <div id="catalog-form"></div>
  `;
  container.querySelector('#catalog-add').addEventListener('click', () => {
    showForm(container, null);
  });
  loadServices(container);
}

export function render(appEl) {
  appEl.innerHTML = '<div id="catalog-container"></div>';
  renderCatalogStep(appEl.querySelector('#catalog-container'), {
    onDone: () => {},
  });
}
