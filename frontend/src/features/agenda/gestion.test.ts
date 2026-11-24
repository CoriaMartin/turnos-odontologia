import { describe, expect, it } from 'vitest';
import {
  accionesDisponibles,
  esCancelacionTardia,
  franjasLibres,
  MENSAJES_CAMPO,
  textoDiaYHora,
  textoFin,
  validarHorario,
} from './gestion';

/** 2026-12-01 a las 09:00 en Buenos Aires. */
const AHORA = new Date('2026-12-01T12:00:00Z');
const iso = (fecha: string, hora: string) => `${fecha}T${hora}:00-03:00`;

describe('web-gestion-turnos · Acciones según el estado (D5)', () => {
  it('Turno programado futuro: reprogramar y cancelar', () => {
    expect(accionesDisponibles({ estado: 'PROGRAMADO', inicio: iso('2026-12-01', '10:00') }, AHORA)).toEqual([
      'reprogramar',
      'cancelar',
    ]);
  });

  it('Turno programado que ya empezó: marcar atendido o ausente', () => {
    const ahora = new Date('2026-12-01T13:05:00Z');
    expect(accionesDisponibles({ estado: 'PROGRAMADO', inicio: iso('2026-12-01', '10:00') }, ahora)).toEqual([
      'atendido',
      'ausente',
    ]);
  });

  it('justo en el inicio ya cuenta como empezado', () => {
    expect(accionesDisponibles({ estado: 'PROGRAMADO', inicio: iso('2026-12-01', '09:00') }, AHORA)).toEqual([
      'atendido',
      'ausente',
    ]);
  });

  it.each(['ATENDIDO', 'AUSENTE', 'CANCELADO', 'CANCELADO_TARDIO'] as const)(
    'Turno en estado final (%s): ninguna acción',
    (estado) => {
      expect(accionesDisponibles({ estado, inicio: iso('2026-12-05', '10:00') }, AHORA)).toEqual([]);
    },
  );
});

describe('web-gestion-turnos · Cancelación tardía (D3, RN-CA-04)', () => {
  it('Aviso de cancelación tardía: faltan 6 h con 24 configuradas', () => {
    expect(esCancelacionTardia(iso('2026-12-01', '15:00'), AHORA, 24)).toBe(true);
  });

  it('Justo en el límite: exactamente 24 h no es tardía', () => {
    expect(esCancelacionTardia(iso('2026-12-02', '09:00'), AHORA, 24)).toBe(false);
  });

  it('un minuto antes del límite sí es tardía', () => {
    expect(esCancelacionTardia(iso('2026-12-02', '08:59'), AHORA, 24)).toBe(true);
  });

  it('usa las horas configuradas', () => {
    expect(esCancelacionTardia(iso('2026-12-02', '10:00'), AHORA, 48)).toBe(true);
  });
});

describe('web-gestion-turnos · Hora de fin (D4)', () => {
  it('Duración sugerida y hora de fin: 10:00 + 45 → Termina 10:45', () => {
    expect(textoFin('10:00', '45')).toBe('Termina 10:45');
  });

  it('Duración editada: 10:00 + 60 → Termina 11:00', () => {
    expect(textoFin('10:00', '60')).toBe('Termina 11:00');
  });

  it('fin después de la medianoche', () => {
    expect(textoFin('23:45', '30')).toBe('Termina 00:15 del día siguiente');
  });

  it('sin hora o con duración inválida no calcula', () => {
    expect(textoFin('', '45')).toBe('Termina —');
    expect(textoFin('10:00', '500')).toBe('Termina —');
  });
});

describe('web-gestion-turnos · Validación local del horario', () => {
  it('Día en el pasado', () => {
    expect(validarHorario({ fecha: '2026-11-20', hora: '10:00', duracion: '45' }, AHORA)).toEqual({
      dia: MENSAJES_CAMPO.pasado,
    });
  });

  it('hoy, pero a una hora que ya pasó', () => {
    expect(validarHorario({ fecha: '2026-12-01', hora: '08:30', duracion: '45' }, AHORA).dia).toBe(
      MENSAJES_CAMPO.pasado,
    );
  });

  it.each(['4', '481', '500', '', '4.5', 'abc'])('Duración fuera de rango: %s', (duracion) => {
    expect(validarHorario({ fecha: '2026-12-03', hora: '10:00', duracion }, AHORA).duracion).toBe(
      'La duración tiene que estar entre 5 y 480 minutos.',
    );
  });

  it.each(['5', '480'])('acepta los extremos: %s', (duracion) => {
    expect(validarHorario({ fecha: '2026-12-03', hora: '10:00', duracion }, AHORA)).toEqual({});
  });
});

describe('web-gestion-turnos · Franjas libres', () => {
  const rango = { inicio: 8 * 60, fin: 12 * 60 };

  it('Franja pasada: a las 09:00 no se ofrecen las de 08:00 ni 08:30, ni la que está en curso', () => {
    const libres = franjasLibres('2026-12-01', rango, [], new Date('2026-12-01T12:10:00Z'));
    expect(libres).toEqual([9.5 * 60, 10 * 60, 10.5 * 60, 11 * 60, 11.5 * 60]);
  });

  it('no ofrece franjas ocupadas por un turno activo', () => {
    const libres = franjasLibres('2026-12-01', rango, [{ inicio: 10 * 60, fin: 10 * 60 + 45 }], AHORA);
    expect(libres).toEqual([9 * 60, 9.5 * 60, 11 * 60, 11.5 * 60]);
  });

  it('un día futuro ofrece todas', () => {
    expect(franjasLibres('2026-12-03', rango, [], AHORA)).toHaveLength(8);
  });
});

it('web-gestion-turnos · texto de día y hora de los avisos', () => {
  expect(textoDiaYHora('2026-12-03T10:00:00-03:00')).toBe('Jueves 03/12 a las 10:00.');
});
