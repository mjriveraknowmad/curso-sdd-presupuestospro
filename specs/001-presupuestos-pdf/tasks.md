# Tasks: PresupuestosPro

**Input**: Design documents from `/specs/001-presupuestos-pdf/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests requested — unit tests for calculations/numbering/formatting and integration tests for the API are specified in plan.md structure.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/`, `tests/` at repository root (server + static frontend under `src/public/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Node.js project with package.json and npm (express, better-sqlite3, jspdf as dependencies; vitest, supertest as devDependencies)
- [ ] T002 [P] Create folder structure: src/db, src/routes, src/services, src/utils, src/public/css, src/public/js/pages, tests/unit, tests/integration
- [ ] T003 [P] Create src/server.js Express entry point serving static files from src/public and mounting /api router
- [ ] T004 Create package.json scripts: dev, test, test:integration, test:coverage
- [ ] T005 [P] Add .gitignore for node_modules and *.db files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and business logic that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create src/db/connection.js — SQLite connection using better-sqlite3, WAL mode, DB file path `presupuestospro.db` in project root
- [ ] T007 Create src/db/schema.js — create all tables (freelancer, services, clients, budgets, budget_lines, counters) and indexes per data-model.md, run at startup
- [ ] T008 Create src/utils/formatting.js — formatCurrency (euros es-ES), formatDate (DD/MM/YYYY), formatDateLong (Spanish long date), isValidEmail helper
- [ ] T009 Create src/services/calculations.js — calculateBudgetTotals(lines, clienteTipo, activarRetencion, porcentajeIrpf) returning { baseImponible, iva, retencionIrpf, total } with banking round Math.round(x*100)/100 and calculateLineSubtotal(cantidad, precioUnitario)
- [ ] T010 Create src/services/numbering.js — generateNumber() producing AAAA-NNN format, incrementing counters table per year, resetting annually (FR-007)
- [ ] T011 Create src/routes/profile.js — GET /api/profile, PUT /api/profile, GET /api/profile/complete per contracts/services.md

**Checkpoint**: Foundation ready — API routing, DB schema, and business logic services (calculations, numbering) available. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Configurar perfil del freelancer (Priority: P1) - MVP

**Goal**: El freelancer configura nombre, NIF, datos de contacto y logo. Estos datos persisten y aparecen en la app.

**Independent Test**: Abrir la app, rellenar perfil completo, guardar, cerrar y reabrir; los datos siguen ahí (quickstart V1, V7).

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Unit test for profile validation (required fields, email format) in tests/unit/profile.test.js
- [ ] T013 [P] [US1] Integration test for GET/PUT /api/profile and /api/profile/complete in tests/integration/profile-api.test.js

### Implementation for User Story 1

- [ ] T014 [P] [US1] Create src/public/index.html — base SPA layout with navigation menu (Perfil, Catálogo, Presupuestos) and mount point for pages
- [ ] T015 [P] [US1] Create src/public/css/style.css — base styles, CSS variables, form/table/button styling, responsive
- [ ] T016 [P] [US1] Create src/public/js/api.js — fetch wrapper for REST API (get, post, put, del) with JSON handling and error extraction
- [ ] T017 [P] [US1] Create src/public/js/app.js — simple hash-based router and page loader (onboarding, profile, catalog, budget-list, budget-form)
- [ ] T018 [US1] Create src/public/js/pages/profile.js — profile form (nombre, NIF, dirección, teléfono, email, logo upload) that saves via PUT /api/profile and shows confirmation/errors
- [ ] T019 [US1] Create src/public/js/pages/onboarding.js — 3-step wizard (perfil, catálogo opcional, primer presupuesto opcional) per contracts/ui.md, invokes profile/profile.js and catalog.js

**Checkpoint**: User Story 1 fully functional — profile CRUD works end-to-end, onboarding wizard guides first-time setup. MVP candidate.

---

## Phase 4: User Story 2 - Mantener catálogo de servicios (Priority: P2)

**Goal**: El freelancer mantiene un catálogo de servicios con nombre y precio por defecto.

**Independent Test**: Añadir, editar y eliminar servicios; cierre y reapertura persisten (quickstart V1 paso 2).

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [P] [US2] Unit test for service validation (nombre required, precio > 0) in tests/unit/services.test.js
- [ ] T021 [P] [US2] Integration test for CRUD /api/services in tests/integration/services-api.test.js

### Implementation for User Story 2

- [ ] T022 [P] [US2] Create src/routes/services.js — GET, POST, PUT, DELETE /api/services per contracts/services.md
- [ ] T023 [US2] Create src/public/js/pages/catalog.js — services table with add/edit/delete actions, empty state message, wired to /api/services
- [ ] T024 [US2] Mount services router and service page into app (app.js routing + server.js)

**Checkpoint**: Catalogs work independently — services CRUD functional and persistent.

---

## Phase 5: User Story 3 - Crear presupuesto con líneas y cálculo automático (Priority: P3)

**Goal**: El freelancer crea un presupuesto eligiendo/creando cliente y añadiendo líneas (del catálogo o manuales); base, IVA, retención y total se calculan solos.

**Independent Test**: Crear presupuesto con el ejemplo de referencia (2 líneas, retención 15%) y verificar total exacto 2.120,00 €; cambiar a particular → total 2.420,00 € (quickstart V2, V3, V8).

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T025 [P] [US3] Unit test for calculations.js — verify example totals (2.120,00 € at 15%, 2.280,00 € at 7%, 2.420,00 € particular) and banking round in tests/unit/calculations.test.js
- [ ] T026 [P] [US3] Integration test for budget creation, recalculation on line edit/delete, and particular override (FR-006) in tests/integration/budget-flow.test.js

### Implementation for User Story 3

- [ ] T027 [P] [US3] Create src/routes/clients.js — GET, POST, PUT, DELETE /api/clients per contracts/services.md
- [ ] T028 [US3] Create src/routes/budgets.js — GET list, GET by id (with lines), POST (with numbering + totals), PUT (recalc totals), DELETE per contracts/services.md; enforce FR-014 (profile complete) and FR-006 (particular → no retención)
- [ ] T029 [P] [US3] Create src/routes/budget-lines.js — POST, PUT, DELETE /api/budgets/:budgetId/lines, recalculating budget totals on each change (FR-009)
- [ ] T030 [P] [US3] Create src/public/js/pages/budget-form.js — client selector (from /api/clients or inline), retención toggle + 15%/7% selector, editable lines table (from catalog modal or manual row), live totals summary
- [ ] T031 [P] [US3] Create src/public/js/pages/budget-list.js — list of budgets (número, fecha, cliente, total) with view/edit/delete and "Nuevo presupuesto" button (disabled if profile incomplete, FR-014)
- [ ] T032 [US3] Mount clients, budgets, budget-lines routers and budget pages into app (server.js + app.js)

**Checkpoint**: Core product works — budgets with automatic calculations, line editing, client types.

---

## Phase 6: User Story 4 - Numeración y fechas automáticas (Priority: P4)

**Goal**: Los presupuestos se numeran AAAA-NNN automáticamente (reiniciando cada año) y muestran fecha de emisión y validez de 30 días.

**Independent Test**: Crear dos presupuestos; el primero es 2026-001 y el segundo 2026-002; fechas y validez se muestran (quickstart V4).

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T033 [P] [US4] Unit test for numbering.js — sequence resumes, resets per year, AAAA-NNN format with leading zeros in tests/unit/numbering.test.js

### Implementation for User Story 4

- [ ] T034 [US4] Wire numbering into budget creation (numbers auto-assigned in budgets.js POST via numbering.js) and ensure validez (fecha_emision + 30 days) is returned with budget
- [ ] T035 [US4] Add numero, fecha_emision, fecha_validez to budget-list page display and budget-form read-only summary

**Checkpoint**: Numbering and dates functional — automatic sequential numbering with annual reset, 30-day validity.

---

## Phase 7: User Story 5 - Descargar PDF profesional (Priority: P5)

**Goal**: El freelancer descarga el presupuesto como PDF con logo, datos, número, fechas, tabla y desglose.

**Independent Test**: Generar PDF con el ejemplo de referencia y verificar que contiene logo/número/fechas/tabla/desglose; PDF rechazado si 0 líneas (quickstart V5).

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T036 [P] [US5] Unit test for formatting.js — currency/date Spanish formatting in tests/unit/formatting.test.js
- [ ] T037 [P] [US5] Integration test for GET /api/budgets/:id/pdf — returns PDF headers, 400 when no lines (FR-012) in tests/integration/pdf-api.test.js

### Implementation for User Story 5

- [ ] T038 [P] [US5] Create src/services/pdf-generator.js — builds PDF with jsPDF: logo (or blank space FR-015), freelancer data, client data, numero, fechas, lines table, breakdown (base, IVA, retención if any, total)
- [ ] T039 [US5] Create src/routes/pdf.js — GET /api/budgets/:id/pdf returning application/pdf with Content-Disposition filename `presupuesto-{numero}.pdf`; 400 if 0 lines (FR-012)
- [ ] T040 [US5] Add "Descargar PDF" action to budget pages that navigates to GET /api/budgets/:id/pdf (download), disabled when 0 lines

**Checkpoint**: Product complete — PDF downloads with full professional content.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T041 [P] Add error handling middleware for 404/500 returning JSON error messages (Spanish) per contracts/services.md, including a clear message when a SQLite write fails due to disk space/permissions (FR-016)
- [ ] T042 Run quickstart.md validation scenarios V1–V9 end-to-end and fix any gaps
- [ ] T043 [P] Run full test suite (npm run test + npm run test:integration) and ensure all pass
- [ ] T044 [P] Review UI copy for Spanish (es-ES) correctness across all screens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (Phase 3) — MVP, implement first
  - US2–US5 can proceed in priority order (P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories
- **US2 (P2)**: Can start after Foundational — No dependencies on other stories
- **US3 (P3)**: Depends on Foundational (calculations.js + numbering.js) + needs clients router + numbers from US4 (numbering wiring). Budget pages consume catalog (US2) for "add from catalog". **Note**: numbering.js is created in Foundational (T010); its wiring into budget POST (T034) lives in US4 — T028 (budgets POST) must either wait for T034 or include the numbering call directly. Implement US4 (T033–T035) before or in parallel with US3's POST path to avoid a dependency gap.
- **US4 (P4)**: Can start after Foundational (numbering.js) — No dependency on US3. T034 wires numbering into budget creation; implement before finalizing T028's POST path.
- **US5 (P5)**: Depends on US3 (budgets + PDF service needs budget data structure) + US4 (numero) + foundational (formatting)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Routes/services before page integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational completes, US1, US2 and US4 can start in parallel
- All tests within a story marked [P] can run in parallel
- Routes (non-[P] foundational) must precede their story's page integration

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for profile validation in tests/unit/profile.test.js"
Task: "Integration test for GET/PUT /api/profile and /api/profile/complete in tests/integration/profile-api.test.js"

# Launch all page/model files for User Story 1 together:
Task: "Create src/public/index.html"
Task: "Create src/public/css/style.css"
Task: "Create src/public/js/api.js"
Task: "Create src/public/js/app.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Profile + Onboarding)
4. **STOP and VALIDATE**: Test US1 independently (profile CRUD + onboarding)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 4 (numbering) → then User Story 3 → Test independently
5. Add User Story 5 (PDF) → Test independently
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Profile + Onboarding)
   - Developer B: User Story 2 (Catalog) + User Story 4 (Numbering)
   - Developer C: User Story 3 (Budgets) → then User Story 5 (PDF)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- DB file is `presupuestospro.db` in project root (local SQLite)
- No authentication — single local user per spec
- All UI copy and errors in Spanish (es-ES); currency in euro (€)
