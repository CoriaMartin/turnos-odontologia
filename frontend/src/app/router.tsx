import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AgendaPage } from '../features/agenda/AgendaPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RutaProtegida } from '../features/auth/RutaProtegida';
import { NoEncontradaPage } from '../pages/NoEncontradaPage';
import { AppLayout } from './AppLayout';

/**
 * Rutas de la web app. `/login` es pública y no lleva barra superior; todo lo demás requiere sesión
 * (C-14, design.md D4). Los changes siguientes agregan rutas hijas dentro del layout protegido.
 * `/` es la agenda (C-16). La página para rutas inexistentes vive dentro del layout para conservar la
 * barra superior.
 */
export const rutas: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RutaProtegida>
        <AppLayout />
      </RutaProtegida>
    ),
    children: [
      { index: true, element: <AgendaPage /> },
      { path: '*', element: <NoEncontradaPage /> },
    ],
  },
];

/** Opciones de React Router 6 que adelantan el comportamiento de la 7 y evitan avisos en consola. */
export const futuroRouter = {
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_partialHydration: true,
  v7_skipActionErrorRevalidation: true,
} as const;

export function crearRouter() {
  return createBrowserRouter(rutas, { future: futuroRouter });
}
