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

  it('un error que no es de la API usa el mensaje genérico', () => {
    expect(mensajeDeError(new Error('falla interna'))).toBe(MENSAJE_GENERICO);
  });
});
