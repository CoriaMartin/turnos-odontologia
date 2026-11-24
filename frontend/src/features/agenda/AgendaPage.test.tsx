import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  abrirAgenda,
  fijarAhora,
  periodosPedidos,
  quitarSimulacionDeAncho,
  simularAnchoDePantalla,
  simularApiAgenda,
} from '../../test/agenda';
import { turno } from './turnosDePrueba';

let fetchSimulado: ReturnType<typeof simularApiAgenda>;

beforeEach(() => {
  fijarAhora();
  fetchSimulado = simularApiAgenda();
});

afterEach(() => {
  vi.useRealTimers();
  quitarSimulacionDeAncho();
});

function periodo() {
  return screen.getByRole('heading', { level: 1, name: 'Agenda' }).nextElementSibling?.textContent;
}

describe('web-agenda · Agenda en la ruta de inicio', () => {
  it('Abrir la agenda sin parámetros: título "Agenda" y el día de hoy', async () => {
    abrirAgenda('/');

    expect(screen.getByRole('heading', { level: 1, name: 'Agenda' })).toBeInTheDocument();
    expect(periodo()).toBe('Miércoles 2 de diciembre de 2026');
    await waitFor(() => expect(document.title).toBe('Agenda · Agenda de Odontología'));
  });

  it('Hoy según la zona del consultorio: 01:30 UTC del 3/12 muestra el miércoles 2', () => {
    fijarAhora('2026-12-03T01:30:00Z');
    abrirAgenda('/');

    expect(periodo()).toBe('Miércoles 2 de diciembre de 2026');
  });

  it('Cantidad de turnos del período: cuenta solo los activos', async () => {
    simularApiAgenda({
      '2026-12-02T00:00:00-03:00': [
        turno({ inicio: '09:00', fin: '09:30' }),
        turno({ inicio: '11:00', fin: '11:30' }),
        turno({ inicio: '12:00', fin: '12:30', estado: 'CANCELADO' }),
      ],
    });
    abrirAgenda('/');

    await waitFor(() => expect(periodo()).toBe('Miércoles 2 de diciembre de 2026 · 2 turnos'));
  });
});

describe('web-agenda · Vista por defecto según el ancho de pantalla', () => {
  it('Móvil abre en la vista diaria', () => {
    simularAnchoDePantalla(390);
    abrirAgenda('/');

    expect(screen.getByRole('button', { name: 'Día' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Semana' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('Escritorio abre en la vista semanal', () => {
    simularAnchoDePantalla(1440);
    abrirAgenda('/');

    expect(screen.getByRole('button', { name: 'Semana' })).toHaveAttribute('aria-pressed', 'true');
    expect(periodo()).toBe('Semana del 30 de noviembre al 6 de diciembre de 2026');
  });

  it('Cambiar de vista: de la diaria a la semana que la contiene, con vista=semana en la URL', async () => {
    const usuario = userEvent.setup();
    const { router } = abrirAgenda('/?fecha=2026-12-02&vista=dia');

    await usuario.click(screen.getByRole('button', { name: 'Semana' }));

    expect(periodo()).toBe('Semana del 30 de noviembre al 6 de diciembre de 2026');
    expect(router.state.location.search).toContain('vista=semana');
  });
});

describe('web-agenda · Fecha y vista en la URL', () => {
  it('Abrir un día por URL', () => {
    abrirAgenda('/?fecha=2026-12-10&vista=dia');

    expect(periodo()).toBe('Jueves 10 de diciembre de 2026');
  });

  it('Fecha inválida en la URL: muestra hoy sin mensaje de error', () => {
    abrirAgenda('/?fecha=2026-13-45&vista=dia');

    expect(periodo()).toBe('Miércoles 2 de diciembre de 2026');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('Volver atrás después de navegar', async () => {
    const usuario = userEvent.setup();
    const { router } = abrirAgenda('/?fecha=2026-12-02&vista=dia');

    await usuario.click(screen.getByRole('button', { name: 'Día siguiente' }));
    expect(periodo()).toBe('Jueves 3 de diciembre de 2026');

    await act(() => router.navigate(-1));
    expect(periodo()).toBe('Miércoles 2 de diciembre de 2026');
  });
});

describe('web-agenda · Navegación entre fechas', () => {
  it('Día siguiente', async () => {
    const usuario = userEvent.setup();
    abrirAgenda('/?fecha=2026-12-02&vista=dia');

    await usuario.click(screen.getByRole('button', { name: 'Día siguiente' }));

    expect(periodo()).toBe('Jueves 3 de diciembre de 2026');
  });

  it('Semana anterior', async () => {
    const usuario = userEvent.setup();
    abrirAgenda('/?fecha=2026-11-30&vista=semana');

    await usuario.click(screen.getByRole('button', { name: 'Semana anterior' }));

    expect(periodo()).toBe('Semana del 23 al 29 de noviembre de 2026');
  });

  it('Volver a hoy sin cambiar la vista', async () => {
    const usuario = userEvent.setup();
    abrirAgenda('/?fecha=2026-12-20&vista=dia');

    await usuario.click(screen.getByRole('button', { name: 'Hoy' }));

    expect(periodo()).toBe('Miércoles 2 de diciembre de 2026');
    expect(screen.getByRole('button', { name: 'Día' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('Elegir una fecha con el campo "Fecha"', () => {
    abrirAgenda('/?fecha=2026-12-02&vista=dia');

    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-12-15' } });

    expect(periodo()).toBe('Martes 15 de diciembre de 2026');
  });
});

describe('web-agenda · Período pedido a la API', () => {
  it('Rango de la vista diaria', async () => {
    abrirAgenda('/?fecha=2026-12-02&vista=dia');

    await waitFor(() =>
      expect(periodosPedidos(fetchSimulado)).toContainEqual({
        desde: '2026-12-02T00:00:00-03:00',
        hasta: '2026-12-03T00:00:00-03:00',
      }),
    );
    expect(String(fetchSimulado.mock.calls[0]?.[0])).not.toContain('incluirCancelados');
  });

  it('Rango de la vista semanal', async () => {
    abrirAgenda('/?fecha=2026-12-02&vista=semana');

    await waitFor(() =>
      expect(periodosPedidos(fetchSimulado)).toContainEqual({
        desde: '2026-11-30T00:00:00-03:00',
        hasta: '2026-12-07T00:00:00-03:00',
      }),
    );
  });
});
