# Spec Delta

## Purpose

Define cómo el odontólogo crea, reprograma, cancela y registra la asistencia de los turnos desde la agenda de la web app, qué acciones ofrece cada estado y cómo se le explican los rechazos de las reglas de agenda.

## ADDED Requirements

### Requirement: Abrir el diálogo "Nuevo turno"
La agenda SHALL ofrecer un botón "+ Turno" que abre el diálogo "Nuevo turno" con el día visible precargado. Activar una franja libre futura de la vista diaria SHALL abrir el mismo diálogo con ese día y esa hora precargados. Una franja que ya pasó SHALL NOT abrir el diálogo.

#### Scenario: Desde el botón
- **WHEN** el 2026-12-01 a las 09:00 el usuario está en la vista diaria del 2026-12-03 y activa "+ Turno"
- **THEN** se abre un diálogo con el título "Nuevo turno" y el día 03/12/2026 precargado

#### Scenario: Desde una franja libre
- **WHEN** el 2026-12-01 a las 09:00 el usuario activa la franja libre de las 11:30 del 2026-12-01
- **THEN** se abre "Nuevo turno" con el día 01/12/2026 y la hora 11:30 precargados

#### Scenario: Franja pasada
- **WHEN** el 2026-12-01 a las 09:00 el usuario intenta activar la franja de las 08:00 de ese día
- **THEN** no se abre ningún diálogo

### Requirement: Búsqueda de paciente en el diálogo
El campo "Paciente" SHALL buscar con `GET /api/pacientes?q=` a partir de 2 caracteres, mostrar los pacientes activos con apellido, nombre y DNI, y permitir elegir uno. Sin coincidencias SHALL decir "No hay pacientes que coincidan con “<texto>”".

#### Scenario: Elegir un paciente
- **WHEN** el usuario escribe "fict" en "Paciente" y la API devuelve "Ficticio Tres, Paciente"
- **THEN** ve la opción "Ficticio Tres, Paciente" con su DNI
- **AND** al elegirla queda seleccionada en el campo

#### Scenario: Menos de dos caracteres
- **WHEN** el usuario escribe "f" en "Paciente"
- **THEN** no se pide `GET /api/pacientes`

#### Scenario: Sin coincidencias
- **WHEN** la búsqueda "zzz" devuelve una lista vacía
- **THEN** el usuario ve "No hay pacientes que coincidan con “zzz”"

### Requirement: Prestación y duración sugerida
El campo "Prestación" SHALL listar solo las prestaciones activas. Al elegir una, "Duración (min)" SHALL completarse con su duración y SHALL poder editarse. El diálogo SHALL mostrar en todo momento la hora de fin ("Termina HH:MM") calculada con la hora y la duración.

#### Scenario: Duración sugerida y hora de fin
- **WHEN** el usuario elige "Limpieza" (45 minutos) con hora 10:00
- **THEN** "Duración (min)" vale 45 y el diálogo muestra "Termina 10:45"

#### Scenario: Duración editada
- **WHEN** con "Limpieza" a las 10:00 el usuario cambia la duración a 60
- **THEN** el diálogo muestra "Termina 11:00"

#### Scenario: Prestaciones inactivas ocultas
- **WHEN** `GET /api/prestaciones` devuelve "Limpieza" activa y "Blanqueamiento" inactiva
- **THEN** "Prestación" ofrece "Limpieza" y no ofrece "Blanqueamiento"

### Requirement: Validación del formulario antes de enviar
El diálogo SHALL NOT llamar a la API si falta paciente, prestación, día u hora, si la duración no está entre 5 y 480 o si el inicio ya pasó. Cada campo con error SHALL mostrar su mensaje asociado y el foco SHALL ir al primero.

#### Scenario: Campos vacíos
- **WHEN** el usuario activa "Crear turno" sin paciente ni prestación
- **THEN** no se envía ninguna solicitud
- **AND** "Paciente" muestra "Elegí un paciente" y "Prestación" muestra "Elegí una prestación"

#### Scenario: Día en el pasado
- **WHEN** el 2026-12-01 a las 09:00 el usuario completa el día 20/11/2026 y activa "Crear turno"
- **THEN** no se envía ninguna solicitud
- **AND** "Día" muestra "No se pueden dar turnos en el pasado."

#### Scenario: Duración fuera de rango
- **WHEN** el usuario completa la duración 500 y activa "Crear turno"
- **THEN** "Duración (min)" muestra "La duración tiene que estar entre 5 y 480 minutos."

### Requirement: Crear el turno
Al confirmar, la web app SHALL enviar `POST /api/turnos` con `pacienteId`, `prestacionId`, `inicio` (ISO-8601 con zona `-03:00`) y `duracionMinutos`. Si responde 201 SHALL cerrar el diálogo, anunciar "Turno creado" con día y hora, volver a pedir la agenda y mostrar el día del turno nuevo.

#### Scenario: Creación exitosa
- **WHEN** el usuario crea un turno para "Ficticio Tres, Paciente" con "Limpieza" el 03/12/2026 a las 10:00 y la API responde 201
- **THEN** la solicitud lleva `inicio` `2026-12-03T10:00:00-03:00` y `duracionMinutos` 45
- **AND** se anuncia "Turno creado" con el texto "Jueves 03/12 a las 10:00."
- **AND** la agenda muestra el 2026-12-03 con el turno de 10:00 a 10:45

#### Scenario: Envío en curso
- **WHEN** el usuario activa "Crear turno" y la API todavía no respondió
- **THEN** el botón muestra "Guardando…" con `aria-busy="true"` y activarlo de nuevo no envía otra solicitud

### Requirement: Horario ocupado
Ante 409 `TURNO_SOLAPADO` al crear o reprogramar, el diálogo SHALL quedar abierto con los datos cargados y SHALL anunciar el aviso "Ese horario ya está ocupado" con el horario del turno en conflicto y la indicación de elegir otro horario, y SHALL volver a pedir la agenda.

#### Scenario: Solapamiento al crear
- **WHEN** la API responde 409 `TURNO_SOLAPADO` con `turnoEnConflicto` de 10:00 a 10:30
- **THEN** se anuncia "Ese horario ya está ocupado" con el texto "Se superpone con el turno de 10:00 a 10:30. Elegí otro horario."
- **AND** el diálogo sigue abierto con el paciente y la prestación elegidos
- **AND** el aviso no contiene `TURNO_SOLAPADO` ni `409`

### Requirement: Otros rechazos de la API en los diálogos
Ante un error de la API en un diálogo, la web app SHALL mostrar un mensaje sin códigos técnicos: `TURNO_EN_PASADO` en el campo "Día"; `VALIDACION_FALLIDA` en cada campo informado; `PACIENTE_INACTIVO`, `PRESTACION_INACTIVA`, `TRANSICION_INVALIDA` y `TURNO_MODIFICADO` con su texto propio; cualquier otro, con el mensaje del cliente de la API.

#### Scenario: Turno en el pasado según el servidor
- **WHEN** la API responde 422 `TURNO_EN_PASADO`
- **THEN** "Día" muestra "No se pueden dar turnos en el pasado." y el diálogo sigue abierto

#### Scenario: Paciente dado de baja mientras se cargaba
- **WHEN** la API responde 422 `PACIENTE_INACTIVO`
- **THEN** se anuncia "Ese paciente está dado de baja. Elegí otro paciente."

#### Scenario: Error de validación por campo
- **WHEN** la API responde 422 `VALIDACION_FALLIDA` con un error en `duracionMinutos`
- **THEN** "Duración (min)" muestra el mensaje de ese error

### Requirement: Detalle de un turno y acciones según su estado
Activar un turno en la agenda SHALL abrir su detalle con horario, paciente, prestación y estado, y SHALL ofrecer solo las acciones válidas: "Reprogramar" y "Cancelar turno" si está `PROGRAMADO` y no empezó; "Marcar atendido" y "Marcar ausente" si está `PROGRAMADO` y ya empezó; ninguna si su estado es final.

#### Scenario: Turno programado futuro
- **WHEN** el 2026-12-01 a las 09:00 el usuario activa un turno `PROGRAMADO` de las 10:00 de ese día
- **THEN** ve "Reprogramar" y "Cancelar turno"
- **AND** no ve "Marcar atendido" ni "Marcar ausente"

#### Scenario: Turno programado que ya empezó
- **WHEN** el 2026-12-01 a las 10:05 el usuario activa un turno `PROGRAMADO` de 10:00 a 10:45
- **THEN** ve "Marcar atendido" y "Marcar ausente"
- **AND** no ve "Reprogramar" ni "Cancelar turno"

#### Scenario: Turno en estado final
- **WHEN** el usuario activa un turno `CANCELADO_TARDIO`
- **THEN** ve su detalle con el badge "Cancelación tardía" y ninguna acción

### Requirement: Reprogramar un turno
"Reprogramar" SHALL abrir un diálogo con día, hora y duración actuales precargados, paciente y prestación de solo lectura y la hora de fin calculada. Al confirmar SHALL enviar `PUT /api/turnos/{id}/reprogramacion` con `inicio`, `duracionMinutos` y la `version` del turno. Si responde 200 SHALL cerrar el diálogo, anunciar "Turno reprogramado" con el nuevo día y hora y volver a pedir la agenda.

#### Scenario: Reprogramación exitosa
- **WHEN** el usuario reprograma un turno con `version` 3 de las 10:00 a las 12:00 del mismo día y la API responde 200
- **THEN** la solicitud lleva `inicio` con hora 12:00 y `version` 3
- **AND** se anuncia "Turno reprogramado" y la agenda muestra el turno a las 12:00

#### Scenario: El turno cambió mientras se editaba
- **WHEN** la API responde 409 `TURNO_MODIFICADO`
- **THEN** se anuncia "Este turno cambió mientras lo editabas. Actualizamos la agenda: revisalo y probá de nuevo."
- **AND** la web app vuelve a pedir la agenda

### Requirement: Cancelar un turno con aviso de cancelación tardía
"Cancelar turno" SHALL pedir confirmación con un motivo opcional de hasta 255 caracteres. Si faltan menos de las horas de cancelación tardía configuradas, la confirmación SHALL mostrar antes de enviar el aviso "Cancelación tardía". Exactamente en el límite SHALL NOT mostrarlo (RN-CA-04).

#### Scenario: Aviso de cancelación tardía
- **WHEN** con 24 horas configuradas, el 2026-12-01 a las 09:00 el usuario elige cancelar un turno del 2026-12-01 a las 15:00
- **THEN** antes de enviar ve "Cancelación tardía" con el texto "Faltan menos de 24 h para el turno. Se registrará como cancelación tardía y el horario quedará libre."

#### Scenario: Justo en el límite
- **WHEN** con 24 horas configuradas, el 2026-12-01 a las 09:00 el usuario elige cancelar un turno del 2026-12-02 a las 09:00
- **THEN** la confirmación no muestra el aviso de cancelación tardía

#### Scenario: Configuración no disponible
- **WHEN** no se pudo obtener la configuración del consultorio y el usuario elige cancelar un turno
- **THEN** la confirmación dice "Si faltan pocas horas para el turno, puede quedar registrada como cancelación tardía." y permite cancelar igual

#### Scenario: Motivo demasiado largo
- **WHEN** el usuario escribe un motivo de 256 caracteres
- **THEN** "Motivo" muestra "El motivo puede tener hasta 255 caracteres." y no se envía la cancelación

### Requirement: Confirmar la cancelación
Al confirmar, la web app SHALL enviar `POST /api/turnos/{id}/cancelacion` con el motivo si se escribió. Si responde con éxito SHALL anunciar "Turno cancelado", o "Turno cancelado con cancelación tardía" si el estado resultante es `CANCELADO_TARDIO`, y SHALL volver a pedir la agenda.

#### Scenario: Cancelación anticipada
- **WHEN** el usuario confirma la cancelación y la API responde con el turno en estado `CANCELADO`
- **THEN** se anuncia "Turno cancelado" y la agenda muestra el turno con el badge "Cancelado"

#### Scenario: Cancelación tardía confirmada
- **WHEN** la API responde con el turno en estado `CANCELADO_TARDIO`
- **THEN** se anuncia "Turno cancelado con cancelación tardía"

#### Scenario: El turno ya no se puede cancelar
- **WHEN** la API responde 409 `TRANSICION_INVALIDA`
- **THEN** se anuncia "Este turno ya no se puede modificar porque cambió de estado. Actualizamos la agenda."
- **AND** la web app vuelve a pedir la agenda
- **AND** el aviso no contiene `TRANSICION_INVALIDA`

### Requirement: Registrar la asistencia
"Marcar atendido" y "Marcar ausente" SHALL enviar `POST /api/turnos/{id}/asistencia` con el estado elegido, sin confirmación adicional. Si responde con éxito SHALL anunciar "Turno marcado como atendido" o "Turno marcado como ausente" y volver a pedir la agenda.

#### Scenario: Marcar atendido
- **WHEN** el usuario activa "Marcar atendido" en un turno que ya empezó y la API responde con éxito
- **THEN** la solicitud lleva el estado `ATENDIDO`
- **AND** se anuncia "Turno marcado como atendido" y la agenda muestra el badge "Atendido"

#### Scenario: Asistencia rechazada
- **WHEN** la API responde 409 `TRANSICION_INVALIDA` al marcar ausente
- **THEN** se anuncia "Este turno ya no se puede modificar porque cambió de estado. Actualizamos la agenda."

### Requirement: Diálogos accesibles
Cada diálogo SHALL tener rol de diálogo modal con nombre, SHALL llevar el foco a su primer campo o acción al abrirse, SHALL cerrarse con Escape o "Cancelar" sin enviar nada y SHALL devolver el foco al elemento que lo abrió.

#### Scenario: Cerrar con Escape
- **WHEN** el diálogo "Nuevo turno" está abierto y el usuario presiona Escape
- **THEN** el diálogo se cierra sin enviar solicitudes
- **AND** el foco vuelve al botón "+ Turno"

### Requirement: Sesión vencida durante una acción
Si una operación de este capability responde 401, la web app SHALL aplicar el comportamiento de sesión vencida de `web-sesion` y SHALL NOT mostrar el aviso de error del diálogo.

#### Scenario: Token rechazado al crear
- **WHEN** con sesión iniciada `POST /api/turnos` responde 401 con `codigo` `NO_AUTENTICADO`
- **THEN** la web app muestra la página de inicio de sesión con el aviso "Tu sesión venció"
