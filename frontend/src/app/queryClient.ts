import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../shared/api/ApiError';

/** Un error 4xx no mejora reintentando: es un problema de la solicitud. */
export function debeReintentar(intentosFallidos: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return intentosFallidos < 1;
}

export function crearQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: debeReintentar },
      mutations: { retry: false },
    },
  });
}
