# Proposal

## Why

El odontólogo todavía no puede ver sus turnos: la ruta `/` muestra un inicio provisorio que dice que la agenda no está disponible. C-08 ya expone `GET /api/turnos?desde=&hasta=` y C-14 dejó la sesión y el manejo de 401 resueltos, así que falta la pantalla que cumple US-031 ("ver mi agenda por día y por semana") y sobre la que C-17 va a montar las acciones de gestión de turnos.

## What Changes

- La ruta `/` pasa a mostrar la agenda en lugar del inicio provisorio. **BREAKING** (solo para la spec `web-app-shell`: se retira el requisito del inicio provisorio).
- Vista diaria con línea de tiempo en franjas de 30 minutos y vista semanal (lunes a domingo), con navegación "Anterior", "Hoy" y "Siguiente". La fecha y la vista viven en la URL (`/?fecha=AAAA-MM-DD&vista=dia|semana`) para que el botón Atrás y los enlaces funcionen.
- Cada turno muestra horario, paciente, prestación y un badge con su estado (Programado, Atendido, Ausente, Cancelado, Cancelación tardía). Los cancelados tienen un tratamiento visual propio y no tapan a un turno activo en el mismo horario (US-031, RN-AG-10).
- Línea de hora actual cuando el período visible incluye el momento presente.
- Estados de carga, día o semana sin turnos y error al cargar con opción de reintentar; mensajes en español rioplatense sin códigos técnicos.
- Responsive: en pantallas angostas la vista por defecto es la diaria.
- Los datos se piden con TanStack Query (`useQuery`) sobre `apiFetch`, según la convención de C-14, para que un 401 cierre la sesión como vencida.
- Fuera de alcance: crear, reprogramar, cancelar o marcar asistencia (C-17); filtro de cancelados en la UI; vista por sillón o profesional (el MVP tiene uno de cada uno).

## Capabilities

### New Capabilities
- `web-agenda`: pantalla de agenda de la web app: vistas diaria y semanal, navegación por fechas, presentación de turnos y estados, hora actual, estados de carga/vacío/error y período que se pide a la API.

### Modified Capabilities
- `web-app-shell`: se retira el requisito "Página de inicio provisoria"; la ruta `/` pasa a ser la agenda definida en `web-agenda`.

## Impact

- **Frontend**: nueva implementación en `frontend/src/features/agenda/` (API, hook de consulta, utilidades de fechas en la zona del consultorio, componentes de vista diaria y semanal); `router.tsx` monta la agenda en `/`; se elimina `InicioPage` y se actualizan los tests que la usaban (`paginas.test.tsx`, `AppLayout.test.tsx`, `sesionEnLaApp.test.tsx` si corresponde).
- **API**: solo consume `GET /api/turnos` de C-08; no hay cambios de backend.
- **Dependencias**: ninguna nueva. Fechas con `Intl.DateTimeFormat` y la zona `America/Argentina/Buenos_Aires` (RN-GL-01).
- **Diseño**: requiere maqueta aprobada por el líder antes del apply (política `system-and-mockups`); la maqueta está a cargo de Ludmi y todavía no existe.
- **Downstream**: C-17 reutiliza esta pantalla para las acciones sobre turnos.
