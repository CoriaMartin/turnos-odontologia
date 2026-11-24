import { useEffect, useRef, useState } from 'react';
import { Alerta } from './Alerta';
import { CampoTexto } from './Campos';
import { etiquetaPaciente } from './ComboPaciente';
import { Dialogo } from './Dialogo';
import { interpretarRechazo } from './errores';
import { enConsultorio, formatoHora, isoConsultorio } from './fechas';
import {
  duracionValida,
  minutosDeHora,
  sinErrores,
  textoFin,
  validarHorario,
  type CampoTurno,
  type ErroresTurno,
} from './gestion';
import type { TurnoAgenda } from './tipos';
import { useReprogramarTurno } from './turnosApi';
import estilos from './Gestion.module.css';

interface Props {
  turno: TurnoAgenda;
  ahora: Date;
  onCerrar: () => void;
  onReprogramado: (turno: TurnoAgenda) => void;
  onRechazoDeAgenda: (texto: string) => void;
}

type AlertaDialogo = { titulo?: string | undefined; texto: string } | null;

/** Reprogramar (spec "Reprogramar un turno", maqueta reprogramar.html): día, hora y duración. */
export function DialogoReprogramar({ turno, ahora, onCerrar, onReprogramado, onRechazoDeAgenda }: Props) {
  const inicio = enConsultorio(turno.inicio);
  const [dia, setDia] = useState(inicio.fecha);
  const [hora, setHora] = useState(formatoHora(inicio.minutos));
  const [duracion, setDuracion] = useState(String(turno.duracionMinutos));
  const [errores, setErrores] = useState<ErroresTurno>({});
  const [alerta, setAlerta] = useState<AlertaDialogo>(null);
  const [intento, setIntento] = useState(0);
  const formulario = useRef<HTMLDivElement>(null);
  const reprogramar = useReprogramarTurno();
  const ocupado = reprogramar.isPending;

  useEffect(() => {
    if (intento === 0) return;
    formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [intento]);

  const limpiar = (...campos: CampoTurno[]) => setErrores((actuales) => sinErrores(actuales, campos));

  const enviar = () => {
    if (ocupado) return;
    const encontrados = validarHorario({ fecha: dia, hora, duracion }, ahora);
    setErrores(encontrados);
    setAlerta(null);
    if (Object.keys(encontrados).length > 0) {
      setIntento((n) => n + 1);
      return;
    }
    reprogramar.mutate(
      {
        id: turno.id,
        horario: {
          inicio: isoConsultorio(dia, minutosDeHora(hora) ?? 0),
          duracionMinutos: duracionValida(duracion) ?? turno.duracionMinutos,
          version: turno.version,
        },
      },
      {
        onSuccess: onReprogramado,
        onError: (error) => {
          const rechazo = interpretarRechazo(error);
          if (rechazo.tipo === 'campos') {
            setErrores(rechazo.errores);
            setIntento((n) => n + 1);
          } else if (rechazo.tipo === 'alerta') {
            setAlerta({ titulo: rechazo.titulo, texto: rechazo.texto });
          } else if (rechazo.tipo === 'agenda') {
            onRechazoDeAgenda(rechazo.texto);
          }
        },
      },
    );
  };

  return (
    <Dialogo
      titulo="Reprogramar turno"
      bajada="Solo cambian el día, la hora y la duración. El paciente y la prestación se mantienen."
      onCerrar={onCerrar}
      ocupado={ocupado}
      onEnviar={enviar}
      pie={
        <>
          <button className={estilos.boton} type="button" onClick={onCerrar} disabled={ocupado}>
            Cancelar
          </button>
          <button
            className={`${estilos.boton} ${estilos.botonPrimario}`}
            type="submit"
            aria-busy={ocupado}
            disabled={ocupado}
          >
            {ocupado && <span className={estilos.spinner} aria-hidden="true" />}
            {ocupado ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <div ref={formulario} className={estilos.formGrid}>
        {alerta && (
          <div className={estilos.ancho}>
            <Alerta tipo="error" titulo={alerta.titulo} rol="alert">
              {alerta.texto}
            </Alerta>
          </div>
        )}
        <CampoTexto etiqueta="Paciente">
          {(props) => <input {...props} type="text" value={etiquetaPaciente(turno.paciente)} readOnly />}
        </CampoTexto>
        <CampoTexto etiqueta="Prestación">
          {(props) => <input {...props} type="text" value={turno.prestacion.nombre} readOnly />}
        </CampoTexto>
        <CampoTexto etiqueta="Día" error={errores.dia}>
          {(props) => (
            <input
              {...props}
              type="date"
              value={dia}
              disabled={ocupado}
              data-autofoco
              onChange={(evento) => {
                setDia(evento.target.value);
                limpiar('dia');
              }}
            />
          )}
        </CampoTexto>
        <CampoTexto etiqueta="Hora" error={errores.hora} ayuda={textoFin(hora, duracion)}>
          {(props) => (
            <input
              {...props}
              type="time"
              value={hora}
              disabled={ocupado}
              onChange={(evento) => {
                setHora(evento.target.value);
                limpiar('hora', 'dia');
              }}
            />
          )}
        </CampoTexto>
        <CampoTexto etiqueta="Duración (min)" error={errores.duracion}>
          {(props) => (
            <input
              {...props}
              type="text"
              inputMode="numeric"
              value={duracion}
              disabled={ocupado}
              onChange={(evento) => {
                setDuracion(evento.target.value);
                limpiar('duracion');
              }}
            />
          )}
        </CampoTexto>
      </div>
    </Dialogo>
  );
}
