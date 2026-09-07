import { describe, it, expect } from 'vitest';
import { validateProfile } from '../../src/utils/validation.js';

const VALID_PROFILE = {
  nombre: 'María García',
  nif: '12345678Z',
  direccion: 'Calle Mayor 1, Madrid',
  telefono: '612 345 678',
  email: 'maria@ejemplo.com',
};

describe('validateProfile', () => {
  it('accepts a complete valid profile', () => {
    expect(validateProfile(VALID_PROFILE)).toBeNull();
  });

  it('accepts an optional valid logo (data URL)', () => {
    const result = validateProfile({ ...VALID_PROFILE, logo: 'data:image/png;base64,abc' });
    expect(result).toBeNull();
  });

  it('rejects a missing required field', () => {
    const { nombre, ...sinNombre } = VALID_PROFILE;
    expect(validateProfile(sinNombre)).toBe('El campo nombre es obligatorio');
  });

  it('rejects an empty required field', () => {
    expect(validateProfile({ ...VALID_PROFILE, telefono: '   ' })).toBe(
      'El campo telefono es obligatorio'
    );
  });

  it('rejects an invalid email format', () => {
    expect(validateProfile({ ...VALID_PROFILE, email: 'no-es-un-email' })).toBe(
      'El email no tiene un formato válido'
    );
  });

  it('rejects a logo that is not a data URL image', () => {
    expect(validateProfile({ ...VALID_PROFILE, logo: 'http://example.com/logo.png' })).toBe(
      'El logo debe ser una imagen en formato data URL'
    );
  });

  it('rejects missing all fields', () => {
    expect(validateProfile({})).toBe('El campo nombre es obligatorio');
  });
});
