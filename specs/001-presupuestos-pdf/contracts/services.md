# REST API Contracts: PresupuestosPro

**Date**: 2026-09-04
**Branch**: `001-presupuestos-pdf`

## Overview

API REST local que el frontend SPA consume para todas las operaciones. Servidor Express en `http://localhost:3000`. No hay autenticación — usuario único local.

## Base URL

```
http://localhost:3000/api
```

## Common Response Formats

### Success (single resource)
```json
{ "id": 1, "nombre": "...", ... }
```

### Success (list)
```json
[{ "id": 1, ... }, { "id": 2, ... }]
```

### Error
```json
{ "error": "Mensaje de error comprensible para el usuario" }
```

### HTTP Status Codes
- `200` OK
- `201` Created
- `204` No Content (delete exitoso)
- `400` Bad Request (validación fallida)
- `404` Not Found
- `500` Internal Server Error

---

## Contract 1: Profile API

**Base path**: `/api/profile`

| Method | Path | Body | Response | Description |
|--------|------|------|----------|-------------|
| GET | `/api/profile` | — | Profile object | Obtener perfil actual |
| PUT | `/api/profile` | Profile fields | Profile object | Crear o actualizar perfil (FR-001) |

### Profile Object
```json
{
  "id": 1,
  "nombre": "María García",
  "nif": "12345678Z",
  "direccion": "Calle Mayor 1, Madrid",
  "telefono": "612 345 678",
  "email": "maria@ejemplo.com",
  "logo": "data:image/png;base64,...",
  "created_at": "2026-09-04T10:00:00Z",
  "updated_at": "2026-09-04T10:00:00Z"
}
```

### Validación
- `nombre`, `nif`, `direccion`, `telefono`, `email`: requeridos, no vacíos
- `email`: formato email válido
- `logo`: data URL base64, opcional

### Completeness Check (FR-014)
```json
GET /api/profile/complete
→ { "complete": true }  // o false si falta algún campo obligatorio
```

---

## Contract 2: Services API (Catalog)

**Base path**: `/api/services`

| Method | Path | Body | Response | Description |
|--------|------|------|----------|-------------|
| GET | `/api/services` | — | Service[] | Listar todos los servicios |
| POST | `/api/services` | Service fields | Service | Crear servicio (FR-002) |
| PUT | `/api/services/:id` | Service fields | Service | Actualizar servicio |
| DELETE | `/api/services/:id` | — | 204 | Eliminar servicio |

### Service Object
```json
{
  "id": 1,
  "nombre": "Diseño de página web",
  "precio": 1500.00,
  "created_at": "2026-09-04T10:00:00Z"
}
```

### Validación
- `nombre`: requerido, no vacío
- `precio`: requerido, > 0, máximo 2 decimales

---

## Contract 3: Clients API

**Base path**: `/api/clients`

| Method | Path | Body | Response | Description |
|--------|------|------|----------|-------------|
| GET | `/api/clients` | — | Client[] | Listar todos los clientes |
| POST | `/api/clients` | Client fields | Client | Crear cliente |
| PUT | `/api/clients/:id` | Client fields | Client | Actualizar cliente |
| DELETE | `/api/clients/:id` | — | 204 | Eliminar cliente |

### Client Object
```json
{
  "id": 1,
  "nombre": "Cliente Ejemplo S.L.",
  "nif_cif": "B12345678",
  "direccion": "Avda. de la Industria 20, Barcelona",
  "email": "info@ejemplo.com",
  "tipo": "empresa",
  "created_at": "2026-09-04T10:00:00Z"
}
```

### Validación
- `nombre`: requerido, no vacío
- `tipo`: requerido, uno de `'empresa'` o `'particular'`
- `nif_cif`, `direccion`, `email`: opcionales

---

## Contract 4: Budgets API

**Base path**: `/api/budgets`

| Method | Path | Body | Response | Description |
|--------|------|------|----------|-------------|
| GET | `/api/budgets` | — | Budget[] | Listar todos los presupuestos (ordenados por fecha DESC) |
| GET | `/api/budgets/:id` | — | Budget | Obtener presupuesto con líneas |
| POST | `/api/budgets` | BudgetCreate | Budget | Crear presupuesto (FR-003, FR-007) |
| PUT | `/api/budgets/:id` | BudgetUpdate | Budget | Actualizar presupuesto (totales se recalculan) |
| DELETE | `/api/budgets/:id` | — | 204 | Eliminar presupuesto |

### Budget Object (response)
```json
{
  "id": 1,
  "numero": "2026-001",
  "fecha_emision": "2026-09-04",
  "validez_dias": 30,
  "fecha_validez": "2026-10-04",
  "cliente_id": 1,
  "cliente_nombre": "Cliente Ejemplo S.L.",
  "cliente_nif_cif": "B12345678",
  "cliente_direccion": "Avda. de la Industria 20, Barcelona",
  "cliente_email": "info@ejemplo.com",
  "cliente_tipo": "empresa",
  "activar_retencion": true,
  "porcentaje_irpf": 15,
  "base_imponible": 2000.00,
  "iva": 420.00,
  "retencion_irpf": 300.00,
  "total": 2120.00,
  "lineas": [
    {
      "id": 1,
      "descripcion": "Diseño de página web",
      "cantidad": 1,
      "precio_unitario": 1500.00,
      "subtotal": 1500.00,
      "servicio_id": null
    },
    {
      "id": 2,
      "descripcion": "Sesión de fotos de producto",
      "cantidad": 1,
      "precio_unitario": 500.00,
      "subtotal": 500.00,
      "servicio_id": 2
    }
  ],
  "created_at": "2026-09-04T10:00:00Z",
  "updated_at": "2026-09-04T10:00:00Z"
}
```

### BudgetCreate (request body)
```json
{
  "cliente_id": 1,
  "activar_retencion": true,
  "porcentaje_irpf": 15,
  "lineas": [
    { "descripcion": "Diseño de página web", "cantidad": 1, "precio_unitario": 1500, "servicio_id": null },
    { "descripcion": "Sesión de fotos", "cantidad": 1, "precio_unitario": 500, "servicio_id": 2 }
  ]
}
```

### Business Rules Applied Server-Side
- `numero` se genera automáticamente (FR-007) — no se envía en el request
- `fecha_emision` se asigna automáticamente — no se envía
- `cliente_nombre`, `cliente_nif_cif`, etc. se copian del cliente (snapshot)
- Si `cliente_tipo === 'particular'` → `activar_retencion` se fuerza a `false` (FR-006)
- `base_imponible`, `iva`, `retencion_irpf`, `total` se calculan server-side (FR-005)
- Redondeo estándar en cada importe final (Clarification Q1)

### Validación
- `cliente_id`: requerido, debe existir
- `lineas`: requerido, array con ≥ 1 elemento
- Cada línea: `descripcion` requerido, `cantidad` > 0, `precio_unitario` ≥ 0

---

## Contract 5: Budget Lines API

**Base path**: `/api/budgets/:budgetId/lines`

| Method | Path | Body | Response | Description |
|--------|------|------|----------|-------------|
| POST | `/api/budgets/:budgetId/lines` | Line fields | Line | Añadir línea (FR-004) |
| PUT | `/api/budgets/:budgetId/lines/:id` | Line fields | Line | Actualizar línea (FR-009) |
| DELETE | `/api/budgets/:budgetId/lines/:id` | — | 204 | Eliminar línea (FR-009) |

### Line Object
```json
{
  "id": 1,
  "budget_id": 1,
  "descripcion": "Diseño de página web",
  "cantidad": 1,
  "precio_unitario": 1500.00,
  "subtotal": 1500.00,
  "servicio_id": null
}
```

### Note
Al añadir, editar o eliminar una línea, el presupuesto padre se actualiza automáticamente con los nuevos totales. La respuesta del endpoint de línea incluye los totales actualizados del presupuesto padre.

---

## Contract 6: PDF Generation API

**Base path**: `/api/budgets/:id/pdf`

| Method | Path | Body | Response | Description |
|--------|------|------|----------|-------------|
| GET | `/api/budgets/:id/pdf` | — | PDF binary | Descargar PDF (FR-010) |

### Response Headers
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="presupuesto-2026-001.pdf"
```

### Validation
- Si el presupuesto no tiene líneas: `400 { "error": "El presupuesto debe tener al menos una línea para generar el PDF" }` (FR-012)

### PDF Content (FR-010)
1. Logo del freelancer (o espacio en blanco si no hay logo — FR-015)
2. Datos del freelancer (nombre, NIF, dirección, teléfono, email)
3. Datos del cliente (nombre, NIF/CIF, dirección, email, tipo)
4. Número de presupuesto (AAAA-NNN)
5. Fecha de emisión
6. Validez (fecha emisión + 30 días)
7. Tabla de líneas (descripción, cantidad, precio unitario, subtotal)
8. Desglose: base imponible, IVA (21%), retención IRPF (si aplica), total

---

## Contract 7: Counter API (internal)

**Base path**: `/api/counters`

| Method | Path | Body | Response | Description |
|--------|------|------|----------|-------------|
| GET | `/api/counters/next` | — | `{ "numero": "2026-001" }` | Obtener siguiente número (FR-007) |

**Note**: Este endpoint es interno. Se llama automáticamente al crear un presupuesto. No necesita ser consumido por el frontend directamente.

---

## Error Handling (FR-016)

Si el servidor no puede escribir en la base de datos (disco lleno, permisos), la API retorna:

```json
{
  "error": "No se pudieron guardar los datos. Comprueba que hay espacio disponible en el disco."
}
```

HTTP Status: `500`
