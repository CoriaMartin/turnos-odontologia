# Spec Delta

## Purpose

Permite saber, sin credenciales, si el backend está levantado y puede hablar con su base de datos, para diagnosticar el entorno de cada integrante y verificar despliegues.

## ADDED Requirements

### Requirement: Estado del servicio accesible sin autenticación
El sistema SHALL exponer `GET /actuator/health` sin requerir autenticación, y responder 200 con `status` igual a `UP` cuando el servicio y la base de datos están operativos.

#### Scenario: Servicio operativo
- **WHEN** un cliente sin credenciales pide `GET /actuator/health` y la base de datos responde
- **THEN** la respuesta tiene estado 200
- **AND** el cuerpo incluye `status` igual a `UP`

#### Scenario: Base de datos caída
- **WHEN** un cliente pide `GET /actuator/health` y la base de datos no responde
- **THEN** la respuesta tiene estado 503
- **AND** el cuerpo incluye `status` igual a `DOWN`

### Requirement: Estado sin detalles internos
La respuesta de estado SHALL contener solo el estado global, sin versiones, URLs de conexión, nombres de base, usuarios ni detalle por componente.

#### Scenario: Respuesta mínima
- **WHEN** un cliente pide `GET /actuator/health`
- **THEN** el cuerpo no incluye la URL de la base de datos ni el detalle de componentes

### Requirement: Otros endpoints de administración no expuestos
Fuera de `health`, ningún endpoint de administración (`/actuator/*`) SHALL estar disponible por HTTP.

#### Scenario: Endpoint de entorno
- **WHEN** un cliente pide `GET /actuator/env`
- **THEN** la respuesta tiene estado 404
