import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  abrirAgenda,
  fijarAhora,
  periodosPedidos,
  quitarSimulacionDeAncho,
  respuestaJson,
  simularAnchoDePantalla,
  simularApiAgenda,
} from '../../test/agenda';
import { turno } from './turnosDePrueba';

const DIA = '2026-12-02T00:00:00-03:00';

afterEach(() => {
  vi.useRealTimers();
  quitarSimulacionDeAncho();
});

describe('web-agenda · Línea de hora actual', () => {
  it('Hoy a media mañana: línea "Hora actual: 10:18" entre las marcas de 10:00 y 10:30', async () => {
    fijarAhora('2026-12-02T13:18:00Z');
    simularApiAgenda({ [DIA]: [turno()] });
    abrirAgenda('/?fecha=2026-12-02&vista=dia');

    const linea = await screen.findByRole('img', { name: 'Hora actual: 10:18' });
    // 10:18 está a 4,6 franjas de las 08:00: entre la franja 4 (10:00) y la 5 (10:30).
    expect(linea.style.top).toBe('calc(var(--agenda-slot-height) * 4.6)');
  });

  it('Otro día: no hay línea de hora actual', async () => {
    fijarAhora('2026-12-02T13:18:00Z');
    simularApiAgenda();
    abrirAgenda('/?fecha=2026-12-03&vista=dia');

    await screen.findByText('No hay turnos para este día');
    expect(screen.queryByRole('img', { name: /Hora actual/ })).not.toBeInTheDocument();
  });

  it('en la cuadrícula semanal aparece solo en la columna de hoy', async () => {
    fijarAhora('2026-12-02T13:18:00Z');
    simularAnchoDePantalla(1440);
    simularApiAgenda({ '2026-11-30T00:00:00-03:00': [turno()] });
    abrirAgenda('/?fecha=2026-12-02&vista=semana');

    const miercoles = await screen.findByRole('group', { name: 'Mié 02/12' });
    expect(within(miercoles).getByRole('img', { name: 'Hora actual: 10:18' })).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: /Hora actual/ })).toHaveLength(1);
  });

  it('La línea avanza: un minuto después indica 10:19', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'], shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-12-02T13:18:30Z'));
    simularApiAgenda({ [DIA]: [turno()] });
    abrirAgenda('/?fecha=2026-12-02&vista=dia');
    await screen.findByRole('img', { name: 'Hora actual: 10:18' });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(screen.getByRole('img', { name: 'Hora actual: 10:19' })).toBeInTheDocument();
  });
});

describe('web-agenda · Estado de carga', () => {
  it('Agenda cargando: "Cargando turnos…", aria-busy y la navegación visible', () => {
    fijarAhora();
    simularApiAgenda({ [DIA]: () => new Promise<Response>(() => undefined) });
    abrirAgenda('/?fecha=2026-12-02&vista=dia');

    expect(screen.getByText('Cargando turnos…')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /^Agenda diaria/ })).toHaveAttribute('aria-busy', 'true');
    for (const control of ['Día anterior', 'Hoy', 'Día siguiente']) {
      expect(screen.getByRole('button', { name: control })).toBeInTheDocument();
    }
  });
});

describe('web-agenda · Período sin turnos', () => {
  beforeEach(() => fijarAhora());

  it('Día sin turnos: mensaje y línea de tiempo de 08:00 a 20:00 visible', async () => {
    simularApiAgenda();
    abrirAgenda('/?fecha=2026-12-05&vista=dia');

    expect(await screen.findByText('No hay turnos para este día')).toBeInTheDocument();
    expect(screen.getByText('Cuando agendes uno, va a aparecer en esta línea de tiempo.')).toBeInTheDocument();
    const horas = screen.getByRole('group', { name: 'Turnos activos' }).previousElementSibling;
    expect(horas?.firstElementChild).toHaveTextContent('08:00');
    expect(horas?.textContent).toContain('19:00');
    expect(horas?.children).toHaveLength(24);
  });

  it('Semana sin turnos', async () => {
    simularApiAgenda();
    abrirAgenda('/?fecha=2026-12-05&vista=semana');

    expect(await screen.findByText('No hay turnos esta semana')).toBeInTheDocument();
  });
});

describe('web-agenda · Error al cargar la agenda', () => {
  beforeEach(() => fijarAhora());

  it('Sin conexión: aviso con el mensaje del cliente, sin códigos técnicos', async () => {
    simularApiAgenda({ [DIA]: () => Promise.reject(new TypeError('Failed to fetch')) });
    abrirAgenda('/?fecha=2026-12-02&vista=dia');

    // El QueryClient reintenta una vez los errores que no son 4xx (C-14): el aviso llega después.
    const aviso = await screen.findByRole('alert', {}, { timeout: 4000 });
    expect(aviso).toHaveTextContent('No pudimos cargar la agenda');
    expect(aviso).toHaveTextContent('Revisá tu conexión');
    expect(aviso).not.toHaveTextContent('SIN_CONEXION');
  });

  it('Reintentar: vuelve a pedir el mismo período y muestra los turnos', async () => {
    const usuario = userEvent.setup();
    let falla = true;
    const fetchSimulado = simularApiAgenda({
      [DIA]: () =>
        falla
          ? Promise.resolve(respuestaJson({ status: 500, codigo: 'ERROR_INTERNO' }, 500))
          : Promise.resolve(respuestaJson([turno()])),
    });
    abrirAgenda('/?fecha=2026-12-02&vista=dia');
    await screen.findByRole('alert', {}, { timeout: 4000 });
    expect(screen.getByRole('alert')).not.toHaveTextContent('500');

    falla = false;
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('article', { name: /Programado$/ })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    const pedidos = periodosPedidos(fetchSimulado);
    expect(new Set(pedidos.map((p) => p.desde))).toEqual(new Set([DIA]));
    expect(pedidos.length).toBeGreaterThanOrEqual(3);
  });
});
