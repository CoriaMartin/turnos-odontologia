import {
  ApiError,
  CODIGO_ERROR_DESCONOCIDO,
  CODIGO_SIN_CONEXION,
  type ErrorDeCampo,
} from './ApiError';

const URL_API_POR_DEFECTO = 'http://localhost:8080/api';

type ProveedorToken = () => string | null;
let proveedorToken: ProveedorToken = () => null;

/**
 * Registra de dónde sale el token de sesión. Por defecto no hay token.
 * C-14 conecta acá su token en memoria sin tocar el cliente.
 */
export function configurarProveedorToken(proveedor: ProveedorToken): void {
  proveedorToken = proveedor;
}

export interface OpcionesApi {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Se envía como JSON. */
  body?: unknown;
  signal?: AbortSignal;
}

/** Une la URL base (VITE_API_URL) y la ruta sin dejar barras repetidas. */
export function construirUrl(ruta: string): string {
  const base = import.meta.env.VITE_API_URL || URL_API_POR_DEFECTO;
  return `${base.replace(/\/+$/, '')}/${ruta.replace(/^\/+/, '')}`;
}

/**
 * Llama a la API y devuelve el cuerpo JSON de la respuesta (o `undefined` si no tiene cuerpo).
 * Toda falla se rechaza con `ApiError`, salvo la cancelación por `signal`, que se propaga tal cual.
 */
export async function apiFetch<T>(ruta: string, opciones: OpcionesApi = {}): Promise<T> {
  const { method = 'GET', body, signal } = opciones;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const token = proveedorToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  if (signal) init.signal = signal;

  let respuesta: Response;
  try {
    respuesta = await fetch(construirUrl(ruta), init);
  } catch (error) {
    if (esCancelacion(error, signal)) throw error;
    throw new ApiError({ status: 0, codigo: CODIGO_SIN_CONEXION });
  }

  if (!respuesta.ok) {
    throw await convertirError(respuesta);
  }
  if (respuesta.status === 204) {
    return undefined as T;
  }
  const texto = await respuesta.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}

function esCancelacion(error: unknown, signal: AbortSignal | undefined): boolean {
  return (
    signal?.aborted === true || (error instanceof DOMException && error.name === 'AbortError')
  );
}

async function convertirError(respuesta: Response): Promise<ApiError> {
  const desconocido = new ApiError({ status: respuesta.status, codigo: CODIGO_ERROR_DESCONOCIDO });
  const tipo = respuesta.headers.get('Content-Type') ?? '';
  if (!tipo.includes('application/problem+json')) {
    return desconocido;
  }

  let cuerpo: unknown;
  try {
    cuerpo = await respuesta.json();
  } catch {
    return desconocido;
  }
  if (!esObjeto(cuerpo)) {
    return desconocido;
  }

  return new ApiError({
    status: typeof cuerpo['status'] === 'number' ? cuerpo['status'] : respuesta.status,
    codigo: typeof cuerpo['codigo'] === 'string' ? cuerpo['codigo'] : CODIGO_ERROR_DESCONOCIDO,
    titulo: typeof cuerpo['title'] === 'string' ? cuerpo['title'] : undefined,
    detalle: typeof cuerpo['detail'] === 'string' ? cuerpo['detail'] : undefined,
    errores: leerErroresDeCampo(cuerpo['errores']),
  });
}

function leerErroresDeCampo(valor: unknown): ErrorDeCampo[] {
  if (!Array.isArray(valor)) return [];
  return valor.flatMap((item) =>
    esObjeto(item) && typeof item['campo'] === 'string' && typeof item['mensaje'] === 'string'
      ? [{ campo: item['campo'], mensaje: item['mensaje'] }]
      : [],
  );
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}
