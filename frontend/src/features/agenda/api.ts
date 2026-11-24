import { useQuery } from '@tanstack/react-query';
import { ApiError, CODIGO_ERROR_DESCONOCIDO } from '../../shared/api/ApiError';
import { apiFetch } from '../../shared/api/cliente';
import type { Periodo } from './fechas';
import type { TurnoAgenda } from './tipos';

/**
 * Prefijo de todas las consultas de turnos. C-17 lo invalida después de crear, reprogramar,
 * cancelar o marcar asistencia, y la agenda visible se vuelve a pedir (design.md D4).
 */
export const CLAVE_TURNOS = ['turnos'] as const;

export function claveAgenda({ desde, hasta }: Pick<Periodo, 'desde' | 'hasta'>) {
  return [...CLAVE_TURNOS, 'agenda', desde, hasta] as const;
}

/** `GET /api/turnos?desde=&hasta=` (C-08). Incluye los cancelados: es el valor por defecto de la API. */
export async function consultarAgenda(
  { desde, hasta }: Pick<Periodo, 'desde' | 'hasta'>,
  signal?: AbortSignal,
): Promise<TurnoAgenda[]> {
  const parametros = new URLSearchParams({ desde, hasta });
  const cuerpo = await apiFetch<unknown>(`/turnos?${parametros.toString()}`, signal ? { signal } : {});
  // Un cuerpo inesperado se muestra como error de carga, no rompe la pantalla.
  if (!Array.isArray(cuerpo)) {
    throw new ApiError({ status: 200, codigo: CODIGO_ERROR_DESCONOCIDO });
  }
  return cuerpo as TurnoAgenda[];
}

/** Toda llamada a la API pasa por TanStack Query, así un 401 cierra la sesión (convención de C-14). */
export function useAgenda(periodo: Pick<Periodo, 'desde' | 'hasta'>) {
  return useQuery({
    queryKey: claveAgenda(periodo),
    queryFn: ({ signal }) => consultarAgenda(periodo, signal),
  });
}
