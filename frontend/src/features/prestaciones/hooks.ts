import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cambiarActiva,
  CLAVE_PRESTACIONES,
  crearPrestacion,
  editarPrestacion,
  listarPrestaciones,
} from './api';
import type { DatosPrestacion, Prestacion } from './tipos';

export function usePrestaciones() {
  return useQuery({
    queryKey: CLAVE_PRESTACIONES,
    queryFn: ({ signal }) => listarPrestaciones(signal),
  });
}

interface GuardarPrestacion {
  id?: number;
  datos: DatosPrestacion;
}

export function useGuardarPrestacion() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: GuardarPrestacion) =>
      id === undefined ? crearPrestacion(datos) : editarPrestacion(id, datos),
    onSuccess: () => {
      void cliente.invalidateQueries({ queryKey: CLAVE_PRESTACIONES });
      void cliente.invalidateQueries({ queryKey: ['turnos'] });
    },
  });
}

export function useCambiarActivaPrestacion() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activa }: { id: number; activa: boolean }) =>
      cambiarActiva(id, activa),
    onSuccess: (_respuesta: Prestacion) => {
      void cliente.invalidateQueries({ queryKey: CLAVE_PRESTACIONES });
      void cliente.invalidateQueries({ queryKey: ['turnos'] });
    },
  });
}
