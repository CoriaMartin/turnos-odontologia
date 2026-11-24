# Spec Delta — web-sesion

## Purpose

Define cómo el odontólogo inicia y cierra sesión en la web app, cómo se guarda el token de forma segura en el navegador y cómo la app protege sus pantallas y reacciona cuando la sesión deja de ser válida.

## ADDED Requirements

### Requirement: Página de inicio de sesión
La ruta `/login` SHALL ser pública y mostrar el logo, el nombre "Agenda de Odontología", un campo "Email", un campo "Contraseña" y un botón "Ingresar", sin la barra superior de la app.

#### Scenario: Abrir el login sin sesión
- **WHEN** el usuario sin sesión abre `/login`
- **THEN** ve un título de nivel 1 "Ingresá a tu agenda", los campos "Email" y "Contraseña" y el botón "Ingresar"
- **AND** no ve el botón "Cerrar sesión"

#### Scenario: Abrir el login con sesión iniciada
- **WHEN** el usuario con sesión iniciada abre `/login`
- **THEN** la web app lo lleva a `/`

### Requirement: Ingreso con credenciales válidas
Al enviar email y contraseña, la web app SHALL llamar a `POST /api/auth/login` y, si responde 200, SHALL iniciar la sesión con el token recibido y llevar al usuario a la ruta protegida que había pedido o, si no pidió ninguna, a `/`.

#### Scenario: Ingreso exitoso
- **WHEN** el usuario completa email y contraseña correctos y activa "Ingresar"
- **THEN** la web app muestra la página de inicio
- **AND** las solicitudes siguientes a la API incluyen `Authorization: Bearer <token recibido>`

#### Scenario: Volver a la ruta pedida
- **WHEN** el usuario sin sesión abre una ruta protegida, es llevado a `/login` e ingresa con éxito
- **THEN** la web app lo lleva a la ruta que había pedido

### Requirement: Token solo en memoria
La web app SHALL guardar el token de sesión únicamente en la memoria de la página. SHALL NOT escribirlo en `localStorage`, `sessionStorage`, cookies ni en la URL. Al recargar la página la sesión se pierde y el usuario debe ingresar de nuevo.

#### Scenario: Ingreso sin persistir el token
- **WHEN** el usuario ingresa con éxito
- **THEN** ni `localStorage` ni `sessionStorage` contienen el token
- **AND** la URL no contiene el token

#### Scenario: Recarga de la página
- **WHEN** el usuario con sesión iniciada recarga la página en una ruta protegida
- **THEN** la web app lo lleva a `/login`

### Requirement: Estado de carga del ingreso
Mientras la solicitud de login está en curso, el botón SHALL mostrar "Ingresando…", SHALL indicarse como ocupado a las tecnologías de asistencia y SHALL NOT permitir un segundo envío.

#### Scenario: Ingreso en curso
- **WHEN** el usuario activa "Ingresar" y la API todavía no respondió
- **THEN** el botón muestra "Ingresando…" con `aria-busy="true"`
- **AND** activar el botón de nuevo no envía otra solicitud

### Requirement: Campos obligatorios antes de enviar
Si el email o la contraseña están vacíos, la web app SHALL NOT llamar a la API y SHALL marcar cada campo vacío con un mensaje asociado al campo.

#### Scenario: Envío con campos vacíos
- **WHEN** el usuario activa "Ingresar" con el email y la contraseña vacíos
- **THEN** no se envía ninguna solicitud a la API
- **AND** el campo "Email" muestra "Ingresá tu email" y el campo "Contraseña" muestra "Ingresá tu contraseña"
- **AND** el foco pasa al primer campo con error

### Requirement: Error de credenciales genérico
Ante un 401 `CREDENCIALES_INVALIDAS`, la web app SHALL mostrar un aviso que no revele si falló el email o la contraseña, SHALL vaciar la contraseña y conservar el email.

#### Scenario: Credenciales inválidas
- **WHEN** la API responde 401 con `codigo` `CREDENCIALES_INVALIDAS`
- **THEN** se anuncia un aviso con el título "No pudimos iniciar sesión" y el texto "El email o la contraseña no son correctos. Revisalos y probá de nuevo."
- **AND** el campo "Contraseña" queda vacío y el email ingresado se conserva
- **AND** el aviso no contiene `CREDENCIALES_INVALIDAS` ni `401`

### Requirement: Aviso de bloqueo por intentos
Ante un 429 `LOGIN_BLOQUEADO`, la web app SHALL mostrar un aviso que explique que el ingreso quedó bloqueado por 15 minutos tras varios intentos fallidos y qué hacer, sin códigos técnicos.

#### Scenario: Login bloqueado
- **WHEN** la API responde 429 con `codigo` `LOGIN_BLOQUEADO`
- **THEN** se anuncia un aviso con el título "Ingreso bloqueado por 15 minutos" y el texto "Hubo demasiados intentos fallidos. Esperá 15 minutos y volvé a intentar."
- **AND** el aviso no contiene `LOGIN_BLOQUEADO` ni `429`
- **AND** el campo "Contraseña" queda vacío y el email ingresado se conserva

### Requirement: Otros errores del login
Ante cualquier otro error del login (sin conexión, error del servidor u otro código), la web app SHALL mostrar el mensaje para el usuario que corresponde a ese error según el cliente de la API, sin códigos técnicos.

#### Scenario: Sin conexión al ingresar
- **WHEN** la solicitud de login falla sin respuesta del servidor
- **THEN** se anuncia un aviso que explica que no se pudo conectar con el servidor y sugiere revisar la conexión

### Requirement: Rutas protegidas
Toda ruta de la web app salvo `/login` SHALL requerir sesión iniciada. Sin sesión, la web app SHALL llevar al usuario a `/login` recordando la ruta pedida.

#### Scenario: Inicio sin sesión
- **WHEN** el usuario sin sesión abre `/`
- **THEN** la web app muestra la página de inicio de sesión

#### Scenario: Ruta inexistente sin sesión
- **WHEN** el usuario sin sesión abre `/ruta-que-no-existe`
- **THEN** la web app muestra la página de inicio de sesión

### Requirement: Sesión vencida o rechazada por la API
Si con sesión iniciada la API responde 401, o el vencimiento del token ya pasó, la web app SHALL cerrar la sesión, descartar los datos ya cargados y llevar al usuario a `/login` con un aviso de sesión vencida, recordando la ruta en la que estaba.

#### Scenario: La API rechaza el token
- **WHEN** con sesión iniciada una solicitud a la API responde 401 con `codigo` `NO_AUTENTICADO`
- **THEN** la web app muestra la página de inicio de sesión
- **AND** se anuncia un aviso con el título "Tu sesión venció" y el texto "Ingresá de nuevo para seguir."

#### Scenario: Token vencido antes de la solicitud
- **WHEN** con sesión iniciada pasa la fecha de vencimiento del token y se hace una solicitud a la API
- **THEN** la solicitud no incluye `Authorization`
- **AND** la web app muestra la página de inicio de sesión con el aviso de sesión vencida

#### Scenario: El 401 del login no es sesión vencida
- **WHEN** sin sesión el login responde 401 `CREDENCIALES_INVALIDAS`
- **THEN** la web app no muestra el aviso de sesión vencida

### Requirement: Cierre de sesión
Con sesión iniciada, la barra superior SHALL ofrecer un botón "Cerrar sesión" que descarte el token y los datos ya cargados y lleve al usuario a `/login`.

#### Scenario: Cerrar sesión
- **WHEN** el usuario con sesión iniciada activa "Cerrar sesión"
- **THEN** la web app muestra la página de inicio de sesión sin aviso de error
- **AND** las solicitudes siguientes a la API no incluyen `Authorization`

#### Scenario: Volver atrás después de cerrar sesión
- **WHEN** el usuario cierra sesión y vuelve a abrir `/`
- **THEN** la web app muestra la página de inicio de sesión
