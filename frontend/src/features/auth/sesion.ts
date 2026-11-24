import { useSyncExternalStore } from 'react';
import { configurarProveedorToken } from '../../shared/api/cliente';

/**
 * Sesión del odontólogo, guardada SOLO en la memoria de la página (spec web-sesion, design.md D1).
 * Nunca se escribe en localStorage, sessionStorage, cookies ni la URL: al recargar, la sesión se pierde.
 */

/** Por qué se cerró la última sesión: el login muestra el aviso de sesión vencida solo con `'vencida'`. */
export type MotivoCierre = 'vencida' | 'manual';

interface SesionActiva {
  token: string;
  /** Vencimiento en milisegundos desde epoch. */
  expiraEnMs: number;
}

export interface EstadoSesion {
  sesion: SesionActiva | null;
  motivoCierre: MotivoCierre | null;
}

const ESTADO_INICIAL: EstadoSesion = { sesion: null, motivoCierre: null };

let estado: EstadoSesion = ESTADO_INICIAL;
const oyentes = new Set<() => void>();

function cambiarEstado(nuevo: EstadoSesion): void {
  estado = nuevo;
  oyentes.forEach((oyente) => oyente());
}

/**
 * Inicia la sesión con el token del login. `expiraEn` es la fecha ISO-8601 que devuelve la API;
 * si no se puede interpretar, el token se considera vencido (falla segura).
 */
export function iniciarSesion(token: string, expiraEn: string): void {
  const expiraEnMs = Date.parse(expiraEn);
  cambiarEstado({
    sesion: { token, expiraEnMs: Number.isNaN(expiraEnMs) ? 0 : expiraEnMs },
    motivoCierre: null,
  });
}

/** Descarta el token. Con `'vencida'` solo actúa si había una sesión (un 401 sin sesión no es vencimiento). */
export function cerrarSesion(motivo: MotivoCierre): void {
  if (motivo === 'vencida' && estado.sesion === null) return;
  cambiarEstado({ sesion: null, motivoCierre: motivo });
}

export function haySesion(): boolean {
  return estado.sesion !== null;
}

/**
 * Token para enviar a la API, o `null` si no hay sesión. Si el token ya venció,
 * cierra la sesión como vencida y devuelve `null` (design.md D2).
 */
export function tokenVigente(): string | null {
  const { sesion } = estado;
  if (sesion === null) return null;
  if (Date.now() >= sesion.expiraEnMs) {
    cerrarSesion('vencida');
    return null;
  }
  return sesion.token;
}

export function suscribir(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

function leerEstado(): EstadoSesion {
  return estado;
}

/** Estado de la sesión para componentes de React; se vuelve a renderizar al iniciar o cerrar sesión. */
export function useSesion(): EstadoSesion {
  return useSyncExternalStore(suscribir, leerEstado, leerEstado);
}

/** Conecta la sesión con el cliente HTTP (punto de extensión de C-02). Se llama una vez al arrancar. */
export function conectarSesionConApi(): void {
  configurarProveedorToken(tokenVigente);
}

/** Solo para tests: vuelve al estado inicial, sin sesión ni motivo de cierre. */
export function reiniciarSesion(): void {
  cambiarEstado(ESTADO_INICIAL);
}
