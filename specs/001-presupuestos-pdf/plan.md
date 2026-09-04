# Implementation Plan: PresupuestosPro

**Branch**: `001-presupuestos-pdf` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-presupuestos-pdf/spec.md`

## Summary

PresupuestosPro es una aplicación web con backend Node.js + Express + SQLite que permite a freelancers españoles crear presupuestos profesionales con su marca y descargarlos en PDF. Los datos se almacenan en una base de datos SQLite local. No hay autenticación, ni sincronización en la nube. El núcleo del producto es el cálculo automático de base imponible, IVA (21%), retención de IRPF (15%/7%) y total, con generación de PDF profesional.

## Technical Context

**Language/Version**: JavaScript ES2022+ (Node.js 18+)

**Primary Dependencies**: Express (web framework), better-site3 (SQLite driver), jsPDF (PDF generation)

**Storage**: SQLite (archivo local `.db` en el directorio del proyecto)

**Testing**: Vitest (unit + integration tests)

**Target Platform**: Navegadores modernos (Chrome, Firefox, Safari, Edge — últimos 2 versiones) + Node.js 18+ en la máquina del freelancer

**Project Type**: Web application (SPA estática + REST API local)

**Performance Goals**: Negligible — usuario único, operaciones locales. Cálculos y API responses deben ser instantáneos (<100ms perceptible).

**Constraints**: Offline-capable (servidor local), sin cloud, solo euro, solo español de España

**Scale/Scope**: Usuario único, ~5 pantallas, ~5 entidades, ~16 requisitos funcionales, 1 endpoint REST por recurso

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Simplicidad ante todo | PASS | Express + SQLite es el stack más simple para server-side. Sin ORM, sin migraciones complejas. Un solo archivo `.db`. |
| II. Idioma y mercado | PASS | Toda la UI y documentación en español de España. Moneda: euro. |
| III. Cero alcance fantasma | PASS | 16 FRs documentados en spec. No se implementa nada fuera de ellos. |
| IV. Verificable por persona no técnica | PASS | Todos los CA son acciones observables en el navegador. El freelancer solo interactúa con la UI web. |
| V. Datos del usuario con respeto | PASS | Solo datos de perfil, catálogo y presupuestos. Sin credenciales, sin secrets. SQLite se ejecuta localmente. |

**Gate result**: PASS — sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/001-presupuestos-pdf/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── server.js            # Entry point Express
├── db/
│   ├── connection.js    # Conexión SQLite
│   └── schema.js        # Creación de tablas
├── routes/
│   ├── profile.js       # CRUD perfil del freelancer
│   ├── services.js      # CRUD catálogo de servicios
│   ├── clients.js       # CRUD clientes
│   └── budgets.js       # CRUD presupuestos + cálculos
├── services/
│   ├── calculations.js  # Lógica de cálculo (base, IVA, IRPF, total)
│   ├── numbering.js     # Numeración AAAA-NNN
│   └── pdf-generator.js # Generación de PDF con jsPDF
├── utils/
│   └── formatting.js    # Formateo de moneda, fechas
└── public/
    ├── index.html       # SPA frontend
    ├── css/
    │   └── style.css
    └── js/
        ├── app.js       # Router y lógica de UI
        ├── api.js       # Cliente HTTP para la API REST
        └── pages/
            ├── onboarding.js
            ├── profile.js
            ├── catalog.js
            ├── budget-list.js
            └── budget-form.js

tests/
├── unit/
│   ├── calculations.test.js
│   ├── numbering.test.js
│   └── formatting.test.js
└── integration/
    ├── api.test.js
    └── budget-flow.test.js
```

**Structure Decision**: Backend Express con SQLite sirve archivos estáticos del frontend SPA. API REST bajo `/api/`. Frontend vanilla JS que consume la API. Separación clara: `src/routes/` para endpoints, `src/services/` para lógica de negocio, `src/public/` para el cliente.

## Complexity Tracking

> Sin violaciones de constitución. No se requiere justificación.
