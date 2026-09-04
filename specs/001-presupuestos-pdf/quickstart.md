# Quickstart Validation Guide: PresupuestosPro

**Date**: 2026-09-04
**Branch**: `001-presupuestos-pdf`

## Prerequisites

- Node.js 18+ instalado
- npm o pnpm
- Navegador moderno (Chrome, Firefox, Safari o Edge — últimas 2 versiones)

## Setup

```bash
# Clonar el repositorio
git clone <repo-url>
cd curso-sdd-presupuestospro

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor arranca en `http://localhost:3000`. La API REST está en `http://localhost:3000/api`. El frontend se sirve desde `http://localhost:3000`.

## Validation Scenarios

### V1: Onboarding completo (FR-013, FR-014)

1. Abrir `http://localhost:3000` en navegador (modo incógnito para simular primera vez)
2. **Esperado**: Se muestra wizard de onboarding paso a paso (no hay perfil guardado)
3. Rellenar perfil: nombre, NIF, dirección, teléfono, email
4. Subir logo (opcional)
5. Continuar al paso de catálogo → añadir al menos 1 servicio
6. Continuar al paso de creación de presupuesto
7. **Esperado**: Se redirige al formulario de nuevo presupuesto

### V2: Crear presupuesto con ejemplo de referencia (FR-003, FR-004, FR-005, CA1)

1. Desde el formulario de presupuesto, rellenar datos del cliente:
   - Nombre: "Cliente Ejemplo S.L."
   - Tipo: "Empresa / Autónomo"
2. Añadir línea 1: "Diseño de página web", cantidad 1, precio 1.500,00 €
3. Añadir línea 2: "Sesión de fotos de producto", cantidad 1, precio 500,00 €
4. Activar retención IRPF al 15%
5. **Esperado** (verificar al céntimo):
   - Base imponible: 2.000,00 €
   - IVA (21%): 420,00 €
   - Retención IRPF (15%): −300,00 €
   - **Total: 2.120,00 €**

### V3: Cambio de retención y tipo de cliente (FR-006, CA2, CA3)

1. Con el mismo presupuesto del V2, cambiar retención al 7%
2. **Esperado**: Retención = 140,00 €, Total = 2.280,00 €
3. Cambiar tipo de cliente a "Particular"
4. **Esperado**: Retención se desactiva, Total = 2.420,00 €

### V4: Numeración automática (FR-007, CA4)

1. Guardar el primer presupuesto → cerrar y reabrir la app
2. Crear un segundo presupuesto
3. **Esperado**: El primer presupuesto tiene número 2026-001, el segundo 2026-002

### V5: Descargar PDF (FR-010, FR-012, CA5)

1. Con el presupuesto del V2 (2 líneas), pulsar "Descargar PDF"
2. El servidor genera el PDF y el navegador lo descarga
3. Abrir el PDF descargado
4. **Esperado**: PDF contiene logo (o espacio en blanco), datos del freelancer, datos del cliente, número, fecha, validez, tabla de líneas, desglose completo
5. Intentar descargar PDF con presupuesto de 0 líneas
6. **Esperado**: Se muestra aviso, no se genera PDF

### V6: Editar líneas y recálculo (FR-009, CA6)

1. Con presupuesto abierto, editar la línea 1: cambiar precio a 1.000,00 €
2. **Esperado**: Base = 1.500,00 €, IVA = 315,00 €, Total se recalcula
3. Eliminar línea 2
4. **Esperado**: Base = 1.000,00 €, IVA = 210,00 €, Total se recalcula

### V7: Persistencia (FR-011, CA7)

1. Crear perfil, catálogo y al menos 1 presupuesto
2. Detener el servidor (Ctrl+C)
3. Reiniciar el servidor (`npm run dev`)
4. Abrir `http://localhost:3000`
5. **Esperado**: Perfil, catálogo y presupuestos siguen ahí con todos los datos (persistidos en SQLite)

### V8: Línea manual fuera del catálogo (FR-004, CL2)

1. En formulario de presupuesto, pulsar "Añadir línea manual"
2. Escribir descripción libre, cantidad y precio
3. **Esperado**: La línea se incluye en los cálculos correctamente

### V9: API directa (verificación técnica)

```bash
# Verificar perfil
curl http://localhost:3000/api/profile

# Verificar catálogo
curl http://localhost:3000/api/services

# Verificar presupuestos
curl http://localhost:3000/api/budgets

# Verificar generación de PDF
curl -o test.pdf http://localhost:3000/api/budgets/1/pdf
```

## Running Tests

```bash
# Tests unitarios (cálculos, numeración, formateo)
npm run test

# Tests de integración (API endpoints)
npm run test:integration

# Tests con cobertura
npm run test:coverage
```

## Build para Producción

```bash
npm run build
```

Los archivos estáticos del frontend se optimizan en `dist/public/`. El servidor Express sirve estos archivos en producción.

```bash
# Ejecutar en producción
NODE_ENV=production node src/server.js
```
