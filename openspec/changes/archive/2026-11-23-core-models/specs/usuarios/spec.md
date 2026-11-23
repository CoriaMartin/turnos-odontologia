# Spec Delta

## Purpose

Define la identidad de quien accede al sistema: un usuario con email único y un rol permitido, sobre el que C-04 construye el login.

## ADDED Requirements

### Requirement: Email de usuario único sin distinguir mayúsculas
El sistema SHALL rechazar un usuario cuyo email coincida con el de otro usuario existente, sin distinguir mayúsculas de minúsculas.

#### Scenario: Email repetido con otra capitalización
- **GIVEN** existe un usuario con email `odontologo@example.com`
- **WHEN** se intenta guardar otro usuario con email `Odontologo@Example.com`
- **THEN** el guardado se rechaza y queda un solo usuario con ese email

### Requirement: Rol de usuario permitido
El sistema SHALL aceptar solo el rol `ODONTOLOGO` en el MVP y rechazar cualquier otro valor.

#### Scenario: Rol desconocido
- **WHEN** se intenta guardar un usuario con rol `ADMIN`
- **THEN** el guardado se rechaza

### Requirement: Datos obligatorios del usuario
Todo usuario SHALL tener email (hasta 254 caracteres) y contraseña cifrada; un usuario nuevo nace activo.

#### Scenario: Usuario sin email
- **WHEN** se intenta guardar un usuario sin email
- **THEN** el guardado se rechaza

#### Scenario: Usuario nuevo activo
- **WHEN** se guarda un usuario válido sin indicar estado
- **THEN** el usuario queda activo
