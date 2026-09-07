const IVA_PERCENT = 21;

export function round2(value) {
  return Math.round(value * 100) / 100;
}

export function calculateLineSubtotal(cantidad, precioUnitario) {
  return round2(cantidad * precioUnitario);
}

export function calculateBudgetTotals(lines, clienteTipo, activarRetencion, porcentajeIrpf) {
  const baseImponible = round2(
    lines.reduce((sum, line) => sum + line.cantidad * line.precio_unitario, 0)
  );

  const iva = round2((baseImponible * IVA_PERCENT) / 100);

  const esParticular = clienteTipo === 'particular';
  const aplicaRetencion = !esParticular && activarRetencion === true;
  const porcentaje = aplicaRetencion ? Number(porcentajeIrpf) || 0 : 0;
  const retencionIrpf = aplicaRetencion ? round2((baseImponible * porcentaje) / 100) : 0;

  const total = round2(baseImponible + iva - retencionIrpf);

  return { baseImponible, iva, retencionIrpf, total };
}
