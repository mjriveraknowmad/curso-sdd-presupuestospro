import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/server.js';
import { resetDb } from '../helpers.js';

let empresaId;

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
  empresaId = empresa.body.id;
}

beforeAll(seed);
beforeEach(seed);

describe('PDF API', () => {
  it('returns a PDF for a budget with lines', async () => {
    const created = await request(app).post('/api/budgets').send({
      cliente_id: empresaId,
      activar_retencion: true,
      porcentaje_irpf: 15,
      lineas: [
        { descripcion: 'Diseño de página web', cantidad: 1, precio_unitario: 1500 },
        { descripcion: 'Sesión de fotos', cantidad: 1, precio_unitario: 500 },
      ],
    });
    const res = await request(app).get(`/api/budgets/${created.body.id}/pdf`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('presupuesto-2026-001.pdf');
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('returns 400 when the budget has no lines (FR-012)', async () => {
    const created = await request(app).post('/api/budgets').send({
      cliente_id: empresaId,
      activar_retencion: false,
      lineas: [{ descripcion: 'Única línea', cantidad: 1, precio_unitario: 100 }],
    });
    const lineId = created.body.lineas[0].id;
    await request(app).delete(`/api/budgets/${created.body.id}/lines/${lineId}`);
    const res = await request(app).get(`/api/budgets/${created.body.id}/pdf`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(
      'El presupuesto debe tener al menos una línea para generar el PDF'
    );
  });

  it('returns 404 for a missing budget', async () => {
    const res = await request(app).get('/api/budgets/9999/pdf');
    expect(res.status).toBe(404);
  });
});
