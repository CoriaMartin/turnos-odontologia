import brandJs from '@design-system/brand.js?raw';
import { describe, expect, it } from 'vitest';
import { BRAND_NAME } from './brand';

function nombreEnBrandJs(texto: string): string | undefined {
  return /const\s+BRAND_NAME\s*=\s*"([^"]*)"/.exec(texto)?.[1];
}

describe('Marca sincronizada con design-system/brand.js', () => {
  it('BRAND_NAME coincide con el de design-system/brand.js', () => {
    expect(nombreEnBrandJs(brandJs)).toBe(BRAND_NAME);
  });

  it('detecta un cambio hecho en un solo lado', () => {
    const renombradoSoloEnBrandJs = 'const BRAND_NAME = "Otro nombre";';
    expect(nombreEnBrandJs(renombradoSoloEnBrandJs)).not.toBe(BRAND_NAME);
  });

  it('el nombre es "Agenda de Odontología"', () => {
    expect(BRAND_NAME).toBe('Agenda de Odontología');
  });
});
