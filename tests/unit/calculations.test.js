import { describe, it, expect } from 'vitest';
import {
  calculateBudgetTotals,
  calculateLineSubtotal,
  round2,
} from '../../src/services/calculations.js';

const LINES = [
  { cantidad: 1, precio_unitario: 1500 },
  { cantidad: 1, precio_unitario: 500 },
];

describe('calculateBudgetTotals', () => {
  it('computes the reference example at 15% retención', () => {
    const totals = calculateBudgetTotals(LINES, 'empresa', true, 15);
    expect(totals.baseImponible).toBe(2000);
    expect(totals.iva).toBe(420);
    expect(totals.retencionIrpf).toBe(300);
    expect(totals.total).toBe(2120);
  });

  it('computes the reference example at 7% retención', () => {
    const totals = calculateBudgetTotals(LINES, 'empresa', true, 7);
    expect(totals.baseImponible).toBe(2000);
    expect(totals.iva).toBe(420);
    expect(totals.retencionIrpf).toBe(140);
    expect(totals.total).toBe(2280);
  });

  it('forces retención off for a particular client (FR-006)', () => {
    const totals = calculateBudgetTotals(LINES, 'particular', true, 15);
    expect(totals.retencionIrpf).toBe(0);
    expect(totals.total).toBe(2420);
  });

  it('applies no retención when activarRetencion is false', () => {
    const totals = calculateBudgetTotals(LINES, 'empresa', false, 15);
    expect(totals.retencionIrpf).toBe(0);
    expect(totals.total).toBe(2420);
  });

  it('handles an empty line list', () => {
    const totals = calculateBudgetTotals([], 'empresa', true, 15);
    expect(totals).toEqual({ baseImponible: 0, iva: 0, retencionIrpf: 0, total: 0 });
  });
});

describe('banking round', () => {
  it('rounds up from 0.005', () => {
    expect(round2(10.005)).toBe(10.01);
  });

  it('rounds down below 0.005', () => {
    expect(round2(10.004)).toBe(10.0);
  });

  it('applies round only to final amounts, not per line', () => {
    const totals = calculateBudgetTotals(
      [{ cantidad: 1, precio_unitario: 0.1 }, { cantidad: 1, precio_unitario: 0.2 }],
      'empresa',
      false,
      15
    );
    expect(totals.baseImponible).toBe(0.3);
    expect(totals.iva).toBe(0.06);
  });
});

describe('calculateLineSubtotal', () => {
  it('multiplies cantidad by precio unitario', () => {
    expect(calculateLineSubtotal(2, 3.5)).toBe(7);
  });

  it('rounds the subtotal to 2 decimals', () => {
    expect(calculateLineSubtotal(3, 0.333)).toBe(1.0);
  });
});
