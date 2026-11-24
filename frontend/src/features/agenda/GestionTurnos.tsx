import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Alerta } from './Alerta';
import type { AccionesAgenda } from './accionesAgenda';
import { DialogoCancelar } from './DialogoCancelar';
import { DialogoDetalle } from './DialogoDetalle';
import { DialogoNuevoTurno } from './DialogoNuevoTurno';
import { DialogoReprogramar } from './DialogoReprogramar';
import { enConsultorio, type FechaCivil } from './fechas';
import { textoDiaYHora } from './gestion';
import type { TurnoAgenda } from './tipos';
import estilos from './Gestion.module.css';

type DialogoAbierto =
  | { tipo: 'nuevo'; fecha: FechaCivil; minutos?: number | undefined }
  | { tipo: 'detalle'; turno: TurnoAgenda }
  | { tipo: 'reprogramar'; turno: TurnoAgenda }
  | { tipo: 'cancelar'; turno: TurnoAgenda }
  | null;

type Aviso = { tipo: 'exito'; titulo: string; texto: string } | { tipo: 'error'; texto: string } | null;

interface Opciones {
  ahora: Date;
  /** Muestra en la agenda el día de un turno creado o reprogramado. */
  irA: (fecha: FechaCivil) => void;
}

interface Gestion {
  acciones: AccionesAgenda;
  abrirNuevo: (fecha: FechaCivil) => void;
  avisos: ReactNode;
  dialogo: ReactNode;
}

/**
 * Estado de C-17 dentro de la agenda: qué diálogo está abierto y el último aviso. Los éxitos se anuncian en
 * una región `status` que siempre existe; los rechazos que cambian la agenda, con `role="alert"`.
 */
export function useGestionTurnos({ ahora, irA }: Opciones): Gestion {
  const [abierto, setAbierto] = useState<DialogoAbierto>(null);
  const [aviso, setAviso] = useState<Aviso>(null);
  const regionExito = useRef<HTMLDivElement>(null);
  const avisoError = useRef<HTMLDivElement>(null);

  // El aviso va arriba de la agenda: si la página está desplazada (un turno de la tarde), se lo trae a la vista.
  // Corre después de que el diálogo devuelve el foco al turno, así el aviso queda visible.
  useEffect(() => {
    if (!aviso) return;
    const destino = aviso.tipo === 'exito' ? regionExito.current : avisoError.current;
    // 'center' y no 'start': la barra superior es sticky y de alto variable (en móvil ocupa dos filas).
    destino?.scrollIntoView?.({ block: 'center' });
  }, [aviso]);

  const cerrar = () => setAbierto(null);
  const exito = (titulo: string, texto: string) => {
    setAbierto(null);
    setAviso({ tipo: 'exito', titulo, texto });
  };
  const rechazoDeAgenda = (texto: string) => {
    setAbierto(null);
    setAviso({ tipo: 'error', texto });
  };
  const mostrarDiaDe = (turno: TurnoAgenda) => irA(enConsultorio(turno.inicio).fecha);

  const acciones = useMemo<AccionesAgenda>(
    () => ({
      ahora,
      abrirTurno: (turno) => setAbierto({ tipo: 'detalle', turno }),
      nuevoTurnoEn: (fecha, minutos) => setAbierto({ tipo: 'nuevo', fecha, minutos }),
    }),
    [ahora],
  );

  let dialogo: ReactNode = null;
  if (abierto?.tipo === 'nuevo') {
    dialogo = (
      <DialogoNuevoTurno
        fecha={abierto.fecha}
        minutos={abierto.minutos}
        ahora={ahora}
        onCerrar={cerrar}
        onRechazoDeAgenda={rechazoDeAgenda}
        onCreado={(turno) => {
          exito('Turno creado', textoDiaYHora(turno.inicio));
          mostrarDiaDe(turno);
        }}
      />
    );
  } else if (abierto?.tipo === 'detalle') {
    const { turno } = abierto;
    dialogo = (
      <DialogoDetalle
        turno={turno}
        ahora={ahora}
        onCerrar={cerrar}
        onReprogramar={() => setAbierto({ tipo: 'reprogramar', turno })}
        onCancelar={() => setAbierto({ tipo: 'cancelar', turno })}
        onRechazoDeAgenda={rechazoDeAgenda}
        onAsistencia={(actualizado) =>
          exito(
            actualizado.estado === 'AUSENTE' ? 'Turno marcado como ausente' : 'Turno marcado como atendido',
            'La agenda ya muestra el nuevo estado.',
          )
        }
      />
    );
  } else if (abierto?.tipo === 'reprogramar') {
    dialogo = (
      <DialogoReprogramar
        turno={abierto.turno}
        ahora={ahora}
        onCerrar={cerrar}
        onRechazoDeAgenda={rechazoDeAgenda}
        onReprogramado={(turno) => {
          exito('Turno reprogramado', textoDiaYHora(turno.inicio));
          mostrarDiaDe(turno);
        }}
      />
    );
  } else if (abierto?.tipo === 'cancelar') {
    const { turno } = abierto;
    dialogo = (
      <DialogoCancelar
        turno={turno}
        ahora={ahora}
        onVolver={() => setAbierto({ tipo: 'detalle', turno })}
        onCerrar={cerrar}
        onRechazoDeAgenda={rechazoDeAgenda}
        onCancelado={(cancelado) =>
          exito(
            cancelado.estado === 'CANCELADO_TARDIO' ? 'Turno cancelado con cancelación tardía' : 'Turno cancelado',
            'El horario quedó libre.',
          )
        }
      />
    );
  }

  const avisos = (
    <>
      <div ref={regionExito} className={estilos.avisos} role="status">
        {aviso?.tipo === 'exito' && (
          <Alerta tipo="exito" titulo={aviso.titulo}>
            {aviso.texto}
          </Alerta>
        )}
      </div>
      {aviso?.tipo === 'error' && (
        <div ref={avisoError}>
          <Alerta tipo="error" rol="alert">
            {aviso.texto}
          </Alerta>
        </div>
      )}
    </>
  );

  return {
    acciones,
    abrirNuevo: (fecha) => setAbierto({ tipo: 'nuevo', fecha }),
    avisos,
    dialogo,
  };
}
