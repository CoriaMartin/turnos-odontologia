import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router-dom';
import { AppProviders } from '../app/AppProviders';
import { crearQueryClient } from '../app/queryClient';
import { futuroRouter, rutas } from '../app/router';
import { conectarSesionConApi, iniciarSesion } from '../features/auth/sesion';

export const TOKEN_DE_PRUEBA = 'token-de-prueba';
const VENCIMIENTO_LEJANO = '2999-01-01T00:00:00Z';

interface OpcionesRender {
  /** Arranca con una sesión iniciada (token de prueba que no vence). Por defecto, sin sesión. */
  conSesion?: boolean;
}

/**
 * Renderiza la app real (mismas rutas y proveedores que main.tsx) en la ruta indicada,
 * con un router en memoria y un QueryClient nuevo por test.
 */
export function renderConRutas(ruta = '/', { conSesion = false }: OpcionesRender = {}) {
  conectarSesionConApi();
  if (conSesion) iniciarSesion(TOKEN_DE_PRUEBA, VENCIMIENTO_LEJANO);
  const router = createMemoryRouter(rutas, { initialEntries: [ruta], future: futuroRouter });
  const queryClient = crearQueryClient();
  const resultado = render(<AppProviders router={router} queryClient={queryClient} />);
  return { ...resultado, router, queryClient };
}
