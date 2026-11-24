import { useTituloDePagina } from '../shared/useTituloDePagina';
import estilos from './InicioPage.module.css';

/** Inicio provisorio hasta que exista la agenda (C-16). */
export function InicioPage() {
  useTituloDePagina('Inicio');

  return (
    <>
      <div className={estilos.encabezado}>
        <h1 className={estilos.titulo}>Inicio</h1>
        <p className={estilos.bajada}>Desde acá vas a manejar los turnos del consultorio.</p>
      </div>
      <div className={estilos.vacio}>
        <strong className={estilos.vacioTitulo}>La agenda todavía no está disponible</strong>
        <span>Cuando esté lista, acá vas a ver los turnos del día.</span>
      </div>
    </>
  );
}
