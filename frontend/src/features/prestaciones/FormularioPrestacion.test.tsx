import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  cuerpoDe,
  metodoDe,
  PRESTACIONES_DE_PRUEBA,
  respuestaJson,
  simularApi,
} from '../../test/catalogos';
import { renderConRutas } from '../../test/renderConRutas';

function abrirCon(manejador: Parameters<typeof simularApi>[0]) {
  const fetchSimulado = simularApi(manejador);
  renderConRutas('/prestaciones', { conSesion: true });
  return fetchSimulado;
}

async function abrirNueva() {
  const usuario = userEvent.setup();
  const botones = await screen.findAllByRole('button', { name: '+ Nueva prestación' });
  await usuario.click(botones[0]!);
  expect(await screen.findByRole('dialog')).toHaveAttribute('aria-labelledby', 'titulo-prestacion');
  return usuario;
}

const listar = () => respuestaJson(PRESTACIONES_DE_PRUEBA);

describe('FormularioPrestacion', () => {
  it('Alta válida de una prestación', async () => {
    const fetchSimulado = abrirCon((_url, init) =>
      metodoDe(init) === 'GET'
        ? listar()
        : respuestaJson({ id: 3, nombre: 'Control', duracionMinutos: 20, activa: true }),
    );
    const usuario = await abrirNueva();

    await usuario.type(screen.getByLabelText('Nombre'), 'Control');
    await usuario.clear(screen.getByLabelText('Duración (minutos)'));
    await usuario.type(screen.getByLabelText('Duración (minutos)'), '20');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const alta = fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'POST');
    expect(alta).toHaveLength(1);
    expect(cuerpoDe(alta[0]![1])).toEqual({ nombre: 'Control', duracionMinutos: 20 });
  });

  it('Editar una prestación inactiva', async () => {
    const fetchSimulado = abrirCon((_url, init) =>
      metodoDe(init) === 'GET'
        ? listar()
        : respuestaJson({ id: 2, nombre: 'Extracción', duracionMinutos: 50, activa: false }),
    );
    const usuario = userEvent.setup();
    const filas = await screen.findAllByRole('row');
    await usuario.click(within(filas[2]!).getByRole('button', { name: 'Editar' }));

    const dialogo = await screen.findByRole('dialog');
    expect(within(dialogo).getByRole('heading', { name: 'Editar prestación' })).toBeInTheDocument();
    await usuario.clear(within(dialogo).getByLabelText('Duración (minutos)'));
    await usuario.type(within(dialogo).getByLabelText('Duración (minutos)'), '50');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const edicion = fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'PUT');
    expect(cuerpoDe(edicion[0]![1])).toEqual({ nombre: 'Extracción', duracionMinutos: 50 });
  });

  it('Nombre ya existente', async () => {
    abrirCon((_url, init) =>
      metodoDe(init) === 'GET'
        ? listar()
        : Promise.resolve(
            new Response(JSON.stringify({ codigo: 'NOMBRE_DUPLICADO' }), {
              status: 409,
              headers: { 'Content-Type': 'application/problem+json' },
            }),
          ),
    );
    const usuario = await abrirNueva();

    await usuario.type(screen.getByLabelText('Nombre'), 'Limpieza');
    await usuario.type(screen.getByLabelText('Duración (minutos)'), '30');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    const error = await screen.findByText('Ya tenés una prestación con ese nombre. Probá con otro.');
    expect(error).toHaveAttribute('role', 'alert');
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Duración fuera del rango', async () => {
    const fetchSimulado = abrirCon(listar);
    const usuario = await abrirNueva();

    await usuario.type(screen.getByLabelText('Nombre'), 'Control');
    await usuario.type(screen.getByLabelText('Duración (minutos)'), '4');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Entre 5 y 480 minutos.')).toHaveAttribute('role', 'alert');
    expect(screen.getByLabelText('Duración (minutos)')).toHaveAttribute('aria-invalid', 'true');
    expect(fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'POST')).toHaveLength(0);
  });

  it('Cancelar el diálogo', async () => {
    abrirCon(listar);
    const usuario = await abrirNueva();

    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Error sin código técnico', async () => {
    abrirCon((_url, init) =>
      metodoDe(init) === 'GET'
        ? listar()
        : Promise.resolve(
            new Response(JSON.stringify({ codigo: 'ERROR_INTERNO' }), {
              status: 500,
              headers: { 'Content-Type': 'application/problem+json' },
            }),
          ),
    );
    const usuario = await abrirNueva();

    await usuario.type(screen.getByLabelText('Nombre'), 'Control');
    await usuario.type(screen.getByLabelText('Duración (minutos)'), '20');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent('Algo falló de nuestro lado');
    expect(aviso).not.toHaveTextContent('ERROR_INTERNO');
  });
});
