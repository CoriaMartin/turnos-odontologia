# prestaciones Specification

## Purpose
Permite al odontólogo mantener un catálogo de prestaciones con su duración, para que C-07 proponga la duración correcta al crear turnos. El catálogo no contiene datos personales y se desactiva en lugar de borrarse.

## Requirements

### Requirement: Alta de prestación
`POST /api/prestaciones` SHALL crear una prestación activa y responder 201 con sus datos, su `id` y el header `Location`. El nombre SHALL recortarse (trim) antes de guardarse.

#### Scenario: Alta con datos mínimos
- **WHEN** se envía `{"nombre":"Limpieza Ficticia","duracionMinutos":45}`
- **THEN** la respuesta tiene estado 201, `activa` es `true` y el `id` no es nulo
- **AND** el header `Location` apunta a `/api/prestaciones/{id}`

#### Scenario: Nombre con espacios
- **WHEN** se envía el nombre `"  Control Ficticio  "`
- **THEN** se guarda y se devuelve `"Control Ficticio"`

### Requirement: Datos obligatorios y longitud
El nombre SHALL ser obligatorio y tener como máximo 100 caracteres. Un nombre vacío o más largo SHALL responder 422 `VALIDACION_FALLIDA` con el campo `nombre` en `errores`.

#### Scenario: Falta el campo nombre
- **WHEN** se envía un cuerpo sin el campo `nombre`
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `nombre`

#### Scenario: Nombre demasiado largo
- **WHEN** se envía un nombre de 101 caracteres
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `nombre`

### Requirement: Duración válida
`duracionMinutos` SHALL ser obligatorio y estar entre 5 y 480. Un valor fuera de ese rango SHALL responder 422 `VALIDACION_FALLIDA` con el campo `duracionMinutos` en `errores`.

#### Scenario: Duración menor al mínimo
- **WHEN** se envía `duracionMinutos` igual a 4
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `duracionMinutos`

#### Scenario: Duración mayor al máximo
- **WHEN** se envía `duracionMinutos` igual a 481
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `duracionMinutos`

#### Scenario: Falta el campo duracionMinutos
- **WHEN** se envía un cuerpo sin el campo `duracionMinutos`
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `duracionMinutos`

#### Scenario: Duración en el límite mínimo
- **WHEN** se envía `duracionMinutos` igual a 5
- **THEN** la respuesta tiene estado 201

#### Scenario: Duración en el límite máximo
- **WHEN** se envía `duracionMinutos` igual a 480
- **THEN** la respuesta tiene estado 201

### Requirement: Nombre único
No SHALL existir dos prestaciones con el mismo nombre sin distinguir mayúsculas y minúsculas (después de recortar espacios), estén activas o no. Un alta o edición con un nombre ya usado SHALL responder 409 `NOMBRE_DUPLICADO`.

#### Scenario: Alta con nombre repetido
- **GIVEN** existe una prestación con nombre "Limpieza Ficticia"
- **WHEN** se da de alta otra con el mismo nombre
- **THEN** la respuesta tiene estado 409 y `codigo` `NOMBRE_DUPLICADO`

#### Scenario: Alta con distinta capitalización
- **GIVEN** existe una prestación con nombre "Limpieza Ficticia"
- **WHEN** se da de alta otra con el nombre "limpieza ficticia"
- **THEN** la respuesta tiene estado 409 y `codigo` `NOMBRE_DUPLICADO`

#### Scenario: Edición con nombre de otra prestación
- **GIVEN** existen "Obturación Ficticia" y "Extracción Ficticia"
- **WHEN** se cambia el nombre de la segunda a "obturación ficticia"
- **THEN** la respuesta tiene estado 409 y `codigo` `NOMBRE_DUPLICADO`

#### Scenario: Alta con nombre de prestación desactivada
- **GIVEN** existe una prestación desactivada con nombre "Limpieza Inactiva Ficticia"
- **WHEN** se da de alta otra con el mismo nombre exacto "Limpieza Inactiva Ficticia"
- **THEN** la respuesta tiene estado 409 y `codigo` `NOMBRE_DUPLICADO`

### Requirement: Listado de prestaciones
`GET /api/prestaciones` SHALL devolver todas las prestaciones, activas e inactivas, ordenadas por nombre, sin paginación, indicando el valor de `activa`.

#### Scenario: Listado incluye inactivas
- **GIVEN** existe una prestación activa y una desactivada
- **WHEN** se pide `GET /api/prestaciones`
- **THEN** el resultado incluye ambas, ordenadas por nombre
- **AND** cada una informa su valor de `activa`

#### Scenario: Catálogo vacío
- **GIVEN** no hay prestaciones cargadas
- **WHEN** se pide `GET /api/prestaciones`
- **THEN** la respuesta tiene estado 200 con una lista vacía

### Requirement: Consulta por id
`GET /api/prestaciones/{id}` SHALL devolver la prestación, activa o no. Si no existe SHALL responder 404 `PRESTACION_NO_ENCONTRADA`.

#### Scenario: Prestación inexistente
- **WHEN** se pide `GET /api/prestaciones/999999`
- **THEN** la respuesta tiene estado 404 y `codigo` `PRESTACION_NO_ENCONTRADA`

### Requirement: Edición de prestación
`PUT /api/prestaciones/{id}` SHALL reemplazar nombre y duración aplicando las mismas validaciones que el alta, incluso si la prestación está inactiva.

#### Scenario: Edición válida de una prestación activa
- **GIVEN** existe una prestación activa
- **WHEN** se cambian su nombre y su duración
- **THEN** la respuesta tiene estado 200 y refleja los nuevos valores

#### Scenario: Edición de una prestación inactiva
- **GIVEN** existe una prestación desactivada
- **WHEN** se cambia su duración
- **THEN** la respuesta tiene estado 200
- **AND** la prestación sigue desactivada

#### Scenario: Edición con nombre con espacios
- **GIVEN** existe una prestación con nombre "Control Ficticio"
- **WHEN** se envía `PUT /api/prestaciones/{id}` con el nombre `"  Control Editado Ficticio  "` y duración 30
- **THEN** la respuesta tiene estado 200 y `nombre` es `"Control Editado Ficticio"`
- **AND** una consulta posterior por id devuelve el mismo nombre recortado

### Requirement: Activación y desactivación
`PATCH /api/prestaciones/{id}/activa` SHALL recibir `{ "activa": true|false }`, SHALL ser idempotente y SHALL responder 200 con el DTO actualizado. SHALL NOT borrar la prestación: `GET /api/prestaciones/{id}` sigue devolviéndola.

#### Scenario: Desactivar sin borrar
- **GIVEN** existe una prestación activa
- **WHEN** se envía `PATCH` con `{ "activa": false }`
- **THEN** la respuesta tiene estado 200 y `activa` es `false`
- **AND** `GET /api/prestaciones/{id}` sigue devolviéndola

#### Scenario: Desactivar dos veces
- **GIVEN** existe una prestación desactivada
- **WHEN** se envía `PATCH` con `{ "activa": false }`
- **THEN** la respuesta tiene estado 200 y no hay cambios

#### Scenario: Reactivar
- **GIVEN** existe una prestación desactivada
- **WHEN** se envía `PATCH` con `{ "activa": true }`
- **THEN** la respuesta tiene estado 200 y `activa` es `true`

### Requirement: Acceso autenticado
Todas las operaciones de prestaciones SHALL exigir un JWT válido con rol `ODONTOLOGO`.

#### Scenario: Sin token al listar
- **WHEN** se pide `GET /api/prestaciones` sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`

#### Scenario: Sin token al crear
- **WHEN** se envía `POST /api/prestaciones` sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`

#### Scenario: Sin token al editar
- **WHEN** se envía `PUT /api/prestaciones/1` sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`

#### Scenario: Sin token al cambiar `activa`
- **WHEN** se envía `PATCH /api/prestaciones/1/activa` sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`

#### Scenario: Sin token al consultar por id
- **GIVEN** existe una prestación creada por el test con id `{id}`
- **WHEN** se pide `GET /api/prestaciones/{id}` sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`
