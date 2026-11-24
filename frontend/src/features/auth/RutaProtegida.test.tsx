import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { simularApiAgenda } from '../../test/agenda';
import { renderConRutas } from '../../test/renderConRutas';
import { iniciarSesion, reiniciarSesion } from './sesion';

describe('web-sesion · Rutas protegidas', () => {
  it('Inicio sin sesión: muestra la página de inicio de sesión', async () => {
    const { router } = renderConRutas('/');

    expect(await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({ desde: '/' });
    expect(screen.queryByRole('heading', { name: 'Agenda' })).not.toBeInTheDocument();
  });

  it('Ruta inexistente sin sesión: muestra la página de inicio de sesión', async () => {
    const { router } = renderConRutas('/ruta-que-no-existe');

    expect(await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(screen.queryByText('No encontramos esta página')).not.toBeInTheDocument();
  });

  it('Recarga de la página: la sesión en memoria se pierde y se vuelve a /login', async () => {
    // Una recarga vuelve a evaluar los módulos: la sesión en memoria arranca vacía.
    iniciarSesion('token-antes-de-recargar', '2999-01-01T00:00:00Z');
    reiniciarSesion();

    const { router } = renderConRutas('/');

    expect(await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(screen.queryByText('Tu sesión venció')).not.toBeInTheDocument();
  });

  it('con sesión iniciada muestra la ruta pedida', () => {
    simularApiAgenda();
    renderConRutas('/', { conSesion: true });
    expect(screen.getByRole('heading', { level: 1, name: 'Agenda' })).toBeInTheDocument();
  });
});
