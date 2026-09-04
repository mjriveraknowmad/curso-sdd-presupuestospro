# Feature Specification: PresupuestosPro

**Feature Branch**: `001-presupuestos-pdf`

**Created**: 2026-09-04

**Status**: Draft

**Input**: Herramienta web para que freelancers españoles creen presupuestos profesionales con su marca y los descarguen en PDF, sin pelearse con Excel ni con plantillas. Éxito de negocio: emitir un presupuesto correcto y con buena imagen en menos de 5 minutos.

## User Scenarios & Testing

### User Story 1 — Configurar perfil del freelancer (Priority: P1)

Como freelancer, quiero configurar mi nombre, NIF, datos de contacto y logo, para que mis presupuestos salgan con mi marca sin tener que ponerla cada vez.

**Why this priority**: Es la base de todo presupuesto. Sin datos del freelancer, el PDF no puede generar. Es independiente de las demás historias y entrega valor inmediato.

**Independent Test**: Se puede abrir la app, rellenar nombre, NIF, dirección, teléfono, email y subir un logo, cerrar la app, volver a abrirla, y ver que todo sigue ahí.

**Acceptance Scenarios**:

1. **Given** que la app se abre por primera vez, **When** el freelancer rellena nombre, NIF, dirección, teléfono, email y sube un logo, **Then** los datos se guardan y aparecen en la sección de perfil.
2. **Given** que el perfil ya tiene datos, **When** el freelancer modifica cualquiera de ellos, **Then** los cambios se guardan y se reflejan en los presupuestos existentes y futuros.
3. **Given** que el freelancer sube un logo, **When** vuelve a abrir la app, **Then** el logo sigue disponible.

---

### User Story 2 — Mantener catálogo de servicios (Priority: P2)

Como freelancer, quiero mantener un catálogo de mis servicios con un precio por defecto cada uno, para no reescribir lo mismo en cada presupuesto.

**Why this priority**: Ahorra tiempo real en cada presupuesto. Es independiente del perfil y de la creación de presupuestos.

**Independent Test**: Se pueden añadir, editar y eliminar servicios del catálogo, y al cerrar y abrir la app, los cambios persisten.

**Acceptance Scenarios**:

1. **Given** que el freelancer está en el catálogo, **When** añade un servicio con nombre y precio, **Then** el servicio aparece en la lista.
2. **Given** que existe un servicio en el catálogo, **When** el freelancer lo edita (cambia nombre o precio), **Then** los cambios se guardan.
3. **Given** que existe un servicio en el catálogo, **When** el freelancer lo elimina, **Then** el servicio desaparece de la lista y no afecta a presupuestos ya generados.
4. **Given** que el freelancer cierra y reabre la app, **When** accede al catálogo, **Then** todos los servicios siguen ahí con sus precios.

---

### User Story 3 — Crear presupuesto con líneas y cálculo automático (Priority: P3)

Como freelancer, quiero crear un presupuesto indicando los datos del cliente y su tipo (empresa/autónomo o particular), añadir líneas (de mi catálogo o escritas a mano), y que la base imponible, el IVA, la retención de IRPF y el total se calculen solos.

**Why this priority**: Es el核心 de la app. Sin esta historia, no hay producto. Depende de P1 (perfil) para los datos del emisor.

**Independent Test**: Se puede crear un presupuesto completo con el ejemplo de referencia (base 2.000 €, IVA 21%, retención 15%) y verificar que el total es exactamente 2.120,00 €.

**Acceptance Scenarios**:

1. **Given** que el freelancer crea un nuevo presupuesto, **When** añade las líneas "Diseño de página web" (1.500 €) y "Sesión de fotos de producto" (500 €), **Then** la base imponible es 2.000,00 €, el IVA (21%) es 420,00 €, la retención (15%) es 300,00 €, y el total es 2.120,00 €.
2. **Given** que el mismo presupuesto tiene retención del 7%, **When** se cambia el porcentaje, **Then** la retención es 140,00 € y el total es 2.280,00 €.
3. **Given** que el cliente es "particular", **When** se marca como tal, **Then** la retención de IRPF no se aplica y el total es 2.420,00 € (misma base de ejemplo).
4. **Given** que se añade una línea escrita a mano (fuera del catálogo), **When** se rellena descripción, cantidad y precio unitario, **Then** la línea se incluye en los cálculos.
5. **Given** que se edita o elimina una línea del presupuesto, **When** se confirma el cambio, **Then** los totales se recalculan automáticamente.
6. **Given** que el freelancer guarda el presupuesto y cierra la app, **When** vuelve a abrirla, **Then** el presupuesto sigue ahí con todas sus líneas.

---

### User Story 4 — Numeración y fechas automáticas (Priority: P4)

Como freelancer, quiero que los presupuestos se numeren automáticamente con formato AAAA-NNN (por ejemplo, 2026-001) y que muestren la fecha de emisión y una validez de 30 días, para que todo sea profesional sin que yo tenga que llevar la cuenta.

**Why this priority**: Es parte de la credibilidad del documento. Se integra directamente en la creación de presupuestos.

**Independent Test**: Crear dos presupuestos en el mismo año y verificar que el segundo recibe el número siguiente.

**Acceptance Scenarios**:

1. **Given** que es el primer presupuesto del año 2026, **When** se crea, **Then** su número es 2026-001.
2. **Given** que ya existe el presupuesto 2026-001, **When** se crea otro en 2026, **Then** su número es 2026-002.
3. **Given** que se crea un presupuesto, **When** se mira la fecha, **Then** muestra la fecha de emisión del día actual y una validez de 30 días desde esa fecha.

---

### User Story 5 — Descargar PDF profesional (Priority: P5)

Como freelancer, quiero descargar el presupuesto como PDF con mi logo, número, fecha, validez y desglose completo, para enviárselo al cliente con buena imagen.

**Why this priority**: Es el entregable final. Sin PDF, la app no cumple su propósito. Depende de todas las demás historias.

**Independent Test**: Generar un PDF con el ejemplo de referencia y verificar que contiene logo, número, fecha, validez, tabla de líneas y desglose (base, IVA, retención, total).

**Acceptance Scenarios**:

1. **Given** que un presupuesto tiene al menos una línea, **When** el freelancer pulsa "Descargar PDF", **Then** se genera y descarga un PDF con todos los datos.
2. **Given** que el PDF se genera, **When** se abre, **Then** muestra el logo del freelancer, sus datos, los datos del cliente, el número, la fecha de emisión, la validez, la tabla de líneas y el desglose de base, IVA, retención (si aplica) y total.
3. **Given** que un presupuesto no tiene ninguna línea, **When** el freelancer intenta descargar el PDF, **Then** se muestra un aviso indicando que es necesario añadir al menos una línea.

---

### Edge Cases

- **Presupuesto sin líneas**: No se genera el PDF; se muestra un aviso al freelancer.
- **Línea escrita a mano, fuera del catálogo**: Se permite. No todo encargo está catalogado.
- **Cliente particular con retención activada por error**: La retención no se aplica en ningún caso. Manda el tipo de cliente.
- **Logo no proporcionado**: El PDF muestra un espacio en blanco donde iría el logo. No se muestra placeholder ni se omite la zona; se reserva el espacio para mantener el layout consistente.
- **Datos del freelancer incompletos al crear presupuesto**: No se permite crear presupuestos sin perfil completo. El sistema obliga a configurar nombre, NIF, dirección, teléfono y email antes de poder crear el primer presupuesto.
- **Primera vez que se abre la app**: Se muestra un asistente paso a paso: primero configurar el perfil, luego el catálogo de servicios, y finalmente crear el primer presupuesto. El freelancer puede saltar el catálogo si lo desea.
- **Base de datos SQLite llena o no disponible (disco lleno, permisos, corrupción)**: Se muestra un mensaje de error claro cuando falla una operación de guardado. No hay mecanismo de recuperación automática ni copia de seguridad en esta versión.

## Requirements

### Functional Requirements

- **FR-001**: El sistema debe permitir guardar y editar el perfil del freelancer: nombre, NIF, dirección, teléfono, email y logo.
- **FR-002**: El sistema debe permitir crear, editar y eliminar servicios del catálogo, cada uno con nombre y precio por defecto.
- **FR-003**: El sistema debe permitir crear un presupuesto indicando los datos del cliente (nombre, NIF/cIF si aplica, dirección, email) y su tipo: empresa/autónomo o particular.
- **FR-004**: Cada línea del presupuesto debe poder venir del catálogo o escribirse a mano, con descripción, cantidad y precio unitario.
- **FR-005**: El sistema debe calcular automáticamente, en cada presupuesto:
  - Base imponible = suma de (cantidad × precio unitario) de todas las líneas.
  - IVA = base imponible × 21% (tipo general de servicios profesionales en España).
  - Retención de IRPF (si el freelancer la activa) = base imponible × 15% o × 7%, según elija.
  - Total = base imponible + IVA − retención de IRPF.
  - Redondeo: se aplica redondeo estándar (≥0,5 redondea arriba, <0,5 redondea abajo) una sola vez en el resultado final de cada importe (base, IVA, retención y total), sin redondeos intermedios por línea.
- **FR-006**: Si el cliente es "particular", la retención de IRPF no se aplica en ningún caso, independientemente de la configuración del freelancer.
- **FR-007**: El sistema debe numerar los presupuestos automáticamente con el formato AAAA-NNN (por ejemplo, 2026-001), reiniciando el contador cada año.
- **FR-008**: El presupuesto debe mostrar la fecha de emisión y una validez de 30 días desde esa fecha.
- **FR-009**: El sistema debe permitir editar o eliminar cualquier línea del presupuesto en cualquier momento, incluso después de haber descargado el PDF, recalculando los totales automáticamente. El PDF generado es un snapshot del momento de la descarga.
- **FR-010**: El sistema debe generar un PDF con el logo, los datos del freelancer y del cliente, el número, las fechas, la tabla de líneas y el desglose de base, IVA, retención y total.
- **FR-011**: Cuando el freelancer vuelva a abrir la aplicación, su perfil, su catálogo y sus presupuestos deben seguir ahí (persistencia local).
- **FR-012**: El sistema debe impedir la generación de PDF si el presupuesto no tiene ninguna línea, mostrando un aviso al freelancer.
- **FR-013**: El sistema debe mostrar un asistente de configuración paso a paso la primera vez que se abre la app: perfil del freelancer, catálogo de servicios y creación del primer presupuesto. El freelancer puede saltar el paso del catálogo.
- **FR-014**: El sistema debe impedir la creación de presupuestos hasta que el perfil del freelancer esté completo (nombre, NIF, dirección, teléfono y email).
- **FR-015**: Si el freelancer no ha subido logo, el PDF debe mostrar un espacio en blanco reservado donde iría el logo, manteniendo el layout del documento.
- **FR-016**: Si una operación de guardado en la base de datos SQLite local falla (disco lleno, permisos, corrupción), el sistema debe mostrar un mensaje de error claro y comprensible al freelancer. No se ofrece mecanismo de recuperación automática en esta versión.

### Key Entities

- **Freelancer**: Nombre, NIF, dirección, teléfono, email, logo. Datos que aparecen en todos los presupuestos emitidos.
- **Servicio (catálogo)**: Nombre y precio por defecto. Se reutiliza al crear líneas de presupuesto.
- **Cliente**: Nombre, identificador fiscal (NIF/CIF), dirección, email, tipo (empresa/autónomo o particular). El tipo determina si se aplica retención de IRPF.
- **Presupuesto**: Número (AAAA-NNN), fecha de emisión, validez (30 días), cliente asociado, líneas, base imponible, IVA, retención de IRPF, total, y si está activa la retención. No tiene estado de "finalizado"; el presupuesto permanece editable tras descargar el PDF.
- **Línea de presupuesto**: Descripción, cantidad, precio unitario. Puede provenir del catálogo o ser libre.

## Success Criteria

### Measurable Outcomes

- **SC-001**: El freelancer puede crear un presupuesto completo (con perfil configurado y logo) en menos de 5 minutos.
- **SC-002**: Los cálculos de base, IVA, retención y total son exactos al céntimo con el ejemplo de referencia (base 2.000 € → total 2.120,00 € con retención 15%, 2.280,00 € con retención 7%, 2.420,00 € sin retención), aplicando redondeo estándar en cada importe final.
- **SC-003**: Al cambiar el tipo de cliente entre empresa/autónomo y particular, el total se recalcula correctamente y se refleja en menos de 1 segundo.
- **SC-004**: El PDF generado contiene todos los campos requeridos (logo, datos, número, fechas, tabla, desglose) y es visualmente profesional.
- **SC-005**: Al cerrar y reabrir la aplicación, el 100% de los datos (perfil, catálogo, presupuestos) persisten correctamente.
- **SC-006**: Un usuario no técnico puede completar el flujo completo (configurar perfil → crear catálogo → generar presupuesto → descargar PDF) sin necesitar ayuda externa.

## Clarifications

### Session 2026-09-04

- Q: How should the application round financial amounts when the result has more than 2 decimal places? → A: Standard banking round (≥0.5 up, <0.5 down), applied once at the final total step.
- Q: Can a freelancer edit or add lines to a budget after they have already downloaded its PDF? → A: Yes, the budget stays editable. The PDF is a point-in-time snapshot; no concept of "finalized" status in v0.
- Q: What should the application do when browser local storage is full or unavailable? → A: Show a clear error message when a save fails due to storage limits. No automatic backup or recovery mechanism in v0.

## Assumptions

- La aplicación se ejecuta en un navegador web moderno en el ordenador del freelancer.
- Los datos se almacenan en un servidor local Node.js + Express con base de datos SQLite (archivo `.db` en el ordenador del freelancer). No hay servidor remoto ni sincronización en la nube.
- El IVA es siempre el 21% (tipo general de servicios profesionales en España). No es editable en esta versión.
- La retención de IRPF solo tiene dos opciones: 15% (general) o 7% (nuevos autónomos). El freelancer elige cuál usar, pero la aplicación no valida si le corresponde uno u otro.
- La numeración de presupuestos se reinicia cada 1 de enero automáticamente.
- La validez de 30 días es fija y no es editable.
- El freelancer configura una única dirección fiscal. No se soportan múltiples direcciones o sedes.
- Solo se soporta la moneda euro (€). No hay multidivisa.
- El logo se almacena como imagen (data URL base64) en la base de datos SQLite local.
- Los presupuestos ya generados no se borran automáticamente. El freelancer gestiona su historial manualmente.
