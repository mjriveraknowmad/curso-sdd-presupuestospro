import { calculateBudgetTotals } from './calculations.js';

export function fechaValidez(fechaEmision, validezDias = 30) {
  const date = new Date(`${fechaEmision}T00:00:00`);
  if (Number.isNaN(date.getTime())) return fechaEmision;
  date.setDate(date.getDate() + validezDias);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function serializeBudget(db, budget) {
  const lineas = db
    .prepare('SELECT * FROM budget_lines WHERE budget_id = ? ORDER BY id')
    .all(budget.id)
    .map((l) => ({
      id: l.id,
      descripcion: l.descripcion,
      cantidad: l.cantidad,
      precio_unitario: l.precio_unitario,
      subtotal: l.cantidad * l.precio_unitario,
      servicio_id: l.servicio_id,
    }));
  return {
    id: budget.id,
    numero: budget.numero,
    fecha_emision: budget.fecha_emision,
    validez_dias: budget.validez_dias,
    fecha_validez: fechaValidez(budget.fecha_emision, budget.validez_dias),
    cliente_id: budget.cliente_id,
    cliente_nombre: budget.cliente_nombre,
    cliente_nif_cif: budget.cliente_nif_cif,
    cliente_direccion: budget.cliente_direccion,
    cliente_email: budget.cliente_email,
    cliente_tipo: budget.cliente_tipo,
    activar_retencion: Boolean(budget.activar_retencion),
    porcentaje_irpf: budget.porcentaje_irpf,
    base_imponible: budget.base_imponible,
    iva: budget.iva,
    retencion_irpf: budget.retencion_irpf,
    total: budget.total,
    lineas,
    created_at: budget.created_at,
    updated_at: budget.updated_at,
  };
}

export function recomputeAndPersistTotals(db, budgetId) {
  const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(budgetId);
  if (!budget) return null;
  const lineas = db.prepare('SELECT * FROM budget_lines WHERE budget_id = ?').all(budgetId);
  const totals = calculateBudgetTotals(
    lineas,
    budget.cliente_tipo,
    Boolean(budget.activar_retencion),
    budget.porcentaje_irpf
  );
  db.prepare(
    `UPDATE budgets
     SET base_imponible = ?, iva = ?, retencion_irpf = ?, total = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(totals.baseImponible, totals.iva, totals.retencionIrpf, totals.total, budgetId);
  const updated = db.prepare('SELECT * FROM budgets WHERE id = ?').get(budgetId);
  return serializeBudget(db, updated);
}

export function isProfileComplete(db) {
  const profile = db.prepare('SELECT * FROM freelancer WHERE id = 1').get();
  return Boolean(
    profile &&
      profile.nombre?.trim() &&
      profile.nif?.trim() &&
      profile.direccion?.trim() &&
      profile.telefono?.trim() &&
      profile.email?.trim()
  );
}
