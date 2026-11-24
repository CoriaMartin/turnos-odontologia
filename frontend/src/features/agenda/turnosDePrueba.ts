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
  version?: number;
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
  version = 0,
}: DatosTurno = {}): TurnoAgenda {
  const inicioIso = `${fecha}T${inicio}:00-03:00`;
  const finIso = `${finFecha}T${fin}:00-03:00`;
  return {
    id,
    inicio: inicioIso,
    fin: finIso,
    estado,
    duracionMinutos: (Date.parse(finIso) - Date.parse(inicioIso)) / 60_000,
    version,
    paciente: { id: id + 100, nombre, apellido },
    prestacion: { id: 1, nombre: prestacion },
  };
}
