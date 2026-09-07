import db from '../src/db/connection.js';

export function resetDb() {
  db.exec(`
    DELETE FROM budget_lines;
    DELETE FROM budgets;
    DELETE FROM clients;
    DELETE FROM services;
    DELETE FROM freelancer;
    DELETE FROM counters;
    DELETE FROM sqlite_sequence;
  `);
}

export { db };
