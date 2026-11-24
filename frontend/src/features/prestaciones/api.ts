import { apiFetch } from '../../shared/api/cliente';
import type { DatosPrestacion, Prestacion } from './tipos';

export const CLAVE_PRESTACIONES = ['prestaciones'] as const;

export function listarPrestaciones(signal?: AbortSignal): Promise<Prestacion[]> {
  return apiFetch<Prestacion[]>('/prestaciones', signal ? { signal } : {});
}

export function crearPrestacion(datos: DatosPrestacion): Promise<Prestacion> {
  return apiFetch<Prestacion>('/prestaciones', { method: 'POST', body: datos });
}

export function editarPrestacion(id: number, datos: DatosPrestacion): Promise<Prestacion> {
  return apiFetch<Prestacion>(`/prestaciones/${id}`, { method: 'PUT', body: datos });
}

export function cambiarActiva(id: number, activa: boolean): Promise<Prestacion> {
  return apiFetch<Prestacion>(`/prestaciones/${id}/activa`, {
    method: 'PATCH',
    body: { activa },
  });
}
