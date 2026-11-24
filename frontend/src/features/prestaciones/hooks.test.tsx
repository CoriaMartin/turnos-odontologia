import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { crearQueryClient } from '../../app/queryClient';
import { metodoDe, PRESTACIONES_DE_PRUEBA, respuestaJson, simularApi } from '../../test/catalogos';
import { useGuardarPrestacion, usePrestaciones } from './hooks';

describe('prestaciones/hooks', () => {
  it('una mutación exitosa refresca el listado', async () => {
    const fetchSimulado = simularApi((_url, init) =>
      metodoDe(init) === 'GET'
        ? respuestaJson(PRESTACIONES_DE_PRUEBA)
        : respuestaJson({ id: 3, nombre: 'Control', duracionMinutos: 20, activa: true }),
    );
    const queryClient = crearQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () => ({ listado: usePrestaciones(), guardar: useGuardarPrestacion() }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.listado.isSuccess).toBe(true));
    const pedidosAntes = fetchSimulado.mock.calls.length;

    act(() => result.current.guardar.mutate({ datos: { nombre: 'Control', duracionMinutos: 20 } }));

    await waitFor(() => expect(result.current.guardar.isSuccess).toBe(true));
    await waitFor(() => expect(fetchSimulado.mock.calls.length).toBeGreaterThan(pedidosAntes));
    expect(metodoDe(fetchSimulado.mock.calls[pedidosAntes]![1])).toBe('POST');
  });
});
