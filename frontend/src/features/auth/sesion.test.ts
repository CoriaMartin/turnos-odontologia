import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, configurarProveedorToken } from '../../shared/api/cliente';
import {
  cerrarSesion,
  conectarSesionConApi,
  haySesion,
  iniciarSesion,
  reiniciarSesion,
  tokenVigente,
  useSesion,
} from './sesion';
import { renderHook, act } from '@testing-library/react';

const FUTURO = '2999-01-01T00:00:00Z';
const PASADO = '2000-01-01T00:00:00Z';

describe('web-sesion · Token solo en memoria', () => {
  it('Ingreso sin persistir el token: no se escribe en localStorage ni sessionStorage', () => {
    const escribir = vi.spyOn(Storage.prototype, 'setItem');

    iniciarSesion('token-secreto', FUTURO);

    expect(tokenVigente()).toBe('token-secreto');
    expect(escribir).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).not.toContain('token-secreto');
  });

  it('sin sesión no hay token', () => {
    expect(haySesion()).toBe(false);
    expect(tokenVigente()).toBeNull();
  });
});

describe('web-sesion · vencimiento del token', () => {
  it('un token vencido devuelve null y cierra la sesión como vencida', () => {
    const { result } = renderHook(() => useSesion());

    act(() => iniciarSesion('token-viejo', PASADO));
    let token: string | null = 'sin leer';
    act(() => {
      token = tokenVigente();
    });

    expect(token).toBeNull();
    expect(result.current).toEqual({ sesion: null, motivoCierre: 'vencida' });
  });

  it('una fecha de vencimiento ilegible se trata como vencida', () => {
    iniciarSesion('token', 'no-es-fecha');
    expect(tokenVigente()).toBeNull();
  });
});

describe('web-sesion · cierre de sesión', () => {
  it('cerrar manualmente descarta el token y guarda el motivo', () => {
    iniciarSesion('token', FUTURO);
    cerrarSesion('manual');

    expect(tokenVigente()).toBeNull();
    const { result } = renderHook(() => useSesion());
    expect(result.current.motivoCierre).toBe('manual');
  });

  it('un cierre "vencida" sin sesión no cambia nada (el 401 del login no es vencimiento)', () => {
    cerrarSesion('vencida');

    const { result } = renderHook(() => useSesion());
    expect(result.current).toEqual({ sesion: null, motivoCierre: null });
  });

  it('iniciar sesión borra el motivo del cierre anterior', () => {
    iniciarSesion('token', FUTURO);
    cerrarSesion('manual');
    iniciarSesion('otro', FUTURO);

    const { result } = renderHook(() => useSesion());
    expect(result.current.motivoCierre).toBeNull();
  });

  it('reiniciarSesion vuelve al estado inicial', () => {
    iniciarSesion('token', FUTURO);
    reiniciarSesion();
    expect(haySesion()).toBe(false);
  });
});

describe('web-sesion · token enviado a la API', () => {
  const fetchSimulado = vi.fn<typeof fetch>();

  function encabezados(): Record<string, string> {
    return (fetchSimulado.mock.calls.at(-1)?.[1]?.headers ?? {}) as Record<string, string>;
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchSimulado);
    fetchSimulado.mockResolvedValue(new Response('{}', { status: 200 }));
    conectarSesionConApi();
  });

  afterEach(() => {
    configurarProveedorToken(() => null);
  });

  it('Ingreso exitoso: las solicitudes siguientes incluyen Authorization: Bearer <token>', async () => {
    iniciarSesion('token-recibido', FUTURO);
    await apiFetch('/pacientes');
    expect(encabezados()['Authorization']).toBe('Bearer token-recibido');
  });

  it('Token vencido antes de la solicitud: la solicitud sale sin Authorization', async () => {
    iniciarSesion('token-vencido', PASADO);
    await apiFetch('/pacientes');
    expect(encabezados()).not.toHaveProperty('Authorization');
    expect(haySesion()).toBe(false);
  });

  it('Cerrar sesión: las solicitudes siguientes no incluyen Authorization', async () => {
    iniciarSesion('token', FUTURO);
    cerrarSesion('manual');
    await apiFetch('/pacientes');
    expect(encabezados()).not.toHaveProperty('Authorization');
  });
});
