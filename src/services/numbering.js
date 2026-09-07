export function currentYear() {
  return new Date().getFullYear();
}

export function buildNumber(year, lastNumber) {
  return `${year}-${String(lastNumber).padStart(3, '0')}`;
}

export function generateNumber(db, year = currentYear()) {
  db.transaction(() => {
    const row = db.prepare('SELECT year, last_number FROM counters WHERE year = ?').get(year);
    const next = (row ? row.last_number : 0) + 1;
    db.prepare(
      'INSERT INTO counters (year, last_number) VALUES (?, ?) ON CONFLICT(year) DO UPDATE SET last_number = excluded.last_number'
    ).run(year, next);
  })();
  const row = db.prepare('SELECT last_number FROM counters WHERE year = ?').get(year);
  return buildNumber(year, row.last_number);
}
