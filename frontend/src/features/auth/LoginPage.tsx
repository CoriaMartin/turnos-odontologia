import { useMutation } from '@tanstack/react-query';
import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import logoUrl from '@design-system/assets/logo.svg';
import { ApiError } from '../../shared/api/ApiError';
import { mensajeDeError } from '../../shared/api/mensajes';
import { BRAND_NAME } from '../../shared/brand';
import { useTituloDePagina } from '../../shared/useTituloDePagina';
import { login } from './api';
import estilos from './LoginPage.module.css';
import { iniciarSesion, useSesion } from './sesion';

type Campo = 'email' | 'password';
type ErroresDeCampo = Partial<Record<Campo, string>>;

const TEXTOS_CAMPO_VACIO: Record<Campo, string> = {
  email: 'Ingresá tu email',
  password: 'Ingresá tu contraseña',
};

/** Textos propios para los campos que la API marca en un 422 (no se muestra el texto del backend). */
const TEXTOS_CAMPO_INVALIDO: Record<Campo, string> = {
  email: 'Revisá el email: tiene que tener el formato nombre@consultorio.com.',
  password: 'Revisá la contraseña.',
};

const TITULOS_POR_CODIGO: Readonly<Record<string, string>> = {
  LOGIN_BLOQUEADO: 'Ingreso bloqueado por 15 minutos',
};
const TITULO_ERROR_POR_DEFECTO = 'No pudimos iniciar sesión';

/** Ruta a la que volver después de ingresar: la que guardó RutaProtegida, o el inicio. */
function rutaDeRegreso(estado: unknown): string {
  if (typeof estado === 'object' && estado !== null && 'desde' in estado) {
    const desde = (estado as { desde: unknown }).desde;
    // Solo rutas internas: evita redirecciones a otros sitios y volver al propio login.
    if (typeof desde === 'string' && desde.startsWith('/') && !desde.startsWith('//') && !desde.startsWith('/login')) {
      return desde;
    }
  }
  return '/';
}

function erroresDeLaApi(error: ApiError): ErroresDeCampo {
  const errores: ErroresDeCampo = {};
  for (const { campo } of error.errores) {
    if (campo === 'email' || campo === 'password') errores[campo] = TEXTOS_CAMPO_INVALIDO[campo];
  }
  return errores;
}

/** Página pública /login (spec web-sesion, maqueta openspec/changes/ui-login/mockups/). */
export function LoginPage() {
  useTituloDePagina('Ingresar');
  const { sesion, motivoCierre } = useSesion();
  const location = useLocation();
  const idTitulo = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState<ErroresDeCampo>({});
  const refEmail = useRef<HTMLInputElement>(null);
  const refPassword = useRef<HTMLInputElement>(null);

  const ingreso = useMutation({
    mutationFn: login,
    onSuccess: (respuesta) => {
      // Al cambiar la sesión, esta página se vuelve a renderizar y redirige (ver más abajo).
      iniciarSesion(respuesta.token, respuesta.expiraEn);
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;
      if (error.codigo === 'CREDENCIALES_INVALIDAS') {
        setPassword('');
        refPassword.current?.focus();
      } else if (error.codigo === 'LOGIN_BLOQUEADO') {
        // Como en la maqueta: no queda la contraseña escrita mientras dura el bloqueo.
        setPassword('');
      } else if (error.codigo === 'VALIDACION_FALLIDA') {
        const deLaApi = erroresDeLaApi(error);
        setErrores(deLaApi);
        (deLaApi.email ? refEmail : refPassword).current?.focus();
      }
    },
  });

  if (sesion) {
    return <Navigate to={rutaDeRegreso(location.state)} replace />;
  }

  const cargando = ingreso.isPending;

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (cargando) return;

    const vacios: ErroresDeCampo = {};
    if (email.trim() === '') vacios.email = TEXTOS_CAMPO_VACIO.email;
    if (password === '') vacios.password = TEXTOS_CAMPO_VACIO.password;
    setErrores(vacios);
    if (vacios.email || vacios.password) {
      (vacios.email ? refEmail : refPassword).current?.focus();
      return;
    }

    ingreso.mutate({ email, password });
  }

  function cambiar(campo: Campo, valor: string) {
    if (campo === 'email') setEmail(valor);
    else setPassword(valor);
    if (errores[campo]) setErrores(({ [campo]: _resuelto, ...resto }) => resto);
  }

  let aviso: ReactElement | null = null;
  if (ingreso.isError) {
    const codigo = ingreso.error instanceof ApiError ? ingreso.error.codigo : '';
    aviso = (
      <Aviso tipo="error" titulo={TITULOS_POR_CODIGO[codigo] ?? TITULO_ERROR_POR_DEFECTO}>
        {mensajeDeError(ingreso.error)}
      </Aviso>
    );
  } else if (ingreso.isIdle && motivoCierre === 'vencida') {
    aviso = (
      <Aviso tipo="info" titulo="Tu sesión venció">
        Ingresá de nuevo para seguir.
      </Aviso>
    );
  }

  return (
    <main className={estilos.pagina}>
      <div className={estilos.tarjeta}>
        <form className={estilos.formulario} noValidate onSubmit={enviar} aria-labelledby={idTitulo}>
          <div className={estilos.marca}>
            <img className={estilos.logo} src={logoUrl} alt="" />
            <strong className={estilos.nombre}>{BRAND_NAME}</strong>
          </div>
          <h1 id={idTitulo} className={estilos.titulo}>
            Ingresá a tu agenda
          </h1>
          <p className={estilos.subtitulo}>Usá el email y la contraseña del consultorio.</p>

          {aviso}

          <CampoDeTexto
            id="email"
            etiqueta="Email"
            tipo="email"
            autocompletar="username"
            placeholder="tu@consultorio.com"
            valor={email}
            error={errores.email}
            soloLectura={cargando}
            refInput={refEmail}
            onCambio={(valor) => cambiar('email', valor)}
          />
          <CampoDeTexto
            id="password"
            etiqueta="Contraseña"
            tipo="password"
            autocompletar="current-password"
            valor={password}
            error={errores.password}
            soloLectura={cargando}
            refInput={refPassword}
            onCambio={(valor) => cambiar('password', valor)}
          />

          <button
            className={estilos.botonPrimario}
            type="submit"
            aria-busy={cargando || undefined}
            aria-disabled={cargando || undefined}
          >
            {cargando ? (
              <>
                <span className={estilos.spinner} aria-hidden="true" />
                Ingresando…
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

interface CampoDeTextoProps {
  id: string;
  etiqueta: string;
  tipo: 'email' | 'password';
  autocompletar: string;
  placeholder?: string;
  valor: string;
  error: string | undefined;
  soloLectura: boolean;
  refInput: RefObject<HTMLInputElement>;
  onCambio: (valor: string) => void;
}

function CampoDeTexto({
  id,
  etiqueta,
  tipo,
  autocompletar,
  placeholder,
  valor,
  error,
  soloLectura,
  refInput,
  onCambio,
}: CampoDeTextoProps) {
  const idError = `${id}-error`;
  return (
    <div className={error ? `${estilos.campo} ${estilos.campoInvalido}` : estilos.campo}>
      <label htmlFor={id}>{etiqueta}</label>
      <input
        ref={refInput}
        id={id}
        name={id}
        type={tipo}
        autoComplete={autocompletar}
        placeholder={placeholder}
        value={valor}
        readOnly={soloLectura}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? idError : undefined}
        onChange={(evento) => onCambio(evento.target.value)}
      />
      {error && (
        <span className={estilos.ayuda} id={idError}>
          {error}
        </span>
      )}
    </div>
  );
}

interface AvisoProps {
  tipo: 'error' | 'info';
  titulo: string;
  children: ReactNode;
}

/** Aviso de components.html §Mensajes. Los errores se anuncian con role="alert"; la info, con role="status". */
function Aviso({ tipo, titulo, children }: AvisoProps) {
  const esError = tipo === 'error';
  return (
    <div
      className={`${estilos.aviso} ${esError ? estilos.avisoError : estilos.avisoInfo}`}
      role={esError ? 'alert' : 'status'}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        {esError ? (
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-.9 4h1.8v5.2H9.1V6zm0 6.6h1.8v1.8H9.1v-1.8z" />
        ) : (
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.9 12H9.1V8.8h1.8V14zm0-6.6H9.1V5.6h1.8v1.8z" />
        )}
      </svg>
      <div>
        <b>{titulo}</b>
        {children}
      </div>
    </div>
  );
}
