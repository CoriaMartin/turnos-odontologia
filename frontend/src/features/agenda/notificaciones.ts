import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../shared/api/cliente';

export type EstadoNotificacion =
  | 'PENDIENTE'
  | 'ENVIADA'
  | 'FALLIDA'
  | 'NO_APLICA'
  | 'NO_CONSENTIDO';

export interface NotificacionTurno {
  turnoId: number;
  estado: EstadoNotificacion;
  intentos: number;
  enviadaEn: string | null;
}

export const ETIQUETA_NOTIFICACION: Readonly<Record<EstadoNotificacion, string>> = {
  PENDIENTE: 'Pendiente',
  ENVIADA: 'Enviado',
  FALLIDA: 'Fallido',
  NO_APLICA: 'No aplica',
  NO_CONSENTIDO: 'No consentido',
};

export const DETALLE_NOTIFICACION: Readonly<Record<EstadoNotificacion, string>> = {
  PENDIENTE: 'El recordatorio se va a enviar antes del turno.',
  ENVIADA: 'El recordatorio llegó al paciente.',
  FALLIDA: 'No pudimos enviar el recordatorio después de varios intentos.',
  NO_APLICA: 'Este turno no tiene recordatorio por email.',
  NO_CONSENTIDO: 'El paciente no aceptó recibir recordatorios por email.',
};

export function obtenerNotificacion(id: number, signal?: AbortSignal): Promise<NotificacionTurno> {
  return apiFetch<NotificacionTurno>(`/turnos/${id}/notificaciones`, signal ? { signal } : {});
}

export function useNotificacionDeTurno(id: number) {
  return useQuery({
    queryKey: ['notificaciones', id],
    queryFn: ({ signal }) => obtenerNotificacion(id, signal),
  });
}
