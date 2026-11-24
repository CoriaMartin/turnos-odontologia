import { ApiError } from '../../shared/api/ApiError';
import { mensajeDeError, textoTurnoSolapado, TITULO_TURNO_SOLAPADO } from '../../shared/api/mensajes';
import { campoDeLaApi, MENSAJES_CAMPO, textoIntervalo, type ErroresTurno } from './gestion';

/**
 * Qué hacer con el rechazo de una operación de C-17 (spec "Otros rechazos de la API en los diálogos"):
 * - `ninguno`: 401, la sesión se cierra sola (C-14) y no se muestra el error del diálogo.
 * - `campos`: errores por campo dentro del diálogo.
 * - `alerta`: aviso dentro del diálogo, que sigue abierto con los datos cargados.
 * - `agenda`: el turno cambió; se cierra el diálogo y el aviso va a la agenda, que ya se volvió a pedir.
 */
export type Rechazo =
  | { tipo: 'ninguno' }
  | { tipo: 'campos'; errores: ErroresTurno }
  | { tipo: 'alerta'; titulo?: string; texto: string }
  | { tipo: 'agenda'; texto: string };

const CODIGOS_DE_AGENDA: ReadonlySet<string> = new Set(['TRANSICION_INVALIDA', 'TURNO_MODIFICADO']);

export function interpretarRechazo(error: unknown): Rechazo {
  if (!(error instanceof ApiError)) return { tipo: 'alerta', texto: mensajeDeError(error) };
  if (error.status === 401) return { tipo: 'ninguno' };

  if (error.codigo === 'TURNO_SOLAPADO') {
    return { tipo: 'alerta', titulo: TITULO_TURNO_SOLAPADO, texto: textoTurnoSolapado(error, textoIntervalo) };
  }
  if (error.codigo === 'TURNO_EN_PASADO') {
    return { tipo: 'campos', errores: { dia: MENSAJES_CAMPO.pasado } };
  }
  if (CODIGOS_DE_AGENDA.has(error.codigo)) {
    return { tipo: 'agenda', texto: mensajeDeError(error) };
  }
  if (error.codigo === 'VALIDACION_FALLIDA') {
    const errores: ErroresTurno = {};
    for (const { campo, mensaje } of error.errores) {
      const propio = campoDeLaApi(campo);
      if (propio) errores[propio] = mensaje;
    }
    if (Object.keys(errores).length > 0) return { tipo: 'campos', errores };
  }
  return { tipo: 'alerta', texto: mensajeDeError(error) };
}
