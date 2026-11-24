import { describe, expect, it } from 'vitest';
import {
  cambiarActiva,
  crearPrestacion,
  editarPrestacion,
  listarPrestaciones,
} from './api';
import { cuerpoDe, metodoDe, PRESTACIONES_DE_PRUEBA, respuestaJson, simularApi, urlDe } from '../../test/catalogos';

describe('prestaciones/api', () => {
  it("lista el catálogo con la clave ['prestaciones']", async () => {
    const fetchSimulado = simularApi(() => respuestaJson(PRESTACIONES_DE_PRUEBA));

    const resultado = await listarPrestaciones();

    expect(resultado).toEqual(PRESTACIONES_DE_PRUEBA);
    expect(urlDe(fetchSimulado.mock.calls[0]![0]).pathname).toBe('/api/prestaciones');
  });

  it('Alta válida de una prestación', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(PRESTACIONES_DE_PRUEBA[0]));

    await crearPrestacion({ nombre: 'Limpieza', duracionMinutos: 30 });

    expect(metodoDe(fetchSimulado.mock.calls[0]![1])).toBe('POST');
    expect(cuerpoDe(fetchSimulado.mock.calls[0]![1])).toEqual({
      nombre: 'Limpieza',
      duracionMinutos: 30,
    });
  });

  it('Editar una prestación inactiva', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(PRESTACIONES_DE_PRUEBA[1]));

    await editarPrestacion(2, { nombre: 'Extracción simple', duracionMinutos: 40 });

    expect(metodoDe(fetchSimulado.mock.calls[0]![1])).toBe('PUT');
    expect(urlDe(fetchSimulado.mock.calls[0]![0]).pathname).toBe('/api/prestaciones/2');
    expect(cuerpoDe(fetchSimulado.mock.calls[0]![1])).toEqual({
      nombre: 'Extracción simple',
      duracionMinutos: 40,
    });
  });

  it('Desactivar sin borrar', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(PRESTACIONES_DE_PRUEBA[1]));

    await cambiarActiva(2, false);

    expect(metodoDe(fetchSimulado.mock.calls[0]![1])).toBe('PATCH');
    expect(urlDe(fetchSimulado.mock.calls[0]![0]).pathname).toBe('/api/prestaciones/2/activa');
    expect(cuerpoDe(fetchSimulado.mock.calls[0]![1])).toEqual({ activa: false });
  });

  it('Reactivar', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(PRESTACIONES_DE_PRUEBA[1]));

    await cambiarActiva(2, true);

    expect(urlDe(fetchSimulado.mock.calls[0]![0]).pathname).toBe('/api/prestaciones/2/activa');
    expect(cuerpoDe(fetchSimulado.mock.calls[0]![1])).toEqual({ activa: true });
  });
});
