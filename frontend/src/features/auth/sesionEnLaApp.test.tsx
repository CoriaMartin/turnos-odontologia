import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from '../../shared/api/cliente';
import { renderConRutas } from '../../test/renderConRutas';
import { iniciarSesion } from './sesion';

const fetchSimulado = vi.fn<typeof fetch>();

function noAutenticado(): Response {
  return new Response(JSON.stringify({ status: 401, codigo: 'NO_AUTENTICADO', title: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}

function encabezadosDeLaUltimaSolicitud(): Record<string, string> {
  return (fetchSimulado.mock.calls.at(-1)?.[1]?.headers ?? {}) as Record<string, string>;
}

const DATOS_EN_CACHE = [{ id: 1, apellido: 'Ficticio' }];

beforeEach(() => {
  fetchSimulado.mockReset();
  vi.stubGlobal('fetch', fetchSimulado);
  vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api');
});

describe('web-sesion · Sesión vencida o rechazada por la API', () => {
  it('La API rechaza el token: vuelve a /login con el aviso y descarta los datos cargados', async () => {
    fetchSimulado.mockResolvedValue(noAutenticado());
    const { router, queryClient } = renderConRutas('/', { conSesion: true });
    queryClient.setQueryData(['pacientes'], DATOS_EN_CACHE);

    await act(async () => {
      await queryClient
        .fetchQuery({ queryKey: ['turnos'], queryFn: () => apiFetch('/turnos') })
        .catch(() => undefined);
    });

    expect(await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' })).toBeInTheDocument();
    // Título y texto del aviso, como en la maqueta aprobada (login-sesion-vencida.html).
    const aviso = screen.getByRole('status');
    expect(within(aviso).getByText('Tu sesión venció')).toBeInTheDocument();
    expect(aviso).toHaveTextContent('Ingresá de nuevo para seguir.');
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({ desde: '/' });
    expect(queryClient.getQueryData(['pacientes'])).toBeUndefined();
  });

  it('un 401 en una mutación también cierra la sesión', async () => {
    fetchSimulado.mockResolvedValue(noAutenticado());
    const { queryClient } = renderConRutas('/', { conSesion: true });

    await act(async () => {
      await queryClient
        .getMutationCache()
        .build(queryClient, { mutationFn: () => apiFetch('/turnos', { method: 'POST', body: {} }) })
        .execute(undefined)
        .catch(() => undefined);
    });

    expect(await screen.findByText('Tu sesión venció')).toBeInTheDocument();
  });

  it('Token vencido antes de la solicitud: sale sin Authorization y vuelve a /login con el aviso', async () => {
    fetchSimulado.mockResolvedValue(noAutenticado());
    const { queryClient } = renderConRutas('/', { conSesion: true });
    queryClient.setQueryData(['pacientes'], DATOS_EN_CACHE);
    act(() => iniciarSesion('token-vencido', '2000-01-01T00:00:00Z'));

    await act(async () => {
      await queryClient
        .fetchQuery({ queryKey: ['turnos'], queryFn: () => apiFetch('/turnos') })
        .catch(() => undefined);
    });

    expect(encabezadosDeLaUltimaSolicitud()).not.toHaveProperty('Authorization');
    expect(await screen.findByText('Tu sesión venció')).toBeInTheDocument();
    expect(queryClient.getQueryData(['pacientes'])).toBeUndefined();
  });
});

describe('web-agenda · Sesión vencida al consultar la agenda', () => {
  it('Token rechazado al cargar la agenda: login con el aviso y, al ingresar, vuelve a la misma fecha y vista', async () => {
    let loginHecho = false;
    fetchSimulado.mockImplementation((entrada) => {
      const url = String(entrada);
      if (url.endsWith('/auth/login')) {
        loginHecho = true;
        return Promise.resolve(
          new Response(JSON.stringify({ token: 'token-nuevo', tipo: 'Bearer', expiraEn: '2999-01-01T00:00:00Z' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      return Promise.resolve(loginHecho ? new Response('[]', { status: 200 }) : noAutenticado());
    });
    const usuario = userEvent.setup();
    const { router } = renderConRutas('/?fecha=2026-12-02&vista=dia', { conSesion: true });

    expect(await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' })).toBeInTheDocument();
    expect(within(screen.getByRole('status')).getByText('Tu sesión venció')).toBeInTheDocument();
    expect(screen.queryByText('No pudimos cargar la agenda')).not.toBeInTheDocument();
    expect(router.state.location.state).toEqual({ desde: '/?fecha=2026-12-02&vista=dia' });

    await usuario.type(screen.getByLabelText('Email'), 'consultorio@ejemplo.com');
    await usuario.type(screen.getByLabelText('Contraseña'), 'secreta');
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Agenda' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?fecha=2026-12-02&vista=dia');
    expect(screen.getByText('Miércoles 2 de diciembre de 2026')).toBeInTheDocument();
  });
});

describe('web-administracion · Sesión en las rutas nuevas', () => {
  it.each(['/prestaciones', '/pacientes', '/configuracion'])(
    'Ruta protegida sin sesión: %s lleva al login y recuerda la ruta',
    async (ruta) => {
      const { router } = renderConRutas(ruta);

      expect(
        await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' }),
      ).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/login');
      expect(router.state.location.state).toEqual({ desde: ruta });
    },
  );

  it('Token rechazado al cargar: en prestaciones, 401 → login con aviso y vuelta a la ruta', async () => {
    let loginHecho = false;
    fetchSimulado.mockImplementation((entrada) => {
      if (String(entrada).endsWith('/auth/login')) {
        loginHecho = true;
        return Promise.resolve(
          new Response(
            JSON.stringify({ token: 'token-nuevo', tipo: 'Bearer', expiraEn: '2999-01-01T00:00:00Z' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }
      return Promise.resolve(
        loginHecho ? new Response('[]', { status: 200 }) : noAutenticado(),
      );
    });
    const usuario = userEvent.setup();
    const { router } = renderConRutas('/prestaciones', { conSesion: true });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' }),
    ).toBeInTheDocument();
    expect(within(screen.getByRole('status')).getByText('Tu sesión venció')).toBeInTheDocument();
    expect(screen.queryByText('No pudimos cargar las prestaciones')).not.toBeInTheDocument();
    expect(router.state.location.state).toEqual({ desde: '/prestaciones' });

    await usuario.type(screen.getByLabelText('Email'), 'consultorio@ejemplo.com');
    await usuario.type(screen.getByLabelText('Contraseña'), 'secreta');
    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Catálogo de prestaciones' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/prestaciones');
  });
});

describe('web-sesion · Cierre de sesión', () => {
  it('Cerrar sesión: muestra el login sin aviso, descarta datos y no envía más el token', async () => {
    // Una respuesta nueva por solicitud: desde C-16, `/` ya pide la agenda antes del `apiFetch` del final.
    fetchSimulado.mockImplementation(() => Promise.resolve(new Response('[]', { status: 200 })));
    const usuario = userEvent.setup();
    const { router, queryClient } = renderConRutas('/', { conSesion: true });
    queryClient.setQueryData(['pacientes'], DATOS_EN_CACHE);

    await usuario.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(queryClient.getQueryData(['pacientes'])).toBeUndefined();

    await apiFetch('/pacientes');
    expect(encabezadosDeLaUltimaSolicitud()).not.toHaveProperty('Authorization');
  });

  it('Volver atrás después de cerrar sesión: abrir / muestra el login', async () => {
    const usuario = userEvent.setup();
    const { router } = renderConRutas('/', { conSesion: true });

    await usuario.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' });
    await act(async () => {
      await router.navigate('/');
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Ingresá a tu agenda' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });
});
