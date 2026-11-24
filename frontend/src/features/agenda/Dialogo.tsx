import { useEffect, useId, useRef, type FormEvent, type ReactNode } from 'react';
import { useDialogo } from '../../shared/useDialogo';
import estilos from './Gestion.module.css';

interface Props {
  titulo: string;
  bajada?: ReactNode;
  /** Escape, "×" o clic en el fondo. No hace nada mientras `ocupado`. */
  onCerrar: () => void;
  ocupado?: boolean;
  /** Si se indica, cuerpo y pie van en un `<form>` (Enter envía). */
  onEnviar?: () => void;
  pie: ReactNode;
  children: ReactNode;
}

/**
 * Diálogo modal de C-17 (design.md D7): reutiliza `useDialogo` de C-15 (foco atrapado, Escape y foco de
 * vuelta al disparador). Al abrirse lleva el foco al elemento marcado con `data-autofoco`.
 */
export function Dialogo({ titulo, bajada, onCerrar, ocupado = false, onEnviar, pie, children }: Props) {
  const idTitulo = useId();
  const idBajada = useId();
  const cerrar = () => {
    if (!ocupado) onCerrar();
  };
  const { referencia, alPulsarTecla } = useDialogo<HTMLDivElement>(cerrar);

  useEffect(() => {
    referencia.current?.querySelector<HTMLElement>('[data-autofoco]')?.focus();
  }, [referencia]);

  // Mientras `ocupado`, los controles están deshabilitados y el navegador saca el foco del que lo tenía
  // (queda en <body>). Al terminar, si el diálogo sigue abierto (p. ej. con un rechazo de la API), el foco
  // vuelve al diálogo para que Escape y Tab sigan funcionando. Un error de campo lo mueve después a ese campo.
  const estabaOcupado = useRef(ocupado);
  useEffect(() => {
    const dialogo = referencia.current;
    if (estabaOcupado.current && !ocupado && dialogo && !dialogo.contains(document.activeElement)) {
      dialogo.focus();
    }
    estabaOcupado.current = ocupado;
  }, [ocupado, referencia]);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    onEnviar?.();
  };

  const contenido = (
    <>
      <div className={estilos.dialogoCuerpo}>{children}</div>
      <div className={estilos.dialogoPie}>{pie}</div>
    </>
  );

  return (
    <div
      className={estilos.fondo}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) cerrar();
      }}
    >
      <div
        ref={referencia}
        className={estilos.dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={bajada ? idBajada : undefined}
        tabIndex={-1}
        onKeyDown={alPulsarTecla}
      >
        <div className={estilos.dialogoCabecera}>
          <div className={estilos.dialogoTitulo}>
            <h2 id={idTitulo}>{titulo}</h2>
            <button
              className={`${estilos.boton} ${estilos.botonGhost} ${estilos.botonIcono}`}
              type="button"
              aria-label="Cerrar"
              onClick={cerrar}
              disabled={ocupado}
            >
              ×
            </button>
          </div>
          {bajada && (
            <p id={idBajada} className={estilos.dialogoBajada}>
              {bajada}
            </p>
          )}
        </div>
        {onEnviar ? (
          <form noValidate onSubmit={enviar}>
            {contenido}
          </form>
        ) : (
          contenido
        )}
      </div>
    </div>
  );
}
