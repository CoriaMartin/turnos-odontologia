# consultorio-recursos Specification

## Purpose

Define los recursos que ocupa un turno, el profesional y el sillón, para que la agenda valide solapamientos sobre ellos y el MVP de un consultorio pueda crecer a varios recursos sin rediseño.

## Requirements

### Requirement: Sillón inicial del consultorio
Al instalar el sistema SHALL existir exactamente un sillón activo llamado "Sillón 1".

#### Scenario: Base recién migrada
- **WHEN** se aplica la migración sobre una base vacía
- **THEN** existe un único sillón, activo, con nombre "Sillón 1"

### Requirement: Nombre de sillón único
El sistema SHALL rechazar un sillón cuyo nombre ya exista.

#### Scenario: Sillón duplicado
- **WHEN** se intenta guardar otro sillón llamado "Sillón 1"
- **THEN** el guardado se rechaza

### Requirement: Un profesional por usuario
Cada profesional SHALL estar asociado a exactamente un usuario, y un usuario SHALL tener como máximo un profesional.

#### Scenario: Segundo profesional para el mismo usuario
- **GIVEN** un usuario que ya tiene un profesional
- **WHEN** se intenta guardar otro profesional para ese usuario
- **THEN** el guardado se rechaza

### Requirement: Recursos únicos del consultorio
El sistema SHALL proveer el profesional y el sillón activo que ocupa un turno en el MVP. Si no hay profesional o sillón activo configurado, SHALL fallar con el código de error `CONSULTORIO_NO_CONFIGURADO`.

#### Scenario: Consultorio configurado
- **GIVEN** existe un profesional y el sillón "Sillón 1" activo
- **WHEN** se piden los recursos del consultorio
- **THEN** se obtienen ese profesional y ese sillón

#### Scenario: Sin profesional
- **GIVEN** no existe ningún profesional
- **WHEN** se piden los recursos del consultorio
- **THEN** la operación falla con `CONSULTORIO_NO_CONFIGURADO`

#### Scenario: Sin sillón activo
- **GIVEN** existe un profesional pero ningún sillón activo
- **WHEN** se piden los recursos del consultorio
- **THEN** la operación falla con `CONSULTORIO_NO_CONFIGURADO`
