import express from 'express';
import { validateLine } from '../utils/validation.js';
import { recomputeAndPersistTotals } from '../services/budget-service.js';

const router = express.Router();

function findBudget(db, budgetId) {
  return db.prepare('SELECT * FROM budgets WHERE id = ?').get(budgetId);
}

router.post('/budgets/:budgetId/lines', (req, res) => {
  const budget = findBudget(req.db, req.params.budgetId);
  if (!budget) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }
  const error = validateLine(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const { descripcion, cantidad, precio_unitario, servicio_id = null } = req.body;
  req.db
    .prepare(
      'INSERT INTO budget_lines (budget_id, descripcion, cantidad, precio_unitario, servicio_id) VALUES (?, ?, ?, ?, ?)'
    )
    .run(req.params.budgetId, descripcion.trim(), cantidad, precio_unitario, servicio_id);
  res.json(recomputeAndPersistTotals(req.db, req.params.budgetId));
});

router.put('/budgets/:budgetId/lines/:id', (req, res) => {
  const budget = findBudget(req.db, req.params.budgetId);
  if (!budget) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }
  const line = req.db
    .prepare('SELECT * FROM budget_lines WHERE id = ? AND budget_id = ?')
    .get(req.params.id, req.params.budgetId);
  if (!line) {
    return res.status(404).json({ error: 'Línea no encontrada' });
  }
  const error = validateLine(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const { descripcion, cantidad, precio_unitario, servicio_id = line.servicio_id } = req.body;
  req.db
    .prepare(
      'UPDATE budget_lines SET descripcion = ?, cantidad = ?, precio_unitario = ?, servicio_id = ? WHERE id = ?'
    )
    .run(descripcion.trim(), cantidad, precio_unitario, servicio_id, req.params.id);
  res.json(recomputeAndPersistTotals(req.db, req.params.budgetId));
});

router.delete('/budgets/:budgetId/lines/:id', (req, res) => {
  const budget = findBudget(req.db, req.params.budgetId);
  if (!budget) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }
  const line = req.db
    .prepare('SELECT * FROM budget_lines WHERE id = ? AND budget_id = ?')
    .get(req.params.id, req.params.budgetId);
  if (!line) {
    return res.status(404).json({ error: 'Línea no encontrada' });
  }
  req.db.prepare('DELETE FROM budget_lines WHERE id = ?').run(req.params.id);
  res.json(recomputeAndPersistTotals(req.db, req.params.budgetId));
});

export default router;
