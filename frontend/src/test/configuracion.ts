import { vi } from 'vitest';
import type { Configuracion } from '../features/configuracion/api';
import { respuestaJson } from './agenda';

export const CONFIGURACION_DE_PRUEBA: Configuracion = {
  horasCancelacionTardia: 24,
  horasAnticipacionRecordatorio: 24,
  zonaHoraria: 'America/Argentina/Buenos_Aires',
};

export function simularApiConfiguracion(configuracion: Configuracion = CONFIGURACION_DE_PRUEBA) {
  const fetchSimulado = vi.fn<typeof fetch>(() => Promise.resolve(respuestaJson(configuracion)));
  vi.stubGlobal('fetch', fetchSimulado);
  vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api');
  return fetchSimulado;
}
