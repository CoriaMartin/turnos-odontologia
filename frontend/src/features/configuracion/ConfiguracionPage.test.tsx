import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { cuerpoDe, respuestaJson, simularApi } from '../../test/catalogos';
import { CONFIGURACION_DE_PRUEBA } from '../../test/configuracion';
import { renderConRutas, TOKEN_DE_PRUEBA } from '../../test/renderConRutas';
import { CLAVE_CONFIGURACION } from './api';

const CONFIGURACION_NUEVA = {
  horasCancelacionTardia: 48,
  horasAnticipacionRecordatorio: 12,
  zonaHoraria: 'America/Argentina/Buenos_Aires',
};

function simularConfiguracion(
  alGuardar: (init: RequestInit | undefined) => Response | Promise<Response> = () =>
    respuestaJson(CONFIGURACION_NUEVA),
) {
  return simularApi((url, init) => {
    if (!url.pathname.endsWith('/configuracion')) return respuestaJson([]);
    return init?.method === 'PUT' ? alGuardar(init) : respuestaJson(CONFIGURACION_DE_PRUEBA);
  });
}

async function abrirConfigurador() {
  renderConRutas('/configuracion', { conSesion: true });
  return {
    cancelacion: await screen.findByRole('spinbutton', { name: 'Horas de cancelación tardía' }),
    recordatorio: await screen.findByRole('spinbutton', {
      name: 'Horas de anticipación del recordatorio',
    }),
  };
}

describe('web-configuracion-recordatorios · Pantalla de configuración', () => {
  it('Abrir el configurador sin sesión: login y ruta recordada', async () => {
    simularConfiguracion();
    const { router } = renderConRutas('/configuracion');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({ desde: '/configuracion' });
  });

  it('Abrir el configurador con sesión iniciada: título, bajada y valores por defecto', async () => {
    simularConfiguracion();
    const { cancelacion, recordatorio } = await abrirConfigurador();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Configuración de recordatorios' }),
    ).toBeInTheDocument();
    expect(cancelacion).toHaveValue(24);
    expect(recordatorio).toHaveValue(24);
    expect(cancelacion).not.toHaveAttribute('aria-invalid');
    expect(recordatorio).not.toHaveAttribute('aria-invalid');
  });

  it('Envío con campos válidos: PUT con los nuevos valores y aviso sin códigos', async () => {
    const fetchSimulado = simularConfiguracion();
    const usuario = userEvent.setup();
    const { cancelacion, recordatorio } = await abrirConfigurador();

    await usuario.clear(cancelacion);
    await usuario.type(cancelacion, '48');
    await usuario.clear(recordatorio);
    await usuario.type(recordatorio, '12');
    await usuario.click(screen.getByRole('button', { name: 'Guardar configuración' }));

    const aviso = await screen.findByRole('alert');
    expect(within(aviso).getByText('Configuración guardada')).toBeInTheDocument();
    expect(aviso).toHaveTextContent('La configuración se guardó correctamente.');
    expect(aviso).not.toHaveTextContent('GUARDAR_EXITOSO');
    const guardado = fetchSimulado.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(cuerpoDe(guardado?.[1])).toEqual({
      horasCancelacionTardia: 48,
      horasAnticipacionRecordatorio: 12,
    });
  });

  it('Horas inválidas (cancelación -1): sin PUT, mensaje y foco en el campo', async () => {
    const fetchSimulado = simularConfiguracion();
    const usuario = userEvent.setup();
    const { cancelacion } = await abrirConfigurador();

    await usuario.clear(cancelacion);
    await usuario.type(cancelacion, '-1');
    await usuario.click(screen.getByRole('button', { name: 'Guardar configuración' }));

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent('Revisá las horas cargadas');
    expect(aviso).toHaveTextContent('números enteros');
    expect(aviso).not.toHaveTextContent('HORAS_INVALIDAS');
    expect(screen.getByText('Debe ser ≥ 0')).toBeInTheDocument();
    expect(cancelacion).toHaveAttribute('aria-invalid', 'true');
    expect(cancelacion).toHaveFocus();
    expect(fetchSimulado.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false);
  });

  it('Horas inválidas (recordatorio 0): sin PUT y mensaje en el campo', async () => {
    const fetchSimulado = simularConfiguracion();
    const usuario = userEvent.setup();
    const { recordatorio } = await abrirConfigurador();

    await usuario.clear(recordatorio);
    await usuario.type(recordatorio, '0');
    await usuario.click(screen.getByRole('button', { name: 'Guardar configuración' }));

    expect(await screen.findByText('Debe ser > 0')).toBeInTheDocument();
    expect(recordatorio).toHaveAttribute('aria-invalid', 'true');
    expect(recordatorio).toHaveFocus();
    expect(fetchSimulado.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false);
  });

  it('Guardando en curso: botón ocupado y un solo envío', async () => {
    const fetchSimulado = simularConfiguracion(() => new Promise<Response>(() => undefined));
    const usuario = userEvent.setup();
    await abrirConfigurador();

    await usuario.click(screen.getByRole('button', { name: 'Guardar configuración' }));

    const ocupado = await screen.findByRole('button', { name: 'Guardando...' });
    expect(ocupado).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
    await usuario.click(screen.getByRole('button', { name: 'Guardando...' }));
    expect(fetchSimulado.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(1);
  });

  it('Sin conexión al guardar: aviso legible y sin código técnico', async () => {
    simularConfiguracion(() => Promise.reject(new TypeError('Failed to fetch')));
    const usuario = userEvent.setup();
    await abrirConfigurador();

    await usuario.click(screen.getByRole('button', { name: 'Guardar configuración' }));

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent('No pudimos conectarnos con el servidor');
    expect(aviso).not.toHaveTextContent('SIN_CONEXION');
  });

  it('Guardado sin persistir los valores: un PUT fallido deja la caché y el formulario como estaban', async () => {
    simularConfiguracion(() => respuestaJson({ status: 422, codigo: 'HORAS_INVALIDAS' }, 422));
    const usuario = userEvent.setup();
    const { queryClient } = renderConRutas('/configuracion', { conSesion: true });
    const cancelacion = await screen.findByRole('spinbutton', { name: 'Horas de cancelación tardía' });

    await usuario.clear(cancelacion);
    await usuario.type(cancelacion, '36');
    await usuario.click(screen.getByRole('button', { name: 'Guardar configuración' }));

    expect(await screen.findByText('No pudimos guardar la configuración')).toBeInTheDocument();
    expect(queryClient.getQueryData(CLAVE_CONFIGURACION)).toEqual(CONFIGURACION_DE_PRUEBA);
    expect(cancelacion).toHaveValue(36);
  });

  it('Volver a la ruta pedida desde el configurador', async () => {
    simularConfiguracion();
    const { router } = renderConRutas('/configuracion', { conSesion: true });
    await screen.findByRole('spinbutton', { name: 'Horas de cancelación tardía' });

    await act(async () => {
      await router.navigate('/configuracion', { state: { desde: '/pacientes' } });
    });

    expect(screen.getByRole('link', { name: 'Volver a la agenda' })).toHaveAttribute(
      'href',
      '/pacientes',
    );
  });

  it('Sin la ruta pedida, el retorno vuelve a la agenda', async () => {
    simularConfiguracion();
    await abrirConfigurador();

    expect(screen.getByRole('link', { name: 'Volver a la agenda' })).toHaveAttribute('href', '/');
  });

  it('La solicitud de configuración lleva el token de la sesión', async () => {
    const fetchSimulado = simularConfiguracion();
    await abrirConfigurador();

    const solicitud = fetchSimulado.mock.calls.find(([entrada]) =>
      String(entrada).endsWith('/configuracion'),
    );
    expect((solicitud?.[1]?.headers as Record<string, string>)['Authorization']).toBe(
      `Bearer ${TOKEN_DE_PRUEBA}`,
    );
  });

  it('Sin sesión, la solicitud de configuración no lleva token', async () => {
    const fetchSimulado = simularConfiguracion();
    const { obtenerConfiguracion } = await import('./api');

    await expect(obtenerConfiguracion()).resolves.toEqual(CONFIGURACION_DE_PRUEBA);
    expect(fetchSimulado.mock.calls).toHaveLength(1);
    expect(fetchSimulado.mock.calls[0]?.[1]?.headers).not.toHaveProperty('Authorization');
  });

  it('Cargando la configuración: mensaje y región ocupada', () => {
    const fetchSimulado = vi.fn<typeof fetch>(() => new Promise<Response>(() => undefined));
    vi.stubGlobal('fetch', fetchSimulado);
    renderConRutas('/configuracion', { conSesion: true });

    expect(screen.getByText('Cargando la configuración del consultorio...')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Formulario de configuración' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('Reintentar tras un error de carga vuelve a pedir la configuración', async () => {
    let falla = true;
    const fetchSimulado = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        falla
          ? respuestaJson({ status: 422, codigo: 'VALIDACION_FALLIDA' }, 422)
          : respuestaJson(CONFIGURACION_DE_PRUEBA),
      ),
    );
    vi.stubGlobal('fetch', fetchSimulado);
    const usuario = userEvent.setup();
    renderConRutas('/configuracion', { conSesion: true });

    expect(await screen.findByText('No pudimos cargar la configuración')).toBeInTheDocument();
    falla = false;
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(
      await screen.findByRole('spinbutton', { name: 'Horas de cancelación tardía' }),
    ).toBeInTheDocument();
    expect(fetchSimulado.mock.calls.length).toBeGreaterThan(1);
  });
});

describe('web-configuracion-recordatorios · Mensajes', () => {
  it('Los textos de HORAS_INVALIDAS y GUARDAR_EXITOSO no incluyen códigos', async () => {
    const { MENSAJES_POR_CODIGO } = await import('../../shared/api/mensajes');

    expect(MENSAJES_POR_CODIGO['HORAS_INVALIDAS']).not.toMatch(/HORAS_INVALIDAS/);
    expect(MENSAJES_POR_CODIGO['GUARDAR_EXITOSO']).not.toMatch(/GUARDAR_EXITOSO/);
  });
});
