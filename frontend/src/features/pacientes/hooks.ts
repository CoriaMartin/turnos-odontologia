import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  buscarPacientes,
  CLAVE_PACIENTES,
  crearPaciente,
  darDeBajaPaciente,
  editarPaciente,
} from './api';
import type { DatosPaciente, Paciente } from './tipos';

export function usePacientes({ q, pagina }: { q: string; pagina: number }) {
  return useQuery({
    queryKey: [...CLAVE_PACIENTES, q, pagina],
    queryFn: ({ signal }) => buscarPacientes({ q, pagina }, signal),
  });
}

interface GuardarPaciente {
  id?: number;
  datos: DatosPaciente;
}

function usarInvalidaciones() {
  const cliente = useQueryClient();
  return () => {
    void cliente.invalidateQueries({ queryKey: CLAVE_PACIENTES });
    void cliente.invalidateQueries({ queryKey: ['turnos'] });
  };
}

export function useGuardarPaciente() {
  const invalidar = usarInvalidaciones();
  return useMutation({
    mutationFn: ({ id, datos }: GuardarPaciente) =>
      id === undefined ? crearPaciente(datos) : editarPaciente(id, datos),
    onSuccess: invalidar,
  });
}

export function useDarDeBajaPaciente() {
  const invalidar = usarInvalidaciones();
  return useMutation({
    mutationFn: (id: number) => darDeBajaPaciente(id),
    onSuccess: (_respuesta: Paciente) => invalidar(),
  });
}
