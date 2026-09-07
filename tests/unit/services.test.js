import { describe, it, expect } from 'vitest';
import { validateService } from '../../src/utils/validation.js';

describe('validateService', () => {
  it('accepts a valid service', () => {
    expect(validateService({ nombre: 'Diseño web', precio: 1500 })).toBeNull();
  });

  it('accepts a precio with 2 decimals', () => {
    expect(validateService({ nombre: 'Sesión de fotos', precio: 500.5 })).toBeNull();
  });

  it('rejects a missing nombre', () => {
    expect(validateService({ precio: 100 })).toBe('El nombre del servicio es obligatorio');
  });

  it('rejects an empty nombre', () => {
    expect(validateService({ nombre: '   ', precio: 100 })).toBe(
      'El nombre del servicio es obligatorio'
    );
  });

  it('rejects a missing precio', () => {
    expect(validateService({ nombre: 'Servicio' })).toBe(
      'El precio debe ser un número mayor que 0'
    );
  });

  it('rejects a precio <= 0', () => {
    expect(validateService({ nombre: 'Servicio', precio: 0 })).toBe(
      'El precio debe ser un número mayor que 0'
    );
    expect(validateService({ nombre: 'Servicio', precio: -5 })).toBe(
      'El precio debe ser un número mayor que 0'
    );
  });

  it('rejects a non-numeric precio', () => {
    expect(validateService({ nombre: 'Servicio', precio: 'abc' })).toBe(
      'El precio debe ser un número mayor que 0'
    );
  });

  it('rejects a precio with more than 2 decimals', () => {
    expect(validateService({ nombre: 'Servicio', precio: 10.123 })).toBe(
      'El precio admite un máximo de 2 decimales'
    );
  });
});
