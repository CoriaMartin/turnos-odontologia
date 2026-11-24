import { Link } from 'react-router-dom';
import { useTituloDePagina } from '../shared/useTituloDePagina';
import estilos from './NoEncontradaPage.module.css';

/** Página para rutas que no existen. Sin códigos técnicos (spec web-app-shell). */
export function NoEncontradaPage() {
  useTituloDePagina('Página no encontrada');

  return (
    <div className={estilos.pagina}>
      <span className={estilos.icono} aria-hidden="true">
        ?
      </span>
      <h1 className={estilos.titulo}>No encontramos esta página</h1>
      <p className={estilos.texto}>
        Puede que la dirección esté mal escrita o que la página ya no exista. Volvé al inicio para
        seguir trabajando.
      </p>
      <Link className={estilos.botonPrimario} to="/">
        Volver al inicio
      </Link>
    </div>
  );
}
