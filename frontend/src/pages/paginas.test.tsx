import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderConRutas } from '../test/renderConRutas';

describe('web-app-shell · Página de inicio provisoria', () => {
  it('Inicio sin agenda: título "Inicio" y aviso de que la agenda va a aparecer ahí', async () => {
    renderConRutas('/');

    expect(screen.getByRole('heading', { level: 1, name: 'Inicio' })).toBeInTheDocument();
    expect(screen.getByText('La agenda todavía no está disponible')).toBeInTheDocument();
    expect(screen.getByText('Cuando esté lista, acá vas a ver los turnos del día.')).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Inicio · Agenda de Odontología'));
  });
});

describe('web-app-shell · Página para rutas inexistentes', () => {
  it('Ruta inexistente: título, enlace "Volver al inicio" a / y sin el código 404', async () => {
    renderConRutas('/ruta-que-no-existe');

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
    const { router } = renderConRutas('/ruta-que-no-existe');

    await usuario.click(screen.getByRole('link', { name: 'Volver al inicio' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Inicio' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });
});
