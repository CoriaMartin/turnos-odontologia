/** Error de un campo puntual, tal como lo informa la API en `errores` (spec api-errors). */
export interface ErrorDeCampo {
  campo: string;
  mensaje: string;
}

/** Códigos que genera el propio frontend cuando la API no devuelve Problem Details. */
export const CODIGO_SIN_CONEXION = 'SIN_CONEXION';
export const CODIGO_ERROR_DESCONOCIDO = 'ERROR_DESCONOCIDO';

interface DatosApiError {
  status: number;
  codigo: string;
  titulo?: string | undefined;
  detalle?: string | undefined;
  errores?: ErrorDeCampo[] | undefined;
}

/**
 * Falla de una llamada a la API con un `codigo` estable.
 * El `codigo` es para el código de la app; al usuario se le muestra `mensajeDeError(error)`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly codigo: string;
  readonly titulo: string | undefined;
  readonly detalle: string | undefined;
  readonly errores: ErrorDeCampo[];

  constructor({ status, codigo, titulo, detalle, errores = [] }: DatosApiError) {
    super(`${codigo} (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
    this.titulo = titulo;
    this.detalle = detalle;
    this.errores = errores;
  }
}
