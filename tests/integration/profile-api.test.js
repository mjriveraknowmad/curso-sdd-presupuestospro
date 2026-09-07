import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/server.js';
import { resetDb } from '../helpers.js';

const VALID_PROFILE = {
  nombre: 'María García',
  nif: '12345678Z',
  direccion: 'Calle Mayor 1, Madrid',
  telefono: '612 345 678',
  email: 'maria@ejemplo.com',
};

beforeAll(() => {
  resetDb();
});

beforeEach(() => {
  resetDb();
});

describe('Profile API', () => {
  it('GET /api/profile returns null when profile has no data yet', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it('GET /api/profile/complete returns false when profile is empty', async () => {
    const res = await request(app).get('/api/profile/complete');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ complete: false });
  });

  it('PUT /api/profile creates the profile and returns it', async () => {
    const res = await request(app).put('/api/profile').send(VALID_PROFILE);
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('María García');
    expect(res.body.id).toBe(1);
  });

  it('PUT /api/profile updates an existing profile', async () => {
    await request(app).put('/api/profile').send(VALID_PROFILE);
    const res = await request(app)
      .put('/api/profile')
      .send({ ...VALID_PROFILE, nombre: 'Juan Pérez', email: 'juan@ejemplo.com' });
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Juan Pérez');
    expect(res.body.email).toBe('juan@ejemplo.com');
  });

  it('GET /api/profile returns the persisted profile', async () => {
    await request(app).put('/api/profile').send(VALID_PROFILE);
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('María García');
    expect(res.body.nif).toBe('12345678Z');
  });

  it('GET /api/profile/complete returns true after profile is saved', async () => {
    await request(app).put('/api/profile').send(VALID_PROFILE);
    const res = await request(app).get('/api/profile/complete');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ complete: true });
  });

  it('PUT /api/profile validates required fields with 400', async () => {
    const res = await request(app)
      .put('/api/profile')
      .send({ ...VALID_PROFILE, nombre: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El campo nombre es obligatorio');
  });

  it('PUT /api/profile validates email format with 400', async () => {
    const res = await request(app)
      .put('/api/profile')
      .send({ ...VALID_PROFILE, email: 'no-valido' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El email no tiene un formato válido');
  });

  it('PUT /api/profile persists the logo', async () => {
    const logo = 'data:image/png;base64,iVBORw0KGgo=';
    const res = await request(app).put('/api/profile').send({ ...VALID_PROFILE, logo });
    expect(res.status).toBe(200);
    expect(res.body.logo).toBe(logo);
  });
});
