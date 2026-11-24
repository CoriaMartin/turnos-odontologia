import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSesion } from './sesion';

/**
 * Muestra su contenido solo con sesión iniciada. Sin sesión lleva a /login y recuerda
 * la ruta pedida en `state.desde` para volver después de ingresar (spec web-sesion, design.md D4).
 */
export function RutaProtegida({ children }: { children: ReactNode }) {
  const { sesion } = useSesion();
  const location = useLocation();

  if (!sesion) {
    const desde = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ desde }} />;
  }
  return <>{children}</>;
}
