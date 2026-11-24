import { describe, expect, it } from 'vitest';
import {
  crearPeriodo,
  encabezadoDia,
  enConsultorio,
  esFechaValida,
  formatoHora,
  hoyEnConsultorio,
  lunesDe,
  moverPeriodo,
  textoDia,
  textoSemana,
} from './fechas';

describe('web-agenda · fechas en la zona del consultorio', () => {
  it('Hoy según la zona del consultorio: 01:30 UTC del 3/12 es todavía el 2/12 en Buenos Aires', () => {
    expect(hoyEnConsultorio(new Date('2026-12-03T01:30:00Z'))).toBe('2026-12-02');
    expect(hoyEnConsultorio(new Date('2026-12-03T03:00:00Z'))).toBe('2026-12-03');
  });

  it('Rango de la vista diaria: desde las 00:00 del día hasta las 00:00 del siguiente, con -03:00', () => {
    const periodo = crearPeriodo('dia', '2026-12-02');
    expect(periodo.desde).toBe('2026-12-02T00:00:00-03:00');
    expect(periodo.hasta).toBe('2026-12-03T00:00:00-03:00');
    expect(periodo.dias).toEqual(['2026-12-02']);
  });

  it('Rango de la vista semanal: del lunes 00:00 al lunes siguiente 00:00', () => {
    const periodo = crearPeriodo('semana', '2026-12-02');
    expect(periodo.desde).toBe('2026-11-30T00:00:00-03:00');
    expect(periodo.hasta).toBe('2026-12-07T00:00:00-03:00');
    expect(periodo.dias).toHaveLength(7);
    expect(periodo.dias.at(-1)).toBe('2026-12-06');
  });

  it('el lunes de un domingo es el de seis días antes, y cruza el cambio de año', () => {
    expect(lunesDe('2026-12-06')).toBe('2026-11-30');
    expect(lunesDe('2026-11-30')).toBe('2026-11-30');
    expect(lunesDe('2027-01-01')).toBe('2026-12-28');
  });

  it('mover el período: un día en la diaria, una semana (desde el lunes) en la semanal', () => {
    expect(moverPeriodo('dia', '2026-12-02', 1)).toBe('2026-12-03');
    expect(moverPeriodo('dia', '2026-12-01', -1)).toBe('2026-11-30');
    expect(moverPeriodo('semana', '2026-12-02', -1)).toBe('2026-11-23');
  });

  it('valida fechas AAAA-MM-DD reales', () => {
    expect(esFechaValida('2026-12-10')).toBe(true);
    expect(esFechaValida('2026-13-45')).toBe(false);
    expect(esFechaValida('2026-02-30')).toBe(false);
    expect(esFechaValida('10/12/2026')).toBe(false);
    expect(esFechaValida(null)).toBe(false);
  });

  it('textos del período y de los días', () => {
    expect(textoDia('2026-12-02')).toBe('Miércoles 2 de diciembre de 2026');
    expect(textoSemana('2026-12-02')).toBe('Semana del 30 de noviembre al 6 de diciembre de 2026');
    expect(textoSemana('2026-11-25')).toBe('Semana del 23 al 29 de noviembre de 2026');
    expect(textoSemana('2026-12-30')).toBe('Semana del 28 de diciembre de 2026 al 3 de enero de 2027');
    expect(encabezadoDia('2026-11-30')).toEqual({ dia: 'Lun', numero: '30/11' });
    expect(encabezadoDia('2026-12-02')).toEqual({ dia: 'Mié', numero: '02/12' });
  });

  it('lee la hora de un ISO de la API en la zona del consultorio', () => {
    expect(enConsultorio('2026-12-02T10:15:00-03:00')).toEqual({ fecha: '2026-12-02', minutos: 615 });
    expect(enConsultorio('2026-12-02T13:15:00Z')).toEqual({ fecha: '2026-12-02', minutos: 615 });
    expect(formatoHora(615)).toBe('10:15');
    expect(formatoHora(1440)).toBe('24:00');
  });
});
