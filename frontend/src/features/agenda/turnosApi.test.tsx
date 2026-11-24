import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { obtenerConfiguracion } from '../configuracion/api';
import { cuerpoDe, metodoDe, respuestaJson, simularApi, urlDe } from '../../test/catalogos';
import { turno } from './turnosDePrueba';
import {
  cancelarTurno,
  crearTurno,
  registrarAsistencia,
  reprogramarTurno,
  useCancelarTurno,
  useCrearTurno,
} from './turnosApi';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function ultimaSolicitud(fetchSimulado: ReturnType<typeof simularApi>) {
  const [entrada, init] = fetchSimulado.mock.calls.at(-1)!;
  const url = urlDe(entrada);
  return { ruta: url.pathname.replace('/api', ''), metodo: metodoDe(init), cuerpo: cuerpoDe(init) };
}

describe('web-gestion-turnos · Contratos de la API (D2)', () => {
  it('crear: POST /turnos con inicio -03:00 y duración', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(turno(), 201));
    await crearTurno({ pacienteId: 3, prestacionId: 1, inicio: '2026-12-03T10:00:00-03:00', duracionMinutos: 45 });
    expect(ultimaSolicitud(fetchSimulado)).toEqual({
      ruta: '/turnos',
      metodo: 'POST',
      cuerpo: { pacienteId: 3, prestacionId: 1, inicio: '2026-12-03T10:00:00-03:00', duracionMinutos: 45 },
    });
  });

  it('reprogramar: PUT /turnos/{id}/reprogramacion con version', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(turno()));
    await reprogramarTurno(7, { inicio: '2026-12-03T12:00:00-03:00', duracionMinutos: 45, version: 3 });
    expect(ultimaSolicitud(fetchSimulado)).toEqual({
      ruta: '/turnos/7/reprogramacion',
      metodo: 'PUT',
      cuerpo: { inicio: '2026-12-03T12:00:00-03:00', duracionMinutos: 45, version: 3 },
    });
  });

  it('cancelar con motivo: POST /turnos/{id}/cancelacion con { motivo } recortado', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(turno({ estado: 'CANCELADO' })));
    await cancelarTurno(7, '  Viaje imprevisto ');
    expect(ultimaSolicitud(fetchSimulado)).toEqual({
      ruta: '/turnos/7/cancelacion',
      metodo: 'POST',
      cuerpo: { motivo: 'Viaje imprevisto' },
    });
  });

  it('cancelar sin motivo (o en blanco): sin cuerpo', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(turno({ estado: 'CANCELADO' })));
    await cancelarTurno(7, '   ');
    expect(ultimaSolicitud(fetchSimulado).cuerpo).toBeUndefined();
  });

  it('asistencia: POST /turnos/{id}/asistencia con estado', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(turno({ estado: 'ATENDIDO' })));
    await registrarAsistencia(7, 'ATENDIDO');
    expect(ultimaSolicitud(fetchSimulado)).toEqual({
      ruta: '/turnos/7/asistencia',
      metodo: 'POST',
      cuerpo: { estado: 'ATENDIDO' },
    });
  });

  it('configuración: GET /configuracion', async () => {
    const fetchSimulado = simularApi(() =>
      respuestaJson({ horasCancelacionTardia: 24, horasAnticipacionRecordatorio: 24, zonaHoraria: 'X' }),
    );
    await expect(obtenerConfiguracion()).resolves.toMatchObject({ horasCancelacionTardia: 24 });
    expect(ultimaSolicitud(fetchSimulado)).toMatchObject({ ruta: '/configuracion', metodo: 'GET' });
  });
});

describe('web-gestion-turnos · Invalidación de la agenda', () => {
  function conCliente() {
    const cliente = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidar = vi.spyOn(cliente, 'invalidateQueries');
    const envoltorio = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
    );
    return { invalidar, envoltorio };
  }

  const datos = { pacienteId: 3, prestacionId: 1, inicio: '2026-12-03T10:00:00-03:00', duracionMinutos: 45 };

  it('el éxito invalida ["turnos"]', async () => {
    simularApi(() => respuestaJson(turno(), 201));
    const { invalidar, envoltorio } = conCliente();
    const { result } = renderHook(() => useCrearTurno(), { wrapper: envoltorio });

    result.current.mutate(datos);

    await waitFor(() => expect(invalidar).toHaveBeenCalledWith({ queryKey: ['turnos'] }));
  });

  it.each(['TURNO_SOLAPADO', 'TRANSICION_INVALIDA', 'TURNO_MODIFICADO'])('%s invalida ["turnos"]', async (codigo) => {
    simularApi(() => respuestaJson({ status: 409, codigo }, 409));
    const { invalidar, envoltorio } = conCliente();
    const { result } = renderHook(() => useCancelarTurno(), { wrapper: envoltorio });

    result.current.mutate({ id: 7 });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['turnos'] });
  });

  it('otro rechazo no invalida la agenda', async () => {
    simularApi(() => respuestaJson({ status: 422, codigo: 'PACIENTE_INACTIVO' }, 422));
    const { invalidar, envoltorio } = conCliente();
    const { result } = renderHook(() => useCrearTurno(), { wrapper: envoltorio });

    result.current.mutate(datos);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
