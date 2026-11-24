import { ApiError } from './ApiError';

/** Mensaje para cualquier código sin texto propio. Nunca incluye el código técnico. */
export const MENSAJE_GENERICO = 'No pudimos completar la acción. Probá de nuevo en unos minutos.';

/**
 * Textos para el usuario por `codigo`, en español rioplatense: qué pasó y qué hacer (design-system/brand.md).
 * Cada change agrega acá los códigos de su dominio (por ejemplo, TURNO_SOLAPADO en C-17).
 */
export const MENSAJES_POR_CODIGO: Readonly<Record<string, string>> = {
  SIN_CONEXION:
    'No pudimos conectarnos con el servidor. Revisá tu conexión a internet y probá de nuevo.',
  ERROR_INTERNO: 'Algo falló de nuestro lado. Probá de nuevo en unos minutos.',
  ERROR_DESCONOCIDO: MENSAJE_GENERICO,
  VALIDACION_FALLIDA: 'Hay datos para corregir. Revisá los campos marcados y volvé a intentar.',
  RECURSO_NO_ENCONTRADO:
    'No encontramos lo que buscabas. Puede que ya no exista: actualizá la página y probá de nuevo.',
  SOLICITUD_INVALIDA: 'No pudimos procesar los datos enviados. Revisalos y probá de nuevo.',
};

/** Mensaje para mostrar al usuario ante cualquier error. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof ApiError) {
    return MENSAJES_POR_CODIGO[error.codigo] ?? MENSAJE_GENERICO;
  }
  return MENSAJE_GENERICO;
}
