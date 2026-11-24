import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderConRutas } from '../test/renderConRutas';

describe('web-app-shell · Barra superior con la marca', () => {
  it('Página de inicio con la marca: logo con texto alternativo y nombre, sin rótulo provisorio', () => {
    renderConRutas('/');

    const barra = screen.getByRole('banner');
    expect(within(barra).getByRole('img', { name: 'Agenda de Odontología' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /provisorio/i })).not.toBeInTheDocument();
    expect(within(barra).getByText('Agenda de Odontología')).toBeInTheDocument();
    expect(screen.queryByText('Marca provisoria')).not.toBeInTheDocument();
  });

  it('Barra presente en una ruta inexistente', () => {
    renderConRutas('/ruta-que-no-existe');

    const barra = screen.getByRole('banner');
    expect(within(barra).getByRole('img', { name: 'Agenda de Odontología' })).toBeInTheDocument();
    expect(within(barra).getByText('Agenda de Odontología')).toBeInTheDocument();
  });
});

describe('web-app-shell · Área de contenido principal', () => {
  it('Contenido de la ruta en la región principal: un solo main con un h1', () => {
    renderConRutas('/');

    const regiones = screen.getAllByRole('main');
    expect(regiones).toHaveLength(1);
    expect(within(regiones[0]!).getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
