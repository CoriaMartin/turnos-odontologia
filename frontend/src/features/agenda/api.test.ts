import { beforeEach, describe, expect, it, vi } from 'vitest';
import { consultarAgenda, claveAgenda } from './api';
import { crearPeriodo } from './fechas';

const fetchSimulado = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchSimulado);
  vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api');
  fetchSimulado.mockImplementation(() => Promise.resolve(new Response('[]', { status: 200 })));
});

describe('web-agenda · Período pedido a la API', () => {
  it('pide GET /api/turnos con desde y hasta codificados y sin incluirCancelados=false', async () => {
    await consultarAgenda(crearPeriodo('dia', '2026-12-02'));

    const url = new URL(String(fetchSimulado.mock.calls[0]?.[0]));
    expect(url.pathname).toBe('/api/turnos');
    expect(url.searchParams.get('desde')).toBe('2026-12-02T00:00:00-03:00');
    expect(url.searchParams.get('hasta')).toBe('2026-12-03T00:00:00-03:00');
    expect(url.search).not.toContain('incluirCancelados');
    // El "+" de una zona positiva y el ":" se envían codificados, nunca como espacio.
    expect(String(fetchSimulado.mock.calls[0]?.[0])).toContain('desde=2026-12-02T00%3A00%3A00-03%3A00');
    expect(fetchSimulado.mock.calls[0]?.[1]?.method).toBe('GET');
  });

  it('un cuerpo que no es una lista se rechaza como error desconocido en lugar de romper la pantalla', async () => {
    fetchSimulado.mockImplementation(() => Promise.resolve(new Response('{}', { status: 200 })));

    await expect(consultarAgenda(crearPeriodo('dia', '2026-12-02'))).rejects.toMatchObject({
      codigo: 'ERROR_DESCONOCIDO',
    });
  });

  it('la clave de consulta empieza con "turnos" para que C-17 pueda invalidar toda la agenda', () => {
    expect(claveAgenda(crearPeriodo('semana', '2026-12-02'))).toEqual([
      'turnos',
      'agenda',
      '2026-11-30T00:00:00-03:00',
      '2026-12-07T00:00:00-03:00',
    ]);
  });
});
