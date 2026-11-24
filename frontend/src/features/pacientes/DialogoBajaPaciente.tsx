import { useState } from 'react';
import { mensajeDeError } from '../../shared/api/mensajes';
import { useDialogo } from '../../shared/useDialogo';
import { useDarDeBajaPaciente } from './hooks';
import type { Paciente } from './tipos';
import estilos from './Pacientes.module.css';

interface Props {
  paciente: Paciente;
  onCerrar: () => void;
}

export function DialogoBajaPaciente({ paciente, onCerrar }: Props) {
  const [error, setError] = useState<string | null>(null);
  const baja = useDarDeBajaPaciente();
  const { referencia, alPulsarTecla } = useDialogo<HTMLDivElement>(onCerrar);

  const confirmar = () => {
    setError(null);
    baja.mutate(paciente.id, {
      onSuccess: onCerrar,
      onError: (fallo) => setError(mensajeDeError(fallo)),
    });
  };

  const cerrar = () => {
    if (!baja.isPending) onCerrar();
  };

  return (
    <div
      className={estilos.fondo}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) cerrar();
      }}
    >
      <div
        ref={referencia}
        className={`${estilos.dialogo} ${estilos.dialogoEstrecho}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-baja"
        aria-describedby="ayuda-baja"
        tabIndex={-1}
        onKeyDown={alPulsarTecla}
      >
        <div className={estilos.cabeceraDialogo}>
          <h2 id="titulo-baja" className={`${estilos.tituloDialogo} ${estilos.tituloPeligro}`}>
            ¿Dar de baja a {paciente.nombre} {paciente.apellido}?
          </h2>
          <button className={estilos.botonIcono} type="button" aria-label="Cerrar" onClick={cerrar}>
            ×
          </button>
        </div>
        <p id="ayuda-baja" className={estilos.ayudaDialogo}>
          El paciente deja de aparecer en las búsquedas y no se le pueden asignar turnos nuevos. No se
          borran sus datos.
        </p>

        {error && (
          <div className={estilos.aviso} role="alert">
            {error}
          </div>
        )}

        <div className={estilos.accionesDialogo}>
          <button className={estilos.boton} type="button" onClick={cerrar} disabled={baja.isPending}>
            Cancelar
          </button>
          <button
            className={`${estilos.boton} ${estilos.botonPeligro}`}
            type="button"
            onClick={confirmar}
            disabled={baja.isPending}
          >
            {baja.isPending ? 'Dando de baja…' : 'Dar de baja'}
          </button>
        </div>
      </div>
    </div>
  );
}
