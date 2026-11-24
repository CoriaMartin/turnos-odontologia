import { useState, type FormEvent } from 'react';
import { ApiError } from '../../shared/api/ApiError';
import { MENSAJES_POR_CODIGO, mensajeDeError } from '../../shared/api/mensajes';
import { useDialogo } from '../../shared/useDialogo';
import { soloDigitos } from './dni';
import { useGuardarPaciente } from './hooks';
import type { DatosPaciente, Paciente } from './tipos';
import estilos from './Pacientes.module.css';

type Campo = 'nombre' | 'apellido' | 'dni' | 'email';

interface Props {
  paciente?: Paciente | undefined;
  onCerrar: () => void;
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function interpretarError(error: unknown): { campos: Partial<Record<Campo, string>>; general: string | null } {
  const campos: Partial<Record<Campo, string>> = {};
  if (error instanceof ApiError) {
    if (error.codigo === 'DNI_DUPLICADO') {
      campos.dni = MENSAJES_POR_CODIGO.DNI_DUPLICADO ?? mensajeDeError(error);
    }
    if (error.codigo === 'VALIDACION_FALLIDA') {
      for (const fallo of error.errores) {
        if (fallo.campo === 'dni') {
          campos.dni = 'Revisá el DNI: tiene que tener 7 u 8 números.';
        }
        if (fallo.campo === 'email') {
          campos.email = 'Revisá el email: falta la parte después del arroba.';
        }
        if (fallo.campo === 'nombre' || fallo.campo === 'apellido') {
          campos[fallo.campo] = 'Este dato es obligatorio.';
        }
      }
    }
  }
  return { campos, general: Object.keys(campos).length > 0 ? null : mensajeDeError(error) };
}

function opcional(valor: string): string | null {
  const limpio = valor.trim();
  return limpio === '' ? null : limpio;
}

export function FormularioPaciente({ paciente, onCerrar }: Props) {
  const [nombre, setNombre] = useState(paciente?.nombre ?? '');
  const [apellido, setApellido] = useState(paciente?.apellido ?? '');
  const [dni, setDni] = useState(paciente?.dni ?? '');
  const [telefono, setTelefono] = useState(paciente?.telefono ?? '');
  const [email, setEmail] = useState(paciente?.email ?? '');
  const [obraSocial, setObraSocial] = useState(paciente?.obraSocial ?? '');
  const [numeroAfiliado, setNumeroAfiliado] = useState(paciente?.numeroAfiliado ?? '');
  const [fechaNacimiento, setFechaNacimiento] = useState(paciente?.fechaNacimiento ?? '');
  const [aceptaRecordatorios, setAceptaRecordatorios] = useState(
    paciente?.aceptaRecordatorios ?? false,
  );
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const guardar = useGuardarPaciente();
  const { referencia, alPulsarTecla } = useDialogo<HTMLDivElement>(onCerrar);

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const campos: Partial<Record<Campo, string>> = {};
    const digitos = soloDigitos(dni);
    const correo = email.trim();

    if (!nombre.trim()) campos.nombre = 'Escribí el nombre del paciente.';
    if (!apellido.trim()) campos.apellido = 'Escribí el apellido del paciente.';
    if (digitos.length < 7 || digitos.length > 8) {
      campos.dni = 'Revisá el DNI: tiene que tener 7 u 8 números.';
    }
    if (correo !== '' && !EMAIL_VALIDO.test(correo)) {
      campos.email = 'Revisá el email: falta la parte después del arroba.';
    }

    setErrores(campos);
    setErrorGeneral(null);
    if (Object.keys(campos).length > 0) return;

    const datos: DatosPaciente = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: digitos,
      fechaNacimiento: opcional(fechaNacimiento),
      telefono: opcional(telefono),
      email: opcional(correo),
      obraSocial: opcional(obraSocial),
      numeroAfiliado: opcional(numeroAfiliado),
      aceptaRecordatorios,
    };

    guardar.mutate(
      paciente ? { id: paciente.id, datos } : { datos },
      {
        onSuccess: onCerrar,
        onError: (error) => {
          const interpretado = interpretarError(error);
          setErrores(interpretado.campos);
          setErrorGeneral(interpretado.general);
        },
      },
    );
  };

  const cerrar = () => {
    if (!guardar.isPending) onCerrar();
  };

  const describir = (campo: Campo, id: string) => (errores[campo] ? id : undefined);

  return (
    <div
      className={estilos.fondo}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) cerrar();
      }}
    >
      <div
        ref={referencia}
        className={estilos.dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-paciente"
        aria-describedby="ayuda-paciente"
        tabIndex={-1}
        onKeyDown={alPulsarTecla}
      >
        <div className={estilos.cabeceraDialogo}>
          <h2 id="titulo-paciente" className={estilos.tituloDialogo}>
            {paciente ? 'Editar paciente' : 'Nuevo paciente'}
          </h2>
          <button className={estilos.botonIcono} type="button" aria-label="Cerrar" onClick={cerrar}>
            ×
          </button>
        </div>
        <p id="ayuda-paciente" className={estilos.ayudaDialogo}>
          Actualizá los datos personales y el consentimiento de recordatorios.
        </p>

        <form className={estilos.formulario} onSubmit={enviar} noValidate>
          {errorGeneral && (
            <div className={estilos.aviso} role="alert">
              {errorGeneral}
            </div>
          )}

          <div className={estilos.formGrid}>
            <div className={estilos.campo}>
              <label htmlFor="paciente-nombre">Nombre</label>
              <input
                id="paciente-nombre"
                type="text"
                maxLength={100}
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                aria-invalid={Boolean(errores.nombre)}
                aria-describedby={describir('nombre', 'error-paciente-nombre')}
              />
              {errores.nombre && (
                <span id="error-paciente-nombre" className={estilos.errorCampo} role="alert">
                  {errores.nombre}
                </span>
              )}
            </div>

            <div className={estilos.campo}>
              <label htmlFor="paciente-apellido">Apellido</label>
              <input
                id="paciente-apellido"
                type="text"
                maxLength={100}
                value={apellido}
                onChange={(evento) => setApellido(evento.target.value)}
                aria-invalid={Boolean(errores.apellido)}
                aria-describedby={describir('apellido', 'error-paciente-apellido')}
              />
              {errores.apellido && (
                <span id="error-paciente-apellido" className={estilos.errorCampo} role="alert">
                  {errores.apellido}
                </span>
              )}
            </div>

            <div className={estilos.campo}>
              <label htmlFor="paciente-dni">DNI</label>
              <input
                id="paciente-dni"
                type="text"
                inputMode="numeric"
                value={dni}
                onChange={(evento) => setDni(evento.target.value)}
                aria-invalid={Boolean(errores.dni)}
                aria-describedby={describir('dni', 'error-paciente-dni')}
              />
              {errores.dni && (
                <span id="error-paciente-dni" className={estilos.errorCampo} role="alert">
                  {errores.dni}
                </span>
              )}
            </div>

            <div className={estilos.campo}>
              <label htmlFor="paciente-telefono">Teléfono</label>
              <input
                id="paciente-telefono"
                type="tel"
                value={telefono}
                onChange={(evento) => setTelefono(evento.target.value)}
              />
            </div>

            <div className={estilos.campo}>
              <label htmlFor="paciente-email">Email</label>
              <input
                id="paciente-email"
                type="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                aria-invalid={Boolean(errores.email)}
                aria-describedby={describir('email', 'error-paciente-email')}
              />
              {errores.email && (
                <span id="error-paciente-email" className={estilos.errorCampo} role="alert">
                  {errores.email}
                </span>
              )}
            </div>

            <div className={estilos.campo}>
              <label htmlFor="paciente-nacimiento">Fecha de nacimiento</label>
              <input
                id="paciente-nacimiento"
                type="date"
                value={fechaNacimiento}
                onChange={(evento) => setFechaNacimiento(evento.target.value)}
              />
            </div>

            <div className={estilos.campo}>
              <label htmlFor="paciente-obra-social">Obra social</label>
              <input
                id="paciente-obra-social"
                type="text"
                value={obraSocial}
                onChange={(evento) => setObraSocial(evento.target.value)}
              />
            </div>

            <div className={estilos.campo}>
              <label htmlFor="paciente-afiliado">Número de afiliado</label>
              <input
                id="paciente-afiliado"
                type="text"
                value={numeroAfiliado}
                onChange={(evento) => setNumeroAfiliado(evento.target.value)}
              />
            </div>
          </div>

          <label className={estilos.consentimiento} htmlFor="paciente-recordatorios">
            <input
              id="paciente-recordatorios"
              type="checkbox"
              checked={aceptaRecordatorios}
              onChange={(evento) => setAceptaRecordatorios(evento.target.checked)}
            />
            <span>
              Acepta recordatorios por email
              <small>Si no lo acepta, no se le envían recordatorios automáticos antes del turno.</small>
            </span>
          </label>

          <div className={estilos.accionesDialogo}>
            <button className={estilos.boton} type="button" onClick={cerrar} disabled={guardar.isPending}>
              Cancelar
            </button>
            <button
              className={`${estilos.boton} ${estilos.botonPrimario}`}
              type="submit"
              disabled={guardar.isPending}
            >
              {guardar.isPending ? 'Guardando…' : 'Guardar paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
