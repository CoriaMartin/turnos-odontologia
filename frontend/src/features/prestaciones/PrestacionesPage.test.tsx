import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import {
  cuerpoDe,
  metodoDe,
  PRESTACIONES_DE_PRUEBA,
  respuestaJson,
  simularApi,
  urlDe,
} from '../../test/catalogos';
import { quitarSimulacionDeAncho, simularAnchoDePantalla } from '../../test/agenda';
import { renderConRutas } from '../../test/renderConRutas';

function abrirCatalogo(manejador: Parameters<typeof simularApi>[0]) {
  const fetchSimulado = simularApi(manejador);
  return { ...renderConRutas('/prestaciones', { conSesion: true }), fetchSimulado };
}

const listar = () => respuestaJson(PRESTACIONES_DE_PRUEBA);

describe('PrestacionesPage', () => {
  afterEach(() => quitarSimulacionDeAncho());

  it('Abrir el catálogo de prestaciones', async () => {
    abrirCatalogo(listar);

    expect(screen.getByRole('heading', { name: 'Catálogo de prestaciones' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '+ Nueva prestación' }).length).toBeGreaterThan(0);
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(document.title).toBe('Prestaciones · Agenda de Odontología');
  });

  it('Catálogo con prestaciones activas e inactivas', async () => {
    abrirCatalogo(listar);

    const filas = await screen.findAllByRole('row');
    const limpieza = within(filas[1]!).getByText('Limpieza');
    const extraccion = within(filas[2]!).getByText('Extracción');
    expect(limpieza).toBeInTheDocument();
    expect(extraccion).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
    expect(screen.getByText('Inactiva')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('45 min')).toBeInTheDocument();
  });

  it('Catálogo en móvil', async () => {
    simularAnchoDePantalla(390);
    abrirCatalogo(listar);

    const tabla = await screen.findByRole('table');
    expect(within(tabla).getByText('Prestación')).toBeInTheDocument();
    expect(tabla.querySelectorAll('[data-label="Estado"]').length).toBe(2);
  });

  it('Catálogo vacío', async () => {
    abrirCatalogo(() => respuestaJson([]));

    expect(await screen.findByText('Todavía no cargaste prestaciones.')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '+ Nueva prestación' })).toHaveLength(2);
  });

  it('Cargando prestaciones', () => {
    abrirCatalogo(() => new Promise<Response>(() => undefined));

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(screen.getByLabelText('Listado de prestaciones')).toHaveAttribute('aria-busy', 'true');
  });

  it('Error al cargar prestaciones con reintento', async () => {
    let fallar = true;
    abrirCatalogo(() =>
      fallar
        ? Promise.resolve(
            new Response(JSON.stringify({ codigo: 'ERROR_INTERNO' }), {
              status: 500,
              headers: { 'Content-Type': 'application/problem+json' },
            }),
          )
        : listar(),
    );

    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent(
      'No pudimos cargar las prestaciones',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Algo falló de nuestro lado');
    expect(screen.getByRole('alert')).not.toHaveTextContent('ERROR_INTERNO');
    const reintentar = screen.getByRole('button', { name: 'Reintentar' });
    fallar = false;
    await userEvent.setup().click(reintentar);
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });

  it('Desactivar sin borrar', async () => {
    let activa = true;
    const { fetchSimulado } = abrirCatalogo((_url, init) => {
      if (metodoDe(init) === 'PATCH') {
        activa = cuerpoDe(init) === undefined ? activa : (cuerpoDe(init) as { activa: boolean }).activa;
        return respuestaJson({ ...PRESTACIONES_DE_PRUEBA[0]!, activa });
      }
      return respuestaJson([{ ...PRESTACIONES_DE_PRUEBA[0]!, activa }]);
    });

    const fila = (await screen.findAllByRole('row'))[1]!;
    const desactivar = await within(fila).findByRole('button', { name: 'Desactivar' });
    desactivar.click();

    await waitFor(() => {
      const llamadas = fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'PATCH');
      expect(llamadas).toHaveLength(1);
      expect(urlDe(llamadas[0]![0]).pathname).toBe('/api/prestaciones/1/activa');
      expect(cuerpoDe(llamadas[0]![1])).toEqual({ activa: false });
    });
  });

  it('Reactivar', async () => {
    const filaInactiva = async () => {
      const filas = await screen.findAllByRole('row');
      return filas.find((fila) => within(fila).queryByText('Extracción'))!;
    };
    const { fetchSimulado } = abrirCatalogo((_url, init) =>
      metodoDe(init) === 'PATCH' ? respuestaJson({ ...PRESTACIONES_DE_PRUEBA[1]!, activa: true }) : listar(),
    );

    const activar = await within(await filaInactiva()).findByRole('button', { name: 'Activar' });
    activar.click();

    await waitFor(() => {
      const llamadas = fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'PATCH');
      expect(llamadas).toHaveLength(1);
      expect(cuerpoDe(llamadas[0]![1])).toEqual({ activa: true });
    });
  });

  it('Fallo al cambiar el estado', async () => {
    abrirCatalogo((_url, init) =>
      metodoDe(init) === 'PATCH'
        ? Promise.resolve(
            new Response(JSON.stringify({ codigo: 'ERROR_INTERNO' }), {
              status: 500,
              headers: { 'Content-Type': 'application/problem+json' },
            }),
          )
        : listar(),
    );

    await screen.findByRole('table');
    screen.getAllByRole('button', { name: 'Desactivar' })[0]!.click();

    expect(await screen.findByRole('alert')).toHaveTextContent('Algo falló de nuestro lado');
    expect(screen.getByRole('alert')).not.toHaveTextContent('ERROR_INTERNO');
  });
});
