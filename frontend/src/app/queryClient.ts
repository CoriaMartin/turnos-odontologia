import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { cerrarSesion, haySesion, suscribir } from '../features/auth/sesion';
import { ApiError } from '../shared/api/ApiError';

/** Un error 4xx no mejora reintentando: es un problema de la solicitud. */
export function debeReintentar(intentosFallidos: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return intentosFallidos < 1;
}

/**
 * Un 401 con sesión iniciada significa que la API ya no acepta el token: se cierra como vencida
 * (spec web-sesion, design.md D3). Sin sesión (por ejemplo, el 401 del propio login) no hace nada.
 */
function alFallarUnaSolicitud(error: unknown): void {
  if (error instanceof ApiError && error.status === 401 && haySesion()) {
    cerrarSesion('vencida');
  }
}

export function crearQueryClient(): QueryClient {
  const cliente = new QueryClient({
    queryCache: new QueryCache({ onError: alFallarUnaSolicitud }),
    mutationCache: new MutationCache({ onError: alFallarUnaSolicitud }),
    defaultOptions: {
      queries: { retry: debeReintentar },
      mutations: { retry: false },
    },
  });

  // Al cerrarse la sesión por cualquier motivo, se descartan los datos cargados (design.md D3 y D5).
  let habiaSesion = haySesion();
  suscribir(() => {
    const hay = haySesion();
    if (habiaSesion && !hay) cliente.clear();
    habiaSesion = hay;
  });

  return cliente;
}
