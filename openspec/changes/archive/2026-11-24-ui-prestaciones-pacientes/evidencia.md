# Evidencia C-15 · UI Prestaciones y Pacientes

Fecha: 2026-11-24. Datos ficticios (`@example.com`, DNIs de prueba); ningún JWT se registra en este archivo.

## Entorno

- Docker temporal: `postgres:15`, contenedor `turnos-postgres-manual`, usuario/password `postgres`, base `turnos`, puerto `5432`. Se creó con `docker run -d --name turnos-postgres-manual -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=turnos -p 5432:5432 postgres:15`; `pg_isready` respondió `accepting connections`.
- Backend: `.\mvnw.cmd spring-boot:run` con `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXP_MINUTES=480`, `ADMIN_EMAIL=odontologo@example.com`, `ADMIN_PASSWORD=ClaveDePrueba123`, `FRONTEND_ORIGIN=http://localhost:5173` y `MAIL_ENABLED=false`.
- Frontend: `npm run dev` con `VITE_API_URL=http://localhost:8080/api`.
- Login por UI con `odontologo@example.com` / `ClaveDePrueba123`; sesión válida, token JWT guardado sólo en memoria de la app.
- Cierre: se detuvieron los PIDs `21168` (backend) y `4628` (frontend) y se eliminó el contenedor `turnos-postgres-manual`. No quedaron artefactos del MCP de Playwright en la raíz del repo.

## 5.2 · Prueba manual contra backend local

### Prestaciones

| Acción | Resultado observado | Request |
|---|---|---|
| Abrir `/prestaciones` | Catálogo con activas e inactivas; badges "Activa"/"Inactiva" y acciones "Editar", "Desactivar"/"Activar" | `GET /api/prestaciones` 200 |
| Alta por UI | `Control Ficticio C15`, 20 min, creada | `POST /api/prestaciones` 201, body `{"nombre":"Control Ficticio C15","duracionMinutos":20}` |
| Edición por UI | Duración cambiada a 25 min | `PUT /api/prestaciones/6` 200, body `{"nombre":"Control Ficticio C15","duracionMinutos":25}` |
| Desactivar | Badge pasa a `Inactiva`; no se borra | `PATCH /api/prestaciones/6/activa` 200, body `{"activa":false}` |
| Reactivar | Badge vuelve a `Activa`; respuesta `{"id":6,...,"activa":true}` | `PATCH /api/prestaciones/6/activa` 200, body `{"activa":true}` |
| Nombre duplicado | Mensaje visible: "Ya tenés una prestación con ese nombre. Probá con otro." | `POST /api/prestaciones` 409, error de consola esperado |

### Pacientes

| Acción | Resultado observado | Request |
|---|---|---|
| Alta completa | `Gómez, Patricia`, DNI `32112334` (tipeado `32.112.334`), email `patricia.gomez@example.com`, `OSDE 310 · Nº 4589201`, badge "Acepta recordatorios" | `POST /api/pacientes` 201 |
| Búsqueda con tilde | `gomez` encontró `Gómez, Patricia` (sin tilde en el término) | `GET /api/pacientes?q=gomez&page=0&size=20` 200 |
| Edición de consentimiento | Se desmarcó la casilla; badge "No acepta recordatorios" | `PUT /api/pacientes/{id}` 200 |
| Alta mínima | `Sin Correo C15`, DNI `50000001`, sin email; badge "No recibe recordatorios" y texto "Sin email cargado" | `POST /api/pacientes` 201 |
| DNI duplicado | Mensaje visible: "Ese DNI ya pertenece a otro paciente. Revisalo o buscá al paciente existente." | `POST /api/pacientes` 409, error de consola esperado |
| Baja confirmada | Diálogo "¿Dar de baja a Patricia Gómez?"; al confirmar desaparece de la búsqueda con `No hay pacientes que coincidan con “gomez”.` | `DELETE /api/pacientes/27` 204 |
| Baja lógica en DB | `select id, nombre, apellido, dni, activo from paciente where dni='32112334'` → `27|Patricia|Gómez|32112334|f` | — |

### Paginación

- Se sembraron 21 pacientes ficticios por API con DNIs `40000010`…`40000210` sobre los 5 del seed `dev`.
- Página 1: "Mostrando 1 a 20 de 28 pacientes" / "Página 1 de 2".
- Página 2: "Mostrando 21 a 28 de 28 pacientes" / "Página 2 de 2".
- Request: `GET /api/pacientes?q=&page=1&size=20` → `totalElementos: 28`, `totalPaginas: 2`.
- Tras la baja de Patricia, el listado activo mostró "Mostrando 1 a 20 de 27 pacientes"; el dato dado de baja quedó en DB con `activo=false`.

### Verificación automatizada

- `npm run verify` en `frontend/` → `tsc --noEmit`, 28 archivos de test / 192 tests en verde y `vite build` correcto.
- `cambiarActiva` es el nombre exportado y usado en `api.ts`, `hooks.ts` y `api.test.ts`.
- `openspec validate web-administracion --type spec --strict` → sin errores; 7 warnings de requerimientos largos, heredados del delta aprobado. `openspec validate --archived --strict` marca un error preexistente y ajeno a C-15 en `2026-11-23-prestaciones-catalogo` (3 tareas incompletas).

## 5.3 · Verificación visual

Capturas generadas en `openspec/changes/ui-prestaciones-pacientes/mockups/verify/`:

| Pantalla | Móvil 390x844 | Escritorio 1440x900 |
|---|---|---|
| Prestaciones | `prestaciones-mobile-390x844.png` | `prestaciones-desktop-1440x900.png` |
| Pacientes | `pacientes-mobile-390x844.png` | `pacientes-desktop-1440x900.png` |

Comparación con las cuatro capturas aprobadas en `mockups/`:

- **Sin bloqueantes ni diferencias mayores.** Estructura, encabezados, botones, badges, diálogos, errores por campo, tabla/fichas de prestaciones, lista de pacientes, buscador y paginación coinciden con las maquetas aprobadas y con las decisiones D1–D10 de `design.md`.
- **Minor (datos, no estilo):** los contadores y las filas visibles difieren de los números de ejemplo de la maqueta porque se usan los valores reales de la API (D6). Los diálogos capturados muestran `Nueva prestación` con error de nombre duplicado, `Nuevo paciente` con error de DNI duplicado y `¿Dar de baja a Sin Correo C15?`, todos con datos ficticios.
- **Minor (limitación de inspección):** las capturas se generaron y se abrieron, pero el modelo que ejecutó esta verificación no puede interpretar píxeles. Se validó de forma automatizada el DOM y los estilos computados: fuente `Segoe UI` de `--font-sans`, `--color-brand-600` `#0f766e`, `--color-canvas` `#f6f5f2`, `--color-surface` `#ffffff`, avatar de 40x40, badges con tokens (`rgb(138, 90, 0)` sobre `rgb(251, 236, 203)`), tabla convertida a fichas con `data-label` en móvil, `flex-wrap` en la lista de pacientes y sin desbordamiento horizontal (`scrollWidth` 375 en 390 y 1425 en 1440). La aprobación visual humana de las imágenes queda disponible en las rutas indicadas.

Consola y red durante la verificación (antes del apagado de servicios):

- 2 errores de consola, ambos esperados: `409` en `POST /api/prestaciones` y `409` en `POST /api/pacientes`, provocados a propósito para capturar los estados de error de la maqueta. Sin warnings.
- Requests fallidos: `GET /api/prestaciones` y `GET /api/pacientes?q=&page=0&size=20` con `net::ERR_ABORTED`, esperados por el doble montaje de React Query en desarrollo; cada uno fue seguido por un `200` con los datos.
- Tras detener el backend se cerró el navegador; los errores de conexión posteriores son ruido de teardown y no forman parte de la verificación.

## Hallazgos corregidos durante 5.2

- `PacientesPage.tsx` no mostraba `numeroAfiliado`; se agregó `OSDE 310 · Nº 4589201` al meta del paciente y se actualizó el test correspondiente.
- `PacientesPage.tsx` mostraba un email vacío cuando el paciente no tenía email; se agregó el texto "Sin email cargado" y se actualizó `PacientesPage.test.tsx`.
- `npm run verify` se re-ejecutó completo tras ambos fixes y quedó en verde.
