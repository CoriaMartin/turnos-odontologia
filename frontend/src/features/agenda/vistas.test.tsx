import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  abrirAgenda,
  fijarAhora,
  quitarSimulacionDeAncho,
  simularAnchoDePantalla,
  simularApiAgenda,
} from '../../test/agenda';
import { turno } from './turnosDePrueba';

const DIA = '2026-12-02T00:00:00-03:00';
const SEMANA = '2026-11-30T00:00:00-03:00';

beforeEach(() => fijarAhora());

afterEach(() => {
  vi.useRealTimers();
  quitarSimulacionDeAncho();
});

function region() {
  return screen.getByRole('region', { name: /^Agenda (diaria|semanal):/ });
}

describe('web-agenda · Datos visibles de cada turno', () => {
  it('Turno programado: horario, paciente, prestación y badge, con nombre accesible completo', async () => {
    simularApiAgenda({ [DIA]: [turno({ inicio: '10:00', fin: '10:45' })] });
    abrirAgenda('/?fecha=2026-12-02&vista=dia');

    const tarjeta = await screen.findByRole('article', {
      name: '10:00 a 10:45, Paciente Ficticio Tres, Limpieza, Programado',
    });
    expect(tarjeta).toHaveTextContent('10:00 – 10:45');
    expect(tarjeta).toHaveTextContent('Paciente Ficticio Tres · Limpieza');
    expect(within(tarjeta).getByText('Programado')).toBeInTheDocument();
  });

  it('Turno en la cuadrícula semanal: hora de inicio, apellido y estado en texto', async () => {
    simularAnchoDePantalla(1440);
    simularApiAgenda({ [SEMANA]: [turno({ inicio: '10:00', fin: '10:45' })] });
    abrirAgenda('/?fecha=2026-12-02&vista=semana');

    const tarjeta = await screen.findByRole('article', {
      name: '10:00 a 10:45, Paciente Ficticio Tres, Limpieza, Programado',
    });
    expect(within(tarjeta).getByText('10:00')).toBeInTheDocument();
    expect(within(tarjeta).getByText('Ficticio Tres')).toBeInTheDocument();
    expect(within(tarjeta).getByText('Programado')).toBeInTheDocument();
  });
});

describe('web-agenda · Badge de cada estado', () => {
  it('Turnos en los cinco estados: badges en español y sin nombres técnicos', async () => {
    simularAnchoDePantalla(1440);
    simularApiAgenda({
      [DIA]: [
        turno({ inicio: '09:00', fin: '09:30', estado: 'PROGRAMADO' }),
        turno({ inicio: '09:30', fin: '10:00', estado: 'ATENDIDO' }),
        turno({ inicio: '10:00', fin: '10:30', estado: 'AUSENTE' }),
        turno({ inicio: '10:30', fin: '11:00', estado: 'CANCELADO' }),
        turno({ inicio: '11:00', fin: '11:30', estado: 'CANCELADO_TARDIO' }),
      ],
    });
    abrirAgenda('/?fecha=2026-12-02&vista=dia');

    await screen.findAllByRole('article');
    const agenda = region();
    for (const etiqueta of ['Programado', 'Atendido', 'Ausente', 'Cancelado', 'Cancelación tardía']) {
      expect(within(agenda).getByText(etiqueta)).toBeInTheDocument();
    }
    expect(document.body).not.toHaveTextContent('CANCELADO_TARDIO');
    expect(document.body).not.toHaveTextContent('PROGRAMADO');
  });

  it('en móvil el carril angosto abrevia "Tardía" pero el nombre accesible dice "Cancelación tardía"', async () => {
    simularApiAgenda({ [DIA]: [turno({ inicio: '11:00', fin: '11:30', estado: 'CANCELADO_TARDIO' })] });
    abrirAgenda('/?fecha=2026-12-02&vista=dia');

    const cancelado = await screen.findByRole('article', { name: /Cancelación tardía$/ });
    expect(within(cancelado).getByText('Tardía')).toBeInTheDocument();
  });
});

describe('web-agenda · Cancelados distinguibles que no ocupan el horario', () => {
  it('Cancelado y turno nuevo en el mismo horario: los dos completos y el activo sin achicarse', async () => {
    simularApiAgenda({
      [DIA]: [
        turno({ inicio: '11:00', fin: '11:30', estado: 'CANCELADO_TARDIO', apellido: 'Ficticio Uno' }),
        turno({ inicio: '11:00', fin: '11:30', estado: 'PROGRAMADO', apellido: 'Ficticio Dos' }),
      ],
    });
    abrirAgenda('/?fecha=2026-12-02&vista=dia');

    const activo = await screen.findByRole('article', { name: /Ficticio Dos, Limpieza, Programado$/ });
    const cancelado = screen.getByRole('article', { name: /Ficticio Uno, Limpieza, Cancelación tardía$/ });

    expect(within(screen.getByRole('group', { name: 'Turnos activos' })).getByRole('article')).toBe(activo);
    expect(within(screen.getByRole('group', { name: 'Cancelados' })).getByRole('article')).toBe(cancelado);
    // Misma ubicación y alto que tendría solo: 11:00 es la franja 6 desde las 08:00, y dura una franja.
    expect(activo.style.top).toBe('calc(var(--agenda-slot-height) * 6)');
    expect(activo.style.height).toBe('calc(var(--agenda-slot-height) * 1 - var(--space-1))');
    expect(cancelado).toHaveTextContent('11:00 – 11:30');
  });

  it('Cancelado marcado más allá del color: badge "Cancelado" y horario y paciente tachados', async () => {
    simularApiAgenda({ [DIA]: [turno({ inicio: '12:00', fin: '12:30', estado: 'CANCELADO' })] });
    abrirAgenda('/?fecha=2026-12-02&vista=dia');

    const cancelado = await screen.findByRole('article', { name: /Cancelado$/ });
    expect(within(cancelado).getByText('Cancelado')).toBeInTheDocument();
    // jsdom no expande el shorthand `text-decoration` a `text-decoration-line`.
    expect(getComputedStyle(within(cancelado).getByText('12:00 – 12:30')).textDecoration).toContain(
      'line-through',
    );
    expect(getComputedStyle(within(cancelado).getByText('Paciente Ficticio Tres')).textDecoration).toContain(
      'line-through',
    );
  });
});

describe('web-agenda · Vista semanal', () => {
  it('Turnos en distintos días: cada uno bajo la columna de su día', async () => {
    simularAnchoDePantalla(1440);
    simularApiAgenda({
      [SEMANA]: [
        turno({ fecha: '2026-11-30', inicio: '09:00', fin: '09:30', apellido: 'Ficticio Uno' }),
        turno({ fecha: '2026-12-02', inicio: '11:00', fin: '11:30', apellido: 'Ficticio Dos' }),
      ],
    });
    abrirAgenda('/?fecha=2026-12-02&vista=semana');

    const lunes = await screen.findByRole('group', { name: 'Lun 30/11' });
    expect(within(lunes).getByRole('article', { name: /^09:00 a 09:30, Paciente Ficticio Uno/ })).toBeInTheDocument();
    const miercoles = screen.getByRole('group', { name: 'Mié 02/12' });
    expect(within(miercoles).getByRole('article', { name: /^11:00 a 11:30, Paciente Ficticio Dos/ })).toBeInTheDocument();
  });

  it('Semana en una pantalla angosta: lista por día con el turno completo', async () => {
    simularAnchoDePantalla(390);
    simularApiAgenda({ [SEMANA]: [turno({ fecha: '2026-12-02', inicio: '11:00', fin: '11:30' })] });
    abrirAgenda('/?fecha=2026-12-02&vista=semana');

    const miercoles = await screen.findByRole('group', { name: 'Mié 02/12' });
    expect(within(miercoles).getByRole('heading', { name: 'Mié 02/12' })).toBeInTheDocument();
    const tarjeta = within(miercoles).getByRole('article');
    expect(tarjeta).toHaveTextContent('11:00 – 11:30');
    expect(tarjeta).toHaveTextContent('Paciente Ficticio Tres · Limpieza');
    expect(within(screen.getByRole('group', { name: 'Lun 30/11' })).getByText('Sin turnos')).toBeInTheDocument();
  });

  it('Cancelados de la semana aparte, no en la columna de su día', async () => {
    simularAnchoDePantalla(1440);
    simularApiAgenda({
      [SEMANA]: [turno({ fecha: '2026-12-01', inicio: '11:30', fin: '12:00', estado: 'CANCELADO' })],
    });
    abrirAgenda('/?fecha=2026-12-02&vista=semana');

    const cancelados = await screen.findByRole('group', { name: 'Cancelados de la semana' });
    expect(within(cancelados).getByRole('article')).toHaveTextContent('Mar 01/12 · 11:30');
    expect(within(screen.getByRole('group', { name: 'Mar 01/12' })).queryByRole('article')).not.toBeInTheDocument();
  });

  it('Hoy destacado con aria-current="date"', async () => {
    simularAnchoDePantalla(1440);
    simularApiAgenda({ [SEMANA]: [turno()] });
    abrirAgenda('/?fecha=2026-12-02&vista=semana');

    await screen.findByRole('article');
    const hoy = document.querySelector('[aria-current="date"]');
    expect(hoy).toHaveTextContent('Mié');
    expect(hoy).toHaveTextContent('02/12');
    expect(document.querySelectorAll('[aria-current="date"]')).toHaveLength(1);
  });
});
