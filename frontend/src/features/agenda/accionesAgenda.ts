import { createContext, useContext } from 'react';
import type { FechaCivil } from './fechas';
import type { TurnoAgenda } from './tipos';

/**
 * Puntos de entrada de C-17 en las vistas de C-16 (activar un turno, activar una franja libre).
 * Sin proveedor, las vistas se muestran como en C-16: solo lectura.
 */
export interface AccionesAgenda {
  ahora: Date;
  abrirTurno: (turno: TurnoAgenda) => void;
  nuevoTurnoEn: (fecha: FechaCivil, minutos: number) => void;
}

export const AccionesAgendaContexto = createContext<AccionesAgenda | null>(null);

export function useAccionesAgenda(): AccionesAgenda | null {
  return useContext(AccionesAgendaContexto);
}
