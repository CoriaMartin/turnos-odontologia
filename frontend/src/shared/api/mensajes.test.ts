import { describe, expect, it } from 'vitest';
import { ApiError } from './ApiError';
import { MENSAJE_GENERICO, MENSAJES_POR_CODIGO, mensajeDeError } from './mensajes';

describe('web-api-client · Mensaje para el usuario sin códigos técnicos', () => {
  it('Sin conexión: explica que no se pudo conectar y sugiere revisar la conexión y probar de nuevo', () => {
    const mensaje = mensajeDeError(new ApiError({ status: 0, codigo: 'SIN_CONEXION' }));

    expect(mensaje).toMatch(/no pudimos conectarnos con el servidor/i);
    expect(mensaje).toMatch(/revisá tu conexión/i);
    expect(mensaje).toMatch(/probá de nuevo/i);
  });

  it('Código sin mensaje propio: usa el genérico, que sugiere probar en unos minutos, sin el código', () => {
    const mensaje = mensajeDeError(new ApiError({ status: 409, codigo: 'CODIGO_INVENTADO' }));

    expect(mensaje).toBe(MENSAJE_GENERICO);
    expect(mensaje).toMatch(/probá de nuevo en unos minutos/i);
    expect(mensaje).not.toContain('CODIGO_INVENTADO');
  });

  it.each(Object.entries(MENSAJES_POR_CODIGO))(
    'el mensaje de %s no contiene ningún código técnico',
    (codigo, mensaje) => {
      expect(mensaje).not.toContain(codigo);
      expect(mensaje).not.toMatch(/[A-Z]{2,}_[A-Z_]+/);
    },
  );

  it('Credenciales inválidas: mensaje genérico que no dice qué dato falló', () => {
    expect(mensajeDeError(new ApiError({ status: 401, codigo: 'CREDENCIALES_INVALIDAS' }))).toBe(
      'El email o la contraseña no son correctos. Revisalos y probá de nuevo.',
    );
  });

  it('Login bloqueado: explica el bloqueo de 15 minutos y qué hacer, sin 429', () => {
    const mensaje = mensajeDeError(new ApiError({ status: 429, codigo: 'LOGIN_BLOQUEADO' }));
    expect(mensaje).toBe(
      'Hubo demasiados intentos fallidos. Esperá 15 minutos y volvé a intentar.',
    );
    expect(mensaje).not.toContain('429');
  });

  it('un error que no es de la API usa el mensaje genérico', () => {
    expect(mensajeDeError(new Error('falla interna'))).toBe(MENSAJE_GENERICO);
  });

  it('Error sin código técnico: NOMBRE_DUPLICADO', () => {
    const mensaje = mensajeDeError(new ApiError({ status: 409, codigo: 'NOMBRE_DUPLICADO' }));
    expect(mensaje).toBe('Ya tenés una prestación con ese nombre. Probá con otro.');
    expect(mensaje).not.toContain('NOMBRE_DUPLICADO');
  });

  it('Baja bloqueada por turnos futuros', () => {
    const mensaje = mensajeDeError(
      new ApiError({ status: 409, codigo: 'PACIENTE_CON_TURNOS_FUTUROS' }),
    );
    expect(mensaje).toBe(
      'No pudimos dar de baja a este paciente porque tiene un turno programado. Cancelá o reprogramá ese turno y probá de nuevo.',
    );
    expect(mensaje).not.toContain('PACIENTE_CON_TURNOS_FUTUROS');
  });
});
