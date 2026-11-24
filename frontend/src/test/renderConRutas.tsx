import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router-dom';
import { AppProviders } from '../app/AppProviders';
import { crearQueryClient } from '../app/queryClient';
import { futuroRouter, rutas } from '../app/router';

/**
 * Renderiza la app real (mismas rutas y proveedores que main.tsx) en la ruta indicada,
 * con un router en memoria y un QueryClient nuevo por test.
 */
export function renderConRutas(ruta = '/') {
  const router = createMemoryRouter(rutas, { initialEntries: [ruta], future: futuroRouter });
  const queryClient = crearQueryClient();
  const resultado = render(<AppProviders router={router} queryClient={queryClient} />);
  return { ...resultado, router, queryClient };
}
