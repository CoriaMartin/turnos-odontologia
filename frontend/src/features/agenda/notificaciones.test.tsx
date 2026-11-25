import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { abrirAgenda, fijarAhora } from '../../test/agenda';
import { respuestaJson, simularApi } from '../../test/catalogos';
import { simularBackend } from '../../test/gestionTurnos';
import { TOKEN_DE_PRUEBA } from '../../test/renderConRutas';
import type { EstadoNotificacion, NotificacionTurno } from './notificaciones';
import { turno } from './turnosDePrueba';

const DIA = '/?fecha=2026-12-01&vista=dia';
let siguienteId = 700;

beforeEach(() => fijarAhora('2026-12-01T09:00:00Z'));
afterEach(() => vi.useRealTimers());

function notificacion(turnoId: number, estado: EstadoNotificacion): NotificacionTurno {
  return {
    turnoId,
    estado,
    intentos: estado === 'FALLIDA' ? 3 : 0,
    enviadaEn: estado === 'ENVIADA' ? '2026-12-01T14:00:00Z' : null,
  };
}

async function abrirDetalleCon(estado: EstadoNotificacion | 'error' | 'pendiente-sin-fin') {
  const id = siguienteId++;
  const t = turno({ id, fecha: '2026-12-01', inicio: '10:00', fin: '10:45' });
  const notificaciones =
    estado === 'pendiente-sin-fin'
      ? {}
      : { [id]: estado === 'error' ? ('error' as const) : notificacion(id, estado) };
  const fetchSimulado = simularBackend({
    agenda: { '2026-12-01': [t] },
    notificaciones,
  });
  if (estado === 'pendiente-sin-fin') {
    fetchSimulado.mockImplementation((entrada) => {
      if (String(entrada).includes('/notificaciones')) return new Promise<Response>(() => undefined);
      const url = new URL(String(entrada));
      return Promise.resolve(
        url.pathname.endsWith('/configuracion')
          ? respuestaJson({
              horasCancelacionTardia: 24,
              horasAnticipacionRecordatorio: 24,
              zonaHoraria: 'America/Argentina/Buenos_Aires',
            })
          : respuestaJson([t]),
      );
    });
  }
  const u = userEvent.setup();
  abrirAgenda(DIA);
  await u.click(await screen.findByRole('button', { name: /^Ver turno: / }));
  return { dialogo: screen.getByRole('dialog', { name: 'Detalle del turno' }), id, fetchSimulado };
}

describe('web-configuracion-recordatorios · Estado del recordatorio en el detalle', () => {
  it('Turno con email y acepta recordatorios → pendiente', async () => {
    const { dialogo } = await abrirDetalleCon('PENDIENTE');

    expect(await within(dialogo).findByText('Pendiente')).toBeInTheDocument();
    expect(within(dialogo).getByText('El recordatorio se va a enviar antes del turno.')).toBeInTheDocument();
    expect(within(dialogo).getByText('Recordatorio', { selector: 'dt' })).toBeInTheDocument();
  });

  it('Turno con email y recordatorio ya enviado → enviado', async () => {
    const { dialogo } = await abrirDetalleCon('ENVIADA');

    expect(await within(dialogo).findByText('Enviado')).toBeInTheDocument();
    expect(within(dialogo).getByText('El recordatorio llegó al paciente.')).toBeInTheDocument();
  });

  it('Turno sin email → no aplica', async () => {
    const { dialogo } = await abrirDetalleCon('NO_APLICA');

    expect(await within(dialogo).findByText('No aplica')).toBeInTheDocument();
    expect(within(dialogo).getByText('Este turno no tiene recordatorio por email.')).toBeInTheDocument();
  });

  it('Turno con email pero sin consentimiento → no consentido, sin códigos', async () => {
    const { dialogo } = await abrirDetalleCon('NO_CONSENTIDO');

    expect(await within(dialogo).findByText('No consentido')).toBeInTheDocument();
    expect(
      within(dialogo).getByText('El paciente no aceptó recibir recordatorios por email.'),
    ).toBeInTheDocument();
    expect(dialogo).not.toHaveTextContent('NO_CONSENTIDO');
  });

  it('Envío fallido después de los intentos → fallido', async () => {
    const { dialogo } = await abrirDetalleCon('FALLIDA');

    expect(await within(dialogo).findByText('Fallido')).toBeInTheDocument();
    expect(
      within(dialogo).getByText('No pudimos enviar el recordatorio después de varios intentos.'),
    ).toBeInTheDocument();
    expect(dialogo).not.toHaveTextContent('FALLIDA');
  });

  it('Mientras consulta: texto de carga sin códigos', async () => {
    const { dialogo } = await abrirDetalleCon('pendiente-sin-fin');

    expect(await within(dialogo).findByText('Consultando el estado del recordatorio...')).toBeInTheDocument();
  });

  it('Si falla la consulta: aviso legible y sin detalle técnico', async () => {
    const { dialogo } = await abrirDetalleCon('error');

    expect(
      await within(dialogo).findByText('No pudimos consultar el estado del recordatorio.'),
    ).toBeInTheDocument();
    expect(dialogo).not.toHaveTextContent('ERROR_INTERNO');
  });

  it('La consulta del estado lleva el token y usa el id del turno', async () => {
    const { fetchSimulado, id } = await abrirDetalleCon('ENVIADA');
    await waitFor(() => expect(screen.getAllByText('Enviado').length).toBeGreaterThan(0));

    const solicitud = fetchSimulado.mock.calls.find(([entrada]) =>
      String(entrada).includes(`/notificaciones`),
    );
    expect(new URL(String(solicitud?.[0])).pathname).toBe(`/api/turnos/${id}/notificaciones`);
    expect((solicitud?.[1]?.headers as Record<string, string>)['Authorization']).toBe(
      `Bearer ${TOKEN_DE_PRUEBA}`,
    );
  });

  it('El detalle sigue mostrando acciones y estado del turno junto al recordatorio', async () => {
    const { dialogo } = await abrirDetalleCon('PENDIENTE');
    await within(dialogo).findByText('Pendiente');

    expect(within(dialogo).getByRole('button', { name: 'Reprogramar' })).toBeInTheDocument();
    expect(within(dialogo).getByRole('button', { name: 'Cancelar turno' })).toBeInTheDocument();
  });
});

describe('web-configuracion-recordatorios · API de notificaciones', () => {
  it('obtenerNotificacion pide la ruta del turno sin exponer el token en la URL', async () => {
    const fetchSimulado = simularApi(() => respuestaJson(notificacion(99, 'ENVIADA')));
    const { obtenerNotificacion } = await import('./notificaciones');

    await expect(obtenerNotificacion(99)).resolves.toEqual(notificacion(99, 'ENVIADA'));
    expect(new URL(String(fetchSimulado.mock.calls[0]?.[0])).pathname).toBe(
      '/api/turnos/99/notificaciones',
    );
  });

  it('Un 401 de notificaciones no se muestra como error de configuración', async () => {
    const fetchSimulado = simularApi(() =>
      respuestaJson({ status: 401, codigo: 'NO_AUTENTICADO' }, 401),
    );
    const { obtenerNotificacion } = await import('./notificaciones');
    const { ApiError } = await import('../../shared/api/ApiError');

    await expect(obtenerNotificacion(99)).rejects.toBeInstanceOf(ApiError);
    expect(fetchSimulado).toHaveBeenCalledTimes(1);
  });
});
