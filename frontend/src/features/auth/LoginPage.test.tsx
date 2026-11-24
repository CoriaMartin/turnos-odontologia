import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderConRutas } from '../../test/renderConRutas';
import { tokenVigente } from './sesion';

const fetchSimulado = vi.fn<typeof fetch>();

function respuestaLoginOk(token = 'token-recibido'): Response {
  return new Response(
    JSON.stringify({ token, tipo: 'Bearer', expiraEn: '2999-01-01T00:00:00Z' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

function problema(status: number, codigo: string, extra: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({ status, codigo, title: 'Error', ...extra }), {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}

function solicitudesDeLogin() {
  return fetchSimulado.mock.calls.filter(([url]) => String(url).endsWith('/auth/login'));
}

async function completarYEnviar(email: string, password: string) {
  const usuario = userEvent.setup();
  if (email) await usuario.type(screen.getByLabelText('Email'), email);
  if (password) await usuario.type(screen.getByLabelText('Contraseña'), password);
  await usuario.click(screen.getByRole('button', { name: 'Ingresar' }));
  return usuario;
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchSimulado);
  vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api');
});

describe('web-sesion · Página de inicio de sesión', () => {
  it('Abrir el login sin sesión: título, campos, botón "Ingresar" y sin "Cerrar sesión"', async () => {
    renderConRutas('/login');

    expect(screen.getByRole('heading', { level: 1, name: 'Ingresá a tu agenda' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument();
    expect(screen.getByText('Agenda de Odontología')).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Ingresar · Agenda de Odontología'));
  });

  it('Abrir el login con sesión iniciada lleva a /', async () => {
    const { router } = renderConRutas('/login', { conSesion: true });

    expect(await screen.findByRole('heading', { level: 1, name: 'Inicio' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });
});

describe('web-sesion · Ingreso con credenciales válidas', () => {
  it('Ingreso exitoso: muestra el inicio y guarda el token recibido', async () => {
    fetchSimulado.mockResolvedValue(respuestaLoginOk());
    const { router } = renderConRutas('/login');

    await completarYEnviar('consultorio@ejemplo.com', 'secreta');

    expect(await screen.findByRole('heading', { level: 1, name: 'Inicio' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
    expect(tokenVigente()).toBe('token-recibido');
    const [, init] = solicitudesDeLogin()[0]!;
    expect(init?.body).toBe('{"email":"consultorio@ejemplo.com","password":"secreta"}');
  });

  it('Volver a la ruta pedida después de ingresar', async () => {
    fetchSimulado.mockResolvedValue(respuestaLoginOk());
    const { router } = renderConRutas('/ruta-pedida?x=1');

    expect(await screen.findByRole('heading', { level: 1, name: 'Ingresá a tu agenda' })).toBeInTheDocument();
    await completarYEnviar('consultorio@ejemplo.com', 'secreta');

    await waitFor(() => expect(router.state.location.pathname).toBe('/ruta-pedida'));
    expect(router.state.location.search).toBe('?x=1');
  });
});

describe('web-sesion · Token solo en memoria', () => {
  it('Ingreso sin persistir el token: ni storage ni URL lo contienen', async () => {
    const escribir = vi.spyOn(Storage.prototype, 'setItem');
    fetchSimulado.mockResolvedValue(respuestaLoginOk('token-unico-123'));
    const { router } = renderConRutas('/login');

    await completarYEnviar('consultorio@ejemplo.com', 'secreta');
    await screen.findByRole('heading', { level: 1, name: 'Inicio' });

    expect(escribir).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    const { pathname, search, hash } = router.state.location;
    expect(`${pathname}${search}${hash}`).not.toContain('token-unico-123');
  });
});

describe('web-sesion · Estado de carga del ingreso', () => {
  it('Ingreso en curso: "Ingresando…" con aria-busy y sin segundo envío', async () => {
    fetchSimulado.mockReturnValue(new Promise<Response>(() => {}));
    renderConRutas('/login');

    const usuario = await completarYEnviar('consultorio@ejemplo.com', 'secreta');

    const boton = await screen.findByRole('button', { name: 'Ingresando…' });
    expect(boton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly');
    await usuario.click(boton);
    expect(solicitudesDeLogin()).toHaveLength(1);
  });
});

describe('web-sesion · Campos obligatorios antes de enviar', () => {
  it('Envío con campos vacíos: no llama a la API, marca los dos campos y enfoca el email', async () => {
    renderConRutas('/login');

    await completarYEnviar('', '');

    expect(fetchSimulado).not.toHaveBeenCalled();
    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Contraseña');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Ingresá tu email');
    expect(password).toHaveAccessibleDescription('Ingresá tu contraseña');
    expect(email).toHaveFocus();
  });

  it('solo contraseña vacía: enfoca la contraseña', async () => {
    renderConRutas('/login');

    await completarYEnviar('consultorio@ejemplo.com', '');

    expect(fetchSimulado).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Contraseña')).toHaveFocus();
  });
});

describe('web-sesion · Error de credenciales genérico', () => {
  it('Credenciales inválidas: aviso genérico, contraseña vacía y email conservado', async () => {
    fetchSimulado.mockResolvedValue(problema(401, 'CREDENCIALES_INVALIDAS'));
    renderConRutas('/login');

    await completarYEnviar('consultorio@ejemplo.com', 'incorrecta');

    const aviso = await screen.findByRole('alert');
    expect(within(aviso).getByText('No pudimos iniciar sesión')).toBeInTheDocument();
    expect(aviso).toHaveTextContent(
      'El email o la contraseña no son correctos. Revisalos y probá de nuevo.',
    );
    expect(aviso).not.toHaveTextContent('CREDENCIALES_INVALIDAS');
    expect(aviso).not.toHaveTextContent('401');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('');
    expect(screen.getByLabelText('Contraseña')).toHaveFocus();
    expect(screen.getByLabelText('Email')).toHaveValue('consultorio@ejemplo.com');
  });

  it('El 401 del login no es sesión vencida', async () => {
    fetchSimulado.mockResolvedValue(problema(401, 'CREDENCIALES_INVALIDAS'));
    renderConRutas('/login');

    await completarYEnviar('consultorio@ejemplo.com', 'incorrecta');
    await screen.findByRole('alert');

    expect(screen.queryByText('Tu sesión venció')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('web-sesion · Aviso de bloqueo por intentos', () => {
  it('Login bloqueado: aviso de 15 minutos sin códigos técnicos', async () => {
    fetchSimulado.mockResolvedValue(problema(429, 'LOGIN_BLOQUEADO'));
    renderConRutas('/login');

    await completarYEnviar('consultorio@ejemplo.com', 'secreta');

    const aviso = await screen.findByRole('alert');
    expect(within(aviso).getByText('Ingreso bloqueado por 15 minutos')).toBeInTheDocument();
    expect(aviso).toHaveTextContent(
      'Hubo demasiados intentos fallidos. Esperá 15 minutos y volvé a intentar.',
    );
    expect(aviso).not.toHaveTextContent('LOGIN_BLOQUEADO');
    expect(aviso).not.toHaveTextContent('429');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('consultorio@ejemplo.com');
  });
});

describe('web-sesion · Otros errores del login', () => {
  it('Sin conexión al ingresar: explica que no se pudo conectar y sugiere revisar la conexión', async () => {
    fetchSimulado.mockRejectedValue(new TypeError('Failed to fetch'));
    renderConRutas('/login');

    await completarYEnviar('consultorio@ejemplo.com', 'secreta');

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent(/no pudimos conectarnos con el servidor/i);
    expect(aviso).toHaveTextContent(/revisá tu conexión/i);
  });

  it('422 de la API: marca el campo email con un texto propio, sin el del backend', async () => {
    fetchSimulado.mockResolvedValue(
      problema(422, 'VALIDACION_FALLIDA', {
        errores: [{ campo: 'email', mensaje: 'must be a well-formed email address' }],
      }),
    );
    renderConRutas('/login');

    await completarYEnviar('sin-arroba', 'secreta');

    expect(await screen.findByRole('alert')).toHaveTextContent(/revisá los campos marcados/i);
    const email = screen.getByLabelText('Email');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(/formato nombre@consultorio.com/);
    expect(document.body).not.toHaveTextContent('well-formed');
  });
});
