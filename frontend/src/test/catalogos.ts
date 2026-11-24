import { vi } from 'vitest';
import { respuestaJson } from './agenda';
import type { Paciente } from '../features/pacientes/tipos';
import type { Prestacion } from '../features/prestaciones/tipos';

type Manejador = (url: URL, init: RequestInit | undefined) => Response | Promise<Response>;

export function simularApi(manejador: Manejador) {
  const fetchSimulado = vi.fn<typeof fetch>((entrada, init) => {
    const url = new URL(String(entrada));
    return Promise.resolve(manejador(url, init));
  });
  vi.stubGlobal('fetch', fetchSimulado);
  vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api');
  return fetchSimulado;
}

export function urlDe(entrada: Parameters<typeof fetch>[0]): URL {
  return new URL(String(entrada));
}

export function metodoDe(init: RequestInit | undefined): string {
  return init?.method ?? 'GET';
}

export function cuerpoDe(init: RequestInit | undefined): unknown {
  return typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
}

export const PRESTACIONES_DE_PRUEBA: Prestacion[] = [
  { id: 1, nombre: 'Limpieza', duracionMinutos: 30, activa: true },
  { id: 2, nombre: 'Extracción', duracionMinutos: 45, activa: false },
];

export const PACIENTES_DE_PRUEBA: Paciente[] = [
  {
    id: 1,
    nombre: 'Patricia',
    apellido: 'Gómez',
    dni: '32112334',
    fechaNacimiento: '1988-04-14',
    telefono: '11 4567-8901',
    email: 'patricia@example.com',
    obraSocial: 'Swiss Medical',
    numeroAfiliado: '987654321',
    aceptaRecordatorios: true,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '30123456',
    fechaNacimiento: null,
    telefono: null,
    email: null,
    obraSocial: null,
    numeroAfiliado: null,
    aceptaRecordatorios: false,
    activo: true,
  },
];

export function paginaDe(pacientes: Paciente[], total = pacientes.length, pagina = 0, tamanio = 20) {
  return {
    contenido: pacientes,
    pagina,
    tamanio,
    totalElementos: total,
    totalPaginas: Math.max(1, Math.ceil(total / tamanio)),
  };
}

export { respuestaJson };
