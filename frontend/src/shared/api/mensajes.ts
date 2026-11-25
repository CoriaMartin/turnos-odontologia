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
  // C-14 · sesión (spec web-sesion). El aviso de bloqueo fija los 15 minutos de RN-AU-03: la API no informa el tiempo restante.
  CREDENCIALES_INVALIDAS: 'El email o la contraseña no son correctos. Revisalos y probá de nuevo.',
  LOGIN_BLOQUEADO: 'Hubo demasiados intentos fallidos. Esperá 15 minutos y volvé a intentar.',
  NO_AUTENTICADO: 'Tu sesión venció. Ingresá de nuevo para seguir.',
  // C-15 · prestaciones y pacientes (spec web-administracion).
  NOMBRE_DUPLICADO: 'Ya tenés una prestación con ese nombre. Probá con otro.',
  DNI_DUPLICADO: 'Ese DNI ya pertenece a otro paciente. Revisalo o buscá al paciente existente.',
  PACIENTE_CON_TURNOS_FUTUROS:
    'No pudimos dar de baja a este paciente porque tiene un turno programado. Cancelá o reprogramá ese turno y probá de nuevo.',
  // C-17 · gestión de turnos (spec web-gestion-turnos).
  TURNO_SOLAPADO: 'Ese horario se superpone con otro turno. Elegí otro horario.',
  TURNO_EN_PASADO: 'No se pueden dar turnos en el pasado.',
  PACIENTE_INACTIVO: 'Ese paciente está dado de baja. Elegí otro paciente.',
  PRESTACION_INACTIVA: 'Esa prestación no está disponible. Elegí otra prestación.',
  TRANSICION_INVALIDA:
    'Este turno ya no se puede modificar porque cambió de estado. Actualizamos la agenda.',
  TURNO_MODIFICADO:
    'Este turno cambió mientras lo editabas. Actualizamos la agenda: revisalo y probá de nuevo.',
  TURNO_NO_ENCONTRADO: 'No encontramos ese turno. Actualizá la agenda y probá de nuevo.',
  HORAS_INVALIDAS:
    'Las horas tienen que ser números enteros: 0 o más para cancelación tardía y mayor a 0 para recordatorio.',
  GUARDAR_EXITOSO: 'La configuración se guardó correctamente.',
};

export const TITULO_HORAS_INVALIDAS = 'Revisá las horas cargadas';
export const TITULO_GUARDAR_EXITOSO = 'Configuración guardada';

/** Título del aviso de `TURNO_SOLAPADO` (spec "Horario ocupado"). */
export const TITULO_TURNO_SOLAPADO = 'Ese horario ya está ocupado';

interface IntervaloEnConflicto {
  inicio: string;
  fin: string;
}

function leerConflicto(error: ApiError): IntervaloEnConflicto | null {
  const valor = error.propiedades['turnoEnConflicto'];
  if (typeof valor !== 'object' || valor === null) return null;
  const { inicio, fin } = valor as Record<string, unknown>;
  return typeof inicio === 'string' && typeof fin === 'string' ? { inicio, fin } : null;
}

/**
 * Texto de `TURNO_SOLAPADO` con el horario en conflicto (design.md D8 de C-17). La API no informa el
 * paciente de ese turno, así que el texto no lo nombra. `formatear` convierte el intervalo a "10:00 a 10:30".
 */
export function textoTurnoSolapado(
  error: ApiError,
  formatear: (inicio: string, fin: string) => string,
): string {
  const conflicto = leerConflicto(error);
  return conflicto
    ? `Se superpone con el turno de ${formatear(conflicto.inicio, conflicto.fin)}. Elegí otro horario.`
    : (MENSAJES_POR_CODIGO['TURNO_SOLAPADO'] as string);
}

/** Mensaje para mostrar al usuario ante cualquier error. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof ApiError) {
    return MENSAJES_POR_CODIGO[error.codigo] ?? MENSAJE_GENERICO;
  }
  return MENSAJE_GENERICO;
}
