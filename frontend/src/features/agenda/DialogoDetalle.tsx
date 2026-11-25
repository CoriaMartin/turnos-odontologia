import { useState } from 'react';
import { ApiError } from '../../shared/api/ApiError';
import { Alerta } from './Alerta';
import { etiquetaPaciente } from './ComboPaciente';
import { Dialogo } from './Dialogo';
import { interpretarRechazo } from './errores';
import { enConsultorio, formatoHora, textoDia } from './fechas';
import {
  DETALLE_NOTIFICACION,
  ETIQUETA_NOTIFICACION,
  useNotificacionDeTurno,
  type EstadoNotificacion,
} from './notificaciones';
import { accionesDisponibles } from './gestion';
import type { TurnoAgenda } from './tipos';
import { Badge } from './Turnos';
import { useRegistrarAsistencia, type EstadoAsistencia } from './turnosApi';
import estilos from './Gestion.module.css';

export function horarioDe(turno: TurnoAgenda): string {
  return `${formatoHora(enConsultorio(turno.inicio).minutos)} – ${formatoHora(enConsultorio(turno.fin).minutos)}`;
}

export function diaDe(turno: TurnoAgenda): string {
  return textoDia(enConsultorio(turno.inicio).fecha);
}

/** Resumen del turno de la maqueta (`turno-resumen`): horario, paciente, prestación y estado. */
export function ResumenTurno({ turno, final = false }: { turno: TurnoAgenda; final?: boolean }) {
  return (
    <div className={`${estilos.resumen} ${final ? estilos.resumenFinal : ''}`}>
      <span className={estilos.resumenHora}>{horarioDe(turno)}</span>
      <span className={estilos.resumenQuien}>
        <strong>{etiquetaPaciente(turno.paciente)}</strong>
        <span>{turno.prestacion.nombre}</span>
      </span>
      <Badge estado={turno.estado} />
    </div>
  );
}

const AYUDA = {
  futuro: 'El turno todavía no empezó: podés reprogramarlo o cancelarlo.',
  empezado: 'El turno ya empezó: registrá la asistencia.',
  final: 'Este turno ya no se puede modificar.',
} as const;

const CLASE_NOTIFICACION: Readonly<Record<EstadoNotificacion, string | undefined>> = {
  PENDIENTE: estilos.badgePendiente,
  ENVIADA: estilos.badgeEnviado,
  FALLIDA: estilos.badgeFallido,
  NO_APLICA: estilos.badgeNoAplica,
  NO_CONSENTIDO: estilos.badgeNoConsentido,
};

export function EstadoRecordatorio({ id }: { id: number }) {
  const consulta = useNotificacionDeTurno(id);
  if (consulta.isPending) {
    return <span className={estilos.nota}>Consultando el estado del recordatorio...</span>;
  }
  if (consulta.isError) {
    return consulta.error instanceof ApiError && consulta.error.status === 401 ? null : (
      <span className={estilos.nota}>No pudimos consultar el estado del recordatorio.</span>
    );
  }
  const estado = consulta.data?.estado;
  if (!estado) return null;
  return (
    <>
      <span className={`${estilos.badgeRecordatorio} ${CLASE_NOTIFICACION[estado] ?? ''}`}>
        {ETIQUETA_NOTIFICACION[estado]}
      </span>
      <span className={estilos.nota}>{DETALLE_NOTIFICACION[estado]}</span>
    </>
  );
}

interface Props {
  turno: TurnoAgenda;
  ahora: Date;
  onCerrar: () => void;
  onReprogramar: () => void;
  onCancelar: () => void;
  onAsistencia: (turno: TurnoAgenda) => void;
  onRechazoDeAgenda: (texto: string) => void;
}

/** Detalle de un turno con las acciones que permite su estado (D5, maqueta detalle-turno.html). */
export function DialogoDetalle({
  turno,
  ahora,
  onCerrar,
  onReprogramar,
  onCancelar,
  onAsistencia,
  onRechazoDeAgenda,
}: Props) {
  const acciones = accionesDisponibles(turno, ahora);
  const asistencia = useRegistrarAsistencia();
  const [error, setError] = useState<string | null>(null);
  const ocupado = asistencia.isPending;
  const futuro = acciones.includes('reprogramar');
  const empezado = acciones.includes('atendido');

  const marcar = (estado: EstadoAsistencia) => {
    setError(null);
    asistencia.mutate(
      { id: turno.id, estado },
      {
        onSuccess: onAsistencia,
        onError: (fallo) => {
          const rechazo = interpretarRechazo(fallo);
          if (rechazo.tipo === 'agenda') onRechazoDeAgenda(rechazo.texto);
          else if (rechazo.tipo === 'alerta') setError(rechazo.texto);
        },
      },
    );
  };

  return (
    <Dialogo
      titulo="Detalle del turno"
      bajada={diaDe(turno)}
      onCerrar={onCerrar}
      ocupado={ocupado}
      pie={
        <>
          <button
            className={`${estilos.boton} ${estilos.botonGhost}`}
            type="button"
            onClick={onCerrar}
            disabled={ocupado}
            data-autofoco={acciones.length === 0 ? true : undefined}
          >
            Cerrar
          </button>
          {futuro && (
            <>
              <button className={estilos.boton} type="button" onClick={onReprogramar} data-autofoco>
                Reprogramar
              </button>
              <button className={`${estilos.boton} ${estilos.botonPeligro}`} type="button" onClick={onCancelar}>
                Cancelar turno
              </button>
            </>
          )}
          {empezado && (
            <>
              <button
                className={estilos.boton}
                type="button"
                onClick={() => marcar('AUSENTE')}
                disabled={ocupado}
              >
                Marcar ausente
              </button>
              <button
                className={`${estilos.boton} ${estilos.botonPrimario}`}
                type="button"
                onClick={() => marcar('ATENDIDO')}
                disabled={ocupado}
                aria-busy={ocupado}
                data-autofoco
              >
                Marcar atendido
              </button>
            </>
          )}
        </>
      }
    >
      <ResumenTurno turno={turno} final={acciones.length === 0} />
      <dl className={estilos.datos}>
        <div>
          <dt>Paciente</dt>
          <dd>{etiquetaPaciente(turno.paciente)}</dd>
        </div>
        <div>
          <dt>Prestación</dt>
          <dd>
            {turno.prestacion.nombre} · {turno.duracionMinutos} min
          </dd>
        </div>
        <div>
          <dt>Horario</dt>
          <dd>{horarioDe(turno)}</dd>
        </div>
        <div className={estilos.datoRecordatorio}>
          <dt>Recordatorio</dt>
          <dd>
            <EstadoRecordatorio id={turno.id} />
          </dd>
        </div>
      </dl>
      <p className={estilos.nota}>{futuro ? AYUDA.futuro : empezado ? AYUDA.empezado : AYUDA.final}</p>
      {error && (
        <Alerta tipo="error" rol="alert">
          {error}
        </Alerta>
      )}
    </Dialogo>
  );
}
