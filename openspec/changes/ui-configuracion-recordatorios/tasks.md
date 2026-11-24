# Tasks

> Gate: no arrancar el apply hasta que el líder apruebe la maqueta ([mockups/README.md](mockups/README.md), `Approval: approved`). Criterio de aceptación visual: las capturas de [mockups/previews/](mockups/previews/).

## 1. Sesión y configuración en memoria

- [ ] 1.1 Crear `src/features/configuracion/store.ts` (D1, D2): `cargarConfiguracion`, `guardarConfiguracion(motivo)`, `datosVálidos()`, `useConfiguracion()` y el motivo del último error; reiniciarlo en `afterEach` de `src/test/setup.ts`; verificar con `store.test.ts` que los valores se cargan del backend al iniciar y que no se escribe en `localStorage`/`sessionStorage`
- [ ] 1.2 Conectar `configurarProveedorToken(tokenVigente)` en `main.tsx` y en `renderConRutas`; verificar con un test que una solicitud con configuración incluye `Authorization: Bearer <token>` y sin configuración no lo incluye (escenarios "Cargar configuración exitosa" y "Configuración vacía antes de la solicitud")

## 2. Pantalla de configuración

- [ ] 2.1 Crear `ConfiguracionPage` + `ConfiguracionPage.module.css` según la maqueta aprobada (solo `var(--…)`, D5); verificar con `ConfiguracionPage.test.tsx` los escenarios "Abrir el configurador sin sesión", "Mostrar valores por defecto", "Envío con campos válidos", "Horas inválidas (cancelación -1)", "Horas inválidas (recordatorio 0)", "Guardando en curso", "Guardado exitoso" y "Sin conexión al guardar", más `estilos.test.ts` en verde
- [ ] 2.2 Redirección tras el guardado a `state.desde ?? '/configuracion'` y de `/configuracion` a `/` con sesión; verificar los escenarios "Guardado exitoso", "Volver a la ruta pedida", "Abrir el configurador con sesión iniciada" e "Guardado sin persistir los valores"

## 3. Rutas protegidas y estado del turno

- [ ] 3.1 Crear la integración del estado del recordatorio en `DetalleTurno` (D4); verificar los escenarios "Turno con email y consentido → pendiente", "Turno con email y ya enviado → enviado", "Turno sin email → no aplica", "Turno con email y no consentido → no consentido"
- [ ] 3.2 Registrar `onError` de 401 en `QueryCache` y `MutationCache` (heredado de C-14); verificar "La API rechaza el token" (aviso de sesión vencida y caché vacía) y "El 401 del login no es configuración vencida"
- [ ] 3.3 Agregar "Configuración" a `AppLayout` (D2); verificar "Barra presente en el configurador", "Login sin barra superior" y "Región principal en el configurador"

## 4. Verificación integral

- [ ] 4.1 Correr `npm run verify` en `frontend/` (typecheck + test + build); verificar todo en verde y un test por cada escenario de `specs/web-configuracion-recordatorios`
- [ ] 4.2 Prueba manual contra el backend local (`./mvnw spring-boot:run` + `npm run dev`): configurar horas ok, horas inválidas, estados de recordatorio en el detalle, registrar resultados en `evidencia.md`
- [ ] 4.3 Verificación visual: capturar `/configuracion` (vacío, formulario, error, guardando, guardado exitoso, inicio con sesión y "Configuración" en la barra) a 390x844 y 1440x900 en `mockups/verify/`, comparar con la maqueta, revisar consola y red, y completar `Visual verify:` en `design.md`

## Workflow follow-up

- Marcar `[x]` C-18 en `CHANGES.md` en el mismo PR que cierra el change.
- Archivar el change tras la revisión del PR.