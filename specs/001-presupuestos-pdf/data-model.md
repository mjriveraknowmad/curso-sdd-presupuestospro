# Data Model: PresupuestosPro

**Date**: 2026-09-04
**Branch**: `001-presupuestos-pdf`

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│  freelancer  │       │   services   │       │    clients       │
│  (profile)   │       │  (catalog)   │       │                  │
├──────────────┤       ├──────────────┤       ├──────────────────┤
│ id     (PK)  │       │ id     (PK)  │       │ id     (PK)      │
│ nombre       │       │ nombre       │       │ nombre           │
│ nif          │       │ precio       │       │ nif_cif          │
│ direccion    │       │ created_at   │       │ direccion        │
│ telefono     │       └──────────────┘       │ email            │
│ email        │                              │ tipo             │
│ logo         │                              │ created_at       │
│ created_at   │                              └────────┬─────────┘
│ updated_at   │                                       │
└──────────────┘                                       │ 1:N
                                                       ▼
                                              ┌──────────────────────┐
                                              │      budgets         │
                                              ├──────────────────────┤
                                              │ id            (PK)   │
                                              │ numero (AAAA-NNN)    │
                                              │ fecha_emision        │
                                              │ validez_dias (30)    │
                                              │ cliente_id (FK)      │
                                              │ cliente_nombre       │
                                              │ cliente_nif_cif      │
                                              │ cliente_direccion    │
                                              │ cliente_email        │
                                              │ cliente_tipo         │
                                              │ activar_retencion    │
                                              │ porcentaje_irpf      │
                                              │ base_imponible       │
                                              │ iva                  │
                                              │ retencion_irpf       │
                                              │ total                │
                                              │ created_at           │
                                              │ updated_at           │
                                              └──────────┬───────────┘
                                                         │
                                                         │ 1:N
                                                         ▼
                                              ┌──────────────────────┐
                                              │   budget_lines       │
                                              ├──────────────────────┤
                                              │ id            (PK)   │
                                              │ budget_id     (FK)   │
                                              │ descripcion          │
                                              │ cantidad             │
                                              │ precio_unitario      │
                                              │ servicio_id (FK, opt)│
                                              │ created_at           │
                                              └──────────────────────┘

┌──────────────┐
│  counters    │
├──────────────┤
│ year    (PK) │
│ last_number  │
└──────────────┘
```

## SQLite Schema

```sql
-- Perfil del freelancer (singleton: solo 1 fila)
CREATE TABLE freelancer (
  id         INTEGER PRIMARY KEY CHECK (id = 1),  -- fuerza singleton
  nombre     TEXT NOT NULL,
  nif        TEXT NOT NULL,
  direccion  TEXT NOT NULL,
  telefono   TEXT NOT NULL,
  email      TEXT NOT NULL,
  logo       TEXT,                                  -- data URL base64, nullable
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Catálogo de servicios
CREATE TABLE services (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT NOT NULL,
  precio     REAL NOT NULL CHECK (precio > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Clientes
CREATE TABLE clients (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT NOT NULL,
  nif_cif    TEXT,
  direccion  TEXT,
  email      TEXT,
  tipo       TEXT NOT NULL CHECK (tipo IN ('empresa', 'particular')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Presupuestos
CREATE TABLE budgets (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  numero            TEXT NOT NULL UNIQUE,           -- AAAA-NNN, ej: "2026-001"
  fecha_emision     TEXT NOT NULL DEFAULT (date('now')),
  validez_dias      INTEGER NOT NULL DEFAULT 30,
  cliente_id        INTEGER NOT NULL REFERENCES clients(id),
  -- Snapshot de datos del cliente al momento de creación
  cliente_nombre    TEXT NOT NULL,
  cliente_nif_cif   TEXT,
  cliente_direccion TEXT,
  cliente_email     TEXT,
  cliente_tipo      TEXT NOT NULL CHECK (cliente_tipo IN ('empresa', 'particular')),
  -- Configuración de retención
  activar_retencion INTEGER NOT NULL DEFAULT 0,     -- 0/1 (boolean)
  porcentaje_irpf   REAL DEFAULT 15,                -- 15 o 7
  -- Totales calculados (se actualizan al guardar/editar)
  base_imponible    REAL NOT NULL DEFAULT 0,
  iva               REAL NOT NULL DEFAULT 0,
  retencion_irpf    REAL NOT NULL DEFAULT 0,
  total             REAL NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Líneas de presupuesto
CREATE TABLE budget_lines (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  budget_id       INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  descripcion     TEXT NOT NULL,
  cantidad        REAL NOT NULL CHECK (cantidad > 0),
  precio_unitario REAL NOT NULL CHECK (precio_unitario >= 0),
  servicio_id     INTEGER REFERENCES services(id),  -- nullable: línea manual si null
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Contador de numeración por año
CREATE TABLE counters (
  year        INTEGER PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);

-- Índices para queries frecuentes
CREATE INDEX idx_budgets_numero ON budgets(numero);
CREATE INDEX idx_budgets_fecha ON budgets(fecha_emision DESC);
CREATE INDEX idx_budget_lines_budget ON budget_lines(budget_id);
```

## Entity Definitions

### freelancer (Profile)

Singleton entity — constraint `CHECK (id = 1)` fuerza una sola fila.

| Column | Type | Required | Validation | Notes |
|--------|------|----------|------------|-------|
| id | INTEGER | auto | = 1 | PK, constraint singleton |
| nombre | TEXT | Yes | Min 1 char | Nombre completo o nombre comercial |
| nif | TEXT | Yes | Formato NIF/CIF español | Letra/dígitos + letra verificadora |
| direccion | TEXT | Yes | Min 1 char | Dirección fiscal completa |
| telefono | TEXT | Yes | Min 1 char | Teléfono de contacto |
| email | TEXT | Yes | Formato email válido | Email de contacto |
| logo | TEXT | No | data URL base64 | Si NULL, PDF reserva espacio en blanco (FR-015) |

### services (Catalog Item)

| Column | Type | Required | Validation | Notes |
|--------|------|----------|------------|-------|
| id | INTEGER | auto | Unique | Autoincrement |
| nombre | TEXT | Yes | Min 1 char | Nombre descriptivo del servicio |
| precio | REAL | Yes | > 0, 2 decimals | Precio por defecto en euros |

### clients

| Column | Type | Required | Validation | Notes |
|--------|------|----------|------------|-------|
| id | INTEGER | auto | Unique | Autoincrement |
| nombre | TEXT | Yes | Min 1 char | Nombre o razón social |
| nif_cif | TEXT | No | NIF/CIF si aplica | Opcional para particulares |
| direccion | TEXT | No | — | Dirección del cliente |
| email | TEXT | No | Formato email | Email del cliente |
| tipo | TEXT | Yes | 'empresa' o 'particular' | Determina si aplica retención IRPF |

**Note**: Los datos del cliente se copian al presupuesto al momento de creación (snapshot). Si el cliente se edita después, los presupuestos existentes NO se actualizan.

### budgets

| Column | Type | Required | Validation | Notes |
|--------|------|----------|------------|-------|
| id | INTEGER | auto | Unique | Autoincrement |
| numero | TEXT | Yes | UNIQUE, formato AAAA-NNN | Generado por FR-007 |
| fecha_emision | TEXT | auto | YYYY-MM-DD | Default: date('now') |
| validez_dias | INTEGER | fixed | 30 | Fijo, no editable |
| cliente_id | INTEGER | Yes | FK → clients.id | Referencia al cliente |
| cliente_nombre | TEXT | Yes | Snapshot del cliente | Copiado al crear |
| cliente_nif_cif | TEXT | No | Snapshot | Copiado al crear |
| cliente_direccion | TEXT | No | Snapshot | Copiado al crear |
| cliente_email | TEXT | No | Snapshot | Copiado al crear |
| cliente_tipo | TEXT | Yes | 'empresa' o 'particular' | Snapshot — determina retención |
| activar_retencion | INTEGER | Yes | 0 o 1 | Si cliente_tipo = 'particular', se fuerza 0 (FR-006) |
| porcentaje_irpf | REAL | conditional | 15 o 7 | Solo aplica si activar_retencion = 1 |
| base_imponible | REAL | computed | ≥ 0, 2 decimals | Suma de subtotales de líneas |
| iva | REAL | computed | ≥ 0, 2 decimals | base_imponible × 0.21 |
| retencion_irpf | REAL | computed | ≥ 0, 2 decimals | base_imponible × (porcentaje_irpf/100) si aplica, else 0 |
| total | REAL | computed | 2 decimals | base_imponible + iva − retencion_irpf |

**State transitions**: Sin estados. El presupuesto es siempre editable (FR-009). No hay campo de estado ni de "finalizado".

### budget_lines

| Column | Type | Required | Validation | Notes |
|--------|------|----------|------------|-------|
| id | INTEGER | auto | Unique | Autoincrement |
| budget_id | INTEGER | Yes | FK → budgets.id ON DELETE CASCADE | Presupuesto padre |
| descripcion | TEXT | Yes | Min 1 char | Descripción del concepto |
| cantidad | REAL | Yes | > 0 | Cantidad de unidades |
| precio_unitario | REAL | Yes | ≥ 0, 2 decimals | Precio por unidad en euros |
| servicio_id | INTEGER | No | FK → services.id | Si viene del catálogo. NULL si es línea manual |

**Computed field**: `subtotal = cantidad × precio_unitario` (no se persiste, se calcula en runtime)

### counters

| Column | Type | Required | Validation | Notes |
|--------|------|----------|------------|-------|
| year | INTEGER | PK | Año actual o futuro | Un registro por año |
| last_number | INTEGER | Yes | ≥ 0 | Último número usado. Se incrementa al crear presupuesto |

## Validation Rules Summary

| Rule | Source | Enforcement |
|------|--------|-------------|
| Perfil completo antes de crear presupuesto | FR-014 | API: rechazar POST /api/budgets si perfil incompleto |
| Presupuesto debe tener ≥1 línea para PDF | FR-012 | API: rechazar GET /api/budgets/:id/pdf si 0 líneas |
| Si cliente es particular, retención = 0 | FR-006 | Business logic: override automático en route handler |
| IVA = 21% fijo | Assumption | hardcoded en calculations.js |
| Redondeo estándar en resultados finales | Clarification Q1 | Math.round(x * 100) / 100 |
| Numeración AAAA-NNN, reset anual | FR-07 | counters table, incremento atómico |
| Validez = 30 días desde emisión | FR-08 | Cálculo: fecha_emision + 30 días |
