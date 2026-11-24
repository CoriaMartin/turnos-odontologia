import { describe, expect, it } from 'vitest';
import {
  cantidadDeFranjas,
  esCancelado,
  posicion,
  posicionDeHora,
  rangoVisible,
  tramoDelDia,
  tramosDelDia,
} from './lineaDeTiempo';
import { turno } from './turnosDePrueba';

describe('web-agenda · Línea de tiempo de la vista diaria', () => {
  it('Día con turnos dentro del horario habitual: 08:00 a 20:00 y el turno de 10:00 a 10:45 ocupa 1,5 franjas', () => {
    const tramos = tramosDelDia([turno({ inicio: '10:00', fin: '10:45' })], '2026-12-02');
    const rango = rangoVisible(tramos);

    expect(rango).toEqual({ inicio: 480, fin: 1200 });
    expect(cantidadDeFranjas(rango)).toBe(24);
    expect(posicion(tramos[0]!, rango)).toEqual({ top: 4, alto: 1.5 });
  });

  it('Turno fuera del horario habitual: 07:15 a 07:45 extiende el inicio a las 07:00', () => {
    const tramos = tramosDelDia([turno({ inicio: '07:15', fin: '07:45' })], '2026-12-02');
    const rango = rangoVisible(tramos);

    expect(rango.inicio).toBe(420);
    expect(posicion(tramos[0]!, rango)).toEqual({ top: 0.5, alto: 1 });
  });

  it('extiende el fin a una franja entera si un turno termina después de las 20:00', () => {
    const tramos = tramosDelDia([turno({ inicio: '20:00', fin: '20:40' })], '2026-12-02');
    expect(rangoVisible(tramos).fin).toBe(21 * 60);
  });

  it('un turno que cruza la medianoche se recorta al día visible', () => {
    const cruzado = turno({ fecha: '2026-12-01', inicio: '23:30', fin: '00:15', finFecha: '2026-12-02' });

    expect(tramoDelDia(cruzado, '2026-12-01')).toMatchObject({ inicio: 1410, fin: 1440 });
    expect(tramoDelDia(cruzado, '2026-12-02')).toMatchObject({ inicio: 0, fin: 15 });
    expect(tramoDelDia(cruzado, '2026-12-03')).toBeNull();
  });

  it('distingue los cancelados de los activos', () => {
    expect(esCancelado(turno({ estado: 'CANCELADO' }))).toBe(true);
    expect(esCancelado(turno({ estado: 'CANCELADO_TARDIO' }))).toBe(true);
    expect(esCancelado(turno({ estado: 'AUSENTE' }))).toBe(false);
  });

  it('ubica una hora dentro del rango y devuelve null fuera de él', () => {
    const rango = { inicio: 480, fin: 1200 };
    expect(posicionDeHora(618, rango)).toBeCloseTo(4.6);
    expect(posicionDeHora(300, rango)).toBeNull();
  });
});
