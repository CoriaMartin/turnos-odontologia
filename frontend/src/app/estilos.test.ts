import { describe, expect, it } from 'vitest';
import './estilos';

function reglasDelDocumento(): string {
  return Array.from(document.styleSheets)
    .flatMap((hoja) => Array.from(hoja.cssRules))
    .map((regla) => regla.cssText)
    .join('\n');
}

describe('web-app-shell · Idioma y estilos del sistema de diseño', () => {
  it('Variables del sistema de diseño disponibles: --color-brand-600 está definida en el documento', () => {
    expect(reglasDelDocumento()).toMatch(/--color-brand-600:\s*#0f766e/i);
  });
});
