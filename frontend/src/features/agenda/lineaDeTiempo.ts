import { enConsultorio, type FechaCivil } from './fechas';
import type { EstadoTurno, TurnoAgenda } from './tipos';

/** Ubicación de los turnos en la línea de tiempo (design.md D5). Todo se mide en minutos o en franjas. */

export const MINUTOS_POR_FRANJA = 30;
export const INICIO_HABITUAL = 8 * 60;
export const FIN_HABITUAL = 20 * 60;
const MINUTOS_POR_DIA = 24 * 60;

export interface Rango {
  /** Minutos desde la medianoche, múltiplos de 30. */
  inicio: number;
  fin: number;
}

export interface Tramo {
  turno: TurnoAgenda;
  /** Minutos desde la medianoche del día visible, recortados a ese día. */
  inicio: number;
  fin: number;
}

export interface Posicion {
  /** En franjas desde el inicio del rango. */
  top: number;
  alto: number;
}

const ESTADOS_CANCELADOS: ReadonlySet<EstadoTurno> = new Set(['CANCELADO', 'CANCELADO_TARDIO']);

export function esCancelado(turno: TurnoAgenda): boolean {
  return ESTADOS_CANCELADOS.has(turno.estado);
}

/** Parte del turno que cae en `fecha` (un turno que cruza la medianoche se recorta), o `null`. */
export function tramoDelDia(turno: TurnoAgenda, fecha: FechaCivil): Tramo | null {
  const inicio = enConsultorio(turno.inicio);
  const fin = enConsultorio(turno.fin);
  if (inicio.fecha > fecha || fin.fecha < fecha) return null;
  const desde = inicio.fecha < fecha ? 0 : inicio.minutos;
  const hasta = fin.fecha > fecha ? MINUTOS_POR_DIA : fin.minutos;
  if (hasta <= desde) return null;
  return { turno, inicio: desde, fin: hasta };
}

export function tramosDelDia(turnos: readonly TurnoAgenda[], fecha: FechaCivil): Tramo[] {
  return turnos.flatMap((turno) => {
    const tramo = tramoDelDia(turno, fecha);
    return tramo ? [tramo] : [];
  });
}

/** 08:00–20:00, extendido a franjas enteras para que entre cualquier turno. */
export function rangoVisible(tramos: readonly Tramo[]): Rango {
  const inicio = Math.min(INICIO_HABITUAL, ...tramos.map((t) => t.inicio));
  const fin = Math.max(FIN_HABITUAL, ...tramos.map((t) => t.fin));
  return {
    inicio: Math.floor(inicio / MINUTOS_POR_FRANJA) * MINUTOS_POR_FRANJA,
    fin: Math.ceil(fin / MINUTOS_POR_FRANJA) * MINUTOS_POR_FRANJA,
  };
}

export function cantidadDeFranjas(rango: Rango): number {
  return (rango.fin - rango.inicio) / MINUTOS_POR_FRANJA;
}

export function posicion(tramo: Pick<Tramo, 'inicio' | 'fin'>, rango: Rango): Posicion {
  return {
    top: (tramo.inicio - rango.inicio) / MINUTOS_POR_FRANJA,
    alto: (tramo.fin - tramo.inicio) / MINUTOS_POR_FRANJA,
  };
}

/** Franjas desde el inicio del rango para una hora, o `null` si queda fuera. */
export function posicionDeHora(minutos: number, rango: Rango): number | null {
  if (minutos < rango.inicio || minutos > rango.fin) return null;
  return (minutos - rango.inicio) / MINUTOS_POR_FRANJA;
}
