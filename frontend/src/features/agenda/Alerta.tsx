import type { ReactNode } from 'react';
import estilos from './Gestion.module.css';

type Tipo = 'error' | 'exito' | 'info';

const CLASE: Readonly<Record<Tipo, string | undefined>> = {
  error: estilos.alertaError,
  exito: estilos.alertaExito,
  info: estilos.alertaInfo,
};

/** Íconos de la maqueta (avisos.html, cancelar.html). */
const ICONO: Readonly<Record<Tipo, string>> = {
  error: 'M10 2a8 8 0 100 16 8 8 0 000-16zm-.9 4h1.8v5.2H9.1V6zm0 6.6h1.8v1.8H9.1v-1.8z',
  exito: 'M10 2a8 8 0 100 16 8 8 0 000-16zm-1 11.4L5.6 10l1.3-1.3L9 10.8l4.1-4.1 1.3 1.3L9 13.4z',
  info: 'M10 2a8 8 0 100 16 8 8 0 000-16zm.9 12H9.1V8.8h1.8V14zm0-6.6H9.1V5.6h1.8v1.8z',
};

interface Props {
  tipo: Tipo;
  titulo?: string | undefined;
  children: ReactNode;
  /** `alert` para errores y avisos previos; sin rol cuando va dentro de una región `status`. */
  rol?: 'alert' | undefined;
}

export function Alerta({ tipo, titulo, children, rol }: Props) {
  return (
    <div className={`${estilos.alerta} ${CLASE[tipo] ?? ''}`} role={rol}>
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d={ICONO[tipo]} />
      </svg>
      <div>
        {titulo && <b>{titulo} </b>}
        <span>{children}</span>
      </div>
    </div>
  );
}
