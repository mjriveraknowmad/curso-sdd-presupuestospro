import express from 'express';
import { generateBudgetPdf } from '../services/pdf-generator.js';
import { fechaValidez } from '../services/budget-service.js';

const router = express.Router();

router.get('/budgets/:id/pdf', (req, res) => {
  const budget = req.db.prepare('SELECT * FROM budgets WHERE id = ?').get(req.params.id);
  if (!budget) {
    return res.status(404).json({ error: 'Presupuesto no encontrado' });
  }
  const lineas = req.db.prepare('SELECT * FROM budget_lines WHERE budget_id = ?').all(budget.id);
  if (lineas.length === 0) {
    return res
      .status(400)
      .json({ error: 'El presupuesto debe tener al menos una línea para generar el PDF' });
  }
  const profile = req.db.prepare('SELECT * FROM freelancer WHERE id = 1').get();
  const budgetForPdf = {
    ...budget,
    fecha_validez: fechaValidez(budget.fecha_emision, budget.validez_dias),
    lineas,
  };
  const pdfBuffer = generateBudgetPdf({ budget: budgetForPdf, profile });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="presupuesto-${budget.numero}.pdf"`
  );
  res.send(Buffer.from(pdfBuffer));
});

export default router;
