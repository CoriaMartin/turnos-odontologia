# Tasks

> **Bloqueo: no hay apply sin maqueta aprobada por el líder.** La maqueta está a cargo de Ludmi y todavía no existe (ver `design.md` → `### UI Mockups`). Antes de la tarea 1.1 tiene que estar en `mockups/` con su README en `Approval: approved (<fecha>, by líder)` y el mismo estado registrado en `design.md`. Si la maqueta cambia D2 (vista por defecto) o D6 (cancelados), primero se actualizan spec y design con `openspec-update-change`. Criterio de aceptación visual: las capturas aprobadas de `mockups/previews/`.

## 0. Gate de diseño

- [x] 0.1 Confirmar que la maqueta de Ludmi está aprobada (en el equipo cada integrante aprueba su propia parte: `Approval: approved (2026-11-23, by Ludmi)` en `mockups/README.md` y `design.md`). Capturas recibidas: diaria 390x844 y 1440x900, semanal 1440x900; los estados sin captura (cargando, semanal en móvil, día sin turnos, error) se resuelven según design D11

## 1. Fechas y período

- [x] 1.1 Crear `src/features/agenda/fechas.ts` (D3): hoy en la zona del consultorio, lunes de la semana, sumar días/semanas, parseo y validación de `AAAA-MM-DD`, `desde`/`hasta` con `-03:00` y los textos del período y de los días; verificar con `fechas.test.ts` los escenarios "Hoy según la zona del consultorio", "Rango de la vista diaria", "Rango de la vista semanal" y los textos "Miércoles 2 de diciembre" y "Lun 30/11"
- [x] 1.2 Crear `src/features/agenda/lineaDeTiempo.ts` (D5): rango 08:00–20:00 extendido a franjas enteras, posición y altura en franjas, recorte de turnos que cruzan la medianoche y separación activos/cancelados; verificar con `lineaDeTiempo.test.ts` "Día con turnos dentro del horario habitual" y "Turno fuera del horario habitual"

## 2. Consulta a la API

- [x] 2.1 Crear `src/features/agenda/api.ts` con el tipo `TurnoAgenda`, `consultarAgenda` sobre `apiFetch` y `useAgenda` con `useQuery` y la clave `['turnos', 'agenda', desde, hasta]` (D4); verificar con `api.test.ts` que la URL lleva `desde` y `hasta` codificados y no lleva `incluirCancelados=false`

## 3. Pantalla de agenda

- [x] 3.1 Crear `AgendaPage` con encabezado (título "Agenda", período, Anterior/Hoy/Siguiente, selector Día/Semana) y estado en la URL (D2); montarla como ruta índice en `router.tsx` y borrar `InicioPage` (D1); verificar con `AgendaPage.test.tsx` "Abrir la agenda sin parámetros", "Móvil abre en la vista diaria", "Escritorio abre en la vista semanal", "Cambiar de vista", "Abrir un día por URL", "Fecha inválida en la URL", "Volver atrás después de navegar", "Día siguiente", "Semana anterior" y "Volver a hoy"
- [x] 3.2 Crear la vista diaria y el componente de turno según la maqueta aprobada (solo `var(--…)`, D8, D9); verificar "Turno programado", "Turnos en los cinco estados", "Cancelado y turno nuevo en el mismo horario" y "Cancelado marcado más allá del color", más `estilos.test.ts` en verde
- [x] 3.3 Crear la vista semanal según la maqueta aprobada; verificar "Turnos en distintos días" y "Hoy destacado"
- [x] 3.4 Crear `useAhora` y la línea de hora actual (D7); verificar con timers falsos "Hoy a media mañana", "Otro día" y "La línea avanza"
- [x] 3.5 Estados de carga, vacío y error con "Reintentar" usando `mensajeDeError`; verificar "Agenda cargando", "Día sin turnos", "Semana sin turnos", "Sin conexión" y "Reintentar"
- [x] 3.6 Verificar en `sesionEnLaApp.test.tsx` "Token rechazado al cargar la agenda": 401 en la consulta → login con "Tu sesión venció" y, tras ingresar, vuelta a la misma `fecha`/`vista`
- [x] 3.7 Actualizar `paginas.test.tsx` y `AppLayout.test.tsx` (de "Inicio" a "Agenda", delta de `web-app-shell`) y escribir `src/features/agenda/README.md` con piezas, flujo de datos y decisiones de fechas; verificar que los tests de `web-app-shell` siguen en verde y que el README menciona la zona horaria y la clave de consulta

## 4. Verificación integral

- [x] 4.1 Correr `npm run verify` en `frontend/`; verificar todo en verde y un test por cada escenario de `specs/web-agenda` y del delta de `specs/web-app-shell`
- [x] 4.2 Prueba manual contra el backend local (`./mvnw spring-boot:run` + `npm run dev`) con turnos en los cinco estados; registrar resultados en `evidencia.md`
- [x] 4.3 Verificación visual: capturar cada estado de la maqueta a 390x844 y 1440x900 en `mockups/verify/`, comparar con la maqueta aprobada, revisar consola y red, y completar `Preview:` y `Visual verify:` en `design.md`

## Workflow follow-up

- Marcar `[x]` C-16 en `CHANGES.md` en el mismo PR que cierra el change.
- Archivar el change tras la revisión del PR.
