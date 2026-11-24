import { useId, type ReactNode } from 'react';
import estilos from './Gestion.module.css';

export interface PropsDeControl {
  id: string;
  'aria-invalid': true | undefined;
  'aria-describedby': string | undefined;
}

interface Props {
  etiqueta: string;
  error?: string | undefined;
  ayuda?: ReactNode;
  /** Texto bajo el campo alineado a la derecha (contador del motivo). */
  contador?: ReactNode;
  contadorExcedido?: boolean;
  ancho?: boolean;
  children: (props: PropsDeControl) => ReactNode;
}

/** Campo con etiqueta, mensaje de error y ayuda asociados al control (spec: "cada campo con error…"). */
export function CampoTexto({ etiqueta, error, ayuda, contador, contadorExcedido, ancho, children }: Props) {
  const id = useId();
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const descripcion = [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ');

  return (
    <div className={`${estilos.campo} ${ancho ? estilos.ancho : ''}`}>
      <label htmlFor={id}>{etiqueta}</label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': descripcion || undefined,
      })}
      {contador && (
        <span className={`${estilos.contador} ${contadorExcedido ? estilos.contadorExcedido : ''}`} aria-hidden="true">
          {contador}
        </span>
      )}
      {error && (
        <span id={idError} className={estilos.error}>
          {error}
        </span>
      )}
      {ayuda && (
        <span id={idAyuda} className={estilos.ayuda}>
          {ayuda}
        </span>
      )}
    </div>
  );
}
