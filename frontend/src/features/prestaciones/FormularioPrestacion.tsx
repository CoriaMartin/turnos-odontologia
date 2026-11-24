import { useState, type FormEvent } from 'react';
import { ApiError } from '../../shared/api/ApiError';
import { MENSAJES_POR_CODIGO, mensajeDeError } from '../../shared/api/mensajes';
import { useDialogo } from '../../shared/useDialogo';
import { useGuardarPrestacion } from './hooks';
import type { Prestacion } from './tipos';
import estilos from './Prestaciones.module.css';

type Campos = Record<'nombre' | 'duracionMinutos', string>;

interface Props {
  prestacion?: Prestacion | undefined;
  onCerrar: () => void;
}

function interpretarError(error: unknown): { campos: Partial<Campos>; general: string | null } {
  const campos: Partial<Campos> = {};
  if (error instanceof ApiError) {
    if (error.codigo === 'NOMBRE_DUPLICADO') {
      campos.nombre = MENSAJES_POR_CODIGO.NOMBRE_DUPLICADO ?? mensajeDeError(error);
    }
    if (error.codigo === 'VALIDACION_FALLIDA') {
      for (const fallo of error.errores) {
        if (fallo.campo === 'nombre') {
          campos.nombre = 'Revisá el nombre: es obligatorio y no puede superar los 100 caracteres.';
        }
        if (fallo.campo === 'duracionMinutos') {
          campos.duracionMinutos = 'Entre 5 y 480 minutos.';
        }
      }
    }
  }
  return { campos, general: Object.keys(campos).length > 0 ? null : mensajeDeError(error) };
}

export function FormularioPrestacion({ prestacion, onCerrar }: Props) {
  const [nombre, setNombre] = useState(prestacion?.nombre ?? '');
  const [duracion, setDuracion] = useState(String(prestacion?.duracionMinutos ?? ''));
  const [errores, setErrores] = useState<Partial<Campos>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const guardar = useGuardarPrestacion();
  const { referencia, alPulsarTecla } = useDialogo<HTMLDivElement>(onCerrar);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const campos: Partial<Campos> = {};
    const nombreLimpio = nombre.trim();
    const minutos = Number(duracion);

    if (!nombreLimpio) campos.nombre = 'Escribí el nombre de la prestación.';
    if (!Number.isInteger(minutos) || minutos < 5 || minutos > 480) {
      campos.duracionMinutos = 'Entre 5 y 480 minutos.';
    }

    setErrores(campos);
    setErrorGeneral(null);
    if (Object.keys(campos).length > 0) return;

    const datos = { nombre: nombreLimpio, duracionMinutos: minutos };
    guardar.mutate(
      prestacion ? { id: prestacion.id, datos } : { datos },
      {
        onSuccess: onCerrar,
        onError: (error) => {
          const interpretado = interpretarError(error);
          setErrores(interpretado.campos);
          setErrorGeneral(interpretado.general);
        },
      },
    );
  };

  const cerrar = () => {
    if (!guardar.isPending) onCerrar();
  };

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
        aria-labelledby="titulo-prestacion"
        aria-describedby="ayuda-prestacion"
        tabIndex={-1}
        onKeyDown={alPulsarTecla}
      >
        <div className={estilos.cabeceraDialogo}>
          <h2 id="titulo-prestacion" className={estilos.tituloDialogo}>
            {prestacion ? 'Editar prestación' : 'Nueva prestación'}
          </h2>
          <button className={estilos.botonIcono} type="button" aria-label="Cerrar" onClick={cerrar}>
            ×
          </button>
        </div>
        <p id="ayuda-prestacion" className={estilos.ayudaDialogo}>
          Cargá el nombre que ve el paciente y la duración del turno.
        </p>

        <form className={estilos.formulario} onSubmit={enviar} noValidate>
          {errorGeneral && (
            <div className={estilos.aviso} role="alert">
              {errorGeneral}
            </div>
          )}

          <div className={estilos.campo}>
            <label htmlFor="prestacion-nombre">Nombre</label>
            <input
              id="prestacion-nombre"
              type="text"
              maxLength={100}
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              aria-invalid={Boolean(errores.nombre)}
              aria-describedby={errores.nombre ? 'error-prestacion-nombre' : undefined}
            />
            {errores.nombre && (
              <span id="error-prestacion-nombre" className={estilos.errorCampo} role="alert">
                {errores.nombre}
              </span>
            )}
          </div>

          <div className={estilos.campo}>
            <label htmlFor="prestacion-duracion">Duración (minutos)</label>
            <input
              id="prestacion-duracion"
              type="number"
              inputMode="numeric"
              min={5}
              max={480}
              step={5}
              value={duracion}
              onChange={(evento) => setDuracion(evento.target.value)}
              aria-invalid={Boolean(errores.duracionMinutos)}
              aria-describedby={
                errores.duracionMinutos ? 'error-prestacion-duracion' : undefined
              }
            />
            {errores.duracionMinutos && (
              <span id="error-prestacion-duracion" className={estilos.errorCampo} role="alert">
                {errores.duracionMinutos}
              </span>
            )}
          </div>

          <div className={estilos.accionesDialogo}>
            <button className={estilos.boton} type="button" onClick={cerrar} disabled={guardar.isPending}>
              Cancelar
            </button>
            <button className={`${estilos.boton} ${estilos.botonPrimario}`} type="submit" disabled={guardar.isPending}>
              {guardar.isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
