# Spec Delta

## Purpose

Garantiza que solo el odontólogo acceda a la API: login con email y contraseña, token con vencimiento, protección de las rutas y bloqueo ante intentos repetidos, con errores que no revelan qué dato falló.

## ADDED Requirements

### Requirement: Login con credenciales válidas
`POST /api/auth/login` con email y contraseña correctos de un usuario activo SHALL responder 200 con un token, su tipo `Bearer` y su fecha de vencimiento. El email se compara sin distinguir mayúsculas.

#### Scenario: Login exitoso
- **GIVEN** existe el usuario activo `odontologo@example.com` con contraseña `ClaveDePrueba123`
- **WHEN** se envía `POST /api/auth/login` con `Odontologo@Example.com` y `ClaveDePrueba123`
- **THEN** la respuesta tiene estado 200
- **AND** el cuerpo incluye `token`, `tipo` igual a `Bearer` y `expiraEn`

### Requirement: Credenciales inválidas con error genérico
Ante email inexistente, contraseña incorrecta o usuario inactivo, el login SHALL responder 401 con `codigo` igual a `CREDENCIALES_INVALIDAS` y el mismo mensaje en los tres casos.

#### Scenario: Contraseña incorrecta
- **WHEN** se envía el login con un email existente y una contraseña incorrecta
- **THEN** la respuesta tiene estado 401 y `codigo` `CREDENCIALES_INVALIDAS`

#### Scenario: Email inexistente
- **WHEN** se envía el login con un email que no existe
- **THEN** la respuesta tiene estado 401, `codigo` `CREDENCIALES_INVALIDAS` y el mismo `detail` que con contraseña incorrecta

### Requirement: Datos de login obligatorios
El login SHALL rechazar con 422 `VALIDACION_FALLIDA` una solicitud sin email, con email mal formado o sin contraseña.

#### Scenario: Contraseña vacía
- **WHEN** se envía el login con email válido y contraseña vacía
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `password`

### Requirement: API protegida por token
Toda ruta bajo `/api/` salvo `POST /api/auth/login` SHALL exigir el encabezado `Authorization: Bearer <token>` con un token válido, no vencido y con rol `ODONTOLOGO`. En caso contrario SHALL responder 401 con `codigo` igual a `NO_AUTENTICADO` en formato Problem Details.

#### Scenario: Sin token
- **WHEN** se pide una ruta protegida sin encabezado `Authorization`
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`

#### Scenario: Token válido
- **GIVEN** un token obtenido en un login exitoso
- **WHEN** se pide una ruta protegida con ese token
- **THEN** la solicitud se atiende normalmente

#### Scenario: Token vencido
- **GIVEN** un token cuyo vencimiento ya pasó
- **WHEN** se pide una ruta protegida con ese token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`

#### Scenario: Token con firma inválida
- **WHEN** se pide una ruta protegida con un token firmado con otra clave
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`

#### Scenario: Health sigue público
- **WHEN** se pide `GET /actuator/health` sin token
- **THEN** la respuesta tiene estado 200

### Requirement: Bloqueo tras intentos fallidos
Tras 5 intentos fallidos consecutivos para un mismo email, el login de ese email SHALL responder 429 con `codigo` igual a `LOGIN_BLOQUEADO` durante 15 minutos, aunque la contraseña sea correcta. Un login exitoso SHALL reiniciar el contador.

#### Scenario: Quinto fallo bloquea
- **GIVEN** 5 intentos fallidos consecutivos para `odontologo@example.com`
- **WHEN** se intenta el login con la contraseña correcta
- **THEN** la respuesta tiene estado 429 y `codigo` `LOGIN_BLOQUEADO`

#### Scenario: Se desbloquea a los 15 minutos
- **GIVEN** el email está bloqueado
- **WHEN** pasan 15 minutos y se intenta el login con la contraseña correcta
- **THEN** la respuesta tiene estado 200

#### Scenario: Login exitoso reinicia el contador
- **GIVEN** 4 intentos fallidos y luego un login exitoso
- **WHEN** ocurre 1 intento fallido más
- **THEN** la respuesta es 401 `CREDENCIALES_INVALIDAS`, no 429

### Requirement: Credenciales fuera de respuestas y logs
Las respuestas y los logs SHALL NOT contener contraseñas, hashes de contraseña ni tokens.

#### Scenario: Login fallido registrado
- **WHEN** falla un login
- **THEN** ni la respuesta ni la salida de logs contienen la contraseña enviada

### Requirement: CORS limitado al frontend
La API SHALL aceptar solicitudes de origen cruzado solo desde el origen configurado en `FRONTEND_ORIGIN`.

#### Scenario: Origen no permitido
- **WHEN** llega una solicitud preflight desde `http://otro-sitio.example`
- **THEN** la respuesta no incluye `Access-Control-Allow-Origin` para ese origen

#### Scenario: Origen del frontend
- **WHEN** llega una solicitud preflight desde el origen de `FRONTEND_ORIGIN`
- **THEN** la respuesta incluye `Access-Control-Allow-Origin` con ese origen
