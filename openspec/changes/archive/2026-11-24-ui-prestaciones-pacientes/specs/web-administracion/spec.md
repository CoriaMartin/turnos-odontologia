# Spec Delta

## Purpose

Define las pantallas web de administración de prestaciones y pacientes: cómo se llega a ellas, qué se ve en cada listado, cómo se cargan y corrigen los formularios, cómo se da de baja un paciente y qué se muestra ante cada falla. Los contratos que consumen son `prestaciones` y `pacientes`; el comportamiento de sesión vencida es el de `web-sesion`.

## ADDED Requirements

### Requirement: Rutas de administración y navegación
Con sesión iniciada, las rutas `/prestaciones` y `/pacientes` SHALL mostrar, respectivamente, las pantallas "Catálogo de prestaciones" y "Pacientes", con un título de nivel 1 con ese texto, dentro del layout protegido de la app. La barra superior SHALL ofrecer los enlaces "Agenda", "Prestaciones" y "Pacientes", y SHALL marcar con `aria-current="page"` el enlace de la ruta activa. Sin sesión, ambas rutas SHALL aplicar el comportamiento de `web-sesion` y redirigir al login.

#### Scenario: Abrir el catálogo de prestaciones
- **WHEN** el usuario con sesión iniciada abre `/prestaciones`
- **THEN** ve el título de nivel 1 "Catálogo de prestaciones"
- **AND** el enlace "Prestaciones" de la barra superior está marcado como página actual

#### Scenario: Abrir pacientes
- **WHEN** el usuario con sesión iniciada abre `/pacientes`
- **THEN** ve el título de nivel 1 "Pacientes"
- **AND** el enlace "Pacientes" de la barra superior está marcado como página actual

#### Scenario: Navegar entre secciones
- **WHEN** el usuario está en `/prestaciones` y activa el enlace "Pacientes"
- **THEN** la app muestra `/pacientes` conservando la barra superior y la sesión

#### Scenario: Ruta protegida sin sesión
- **WHEN** un usuario sin sesión abre `/pacientes`
- **THEN** la app muestra el login según `web-sesion`
- **AND** tras ingresar vuelve a `/pacientes`

### Requirement: Listado de prestaciones
La pantalla de prestaciones SHALL pedir `GET /api/prestaciones` y mostrar cada prestación con su nombre, su duración en minutos y un badge "Activa" o "Inactiva", en el orden que devuelve la API. SHALL incluir las inactivas y SHALL ofrecer los botones "Editar" y "Desactivar" para las activas, y "Editar" y "Activar" para las inactivas. En pantallas de menos de 900 px de ancho SHALL presentar los mismos datos como fichas apiladas en lugar de una tabla, sin perder ninguna acción.

#### Scenario: Catálogo con prestaciones activas e inactivas
- **WHEN** la API devuelve "Limpieza y profilaxis" activa de 45 minutos e "Incrustación estética" inactiva de 60 minutos
- **THEN** se ven ambos nombres, "45 min" y "60 min", los badges "Activa" e "Inactiva" y los botones "Desactivar" y "Activar" según corresponda

#### Scenario: Catálogo en móvil
- **WHEN** el usuario abre `/prestaciones` en una pantalla de 390 px de ancho
- **THEN** cada prestación se ve como una ficha con nombre, duración, estado y sus acciones
- **AND** no hay desplazamiento horizontal de la tabla

#### Scenario: Catálogo vacío
- **WHEN** la API devuelve una lista vacía
- **THEN** se ve "Todavía no cargaste ninguna prestación"
- **AND** se ofrece el botón "+ Nueva prestación" para crear la primera

### Requirement: Alta y edición de prestación
El botón "+ Nueva prestación" SHALL abrir un diálogo "Nueva prestación" y el botón "Editar" de una fila SHALL abrir "Editar prestación", ambos con los campos "Nombre de la prestación" y "Duración predeterminada (minutos)" y la ayuda "Entre 5 y 480 minutos.". Guardar SHALL enviar `POST /api/prestaciones` o `PUT /api/prestaciones/{id}` según corresponda, SHALL cerrar el diálogo y SHALL actualizar el listado al tener éxito. El nombre SHALL enviarse recortado y la duración SHALL enviarse como número entero.

#### Scenario: Alta válida de una prestación
- **WHEN** el usuario complete "Control Ficticio" y 20 minutos y activa "Guardar prestación"
- **THEN** la app envía `POST /api/prestaciones` con `{"nombre":"Control Ficticio","duracionMinutos":20}`
- **AND** el diálogo se cierra y la nueva prestación aparece en el listado

#### Scenario: Editar una prestación inactiva
- **WHEN** el usuario edita una prestación inactiva y guarda una duración distinta
- **THEN** la app envía `PUT /api/prestaciones/{id}` con el nuevo nombre y la nueva duración
- **AND** la prestación sigue inactiva en el listado

#### Scenario: Nombre ya existente
- **WHEN** la API responde 409 `NOMBRE_DUPLICADO` al guardar
- **THEN** el diálogo sigue abierto y el campo "Nombre de la prestación" muestra "Ya tenés una prestación con ese nombre. Probá con otro."
- **AND** el aviso no contiene el código `NOMBRE_DUPLICADO`

#### Scenario: Duración fuera del rango
- **WHEN** la API responde 422 `VALIDACION_FALLIDA` con el campo `duracionMinutos`
- **THEN** el campo de duración se marca como inválido y muestra "Entre 5 y 480 minutos."

#### Scenario: Cancelar el diálogo
- **WHEN** el usuario activa "Cancelar" en el diálogo de alta o edición
- **THEN** el diálogo se cierra sin enviar nada al backend y el listado no cambia

### Requirement: Activación y desactivación de prestaciones
El botón "Desactivar" SHALL enviar `PATCH /api/prestaciones/{id}/activa` con `{"activa":false}` y el botón "Activar" SHALL enviar el mismo endpoint con `{"activa":true}`. Tras una respuesta exitosa la fila SHALL pasar al estado opuesto y SHALL conservar la prestación en el listado, sin borrarla. Mientras la solicitud está en curso el botón SHALL estar deshabilitado; si falla, SHALL volver a habilitarse con un aviso legible.

#### Scenario: Desactivar sin borrar
- **WHEN** el usuario activa "Desactivar" en una prestación activa y la API responde 200 con `activa` igual a `false`
- **THEN** la fila muestra el badge "Inactiva" y el botón "Activar"
- **AND** la prestación sigue presente en el listado

#### Scenario: Reactivar
- **WHEN** el usuario activa "Activar" en una prestación inactiva y la API responde 200 con `activa` igual a `true`
- **THEN** la fila muestra el badge "Activa" y el botón "Desactivar"

#### Scenario: Fallo al cambiar el estado
- **WHEN** la solicitud de activación falla sin respuesta del servidor
- **THEN** el botón vuelve a habilitarse y se anuncia un aviso con el mensaje de `web-api-client` para ese error
- **AND** la fila conserva su estado anterior

### Requirement: Búsqueda y paginación de pacientes
La pantalla de pacientes SHALL ofrecer un buscador con etiqueta "Buscar paciente", placeholder "Apellido, nombre o DNI" y botón "Buscar", dentro de una región `role="search"`. Al buscar o cambiar de página SHALL pedir `GET /api/pacientes?q=&page=&size=` con `size` igual a 20 por defecto, SHALL mostrar el texto "Mostrando X a Y de N pacientes" con los valores de la respuesta paginada y SHALL ofrecer "Anterior" y "Siguiente" según `pagina` y `totalPaginas`. El término de búsqueda y la página SHALL conservarse en la URL para que recargar o usar Atrás muestre el mismo resultado. La búsqueda SHALL enviar el texto tal como lo escribió el usuario: la API se encarga de ignorar mayúsculas y tildes.

#### Scenario: Buscar por apellido sin tildes
- **WHEN** el usuario busca "gomez" y activa "Buscar"
- **THEN** la app pide `GET /api/pacientes?q=gomez&page=0&size=20`
- **AND** el listado incluye a "Gómez, Patricia"

#### Scenario: Buscar por DNI
- **WHEN** el usuario busca "32112334" y activa "Buscar"
- **THEN** la app pide `GET /api/pacientes?q=32112334&page=0&size=20`
- **AND** el listado incluye al paciente con ese DNI

#### Scenario: Ir a la página siguiente
- **WHEN** la respuesta informa 45 pacientes y el usuario activa "Siguiente"
- **THEN** la app pide `page=1` con el mismo `q`
- **AND** el texto pasa a "Mostrando 21 a 40 de 45 pacientes"

#### Scenario: Volver atrás tras buscar
- **WHEN** el usuario busca "gomez", pasa a la página 1 y usa Atrás del navegador
- **THEN** la pantalla vuelve a mostrar la búsqueda y la página anteriores

#### Scenario: Sin resultados
- **WHEN** la API devuelve una lista vacía para el término buscado
- **THEN** se ve "No hay pacientes que coincidan con “Zzz”." con el término usado
- **AND** se ofrece el botón "+ Nuevo paciente"

### Requirement: Datos visibles y consentimiento en el listado de pacientes
Cada paciente SHALL mostrarse con un avatar con sus iniciales, el nombre en forma "Apellido, Nombre", su DNI con puntos de millar, su obra social con número de afiliado si los tiene, su email si lo tiene, y un badge de consentimiento. El badge SHALL decir "Acepta recordatorios" si el paciente tiene email y acepta recordatorios, "No acepta recordatorios" si tiene email pero no los acepta, y "No recibe recordatorios" si no tiene email cargado. La pantalla SHALL NOT mostrar el estado `activo` de los pacientes listados, porque la búsqueda de la API ya devuelve sólo activos.

#### Scenario: Paciente con consentimiento y obra social
- **WHEN** la API devuelve Patricia Gómez con DNI "32112334", obra social "OSDE 310", afiliado "4589201", email y `aceptaRecordatorios` verdadero
- **THEN** se ve "Gómez, Patricia", "DNI 32.112.334", "OSDE 310 · Nº 4589201", su email y el badge "Acepta recordatorios"

#### Scenario: Paciente sin email
- **WHEN** la API devuelve un paciente sin email
- **THEN** se ve "Sin email cargado" y el badge "No recibe recordatorios"

#### Scenario: Paciente que no acepta recordatorios
- **WHEN** la API devuelve un paciente con email y `aceptaRecordatorios` falso
- **THEN** se ve el badge "No acepta recordatorios"

### Requirement: Alta y edición de paciente
El botón "+ Nuevo paciente" SHALL abrir un diálogo "Nuevo paciente" y el botón "Editar" de un paciente SHALL abrir "Editar paciente", con los campos "Nombre", "Apellido", "DNI", "Teléfono", "Email", "Obra social", "Número de afiliado", "Fecha de nacimiento" y la casilla "Acepta recordatorios por email" con su ayuda. Guardar SHALL enviar `POST /api/pacientes` o `PUT /api/pacientes/{id}` y SHALL actualizar el listado tras el éxito. El DNI SHALL enviarse sólo con dígitos, sin puntos ni espacios; los campos opcionales vacíos SHALL enviarse como `null`; en el alta la casilla de recordatorios SHALL empezar sin marcar.

#### Scenario: Alta con datos mínimos
- **WHEN** el usuario completa nombre "Paciente", apellido "Ficticio Uno", DNI "00000001" y guarda sin marcar la casilla de recordatorios
- **THEN** la app envía `POST /api/pacientes` con `aceptaRecordatorios` igual a `false` y los campos opcionales en `null`
- **AND** el paciente aparece en el listado

#### Scenario: DNI escrito con puntos
- **WHEN** el usuario escribe "32.112.334" en el campo DNI y guarda
- **THEN** la app envía `"dni":"32112334"`

#### Scenario: Edición del consentimiento
- **WHEN** el usuario abre "Editar paciente" de un paciente con recordatorios aceptados, desmarca la casilla y guarda
- **THEN** la app envía `PUT /api/pacientes/{id}` con `aceptaRecordatorios` igual a `false`
- **AND** el badge del listado pasa a "No acepta recordatorios"

#### Scenario: DNI ya usado por otro paciente
- **WHEN** la API responde 409 `DNI_DUPLICADO` al guardar
- **THEN** el diálogo sigue abierto y el campo DNI muestra "Ese DNI ya pertenece a otro paciente. Revisalo o buscá al paciente existente."

#### Scenario: Email mal formado
- **WHEN** la API responde 422 `VALIDACION_FALLIDA` con el campo `email`
- **THEN** el campo email se marca como inválido y muestra "Revisá el email: falta la parte después del arroba."

### Requirement: Baja lógica de pacientes con confirmación
El botón "Dar de baja" SHALL abrir un diálogo de confirmación con el nombre del paciente, la explicación de que deja de aparecer en las búsquedas y de que no se le pueden asignar turnos nuevos, y un aviso que indique que se conservan los datos y que los turnos futuros deben resolverse primero. Confirmar SHALL enviar `DELETE /api/pacientes/{id}`; con 204 SHALL cerrar el diálogo y SHALL quitar al paciente del listado sin borrar sus datos. Con 409 `PACIENTE_CON_TURNOS_FUTUROS` SHALL mantener al paciente en el listado y SHALL explicar qué hacer sin mostrar el código.

#### Scenario: Baja confirmada
- **WHEN** el usuario confirma la baja de Patricia Gómez y la API responde 204
- **THEN** el diálogo se cierra y "Gómez, Patricia" desaparece del listado
- **AND** el registro se conserva en el backend con `activo` igual a `false`

#### Scenario: Baja bloqueada por turnos futuros
- **WHEN** la API responde 409 `PACIENTE_CON_TURNOS_FUTUROS`
- **THEN** se anuncia "No pudimos dar de baja a este paciente porque tiene un turno programado. Cancelá o reprogramá ese turno y probá de nuevo."
- **AND** el paciente sigue en el listado y el aviso no contiene el código

#### Scenario: Cancelar la confirmación
- **WHEN** el usuario activa "Cancelar" en el diálogo de baja
- **THEN** no se envía ninguna solicitud y el paciente sigue en el listado

### Requirement: Estados de carga, error y sesión vencida
Mientras llega el listado de prestaciones o de pacientes, la pantalla SHALL mostrar "Cargando prestaciones…" o "Cargando pacientes…" y marcar la región correspondiente con `aria-busy="true"`. Si la consulta falla por un motivo distinto de un 401, SHALL anunciar "No pudimos cargar las prestaciones" o "No pudimos cargar los pacientes", el mensaje que asigna `web-api-client` y un botón "Reintentar" que repite la misma consulta. Ante un 401 SHALL aplicar `web-sesion` y SHALL NOT mostrar el aviso de error de la pantalla.

#### Scenario: Cargando prestaciones
- **WHEN** el usuario abre `/prestaciones` y la API todavía no responde
- **THEN** ve "Cargando prestaciones…" y la región del listado tiene `aria-busy="true"`

#### Scenario: Error al cargar con reintento
- **WHEN** la consulta de pacientes falla sin respuesta del servidor y después el usuario activa "Reintentar"
- **THEN** el aviso dice "No pudimos cargar los pacientes" y sugiere revisar la conexión
- **AND** la misma búsqueda se pide de nuevo y, si responde, el aviso desaparece

#### Scenario: Error al cargar prestaciones con reintento
- **WHEN** la consulta de prestaciones falla sin respuesta del servidor y después el usuario activa "Reintentar"
- **THEN** el aviso dice "No pudimos cargar las prestaciones" y sugiere revisar la conexión
- **AND** se pide de nuevo la misma consulta y, si responde, el aviso desaparece

#### Scenario: Token rechazado al cargar
- **WHEN** una consulta de `/pacientes` responde 401 con `codigo` `NO_AUTENTICADO`
- **THEN** la app muestra el login con el aviso "Tu sesión venció" según `web-sesion`
- **AND** no se muestra el aviso de error de carga

### Requirement: Errores legibles y accesibilidad
Los avisos y errores SHALL estar en español rioplatense con trato de "vos", SHALL decir qué pasó y qué hacer, y SHALL NOT contener códigos técnicos ni estados HTTP. Los errores devueltos por campo SHALL asociarse al control con `aria-invalid="true"` y `aria-describedby`. Los diálogos SHALL tener `role="dialog"` con `aria-labelledby` y `aria-describedby`, y las operaciones SHALL ser utilizables con teclado y con controles de al menos 44 px (`--hit-target`). La app SHALL NOT usar colores, medidas ni tipografías sueltas: SHALL usar las variables de `design-system/tokens.css`.

#### Scenario: Error sin código técnico
- **WHEN** el backend responde con `codigo` `NOMBRE_DUPLICADO` y el usuario ve el aviso
- **THEN** el texto dice "Ya tenés una prestación con ese nombre. Probá con otro."
- **AND** en ningún lugar de la pantalla se lee `NOMBRE_DUPLICADO` ni "409"

#### Scenario: Campo inválido anunciado
- **WHEN** el campo DNI muestra un error de validación
- **THEN** el input tiene `aria-invalid="true"` y `aria-describedby` apunta al texto del error

#### Scenario: Diálogo con nombre accesible
- **WHEN** se abre el diálogo de baja de un paciente
- **THEN** tiene `role="dialog"`, un título enlazado por `aria-labelledby` y una descripción enlazada por `aria-describedby`
- **AND** el foco queda dentro del diálogo mientras está abierto
