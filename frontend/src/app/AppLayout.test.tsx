import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderConRutas } from '../test/renderConRutas';

describe('web-app-shell · Barra superior con la marca', () => {
  it('Página de inicio con la marca: logo, nombre y "Cerrar sesión", sin rótulo provisorio', () => {
    renderConRutas('/', { conSesion: true });

    const barra = screen.getByRole('banner');
    expect(within(barra).getByRole('img', { name: 'Agenda de Odontología' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /provisorio/i })).not.toBeInTheDocument();
    expect(within(barra).getByText('Agenda de Odontología')).toBeInTheDocument();
    expect(within(barra).getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
    expect(screen.queryByText('Marca provisoria')).not.toBeInTheDocument();
  });

  it('Barra presente en una ruta inexistente, con "Cerrar sesión"', () => {
    renderConRutas('/ruta-que-no-existe', { conSesion: true });

    const barra = screen.getByRole('banner');
    expect(within(barra).getByRole('img', { name: 'Agenda de Odontología' })).toBeInTheDocument();
    expect(within(barra).getByText('Agenda de Odontología')).toBeInTheDocument();
    expect(within(barra).getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });

  it('Login sin barra superior ni "Cerrar sesión"', () => {
    renderConRutas('/login');

    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument();
  });
});

describe('web-app-shell · Área de contenido principal', () => {
  it('Contenido de la ruta en la región principal: un solo main con un h1', () => {
    renderConRutas('/', { conSesion: true });

    const regiones = screen.getAllByRole('main');
    expect(regiones).toHaveLength(1);
    expect(within(regiones[0]!).getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('Región principal en el login: un solo main con un h1', () => {
    renderConRutas('/login');

    const regiones = screen.getAllByRole('main');
    expect(regiones).toHaveLength(1);
    expect(within(regiones[0]!).getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
