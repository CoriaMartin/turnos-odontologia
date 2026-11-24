import { useState } from 'react';
import { ApiError } from '../../shared/api/ApiError';
import { mensajeDeError } from '../../shared/api/mensajes';
import { useTituloDePagina } from '../../shared/useTituloDePagina';
import { FormularioPrestacion } from './FormularioPrestacion';
import { useCambiarActivaPrestacion, usePrestaciones } from './hooks';
import type { Prestacion } from './tipos';
import estilos from './Prestaciones.module.css';

export function PrestacionesPage() {
  useTituloDePagina('Prestaciones');
  const consulta = usePrestaciones();
  const cambiarActiva = useCambiarActivaPrestacion();
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Prestacion | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const sesionVencida = consulta.error instanceof ApiError && consulta.error.status === 401;
  const prestaciones = consulta.data ?? [];

  const abrirNueva = () => {
    setErrorAccion(null);
    setEditando(null);
    setCreando(true);
  };

  const abrirEdicion = (prestacion: Prestacion) => {
    setErrorAccion(null);
    setCreando(false);
    setEditando(prestacion);
  };

  const alternar = (prestacion: Prestacion) => {
    setErrorAccion(null);
    cambiarActiva.mutate(
      { id: prestacion.id, activa: !prestacion.activa },
      { onError: (error) => setErrorAccion(mensajeDeError(error)) },
    );
  };

  const cerrarFormulario = () => {
    setCreando(false);
    setEditando(null);
  };

  return (
    <div className={estilos.pagina}>
      <div className={estilos.encabezado}>
        <div>
          <h1 className={estilos.titulo}>Catálogo de prestaciones</h1>
          <p className={estilos.bajada}>Definí qué turnos ofrecés y cuánto duran.</p>
        </div>
        <button className={`${estilos.boton} ${estilos.botonPrimario}`} type="button" onClick={abrirNueva}>
          + Nueva prestación
        </button>
      </div>

      {errorAccion && (
        <div className={estilos.aviso} role="alert">
          {errorAccion}
        </div>
      )}

      <div className={estilos.tarjeta}>
        <section
          className={estilos.region}
          aria-label="Listado de prestaciones"
          aria-busy={consulta.isPending}
        >
          {consulta.isPending ? (
            <div className={estilos.estado}>
              <span className={estilos.indicador} aria-hidden="true" />
              Cargando...
            </div>
          ) : consulta.isError ? (
            sesionVencida ? null : (
              <div className={estilos.estado}>
                <div className={estilos.aviso} role="alert">
                  <b>No pudimos cargar las prestaciones</b>
                  {mensajeDeError(consulta.error)}
                </div>
                <button className={estilos.boton} type="button" onClick={() => void consulta.refetch()}>
                  Reintentar
                </button>
              </div>
            )
          ) : prestaciones.length === 0 ? (
            <div className={estilos.estado}>
              <p>Todavía no cargaste prestaciones.</p>
              <button className={estilos.boton} type="button" onClick={abrirNueva}>
                + Nueva prestación
              </button>
            </div>
          ) : (
            <table className={estilos.tabla}>
              <thead>
                <tr>
                  <th scope="col">Prestación</th>
                  <th scope="col">Duración</th>
                  <th scope="col">Estado</th>
                  <th scope="col">
                    <span className={estilos.srOnly}>Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {prestaciones.map((prestacion) => (
                  <tr key={prestacion.id}>
                    <td data-label="Prestación">{prestacion.nombre}</td>
                    <td data-label="Duración">{prestacion.duracionMinutos} min</td>
                    <td data-label="Estado">
                      <span
                        className={`${estilos.badge} ${
                          prestacion.activa ? estilos.badgeActiva : estilos.badgeInactiva
                        }`}
                      >
                        {prestacion.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className={estilos.acciones}>
                      <button
                        className={estilos.boton}
                        type="button"
                        onClick={() => abrirEdicion(prestacion)}
                      >
                        Editar
                      </button>
                      <button
                        className={estilos.boton}
                        type="button"
                        disabled={cambiarActiva.isPending}
                        onClick={() => alternar(prestacion)}
                      >
                        {prestacion.activa ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {(creando || editando) && (
        <FormularioPrestacion prestacion={editando ?? undefined} onCerrar={cerrarFormulario} />
      )}
    </div>
  );
}
