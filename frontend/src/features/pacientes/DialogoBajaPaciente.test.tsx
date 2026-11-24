import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  metodoDe,
  PACIENTES_DE_PRUEBA,
  paginaDe,
  respuestaJson,
  simularApi,
} from '../../test/catalogos';
import { renderConRutas } from '../../test/renderConRutas';

function abrirCon(manejador: Parameters<typeof simularApi>[0]) {
  const fetchSimulado = simularApi(manejador);
  renderConRutas('/pacientes', { conSesion: true });
  return fetchSimulado;
}

async function abrirBaja() {
  const usuario = userEvent.setup();
  const lista = await screen.findByRole('list', { name: 'Listado de pacientes' });
  await usuario.click(within(lista).getAllByRole('button', { name: 'Dar de baja' })[0]!);
  return { usuario, dialogo: await screen.findByRole('dialog') };
}

const listar = () => respuestaJson(paginaDe(PACIENTES_DE_PRUEBA));

describe('DialogoBajaPaciente', () => {
  it('Baja confirmada', async () => {
    const fetchSimulado = abrirCon((_url, init) =>
      metodoDe(init) === 'GET' ? listar() : respuestaJson({ ...PACIENTES_DE_PRUEBA[0]!, activo: false }),
    );
    const { usuario, dialogo } = await abrirBaja();

    await usuario.click(within(dialogo).getByRole('button', { name: 'Dar de baja' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const bajas = fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'DELETE');
    expect(bajas).toHaveLength(1);
  });

  it('Baja bloqueada por turnos futuros', async () => {
    abrirCon((_url, init) =>
      metodoDe(init) === 'GET'
        ? listar()
        : Promise.resolve(
            new Response(JSON.stringify({ codigo: 'PACIENTE_CON_TURNOS_FUTUROS' }), {
              status: 409,
              headers: { 'Content-Type': 'application/problem+json' },
            }),
          ),
    );
    const { usuario } = await abrirBaja();

    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Dar de baja' }));

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent(
      'No pudimos dar de baja a este paciente porque tiene un turno programado. Cancelá o reprogramá ese turno y probá de nuevo.',
    );
    expect(aviso).not.toHaveTextContent('PACIENTE_CON_TURNOS_FUTUROS');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Cancelar la confirmación', async () => {
    const fetchSimulado = abrirCon(listar);
    const { usuario } = await abrirBaja();

    await usuario.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'DELETE')).toHaveLength(0);
  });

  it('Diálogo con nombre accesible', async () => {
    abrirCon(listar);
    const { dialogo } = await abrirBaja();

    expect(dialogo).toHaveAttribute('aria-labelledby', 'titulo-baja');
    expect(dialogo).toHaveAttribute('aria-describedby', 'ayuda-baja');
    expect(
      within(dialogo).getByRole('heading', { name: '¿Dar de baja a Patricia Gómez?' }),
    ).toBeInTheDocument();
  });
});
