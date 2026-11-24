import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiError } from '../../shared/api/ApiError';
import { mensajeDeError } from '../../shared/api/mensajes';
import { useTituloDePagina } from '../../shared/useTituloDePagina';
import { AccionesAgendaContexto } from './accionesAgenda';
import { useAgenda } from './api';
import { useGestionTurnos } from './GestionTurnos';
import {
  crearPeriodo,
  enConsultorio,
  esFechaValida,
  moverPeriodo,
  textoPeriodo,
  type FechaCivil,
  type Vista,
} from './fechas';
import { useAhora, usePantallaAncha } from './hooks';
import { esCancelado } from './lineaDeTiempo';
import type { EstadoTurno } from './tipos';
import { Badge } from './Turnos';
import { VistaDiaria } from './VistaDiaria';
import { VistaSemanal } from './VistaSemanal';
import estilos from './Agenda.module.css';
import estilosGestion from './Gestion.module.css';

const ESTADOS: readonly EstadoTurno[] = ['PROGRAMADO', 'ATENDIDO', 'AUSENTE', 'CANCELADO', 'CANCELADO_TARDIO'];

function esVista(valor: string | null): valor is Vista {
  return valor === 'dia' || valor === 'semana';
}

/**
 * Agenda en la ruta `/` (spec web-agenda). La fecha y la vista viven en la URL (`?fecha=&vista=`,
 * design.md D2); sin `vista`, semanal en pantallas anchas y diaria en angostas.
 */
export function AgendaPage() {
  useTituloDePagina('Agenda');
  const instante = useAhora();
  const ahora = enConsultorio(instante);
  const pantallaAncha = usePantallaAncha();
  const [parametros, setParametros] = useSearchParams();

  const vistaPedida = parametros.get('vista');
  const vista: Vista = esVista(vistaPedida) ? vistaPedida : pantallaAncha ? 'semana' : 'dia';
  const fechaPedida = parametros.get('fecha');
  const fecha: FechaCivil = esFechaValida(fechaPedida) ? fechaPedida : ahora.fecha;
  const periodo = useMemo(() => crearPeriodo(vista, fecha), [vista, fecha]);

  const consulta = useAgenda(periodo);
  // El 401 lo resuelve el QueryClient (cierra la sesión): no se muestra como error de la agenda.
  const sesionVencida = consulta.error instanceof ApiError && consulta.error.status === 401;
  const turnos = consulta.data ?? [];
  const activos = turnos.filter((t) => !esCancelado(t)).length;

  const ir = (nuevaFecha: FechaCivil, nuevaVista: Vista = vista) =>
    setParametros({ fecha: nuevaFecha, vista: nuevaVista });

  const unidad = vista === 'dia' ? 'Día' : 'Semana';
  const titulo = textoPeriodo(periodo);
  // C-17: tras crear o reprogramar, la agenda muestra el día del turno sin cambiar de vista.
  const gestion = useGestionTurnos({ ahora: instante, irA: (nuevaFecha) => ir(nuevaFecha) });

  return (
    <div className={estilos.pagina}>
      {/* div y no header: un header acá se anunciaría como un segundo "banner" junto al de AppLayout. */}
      <div className={estilosGestion.cabecera}>
        <div className={estilos.encabezado}>
          <h1 className={estilos.titulo}>Agenda</h1>
          <p className={estilos.bajada}>
            {titulo}
            {consulta.data && activos > 0 && ` · ${activos} ${activos === 1 ? 'turno' : 'turnos'}`}
          </p>
        </div>
        <button
          className={`${estilosGestion.boton} ${estilosGestion.botonPrimario}`}
          type="button"
          onClick={() => gestion.abrirNuevo(fecha)}
        >
          + Turno
        </button>
      </div>

      {gestion.avisos}

      <div className={estilos.tarjeta}>
        <div className={estilos.barra}>
          <div className={estilos.navegacion}>
            <button
              className={`${estilos.boton} ${estilos.botonIcono}`}
              type="button"
              aria-label={`${unidad} anterior`}
              onClick={() => ir(moverPeriodo(vista, fecha, -1))}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <div className={estilos.campoFecha}>
              <label htmlFor="fecha-agenda">Fecha</label>
              <input
                id="fecha-agenda"
                type="date"
                value={fecha}
                onChange={(evento) => {
                  if (esFechaValida(evento.target.value)) ir(evento.target.value);
                }}
              />
            </div>
            <button
              className={`${estilos.boton} ${estilos.botonIcono}`}
              type="button"
              aria-label={`${unidad} siguiente`}
              onClick={() => ir(moverPeriodo(vista, fecha, 1))}
            >
              <span aria-hidden="true">›</span>
            </button>
            <button className={estilos.boton} type="button" onClick={() => ir(ahora.fecha)}>
              Hoy
            </button>
          </div>
          <div className={estilos.selector} role="group" aria-label="Vista de la agenda">
            <button type="button" aria-pressed={vista === 'dia'} onClick={() => ir(fecha, 'dia')}>
              Día
            </button>
            <button type="button" aria-pressed={vista === 'semana'} onClick={() => ir(fecha, 'semana')}>
              Semana
            </button>
          </div>
        </div>

        <ul className={estilos.leyenda} aria-label="Referencia de estados">
          {ESTADOS.map((estado) => (
            <li key={estado}>
              <Badge estado={estado} />
            </li>
          ))}
        </ul>

        <section
          className={estilos.region}
          aria-label={`Agenda ${vista === 'dia' ? 'diaria' : 'semanal'}: ${titulo}`}
          aria-busy={consulta.isPending}
        >
          {consulta.isPending ? (
            <div className={estilos.cargando}>
              <span className={estilos.indicador} aria-hidden="true" />
              Cargando turnos…
            </div>
          ) : consulta.isError ? (
            sesionVencida ? null : (
              <div className={estilos.error}>
                <div className={estilos.aviso} role="alert">
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-.9 4h1.8v5.2H9.1V6zm0 6.6h1.8v1.8H9.1v-1.8z" />
                  </svg>
                  <div>
                    <b>No pudimos cargar la agenda</b>
                    Tus turnos siguen guardados. {mensajeDeError(consulta.error)}
                  </div>
                </div>
                <button className={estilos.boton} type="button" onClick={() => void consulta.refetch()}>
                  Reintentar
                </button>
              </div>
            )
          ) : (
            <AccionesAgendaContexto.Provider value={gestion.acciones}>
              {vista === 'dia' ? (
                <VistaDiaria fecha={fecha} turnos={turnos} ahora={ahora} pantallaAncha={pantallaAncha} />
              ) : (
                <VistaSemanal dias={periodo.dias} turnos={turnos} ahora={ahora} pantallaAncha={pantallaAncha} />
              )}
            </AccionesAgendaContexto.Provider>
          )}
        </section>
      </div>

      {gestion.dialogo}
    </div>
  );
}
