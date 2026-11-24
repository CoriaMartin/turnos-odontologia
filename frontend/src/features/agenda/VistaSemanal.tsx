import { useId } from 'react';
import { encabezadoDia, enConsultorio, type FechaCivil, type MomentoConsultorio } from './fechas';
import {
  esCancelado,
  posicion,
  posicionDeHora,
  rangoVisible,
  tramosDelDia,
} from './lineaDeTiempo';
import type { TurnoAgenda } from './tipos';
import { CanceladoChip, LineaAhora, TurnoMini, TurnoTarjeta } from './Turnos';
import { ColumnaHoras, Franjas } from './VistaDiaria';
import estilos from './Agenda.module.css';

interface Props {
  dias: readonly FechaCivil[];
  turnos: readonly TurnoAgenda[];
  ahora: MomentoConsultorio;
  pantallaAncha: boolean;
}

function nombreDelDia(fecha: FechaCivil): string {
  const { dia, numero } = encabezadoDia(fecha);
  return `${dia} ${numero}`;
}

/**
 * Semana de lunes a domingo (spec "Vista semanal"). En pantallas anchas, columnas sobre una línea de
 * tiempo como la maqueta; en angostas, una lista por día (design.md D11). Los cancelados van aparte.
 */
export function VistaSemanal({ dias, turnos, ahora, pantallaAncha }: Props) {
  const activos = turnos.filter((t) => !esCancelado(t));
  const cancelados = turnos.filter(esCancelado);

  if (turnos.length === 0) {
    return (
      <div className={estilos.vacio}>
        <strong>No hay turnos esta semana</strong>
        <span>Cuando agendes uno, va a aparecer en esta semana.</span>
      </div>
    );
  }

  return (
    <>
      {pantallaAncha ? (
        <Cuadricula dias={dias} activos={activos} ahora={ahora} />
      ) : (
        <Lista dias={dias} activos={activos} hoy={ahora.fecha} />
      )}
      {cancelados.length > 0 && <CanceladosDeLaSemana cancelados={cancelados} />}
    </>
  );
}

function Cuadricula({
  dias,
  activos,
  ahora,
}: {
  dias: readonly FechaCivil[];
  activos: readonly TurnoAgenda[];
  ahora: MomentoConsultorio;
}) {
  const tramosPorDia = dias.map((fecha) => ({ fecha, tramos: tramosDelDia(activos, fecha) }));
  const rango = rangoVisible(tramosPorDia.flatMap((d) => d.tramos));

  return (
    <div className={estilos.semana}>
      <div className={estilos.semanaCabecera}>
        <span aria-hidden="true" />
        {dias.map((fecha) => {
          const { dia, numero } = encabezadoDia(fecha);
          const esHoy = fecha === ahora.fecha;
          return (
            <div
              key={fecha}
              className={`${estilos.semanaDia} ${esHoy ? estilos.hoy : ''}`}
              aria-current={esHoy ? 'date' : undefined}
            >
              <span className={estilos.semanaDiaNombre}>{dia}</span>
              <span className={estilos.semanaDiaNumero}>{numero}</span>
            </div>
          );
        })}
      </div>
      <div className={estilos.semanaCuerpo}>
        <ColumnaHoras rango={rango} />
        {tramosPorDia.map(({ fecha, tramos }) => {
          const topAhora = fecha === ahora.fecha ? posicionDeHora(ahora.minutos, rango) : null;
          return (
            <div key={fecha} className={estilos.carril} role="group" aria-label={nombreDelDia(fecha)}>
              <Franjas rango={rango} />
              {tramos.map((tramo) => (
                <TurnoMini key={tramo.turno.id} turno={tramo.turno} posicion={posicion(tramo, rango)} />
              ))}
              {topAhora !== null && <LineaAhora top={topAhora} minutos={ahora.minutos} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Lista({
  dias,
  activos,
  hoy,
}: {
  dias: readonly FechaCivil[];
  activos: readonly TurnoAgenda[];
  hoy: FechaCivil;
}) {
  return (
    <div className={estilos.listaSemana}>
      {dias.map((fecha) => (
        <DiaEnLista
          key={fecha}
          fecha={fecha}
          esHoy={fecha === hoy}
          turnos={activos.filter((t) => enConsultorio(t.inicio).fecha === fecha)}
        />
      ))}
    </div>
  );
}

function DiaEnLista({
  fecha,
  esHoy,
  turnos,
}: {
  fecha: FechaCivil;
  esHoy: boolean;
  turnos: readonly TurnoAgenda[];
}) {
  const idTitulo = useId();
  return (
    <section className={estilos.listaDia} role="group" aria-labelledby={idTitulo}>
      <h2
        id={idTitulo}
        className={`${estilos.listaDiaTitulo} ${esHoy ? estilos.hoy : ''}`}
        aria-current={esHoy ? 'date' : undefined}
      >
        {nombreDelDia(fecha)}
      </h2>
      {turnos.length === 0 ? (
        <p className={estilos.listaSinTurnos}>Sin turnos</p>
      ) : (
        turnos.map((turno) => <TurnoTarjeta key={turno.id} turno={turno} />)
      )}
    </section>
  );
}

function CanceladosDeLaSemana({ cancelados }: { cancelados: readonly TurnoAgenda[] }) {
  const idTitulo = useId();
  return (
    <section className={estilos.canceladosSemana} role="group" aria-labelledby={idTitulo}>
      <h2 id={idTitulo} className={estilos.canceladosSemanaTitulo}>
        Cancelados de la semana
      </h2>
      <ul>
        {cancelados.map((turno) => (
          <li key={turno.id}>
            <CanceladoChip turno={turno} />
          </li>
        ))}
      </ul>
    </section>
  );
}
