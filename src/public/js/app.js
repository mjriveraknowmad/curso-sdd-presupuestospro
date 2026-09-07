import api from './api.js';

const appEl = document.getElementById('app');
const navEl = document.getElementById('main-nav');

const routes = {
  'presupuestos': () => import('./pages/budget-list.js'),
  'catalogo': () => import('./pages/catalog.js'),
  'perfil': () => import('./pages/profile.js'),
  'presupuesto': () => import('./pages/budget-form.js'),
};

const PAGE_TITLES = {
  presupuestos: 'Presupuestos',
  catalogo: 'Catálogo de servicios',
  perfil: 'Perfil del freelancer',
  presupuesto: 'Presupuesto',
};

function setActiveNav(path) {
  if (!navEl) return;
  const links = navEl.querySelectorAll('a');
  links.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#/${path}`);
  });
}

function renderHeader(title) {
  return `<h1>${title}</h1>`;
}

async function loadPage(path) {
  const segments = path.split('/');
  const key = segments[0] || 'presupuestos';
  const id = segments[1];
  const entry = routes[key];
  appEl.innerHTML = '';
  if (!entry) {
    appEl.innerHTML = `<div class="card"><h1>No encontrado</h1><p class="muted">La página solicitada no existe.</p></div>`;
    return;
  }
  const module = await entry();
  const title = PAGE_TITLES[key] || '';
  appEl.innerHTML = renderHeader(title);
  module.render(appEl, id);
  setActiveNav(key);
}

async function start() {
  try {
    const profile = await api.get('/api/profile');
    const complete = profile && profile.nombre && profile.nif && profile.direccion && profile.telefono && profile.email;
    if (navEl) {
      navEl.hidden = !complete;
    }
    if (!complete) {
      const onboarding = await import('./pages/onboarding.js');
      appEl.innerHTML = '';
      onboarding.render(appEl);
      return;
    }
    const hash = window.location.hash || '#/presupuestos';
    const path = hash.replace(/^#\//, '').split('?')[0];
    await loadPage(path);
  } catch (err) {
    appEl.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
  }
}

window.addEventListener('hashchange', () => {
  const complete = navEl && !navEl.hidden;
  if (complete) {
    const hash = window.location.hash || '#/presupuestos';
    const path = hash.replace(/^#\//, '').split('?')[0];
    loadPage(path);
  }
});

start();
