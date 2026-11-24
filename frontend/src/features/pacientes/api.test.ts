import { describe, expect, it } from 'vitest';
import { buscarPacientes, crearPaciente, darDeBajaPaciente, editarPaciente } from './api';
import { cuerpoDe, metodoDe, PACIENTES_DE_PRUEBA, paginaDe, respuestaJson, simularApi, urlDe } from '../../test/catalogos';

describe('pacientes/api', () => {
  it('Buscar por apellido sin tildes', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(paginaDe(PACIENTES_DE_PRUEBA)));

    const resultado = await buscarPacientes({ q: 'Gomez', pagina: 0 });

    const url = urlDe(fetchSimulado.mock.calls[0]![0]);
    expect(url.pathname).toBe('/api/pacientes');
    expect(url.searchParams.get('q')).toBe('Gomez');
    expect(url.searchParams.get('page')).toBe('0');
    expect(url.searchParams.get('size')).toBe('20');
    expect(resultado.contenido).toHaveLength(2);
  });

  it('Buscar por DNI', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(paginaDe([PACIENTES_DE_PRUEBA[0]!])));

    await buscarPacientes({ q: '32112334', pagina: 0 });

    expect(urlDe(fetchSimulado.mock.calls[0]![0]).searchParams.get('q')).toBe('32112334');
  });

  it('Ir a la página siguiente', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(paginaDe([], 45, 1)));

    await buscarPacientes({ q: '', pagina: 1 });

    expect(urlDe(fetchSimulado.mock.calls[0]![0]).searchParams.get('page')).toBe('1');
    expect(urlDe(fetchSimulado.mock.calls[0]![0]).searchParams.get('size')).toBe('20');
  });

  it('Alta con datos mínimos', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(PACIENTES_DE_PRUEBA[1]));

    await crearPaciente({
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '30123456',
      fechaNacimiento: null,
      telefono: null,
      email: null,
      obraSocial: null,
      numeroAfiliado: null,
      aceptaRecordatorios: false,
    });

    expect(metodoDe(fetchSimulado.mock.calls[0]![1])).toBe('POST');
    expect(cuerpoDe(fetchSimulado.mock.calls[0]![1])).toEqual({
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '30123456',
      fechaNacimiento: null,
      telefono: null,
      email: null,
      obraSocial: null,
      numeroAfiliado: null,
      aceptaRecordatorios: false,
    });
  });

  it('editar y dar de baja usan el id correcto', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(PACIENTES_DE_PRUEBA[0]!));
    const datos = {
      nombre: 'Patricia',
      apellido: 'Gómez',
      dni: '32112334',
      fechaNacimiento: null,
      telefono: null,
      email: null,
      obraSocial: null,
      numeroAfiliado: null,
      aceptaRecordatorios: false,
    };

    await editarPaciente(1, datos);
    await darDeBajaPaciente(1);

    expect(metodoDe(fetchSimulado.mock.calls[0]![1])).toBe('PUT');
    expect(urlDe(fetchSimulado.mock.calls[0]![0]).pathname).toBe('/api/pacientes/1');
    expect(metodoDe(fetchSimulado.mock.calls[1]![1])).toBe('DELETE');
    expect(urlDe(fetchSimulado.mock.calls[1]![0]).pathname).toBe('/api/pacientes/1');
  });
});
