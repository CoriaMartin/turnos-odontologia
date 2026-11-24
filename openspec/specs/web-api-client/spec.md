# web-api-client Specification

## Purpose

Define cómo la web app se comunica con la API: a qué URL llama, cómo envía la sesión y cómo convierte cualquier falla en un error con un código estable y un mensaje comprensible para el usuario.

## Requirements

### Requirement: URL base configurable
El cliente SHALL construir cada URL de la API con la URL base configurada en la variable `VITE_API_URL`, seguida de la ruta pedida. Si la variable no está definida, SHALL usar `http://localhost:8080/api`.

#### Scenario: Ruta con URL base configurada
- **WHEN** `VITE_API_URL` es `http://localhost:8080/api` y se pide la ruta `/pacientes`
- **THEN** la solicitud va a `http://localhost:8080/api/pacientes`

#### Scenario: URL base con barra final
- **WHEN** `VITE_API_URL` termina en `/` y se pide la ruta `/pacientes`
- **THEN** la URL resultante no tiene dos barras seguidas antes de `pacientes`

### Requirement: Cuerpo y respuesta en JSON
El cliente SHALL enviar los cuerpos como JSON con `Content-Type: application/json` y SHALL devolver el cuerpo JSON de una respuesta exitosa. Una respuesta exitosa sin cuerpo (204) SHALL devolverse vacía, sin error.

#### Scenario: Respuesta exitosa con cuerpo
- **WHEN** la API responde 200 con un cuerpo JSON
- **THEN** el cliente devuelve ese cuerpo ya interpretado

#### Scenario: Respuesta exitosa sin cuerpo
- **WHEN** la API responde 204
- **THEN** el cliente termina sin error y sin datos

### Requirement: Envío del token de sesión
Cuando hay un token de sesión disponible, el cliente SHALL enviarlo en el encabezado `Authorization` con el formato `Bearer <token>`. Sin token, SHALL omitir ese encabezado.

#### Scenario: Solicitud con sesión
- **WHEN** hay un token disponible y se hace una solicitud
- **THEN** la solicitud incluye `Authorization: Bearer <token>`

#### Scenario: Solicitud sin sesión
- **WHEN** no hay token disponible y se hace una solicitud
- **THEN** la solicitud no incluye el encabezado `Authorization`

### Requirement: Errores Problem Details tipados
Ante una respuesta de error con formato Problem Details, el cliente SHALL rechazar la solicitud con un error de API que conserve el estado HTTP, el `codigo`, el `title`, el `detail` y, si existen, los errores por campo.

#### Scenario: Error de negocio
- **WHEN** la API responde 409 `application/problem+json` con `codigo` `TURNO_SOLAPADO`
- **THEN** el cliente rechaza con un error de API con estado 409 y `codigo` `TURNO_SOLAPADO`

#### Scenario: Error de validación con campos
- **WHEN** la API responde 422 con `codigo` `VALIDACION_FALLIDA` y `errores` con el campo `dni`
- **THEN** el error de API incluye un error de campo para `dni` con su mensaje

### Requirement: Errores sin formato Problem Details
Ante una respuesta de error que no sea Problem Details, el cliente SHALL rechazar con un error de API con el estado HTTP y el código `ERROR_DESCONOCIDO`. Si la API no responde (falla de red), SHALL rechazar con estado 0 y código `SIN_CONEXION`.

#### Scenario: Error con cuerpo no reconocido
- **WHEN** la API responde 502 con un cuerpo HTML
- **THEN** el cliente rechaza con estado 502 y `codigo` `ERROR_DESCONOCIDO`

#### Scenario: Sin conexión
- **WHEN** la solicitud falla antes de recibir respuesta
- **THEN** el cliente rechaza con estado 0 y `codigo` `SIN_CONEXION`

### Requirement: Mensaje para el usuario sin códigos técnicos
Para cada error de API, la web app SHALL poder obtener un mensaje en español rioplatense que diga qué pasó y qué hacer. El mensaje nunca SHALL contener el código técnico. Los códigos sin mensaje propio SHALL usar un mensaje genérico.

#### Scenario: Sin conexión
- **WHEN** se pide el mensaje de un error `SIN_CONEXION`
- **THEN** el mensaje explica que no se pudo conectar con el servidor y sugiere revisar la conexión y probar de nuevo

#### Scenario: Código sin mensaje propio
- **WHEN** se pide el mensaje de un error con un código desconocido para la web app
- **THEN** el mensaje es el genérico, que sugiere probar de nuevo en unos minutos
- **AND** el mensaje no contiene ese código
