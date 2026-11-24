/** Turno tal como lo devuelve `GET /api/turnos?desde=&hasta=` (C-08). Solo los campos que usa la web app. */
export type EstadoTurno = 'PROGRAMADO' | 'ATENDIDO' | 'AUSENTE' | 'CANCELADO' | 'CANCELADO_TARDIO';

export interface TurnoAgenda {
  id: number;
  /** ISO-8601 con zona, en la zona del consultorio. */
  inicio: string;
  fin: string;
  estado: EstadoTurno;
  version: number;
  paciente: { id: number; nombre: string; apellido: string };
  prestacion: { id: number; nombre: string };
}

/** Texto visible de cada estado (badge). Nunca se muestra el nombre técnico. */
export const ETIQUETA_ESTADO: Readonly<Record<EstadoTurno, string>> = {
  PROGRAMADO: 'Programado',
  ATENDIDO: 'Atendido',
  AUSENTE: 'Ausente',
  CANCELADO: 'Cancelado',
  CANCELADO_TARDIO: 'Cancelación tardía',
};
