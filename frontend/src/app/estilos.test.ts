import { describe, expect, it } from 'vitest';
import cssGestion from '../features/agenda/Gestion.module.css?raw';
import cssConfiguracion from '../features/configuracion/ConfiguracionPage.module.css?raw';
import cssPacientes from '../features/pacientes/Pacientes.module.css?raw';
import cssPrestaciones from '../features/prestaciones/Prestaciones.module.css?raw';
import './estilos';

function reglasDelDocumento(): string {
  return Array.from(document.styleSheets)
    .flatMap((hoja) => {
      try {
        return Array.from(hoja.cssRules);
      } catch {
        return [];
      }
    })
    .map((regla) => regla.cssText)
    .join('\n');
}

function sinMedia(css: string): string {
  let profundidad = 0;
  return css
    .split('\n')
    .filter((linea) => {
      if (linea.includes('@media')) {
        profundidad = 1;
        return false;
      }
      if (profundidad > 0) {
        profundidad += (linea.match(/\{/g)?.length ?? 0) - (linea.match(/\}/g)?.length ?? 0);
        return false;
      }
      return true;
    })
    .join('\n');
}

describe('web-app-shell · Idioma y estilos del sistema de diseño', () => {
  it('Variables del sistema de diseño disponibles: --color-brand-600 está definida en el documento', () => {
    expect(reglasDelDocumento()).toMatch(/--color-brand-600:\s*#0f766e/i);
  });

  it.each([
    ['prestaciones', cssPrestaciones],
    ['pacientes', cssPacientes],
    ['gestión de turnos (C-17)', cssGestion],
    ['configuración de recordatorios (C-18)', cssConfiguracion],
  ])('%s usa sólo variables del sistema de diseño (D9)', (_nombre, css) => {
    const contenido = sinMedia(css);
    expect(contenido).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(contenido).not.toMatch(/\b(?:rgb|rgba|hsl|hsla)\(/i);
    expect(contenido).not.toMatch(/\b\d+(?:\.\d+)?px\b/);
  });
});
