import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../shared/api/ApiError';
import { apiFetch } from '../../shared/api/cliente';
import { buscarPacientes, CLAVE_PACIENTES } from '../pacientes/api';
import { CLAVE_TURNOS } from './api';
import type { TurnoAgenda } from './tipos';

/**
 * Operaciones sobre turnos de C-17 (design.md D2). Contratos confirmados contra las specs archivadas de
 * C-07, C-09, C-10 y C-11: ninguna operación salvo la reprogramación pide `version`.
 */

export interface NuevoTurno {
  pacienteId: number;
  prestacionId: number;
  /** ISO-8601 con zona `-03:00`. */
  inicio: string;
  duracionMinutos: number;
}

export interface NuevoHorario {
  inicio: string;
  duracionMinutos: number;
  version: number;
}

export type EstadoAsistencia = 'ATENDIDO' | 'AUSENTE';

/** `POST /api/turnos` (C-07). */
export function crearTurno(datos: NuevoTurno): Promise<TurnoAgenda> {
  return apiFetch<TurnoAgenda>('/turnos', { method: 'POST', body: datos });
}

/** `PUT /api/turnos/{id}/reprogramacion` (C-10), con la `version` del turno (bloqueo optimista). */
export function reprogramarTurno(id: number, horario: NuevoHorario): Promise<TurnoAgenda> {
  return apiFetch<TurnoAgenda>(`/turnos/${id}/reprogramacion`, { method: 'PUT', body: horario });
}

/** `POST /api/turnos/{id}/cancelacion` (C-09): sin motivo se envía sin cuerpo. */
export function cancelarTurno(id: number, motivo?: string): Promise<TurnoAgenda> {
  const texto = motivo?.trim();
  return apiFetch<TurnoAgenda>(
    `/turnos/${id}/cancelacion`,
    texto ? { method: 'POST', body: { motivo: texto } } : { method: 'POST' },
  );
}

/** `POST /api/turnos/{id}/asistencia` (C-11). */
export function registrarAsistencia(id: number, estado: EstadoAsistencia): Promise<TurnoAgenda> {
  return apiFetch<TurnoAgenda>(`/turnos/${id}/asistencia`, { method: 'POST', body: { estado } });
}

/** Rechazos que indican que la agenda visible quedó vieja: se vuelve a pedir (spec "Horario ocupado", D2). */
const CODIGOS_QUE_REFRESCAN: ReadonlySet<string> = new Set([
  'TURNO_SOLAPADO',
  'TRANSICION_INVALIDA',
  'TURNO_MODIFICADO',
]);

export function refrescaLaAgenda(error: unknown): boolean {
  return error instanceof ApiError && CODIGOS_QUE_REFRESCAN.has(error.codigo);
}

function useInvalidarAgenda() {
  const cliente = useQueryClient();
  return {
    onSuccess: () => void cliente.invalidateQueries({ queryKey: CLAVE_TURNOS }),
    onError: (error: unknown) => {
      if (refrescaLaAgenda(error)) void cliente.invalidateQueries({ queryKey: CLAVE_TURNOS });
    },
  };
}

export function useCrearTurno() {
  return useMutation({ mutationFn: crearTurno, ...useInvalidarAgenda() });
}

export function useReprogramarTurno() {
  return useMutation({
    mutationFn: ({ id, horario }: { id: number; horario: NuevoHorario }) => reprogramarTurno(id, horario),
    ...useInvalidarAgenda(),
  });
}

export function useCancelarTurno() {
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo?: string }) => cancelarTurno(id, motivo),
    ...useInvalidarAgenda(),
  });
}

export function useRegistrarAsistencia() {
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoAsistencia }) => registrarAsistencia(id, estado),
    ...useInvalidarAgenda(),
  });
}

/** Búsqueda de paciente del diálogo (D6): reutiliza `buscarPacientes` de C-15 con 10 resultados. */
export const RESULTADOS_BUSQUEDA = 10;
export const MINIMO_BUSQUEDA = 2;

export function usePacientesParaTurno(texto: string) {
  const q = texto.trim();
  return useQuery({
    // Bajo el prefijo de C-15: un alta o baja de paciente invalida también esta búsqueda.
    queryKey: [...CLAVE_PACIENTES, 'busqueda-turno', q],
    queryFn: ({ signal }) => buscarPacientes({ q, pagina: 0, size: RESULTADOS_BUSQUEDA }, signal),
    enabled: q.length >= MINIMO_BUSQUEDA,
  });
}
