# Tasks

> **Gate de diseño ya aprobado.** La maqueta de Ludmi está en `mockups/` con `Approval: approved (2026-11-23, by usuario)` y cuatro capturas renderizadas (390x844 y 1440x900). No se pide una nueva aprobación: `design.md` → `### UI Mockups` registra revisión 2, decisión, aprobación y preview. Si el apply cambiara el listado, los campos del formulario o el diálogo de baja, primero se actualizan spec y design con `openspec-update-change`; no se cambia una maqueta aprobada en silencio.

## 0. Gate de diseño

- [x] 0.1 Confirmar maqueta aprobada y revisar `mockups/prestaciones.html`, `mockups/pacientes.html`, `mockups/layout.css` y las cuatro capturas; las diferencias admitidas (`components.html` §Pacientes, colores sueltos, contador de pacientes) ya están en design D1, D6 y D9

## 1. Tipos, API y hooks

- [x] 1.1 Crear `src/features/prestaciones/tipos.ts` y `api.ts` con `Prestacion`, `listarPrestaciones`, `crearPrestacion`, `editarPrestacion` y `cambiarActiva` sobre `apiFetch`, más la clave `['prestaciones']`; verificar con `api.test.ts` los escenarios "Alta válida de una prestación", "Editar una prestación inactiva", "Desactivar sin borrar" y "Reactivar" (URLs, cuerpo JSON y `PATCH /{id}/activa`)
- [x] 1.2 Crear `src/features/pacientes/tipos.ts`, `dni.ts` (`formatearDni` y `soloDigitos`) y `api.ts` con `Paciente`, `PaginaPacientes`, `buscarPacientes`, `crearPaciente`, `editarPaciente` y `darDeBajaPaciente`, más la clave `['pacientes', q, pagina]`; verificar con `api.test.ts` y `dni.test.ts` "Buscar por apellido sin tildes", "Buscar por DNI", "Ir a la página siguiente", "Alta con datos mínimos" y "DNI escrito con puntos"
- [x] 1.3 Crear los hooks de `useQuery`/`useMutation` de ambos features con invalidación de `['prestaciones']`, `['pacientes']` y `['turnos']` según design D2; verificar con `hooks.test.tsx` que una mutación exitosa refresca el listado y que un 401 no dispara el aviso local

## 2. Pantalla de prestaciones

- [x] 2.1 Crear `PrestacionesPage` con encabezado "Catálogo de prestaciones", botón "+ Nueva prestación", tabla semántica y fichas apiladas bajo 900 px; verificar con `PrestacionesPage.test.tsx` "Abrir el catálogo de prestaciones", "Catálogo con prestaciones activas e inactivas", "Catálogo en móvil" y "Catálogo vacío"
- [x] 2.2 Crear `FormularioPrestacion` con nombre y duración, validación 5–480, errores por campo y mapeo de `NOMBRE_DUPLICADO`; verificar "Alta válida de una prestación", "Editar una prestación inactiva", "Nombre ya existente", "Duración fuera del rango", "Cancelar el diálogo" y "Error sin código técnico"
- [x] 2.3 Conectar "Activar"/"Desactivar" con `cambiarActiva`, botón deshabilitado durante la mutación y aviso legible si falla; verificar "Desactivar sin borrar", "Reactivar" y "Fallo al cambiar el estado"
- [x] 2.4 Estados de carga y error de la pantalla con "Reintentar"; verificar "Cargando prestaciones" y "Error al cargar prestaciones con reintento"

## 3. Pantalla de pacientes

- [x] 3.1 Crear `PacientesPage` con búsqueda `role="search"`, `q` y `page` en la URL, paginación y contador derivado de la respuesta; verificar con `PacientesPage.test.tsx` "Abrir pacientes", "Buscar por apellido sin tildes", "Buscar por DNI", "Ir a la página siguiente", "Volver atrás tras buscar" y "Sin resultados"
- [x] 3.2 Crear el listado con avatar, "Apellido, Nombre", DNI formateado, obra social, email y los tres badges de consentimiento; verificar "Paciente con consentimiento y obra social", "Paciente sin email" y "Paciente que no acepta recordatorios"
- [x] 3.3 Crear `FormularioPaciente` con todos los campos de la maqueta, casilla de recordatorios, DNI sin puntos, campos opcionales en `null` y errores por campo (`DNI_DUPLICADO`, email inválido); verificar "Alta con datos mínimos", "DNI escrito con puntos", "Edición del consentimiento", "DNI ya usado por otro paciente", "Email mal formado" y "Campo inválido anunciado"
- [x] 3.4 Crear `DialogoBajaPaciente` con advertencia de baja lógica, confirmación y manejo de 409; verificar "Baja confirmada", "Baja bloqueada por turnos futuros" y "Cancelar la confirmación", incluido "Diálogo con nombre accesible"
- [x] 3.5 Estados de carga, error y reintento de pacientes; verificar "Error al cargar con reintento"

## 4. Navegación, shell y estilos

- [x] 4.1 Ampliar `app/AppLayout.tsx` con `NavLink` a "/", "/prestaciones" y "/pacientes" (segunda línea en móvil) y `app/router.tsx` con las dos rutas protegidas; verificar "Navegar entre secciones" y actualizar `AppLayout.test.tsx` y `paginas.test.tsx` para los nuevos enlaces sin romper `web-app-shell`
- [x] 4.2 Escribir los CSS Modules con sólo `var(--…)` (D9), incluidos tabla/fichas, diálogos, alertas y estados sin captura (D10); ampliar `app/estilos.test.ts` y verificar en verde "Campo inválido anunciado" y "Diálogo con nombre accesible"
- [x] 4.3 Agregar en `shared/api/mensajes.ts` los textos de `NOMBRE_DUPLICADO`, `DNI_DUPLICADO` y `PACIENTE_CON_TURNOS_FUTUROS`, sin exponer códigos; verificar "Error sin código técnico" y "Baja bloqueada por turnos futuros" en `mensajes.test.ts`
- [x] 4.4 Verificar en `sesionEnLaApp.test.tsx` "Ruta protegida sin sesión", "Token rechazado al cargar" y la variante de prestaciones: 401 → login con "Tu sesión venció" y vuelta a la ruta original

## 5. Verificación integral

- [x] 5.1 Correr `npm run verify` en `frontend/` (typecheck, Vitest y build); verificar todo en verde, un test por cada escenario de `specs/web-administracion/spec.md` y ningún test de `web-app-shell`, `web-api-client` o `web-sesion` roto
- [x] 5.2 Prueba manual contra el backend local (`./mvnw spring-boot:run` + `npm run dev`) con prestaciones activas/inactivas y pacientes ficticios: alta, edición, cambio de estado, búsqueda con tildes, paginación, consentimiento y baja; registrar los resultados en el PR sin datos reales (RN-DS-01)
- [x] 5.3 Verificación visual: capturar las dos pantallas a 390x844 y 1440x900 en `mockups/verify/`, comparar con las cuatro capturas aprobadas, revisar consola y requests fallidos y completar `Visual verify:` en `design.md` con diferencias por prioridad, pantalla y viewport

## Workflow follow-up

- Marcar `[x]` C-15 en `CHANGES.md` en el mismo PR que cierra el change.
- Archivar el change tras la revisión del PR.
