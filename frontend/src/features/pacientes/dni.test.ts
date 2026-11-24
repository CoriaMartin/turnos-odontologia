import { describe, expect, it } from 'vitest';
import { formatearDni, soloDigitos } from './dni';

describe('pacientes/dni', () => {
  it('DNI escrito con puntos', () => {
    expect(formatearDni('32112334')).toBe('32.112.334');
    expect(formatearDni('30123456')).toBe('30.123.456');
    expect(formatearDni('1234567')).toBe('1.234.567');
  });

  it('soloDigitos quita puntos, espacios y guiones', () => {
    expect(soloDigitos('32.112.334')).toBe('32112334');
    expect(soloDigitos('30 123 456')).toBe('30123456');
    expect(soloDigitos('30-123-456')).toBe('30123456');
  });

  it('un DNI incompleto se muestra sin puntos', () => {
    expect(formatearDni('123')).toBe('123');
  });
});
