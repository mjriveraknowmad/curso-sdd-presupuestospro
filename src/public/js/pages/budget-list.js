import api from '../api.js';
import { formatCurrency, formatDate } from '../format.js';

async function load(container) {
  let budgets;
  let complete = true;
  try {
    budgets = await api.get('/api/budgets');
    const check = await api.get('/api/profile/complete');
    complete = check.complete;
  } catch (err) {
    container.querySelector('#budget-list-body').innerHTML = `<tr><td colspan="4" class="alert alert-error">${err.message}</td></tr>`;
    return;
  }
  const newBtn = container.querySelector('#btn-nuevo-presupuesto');
  newBtn.disabled = !complete;
  newBtn.title = complete
    ? ''
    : 'Completa tu perfil (nombre, NIF, dirección, teléfono y email) para crear presupuestos';

  const body = container.querySelector('#budget-list-body');
  if (!budgets.length) {
    body.innerHTML =
      '<tr><td colspan="4" class="empty-state">Crea tu primer presupuesto</td></tr>';
    return;
  }
  body.innerHTML = budgets
    .map(
      (b) => `
      <tr>
        <td><a href="#/presupuesto/${b.id}">${b.numero}</a></td>
        <td>${formatDate(b.fecha_emision)}</td>
        <td>${b.cliente_nombre}</td>
        <td class="num">${formatCurrency(b.total)}</td>
        <td class="num">
          <button class="btn btn-sm btn-secondary budget-view" data-id="${b.id}">Ver / Editar</button>
          <button class="btn btn-sm btn-danger budget-delete" data-id="${b.id}">Eliminar</button>
        </td>
      </tr>`
    )
    .join('');
  body.querySelectorAll('.budget-view').forEach((btn) =>
    btn.addEventListener('click', () => {
      window.location.hash = `#/presupuesto/${btn.dataset.id}`;
    })
  );
  body.querySelectorAll('.budget-delete').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (!window.confirm('¿Seguro que quieres eliminar este presupuesto?')) return;
      try {
        await api.del(`/api/budgets/${btn.dataset.id}`);
        load(container);
      } catch (err) {
        window.alert(err.message);
      }
    })
  );
}

export function render(appEl) {
  appEl.innerHTML = `
    <div class="actions" style="margin-bottom:16px">
      <button class="btn" id="btn-nuevo-presupuesto">Nuevo presupuesto</button>
    </div>
    <div class="card">
      <table>
        <thead><tr><th>Número</th><th>Fecha</th><th>Cliente</th><th class="num">Total</th><th></th></tr></thead>
        <tbody id="budget-list-body"></tbody>
      </table>
    </div>
  `;
  appEl.querySelector('#btn-nuevo-presupuesto').addEventListener('click', () => {
    window.location.hash = '#/presupuesto/new';
  });
  load(appEl);
}
