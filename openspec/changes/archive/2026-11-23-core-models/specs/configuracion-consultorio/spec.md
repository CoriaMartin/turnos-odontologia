# Spec Delta

## Purpose

Define los parámetros del consultorio que usan las reglas de cancelación tardía y de recordatorios, sus valores por defecto y los límites que impiden configuraciones inválidas.

## ADDED Requirements

### Requirement: Configuración por defecto
Al instalar el sistema SHALL existir una configuración con 24 horas de cancelación tardía, 24 horas de anticipación de recordatorio y zona horaria `America/Argentina/Buenos_Aires`.

#### Scenario: Base recién migrada
- **WHEN** se aplica la migración sobre una base vacía
- **THEN** la configuración tiene cancelación tardía 24, anticipación de recordatorio 24 y zona `America/Argentina/Buenos_Aires`

### Requirement: Configuración única
El sistema SHALL tener exactamente una configuración y rechazar la creación de una segunda.

#### Scenario: Segunda configuración
- **WHEN** se intenta insertar otra configuración
- **THEN** la operación se rechaza y sigue existiendo una sola

### Requirement: Límites de la configuración
Las horas de cancelación tardía SHALL ser mayores o iguales a 0 y las horas de anticipación de recordatorio SHALL ser mayores a 0.

#### Scenario: Cancelación tardía negativa
- **WHEN** se intenta guardar la configuración con cancelación tardía -1
- **THEN** el guardado se rechaza y conserva el valor anterior

#### Scenario: Recordatorio en cero
- **WHEN** se intenta guardar la configuración con anticipación de recordatorio 0
- **THEN** el guardado se rechaza

#### Scenario: Cancelación tardía en cero
- **WHEN** se guarda la configuración con cancelación tardía 0
- **THEN** el guardado se acepta
