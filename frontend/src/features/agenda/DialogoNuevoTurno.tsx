import { useEffect, useRef, useState } from 'react';
import type { Paciente } from '../pacientes/tipos';
import { usePrestaciones } from '../prestaciones/hooks';
import { Alerta } from './Alerta';
import { ComboPaciente } from './ComboPaciente';
import { Dialogo } from './Dialogo';
import { interpretarRechazo } from './errores';
import { formatoHora, isoConsultorio, type FechaCivil } from './fechas';
import { CampoTexto } from './Campos';
import {
  duracionValida,
  MENSAJES_CAMPO,
  minutosDeHora,
  textoFin,
  validarHorario,
  sinErrores,
  type CampoTurno,
  type ErroresTurno,
} from './gestion';
import type { TurnoAgenda } from './tipos';
import { useCrearTurno } from './turnosApi';
import estilos from './Gestion.module.css';

interface Props {
  fecha: FechaCivil;
  /** Hora precargada (franja libre), en minutos desde la medianoche. */
  minutos?: number | undefined;
  ahora: Date;
  onCerrar: () => void;
  onCreado: (turno: TurnoAgenda) => void;
  onRechazoDeAgenda: (texto: string) => void;
}

type AlertaDialogo = { titulo?: string | undefined; texto: string } | null;

/** Diálogo "Nuevo turno" (spec web-gestion-turnos, maqueta nuevo-turno.html). */
export function DialogoNuevoTurno({ fecha, minutos, ahora, onCerrar, onCreado, onRechazoDeAgenda }: Props) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [prestacionId, setPrestacionId] = useState('');
  const [duracion, setDuracion] = useState('');
  const [dia, setDia] = useState(fecha);
  const [hora, setHora] = useState(minutos === undefined ? '' : formatoHora(minutos));
  const [errores, setErrores] = useState<ErroresTurno>({});
  const [alerta, setAlerta] = useState<AlertaDialogo>(null);
  const [intento, setIntento] = useState(0);
  const formulario = useRef<HTMLDivElement>(null);

  const prestaciones = usePrestaciones();
  const activas = (prestaciones.data ?? []).filter((p) => p.activa);
  const crear = useCrearTurno();
  const ocupado = crear.isPending;

  // Tras una validación fallida, el foco va al primer campo con error.
  useEffect(() => {
    if (intento === 0) return;
    formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [intento]);

  const limpiar = (...campos: CampoTurno[]) => setErrores((actuales) => sinErrores(actuales, campos));

  const elegirPrestacion = (id: string) => {
    setPrestacionId(id);
    limpiar('prestacion', 'duracion');
    const elegida = activas.find((p) => String(p.id) === id);
    if (elegida) setDuracion(String(elegida.duracionMinutos));
  };

  const enviar = () => {
    if (ocupado) return;
    const encontrados: ErroresTurno = {};
    if (!paciente) encontrados.paciente = MENSAJES_CAMPO.paciente;
    if (!prestacionId) encontrados.prestacion = MENSAJES_CAMPO.prestacion;
    Object.assign(encontrados, validarHorario({ fecha: dia, hora, duracion }, ahora));
    setErrores(encontrados);
    setAlerta(null);
    if (Object.keys(encontrados).length > 0 || !paciente) {
      setIntento((n) => n + 1);
      return;
    }

    crear.mutate(
      {
        pacienteId: paciente.id,
        prestacionId: Number(prestacionId),
        inicio: isoConsultorio(dia, minutosDeHora(hora) ?? 0),
        duracionMinutos: duracionValida(duracion) ?? 0,
      },
      {
        onSuccess: onCreado,
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
      titulo="Nuevo turno"
      bajada="La duración se completa según la prestación y podés cambiarla."
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
            {ocupado ? 'Guardando…' : 'Crear turno'}
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
        <ComboPaciente
          paciente={paciente}
          onElegir={(elegido) => {
            setPaciente(elegido);
            limpiar('paciente');
          }}
          error={errores.paciente}
          deshabilitado={ocupado}
        />
        <CampoTexto etiqueta="Prestación" error={errores.prestacion}>
          {(props) => (
            <select
              {...props}
              value={prestacionId}
              disabled={ocupado}
              onChange={(evento) => elegirPrestacion(evento.target.value)}
            >
              <option value="">{prestaciones.isPending ? 'Cargando prestaciones…' : 'Elegí una prestación'}</option>
              {activas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
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
        <CampoTexto etiqueta="Día" error={errores.dia}>
          {(props) => (
            <input
              {...props}
              type="date"
              value={dia}
              disabled={ocupado}
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
      </div>
    </Dialogo>
  );
}
