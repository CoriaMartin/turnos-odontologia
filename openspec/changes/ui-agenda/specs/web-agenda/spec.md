# Spec Delta

## Purpose

Define la pantalla de agenda de la web app: cómo el odontólogo ve sus turnos por día y por semana, navega entre fechas y entiende el estado de cada turno, y qué período le pide a la API.

## ADDED Requirements

### Requirement: Agenda en la ruta de inicio
Con sesión iniciada, la ruta `/` SHALL mostrar la agenda con un título de nivel 1 "Agenda" y el período visible escrito en palabras (por ejemplo "Miércoles 2 de diciembre" o "Semana del 30 de noviembre al 6 de diciembre"). Sin `fecha` en la URL SHALL mostrar el día o la semana de hoy en la zona `America/Argentina/Buenos_Aires`.

#### Scenario: Abrir la agenda sin parámetros
- **WHEN** el usuario con sesión iniciada abre `/` el 2026-12-02 a las 10:00 (hora de Buenos Aires) en una pantalla angosta
- **THEN** ve el título de nivel 1 "Agenda"
- **AND** ve el período "Miércoles 2 de diciembre"

#### Scenario: Hoy según la zona del consultorio
- **WHEN** el usuario abre `/` el 2026-12-03 a las 01:30 UTC (22:30 del 2 de diciembre en Buenos Aires) en una pantalla angosta
- **THEN** la agenda muestra el miércoles 2 de diciembre

### Requirement: Vista por defecto según el ancho de pantalla
Sin `vista` en la URL, la agenda SHALL abrir en la vista diaria en pantallas de menos de 900 px de ancho y en la vista semanal en pantallas más anchas. Un selector "Día" / "Semana" SHALL indicar la vista activa y permitir cambiarla.

#### Scenario: Móvil abre en la vista diaria
- **WHEN** el usuario abre `/` en una pantalla de 390 px de ancho
- **THEN** la vista activa es "Día"

#### Scenario: Escritorio abre en la vista semanal
- **WHEN** el usuario abre `/` en una pantalla de 1440 px de ancho
- **THEN** la vista activa es "Semana"

#### Scenario: Cambiar de vista
- **WHEN** el usuario está en la vista diaria del 2026-12-02 y activa "Semana"
- **THEN** ve la semana del lunes 30 de noviembre al domingo 6 de diciembre
- **AND** la URL contiene `vista=semana`

### Requirement: Fecha y vista en la URL
La agenda SHALL reflejar la fecha y la vista en la URL como `fecha=AAAA-MM-DD` y `vista=dia|semana`, de modo que recargar, compartir el enlace o usar Atrás muestre el mismo período. Una `fecha` o `vista` inválida SHALL ignorarse y usarse el valor por defecto, sin mostrar un error.

#### Scenario: Abrir un día por URL
- **WHEN** el usuario abre `/?fecha=2026-12-10&vista=dia`
- **THEN** ve la vista diaria del jueves 10 de diciembre

#### Scenario: Fecha inválida en la URL
- **WHEN** el usuario abre `/?fecha=2026-13-45&vista=dia` el 2026-12-02
- **THEN** ve la vista diaria del miércoles 2 de diciembre
- **AND** no ve ningún mensaje de error

#### Scenario: Volver atrás después de navegar
- **WHEN** el usuario está en el 2026-12-02, activa "Siguiente" y después usa Atrás del navegador
- **THEN** la agenda vuelve a mostrar el miércoles 2 de diciembre

### Requirement: Navegación entre fechas
La agenda SHALL ofrecer los controles "Anterior", "Hoy" y "Siguiente". En la vista diaria mueven un día; en la semanal, una semana. "Hoy" SHALL llevar al día o la semana actual sin cambiar la vista.

#### Scenario: Día siguiente
- **WHEN** el usuario está en la vista diaria del 2026-12-02 y activa "Siguiente"
- **THEN** ve el jueves 3 de diciembre

#### Scenario: Semana anterior
- **WHEN** el usuario está en la vista semanal del 30 de noviembre y activa "Anterior"
- **THEN** ve la semana del lunes 23 al domingo 29 de noviembre

#### Scenario: Volver a hoy
- **WHEN** el 2026-12-02 el usuario está en la vista diaria del 2026-12-20 y activa "Hoy"
- **THEN** ve el miércoles 2 de diciembre en la vista diaria

### Requirement: Período pedido a la API
La agenda SHALL pedir `GET /api/turnos` con `desde` y `hasta` en ISO-8601 con la zona `-03:00`: para un día, desde las 00:00 de ese día hasta las 00:00 del siguiente; para una semana, desde el lunes 00:00 hasta el lunes siguiente 00:00. SHALL incluir los cancelados (sin `incluirCancelados=false`).

#### Scenario: Rango de la vista diaria
- **WHEN** el usuario abre la vista diaria del 2026-12-02
- **THEN** la web app pide `GET /api/turnos` con `desde=2026-12-02T00:00:00-03:00` y `hasta=2026-12-03T00:00:00-03:00`
- **AND** la solicitud no incluye `incluirCancelados=false`

#### Scenario: Rango de la vista semanal
- **WHEN** el usuario abre la vista semanal que contiene el 2026-12-02
- **THEN** la web app pide `GET /api/turnos` con `desde=2026-11-30T00:00:00-03:00` y `hasta=2026-12-07T00:00:00-03:00`

### Requirement: Línea de tiempo de la vista diaria
La vista diaria SHALL mostrar una línea de tiempo en franjas de 30 minutos de 08:00 a 20:00 y SHALL extenderla, en franjas enteras, para incluir cualquier turno que empiece antes o termine después. Cada turno SHALL ubicarse según su inicio y su duración.

#### Scenario: Día con turnos dentro del horario habitual
- **WHEN** el día tiene un turno de 10:00 a 10:45
- **THEN** la línea de tiempo empieza a las 08:00 y termina a las 20:00
- **AND** el turno ocupa desde la marca de 10:00 hasta la mitad de la franja de 10:30

#### Scenario: Turno fuera del horario habitual
- **WHEN** el día tiene un turno de 07:15 a 07:45
- **THEN** la línea de tiempo empieza a las 07:00 y el turno se ve completo

### Requirement: Vista semanal
La vista semanal SHALL mostrar los siete días de lunes a domingo, cada uno con su encabezado (por ejemplo "Lun 30/11") y sus turnos ordenados por horario, y SHALL destacar el día de hoy si pertenece a la semana.

#### Scenario: Turnos en distintos días
- **WHEN** la semana del 30 de noviembre tiene un turno el lunes a las 09:00 y otro el miércoles a las 11:00
- **THEN** el turno de las 09:00 aparece bajo "Lun 30/11" y el de las 11:00 bajo "Mié 2/12"

#### Scenario: Hoy destacado
- **WHEN** el 2026-12-02 el usuario ve la semana del 30 de noviembre
- **THEN** el día "Mié 2/12" está marcado como el día actual para tecnologías de asistencia (`aria-current="date"`)

### Requirement: Datos visibles de cada turno
Cada turno SHALL mostrar su horario de inicio y fin en formato 24 h (`HH:MM – HH:MM`), el nombre y apellido del paciente, la prestación y un badge de estado. Su nombre accesible SHALL incluir esos cuatro datos.

#### Scenario: Turno programado
- **WHEN** la agenda recibe un turno `PROGRAMADO` de 10:00 a 10:45 de "Paciente Ficticio Tres" con la prestación "Limpieza"
- **THEN** se ve "10:00 – 10:45", "Paciente Ficticio Tres", "Limpieza" y el badge "Programado"

### Requirement: Badge de cada estado
El badge SHALL decir "Programado", "Atendido", "Ausente", "Cancelado" o "Cancelación tardía" según el estado `PROGRAMADO`, `ATENDIDO`, `AUSENTE`, `CANCELADO` o `CANCELADO_TARDIO`, con los colores de estado del sistema de diseño. La pantalla SHALL NOT mostrar los nombres técnicos de los estados.

#### Scenario: Turnos en los cinco estados
- **WHEN** la agenda recibe un turno en cada uno de los cinco estados
- **THEN** se ven los badges "Programado", "Atendido", "Ausente", "Cancelado" y "Cancelación tardía"
- **AND** la pantalla no contiene `CANCELADO_TARDIO` ni `PROGRAMADO`

### Requirement: Cancelados distinguibles que no ocupan el horario
Los turnos `CANCELADO` y `CANCELADO_TARDIO` SHALL verse con un tratamiento propio, distinto del de los turnos activos y que no dependa solo del color. Un cancelado SHALL NOT tapar ni desplazar a un turno activo que comparta su horario (RN-AG-10).

#### Scenario: Cancelado y turno nuevo en el mismo horario
- **WHEN** el día tiene un turno `CANCELADO_TARDIO` de 11:00 a 11:30 y un turno `PROGRAMADO` de 11:00 a 11:30
- **THEN** los dos turnos se ven completos y legibles
- **AND** el turno programado conserva el mismo tamaño que tendría sin el cancelado

#### Scenario: Cancelado marcado más allá del color
- **WHEN** el día tiene un turno `CANCELADO`
- **THEN** el turno muestra el badge "Cancelado" y su horario y paciente se ven tachados

### Requirement: Línea de hora actual
Cuando el período visible incluye el momento actual dentro del horario de la línea de tiempo, la agenda SHALL mostrar una línea de hora actual a la altura que corresponde, con un nombre accesible que indique la hora, y SHALL actualizar su posición al menos una vez por minuto. En otro período SHALL NOT mostrarla.

#### Scenario: Hoy a media mañana
- **WHEN** el 2026-12-02 a las 10:18 el usuario ve la vista diaria del 2026-12-02
- **THEN** ve la línea de hora actual con el nombre "Hora actual: 10:18" entre las marcas de 10:00 y 10:30

#### Scenario: Otro día
- **WHEN** el 2026-12-02 el usuario ve la vista diaria del 2026-12-03
- **THEN** no ve la línea de hora actual

#### Scenario: La línea avanza
- **WHEN** el usuario tiene abierta la vista de hoy a las 10:18 y pasa un minuto
- **THEN** la línea de hora actual indica "Hora actual: 10:19"

### Requirement: Estado de carga
Mientras la agenda del período no llegó, la web app SHALL mostrar el texto "Cargando turnos…" e indicar la región de la agenda como ocupada (`aria-busy="true"`), conservando el encabezado y la navegación.

#### Scenario: Agenda cargando
- **WHEN** el usuario abre la agenda y la API todavía no respondió
- **THEN** ve "Cargando turnos…"
- **AND** la región de la agenda tiene `aria-busy="true"`
- **AND** los controles "Anterior", "Hoy" y "Siguiente" siguen visibles

### Requirement: Período sin turnos
Si la API devuelve una lista vacía, la agenda SHALL mostrar "No hay turnos para este día" en la vista diaria o "No hay turnos esta semana" en la semanal. En la vista diaria la línea de tiempo SHALL seguir visible.

#### Scenario: Día sin turnos
- **WHEN** la API devuelve una lista vacía para la vista diaria del 2026-12-05
- **THEN** ve "No hay turnos para este día"
- **AND** la línea de tiempo de 08:00 a 20:00 sigue visible

#### Scenario: Semana sin turnos
- **WHEN** la API devuelve una lista vacía para la vista semanal
- **THEN** ve "No hay turnos esta semana"

### Requirement: Error al cargar la agenda
Si la consulta falla por un motivo distinto de la sesión vencida, la agenda SHALL anunciar un aviso con el título "No pudimos cargar la agenda", el mensaje para el usuario que el cliente de la API asigna a ese error y un botón "Reintentar" que vuelve a pedir el mismo período. El aviso SHALL NOT contener códigos técnicos ni el estado HTTP.

#### Scenario: Sin conexión
- **WHEN** la solicitud de la agenda falla sin respuesta del servidor
- **THEN** se anuncia el aviso "No pudimos cargar la agenda" con el mensaje que sugiere revisar la conexión
- **AND** el aviso no contiene `SIN_CONEXION`

#### Scenario: Reintentar
- **WHEN** el aviso de error está visible, el usuario activa "Reintentar" y la API responde 200 con turnos
- **THEN** la web app vuelve a pedir el mismo período
- **AND** el aviso desaparece y se ven los turnos

### Requirement: Sesión vencida al consultar la agenda
Si la API responde 401 a la consulta de la agenda, la web app SHALL aplicar el comportamiento de sesión vencida de `web-sesion` y SHALL NOT mostrar el aviso de error de la agenda.

#### Scenario: Token rechazado al cargar la agenda
- **WHEN** con sesión iniciada la consulta de la agenda responde 401 con `codigo` `NO_AUTENTICADO`
- **THEN** la web app muestra la página de inicio de sesión con el aviso "Tu sesión venció"
- **AND** al volver a ingresar, regresa a la agenda que estaba viendo
