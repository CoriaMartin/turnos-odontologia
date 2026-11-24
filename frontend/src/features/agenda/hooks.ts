import { useEffect, useState, useSyncExternalStore } from 'react';

const MS_POR_MINUTO = 60_000;

/** Hora actual, actualizada al comienzo de cada minuto (línea de hora actual, design.md D7). */
export function useAhora(): Date {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout>;
    const programar = () => {
      const hastaElProximoMinuto = MS_POR_MINUTO - (Date.now() % MS_POR_MINUTO);
      temporizador = setTimeout(() => {
        setAhora(new Date());
        programar();
      }, hastaElProximoMinuto);
    };
    programar();
    return () => clearTimeout(temporizador);
  }, []);

  return ahora;
}

/** Mismo punto de quiebre que el layout (AppLayout.module.css) y la maqueta. */
export const CONSULTA_PANTALLA_ANCHA = '(min-width: 900px)';

function hayMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function suscribirAncho(avisar: () => void): () => void {
  if (!hayMatchMedia()) return () => undefined;
  const consulta = window.matchMedia(CONSULTA_PANTALLA_ANCHA);
  consulta.addEventListener('change', avisar);
  return () => consulta.removeEventListener('change', avisar);
}

function leerAncho(): boolean {
  return hayMatchMedia() && window.matchMedia(CONSULTA_PANTALLA_ANCHA).matches;
}

/**
 * `true` en pantallas de 900 px o más. Se decide en JS y no con CSS para no duplicar los turnos en el
 * DOM entre la cuadrícula y la lista (design.md D11). Sin `matchMedia` se asume pantalla angosta.
 */
export function usePantallaAncha(): boolean {
  return useSyncExternalStore(suscribirAncho, leerAncho, () => false);
}
