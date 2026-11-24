import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { crearQueryClient } from '../../app/queryClient';
import { metodoDe, PACIENTES_DE_PRUEBA, paginaDe, respuestaJson, simularApi } from '../../test/catalogos';
import { useGuardarPaciente, usePacientes } from './hooks';

describe('pacientes/hooks', () => {
  it('una mutación exitosa refresca el listado', async () => {
    const fetchSimulado = simularApi((_url, init) =>
      metodoDe(init) === 'GET'
        ? respuestaJson(paginaDe(PACIENTES_DE_PRUEBA))
        : respuestaJson(PACIENTES_DE_PRUEBA[1]!),
    );
    const queryClient = crearQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () => ({
        listado: usePacientes({ q: 'Gomez', pagina: 0 }),
        guardar: useGuardarPaciente(),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.listado.isSuccess).toBe(true));
    const pedidosAntes = fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'GET').length;

    act(() =>
      result.current.guardar.mutate({
        datos: {
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '30123456',
          fechaNacimiento: null,
          telefono: null,
          email: null,
          obraSocial: null,
          numeroAfiliado: null,
          aceptaRecordatorios: false,
        },
      }),
    );

    await waitFor(() => expect(result.current.guardar.isSuccess).toBe(true));
    await waitFor(
      () =>
        expect(fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'GET').length).toBeGreaterThan(
          pedidosAntes,
        ),
    );
  });
});
