## Why

C-12 permite al odontólogo consultar y actualizar los parámetros
del consultorio según US-050, RN-CA-01 y RN-RE-01.

Este documento reconstruye el alcance del cambio implementado
en el PR #16 y completa su cierre técnico y documental.

## What Changes

- Consulta de configuración mediante GET /api/configuracion.
- Actualización mediante PUT /api/configuracion.
- Validación de los límites de ambos parámetros.
- Conservación de los turnos existentes.
- Acceso mediante autenticación JWT.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `configuracion-consultorio`: incorporar el contrato de la API
  y el comportamiento de las actualizaciones.

## Impact

- Módulo backend configuracion.
- API REST de configuración.
- Pruebas de integración y persistencia.
- Sin nuevas migraciones ni cambios de interfaz gráfica.
- El envío de recordatorios corresponde a C-13.
