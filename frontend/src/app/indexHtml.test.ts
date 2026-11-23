import indexHtml from '../../index.html?raw';
import { describe, expect, it } from 'vitest';

describe('web-app-shell · Idioma y estilos del sistema de diseño', () => {
  it('Idioma del documento: index.html declara lang="es-AR"', () => {
    const documento = new DOMParser().parseFromString(indexHtml, 'text/html');
    expect(documento.documentElement.getAttribute('lang')).toBe('es-AR');
  });
});
