import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { applySchema } from '../../src/db/schema.js';
import { generateNumber, currentYear, buildNumber } from '../../src/services/numbering.js';

let db;

beforeEach(() => {
  db = new Database(':memory:');
  applySchema(db);
});

describe('numbering', () => {
  it('produces AAAA-NNN format with leading zeros', () => {
    const num = generateNumber(db, 2026);
    expect(num).toMatch(/^\d{4}-\d{3}$/);
  });

  it('starts the year at 001', () => {
    expect(generateNumber(db, 2026)).toBe('2026-001');
  });

  it('increments sequentially within the same year', () => {
    expect(generateNumber(db, 2026)).toBe('2026-001');
    expect(generateNumber(db, 2026)).toBe('2026-002');
    expect(generateNumber(db, 2026)).toBe('2026-003');
  });

  it('resets the counter for a new year', () => {
    expect(generateNumber(db, 2026)).toBe('2026-001');
    expect(generateNumber(db, 2026)).toBe('2026-002');
    expect(generateNumber(db, 2027)).toBe('2027-001');
  });

  it('resumes correctly when switching back to a previous year', () => {
    expect(generateNumber(db, 2026)).toBe('2026-001');
    expect(generateNumber(db, 2027)).toBe('2027-001');
    expect(generateNumber(db, 2026)).toBe('2026-002');
  });

  it('supports high sequence numbers with 3-digit padding', () => {
    db.prepare('INSERT INTO counters (year, last_number) VALUES (?, ?)').run(2026, 999);
    expect(generateNumber(db, 2026)).toBe('2026-1000');
  });

  it('buildNumber formats with leading zeros', () => {
    expect(buildNumber(2026, 1)).toBe('2026-001');
    expect(buildNumber(2026, 12)).toBe('2026-012');
  });

  it('currentYear returns the running year', () => {
    expect(currentYear()).toBe(new Date().getFullYear());
  });
});
