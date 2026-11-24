import { diaYFechaCorta, enConsultorio, formatoHora, isoConsultorio, type FechaCivil } from './fechas';
import { MINUTOS_POR_FRANJA, type Rango, type Tramo } from './lineaDeTiempo';
import type { TurnoAgenda } from './tipos';

/** Lógica pura de la gestión de turnos (C-17, design.md D3–D5). Se testea sin render. */

export type Accion = 'reprogramar' | 'cancelar' | 'atendido' | 'ausente';

const MS_POR_MINUTO = 60_000;
const MS_POR_HORA = 60 * MS_POR_MINUTO;
const MINUTOS_POR_DIA = 24 * 60;

export const DURACION_MINIMA = 5;
export const DURACION_MAXIMA = 480;
export const MOTIVO_MAXIMO = 255;

/**
 * Acciones que ofrece el detalle según RN-ES-02/03 (D5): programado y futuro → reprogramar o cancelar;
 * programado y empezado → asistencia; estado final → ninguna. Es una guía: decide el servidor.
 */
export function accionesDisponibles(turno: Pick<TurnoAgenda, 'estado' | 'inicio'>, ahora: Date): Accion[] {
  if (turno.estado !== 'PROGRAMADO') return [];
  return ahora.getTime() < Date.parse(turno.inicio) ? ['reprogramar', 'cancelar'] : ['atendido', 'ausente'];
}

/** Faltan **menos** de `horas` para el inicio (RN-CA-01, RN-CA-04: exactamente en el límite no es tardía). */
export function esCancelacionTardia(inicio: string, ahora: Date, horas: number): boolean {
  return Date.parse(inicio) - ahora.getTime() < horas * MS_POR_HORA;
}

/** Minutos desde la medianoche de un `HH:MM`, o `null` si no es una hora válida. */
export function minutosDeHora(hora: string): number | null {
  const coincidencia = /^(\d{2}):(\d{2})$/.exec(hora);
  if (!coincidencia) return null;
  const horas = Number(coincidencia[1]);
  const minutos = Number(coincidencia[2]);
  if (horas > 23 || minutos > 59) return null;
  return horas * 60 + minutos;
}

/** `HH:MM` de una cantidad de minutos desde la medianoche (sin recortar a 24:00). */
export function horaDeMinutos(minutos: number): string {
  return formatoHora(minutos % MINUTOS_POR_DIA);
}

/** Duración válida (D4): entero entre 5 y 480. */
export function duracionValida(texto: string): number | null {
  if (!/^\d+$/.test(texto.trim())) return null;
  const valor = Number(texto);
  return valor >= DURACION_MINIMA && valor <= DURACION_MAXIMA ? valor : null;
}

/** "Termina 10:45", "Termina 00:15 del día siguiente" o "Termina —" si falta la hora o la duración (D4). */
export function textoFin(hora: string, duracion: string): string {
  const inicio = minutosDeHora(hora);
  const minutos = duracionValida(duracion);
  if (inicio === null || minutos === null) return 'Termina —';
  const fin = inicio + minutos;
  const siguiente = fin >= MINUTOS_POR_DIA ? ' del día siguiente' : '';
  return `Termina ${horaDeMinutos(fin)}${siguiente}`;
}

/** El inicio ya pasó en la zona del consultorio. */
export function estaEnElPasado(fecha: FechaCivil, minutos: number, ahora: Date): boolean {
  return Date.parse(isoConsultorio(fecha, minutos)) < ahora.getTime();
}

/** "Jueves 03/12 a las 10:00." para los avisos de éxito. */
export function textoDiaYHora(inicio: string): string {
  const momento = enConsultorio(inicio);
  return `${diaYFechaCorta(momento.fecha)} a las ${formatoHora(momento.minutos)}.`;
}

/** "10:00 a 10:30" de un intervalo ISO (texto de `TURNO_SOLAPADO`). */
export function textoIntervalo(inicio: string, fin: string): string {
  return `${formatoHora(enConsultorio(inicio).minutos)} a ${formatoHora(enConsultorio(fin).minutos)}`;
}

export type CampoTurno = 'paciente' | 'prestacion' | 'duracion' | 'dia' | 'hora' | 'motivo';
export type ErroresTurno = Partial<Record<CampoTurno, string>>;

export const MENSAJES_CAMPO = {
  paciente: 'Elegí un paciente',
  prestacion: 'Elegí una prestación',
  dia: 'Elegí el día del turno',
  hora: 'Elegí la hora del turno',
  duracion: `La duración tiene que estar entre ${DURACION_MINIMA} y ${DURACION_MAXIMA} minutos.`,
  pasado: 'No se pueden dar turnos en el pasado.',
  motivo: `El motivo puede tener hasta ${MOTIVO_MAXIMO} caracteres.`,
} as const;

export interface DatosHorario {
  fecha: string;
  hora: string;
  duracion: string;
}

/** Validación local del horario (spec "Validación del formulario antes de enviar"). */
export function validarHorario({ fecha, hora, duracion }: DatosHorario, ahora: Date): ErroresTurno {
  const errores: ErroresTurno = {};
  const minutos = minutosDeHora(hora);
  if (!fecha) errores.dia = MENSAJES_CAMPO.dia;
  if (minutos === null) errores.hora = MENSAJES_CAMPO.hora;
  if (duracionValida(duracion) === null) errores.duracion = MENSAJES_CAMPO.duracion;
  if (fecha && minutos !== null && estaEnElPasado(fecha, minutos, ahora)) errores.dia = MENSAJES_CAMPO.pasado;
  return errores;
}

/** Errores de `VALIDACION_FALLIDA` de la API → campos del diálogo. */
const CAMPO_DE_LA_API: Readonly<Record<string, CampoTurno>> = {
  pacienteId: 'paciente',
  prestacionId: 'prestacion',
  duracionMinutos: 'duracion',
  inicio: 'dia',
  motivo: 'motivo',
};

export function campoDeLaApi(campo: string): CampoTurno | undefined {
  return CAMPO_DE_LA_API[campo];
}

/**
 * Franjas de 30 min de `fecha` que pueden abrir "Nuevo turno": dentro del rango visible, que todavía no
 * empezaron y sin un turno activo encima (spec "Abrir el diálogo", escenario "Franja pasada").
 */
export function franjasLibres(
  fecha: FechaCivil,
  rango: Rango,
  activos: readonly Pick<Tramo, 'inicio' | 'fin'>[],
  ahora: Date,
): number[] {
  const libres: number[] = [];
  for (let inicio = rango.inicio; inicio < rango.fin; inicio += MINUTOS_POR_FRANJA) {
    const fin = inicio + MINUTOS_POR_FRANJA;
    const ocupada = activos.some((t) => t.inicio < fin && t.fin > inicio);
    if (!ocupada && !estaEnElPasado(fecha, inicio, ahora)) libres.push(inicio);
  }
  return libres;
}

/** Quita los errores de los campos que el usuario acaba de cambiar (los demás quedan hasta el próximo envío). */
export function sinErrores(errores: ErroresTurno, campos: readonly CampoTurno[]): ErroresTurno {
  const resto = { ...errores };
  for (const campo of campos) delete resto[campo];
  return resto;
}
