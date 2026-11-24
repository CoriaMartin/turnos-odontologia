import { useEffect, useRef, type KeyboardEvent } from 'react';

const SELECTOR_FOQUEABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function useDialogo<T extends HTMLElement = HTMLDivElement>(alCerrar: () => void) {
  const referencia = useRef<T>(null);

  useEffect(() => {
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    referencia.current?.focus();
    return () => anterior?.focus();
  }, []);

  const alPulsarTecla = (evento: KeyboardEvent<T>) => {
    if (evento.key === 'Escape') {
      evento.stopPropagation();
      alCerrar();
      return;
    }

    if (evento.key !== 'Tab' || !referencia.current) return;
    const focables = Array.from(referencia.current.querySelectorAll<HTMLElement>(SELECTOR_FOQUEABLE));
    const primero = focables[0];
    const ultimo = focables[focables.length - 1];
    if (!primero || !ultimo) return;

    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  };

  return { referencia, alPulsarTecla };
}
