# UI Contracts: PresupuestosPro

**Date**: 2026-09-04
**Branch**: `001-presupuestos-pdf`

## Overview

Contratos de interfaz de usuario: qué ve el freelancer en cada pantalla y qué acciones puede realizar.

---

## Screen 1: Onboarding (FR-013)

**Trigger**: Primera vez que se abre la app (no hay perfil guardado).
**Layout**: Wizard paso a paso con indicador de progreso (1/3, 2/3, 3/3).

### Paso 1: Perfil del freelancer
- Campos: nombre, NIF, dirección, teléfono, email, logo (upload, opcional)
- Botón: "Guardar y continuar"
- Validación: nombre, NIF, dirección, teléfono y email son obligatorios (FR-014)

### Paso 2: Catálogo de servicios (skipable)
- Lista vacía con botón "Añadir servicio"
- Cada servicio: campo nombre + campo precio
- Botones: "Añadir otro" / "Saltar este paso"
- Botón: "Continuar"

### Paso 3: Crear primer presupuesto (skipable)
- Redirige a la pantalla de crear presupuesto
- Botón: "Saltar por ahora"

**Post-onboarding**: Se muestra la pantalla principal (budget-list).

---

## Screen 2: Profile (FR-001)

**Trigger**: Navegación desde menú principal.
**Layout**: Formulario con todos los campos del perfil.

### Fields
- Nombre (text, required)
- NIF (text, required)
- Dirección (text, required)
- Teléfono (tel, required)
- Email (email, required)
- Logo (file upload, optional — preview del logo actual)

### Actions
- "Guardar" → envía PUT /api/profile al servidor (persistencia en SQLite)
- "Cancelar" → descarta cambios, vuelve a la pantalla anterior

### Feedback
- Mensaje de confirmación al guardar
- Si el logo es demasiado grande (>500kB), mostrar aviso y ofrecer redimensionar

---

## Screen 3: Catalog (FR-002)

**Trigger**: Navegación desde menú principal.
**Layout**: Lista de servicios con acciones inline.

### Display
- Tabla con columnas: Nombre, Precio (€), Acciones
- Si la lista está vacía: mensaje "Aún no tienes servicios. Añade tu primero."

### Actions per service
- "Editar" → inline edit o modal
- "Eliminar" → confirmación antes de borrar

### Global actions
- "Añadir servicio" → abre formulario (nombre + precio)
- Guardar automáticamente al confirmar cada operación

---

## Screen 4: Budget List (FR-011)

**Trigger**: Pantalla principal post-onboarding.
**Layout**: Lista de presupuestos existentes + botón "Nuevo presupuesto".

### Display
- Tarjetas o tabla con: número, fecha, cliente, total, estado (editable)
- Ordenados por fecha de emisión (más reciente primero)
- Si no hay presupuestos: mensaje "Crea tu primer presupuesto"

### Actions
- "Ver/Editar" → abre budget-form con el presupuesto cargado
- "Eliminar" → confirmación antes de borrar
- "Nuevo presupuesto" → abre budget-form vacío. Deshabilitado si perfil incompleto (FR-014)

---

## Screen 5: Budget Form (FR-003, FR-004, FR-005, FR-006, FR-009)

**Trigger**: "Nuevo presupuesto" o "Ver/Editar" desde budget-list.
**Layout**: Formulario dividido en secciones.

### Sección 1: Datos del cliente
- Campos: nombre, NIF/CIF, dirección, email
- Selector de tipo: "Empresa / Autónomo" | "Particular"
- Si se selecciona "Particular" → la retención de IRPF se desactiva y se oculta (FR-006)

### Sección 2: Configuración de retención
- Toggle: "Activar retención de IRPF" (solo visible si tipo = empresa/autónomo)
- Si activado: selector 15% (general) | 7% (nuevos autónomos)

### Sección 3: Líneas del presupuesto
- Tabla editable: Descripción | Cantidad | Precio unitario (€) | Subtotal | Acciones
- Botón "Añadir línea desde catálogo" → modal con lista de servicios del catálogo
- Botón "Añadir línea manual" → agrega fila vacía
- Cada fila: editar inline, botón "Eliminar"
- Los totales se recalculan en tiempo real al modificar cualquier línea

### Sección 4: Resumen de totales
- Base imponible
- IVA (21%)
- Retención IRPF (si aplica)
- **Total a pagar**
- Fecha de emisión (auto)
- Validez: 30 días desde emisión (auto)

### Actions
- "Guardar presupuesto" → envía POST/PUT /api/budgets (persistencia en SQLite)
- "Descargar PDF" → navega a GET /api/budgets/:id/pdf para descargar el PDF. Deshabilitado si 0 líneas (FR-012)
- "Cancelar" → descarta cambios sin guardar

---

## Screen 6: Budget View (read-only preview)

**Trigger**: Opcional — vista previa antes de descargar PDF.
**Layout**: Mockup del PDF en pantalla.

### Display
- Mismo layout que el PDF: logo, datos, tabla, totales
- Botón "Descargar PDF"
- Botón "Volver para editar"

**Note**: Esta pantalla es opcional en v0. Se puede implementar directamente el botón "Descargar PDF" en budget-form sin vista previa separada.

---

## Navigation

```
Onboarding (solo primera vez)
    │
    ▼
Budget List (pantalla principal)
    ├── → Profile
    ├── → Catalog
    ├── → Budget Form (nuevo)
    └── → Budget Form (editar existente)
```

**Menú principal**: Perfil | Catálogo | Presupuestos (links horizontales o sidebar)
