import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { abrirAgenda, fijarAhora } from '../../test/agenda';
import { cuerpoDe } from '../../test/catalogos';
import {
  errorApi,
  guardarEn,
  PACIENTE_FICTICIO,
  simularBackend,
  solicitudes,
  type Backend,
} from '../../test/gestionTurnos';
import { enConsultorio, formatoHora } from './fechas';
import type { TurnoAgenda } from './tipos';
import { turno } from './turnosDePrueba';

/** Spec web-gestion-turnos (C-17). Salvo que se indique, "ahora" es el 2026-12-01 a las 09:00. */

const AHORA = '2026-12-01T12:00:00Z';

let desplazados: Element[] = [];

beforeEach(() => {
  fijarAhora(AHORA);
  desplazados = [];
  Element.prototype.scrollIntoView = function (this: Element) {
    desplazados.push(this);
  };
});

afterEach(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function usuario() {
  return userEvent.setup();
}

const DIA = (fecha: string) => `/?fecha=${fecha}&vista=dia`;

function dialogo(nombre: string) {
  return screen.getByRole('dialog', { name: nombre });
}

async function abrirNuevoTurno(u: ReturnType<typeof usuario>) {
  await u.click(await screen.findByRole('button', { name: '+ Turno' }));
  return dialogo('Nuevo turno');
}

async function elegirPaciente(u: ReturnType<typeof usuario>, d: HTMLElement) {
  await u.type(within(d).getByRole('combobox', { name: 'Paciente' }), 'fict');
  await u.click(await within(d).findByRole('option', { name: /Ficticio Tres, Paciente/ }));
}

async function completar(u: ReturnType<typeof usuario>, d: HTMLElement, { hora = '10:00' } = {}) {
  await elegirPaciente(u, d);
  await u.selectOptions(await within(d).findByLabelText('Prestación'), 'Limpieza');
  fireEvent.change(within(d).getByLabelText('Hora'), { target: { value: hora } });
}

function crearConExito(backend: Backend) {
  return (cuerpo: unknown) => {
    const { inicio, duracionMinutos } = cuerpo as { inicio: string; duracionMinutos: number };
    const fin = formatoHora(enConsultorio(new Date(Date.parse(inicio) + duracionMinutos * 60_000)).minutos);
    return guardarEn(backend, turno({ id: 50, fecha: inicio.slice(0, 10), inicio: inicio.slice(11, 16), fin }), 201);
  };
}

describe('Abrir el diálogo "Nuevo turno"', () => {
  it('Desde el botón: abre con el día visible precargado', async () => {
    simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));

    const d = await abrirNuevoTurno(u);

    expect(within(d).getByRole('heading', { name: 'Nuevo turno' })).toBeInTheDocument();
    expect(within(d).getByLabelText('Día')).toHaveValue('2026-12-03');
  });

  it('Desde una franja libre: abre con día y hora de la franja', async () => {
    simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-01'));

    await u.click(await screen.findByRole('button', { name: /de 11:30 a 12:00$/ }));

    const d = dialogo('Nuevo turno');
    expect(within(d).getByLabelText('Día')).toHaveValue('2026-12-01');
    expect(within(d).getByLabelText('Hora')).toHaveValue('11:30');
  });

  it('Franja pasada: la de las 08:00 no se puede activar', async () => {
    simularBackend({ agenda: {} });
    abrirAgenda(DIA('2026-12-01'));

    await screen.findByRole('button', { name: /de 11:30 a 12:00$/ });

    expect(screen.queryByRole('button', { name: /de 08:00 a 08:30$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Búsqueda de paciente en el diálogo', () => {
  it('Elegir un paciente: muestra apellido, nombre y DNI, y queda seleccionado', async () => {
    simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);

    await u.type(within(d).getByRole('combobox', { name: 'Paciente' }), 'fict');
    const opcion = await within(d).findByRole('option', { name: /Ficticio Tres, Paciente/ });
    expect(opcion).toHaveTextContent('DNI 30.000.003');

    await u.click(opcion);
    expect(within(d).getByRole('combobox', { name: 'Paciente' })).toHaveValue('Ficticio Tres, Paciente');
  });

  it('Menos de dos caracteres: no pide pacientes', async () => {
    const fetchSimulado = simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);

    await u.type(within(d).getByRole('combobox', { name: 'Paciente' }), 'f');
    await new Promise((resolver) => setTimeout(resolver, 450));

    expect(solicitudes(fetchSimulado, 'GET', /^\/pacientes/)).toHaveLength(0);
  });

  it('Sin coincidencias: lo dice con el texto buscado', async () => {
    simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);

    await u.type(within(d).getByRole('combobox', { name: 'Paciente' }), 'zzz');

    expect(await within(d).findByText('No hay pacientes que coincidan con “zzz”')).toBeInTheDocument();
  });
});

describe('Prestación y duración sugerida', () => {
  it('Duración sugerida y hora de fin', async () => {
    simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);

    await u.selectOptions(await within(d).findByRole('combobox', { name: 'Prestación' }), 'Limpieza');
    fireEvent.change(within(d).getByLabelText('Hora'), { target: { value: '10:00' } });

    expect(within(d).getByLabelText('Duración (min)')).toHaveValue('45');
    expect(within(d).getByText('Termina 10:45')).toBeInTheDocument();
  });

  it('Duración editada', async () => {
    simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);
    await u.selectOptions(await within(d).findByRole('combobox', { name: 'Prestación' }), 'Limpieza');
    fireEvent.change(within(d).getByLabelText('Hora'), { target: { value: '10:00' } });

    const duracion = within(d).getByLabelText('Duración (min)');
    await u.clear(duracion);
    await u.type(duracion, '60');

    expect(within(d).getByText('Termina 11:00')).toBeInTheDocument();
  });

  it('Prestaciones inactivas ocultas', async () => {
    simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);

    const select = await within(d).findByRole('combobox', { name: 'Prestación' });
    await within(select).findByRole('option', { name: 'Limpieza' });

    expect(within(select).queryByRole('option', { name: 'Blanqueamiento' })).not.toBeInTheDocument();
  });
});

describe('Validación del formulario antes de enviar', () => {
  it('Campos vacíos: no envía, marca paciente y prestación y lleva el foco al primero', async () => {
    const fetchSimulado = simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);

    await u.click(within(d).getByRole('button', { name: 'Crear turno' }));

    expect(within(d).getByRole('combobox', { name: 'Paciente' })).toHaveAccessibleDescription(/^Elegí un paciente/);
    expect(within(d).getByRole('combobox', { name: 'Prestación' })).toHaveAccessibleDescription('Elegí una prestación');
    expect(within(d).getByRole('combobox', { name: 'Paciente' })).toHaveFocus();
    expect(solicitudes(fetchSimulado, 'POST', /^\/turnos$/)).toHaveLength(0);
  });

  it('al corregir un campo se quita su error', async () => {
    simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);
    await u.click(within(d).getByRole('button', { name: 'Crear turno' }));

    await completar(u, d);

    expect(within(d).queryByText('Elegí un paciente')).not.toBeInTheDocument();
    expect(within(d).getByRole('combobox', { name: 'Prestación' })).not.toHaveAttribute('aria-invalid');
    expect(within(d).getByLabelText('Hora')).not.toHaveAttribute('aria-invalid');
  });

  it('Día en el pasado: no envía y lo marca en "Día"', async () => {
    const fetchSimulado = simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);
    await completar(u, d);

    fireEvent.change(within(d).getByLabelText('Día'), { target: { value: '2026-11-20' } });
    await u.click(within(d).getByRole('button', { name: 'Crear turno' }));

    expect(within(d).getByLabelText('Día')).toHaveAccessibleDescription(/No se pueden dar turnos en el pasado\./);
    expect(solicitudes(fetchSimulado, 'POST', /^\/turnos$/)).toHaveLength(0);
  });

  it('Duración fuera de rango', async () => {
    const fetchSimulado = simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);
    await completar(u, d);

    const duracion = within(d).getByLabelText('Duración (min)');
    await u.clear(duracion);
    await u.type(duracion, '500');
    await u.click(within(d).getByRole('button', { name: 'Crear turno' }));

    expect(duracion).toHaveAccessibleDescription('La duración tiene que estar entre 5 y 480 minutos.');
    expect(solicitudes(fetchSimulado, 'POST', /^\/turnos$/)).toHaveLength(0);
  });
});

describe('Crear el turno', () => {
  it('Creación exitosa: envía el inicio con -03:00, anuncia y muestra el turno en la agenda', async () => {
    const backend: Backend = { agenda: {} };
    backend.respuestas = { crear: crearConExito(backend) };
    const fetchSimulado = simularBackend(backend);
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);
    await completar(u, d);

    await u.click(within(d).getByRole('button', { name: 'Crear turno' }));

    const [, init] = (await waitFor(() => solicitudes(fetchSimulado, 'POST', /^\/turnos$/)[0]!))!;
    expect(cuerpoDe(init)).toEqual({
      pacienteId: PACIENTE_FICTICIO.id,
      prestacionId: 1,
      inicio: '2026-12-03T10:00:00-03:00',
      duracionMinutos: 45,
    });
    const titulo = await screen.findByText('Turno creado');
    expect(titulo.closest('[role="status"]')).not.toBeNull();
    expect(screen.getByText('Jueves 03/12 a las 10:00.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByRole('article', { name: /^10:00 a 10:45, Paciente Ficticio Tres/ })).toBeInTheDocument();
  });

  it('Envío en curso: "Guardando…" con aria-busy y sin un segundo envío', async () => {
    const backend: Backend = { agenda: {}, respuestas: { crear: () => new Promise<Response>(() => undefined) } };
    const fetchSimulado = simularBackend(backend);
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);
    await completar(u, d);

    await u.click(within(d).getByRole('button', { name: 'Crear turno' }));
    const boton = await within(d).findByRole('button', { name: 'Guardando…' });
    expect(boton).toHaveAttribute('aria-busy', 'true');
    await u.click(boton);

    expect(solicitudes(fetchSimulado, 'POST', /^\/turnos$/)).toHaveLength(1);
  });
});

describe('Horario ocupado', () => {
  it('Solapamiento al crear: aviso con el horario en conflicto, datos cargados y agenda pedida de nuevo', async () => {
    const backend: Backend = {
      agenda: {},
      respuestas: {
        crear: () =>
          errorApi(409, 'TURNO_SOLAPADO', {
            turnoEnConflicto: { id: 9, inicio: '2026-12-03T10:00:00-03:00', fin: '2026-12-03T10:30:00-03:00' },
          }),
      },
    };
    const fetchSimulado = simularBackend(backend);
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);
    await completar(u, d);
    const pedidosAntes = solicitudes(fetchSimulado, 'GET', /^\/turnos$/).length;

    await u.click(within(d).getByRole('button', { name: 'Crear turno' }));

    const aviso = await within(d).findByRole('alert');
    expect(aviso).toHaveTextContent('Ese horario ya está ocupado');
    expect(aviso).toHaveTextContent('Se superpone con el turno de 10:00 a 10:30. Elegí otro horario.');
    expect(aviso.textContent).not.toMatch(/TURNO_SOLAPADO|409/);
    expect(within(d).getByRole('combobox', { name: 'Paciente' })).toHaveValue('Ficticio Tres, Paciente');
    expect(within(d).getByRole('combobox', { name: 'Prestación' })).toHaveDisplayValue('Limpieza');
    await waitFor(() =>
      expect(solicitudes(fetchSimulado, 'GET', /^\/turnos$/).length).toBeGreaterThan(pedidosAntes),
    );
  });
});

describe('Otros rechazos de la API en los diálogos', () => {
  async function crearCon(respuesta: Response) {
    simularBackend({ agenda: {}, respuestas: { crear: () => respuesta } });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);
    await completar(u, d);
    await u.click(within(d).getByRole('button', { name: 'Crear turno' }));
    return d;
  }

  it('Turno en el pasado según el servidor', async () => {
    const d = await crearCon(errorApi(422, 'TURNO_EN_PASADO'));

    await waitFor(() =>
      expect(within(d).getByLabelText('Día')).toHaveAccessibleDescription('No se pueden dar turnos en el pasado.'),
    );
    expect(dialogo('Nuevo turno')).toBeInTheDocument();
  });

  it('Paciente dado de baja mientras se cargaba', async () => {
    const d = await crearCon(errorApi(422, 'PACIENTE_INACTIVO'));

    expect(await within(d).findByRole('alert')).toHaveTextContent(
      'Ese paciente está dado de baja. Elegí otro paciente.',
    );
  });

  it('Error de validación por campo', async () => {
    const d = await crearCon(
      errorApi(422, 'VALIDACION_FALLIDA', {
        errores: [{ campo: 'duracionMinutos', mensaje: 'debe ser menor o igual que 480' }],
      }),
    );

    await waitFor(() =>
      expect(within(d).getByLabelText('Duración (min)')).toHaveAccessibleDescription('debe ser menor o igual que 480'),
    );
  });
});

describe('Detalle de un turno y acciones según su estado', () => {
  async function abrirDetalle(t: TurnoAgenda) {
    simularBackend({ agenda: { '2026-12-01': [t] } });
    const u = usuario();
    abrirAgenda(DIA('2026-12-01'));
    await u.click(await screen.findByRole('button', { name: /^Ver turno: / }));
    return dialogo('Detalle del turno');
  }

  it('Turno programado futuro: reprogramar y cancelar', async () => {
    const d = await abrirDetalle(turno({ fecha: '2026-12-01', inicio: '10:00', fin: '10:45' }));

    expect(within(d).getByText('Paciente', { selector: 'dt' })).toBeInTheDocument();
    expect(within(d).getByRole('button', { name: 'Reprogramar' })).toBeInTheDocument();
    expect(within(d).getByRole('button', { name: 'Cancelar turno' })).toBeInTheDocument();
    expect(within(d).queryByRole('button', { name: 'Marcar atendido' })).not.toBeInTheDocument();
    expect(within(d).queryByRole('button', { name: 'Marcar ausente' })).not.toBeInTheDocument();
  });

  it('Turno programado que ya empezó: marcar atendido o ausente', async () => {
    fijarAhora('2026-12-01T13:05:00Z');
    const d = await abrirDetalle(turno({ fecha: '2026-12-01', inicio: '10:00', fin: '10:45' }));

    expect(within(d).getByRole('button', { name: 'Marcar atendido' })).toBeInTheDocument();
    expect(within(d).getByRole('button', { name: 'Marcar ausente' })).toBeInTheDocument();
    expect(within(d).queryByRole('button', { name: 'Reprogramar' })).not.toBeInTheDocument();
    expect(within(d).queryByRole('button', { name: 'Cancelar turno' })).not.toBeInTheDocument();
  });

  it('Turno en estado final: badge "Cancelación tardía" y ninguna acción', async () => {
    const d = await abrirDetalle(
      turno({ fecha: '2026-12-01', inicio: '10:45', fin: '11:30', estado: 'CANCELADO_TARDIO' }),
    );

    expect(within(d).getByText('Cancelación tardía')).toBeInTheDocument();
    const botones = within(d)
      .getAllByRole('button')
      .map((b) => b.textContent);
    expect(botones).toEqual(['×', 'Cerrar']);
  });
});

describe('Reprogramar un turno', () => {
  const original = turno({ id: 7, fecha: '2026-12-01', inicio: '10:00', fin: '10:45', version: 3 });

  async function abrirReprogramar(backend: Backend) {
    const fetchSimulado = simularBackend(backend);
    const u = usuario();
    abrirAgenda(DIA('2026-12-01'));
    await u.click(await screen.findByRole('button', { name: /^Ver turno: 10:00 a 10:45/ }));
    await u.click(within(dialogo('Detalle del turno')).getByRole('button', { name: 'Reprogramar' }));
    const d = dialogo('Reprogramar turno');
    fireEvent.change(within(d).getByLabelText('Hora'), { target: { value: '12:00' } });
    await u.click(within(d).getByRole('button', { name: 'Guardar cambios' }));
    return { fetchSimulado, d };
  }

  it('Reprogramación exitosa: envía la nueva hora con la version y la agenda la muestra', async () => {
    const backend: Backend = { agenda: { '2026-12-01': [original] } };
    backend.respuestas = {
      reprogramar: () =>
        guardarEn(backend, turno({ id: 7, fecha: '2026-12-01', inicio: '12:00', fin: '12:45', version: 4 })),
    };
    const { fetchSimulado } = await abrirReprogramar(backend);

    const [, init] = (await waitFor(() => solicitudes(fetchSimulado, 'PUT', /^\/turnos\/7\/reprogramacion$/)[0]!))!;
    expect(cuerpoDe(init)).toEqual({ inicio: '2026-12-01T12:00:00-03:00', duracionMinutos: 45, version: 3 });
    expect(await screen.findByText('Turno reprogramado')).toBeInTheDocument();
    expect(await screen.findByRole('article', { name: /^12:00 a 12:45/ })).toBeInTheDocument();
  });

  it('El turno cambió mientras se editaba: lo explica y vuelve a pedir la agenda', async () => {
    const backend: Backend = {
      agenda: { '2026-12-01': [original] },
      respuestas: { reprogramar: () => errorApi(409, 'TURNO_MODIFICADO') },
    };
    const { fetchSimulado } = await abrirReprogramar(backend);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este turno cambió mientras lo editabas. Actualizamos la agenda: revisalo y probá de nuevo.',
    );
    // Primer pedido al abrir la agenda; el segundo, el refresco tras el rechazo.
    await waitFor(() => expect(solicitudes(fetchSimulado, 'GET', /^\/turnos$/).length).toBeGreaterThanOrEqual(2));
  });

  it('Solapamiento al reprogramar: mismo aviso que al crear, con el diálogo abierto', async () => {
    const backend: Backend = {
      agenda: { '2026-12-01': [original] },
      respuestas: {
        reprogramar: () =>
          errorApi(409, 'TURNO_SOLAPADO', {
            turnoEnConflicto: { id: 9, inicio: '2026-12-01T12:00:00-03:00', fin: '2026-12-01T12:30:00-03:00' },
          }),
      },
    };
    const { d } = await abrirReprogramar(backend);

    const aviso = await within(d).findByRole('alert');
    expect(aviso).toHaveTextContent('Ese horario ya está ocupado');
    expect(aviso).toHaveTextContent('Se superpone con el turno de 12:00 a 12:30. Elegí otro horario.');
  });
});

describe('Cancelar un turno con aviso de cancelación tardía', () => {
  async function abrirCancelar(t: TurnoAgenda, extra: Partial<Backend> = {}) {
    const backend: Backend = { agenda: { [t.inicio.slice(0, 10)]: [t] }, ...extra };
    const fetchSimulado = simularBackend(backend);
    const u = usuario();
    abrirAgenda(DIA(t.inicio.slice(0, 10)));
    await u.click(await screen.findByRole('button', { name: /^Ver turno: / }));
    await u.click(within(dialogo('Detalle del turno')).getByRole('button', { name: 'Cancelar turno' }));
    return { fetchSimulado, u, d: dialogo('Cancelar turno'), backend };
  }

  it('Aviso de cancelación tardía: faltan menos de 24 h', async () => {
    const { d } = await abrirCancelar(turno({ fecha: '2026-12-01', inicio: '15:00', fin: '15:45' }));

    expect(await within(d).findByText('Cancelación tardía')).toBeInTheDocument();
    expect(
      within(d).getByText(
        'Faltan menos de 24 h para el turno. Se registrará como cancelación tardía y el horario quedará libre.',
      ),
    ).toBeInTheDocument();
  });

  it('Justo en el límite: sin aviso de cancelación tardía', async () => {
    const { d } = await abrirCancelar(turno({ fecha: '2026-12-02', inicio: '09:00', fin: '09:45' }));

    expect(await within(d).findByText(/Faltan 24 h o más/)).toBeInTheDocument();
    expect(within(d).queryByText('Cancelación tardía')).not.toBeInTheDocument();
  });

  it('Configuración no disponible: aviso genérico y permite cancelar', async () => {
    const { d } = await abrirCancelar(turno({ fecha: '2026-12-01', inicio: '15:00', fin: '15:45' }), {
      configuracion: 'error',
    });

    expect(
      await within(d).findByText(
        'Si faltan pocas horas para el turno, puede quedar registrada como cancelación tardía.',
        {},
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
    expect(within(d).getByRole('button', { name: 'Cancelar turno' })).toBeEnabled();
  });

  it('Motivo demasiado largo: lo marca y no envía', async () => {
    const { d, u, fetchSimulado } = await abrirCancelar(turno({ fecha: '2026-12-03', inicio: '10:00', fin: '10:45' }));
    const motivo = within(d).getByLabelText('Motivo (opcional)');

    await u.click(motivo);
    await u.paste('a'.repeat(256));
    await u.click(within(d).getByRole('button', { name: 'Cancelar turno' }));

    expect(motivo).toHaveAccessibleDescription(/El motivo puede tener hasta 255 caracteres\./);
    expect(solicitudes(fetchSimulado, 'POST', /cancelacion$/)).toHaveLength(0);
  });
});

describe('Confirmar la cancelación', () => {
  async function confirmar(t: TurnoAgenda, respuesta: (backend: Backend) => Response) {
    const backend: Backend = { agenda: { [t.inicio.slice(0, 10)]: [t] } };
    backend.respuestas = { cancelar: () => respuesta(backend) };
    const fetchSimulado = simularBackend(backend);
    const u = usuario();
    abrirAgenda(DIA(t.inicio.slice(0, 10)));
    await u.click(await screen.findByRole('button', { name: /^Ver turno: / }));
    await u.click(within(dialogo('Detalle del turno')).getByRole('button', { name: 'Cancelar turno' }));
    const d = dialogo('Cancelar turno');
    await u.type(within(d).getByLabelText('Motivo (opcional)'), 'Viaje imprevisto');
    await u.click(within(d).getByRole('button', { name: 'Cancelar turno' }));
    return fetchSimulado;
  }

  it('Cancelación anticipada: anuncia y la agenda muestra el badge "Cancelado"', async () => {
    const t = turno({ id: 8, fecha: '2026-12-03', inicio: '10:00', fin: '10:45' });
    const fetchSimulado = await confirmar(t, (backend) => guardarEn(backend, { ...t, estado: 'CANCELADO' }));

    expect(await screen.findByText('Turno cancelado')).toBeInTheDocument();
    expect(await screen.findByRole('article', { name: /Cancelado$/ })).toBeInTheDocument();
    const [, init] = solicitudes(fetchSimulado, 'POST', /^\/turnos\/8\/cancelacion$/)[0]!;
    expect(cuerpoDe(init)).toEqual({ motivo: 'Viaje imprevisto' });
  });

  it('Cancelación tardía confirmada', async () => {
    const t = turno({ id: 8, fecha: '2026-12-01', inicio: '15:00', fin: '15:45' });
    await confirmar(t, (backend) => guardarEn(backend, { ...t, estado: 'CANCELADO_TARDIO' }));

    expect(await screen.findByText('Turno cancelado con cancelación tardía')).toBeInTheDocument();
  });

  it('El turno ya no se puede cancelar: lo explica sin código y vuelve a pedir la agenda', async () => {
    const t = turno({ id: 8, fecha: '2026-12-03', inicio: '10:00', fin: '10:45' });
    const fetchSimulado = await confirmar(t, () => errorApi(409, 'TRANSICION_INVALIDA'));

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent(
      'Este turno ya no se puede modificar porque cambió de estado. Actualizamos la agenda.',
    );
    expect(aviso.textContent).not.toContain('TRANSICION_INVALIDA');
    // Con la agenda desplazada, el aviso se trae a la vista (jsdom no implementa scrollIntoView).
    await waitFor(() => expect(desplazados).toContain(aviso.parentElement));
    await waitFor(() => expect(solicitudes(fetchSimulado, 'GET', /^\/turnos$/).length).toBeGreaterThanOrEqual(2));
  });
});

describe('Registrar la asistencia', () => {
  beforeEach(() => fijarAhora('2026-12-01T13:05:00Z'));

  async function marcar(boton: string, respuesta: (backend: Backend, t: TurnoAgenda) => Response) {
    const t = turno({ id: 9, fecha: '2026-12-01', inicio: '10:00', fin: '10:45' });
    const backend: Backend = { agenda: { '2026-12-01': [t] } };
    backend.respuestas = { asistencia: () => respuesta(backend, t) };
    const fetchSimulado = simularBackend(backend);
    const u = usuario();
    abrirAgenda(DIA('2026-12-01'));
    await u.click(await screen.findByRole('button', { name: /^Ver turno: / }));
    await u.click(within(dialogo('Detalle del turno')).getByRole('button', { name: boton }));
    return fetchSimulado;
  }

  it('Marcar atendido: envía ATENDIDO, anuncia y muestra el badge', async () => {
    const fetchSimulado = await marcar('Marcar atendido', (backend, t) =>
      guardarEn(backend, { ...t, estado: 'ATENDIDO' }),
    );

    expect(await screen.findByText('Turno marcado como atendido')).toBeInTheDocument();
    expect(await screen.findByRole('article', { name: /Atendido$/ })).toBeInTheDocument();
    const [, init] = solicitudes(fetchSimulado, 'POST', /^\/turnos\/9\/asistencia$/)[0]!;
    expect(cuerpoDe(init)).toEqual({ estado: 'ATENDIDO' });
  });

  it('Marcar ausente: anuncia el estado elegido', async () => {
    await marcar('Marcar ausente', (backend, t) => guardarEn(backend, { ...t, estado: 'AUSENTE' }));

    expect(await screen.findByText('Turno marcado como ausente')).toBeInTheDocument();
  });

  it('Asistencia rechazada', async () => {
    await marcar('Marcar ausente', () => errorApi(409, 'TRANSICION_INVALIDA'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este turno ya no se puede modificar porque cambió de estado. Actualizamos la agenda.',
    );
  });
});

describe('Diálogos accesibles', () => {
  it('Cerrar con Escape: no envía nada y el foco vuelve a "+ Turno"', async () => {
    const fetchSimulado = simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);
    expect(d).toHaveAttribute('aria-modal', 'true');
    expect(within(d).getByRole('combobox', { name: 'Paciente' })).toHaveFocus();

    await u.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Turno' })).toHaveFocus();
    expect(fetchSimulado.mock.calls.every(([, init]) => (init?.method ?? 'GET') === 'GET')).toBe(true);
  });

  it('tras un rechazo, el foco vuelve al diálogo y Escape lo sigue cerrando', async () => {
    let responder: (respuesta: Response) => void = () => undefined;
    simularBackend({
      agenda: {},
      respuestas: { crear: () => new Promise<Response>((resolver) => (responder = resolver)) },
    });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);
    await completar(u, d);

    await u.click(within(d).getByRole('button', { name: 'Crear turno' }));
    await within(d).findByRole('button', { name: 'Guardando…' });
    // El navegador saca el foco de un botón que se deshabilita; jsdom no, así que se emula.
    (document.activeElement as HTMLElement).blur();
    responder(errorApi(409, 'TURNO_SOLAPADO'));
    await within(d).findByRole('alert');

    expect(d.contains(document.activeElement)).toBe(true);
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('"Cancelar" cierra sin enviar', async () => {
    simularBackend({ agenda: {} });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);

    await u.click(within(d).getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Sesión vencida durante una acción', () => {
  it('Token rechazado al crear: vuelve al inicio de sesión con "Tu sesión venció"', async () => {
    simularBackend({ agenda: {}, respuestas: { crear: () => errorApi(401, 'NO_AUTENTICADO') } });
    const u = usuario();
    abrirAgenda(DIA('2026-12-03'));
    const d = await abrirNuevoTurno(u);
    await completar(u, d);

    await u.click(within(d).getByRole('button', { name: 'Crear turno' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' })).toBeInTheDocument();
    expect(screen.getByText('Tu sesión venció')).toBeInTheDocument();
  });
});
