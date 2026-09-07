import { isValidEmail } from './formatting.js';

export function validateProfile(body) {
  const required = ['nombre', 'nif', 'direccion', 'telefono', 'email'];
  for (const field of required) {
    const value = body[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      return `El campo ${field} es obligatorio`;
    }
  }
  if (!isValidEmail(body.email)) {
    return 'El email no tiene un formato válido';
  }
  if (body.logo !== undefined && body.logo !== null && body.logo !== '' && !body.logo.startsWith('data:image/')) {
    return 'El logo debe ser una imagen en formato data URL';
  }
  return null;
}

export function validateService(body) {
  if (body.nombre === undefined || String(body.nombre).trim() === '') {
    return 'El nombre del servicio es obligatorio';
  }
  const precio = Number(body.precio);
  if (body.precio === undefined || Number.isNaN(precio) || precio <= 0) {
    return 'El precio debe ser un número mayor que 0';
  }
  if (Math.round(precio * 100) !== precio * 100) {
    return 'El precio admite un máximo de 2 decimales';
  }
  return null;
}

export function validateClient(body) {
  if (body.nombre === undefined || String(body.nombre).trim() === '') {
    return 'El nombre del cliente es obligatorio';
  }
  if (body.tipo !== 'empresa' && body.tipo !== 'particular') {
    return 'El tipo de cliente debe ser empresa o particular';
  }
  if (body.email && !isValidEmail(body.email)) {
    return 'El email del cliente no tiene un formato válido';
  }
  return null;
}

export function validateLine(line) {
  if (line.descripcion === undefined || String(line.descripcion).trim() === '') {
    return 'La descripción de la línea es obligatoria';
  }
  const cantidad = Number(line.cantidad);
  if (Number.isNaN(cantidad) || cantidad <= 0) {
    return 'La cantidad debe ser un número mayor que 0';
  }
  const precio = Number(line.precio_unitario);
  if (Number.isNaN(precio) || precio < 0) {
    return 'El precio unitario debe ser un número mayor o igual que 0';
  }
  return null;
}
