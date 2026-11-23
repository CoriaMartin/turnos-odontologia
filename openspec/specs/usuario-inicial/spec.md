# usuario-inicial Specification

## Purpose

Deja el consultorio operativo desde el primer arranque creando el usuario odontólogo y su profesional a partir de la configuración, sin contraseñas fijas en el repositorio.

## Requirements

### Requirement: Creación del primer usuario al arrancar
Si al arrancar no existe ningún usuario, el sistema SHALL crear un usuario activo con rol `ODONTOLOGO`, email `ADMIN_EMAIL` y contraseña `ADMIN_PASSWORD` cifrada, y un profesional asociado con nombre "Odontólogo" y apellido "Titular".

#### Scenario: Base sin usuarios
- **GIVEN** una base sin usuarios y las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` definidas
- **WHEN** arranca el sistema
- **THEN** existe un usuario con ese email y rol `ODONTOLOGO`
- **AND** su contraseña no está guardada en texto plano
- **AND** existe su profesional "Odontólogo Titular"
- **AND** los recursos del consultorio ya no fallan con `CONSULTORIO_NO_CONFIGURADO`

### Requirement: Arranque idempotente
Si ya existe al menos un usuario, el arranque SHALL NOT crear ni modificar usuarios ni profesionales, aunque `ADMIN_PASSWORD` haya cambiado.

#### Scenario: Segundo arranque con otra contraseña
- **GIVEN** ya existe el usuario inicial
- **WHEN** el sistema arranca con otro valor en `ADMIN_PASSWORD`
- **THEN** sigue habiendo un solo usuario y su contraseña es la original

### Requirement: Configuración de seguridad obligatoria
El sistema SHALL negarse a arrancar con un mensaje que nombre la variable faltante cuando falte `JWT_SECRET`, cuando tenga menos de 32 bytes, o cuando falten `ADMIN_EMAIL` o `ADMIN_PASSWORD` y no haya usuarios.

#### Scenario: Secreto JWT corto
- **WHEN** el sistema arranca con un `JWT_SECRET` de menos de 32 bytes
- **THEN** el arranque falla y el error menciona `JWT_SECRET`

#### Scenario: Falta la contraseña inicial
- **GIVEN** una base sin usuarios
- **WHEN** el sistema arranca sin `ADMIN_PASSWORD`
- **THEN** el arranque falla y el error menciona `ADMIN_PASSWORD`
