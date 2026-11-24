import type { Configuracion } from '../features/configuracion/api';
import type { TurnoAgenda } from '../features/agenda/tipos';
import type { Paciente } from '../features/pacientes/tipos';
import type { Prestacion } from '../features/prestaciones/tipos';
import { cuerpoDe, metodoDe, paginaDe, PACIENTES_DE_PRUEBA, respuestaJson, simularApi } from './catalogos';

/** Backend simulado para los tests de C-17: agenda, catálogos, configuración y operaciones sobre turnos. */

export const PACIENTE_FICTICIO: Paciente = {
  ...PACIENTES_DE_PRUEBA[1]!,
  id: 3,
  nombre: 'Paciente',
  apellido: 'Ficticio Tres',
  dni: '30000003',
};

export const PRESTACIONES_GESTION: Prestacion[] = [
  { id: 1, nombre: 'Limpieza', duracionMinutos: 45, activa: true },
  { id: 2, nombre: 'Blanqueamiento', duracionMinutos: 60, activa: false },
  { id: 3, nombre: 'Control', duracionMinutos: 30, activa: true },
];

export const CONFIGURACION_24H: Configuracion = {
  horasCancelacionTardia: 24,
  horasAnticipacionRecordatorio: 24,
  zonaHoraria: 'America/Argentina/Buenos_Aires',
};

type Operacion = 'crear' | 'reprogramar' | 'cancelar' | 'asistencia';
type Respondedor = (cuerpo: unknown, id: number) => Response | Promise<Response>;

export interface Backend {
  /** Turnos de la agenda por día (`AAAA-MM-DD`); el GET responde los del día pedido en `desde`. */
  agenda: Record<string, TurnoAgenda[]>;
  pacientes?: Paciente[];
  prestaciones?: Prestacion[];
  configuracion?: Configuracion | 'error';
  respuestas?: Partial<Record<Operacion, Respondedor>>;
}

export function errorApi(status: number, codigo: string, extra: Record<string, unknown> = {}): Response {
  return respuestaJson({ status, codigo, ...extra }, status);
}

/** Respuesta exitosa que además reemplaza el turno en la agenda simulada (como haría la base). */
export function guardarEn(backend: Backend, turno: TurnoAgenda, status = 200): Response {
  for (const dia of Object.keys(backend.agenda)) {
    backend.agenda[dia] = (backend.agenda[dia] ?? []).filter((t) => t.id !== turno.id);
  }
  const dia = turno.inicio.slice(0, 10);
  backend.agenda[dia] = [...(backend.agenda[dia] ?? []), turno];
  return respuestaJson(turno, status);
}

const RUTA_OPERACION = /^\/api\/turnos\/(\d+)\/(reprogramacion|cancelacion|asistencia)$/;
const OPERACION: Readonly<Record<string, Operacion>> = {
  reprogramacion: 'reprogramar',
  cancelacion: 'cancelar',
  asistencia: 'asistencia',
};

export function simularBackend(backend: Backend) {
  return simularApi((url, init) => {
    const metodo = metodoDe(init);
    const ruta = url.pathname;

    if (ruta === '/api/turnos' && metodo === 'GET') {
      const dia = (url.searchParams.get('desde') ?? '').slice(0, 10);
      return respuestaJson(backend.agenda[dia] ?? []);
    }
    if (ruta === '/api/turnos' && metodo === 'POST') {
      const responder = backend.respuestas?.crear;
      return responder ? responder(cuerpoDe(init), 0) : errorApi(500, 'ERROR_INTERNO');
    }
    const operacion = RUTA_OPERACION.exec(ruta);
    if (operacion) {
      const responder = backend.respuestas?.[OPERACION[operacion[2]!]!];
      return responder ? responder(cuerpoDe(init), Number(operacion[1])) : errorApi(500, 'ERROR_INTERNO');
    }
    if (ruta === '/api/prestaciones') return respuestaJson(backend.prestaciones ?? PRESTACIONES_GESTION);
    if (ruta === '/api/configuracion') {
      const configuracion = backend.configuracion ?? CONFIGURACION_24H;
      return configuracion === 'error' ? errorApi(500, 'ERROR_INTERNO') : respuestaJson(configuracion);
    }
    if (ruta === '/api/pacientes') {
      const q = (url.searchParams.get('q') ?? '').toLowerCase();
      const todos = backend.pacientes ?? [PACIENTE_FICTICIO];
      return respuestaJson(paginaDe(todos.filter((p) => `${p.apellido} ${p.nombre} ${p.dni}`.toLowerCase().includes(q))));
    }
    return errorApi(404, 'RECURSO_NO_ENCONTRADO');
  });
}

/** Solicitudes hechas con un método a una ruta (sin `/api`). */
export function solicitudes(fetchSimulado: ReturnType<typeof simularBackend>, metodo: string, ruta: RegExp) {
  return fetchSimulado.mock.calls.filter(([entrada, init]) => {
    const url = new URL(String(entrada));
    return metodoDe(init) === metodo && ruta.test(url.pathname.replace(/^\/api/, ''));
  });
}
