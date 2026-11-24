import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login } from './api';

const fetchSimulado = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchSimulado);
  vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api');
});

describe('web-sesion · llamada de login', () => {
  it('envía POST /api/auth/login con email y contraseña y devuelve el token', async () => {
    const respuesta = { token: 'tok', tipo: 'Bearer', expiraEn: '2999-01-01T00:00:00Z' };
    fetchSimulado.mockResolvedValue(new Response(JSON.stringify(respuesta), { status: 200 }));

    await expect(login({ email: 'a@ejemplo.com', password: 'secreta' })).resolves.toEqual(respuesta);

    const [url, init] = fetchSimulado.mock.calls[0]!;
    expect(String(url)).toBe('http://localhost:8080/api/auth/login');
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"email":"a@ejemplo.com","password":"secreta"}');
  });
});
