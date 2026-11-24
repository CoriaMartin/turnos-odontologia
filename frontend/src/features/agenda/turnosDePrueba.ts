import type { EstadoTurno, TurnoAgenda } from './tipos';

/** Solo para tests: arma un turno de la agenda con datos ficticios. */
interface DatosTurno {
  id?: number;
  fecha?: string;
  inicio?: string;
  fin?: string;
  /** Si el turno termina otro día. */
  finFecha?: string;
  estado?: EstadoTurno;
  nombre?: string;
  apellido?: string;
  prestacion?: string;
}

let siguienteId = 1;

export function turno({
  id = siguienteId++,
  fecha = '2026-12-02',
  inicio = '10:00',
  fin = '10:45',
  finFecha = fecha,
  estado = 'PROGRAMADO',
  nombre = 'Paciente',
  apellido = 'Ficticio Tres',
  prestacion = 'Limpieza',
}: DatosTurno = {}): TurnoAgenda {
  return {
    id,
    inicio: `${fecha}T${inicio}:00-03:00`,
    fin: `${finFecha}T${fin}:00-03:00`,
    estado,
    version: 0,
    paciente: { id: id + 100, nombre, apellido },
    prestacion: { id: 1, nombre: prestacion },
  };
}
