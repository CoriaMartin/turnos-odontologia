import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../shared/api/cliente';

/** `GET /api/configuracion` (C-12, `ConfiguracionResponse`). C-18 suma acá la edición. */
export interface Configuracion {
  horasCancelacionTardia: number;
  horasAnticipacionRecordatorio: number;
  zonaHoraria: string;
}

export const CLAVE_CONFIGURACION = ['configuracion'] as const;

/** Cambia muy poco: se reutiliza durante cinco minutos sin volver a pedirla (design.md D3 de C-17). */
const VIGENCIA_MS = 5 * 60 * 1000;

export function obtenerConfiguracion(signal?: AbortSignal): Promise<Configuracion> {
  return apiFetch<Configuracion>('/configuracion', signal ? { signal } : {});
}

export function useConfiguracion() {
  return useQuery({
    queryKey: CLAVE_CONFIGURACION,
    queryFn: ({ signal }) => obtenerConfiguracion(signal),
    staleTime: VIGENCIA_MS,
  });
}
