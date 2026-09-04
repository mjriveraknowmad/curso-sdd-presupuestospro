# Research: PresupuestosPro

**Date**: 2026-09-04
**Branch**: `001-presupuestos-pdf`

## Decisions

### D1: Runtime — Node.js 18+

**Decision**: Se usa Node.js 18+ como runtime del servidor.

**Rationale**: Node.js es el runtime JavaScript más establecido para servidores. LTS 18 tiene soporte hasta 2025. Compatible con Express y SQLite. El freelancer ejecuta un solo comando para arrancar la app.

**Alternatives considered**:
- Deno: Más moderno pero menor ecosistema de paquetes. Express no es nativo.
- Bun: Más rápido pero inmaduro para producción.
- Python + Flask: Alternativa viable, pero el proyecto ya usa JS en el frontend.

### D2: Web framework — Express

**Decision**: Se usa Express como framework web.

**Rationale**: Express es el framework más simple y maduro para Node.js. Routing mínimo, middleware estándar, sin magia. Para una API REST de ~15 endpoints, es más que suficiente.

**Alternatives considered**:
- Fastify: Más rápido pero más configuración inicial. Express es más simple para v0.
- Koa: Más minimalista pero menos documentación y ecosistema.
- Hono: Más moderno pero menos maduro.

### D3: Database — SQLite (better-sqlite3)

**Decision**: Se usa SQLite como base de datos local, accedida via better-sqlite3.

**Rationale**: SQLite es una base de datos embebida que requiere cero configuración. Un solo archivo `.db` en el directorio del proyecto. better-sqlite3 es síncrono (más simple que async para usuario único) y no necesita compilación nativa en la mayoría de plataformas. Consistente con el principio de simplicidad.

**Alternatives considered**:
- PostgreSQL/MySQL: Requieren servidor separado. Sobredimensionado para usuario único.
- MongoDB: Requiere daemon. Modelo documental innecesario para datos relationales.
- LowDB/JSON file: Más simple pero sin integridad referencial ni queries complejas.
- better-sqlite3 vs sql.js: better-sqlite3 es más rápido (nativo) y tiene API más limpia.

### D4: PDF generation — jsPDF

**Decision**: Se usa jsPDF para generar PDFs del lado del servidor.

**Rationale**: jsPDF funciona tanto en navegador como en Node.js. Genera el PDF en el servidor y lo envía como respuesta HTTP para descarga. Esto mantiene la lógica de PDF en un solo lugar (server-side).

**Alternatives considered**- pdfmake: Más declarativa pero API más verbosa.
- Puppeteer: Genera PDFs de HTML pero requiere Chrome headless (~300MB).
- html-pdf-node: Ligero pero menos control que jsPDF.

**Note**: El PDF se genera en el servidor y se envía como blob al navegador para descarga. El frontend no genera PDFs.

### D5: Testing — Vitest

**Decision**: Se usa Vitest para tests unitarios e de integración.

**Rationale**: Vitest funciona tanto con código Node.js como con código browser. Tests unitarios de lógica de negocio (cálculos, numeración) y tests de integración de la API REST.

**Alternatives considered**:
- Jest: Requiere configuración adicional para ESM. Vitest es más nativo.
- Supertest: Para tests HTTP, se puede combinar con Vitest.

### D6: Frontend — Vanilla JS (servido por Express)

**Decision**: El frontend es JavaScript vanilla servido como archivos estáticos por Express.

**Rationale**: La app tiene ~5 pantallas con UI estática (formularios, tablas). No hay necesidad de reactividad compleja. Express sirve archivos estáticos desde `src/public/` con zero configuración.

**Alternatives considered**- Vue 3/React/Svelte: Sobredimensionado para 5 pantallas de formularios.
- EJS/Handlebars: Server-side rendering innecesario — el frontend es una SPA que consume API REST.

### D7: Styling — CSS vanilla

**Decision**: Se usa CSS vanilla sin preprocesadores ni frameworks CSS.

**Rationale**: La app tiene ~5 pantallas con diseño estático. CSS vanilla + variables CSS es suficiente y consistente con el principio de simplicidad.

**Alternatives considered**:
- Tailwind: Útil para prototipado rápido, pero añade dependencia y configuración.
- Bootstrap: Sobredimensionado, muchos componentes no se usan.

## Dependencies Summary

| Dependency | Version | Purpose | Type |
|------------|---------|---------|------|
| express | ^4.x | Web framework | runtime |
| better-site3 | ^5.x | SQLite driver | runtime |
| jspdf | ^2.x | PDF generation | runtime |
| vitest | ^1.x | Testing | dev |
| supertest | ^6.x | HTTP testing | dev |

**Total runtime dependencies**: 3 (Express, better-sqlite3, jsPDF)
**Total dev dependencies**: 2 (Vitest, Supertest)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| SQLite corruption on crash | Very Low | Medium | WAL mode + backup on startup. Single user = minimal risk. |
| better-sqlite3 native build fails | Low | Medium | Provides prebuilt binaries for most platforms. Fallback: sql.js. |
| Port 3000 already in use | Low | Low | Configurable via PORT env variable. |
| PDF generation slow | Very Low | Low | jsPDF is fast for simple layouts. Single user = no concurrent requests. |
| Data migration from localStorage | N/A | N/A | Not applicable — new project, no existing data to migrate. |
