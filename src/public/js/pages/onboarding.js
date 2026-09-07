import { renderProfileForm } from './profile.js';

const STEPS = [
  { title: '1. Perfil del freelancer' },
  { title: '2. Catálogo de servicios' },
  { title: '3. Crear primer presupuesto' },
];

let currentStep = 1;

function renderProgress(container) {
  const dots = STEPS.map(
    (step, index) =>
      `<div class="wizard-step-dot ${index + 1 === currentStep ? 'active' : ''}">${step.title}</div>`
  ).join('');
  container.insertAdjacentHTML(
    'beforeend',
    `<div class="wizard-progress">${dots}</div><div id="wizard-body"></div>`
  );
}

export function render(container) {
  currentStep = 1;
  container.innerHTML = `<div class="card"><h1>Bienvenido a PresupuestosPro</h1><p class="muted">Completa estos pasos para configurar tu cuenta.</p><div id="wizard"></div></div>`;
  const wizard = container.querySelector('#wizard');
  renderProgress(wizard);
  showStep(wizard);
}

function showStep(wizard) {
  const body = wizard.querySelector('#wizard-body');
  body.innerHTML = '';
  if (currentStep === 1) {
    renderProfileForm(body, { onSaved: () => next(wizard) });
  } else if (currentStep === 2) {
    renderCatalogStep(wizard);
  } else if (currentStep === 3) {
    window.location.hash = '#/presupuesto/new';
    currentStep = 1;
  }
}

async function renderCatalogStep(wizard) {
  const body = wizard.querySelector('#wizard-body');
  body.innerHTML = `
    <h2>Catálogo de servicios (opcional)</h2>
    <p class="muted">Añade servicios habituales para reutilizarlos en tus presupuestos. Puedes saltar este paso.</p>
    <div id="catalog-step-container"></div>
  `;
  const inner = body.querySelector('#catalog-step-container');
  try {
    const catalog = await import('./catalog.js');
    catalog.renderCatalogStep(inner);
  } catch {
    inner.innerHTML = `<div class="alert alert-info">Podrás añadir servicios más adelante desde el menú "Catálogo".</div>`;
  }
  inner.insertAdjacentHTML(
    'beforeend',
    `<div class="actions" style="margin-top:16px">
      <button type="button" class="btn" id="onboarding-catalog-next">Continuar</button>
      <button type="button" class="btn btn-secondary" id="onboarding-catalog-skip">Saltar este paso</button>
    </div>`
  );
  inner.querySelector('#onboarding-catalog-next').addEventListener('click', () => {
    currentStep = 3;
    showStep(wizard);
  });
  inner.querySelector('#onboarding-catalog-skip').addEventListener('click', () => {
    currentStep = 3;
    showStep(wizard);
  });
}

function next(wizard) {
  currentStep += 1;
  renderProgress(wizard);
  showStep(wizard);
}
