import { jsPDF } from 'jspdf';
import { formatCurrency, formatDate } from '../utils/formatting.js';

const MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_GAP = 6;

function normalizeBreaks(value) {
  return value ? String(value) : '';
}

export function generateBudgetPdf({ budget, profile }) {
  const doc = new jsPDF();

  let y = MARGIN;

  // Header: logo (or blank space) on the left
  const logoBoxSize = 24;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  if (profile.logo) {
    try {
      doc.addImage(profile.logo, undefined, MARGIN, y, logoBoxSize, logoBoxSize);
    } catch {
      doc.rect(MARGIN, y, logoBoxSize, logoBoxSize);
    }
  } else {
    // FR-015: reserve blank space for the logo to keep layout consistent
    doc.rect(MARGIN, y, logoBoxSize, logoBoxSize);
  }

  // Freelancer data on the right
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(normalizeBreaks(profile.nombre), MARGIN + logoBoxSize + 8, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const freelancerLines = [
    `NIF: ${normalizeBreaks(profile.nif)}`,
    normalizeBreaks(profile.direccion),
    `Tel: ${normalizeBreaks(profile.telefono)}  ·  ${normalizeBreaks(profile.email)}`,
  ];
  freelancerLines.forEach((line, i) => {
    doc.text(line, MARGIN + logoBoxSize + 8, y + 12 + i * 5);
  });

  y = MARGIN + logoBoxSize + 10;

  // Title + numero + fechas
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESUPUESTO', MARGIN, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nº ${budget.numero}`, PAGE_WIDTH - MARGIN, y + 8, { align: 'right' });
  doc.text(`Fecha de emisión: ${formatDate(budget.fecha_emision)}`, PAGE_WIDTH - MARGIN, y + 14, {
    align: 'right',
  });
  doc.text(`Validez: ${formatDate(budget.fecha_validez)} (30 días)`, PAGE_WIDTH - MARGIN, y + 20, {
    align: 'right',
  });

  y += 30;

  // Client data
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del cliente', MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += 7;
  const tipo = budget.cliente_tipo === 'particular' ? 'Particular' : 'Empresa / Autónomo';
  const clientLines = [
    budget.cliente_nombre,
    ...(budget.cliente_nif_cif ? [`NIF/CIF: ${budget.cliente_nif_cif}`] : []),
    ...(budget.cliente_direccion ? [budget.cliente_direccion] : []),
    ...(budget.cliente_email ? [budget.cliente_email] : []),
    `Tipo: ${tipo}`,
  ];
  clientLines.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += 5;
  });

  y += 8;

  // Lines table
  const cols = {
    descripcion: MARGIN,
    cantidad: MARGIN + 110,
    precio: MARGIN + 135,
    subtotal: PAGE_WIDTH - MARGIN,
  };

  function drawHeaderRow(yy) {
    doc.setFillColor(240, 240, 240);
    doc.rect(MARGIN, yy - 5, CONTENT_WIDTH, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Descripción', cols.descripcion, yy);
    doc.text('Cantidad', cols.cantidad, yy);
    doc.text('Precio (€)', cols.precio, yy);
    doc.text('Subtotal', cols.subtotal, yy, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  }

  drawHeaderRow(y);

  y += 8;
  const lines = budget.lineas || [];
  doc.setFontSize(9);
  lines.forEach((line) => {
    const subtotal = line.cantidad * line.precio_unitario;
    doc.text(normalizeBreaks(line.descripcion), cols.descripcion, y);
    doc.text(String(line.cantidad), cols.cantidad, y);
    doc.text(formatCurrency(line.precio_unitario), cols.precio, y);
    doc.text(formatCurrency(subtotal), cols.subtotal, y, { align: 'right' });
    y += LINE_GAP;
  });

  y += 6;

  // Breakdown
  doc.setFontSize(10);
  const breakdownItems = [
    ['Base imponible', budget.base_imponible],
    ['IVA (21%)', budget.iva],
  ];
  if (budget.retencion_irpf > 0) {
    breakdownItems.push(['Retención IRPF', -Math.abs(budget.retencion_irpf)]);
  }
  breakdownItems.forEach(([label, value]) => {
    doc.text(label, cols.descripcion, y);
    doc.text(formatCurrency(value), cols.subtotal, y, { align: 'right' });
    y += LINE_GAP;
  });

  y += 2;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 90, y, PAGE_WIDTH - MARGIN, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL', cols.descripcion, y);
  doc.text(formatCurrency(budget.total), cols.subtotal, y, { align: 'right' });

  return Buffer.from(doc.output('arraybuffer'));
}
