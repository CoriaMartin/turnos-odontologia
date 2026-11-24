import { useState } from 'react';
import { useConfiguracion } from '../configuracion/api';
import { Alerta } from './Alerta';
import { CampoTexto } from './Campos';
import { Dialogo } from './Dialogo';
import { diaDe, horarioDe, ResumenTurno } from './DialogoDetalle';
import { interpretarRechazo } from './errores';
import { esCancelacionTardia, MENSAJES_CAMPO, MOTIVO_MAXIMO } from './gestion';
import type { TurnoAgenda } from './tipos';
import { useCancelarTurno } from './turnosApi';
import estilos from './Gestion.module.css';

interface Props {
  turno: TurnoAgenda;
  ahora: Date;
  onVolver: () => void;
  onCerrar: () => void;
  onCancelado: (turno: TurnoAgenda) => void;
  onRechazoDeAgenda: (texto: string) => void;
}

/**
 * Confirmación de cancelación (spec "Cancelar un turno con aviso de cancelación tardía", maqueta
 * cancelar.html). El aviso usa las horas de `GET /api/configuracion` (D3); el estado final lo decide la API.
 */
export function DialogoCancelar({ turno, ahora, onVolver, onCerrar, onCancelado, onRechazoDeAgenda }: Props) {
  const configuracion = useConfiguracion();
  const cancelar = useCancelarTurno();
  const [motivo, setMotivo] = useState('');
  const [errorMotivo, setErrorMotivo] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const ocupado = cancelar.isPending;
  const excedido = motivo.length > MOTIVO_MAXIMO;

  const confirmar = () => {
    if (ocupado) return;
    setError(null);
    if (excedido) {
      setErrorMotivo(MENSAJES_CAMPO.motivo);
      return;
    }
    setErrorMotivo(undefined);
    cancelar.mutate(
      { id: turno.id, motivo },
      {
        onSuccess: onCancelado,
        onError: (fallo) => {
          const rechazo = interpretarRechazo(fallo);
          if (rechazo.tipo === 'agenda') onRechazoDeAgenda(rechazo.texto);
          else if (rechazo.tipo === 'campos') setErrorMotivo(rechazo.errores.motivo ?? MENSAJES_CAMPO.motivo);
          else if (rechazo.tipo === 'alerta') setError(rechazo.texto);
        },
      },
    );
  };

  let aviso = null;
  if (configuracion.isSuccess) {
    const horas = configuracion.data.horasCancelacionTardia;
    aviso = esCancelacionTardia(turno.inicio, ahora, horas) ? (
      <Alerta tipo="info" titulo="Cancelación tardía" rol="alert">
        Faltan menos de {horas} h para el turno. Se registrará como cancelación tardía y el horario quedará libre.
      </Alerta>
    ) : (
      <p className={estilos.nota}>Faltan {horas} h o más: la cancelación no se registra como tardía.</p>
    );
  } else if (configuracion.isError) {
    aviso = (
      <Alerta tipo="info" titulo="Aviso" rol="alert">
        Si faltan pocas horas para el turno, puede quedar registrada como cancelación tardía.
      </Alerta>
    );
  }

  return (
    <Dialogo
      titulo="Cancelar turno"
      bajada={`${diaDe(turno)} · ${horarioDe(turno)}`}
      onCerrar={onCerrar}
      ocupado={ocupado}
      onEnviar={confirmar}
      pie={
        <>
          <button className={estilos.boton} type="button" onClick={onVolver} disabled={ocupado}>
            Volver
          </button>
          <button
            className={`${estilos.boton} ${estilos.botonPeligro}`}
            type="submit"
            aria-busy={ocupado}
            disabled={ocupado}
          >
            {ocupado ? 'Cancelando…' : 'Cancelar turno'}
          </button>
        </>
      }
    >
      <ResumenTurno turno={turno} />
      {aviso}
      <CampoTexto
        etiqueta="Motivo (opcional)"
        error={errorMotivo}
        ayuda={`Podés contarnos por qué se cancela. Hasta ${MOTIVO_MAXIMO} caracteres.`}
        contador={`${motivo.length}/${MOTIVO_MAXIMO}`}
        contadorExcedido={excedido}
      >
        {(props) => (
          <textarea
            {...props}
            rows={3}
            value={motivo}
            disabled={ocupado}
            data-autofoco
            onChange={(evento) => setMotivo(evento.target.value)}
          />
        )}
      </CampoTexto>
      {error && (
        <Alerta tipo="error" rol="alert">
          {error}
        </Alerta>
      )}
    </Dialogo>
  );
}
