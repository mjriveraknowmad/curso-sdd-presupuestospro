import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateLong,
  isValidEmail,
} from '../../src/utils/formatting.js';

describe('formatCurrency', () => {
  it('formats euros with es-ES locale and €', () => {
    expect(formatCurrency(2000)).toBe('2.000,00 €');
  });

  it('formats decimals correctly', () => {
    expect(formatCurrency(2120)).toBe('2.120,00 €');
    expect(formatCurrency(420)).toBe('420,00 €');
  });

  it('formats negative-ish, zero and round values', () => {
    expect(formatCurrency(0)).toBe('0,00 €');
    expect(formatCurrency(1234.5)).toBe('1.234,50 €');
  });
});

describe('formatDate', () => {
  it('formats a date as DD/MM/YYYY', () => {
    expect(formatDate('2026-09-04')).toBe('04/09/2026');
  });

  it('pads day and month with leading zeros', () => {
    expect(formatDate('2026-01-05')).toBe('05/01/2026');
  });

  it('returns the input unchanged if not a valid date', () => {
    expect(formatDate('no-date')).toBe('no-date');
  });
});

describe('formatDateLong', () => {
  it('formats a long Spanish date', () => {
    expect(formatDateLong('2026-09-04')).toMatch(/septiembre/);
    expect(formatDateLong('2026-09-04')).toMatch(/2026/);
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('maria@ejemplo.com')).toBe(true);
    expect(isValidEmail('a.b+c@sub.domain.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});
