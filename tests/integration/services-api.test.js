import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/server.js';
import { resetDb } from '../helpers.js';

beforeAll(() => {
  resetDb();
});

beforeEach(() => {
  resetDb();
});

describe('Services API', () => {
  it('GET /api/services returns an empty list initially', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/services creates a service', async () => {
    const res = await request(app)
      .post('/api/services')
      .send({ nombre: 'Diseño web', precio: 1500 });
    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Diseño web');
    expect(res.body.precio).toBe(1500);
    expect(res.body.id).toBeTruthy();
  });

  it('POST /api/services validates required fields', async () => {
    const res = await request(app).post('/api/services').send({ nombre: '', precio: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El nombre del servicio es obligatorio');
  });

  it('POST /api/services validates precio > 0', async () => {
    const res = await request(app).post('/api/services').send({ nombre: 'Servicio', precio: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('El precio debe ser un número mayor que 0');
  });

  it('GET /api/services lists created services', async () => {
    await request(app).post('/api/services').send({ nombre: 'Diseño web', precio: 1500 });
    await request(app).post('/api/services').send({ nombre: 'Fotos', precio: 500 });
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('PUT /api/services/:id updates a service', async () => {
    const created = await request(app).post('/api/services').send({ nombre: 'Diseño', precio: 1000 });
    const res = await request(app)
      .put(`/api/services/${created.body.id}`)
      .send({ nombre: 'Diseño completo', precio: 1200 });
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Diseño completo');
    expect(res.body.precio).toBe(1200);
  });

  it('PUT /api/services/:id returns 404 for a missing service', async () => {
    const res = await request(app)
      .put('/api/services/999')
      .send({ nombre: 'X', precio: 10 });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/services/:id deletes a service', async () => {
    const created = await request(app).post('/api/services').send({ nombre: 'A borrar', precio: 50 });
    const res = await request(app).delete(`/api/services/${created.body.id}`);
    expect(res.status).toBe(204);
    const list = await request(app).get('/api/services');
    expect(list.body).toEqual([]);
  });

  it('DELETE /api/services/:id returns 404 for a missing service', async () => {
    const res = await request(app).delete('/api/services/999');
    expect(res.status).toBe(404);
  });
});
