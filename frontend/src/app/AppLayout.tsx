import logoUrl from '@design-system/assets/logo.svg';
import { Link, Outlet } from 'react-router-dom';
import { cerrarSesion } from '../features/auth/sesion';
import { BRAND_NAME } from '../shared/brand';
import estilos from './AppLayout.module.css';

/**
 * Barra superior con la marca y "Cerrar sesión", y región principal donde se muestra cada ruta
 * (specs web-app-shell y web-sesion). Solo se usa dentro de RutaProtegida.
 */
export function AppLayout() {
  return (
    <div className={estilos.layout}>
      <a className={estilos.saltar} href="#contenido">
        Saltar al contenido
      </a>
      <header className={estilos.barra}>
        <Link className={estilos.marca} to="/" aria-label={`${BRAND_NAME}, ir al inicio`}>
          <img className={estilos.logo} src={logoUrl} alt={BRAND_NAME} />
          <strong className={estilos.nombre}>{BRAND_NAME}</strong>
        </Link>
        <span className={estilos.separador} />
        {/* Al cerrar, RutaProtegida lleva a /login y el QueryClient descarta los datos (design.md D5). */}
        <button className={estilos.botonFantasma} type="button" onClick={() => cerrarSesion('manual')}>
          Cerrar sesión
        </button>
      </header>
      <main id="contenido" tabIndex={-1} className={estilos.contenido}>
        <Outlet />
      </main>
    </div>
  );
}
