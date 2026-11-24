import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiError } from '../../shared/api/ApiError';
import { mensajeDeError } from '../../shared/api/mensajes';
import { useTituloDePagina } from '../../shared/useTituloDePagina';
import { DialogoBajaPaciente } from './DialogoBajaPaciente';
import { formatearDni } from './dni';
import { FormularioPaciente } from './FormularioPaciente';
import { TAMANIO_PAGINA } from './api';
import { usePacientes } from './hooks';
import type { Paciente } from './tipos';
import estilos from './Pacientes.module.css';

function numeroEntero(valor: string | null): number {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 0 ? numero : 0;
}

function textoConsentimiento(paciente: Paciente): string {
  if (!paciente.aceptaRecordatorios) {
    return paciente.email ? 'No acepta recordatorios' : 'No recibe recordatorios';
  }
  return 'Acepta recordatorios';
}

export function PacientesPage() {
  useTituloDePagina('Pacientes');
  const [parametros, setParametros] = useSearchParams();
  const q = parametros.get('q') ?? '';
  const pagina = numeroEntero(parametros.get('page'));
  const [busqueda, setBusqueda] = useState(q);
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Paciente | null>(null);
  const [dandoDeBaja, setDandoDeBaja] = useState<Paciente | null>(null);

  useEffect(() => setBusqueda(q), [q]);

  const consulta = usePacientes({ q, pagina });
  const sesionVencida = consulta.error instanceof ApiError && consulta.error.status === 401;
  const respuesta = consulta.data;
  const pacientes = respuesta?.contenido ?? [];
  const total = respuesta?.totalElementos ?? 0;
  const tamanio = respuesta?.tamanio ?? TAMANIO_PAGINA;
  const desde = total === 0 ? 0 : pagina * tamanio + 1;
  const hasta = Math.min((pagina + 1) * tamanio, total);

  const buscar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setParametros({ q: busqueda.trim(), page: '0' });
  };

  const irAPagina = (nuevaPagina: number) => {
    const siguientes = new URLSearchParams(parametros);
    siguientes.set('page', String(nuevaPagina));
    setParametros(siguientes);
  };

  const cerrarFormulario = () => {
    setCreando(false);
    setEditando(null);
  };

  return (
    <div className={estilos.pagina}>
      <div className={estilos.encabezado}>
        <div>
          <h1 className={estilos.titulo}>Pacientes</h1>
          <p className={estilos.bajada}>
            Buscá, registrá y actualizá los datos de tus pacientes y su consentimiento para recibir
            recordatorios por email.
          </p>
        </div>
        <button
          className={`${estilos.boton} ${estilos.botonPrimario}`}
          type="button"
          onClick={() => {
            setEditando(null);
            setCreando(true);
          }}
        >
          + Nuevo paciente
        </button>
      </div>

      <div className={estilos.tarjeta}>
        <form className={estilos.buscador} role="search" onSubmit={buscar}>
          <div className={estilos.campoBusqueda}>
            <label htmlFor="q-paciente">Buscar paciente</label>
            <input
              id="q-paciente"
              name="q"
              type="search"
              placeholder="Apellido, nombre o DNI"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>
          <button className={`${estilos.boton} ${estilos.botonSecundario}`} type="submit">
            Buscar
          </button>
        </form>

        <section
          className={estilos.region}
          aria-label="Resultados de la búsqueda de pacientes"
          aria-busy={consulta.isPending}
        >
          {consulta.isPending ? (
            <div className={estilos.estado}>
              <span className={estilos.indicador} aria-hidden="true" />
              Cargando...
            </div>
          ) : consulta.isError ? (
            sesionVencida ? null : (
              <div className={estilos.estado}>
                <div className={estilos.aviso} role="alert">
                  <b>No pudimos cargar los pacientes</b>
                  {mensajeDeError(consulta.error)}
                </div>
                <button className={estilos.boton} type="button" onClick={() => void consulta.refetch()}>
                  Reintentar
                </button>
              </div>
            )
          ) : pacientes.length === 0 ? (
            <div className={estilos.estado}>
              <p>
                {q
                  ? `No hay pacientes que coincidan con “${q}”.`
                  : 'Todavía no registraste pacientes.'}
              </p>
            </div>
          ) : (
            <>
              <ul className={estilos.lista} aria-label="Listado de pacientes">
                {pacientes.map((paciente) => (
                  <li key={paciente.id} className={estilos.item}>
                    <span className={estilos.avatar} aria-hidden="true">
                      {paciente.apellido.charAt(0).toUpperCase()}
                    </span>
                    <div className={estilos.datos}>
                      <strong>
                        {paciente.apellido}, {paciente.nombre}
                      </strong>
                      <span>DNI {formatearDni(paciente.dni)}</span>
                      {(paciente.obraSocial || paciente.numeroAfiliado) && (
                        <span>
                          {paciente.obraSocial}
                          {paciente.obraSocial && paciente.numeroAfiliado && ' · '}
                          {paciente.numeroAfiliado && `Nº ${paciente.numeroAfiliado}`}
                        </span>
                      )}
                      <span>{paciente.email ?? 'Sin email cargado'}</span>
                      <span
                        className={`${estilos.badge} ${
                          paciente.aceptaRecordatorios
                            ? estilos.badgeAcepta
                            : estilos.badgeNoAcepta
                        }`}
                      >
                        {textoConsentimiento(paciente)}
                      </span>
                    </div>
                    <div className={estilos.acciones}>
                      <button
                        className={`${estilos.boton} ${estilos.botonGhost}`}
                        type="button"
                        onClick={() => {
                          setCreando(false);
                          setEditando(paciente);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className={`${estilos.boton} ${estilos.botonPeligro}`}
                        type="button"
                        onClick={() => setDandoDeBaja(paciente)}
                      >
                        Dar de baja
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className={estilos.paginacion} role="status">
                <span>
                  Mostrando {desde} a {hasta} de {total} pacientes
                </span>
                <span>
                  Página {pagina + 1} de {Math.max(respuesta?.totalPaginas ?? 1, 1)}
                </span>
                <button
                  className={estilos.boton}
                  type="button"
                  disabled={pagina === 0}
                  onClick={() => irAPagina(pagina - 1)}
                >
                  Anterior
                </button>
                <button
                  className={estilos.boton}
                  type="button"
                  disabled={pagina + 1 >= (respuesta?.totalPaginas ?? 1)}
                  onClick={() => irAPagina(pagina + 1)}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {(creando || editando) && (
        <FormularioPaciente paciente={editando ?? undefined} onCerrar={cerrarFormulario} />
      )}
      {dandoDeBaja && (
        <DialogoBajaPaciente paciente={dandoDeBaja} onCerrar={() => setDandoDeBaja(null)} />
      )}
    </div>
  );
}
