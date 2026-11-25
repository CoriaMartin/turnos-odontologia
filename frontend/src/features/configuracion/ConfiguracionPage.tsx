import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ApiError } from '../../shared/api/ApiError';
import {
  MENSAJES_POR_CODIGO,
  mensajeDeError,
  TITULO_GUARDAR_EXITOSO,
  TITULO_HORAS_INVALIDAS,
} from '../../shared/api/mensajes';
import { useTituloDePagina } from '../../shared/useTituloDePagina';
import { useConfiguracion, useGuardarConfiguracion } from './api';
import estilos from './ConfiguracionPage.module.css';
import {
  aFormulario,
  aHorasConfiguracion,
  CAMPOS,
  validarHoras,
  VALOR_POR_DEFECTO,
  type CampoHoras,
  type ErroresHoras,
  type HorasFormulario,
} from './validacion';

const TITULO_ERROR_CARGA = 'No pudimos cargar la configuración';
const TITULO_ERROR_GUARDO = 'No pudimos guardar la configuración';

function destinoDeRetorno(estado: unknown): string {
  if (typeof estado === 'object' && estado !== null && 'desde' in estado) {
    const desde = (estado as { desde: unknown }).desde;
    if (
      typeof desde === 'string' &&
      desde.startsWith('/') &&
      !desde.startsWith('//') &&
      desde !== '/configuracion'
    ) {
      return desde;
    }
  }
  return '/';
}

export function ConfiguracionPage() {
  useTituloDePagina('Configuración');
  const ubicacion = useLocation();
  const consulta = useConfiguracion();
  const guardar = useGuardarConfiguracion();
  const [formulario, setFormulario] = useState<HorasFormulario>(VALOR_POR_DEFECTO);
  const [errores, setErrores] = useState<ErroresHoras>({});
  const [errorValidacion, setErrorValidacion] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [guardado, setGuardado] = useState<HorasFormulario | null>(null);
  const aplicados = useRef<string | null>(null);
  const campos = useRef<Record<CampoHoras, HTMLInputElement | null>>({
    cancelacionTardia: null,
    recordatorio: null,
  });

  useEffect(() => {
    if (!consulta.data) return;
    const clave = JSON.stringify(consulta.data);
    if (clave === aplicados.current) return;
    aplicados.current = clave;
    setFormulario(aFormulario(consulta.data));
  }, [consulta.data]);

  const sesionVencida =
    (consulta.error instanceof ApiError && consulta.error.status === 401) ||
    (guardar.error instanceof ApiError && guardar.error.status === 401);
  const guardando = guardar.isPending;

  function cambiar(campo: CampoHoras, valor: string) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setErrores(({ [campo]: _resuelto, ...resto }) => resto);
    setErrorValidacion(false);
    setErrorGuardado(null);
    setGuardado(null);
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (guardando) return;

    const fallos = validarHoras(formulario);
    const primero = CAMPOS.find((campo) => fallos[campo]);
    setErrores(fallos);
    setErrorValidacion(Boolean(primero));
    setErrorGuardado(null);
    setGuardado(null);
    if (primero) {
      campos.current[primero]?.focus();
      return;
    }

    guardar.mutate(aHorasConfiguracion(formulario), {
      onSuccess: (configuracion) => setGuardado(aFormulario(configuracion)),
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401) return;
        setErrorGuardado(mensajeDeError(error));
      },
    });
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.encabezado}>
        <h1 className={estilos.titulo}>Configuración de recordatorios</h1>
        <p className={estilos.bajada}>
          Definí cuándo se considera tardía una cancelación y con cuánta anticipación se envía el
          recordatorio.
        </p>
      </div>

      <div className={estilos.tarjeta}>
        <section
          className={estilos.region}
          aria-label="Formulario de configuración"
          aria-busy={consulta.isPending || guardando}
        >
          {consulta.isPending ? (
            <div className={estilos.estado}>
              <span className={estilos.indicador} aria-hidden="true" />
              Cargando la configuración del consultorio...
            </div>
          ) : consulta.isError ? (
            sesionVencida ? null : (
              <div className={estilos.estado}>
                <div className={`${estilos.aviso} ${estilos.avisoError}`} role="alert">
                  <b>{TITULO_ERROR_CARGA}</b>
                  {mensajeDeError(consulta.error)}
                </div>
                <button className={estilos.boton} type="button" onClick={() => void consulta.refetch()}>
                  Reintentar
                </button>
              </div>
            )
          ) : (
            <>
              {errorValidacion && (
                <div className={`${estilos.aviso} ${estilos.avisoError}`} role="alert">
                  <b>{TITULO_HORAS_INVALIDAS}</b>
                  {MENSAJES_POR_CODIGO['HORAS_INVALIDAS']}
                </div>
              )}
              {errorGuardado && (
                <div className={`${estilos.aviso} ${estilos.avisoError}`} role="alert">
                  <b>{TITULO_ERROR_GUARDO}</b>
                  {errorGuardado}
                </div>
              )}
              {guardado && (
                <div className={`${estilos.aviso} ${estilos.avisoExito}`} role="alert">
                  <b>{TITULO_GUARDAR_EXITOSO}</b>
                  {MENSAJES_POR_CODIGO['GUARDAR_EXITOSO']}
                </div>
              )}

              <form className={estilos.formulario} noValidate onSubmit={enviar}>
                <div className={estilos.formGrid}>
                  {CAMPOS.map((campo) => {
                    const idError = `${campo}-error`;
                    const etiqueta =
                      campo === 'cancelacionTardia'
                        ? 'Horas de cancelación tardía'
                        : 'Horas de anticipación del recordatorio';
                    return (
                      <div className={estilos.campo} key={campo}>
                        <label className={estilos.etiqueta} htmlFor={campo}>
                          {etiqueta}
                        </label>
                        <input
                          ref={(nodo) => {
                            campos.current[campo] = nodo;
                          }}
                          id={campo}
                          name={campo}
                          type="number"
                          inputMode="numeric"
                          value={formulario[campo]}
                          readOnly={guardando}
                          aria-invalid={errores[campo] ? true : undefined}
                          aria-describedby={errores[campo] ? idError : undefined}
                          onChange={(evento) => cambiar(campo, evento.target.value)}
                        />
                        <span
                          className={errores[campo] ? estilos.errorCampo : estilos.ayuda}
                          id={idError}
                        >
                          {errores[campo] ?? (campo === 'cancelacionTardia' ? 'Por defecto: 24' : 'Por defecto: 24')}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className={estilos.acciones}>
                  <button
                    className={`${estilos.boton} ${estilos.botonPrimario}`}
                    type="submit"
                    disabled={guardando}
                    aria-busy={guardando || undefined}
                  >
                    {guardando ? (
                      <>
                        <span className={estilos.indicador} aria-hidden="true" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar configuración'
                    )}
                  </button>
                  <Link className={estilos.enlaceRetorno} to={destinoDeRetorno(ubicacion.state)}>
                    Volver a la agenda
                  </Link>
                </div>
              </form>
              {guardado && (
                <p className={estilos.datosGuardados}>
                  Cancelación tardía: <strong>{guardado.cancelacionTardia}</strong> horas | Recordatorio:{' '}
                  <strong>{guardado.recordatorio}</strong> horas
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
