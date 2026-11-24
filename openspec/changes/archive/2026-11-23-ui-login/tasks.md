# Tasks

> Gate: no arrancar el apply hasta que el líder apruebe la maqueta ([mockups/README.md](mockups/README.md), `Approval: approved`). Criterio de aceptación visual: las capturas de [mockups/previews/](mockups/previews/).

## 1. Sesión en memoria

- [x] 1.1 Crear `src/features/auth/sesion.ts` (D1, D2): `iniciarSesion`, `cerrarSesion(motivo)`, `tokenVigente()`, `suscribir`, `useSesion()` y el motivo del último cierre; reiniciarlo en `afterEach` de `src/test/setup.ts`; verificar con `sesion.test.ts` que el token vencido devuelve `null` y marca motivo `'vencida'`, y que nunca se escribe en `localStorage`/`sessionStorage`
- [x] 1.2 Conectar `configurarProveedorToken(tokenVigente)` en `main.tsx` y en `renderConRutas`; verificar con un test que una solicitud con sesión incluye `Authorization: Bearer <token>` y sin sesión no lo incluye (escenarios "Ingreso exitoso" y "Token vencido antes de la solicitud")

## 2. Login

- [x] 2.1 Crear `src/features/auth/api.ts` con `login(email, password)` sobre `apiFetch` y sumar `CREDENCIALES_INVALIDAS` y `LOGIN_BLOQUEADO` a `MENSAJES_POR_CODIGO`; verificar con `mensajes.test.ts` los textos de la spec y que no contienen el código
- [x] 2.2 Crear `LoginPage` + `LoginPage.module.css` según la maqueta aprobada (solo `var(--…)`, D7); verificar con `LoginPage.test.tsx` los escenarios "Abrir el login sin sesión", "Envío con campos vacíos", "Ingreso en curso", "Credenciales inválidas", "Login bloqueado" y "Sin conexión al ingresar", más `estilos.test.ts` en verde
- [x] 2.3 Redirección tras el login a `state.desde ?? '/'` y de `/login` a `/` con sesión; verificar los escenarios "Ingreso exitoso", "Volver a la ruta pedida", "Abrir el login con sesión iniciada" e "Ingreso sin persistir el token"

## 3. Rutas protegidas y cierre de sesión

- [x] 3.1 Crear `RutaProtegida` y reorganizar `router.tsx` (D4); verificar los escenarios "Inicio sin sesión", "Ruta inexistente sin sesión", "Recarga de la página" y actualizar `paginas.test.tsx`/`AppLayout.test.tsx` para que inicien sesión antes de los escenarios de `web-app-shell`
- [x] 3.2 Registrar `onError` de 401 en `QueryCache` y `MutationCache` (D3); verificar "La API rechaza el token" (aviso de sesión vencida y caché vacía) y "El 401 del login no es sesión vencida"
- [x] 3.3 Agregar "Cerrar sesión" a `AppLayout` (D5); verificar "Cerrar sesión", "Volver atrás después de cerrar sesión", "Página de inicio con la marca", "Barra presente en una ruta inexistente", "Login sin barra superior" y "Región principal en el login"
- [x] 3.4 Actualizar `src/features/auth/README.md` con el flujo de sesión y la convención "toda llamada a la API pasa por TanStack Query"; verificar que el README menciona `tokenVigente`, `RutaProtegida` y el manejo de 401

## 4. Verificación integral

- [x] 4.1 Correr `npm run verify` en `frontend/` (typecheck + test + build; el proyecto no tiene script `lint`); verificar todo en verde y un test por cada escenario de `specs/web-sesion` y `specs/web-app-shell`
- [x] 4.2 Prueba manual contra el backend local (`./mvnw spring-boot:run` + `npm run dev`): login ok, credenciales inválidas, 6 intentos fallidos → bloqueo, cerrar sesión, token borrado de memoria al recargar; registrar resultados en `evidencia.md`
- [x] 4.3 Verificación visual: capturar `/login` (vacío, error, bloqueo, cargando, campos incompletos, sesión vencida) e inicio con sesión a 390x844 y 1440x900 en `mockups/verify/`, comparar con la maqueta, revisar consola y red, y completar `Visual verify:` en `design.md`

## Workflow follow-up

- Marcar `[x]` C-14 en `CHANGES.md` en el mismo PR que cierra el change.
- Archivar el change tras la revisión del PR.
