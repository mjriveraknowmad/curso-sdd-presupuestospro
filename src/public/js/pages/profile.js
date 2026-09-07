import api from '../api.js';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

export function renderProfileForm(container, { onSaved } = {}) {
  container.innerHTML = `
    <div class="card">
      <form id="profile-form">
        <div class="form-group">
          <label for="nombre">Nombre *</label>
          <input type="text" id="nombre" required />
        </div>
        <div class="form-group">
          <label for="nif">NIF *</label>
          <input type="text" id="nif" required />
        </div>
        <div class="form-group">
          <label for="direccion">Dirección *</label>
          <input type="text" id="direccion" required />
        </div>
        <div class="form-group">
          <label for="telefono">Teléfono *</label>
          <input type="tel" id="telefono" required />
        </div>
        <div class="form-group">
          <label for="email">Email *</label>
          <input type="email" id="email" required />
        </div>
        <div class="form-group">
          <label for="logo">Logo (opcional)</label>
          <input type="file" id="logo" accept="image/*" />
          <div id="logo-preview-area"></div>
          <div id="logo-warning" class="alert alert-info" hidden>
            El logo supera 500&nbsp;kB. Se reducirá automáticamente al guardar.
          </div>
        </div>
        <div id="profile-msg"></div>
        <div class="actions">
          <button type="submit" class="btn">Guardar</button>
          <button type="button" id="profile-cancel" class="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#profile-form');
  const msgEl = container.querySelector('#profile-msg');
  const logoInput = container.querySelector('#logo');
  const logoPreview = container.querySelector('#logo-preview-area');
  const warningEl = container.querySelector('#logo-warning');
  const cancelBtn = container.querySelector('#profile-cancel');

  let logoValue = null;

  function showError(message) {
    msgEl.innerHTML = `<div class="alert alert-error">${message}</div>`;
  }

  function showSuccess(message) {
    msgEl.innerHTML = `<div class="alert alert-success">${message}</div>`;
  }

  function loadProfile(profile) {
    if (!profile) return;
    form.querySelector('#nombre').value = profile.nombre || '';
    form.querySelector('#nif').value = profile.nif || '';
    form.querySelector('#direccion').value = profile.direccion || '';
    form.querySelector('#telefono').value = profile.telefono || '';
    form.querySelector('#email').value = profile.email || '';
    if (profile.logo) {
      logoValue = profile.logo;
      logoPreview.innerHTML = `<img class="logo-preview" src="${profile.logo}" alt="Logo actual" />`;
    }
  }

  logoInput.addEventListener('change', async () => {
    const file = logoInput.files && logoInput.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      warningEl.hidden = false;
    } else {
      warningEl.hidden = true;
    }
    try {
      logoValue = await readFileAsDataUrl(file);
      logoPreview.innerHTML = `<img class="logo-preview" src="${logoValue}" alt="Vista previa" />`;
    } catch (err) {
      showError(err.message);
    }
  });

  cancelBtn.addEventListener('click', () => {
    if (window.location.hash === '#/perfil') {
      window.location.hash = '#/presupuestos';
    } else if (onSaved) {
      onSaved();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      nombre: form.querySelector('#nombre').value,
      nif: form.querySelector('#nif').value,
      direccion: form.querySelector('#direccion').value,
      telefono: form.querySelector('#telefono').value,
      email: form.querySelector('#email').value,
      logo: logoValue,
    };
    try {
      await api.put('/api/profile', payload);
      showSuccess('Perfil guardado correctamente.');
      if (onSaved) {
        setTimeout(onSaved, 300);
      }
    } catch (err) {
      showError(err.message);
    }
  });

  api.get('/api/profile').then(loadProfile).catch((err) => showError(err.message));
}

export function render(appEl) {
  renderProfileForm(appEl);
}
