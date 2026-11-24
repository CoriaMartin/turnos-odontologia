import type { CSSProperties } from 'react';
import { encabezadoDia, enConsultorio, formatoHora } from './fechas';
import type { Posicion } from './lineaDeTiempo';
import { ETIQUETA_ESTADO, type EstadoTurno, type TurnoAgenda } from './tipos';
import estilos from './Agenda.module.css';

/** Piezas visuales de un turno, según la maqueta aprobada (mockups/agenda.html) y design.md D6, D9, D10. */

const CLASE_BADGE: Readonly<Record<EstadoTurno, string | undefined>> = {
  PROGRAMADO: estilos.estadoProgramado,
  ATENDIDO: estilos.estadoAtendido,
  AUSENTE: estilos.estadoAusente,
  CANCELADO: estilos.estadoCancelado,
  CANCELADO_TARDIO: estilos.estadoTardio,
};

const CLASE_TURNO: Readonly<Record<EstadoTurno, string | undefined>> = {
  PROGRAMADO: estilos.programado,
  ATENDIDO: estilos.atendido,
  AUSENTE: estilos.ausente,
  CANCELADO: undefined,
  CANCELADO_TARDIO: undefined,
};

function clases(...nombres: Array<string | false | undefined>): string {
  return nombres.filter(Boolean).join(' ');
}

/** Ubicación en la línea de tiempo con el token de alto de franja (30 min). */
export function estiloPosicion({ top, alto }: Posicion): CSSProperties {
  return {
    top: `calc(var(--agenda-slot-height) * ${top})`,
    height: `calc(var(--agenda-slot-height) * ${alto} - var(--space-1))`,
  };
}

function horario(turno: TurnoAgenda) {
  const inicio = formatoHora(enConsultorio(turno.inicio).minutos);
  const fin = formatoHora(enConsultorio(turno.fin).minutos);
  return { inicio, fin };
}

function nombrePaciente(turno: TurnoAgenda): string {
  return `${turno.paciente.nombre} ${turno.paciente.apellido}`;
}

/** "10:00 a 10:45, Paciente Ficticio Tres, Limpieza, Programado" (spec: nombre accesible con los cuatro datos). */
export function nombreAccesible(turno: TurnoAgenda): string {
  const { inicio, fin } = horario(turno);
  return `${inicio} a ${fin}, ${nombrePaciente(turno)}, ${turno.prestacion.nombre}, ${ETIQUETA_ESTADO[turno.estado]}`;
}

export function Badge({ estado, corto = false }: { estado: EstadoTurno; corto?: boolean }) {
  const etiqueta = corto && estado === 'CANCELADO_TARDIO' ? 'Tardía' : ETIQUETA_ESTADO[estado];
  return <span className={clases(estilos.badge, CLASE_BADGE[estado])}>{etiqueta}</span>;
}

interface PropsTurno {
  turno: TurnoAgenda;
  /** Si se omite, la tarjeta no se posiciona (lista de la semana en móvil). */
  posicion?: Posicion;
}

/** Turno activo completo: horario, paciente · prestación y badge. */
export function TurnoTarjeta({ turno, posicion }: PropsTurno) {
  const { inicio, fin } = horario(turno);
  return (
    <article
      className={clases(estilos.turno, CLASE_TURNO[turno.estado], !posicion && estilos.turnoEnLista)}
      style={posicion ? estiloPosicion(posicion) : undefined}
      aria-label={nombreAccesible(turno)}
    >
      <span className={estilos.turnoPrincipal}>
        <span className={estilos.turnoHora}>
          {inicio} – {fin}
        </span>
        <span className={estilos.turnoPaciente}>
          {nombrePaciente(turno)} · {turno.prestacion.nombre}
        </span>
      </span>
      <Badge estado={turno.estado} />
    </article>
  );
}

/** Turno activo compacto de la cuadrícula semanal: hora de inicio, apellido y estado en texto (D10). */
export function TurnoMini({ turno, posicion }: Required<PropsTurno>) {
  const { inicio } = horario(turno);
  return (
    <article
      className={clases(
        estilos.turno,
        estilos.turnoMini,
        // Menos de 30 min no entra en tres líneas: hora, apellido y estado en una sola, con elipsis.
        posicion.alto < 1 && estilos.turnoMiniCorto,
        CLASE_TURNO[turno.estado],
      )}
      style={estiloPosicion(posicion)}
      aria-label={nombreAccesible(turno)}
    >
      <span className={estilos.turnoHora}>{inicio}</span>
      <span className={estilos.turnoPaciente}>{turno.paciente.apellido}</span>
      <span className={estilos.turnoEstadoMini}>{ETIQUETA_ESTADO[turno.estado]}</span>
    </article>
  );
}

/** Cancelado en el carril angosto de la vista diaria (D6): rayado, tachado y con badge. */
export function CanceladoEnCarril({
  turno,
  posicion,
  corto,
}: Required<PropsTurno> & { corto: boolean }) {
  const { inicio, fin } = horario(turno);
  return (
    <article
      className={clases(estilos.cancelado, turno.estado === 'CANCELADO_TARDIO' && estilos.canceladoTardio)}
      style={estiloPosicion(posicion)}
      aria-label={nombreAccesible(turno)}
    >
      <span className={estilos.tachado}>
        {inicio} – {fin}
      </span>
      <span className={clases(estilos.tachado, estilos.canceladoPaciente)}>{nombrePaciente(turno)}</span>
      <Badge estado={turno.estado} corto={corto} />
    </article>
  );
}

/** Cancelado de la semana, listado después de los activos (D6). */
export function CanceladoChip({ turno }: { turno: TurnoAgenda }) {
  const momento = enConsultorio(turno.inicio);
  const { dia, numero } = encabezadoDia(momento.fecha);
  return (
    <article
      className={clases(estilos.chip, turno.estado === 'CANCELADO_TARDIO' && estilos.canceladoTardio)}
      aria-label={`${dia} ${numero}, ${nombreAccesible(turno)}`}
    >
      <span className={estilos.chipFecha}>
        {dia} {numero} · {formatoHora(momento.minutos)}
      </span>
      <span className={estilos.tachado}>{nombrePaciente(turno)}</span>
      <Badge estado={turno.estado} />
    </article>
  );
}

/** Línea de hora actual (D7): decorativa para el layout, con nombre para tecnologías de asistencia. */
export function LineaAhora({ top, minutos }: { top: number; minutos: number }) {
  return (
    <div
      className={estilos.ahora}
      style={{ top: `calc(var(--agenda-slot-height) * ${top})` }}
      role="img"
      aria-label={`Hora actual: ${formatoHora(minutos)}`}
    />
  );
}
