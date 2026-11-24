import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  cuerpoDe,
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

async function abrirNuevo() {
  const usuario = userEvent.setup();
  await usuario.click(await screen.findByRole('button', { name: '+ Nuevo paciente' }));
  const dialogo = await screen.findByRole('dialog');
  expect(dialogo).toHaveAttribute('aria-labelledby', 'titulo-paciente');
  expect(dialogo).toHaveAttribute('aria-describedby', 'ayuda-paciente');
  return { usuario, dialogo };
}

const listar = () => respuestaJson(paginaDe(PACIENTES_DE_PRUEBA));

describe('FormularioPaciente', () => {
  it('Alta con datos mínimos', async () => {
    const fetchSimulado = abrirCon((_url, init) =>
      metodoDe(init) === 'GET' ? listar() : respuestaJson(PACIENTES_DE_PRUEBA[1]!),
    );
    const { usuario } = await abrirNuevo();

    await usuario.type(screen.getByLabelText('Nombre'), 'Juan');
    await usuario.type(screen.getByLabelText('Apellido'), 'Pérez');
    await usuario.type(screen.getByLabelText('DNI'), '30123456');
    await usuario.click(screen.getByRole('button', { name: 'Guardar paciente' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const alta = fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'POST');
    expect(cuerpoDe(alta[0]![1])).toEqual({
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

  it('DNI escrito con puntos', async () => {
    const fetchSimulado = abrirCon((_url, init) =>
      metodoDe(init) === 'GET' ? listar() : respuestaJson(PACIENTES_DE_PRUEBA[0]!),
    );
    const { usuario } = await abrirNuevo();

    await usuario.type(screen.getByLabelText('Nombre'), 'Patricia');
    await usuario.type(screen.getByLabelText('Apellido'), 'Gómez');
    await usuario.type(screen.getByLabelText('DNI'), '30.123.456');
    await usuario.click(screen.getByRole('button', { name: 'Guardar paciente' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const alta = fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'POST');
    expect((cuerpoDe(alta[0]![1]) as { dni: string }).dni).toBe('30123456');
  });

  it('Edición del consentimiento', async () => {
    const fetchSimulado = abrirCon((_url, init) =>
      metodoDe(init) === 'GET' ? listar() : respuestaJson(PACIENTES_DE_PRUEBA[0]!),
    );
    const usuario = userEvent.setup();
    await screen.findByRole('list', { name: 'Listado de pacientes' });
    const botonesEditar = screen.getAllByRole('button', { name: 'Editar' });
    await usuario.click(botonesEditar[0]!);

    const dialogo = await screen.findByRole('dialog');
    expect(within(dialogo).getByLabelText(/Acepta recordatorios por email/)).toBeChecked();
    await usuario.click(within(dialogo).getByLabelText(/Acepta recordatorios por email/));
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar paciente' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const edicion = fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'PUT');
    expect((cuerpoDe(edicion[0]![1]) as { aceptaRecordatorios: boolean }).aceptaRecordatorios).toBe(
      false,
    );
  });

  it('DNI ya usado por otro paciente', async () => {
    abrirCon((_url, init) =>
      metodoDe(init) === 'GET'
        ? listar()
        : Promise.resolve(
            new Response(JSON.stringify({ codigo: 'DNI_DUPLICADO' }), {
              status: 409,
              headers: { 'Content-Type': 'application/problem+json' },
            }),
          ),
    );
    const { usuario } = await abrirNuevo();

    await usuario.type(screen.getByLabelText('Nombre'), 'Patricia');
    await usuario.type(screen.getByLabelText('Apellido'), 'Gómez');
    await usuario.type(screen.getByLabelText('DNI'), '32112334');
    await usuario.click(screen.getByRole('button', { name: 'Guardar paciente' }));

    expect(
      await screen.findByText(
        'Ese DNI ya pertenece a otro paciente. Revisalo o buscá al paciente existente.',
      ),
    ).toHaveAttribute('role', 'alert');
    expect(screen.getByLabelText('DNI')).toHaveAttribute('aria-invalid', 'true');
  });

  it('Email mal formado', async () => {
    const fetchSimulado = abrirCon(listar);
    const { usuario } = await abrirNuevo();

    await usuario.type(screen.getByLabelText('Nombre'), 'Patricia');
    await usuario.type(screen.getByLabelText('Apellido'), 'Gómez');
    await usuario.type(screen.getByLabelText('DNI'), '32112334');
    await usuario.type(screen.getByLabelText('Email'), 'patricia@');
    await usuario.click(screen.getByRole('button', { name: 'Guardar paciente' }));

    expect(
      await screen.findByText('Revisá el email: falta la parte después del arroba.'),
    ).toHaveAttribute('role', 'alert');
    expect(fetchSimulado.mock.calls.filter(([, init]) => metodoDe(init) === 'POST')).toHaveLength(0);
  });

  it('Campo inválido anunciado', async () => {
    abrirCon(listar);
    const { usuario } = await abrirNuevo();

    await usuario.click(screen.getByRole('button', { name: 'Guardar paciente' }));

    const nombre = screen.getByLabelText('Nombre');
    expect(nombre).toHaveAttribute('aria-invalid', 'true');
    expect(nombre).toHaveAttribute('aria-describedby', 'error-paciente-nombre');
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });

  it('Diálogo con nombre accesible', async () => {
    abrirCon(listar);
    const { dialogo } = await abrirNuevo();

    expect(dialogo).toHaveAttribute('role', 'dialog');
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(within(dialogo).getByRole('heading', { name: 'Nuevo paciente' })).toBeInTheDocument();
  });
});
