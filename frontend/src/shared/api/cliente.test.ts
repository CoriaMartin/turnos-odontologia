import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './ApiError';
import { apiFetch, configurarProveedorToken } from './cliente';

const fetchSimulado = vi.fn<typeof fetch>();

function respuestaJson(status: number, cuerpo: unknown, tipo = 'application/json'): Response {
  return new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': tipo } });
}

function ultimaSolicitud(): { url: string; init: RequestInit } {
  const llamada = fetchSimulado.mock.calls.at(-1);
  if (!llamada) throw new Error('fetch no fue llamado');
  return { url: String(llamada[0]), init: llamada[1] ?? {} };
}

function encabezados(): Record<string, string> {
  return (ultimaSolicitud().init.headers ?? {}) as Record<string, string>;
}

async function capturarError(promesa: Promise<unknown>): Promise<unknown> {
  try {
    await promesa;
  } catch (error) {
    return error;
  }
  throw new Error('se esperaba que la solicitud fallara');
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchSimulado);
  vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api');
  fetchSimulado.mockResolvedValue(respuestaJson(200, {}));
});

afterEach(() => {
  fetchSimulado.mockReset();
  configurarProveedorToken(() => null);
});

describe('web-api-client · URL base configurable', () => {
  it('Ruta con URL base configurada', async () => {
    await apiFetch('/pacientes');
    expect(ultimaSolicitud().url).toBe('http://localhost:8080/api/pacientes');
  });

  it('URL base con barra final: no quedan dos barras seguidas', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api/');
    await apiFetch('/pacientes');
    expect(ultimaSolicitud().url).toBe('http://localhost:8080/api/pacientes');
  });

  it('sin VITE_API_URL usa http://localhost:8080/api', async () => {
    vi.stubEnv('VITE_API_URL', '');
    await apiFetch('/pacientes');
    expect(ultimaSolicitud().url).toBe('http://localhost:8080/api/pacientes');
  });
});

describe('web-api-client · Cuerpo y respuesta en JSON', () => {
  it('Respuesta exitosa con cuerpo: devuelve el JSON interpretado', async () => {
    fetchSimulado.mockResolvedValue(respuestaJson(200, [{ id: 1, apellido: 'Ficticio' }]));
    await expect(apiFetch('/pacientes')).resolves.toEqual([{ id: 1, apellido: 'Ficticio' }]);
  });

  it('Respuesta exitosa sin cuerpo (204): termina sin error y sin datos', async () => {
    fetchSimulado.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiFetch('/pacientes/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('envía el cuerpo como JSON con Content-Type application/json', async () => {
    await apiFetch('/pacientes', { method: 'POST', body: { nombre: 'Ficticio' } });
    expect(ultimaSolicitud().init.body).toBe('{"nombre":"Ficticio"}');
    expect(encabezados()['Content-Type']).toBe('application/json');
  });
});

describe('web-api-client · Envío del token de sesión', () => {
  it('Solicitud con sesión: incluye Authorization: Bearer <token>', async () => {
    configurarProveedorToken(() => 'token-de-prueba');
    await apiFetch('/pacientes');
    expect(encabezados()['Authorization']).toBe('Bearer token-de-prueba');
  });

  it('Solicitud sin sesión: no incluye Authorization', async () => {
    await apiFetch('/pacientes');
    expect(encabezados()).not.toHaveProperty('Authorization');
  });
});

describe('web-api-client · Errores Problem Details tipados', () => {
  it('Error de negocio: estado 409 y codigo TURNO_SOLAPADO', async () => {
    fetchSimulado.mockResolvedValue(
      respuestaJson(
        409,
        {
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          detail: 'El horario se superpone con otro turno',
          instance: '/api/turnos',
          codigo: 'TURNO_SOLAPADO',
        },
        'application/problem+json',
      ),
    );

    const error = await capturarError(apiFetch('/turnos', { method: 'POST', body: {} }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      codigo: 'TURNO_SOLAPADO',
      titulo: 'Conflict',
      detalle: 'El horario se superpone con otro turno',
    });
  });

  it('Error de validación con campos: incluye el error del campo dni', async () => {
    fetchSimulado.mockResolvedValue(
      respuestaJson(
        422,
        {
          title: 'Unprocessable Entity',
          status: 422,
          codigo: 'VALIDACION_FALLIDA',
          errores: [{ campo: 'dni', mensaje: 'debe tener 7 u 8 dígitos' }],
        },
        'application/problem+json',
      ),
    );

    const error = await capturarError(apiFetch('/pacientes', { method: 'POST', body: {} }));

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).errores).toEqual([
      { campo: 'dni', mensaje: 'debe tener 7 u 8 dígitos' },
    ]);
  });
});

describe('web-api-client · Errores sin formato Problem Details', () => {
  it('Error con cuerpo no reconocido: estado 502 y codigo ERROR_DESCONOCIDO', async () => {
    fetchSimulado.mockResolvedValue(
      new Response('<html><body>Bad Gateway</body></html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' },
      }),
    );

    const error = await capturarError(apiFetch('/pacientes'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 502, codigo: 'ERROR_DESCONOCIDO' });
  });

  it('Problem Details ilegible: codigo ERROR_DESCONOCIDO', async () => {
    fetchSimulado.mockResolvedValue(
      new Response('{no es json', {
        status: 500,
        headers: { 'Content-Type': 'application/problem+json' },
      }),
    );

    await expect(apiFetch('/pacientes')).rejects.toMatchObject({
      status: 500,
      codigo: 'ERROR_DESCONOCIDO',
    });
  });

  it('Sin conexión: estado 0 y codigo SIN_CONEXION', async () => {
    fetchSimulado.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await capturarError(apiFetch('/pacientes'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, codigo: 'SIN_CONEXION' });
  });

  it('la cancelación por AbortSignal se propaga sin convertirse en ApiError', async () => {
    const controlador = new AbortController();
    const cancelacion = new DOMException('La operación se canceló', 'AbortError');
    fetchSimulado.mockImplementation(() => {
      controlador.abort();
      return Promise.reject(cancelacion);
    });

    const error = await capturarError(apiFetch('/pacientes', { signal: controlador.signal }));

    expect(error).toBe(cancelacion);
    expect(error).not.toBeInstanceOf(ApiError);
  });
});
