# Evidencia — C-14 `ui-login`

## 4.1 Verificación automática (2026-11-23)

`npm run verify` en `frontend/`: typecheck sin errores, **75 tests en verde** (12 archivos; la base antes del change tenía 34) y build correcto.

| Escenario de la spec | Test |
|---|---|
| web-sesion · Abrir el login sin sesión / con sesión iniciada | `features/auth/LoginPage.test.tsx` |
| web-sesion · Ingreso exitoso / Volver a la ruta pedida | `LoginPage.test.tsx`, `sesion.test.ts` |
| web-sesion · Ingreso sin persistir el token / Recarga de la página | `LoginPage.test.tsx`, `sesion.test.ts`, `RutaProtegida.test.tsx` |
| web-sesion · Ingreso en curso / Envío con campos vacíos | `LoginPage.test.tsx` |
| web-sesion · Credenciales inválidas / Login bloqueado / Sin conexión al ingresar | `LoginPage.test.tsx`, `shared/api/mensajes.test.ts` |
| web-sesion · Inicio sin sesión / Ruta inexistente sin sesión | `RutaProtegida.test.tsx` |
| web-sesion · La API rechaza el token / Token vencido antes de la solicitud | `sesionEnLaApp.test.tsx`, `sesion.test.ts` |
| web-sesion · El 401 del login no es sesión vencida | `LoginPage.test.tsx`, `sesion.test.ts` |
| web-sesion · Cerrar sesión / Volver atrás después de cerrar sesión | `sesionEnLaApp.test.tsx`, `sesion.test.ts` |
| web-app-shell · Barra superior (3 escenarios) / Área de contenido (2) | `app/AppLayout.test.tsx` |
| web-app-shell · Inicio sin agenda / Ruta inexistente / Volver al inicio | `pages/paginas.test.tsx` |

## 4.3 Verificación visual (2026-11-23)

Playwright contra `npm run dev` (Vite, puerto 5173). `/api/auth/login` simulado con `page.route` (200, 401, 429 y una respuesta que no llega nunca), porque el backend no estaba levantado. La sesión vencida se provocó llamando a `cerrarSesion('vencida')` desde el mismo módulo que usa la app. Capturas en [mockups/verify/](mockups/verify/), comparadas con [mockups/previews/](mockups/previews/).

| Estado | Móvil 390x844 | Escritorio 1440x900 |
|---|---|---|
| Login vacío | coincide | coincide |
| Campos incompletos | coincide (tras la corrección del borde) | coincide |
| Error de credenciales | coincide | coincide |
| Bloqueo (429) | coincide (tras vaciar la contraseña) | coincide |
| Cargando | coincide | coincide |
| Sesión vencida | coincide | coincide |
| Inicio con sesión | barra coincide; caja vacía de C-02 (menor) | barra coincide; márgenes y caja de C-02 (menor) |

Otras comprobaciones:
- `/` sin sesión redirige a `/login`.
- Tras el login no hay nada en `localStorage`, `sessionStorage` ni cookies, y el token no aparece en la URL.
- Foco en el primer campo con error.
- `aria-busy="true"` y campos de solo lectura mientras carga.

Consola: sin errores ni avisos propios de la app. Los únicos registros son los que el navegador emite ante los 401 y 429 simulados, y dos `ERR_CONNECTION_REFUSED` de la solicitud colgada de "cargando", que siguió hacia el backend apagado al quitar la simulación. Red: ningún recurso estático falló.

## 4.2 Prueba manual contra el backend local (2026-11-23) — OK

Corrida por Agus contra el backend real (`./mvnw spring-boot:run` en `backend/` con su `.env` + `npm run dev` en `frontend/`), con el usuario inicial. Los 6 puntos del checklist pasaron:

- [x] Login con las credenciales correctas → muestra Inicio con "Cerrar sesión".
- [x] Contraseña incorrecta → "No pudimos iniciar sesión", contraseña vacía.
- [x] 6 intentos fallidos seguidos con el mismo email → "Ingreso bloqueado por 15 minutos" (aunque la contraseña sea correcta).
- [x] "Cerrar sesión" → vuelve a `/login` sin aviso.
- [x] Ingresar y recargar (F5) → vuelve a `/login`; DevTools › Application: ni Local/Session Storage ni Cookies contienen el token.
- [x] Con DevTools › Network, una solicitud con sesión lleva `Authorization: Bearer …`.
