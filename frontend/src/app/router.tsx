import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { InicioPage } from '../pages/InicioPage';
import { NoEncontradaPage } from '../pages/NoEncontradaPage';
import { AppLayout } from './AppLayout';

/**
 * Rutas de la web app. Los changes siguientes agregan rutas hijas acá (C-14 suma /login y la protección).
 * La página para rutas inexistentes vive dentro del layout para conservar la barra superior.
 */
export const rutas: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <InicioPage /> },
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
