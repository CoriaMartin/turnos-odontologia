# pacientes Specification

## Purpose

Permite al odontólogo registrar, encontrar y mantener a sus pacientes para asignarles turnos, cuidando que sus datos personales sean válidos, únicos y no se expongan fuera de la API autenticada.

## Requirements

### Requirement: Alta de paciente
`POST /api/pacientes` con nombre, apellido y DNI válidos SHALL crear un paciente activo y responder 201 con sus datos e `id`. Teléfono, email, obra social, número de afiliado y fecha de nacimiento son opcionales; `aceptaRecordatorios` vale `false` si no se informa.

#### Scenario: Alta con datos mínimos
- **WHEN** se envía un paciente con nombre "Paciente", apellido "Ficticio Uno" y DNI "00000001"
- **THEN** la respuesta tiene estado 201
- **AND** el paciente queda activo con `aceptaRecordatorios` igual a `false`

### Requirement: DNI válido
El DNI SHALL tener 7 u 8 dígitos y nada más. En caso contrario la API SHALL responder 422 `VALIDACION_FALLIDA` con el campo `dni` en `errores`.

#### Scenario: DNI con letras
- **WHEN** se envía un paciente con DNI "12A45678"
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `dni`

#### Scenario: DNI de 6 dígitos
- **WHEN** se envía un paciente con DNI "123456"
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `dni`

### Requirement: DNI único
No SHALL existir dos pacientes con el mismo DNI, estén activos o no. Un alta o edición con un DNI ya usado SHALL responder 409 `DNI_DUPLICADO`.

#### Scenario: Alta con DNI repetido
- **GIVEN** existe un paciente con DNI "00000001"
- **WHEN** se da de alta otro paciente con DNI "00000001"
- **THEN** la respuesta tiene estado 409 y `codigo` `DNI_DUPLICADO`

### Requirement: Datos obligatorios y formato
Nombre y apellido SHALL ser obligatorios (hasta 100 caracteres). Si se informa email, SHALL tener formato válido.

#### Scenario: Sin apellido
- **WHEN** se envía un paciente sin apellido
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `apellido`

#### Scenario: Email mal formado
- **WHEN** se envía un paciente con email "no-es-un-email"
- **THEN** la respuesta tiene estado 422 y `errores` incluye el campo `email`

### Requirement: Búsqueda de pacientes activos
`GET /api/pacientes?q=` SHALL devolver los pacientes activos cuyo apellido o nombre contenga `q` sin distinguir mayúsculas ni tildes, o cuyo DNI contenga `q`, ordenados por apellido y nombre. Sin `q` devuelve todos los activos.

#### Scenario: Búsqueda sin tildes ni mayúsculas
- **GIVEN** existe el paciente activo con apellido "Gómez Ficticio"
- **WHEN** se busca `q=gomez`
- **THEN** el resultado incluye a ese paciente

#### Scenario: Búsqueda por DNI
- **GIVEN** existe el paciente activo con DNI "00000002"
- **WHEN** se busca `q=00000002`
- **THEN** el resultado incluye a ese paciente

#### Scenario: Los inactivos no aparecen
- **GIVEN** un paciente dado de baja
- **WHEN** se busca por su apellido
- **THEN** el resultado no lo incluye

### Requirement: Búsqueda paginada
La búsqueda SHALL ser paginada con `page` (desde 0) y `size` (por defecto 20, máximo 100) y SHALL informar `contenido`, `pagina`, `tamanio`, `totalElementos` y `totalPaginas`.

#### Scenario: Segunda página
- **GIVEN** existen 3 pacientes activos
- **WHEN** se busca con `size=2&page=1`
- **THEN** `contenido` tiene 1 paciente, `totalElementos` es 3 y `totalPaginas` es 2

#### Scenario: Tamaño excesivo
- **WHEN** se busca con `size=500`
- **THEN** la respuesta usa un tamaño de 100

### Requirement: Consulta por id
`GET /api/pacientes/{id}` SHALL devolver el paciente, activo o no. Si no existe SHALL responder 404 `PACIENTE_NO_ENCONTRADO`.

#### Scenario: Paciente inexistente
- **WHEN** se pide `GET /api/pacientes/999999`
- **THEN** la respuesta tiene estado 404 y `codigo` `PACIENTE_NO_ENCONTRADO`

### Requirement: Edición de paciente
`PUT /api/pacientes/{id}` SHALL reemplazar los datos de un paciente activo aplicando las mismas validaciones que el alta. Editar un paciente dado de baja SHALL responder 409 `PACIENTE_INACTIVO`.

#### Scenario: Edición válida
- **GIVEN** un paciente activo
- **WHEN** se le cambia el teléfono y se marca `aceptaRecordatorios`
- **THEN** la respuesta tiene estado 200 y refleja los nuevos datos

#### Scenario: Edición con DNI de otro paciente
- **GIVEN** dos pacientes con DNI "00000001" y "00000002"
- **WHEN** al segundo se le cambia el DNI a "00000001"
- **THEN** la respuesta tiene estado 409 y `codigo` `DNI_DUPLICADO`

#### Scenario: Edición de paciente dado de baja
- **GIVEN** un paciente dado de baja
- **WHEN** se intenta editarlo
- **THEN** la respuesta tiene estado 409 y `codigo` `PACIENTE_INACTIVO`

### Requirement: Baja lógica
`DELETE /api/pacientes/{id}` SHALL marcar el paciente como inactivo y responder 204, conservando sus datos. Dar de baja un paciente ya inactivo SHALL responder 204 sin cambios.

#### Scenario: Baja conserva el registro
- **GIVEN** un paciente activo
- **WHEN** se lo da de baja
- **THEN** la respuesta tiene estado 204
- **AND** `GET /api/pacientes/{id}` sigue devolviéndolo con `activo` igual a `false`

### Requirement: Acceso autenticado y datos fuera de los logs
Todas las operaciones de pacientes SHALL exigir autenticación, y los logs SHALL NOT contener DNI, email ni teléfono de pacientes.

#### Scenario: Sin token
- **WHEN** se pide `GET /api/pacientes` sin token
- **THEN** la respuesta tiene estado 401 y `codigo` `NO_AUTENTICADO`

#### Scenario: Alta sin datos personales en logs
- **WHEN** se da de alta un paciente con DNI, email y teléfono
- **THEN** la salida de logs no contiene ese DNI, ese email ni ese teléfono
