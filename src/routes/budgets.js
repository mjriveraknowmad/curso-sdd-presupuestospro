import express from 'express';
import { validateLine } from '../utils/validation.js';
import { generateNumber } from '../services/numbering.js';
import { calculateBudgetTotals } from '../services/calculations.js';
import {
  serializeBudget,
  recomputeAndPersistTotals,
  isProfileComplete,
} from '../services/budget-service.js';

const router = express.Router();

function listBudget(budget) {
  return {
    id: budget.id,
    numero: budget.numero,
    fecha_emision: budget.fecha_emision,
    validez_dias: budget.validez_dias,
    cliente_id: budget.cliente_id,
    cliente_nombre: budget.cliente_nombre,
    cliente_tipo: budget.cliente_tipo,
    activar_retencion: Boolean(budget.activar_retencion),
    porcentaje_irpf: budget.porcentaje_irpf,
    base_imponible: budget.base_imponible,
    iva: budget.iva,
    retencion_irpf: budget.retencion_irpf,
    total: budget.total,
    created_at: budget.created_at,
    updated_at: budget.updated_at,
  };
}

router.get('/budgets', (req, res) => {
  const rows = req.db
    .prepare('SELECT * FROM budgets ORDER BY fecha_emision DESC, id DESC')
    .all();
  res.json(rows.map(listBudget));
});

router.get('/budgets/:id', (req, res) => {
  const budget = req.db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
  if (!budget) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }
  res.json(serializeBudget(req.db, budget));
});

function validateLineas(body) {
  if (!Array.isArray(body.lineas) || body.lineas.length === 0) {
    return 'El presupuesto debe tener al menos una línea';
  }
  for (const line of body.lineas) {
    const error = validateLine(line);
    if (error) return error;
  }
  return null;
}

router.post('/budgets', (req, res) => {
  if (!isProfileComplete(req.db)) {
    return res
      .status(403)
      .json({ error: 'Completa tu perfil (nombre, NIF, dirección, teléfono y email) antes de crear un presupuesto' });
  }
  const { cliente_id, activar_retencion = false, porcentaje_irpf = 15, lineas } = req.body;
  const client = req.db.prepare('SELECT * FROM clients WHERE id = ?').get(cliente_id);
  if (!client) {
    return res.status(400).json({ error: 'El cliente indicado no existe' });
  }
  const lineError = validateLineas(req.body);
  if (lineError) {
    return res.status(400).json({ error: lineError });
  }

  const esParticular = client.tipo === 'particular';
  const retencionFinal = esParticular ? false : Boolean(activar_retencion);
  const numero = generateNumber(req.db);

  const calculations = calculateBudgetTotals(
    lineas.map((l) => ({ cantidad: l.cantidad, precio_unitario: l.precio_unitario })),
    client.tipo,
    retencionFinal,
    porcentaje_irpf
  );

  const insertBudget = req.db
    .prepare(
      `INSERT INTO budgets
       (numero, fecha_emision, validez_dias, cliente_id, cliente_nombre, cliente_nif_cif,
        cliente_direccion, cliente_email, cliente_tipo, activar_retencion, porcentaje_irpf,
        base_imponible, iva, retencion_irpf, total)
       VALUES (?, date('now'), 30, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      numero,
      client.id,
      client.nombre,
      client.nif_cif,
      client.direccion,
      client.email,
      client.tipo,
      retencionFinal ? 1 : 0,
      porcentaje_irpf,
      calculations.baseImponible,
      calculations.iva,
      calculations.retencionIrpf,
      calculations.total
    );

  const budgetId = insertBudget.lastInsertRowid;
  const insertLine = req.db.prepare(
    'INSERT INTO budget_lines (budget_id, descripcion, cantidad, precio_unitario, servicio_id) VALUES (?, ?, ?, ?, ?)'
  );
  for (const line of lineas) {
    insertLine.run(budgetId, line.descripcion.trim(), line.cantidad, line.precio_unitario, line.servicio_id ?? null);
  }

  const created = req.db.prepare('SELECT * FROM budgets WHERE id = ?').get(budgetId);
  res.status(201).json(serializeBudget(req.db, created));
});

router.put('/budgets/:id', (req, res) => {
  const existing = req.db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }
  const esParticular = existing.cliente_tipo === 'particular';
  let activarRetencion = existing.activar_retencion;
  if (req.body.activar_retencion !== undefined) {
    activarRetencion = req.body.activar_retencion;
  }
  const porcentajeIrpf = req.body.porcentaje_irpf !== undefined ? req.body.porcentaje_irpf : existing.porcentaje_irpf;
  if (esParticular) {
    activarRetencion = false;
  }
  req.db
    .prepare(
      'UPDATE budgets SET activar_retencion = ?, porcentaje_irpf = ?, updated_at = datetime(\'now\') WHERE id = ?'
    )
    .run(activarRetencion ? 1 : 0, porcentajeIrpf, req.params.id);
  const updated = recomputeAndPersistTotals(req.db, req.params.id);
  res.json(updated);
});

router.delete('/budgets/:id', (req, res) => {
  const existing = req.db.prepare('SELECT id FROM budgets WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }
  req.db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
