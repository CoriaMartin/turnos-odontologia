## MODIFIED Requirements

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
