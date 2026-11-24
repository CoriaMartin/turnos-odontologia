import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { simularApiAgenda } from '../test/agenda';
import {
  PACIENTES_DE_PRUEBA,
  paginaDe,
  PRESTACIONES_DE_PRUEBA,
  respuestaJson,
  simularApi,
} from '../test/catalogos';
import { renderConRutas } from '../test/renderConRutas';

beforeEach(() => {
  simularApiAgenda();
});

// El requisito "Página de inicio provisoria" se retiró en C-16 (delta de web-app-shell): `/` es la agenda.
describe('web-app-shell · La ruta de inicio es la agenda (C-16)', () => {
  it('con sesión, / muestra la agenda y ya no el aviso provisorio', async () => {
    renderConRutas('/', { conSesion: true });

    expect(screen.getByRole('heading', { level: 1, name: 'Agenda' })).toBeInTheDocument();
    expect(screen.queryByText('La agenda todavía no está disponible')).not.toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Agenda · Agenda de Odontología'));
  });
});

describe('web-administracion · Rutas protegidas nuevas', () => {
  beforeEach(() => {
    simularApi((url) => {
      if (url.pathname.endsWith('/prestaciones')) return respuestaJson(PRESTACIONES_DE_PRUEBA);
      if (url.pathname.endsWith('/pacientes')) return respuestaJson(paginaDe(PACIENTES_DE_PRUEBA));
      return respuestaJson([]);
    });
  });

  it('/prestaciones muestra el catálogo dentro del layout', async () => {
    renderConRutas('/prestaciones', { conSesion: true });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Catálogo de prestaciones' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Prestaciones · Agenda de Odontología'));
  });

  it('/pacientes muestra el listado dentro del layout', async () => {
    renderConRutas('/pacientes', { conSesion: true });

    expect(screen.getByRole('heading', { level: 1, name: 'Pacientes' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Pacientes · Agenda de Odontología'));
  });
});

describe('web-app-shell · Página para rutas inexistentes', () => {
  it('Ruta inexistente: título, enlace "Volver al inicio" a / y sin el código 404', async () => {
    renderConRutas('/ruta-que-no-existe', { conSesion: true });

    expect(
      screen.getByRole('heading', { level: 1, name: 'No encontramos esta página' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
    expect(document.body).not.toHaveTextContent('404');
    await waitFor(() =>
      expect(document.title).toBe('Página no encontrada · Agenda de Odontología'),
    );
  });

  it('Volver al inicio desde la página inexistente muestra la página de inicio', async () => {
    const usuario = userEvent.setup();
    const { router } = renderConRutas('/ruta-que-no-existe', { conSesion: true });

    await usuario.click(screen.getByRole('link', { name: 'Volver al inicio' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Agenda' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });
});
