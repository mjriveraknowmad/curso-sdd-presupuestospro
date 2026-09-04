<!-- Sync Impact Report
  - Version change: (sin versión previa) -> 1.0.0
  - Modified principles: N/A (adopción inicial)
  - Added sections: Core Principles (5 principios), Idioma y Mercado, Privacidad de Datos, Governance
  - Removed sections: N/A
  - Follow-up TODOs: ninguno
-->

# PresupuestosPro Constitution

## Core Principles

### I. Simplicidad ante todo
Ante dos soluciones de igual alcance, se elige siempre la más simple. Es una versión 1:
no se añade complejidad anticipada. Toda complejidad debe estar justificada por el
presente o por una necesidad inmediata y verificable, no por especulación futura (YAGNI).

### II. Idioma y mercado
Todo el producto se entrega en español de España. La moneda única admitida es el euro.
No se soportan otros idiomas, locales ni monedas en esta versión.

### III. Cero alcance fantasma
Queda PROHIBIDO implementar cualquier funcionalidad que no esté escrita en la spec.
Si durante el desarrollo surge una idea nueva, se documenta y se propone; no se construye
sin pasar antes por el proceso de especificación y aprobación.

### IV. Verificable por una persona no técnica
Cada criterio de éxito debe poder comprobarse usando la aplicación, sin leer código.
Todo criterio debe formularse como una acción observable (p. ej. "el botón X muestra Y")
que cualquier persona pueda ejecutar y confirmar.

### V. Datos del usuario con respeto
Se pide al usuario solo la información imprescindible para la función solicitada. No se
introducen claves ni secretos en el código. No se almacenan, registran ni exponen datos
personales o financieros más allá de lo necesario.

## Alemance

Esta versión cubre la generación de presupuestos en PDF para freelancers. Cualquier otro
flujo (facturación, contabilidad, facturas electrónicas, etc.) queda fuera del alcance de
esta versión y requiere una nueva spec.

## Privacidad de Datos

Solo se recogen los datos necesarios para crear un presupuesto (datos del freelancer, del
cliente, partidas y precios). No se piden credenciales, ni se generan ni guardan claves o
secretos en el código fuente. Los datos no utilizados deben descartarse.

## Governance

Esta constitución prevalece sobre cualquier otra práctica del proyecto. Toda enmienda
debe documentarse aquí, seguir las normas de versionado y registrar su motivo.

- **Procedimiento de enmienda**: proponer el cambio, registrar la justificación y actualizar
  este documento antes de aplicar cambios de desarrollo derivados.
- **Política de versionado**: se sigue SemVer (MAJOR.MINOR.PATCH). MAJOR si se elimina o
  redefine un principio; MINOR si se añade un principio o se amplía materialmente una
  sección; PATCH para aclaraciones, redacción o correcciones no semánticas.
- **Revisión de cumplimiento**: cada tarea o revisión debe comprobar que el trabajo respeta
  los 5 principios; cualquier desviación se documenta y justifica.
- Todo criterio de éxito debe ser comprobable por una persona no técnica mediante la app.

**Version**: 1.0.0 | **Ratified**: 2026-09-04 | **Last Amended**: 2026-09-04
