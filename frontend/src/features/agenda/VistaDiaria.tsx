import { useId } from 'react';
import { useAccionesAgenda } from './accionesAgenda';
import { formatoHora, textoDia, type FechaCivil, type MomentoConsultorio } from './fechas';
import { franjasLibres } from './gestion';
import {
  cantidadDeFranjas,
  esCancelado,
  MINUTOS_POR_FRANJA,
  posicion,
  posicionDeHora,
  rangoVisible,
  tramosDelDia,
  type Rango,
  type Tramo,
} from './lineaDeTiempo';
import type { TurnoAgenda } from './tipos';
import { CanceladoEnCarril, estiloPosicion, LineaAhora, TurnoTarjeta } from './Turnos';
import estilos from './Agenda.module.css';
import estilosGestion from './Gestion.module.css';

/**
 * Franjas libres futuras que abren "Nuevo turno" con día y hora (C-17). Se muestran al pasar el puntero o
 * al llegar con el teclado, para no llenar la línea de tiempo de recuadros.
 */
function FranjasLibres({ fecha, rango, ocupadas }: { fecha: FechaCivil; rango: Rango; ocupadas: readonly Tramo[] }) {
  const acciones = useAccionesAgenda();
  if (!acciones) return null;
  const dia = textoDia(fecha).replace(/ de \d{4}$/, '');
  return (
    <>
      {franjasLibres(fecha, rango, ocupadas, acciones.ahora).map((inicio) => {
        const fin = inicio + MINUTOS_POR_FRANJA;
        return (
          <button
            key={inicio}
            type="button"
            className={estilosGestion.franjaLibre}
            style={estiloPosicion(posicion({ inicio, fin }, rango))}
            aria-label={`Crear un turno el ${dia.toLowerCase()} de ${formatoHora(inicio)} a ${formatoHora(fin)}`}
            onClick={() => acciones.nuevoTurnoEn(fecha, inicio)}
          >
            + Turno · {formatoHora(inicio)} – {formatoHora(fin)}
          </button>
        );
      })}
    </>
  );
}

/** Columna de horas: etiqueta en cada hora en punto, franja vacía en las medias. */
export function ColumnaHoras({ rango }: { rango: Rango }) {
  return (
    <div className={estilos.horas} aria-hidden="true">
      {Array.from({ length: cantidadDeFranjas(rango) }, (_, i) => {
        const minutos = rango.inicio + i * MINUTOS_POR_FRANJA;
        return <span key={minutos}>{minutos % 60 === 0 ? formatoHora(minutos) : ''}</span>;
      })}
    </div>
  );
}

/** Líneas de fondo de cada franja (decorativas). */
export function Franjas({ rango }: { rango: Rango }) {
  return (
    <>
      {Array.from({ length: cantidadDeFranjas(rango) }, (_, i) => (
        <i key={i} aria-hidden="true" />
      ))}
    </>
  );
}

interface Props {
  fecha: FechaCivil;
  turnos: readonly TurnoAgenda[];
  ahora: MomentoConsultorio;
  pantallaAncha: boolean;
}

/**
 * Línea de tiempo del día (spec "Línea de tiempo de la vista diaria"): horas | turnos activos | carril
 * angosto de cancelados (design.md D6), para que un cancelado nunca tape ni achique a un activo.
 */
export function VistaDiaria({ fecha, turnos, ahora, pantallaAncha }: Props) {
  const idCancelados = useId();
  const tramos = tramosDelDia(turnos, fecha);
  const rango = rangoVisible(tramos);
  const activos = tramos.filter((t) => !esCancelado(t.turno));
  const cancelados = tramos.filter((t) => esCancelado(t.turno));
  const topAhora = ahora.fecha === fecha ? posicionDeHora(ahora.minutos, rango) : null;

  return (
    <>
      {tramos.length === 0 && (
        <div className={estilos.vacio}>
          <strong>No hay turnos para este día</strong>
          <span>Cuando agendes uno, va a aparecer en esta línea de tiempo.</span>
        </div>
      )}
      <div className={estilos.lineaDeTiempo}>
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span className={estilos.carrilTitulo} id={idCancelados}>
          Cancelados
        </span>
        <ColumnaHoras rango={rango} />
        <div className={estilos.carril} role="group" aria-label="Turnos activos">
          <Franjas rango={rango} />
          <FranjasLibres fecha={fecha} rango={rango} ocupadas={activos} />
          {activos.map((tramo) => (
            <TurnoTarjeta key={tramo.turno.id} turno={tramo.turno} posicion={posicion(tramo, rango)} />
          ))}
          {topAhora !== null && <LineaAhora top={topAhora} minutos={ahora.minutos} />}
        </div>
        <div
          className={`${estilos.carril} ${estilos.carrilCancelados}`}
          role="group"
          aria-labelledby={idCancelados}
        >
          <Franjas rango={rango} />
          {cancelados.map((tramo) => (
            <CanceladoEnCarril
              key={tramo.turno.id}
              turno={tramo.turno}
              posicion={posicion(tramo, rango)}
              corto={!pantallaAncha}
            />
          ))}
        </div>
      </div>
    </>
  );
}
