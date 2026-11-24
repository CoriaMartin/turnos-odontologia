import { apiFetch } from '../../shared/api/cliente';
import type { DatosPaciente, PaginaPacientes, Paciente } from './tipos';

export const CLAVE_PACIENTES = ['pacientes'] as const;
export const TAMANIO_PAGINA = 20;

interface BusquedaPacientes {
  q: string;
  pagina: number;
  size?: number;
}

export function buscarPacientes(
  { q, pagina, size = TAMANIO_PAGINA }: BusquedaPacientes,
  signal?: AbortSignal,
): Promise<PaginaPacientes> {
  const parametros = new URLSearchParams({
    q,
    page: String(pagina),
    size: String(size),
  });
  return apiFetch<PaginaPacientes>(`/pacientes?${parametros.toString()}`, signal ? { signal } : {});
}

export function crearPaciente(datos: DatosPaciente): Promise<Paciente> {
  return apiFetch<Paciente>('/pacientes', { method: 'POST', body: datos });
}

export function editarPaciente(id: number, datos: DatosPaciente): Promise<Paciente> {
  return apiFetch<Paciente>(`/pacientes/${id}`, { method: 'PUT', body: datos });
}

export function darDeBajaPaciente(id: number): Promise<Paciente> {
  return apiFetch<Paciente>(`/pacientes/${id}`, { method: 'DELETE' });
}
