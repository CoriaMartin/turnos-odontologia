import { vi } from 'vitest';
import type { TurnoAgenda } from '../features/agenda/tipos';
import { renderConRutas } from './renderConRutas';

/** Utilidades de test de la agenda (C-16): reloj fijo, ancho de pantalla y API simulada. */

/** 2026-12-02 (miércoles) a las 10:00 en Buenos Aires. */
export const AHORA_POR_DEFECTO = '2026-12-02T13:00:00Z';

/** Fija la fecha del sistema sin tocar los temporizadores (las esperas de Testing Library siguen andando). */
export function fijarAhora(instante = AHORA_POR_DEFECTO): void {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(instante));
}

/** jsdom no trae `matchMedia`: lo simula para un ancho de pantalla fijo. */
export function simularAnchoDePantalla(ancho: number): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (consulta: string) => {
      const minimo = Number(/min-width:\s*(\d+)px/.exec(consulta)?.[1] ?? 0);
      return {
        matches: ancho >= minimo,
        media: consulta,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      };
    },
  });
}

export function quitarSimulacionDeAncho(): void {
  Reflect.deleteProperty(window, 'matchMedia');
}

export function respuestaJson(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json' },
  });
}

type Respuesta = TurnoAgenda[] | (() => Promise<Response>);

/**
 * Simula `fetch`: para `GET /turnos` responde según el `desde` pedido (por defecto, lista vacía).
 * Devuelve el mock para revisar las solicitudes.
 */
export function simularApiAgenda(porDesde: Record<string, Respuesta> = {}) {
  const fetchSimulado = vi.fn<typeof fetch>((entrada) => {
    const url = new URL(String(entrada));
    const respuesta = porDesde[url.searchParams.get('desde') ?? ''] ?? [];
    return typeof respuesta === 'function' ? respuesta() : Promise.resolve(respuestaJson(respuesta));
  });
  vi.stubGlobal('fetch', fetchSimulado);
  vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api');
  return fetchSimulado;
}

/** Parámetros `desde`/`hasta` de cada solicitud a `/turnos`. */
export function periodosPedidos(fetchSimulado: ReturnType<typeof simularApiAgenda>) {
  return fetchSimulado.mock.calls
    .map(([entrada]) => new URL(String(entrada)))
    .filter((url) => url.pathname.endsWith('/turnos'))
    .map((url) => ({ desde: url.searchParams.get('desde'), hasta: url.searchParams.get('hasta') }));
}

export function abrirAgenda(ruta = '/') {
  return renderConRutas(ruta, { conSesion: true });
}
