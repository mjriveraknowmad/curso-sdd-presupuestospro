export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS freelancer (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  nombre     TEXT NOT NULL,
  nif        TEXT NOT NULL,
  direccion  TEXT NOT NULL,
  telefono   TEXT NOT NULL,
  email      TEXT NOT NULL,
  logo       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT NOT NULL,
  precio     REAL NOT NULL CHECK (precio > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clients (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT NOT NULL,
  nif_cif    TEXT,
  direccion  TEXT,
  email      TEXT,
  tipo       TEXT NOT NULL CHECK (tipo IN ('empresa', 'particular')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budgets (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  numero            TEXT NOT NULL UNIQUE,
  fecha_emision     TEXT NOT NULL DEFAULT (date('now')),
  validez_dias      INTEGER NOT NULL DEFAULT 30,
  cliente_id        INTEGER NOT NULL REFERENCES clients(id),
  cliente_nombre    TEXT NOT NULL,
  cliente_nif_cif   TEXT,
  cliente_direccion TEXT,
  cliente_email     TEXT,
  cliente_tipo      TEXT NOT NULL CHECK (cliente_tipo IN ('empresa', 'particular')),
  activar_retencion INTEGER NOT NULL DEFAULT 0,
  porcentaje_irpf   REAL DEFAULT 15,
  base_imponible    REAL NOT NULL DEFAULT 0,
  iva               REAL NOT NULL DEFAULT 0,
  retencion_irpf    REAL NOT NULL DEFAULT 0,
  total             REAL NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS budget_lines (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  budget_id       INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  descripcion     TEXT NOT NULL,
  cantidad        REAL NOT NULL CHECK (cantidad > 0),
  precio_unitario REAL NOT NULL CHECK (precio_unitario >= 0),
  servicio_id     INTEGER REFERENCES services(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS counters (
  year        INTEGER PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_budgets_numero ON budgets(numero);
CREATE INDEX IF NOT EXISTS idx_budgets_fecha ON budgets(fecha_emision DESC);
CREATE INDEX IF NOT EXISTS idx_budget_lines_budget ON budget_lines(budget_id);
`;

export function applySchema(db) {
  db.exec(SCHEMA_SQL);
}
