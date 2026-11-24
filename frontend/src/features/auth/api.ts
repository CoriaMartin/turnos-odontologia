import { apiFetch } from '../../shared/api/cliente';

export interface CredencialesLogin {
  email: string;
  password: string;
}

/** Respuesta 200 de `POST /api/auth/login` (spec autenticacion). */
export interface RespuestaLogin {
  token: string;
  tipo: string;
  /** Fecha de vencimiento en ISO-8601. */
  expiraEn: string;
}

/**
 * Inicia sesión en la API. Errores posibles: 401 `CREDENCIALES_INVALIDAS`, 422 `VALIDACION_FALLIDA`,
 * 429 `LOGIN_BLOQUEADO` y los del cliente (`SIN_CONEXION`, `ERROR_DESCONOCIDO`).
 */
export function login(credenciales: CredencialesLogin): Promise<RespuestaLogin> {
  return apiFetch<RespuestaLogin>('/auth/login', { method: 'POST', body: credenciales });
}
