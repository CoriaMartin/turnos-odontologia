import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  PACIENTES_DE_PRUEBA,
  paginaDe,
  respuestaJson,
  simularApi,
  urlDe,
} from '../../test/catalogos';
import { renderConRutas } from '../../test/renderConRutas';

function abrirPacientes(
  manejador: Parameters<typeof simularApi>[0] = () => respuestaJson(paginaDe(PACIENTES_DE_PRUEBA)),
  ruta = '/pacientes',
) {
  const fetchSimulado = simularApi(manejador);
  const resultado = renderConRutas(ruta, { conSesion: true });
  return { ...resultado, fetchSimulado };
}

describe('PacientesPage', () => {
  it('Abrir pacientes', async () => {
    abrirPacientes();

    expect(screen.getByRole('heading', { name: 'Pacientes' })).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Nuevo paciente' })).toBeInTheDocument();
    expect(await screen.findByRole('list', { name: 'Listado de pacientes' })).toBeInTheDocument();
    expect(document.title).toBe('Pacientes · Agenda de Odontología');
  });

  it('Buscar por apellido sin tildes', async () => {
    const { fetchSimulado } = abrirPacientes((url) =>
      url.searchParams.get('q') === 'Gomez'
        ? respuestaJson(paginaDe([]))
        : respuestaJson(paginaDe(PACIENTES_DE_PRUEBA)),
    );
    const usuario = userEvent.setup();

    await usuario.type(screen.getByLabelText('Buscar paciente'), 'Gomez');
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      const urls = fetchSimulado.mock.calls.map(([entrada]) => urlDe(entrada));
      expect(urls.some((url) => url.searchParams.get('q') === 'Gomez')).toBe(true);
    });
    expect(await screen.findByText('No hay pacientes que coincidan con “Gomez”.')).toBeInTheDocument();
  });

  it('Buscar por DNI', async () => {
    const { fetchSimulado, router } = abrirPacientes(() =>
      respuestaJson(paginaDe([PACIENTES_DE_PRUEBA[0]!])),
    );
    const usuario = userEvent.setup();

    await usuario.type(screen.getByLabelText('Buscar paciente'), '32112334');
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => expect(router.state.location.search).toContain('q=32112334'));
    const url = urlDe(fetchSimulado.mock.calls.at(-1)![0]);
    expect(url.searchParams.get('q')).toBe('32112334');
  });

  it('Ir a la página siguiente', async () => {
    const { fetchSimulado, router } = abrirPacientes(() =>
      respuestaJson(paginaDe([PACIENTES_DE_PRUEBA[1]!], 45, 1)),
    );

    await screen.findByRole('list', { name: 'Listado de pacientes' });
    const siguiente = screen.getByRole('button', { name: 'Siguiente' });
    await userEvent.setup().click(siguiente);

    await waitFor(() => expect(router.state.location.search).toContain('page=1'));
    const url = urlDe(fetchSimulado.mock.calls.at(-1)![0]);
    expect(url.searchParams.get('page')).toBe('1');
    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 21 a 40 de 45 pacientes');
  });

  it('Volver atrás tras buscar', async () => {
    const { router } = abrirPacientes();
    const usuario = userEvent.setup();

    await screen.findByRole('list', { name: 'Listado de pacientes' });
    await usuario.type(screen.getByLabelText('Buscar paciente'), 'Gómez');
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));
    await waitFor(() => expect(router.state.location.search).toContain('q='));

    await act(async () => {
      await router.navigate(-1);
    });

    await waitFor(() => expect(screen.getByLabelText('Buscar paciente')).toHaveValue(''));
  });

  it('Sin resultados', async () => {
    abrirPacientes((url) =>
      url.searchParams.get('q') === 'Zzz'
        ? respuestaJson(paginaDe([]))
        : respuestaJson(paginaDe(PACIENTES_DE_PRUEBA)),
    );
    const usuario = userEvent.setup();

    await screen.findByRole('list', { name: 'Listado de pacientes' });
    await usuario.type(screen.getByLabelText('Buscar paciente'), 'Zzz');
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      await screen.findByText('No hay pacientes que coincidan con “Zzz”.'),
    ).toBeInTheDocument();
  });

  it('Paciente con consentimiento y obra social', async () => {
    abrirPacientes();

    const lista = await screen.findByRole('list', { name: 'Listado de pacientes' });
    const primerPaciente = within(lista).getAllByRole('listitem')[0]!;
    expect(within(primerPaciente).getByText('Gómez, Patricia')).toBeInTheDocument();
    expect(within(primerPaciente).getByText('DNI 32.112.334')).toBeInTheDocument();
    expect(within(primerPaciente).getByText('Swiss Medical · Nº 987654321')).toBeInTheDocument();
    expect(within(primerPaciente).getByText('patricia@example.com')).toBeInTheDocument();
    expect(within(primerPaciente).getByText('Acepta recordatorios')).toBeInTheDocument();
  });

  it('Paciente sin email', async () => {
    abrirPacientes();

    const lista = await screen.findByRole('list', { name: 'Listado de pacientes' });
    const segundo = within(lista).getAllByRole('listitem')[1]!;
    expect(within(segundo).getByText('DNI 30.123.456')).toBeInTheDocument();
    expect(within(segundo).getByText('Sin email cargado')).toBeInTheDocument();
    expect(within(segundo).getByText('No recibe recordatorios')).toBeInTheDocument();
  });

  it('Paciente que no acepta recordatorios', async () => {
    abrirPacientes(() =>
      respuestaJson(
        paginaDe([
          {
            ...PACIENTES_DE_PRUEBA[0]!,
            aceptaRecordatorios: false,
          },
        ]),
      ),
    );

    const lista = await screen.findByRole('list', { name: 'Listado de pacientes' });
    expect(within(lista).getByText('No acepta recordatorios')).toBeInTheDocument();
  });

  it('Cargando pacientes', () => {
    abrirPacientes(() => new Promise<Response>(() => undefined));

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(screen.getByLabelText('Resultados de la búsqueda de pacientes')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('Error al cargar con reintento', async () => {
    let fallar = true;
    abrirPacientes(() =>
      fallar
        ? Promise.resolve(
            new Response(JSON.stringify({ codigo: 'SIN_CONEXION' }), {
              status: 503,
              headers: { 'Content-Type': 'application/problem+json' },
            }),
          )
        : respuestaJson(paginaDe(PACIENTES_DE_PRUEBA)),
    );

    const aviso = await screen.findByRole('alert', {}, { timeout: 3000 });
    expect(aviso).toHaveTextContent('No pudimos cargar los pacientes');
    expect(aviso).toHaveTextContent('No pudimos conectarnos con el servidor');
    expect(aviso).not.toHaveTextContent('SIN_CONEXION');
    const reintentar = screen.getByRole('button', { name: 'Reintentar' });
    fallar = false;
    await userEvent.setup().click(reintentar);
    expect(await screen.findByRole('list', { name: 'Listado de pacientes' })).toBeInTheDocument();
  });
});
