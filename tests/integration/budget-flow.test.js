import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/server.js';
import { resetDb } from '../helpers.js';

let empresaId;
let particularId;

async function seed() {
  resetDb();
  await request(app)
    .put('/api/profile')
    .send({
      nombre: 'María García',
      nif: '12345678Z',
      direccion: 'Calle Mayor 1, Madrid',
      telefono: '612 345 678',
      email: 'maria@ejemplo.com',
    });
  const empresa = await request(app).post('/api/clients').send({
    nombre: 'Cliente Ejemplo S.L.',
    nif_cif: 'B12345678',
    direccion: 'Avda. de la Industria 20, Barcelona',
    email: 'info@ejemplo.com',
    tipo: 'empresa',
  });
  const particular = await request(app).post('/api/clients').send({
    nombre: 'Laura Pérez',
    tipo: 'particular',
  });
  empresaId = empresa.body.id;
  particularId = particular.body.id;
}

beforeAll(seed);

beforeEach(seed);

describe('Budget flow', () => {
  it('creates a budget with automatic totals and numbering', async () => {
    const res = await request(app).post('/api/budgets').send({
      cliente_id: empresaId,
      activar_retencion: true,
      porcentaje_irpf: 15,
      lineas: [
        { descripcion: 'Diseño de página web', cantidad: 1, precio_unitario: 1500 },
        { descripcion: 'Sesión de fotos', cantidad: 1, precio_unitario: 500 },
      ],
    });
    expect(res.status).toBe(201);
    expect(res.body.numero).toBe(`2026-001`);
    expect(res.body.base_imponible).toBe(2000);
    expect(res.body.iva).toBe(420);
    expect(res.body.retencion_irpf).toBe(300);
    expect(res.body.total).toBe(2120);
    expect(res.body.fecha_emision).toBeTruthy();
    expect(res.body.fecha_validez).toBeTruthy();
    expect(res.body.lineas).toHaveLength(2);
  });

  it('assigns sequential numbers to multiple budgets (FR-007)', async () => {
    await request(app).post('/api/budgets').send({
      cliente_id: empresaId,
      activar_retencion: false,
      lineas: [{ descripcion: 'Línea 1', cantidad: 1, precio_unitario: 100 }],
    });
    const res = await request(app).post('/api/budgets').send({
      cliente_id: empresaId,
      activar_retencion: false,
      lineas: [{ descripcion: 'Línea 2', cantidad: 1, precio_unitario: 200 }],
    });
    expect(res.status).toBe(201);
    expect(res.body.numero).toBe('2026-002');
  });

  it('recomputes totals when retención changes to 7%', async () => {
    const created = await request(app).post('/api/budgets').send({
      cliente_id: empresaId,
      activar_retencion: true,
      porcentaje_irpf: 15,
      lineas: [
        { descripcion: 'A', cantidad: 1, precio_unitario: 1500 },
        { descripcion: 'B', cantidad: 1, precio_unitario: 500 },
      ],
    });
    const res = await request(app).put(`/api/budgets/${created.body.id}`).send({
      activar_retencion: true,
      porcentaje_irpf: 7,
    });
    expect(res.body.retencion_irpf).toBe(140);
    expect(res.body.total).toBe(2280);
  });

  it('forces retención off for a particular client (FR-006)', async () => {
    const res = await request(app).post('/api/budgets').send({
      cliente_id: particularId,
      activar_retencion: true,
      porcentaje_irpf: 15,
      lineas: [
        { descripcion: 'A', cantidad: 1, precio_unitario: 1500 },
        { descripcion: 'B', cantidad: 1, precio_unitario: 500 },
      ],
    });
    expect(res.status).toBe(201);
    expect(res.body.cliente_tipo).toBe('particular');
    expect(res.body.activar_retencion).toBe(false);
    expect(res.body.retencion_irpf).toBe(0);
    expect(res.body.total).toBe(2420);
  });

  it('recalculates totals when a line is added', async () => {
    const created = await request(app).post('/api/budgets').send({
      cliente_id: empresaId,
      activar_retencion: false,
      lineas: [{ descripcion: 'A', cantidad: 1, precio_unitario: 1000 }],
    });
    const res = await request(app).post(`/api/budgets/${created.body.id}/lines`).send({
      descripcion: 'B',
      cantidad: 1,
      precio_unitario: 500,
    });
    expect(res.body.total).toBe(1000 + 500 + 315);
    expect(res.body.base_imponible).toBe(1500);
  });

  it('recalculates totals when a line is edited', async () => {
    const created = await request(app).post('/api/budgets').send({
      cliente_id: empresaId,
      activar_retencion: false,
      lineas: [{ descripcion: 'A', cantidad: 1, precio_unitario: 1000 }],
    });
    const lineId = created.body.lineas[0].id;
    const res = await request(app)
      .put(`/api/budgets/${created.body.id}/lines/${lineId}`)
      .send({ descripcion: 'A', cantidad: 1, precio_unitario: 2000 });
    expect(res.body.base_imponible).toBe(2000);
    expect(res.body.total).toBe(2420);
  });

  it('recalculates totals when a line is deleted', async () => {
    const created = await request(app).post('/api/budgets').send({
      cliente_id: empresaId,
      activar_retencion: false,
      lineas: [
        { descripcion: 'A', cantidad: 1, precio_unitario: 1000 },
        { descripcion: 'B', cantidad: 1, precio_unitario: 500 },
      ],
    });
    const lineId = created.body.lineas[0].id;
    const res = await request(app).delete(`/api/budgets/${created.body.id}/lines/${lineId}`);
    expect(res.status).toBe(200);
    expect(res.body.base_imponible).toBe(500);
    expect(res.body.total).toBe(605);
  });

  it('returns the budget with lines via GET /api/budgets/:id', async () => {
    const created = await request(app).post('/api/budgets').send({
      cliente_id: empresaId,
      activar_retencion: false,
      lineas: [{ descripcion: 'A', cantidad: 2, precio_unitario: 100 }],
    });
    const res = await request(app).get(`/api/budgets/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.lineas).toHaveLength(1);
    expect(res.body.lineas[0].subtotal).toBe(200);
  });

  it('rejects budget creation when profile is incomplete (FR-014)', async () => {
    resetDb();
    const cliente = await request(app).post('/api/clients').send({
      nombre: 'C',
      tipo: 'empresa',
    });
    const res = await request(app).post('/api/budgets').send({
      cliente_id: cliente.body.id,
      lineas: [{ descripcion: 'A', cantidad: 1, precio_unitario: 100 }],
    });
    expect(res.status).toBe(403);
  });
});
