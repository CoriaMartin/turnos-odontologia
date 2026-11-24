/**
 * Fechas de la agenda en la zona del consultorio (RN-GL-01, design.md D3).
 *
 * Se trabaja con fechas civiles `AAAA-MM-DD` (sin hora ni zona) y se calcula con `Date.UTC`, que no
 * depende de la zona del navegador. La hora de un instante se lee con `Intl` en la zona del consultorio.
 */

export const ZONA_CONSULTORIO = 'America/Argentina/Buenos_Aires';
/** Argentina no tiene horario de verano desde 2009. Si vuelve a tenerlo, cambiar solo acá. */
export const OFFSET_CONSULTORIO = '-03:00';

export type Vista = 'dia' | 'semana';

/** Fecha civil `AAAA-MM-DD`. */
export type FechaCivil = string;

export interface Periodo {
  vista: Vista;
  /** Primer día del período (el día, o el lunes de la semana). */
  inicio: FechaCivil;
  /** Días que abarca, en orden. */
  dias: FechaCivil[];
  /** Parámetros para `GET /api/turnos`: `[desde, hasta)` con zona horaria. */
  desde: string;
  hasta: string;
}

const MINUTOS_POR_DIA = 24 * 60;
const MS_POR_DIA = 24 * 60 * 60 * 1000;
const PATRON_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

interface Partes {
  anio: number;
  mes: number;
  dia: number;
}

function partes(fecha: FechaCivil): Partes {
  const [anio, mes, dia] = fecha.split('-').map(Number) as [number, number, number];
  return { anio, mes, dia };
}

function aUtc(fecha: FechaCivil): Date {
  const { anio, mes, dia } = partes(fecha);
  return new Date(Date.UTC(anio, mes - 1, dia));
}

function desdeUtc(fecha: Date): FechaCivil {
  return fecha.toISOString().slice(0, 10);
}

function dosDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

/** `true` si el texto es una fecha `AAAA-MM-DD` que existe en el calendario. */
export function esFechaValida(texto: string | null | undefined): texto is FechaCivil {
  if (!texto || !PATRON_FECHA.test(texto)) return false;
  return desdeUtc(aUtc(texto)) === texto;
}

export function sumarDias(fecha: FechaCivil, dias: number): FechaCivil {
  return desdeUtc(new Date(aUtc(fecha).getTime() + dias * MS_POR_DIA));
}

/** 0 = domingo … 6 = sábado. */
function diaDeLaSemana(fecha: FechaCivil): number {
  return aUtc(fecha).getUTCDay();
}

export function lunesDe(fecha: FechaCivil): FechaCivil {
  const desplazamiento = (diaDeLaSemana(fecha) + 6) % 7;
  return sumarDias(fecha, -desplazamiento);
}

/** `AAAA-MM-DDTHH:MM:00-03:00`. */
export function isoConsultorio(fecha: FechaCivil, minutos = 0): string {
  return `${fecha}T${formatoHora(minutos)}:00${OFFSET_CONSULTORIO}`;
}

export function crearPeriodo(vista: Vista, fecha: FechaCivil): Periodo {
  const inicio = vista === 'dia' ? fecha : lunesDe(fecha);
  const cantidad = vista === 'dia' ? 1 : 7;
  const dias = Array.from({ length: cantidad }, (_, i) => sumarDias(inicio, i));
  return {
    vista,
    inicio,
    dias,
    desde: isoConsultorio(inicio),
    hasta: isoConsultorio(sumarDias(inicio, cantidad)),
  };
}

/** Período anterior (-1) o siguiente (+1) al que contiene `fecha`. */
export function moverPeriodo(vista: Vista, fecha: FechaCivil, sentido: 1 | -1): FechaCivil {
  return vista === 'dia' ? sumarDias(fecha, sentido) : sumarDias(lunesDe(fecha), 7 * sentido);
}

const formatoConsultorio = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_CONSULTORIO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export interface MomentoConsultorio {
  fecha: FechaCivil;
  /** Minutos desde las 00:00 del día en la zona del consultorio. */
  minutos: number;
}

/** Fecha y hora de un instante en la zona del consultorio. */
export function enConsultorio(instante: Date | string): MomentoConsultorio {
  const fecha = typeof instante === 'string' ? new Date(instante) : instante;
  const valor = (tipo: Intl.DateTimeFormatPartTypes): string =>
    formatoConsultorio.formatToParts(fecha).find((p) => p.type === tipo)?.value ?? '00';
  return {
    fecha: `${valor('year')}-${valor('month')}-${valor('day')}`,
    minutos: Number(valor('hour')) * 60 + Number(valor('minute')),
  };
}

export function hoyEnConsultorio(ahora: Date): FechaCivil {
  return enConsultorio(ahora).fecha;
}

/** `HH:MM` a partir de minutos desde la medianoche (1440 se muestra como 24:00). */
export function formatoHora(minutos: number): string {
  const acotados = Math.max(0, Math.min(MINUTOS_POR_DIA, Math.round(minutos)));
  return `${dosDigitos(Math.floor(acotados / 60))}:${dosDigitos(acotados % 60)}`;
}

/** "Miércoles 2 de diciembre de 2026". */
export function textoDia(fecha: FechaCivil): string {
  const { anio, mes, dia } = partes(fecha);
  return `${DIAS_LARGOS[diaDeLaSemana(fecha)]} ${dia} de ${MESES[mes - 1]} de ${anio}`;
}

/** "Semana del 30 de noviembre al 6 de diciembre de 2026". */
export function textoSemana(fecha: FechaCivil): string {
  const lunes = partes(lunesDe(fecha));
  const domingo = partes(sumarDias(lunesDe(fecha), 6));
  const mismoAnio = lunes.anio === domingo.anio;
  const mismoMes = mismoAnio && lunes.mes === domingo.mes;
  const inicio = mismoMes
    ? `${lunes.dia}`
    : `${lunes.dia} de ${MESES[lunes.mes - 1]}${mismoAnio ? '' : ` de ${lunes.anio}`}`;
  return `Semana del ${inicio} al ${domingo.dia} de ${MESES[domingo.mes - 1]} de ${domingo.anio}`;
}

export function textoPeriodo(periodo: Periodo): string {
  return periodo.vista === 'dia' ? textoDia(periodo.inicio) : textoSemana(periodo.inicio);
}

/** "Jueves 03/12" (avisos de C-17). */
export function diaYFechaCorta(fecha: FechaCivil): string {
  const { mes, dia } = partes(fecha);
  return `${DIAS_LARGOS[diaDeLaSemana(fecha)] ?? ''} ${dosDigitos(dia)}/${dosDigitos(mes)}`;
}

/** "Mié 02/12" para el encabezado de cada día de la semana. */
export function encabezadoDia(fecha: FechaCivil): { dia: string; numero: string } {
  const { mes, dia } = partes(fecha);
  return { dia: DIAS_CORTOS[diaDeLaSemana(fecha)] ?? '', numero: `${dosDigitos(dia)}/${dosDigitos(mes)}` };
}
