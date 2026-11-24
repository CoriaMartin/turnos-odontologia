import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { mensajeDeError } from '../../shared/api/mensajes';
import { formatearDni } from '../pacientes/dni';
import type { Paciente } from '../pacientes/tipos';
import { MINIMO_BUSQUEDA, usePacientesParaTurno } from './turnosApi';
import estilos from './Gestion.module.css';

/** Espera antes de buscar mientras se escribe (design.md D6). */
export const DEBOUNCE_MS = 300;

export function etiquetaPaciente(paciente: Pick<Paciente, 'nombre' | 'apellido'>): string {
  return `${paciente.apellido}, ${paciente.nombre}`;
}

interface Props {
  paciente: Paciente | null;
  onElegir: (paciente: Paciente | null) => void;
  error?: string | undefined;
  deshabilitado?: boolean;
}

/**
 * Campo "Paciente" con el patrón combobox de WAI-ARIA (`combobox` + `listbox`). Busca pacientes activos
 * desde 2 caracteres con `GET /api/pacientes?q=&size=10` (función de C-15).
 */
export function ComboPaciente({ paciente, onElegir, error, deshabilitado = false }: Props) {
  const id = useId();
  const idLista = `${id}-lista`;
  const idAyuda = `${id}-ayuda`;
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [activo, setActivo] = useState(0);
  const [cerrada, setCerrada] = useState(false);

  useEffect(() => {
    const temporizador = setTimeout(() => setBusqueda(texto.trim()), DEBOUNCE_MS);
    return () => clearTimeout(temporizador);
  }, [texto]);

  const consulta = usePacientesParaTurno(paciente ? '' : busqueda);
  const opciones = consulta.data?.contenido ?? [];
  const buscando = !paciente && busqueda.length >= MINIMO_BUSQUEDA;
  const abierta = buscando && !cerrada && opciones.length > 0;

  const elegir = (elegido: Paciente) => {
    onElegir(elegido);
    setTexto(etiquetaPaciente(elegido));
    setCerrada(true);
  };

  const cambiar = () => {
    onElegir(null);
    setTexto('');
    setBusqueda('');
    setCerrada(false);
  };

  const alPulsarTecla = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (!abierta) return;
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      const paso = evento.key === 'ArrowDown' ? 1 : -1;
      setActivo((actual) => (actual + paso + opciones.length) % opciones.length);
    } else if (evento.key === 'Enter') {
      evento.preventDefault();
      const elegido = opciones[activo];
      if (elegido) elegir(elegido);
    } else if (evento.key === 'Escape') {
      // Cierra la lista sin cerrar el diálogo.
      evento.stopPropagation();
      setCerrada(true);
    }
  };

  const descripcion = [error ? `${id}-error` : null, idAyuda].filter(Boolean).join(' ');

  return (
    <div className={`${estilos.campo} ${estilos.ancho}`}>
      <label htmlFor={id}>Paciente</label>
      <div className={estilos.combo}>
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={abierta}
          aria-controls={idLista}
          aria-activedescendant={abierta ? `${id}-opcion-${activo}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={descripcion}
          placeholder="Apellido, nombre o DNI"
          value={texto}
          readOnly={paciente !== null}
          disabled={deshabilitado}
          data-autofoco
          onChange={(evento) => {
            setTexto(evento.target.value);
            setActivo(0);
            setCerrada(false);
          }}
          onKeyDown={alPulsarTecla}
        />
        <ul id={idLista} className={estilos.listbox} role="listbox" aria-label="Pacientes que coinciden" hidden={!abierta}>
          {opciones.map((opcion, indice) => (
            <li
              key={opcion.id}
              id={`${id}-opcion-${indice}`}
              className={estilos.opcion}
              role="option"
              aria-selected={indice === activo}
              onMouseDown={(evento) => evento.preventDefault()}
              onClick={() => elegir(opcion)}
            >
              {etiquetaPaciente(opcion)}
              <span className={estilos.opcionMeta}>DNI {formatearDni(opcion.dni)}</span>
            </li>
          ))}
        </ul>
        {buscando && consulta.isSuccess && opciones.length === 0 && (
          <p className={estilos.sinResultados} role="status">
            No hay pacientes que coincidan con “{busqueda}”
          </p>
        )}
        {buscando && consulta.isError && (
          <p className={estilos.error} role="alert">
            No pudimos buscar pacientes. {mensajeDeError(consulta.error)}
          </p>
        )}
      </div>
      {error && (
        <span id={`${id}-error`} className={estilos.error}>
          {error}
        </span>
      )}
      <span id={idAyuda} className={estilos.ayuda}>
        {paciente ? (
          <>
            DNI {formatearDni(paciente.dni)} ·{' '}
            {!deshabilitado && (
              <button type="button" className={estilos.enlace} onClick={cambiar}>
                Cambiar paciente
              </button>
            )}
          </>
        ) : (
          'Buscá desde 2 letras. Se muestran hasta 10 resultados.'
        )}
      </span>
    </div>
  );
}
