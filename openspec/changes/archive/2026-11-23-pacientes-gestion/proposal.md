# Proposal

## Why

Para dar un turno (C-07) hace falta elegir un paciente. Hoy no hay dónde registrarlos ni buscarlos. C-06 es el cuarto eslabón del camino crítico de [CHANGES.md](../../../CHANGES.md) y, junto con C-05, desbloquea C-07 y la pantalla de pacientes (C-15). Los datos del paciente son sensibles (Ley 25.326): el diseño tiene que cuidar qué se guarda, qué se loguea y quién accede.

## What Changes

- Migración `V4__pacientes.sql`: tabla `paciente` (DNI único, datos de contacto opcionales, consentimiento para recordatorios, baja lógica) y extensión `unaccent` para buscar sin tildes.
- Endpoints autenticados bajo `/api/pacientes`:
  - `POST` alta, `GET /{id}` detalle, `PUT /{id}` edición, `DELETE /{id}` baja lógica.
  - `GET ?q=&page=&size=` búsqueda paginada (20 por página, máximo 100) por apellido, nombre o DNI, sin distinguir mayúsculas ni tildes, solo pacientes activos, ordenada por apellido y nombre.
- Validaciones RN-PA-01/02: DNI de 7 u 8 dígitos y único; nombre y apellido obligatorios; email con formato válido si se informa.
- Errores de negocio: `PACIENTE_NO_ENCONTRADO` (404), `DNI_DUPLICADO` (409), `PACIENTE_INACTIVO` (409).
- Seed de 5 pacientes **ficticios** solo en el perfil `dev`.
- Configuración: `spring.flyway.out-of-order=true`, para que C-05 (V3) y C-06 (V4) se puedan mergear en cualquier orden sin romper las bases ya migradas.

Fuera de alcance: la guarda RN-PA-04 (no dar de baja con turnos futuros) llega en C-09, cuando existan los turnos; ficha clínica; catálogo de obras sociales; pantalla de pacientes (C-15).

## Capabilities

### New Capabilities
- `pacientes`: alta, consulta, búsqueda, edición y baja lógica de pacientes, con sus validaciones y la protección de sus datos personales.

### Modified Capabilities
- Ninguna.

## Impact

- Código nuevo en `backend/.../pacientes` y migración `V4__pacientes.sql`.
- `application.yml`: `spring.flyway.out-of-order: true`.
- Sin dependencias nuevas.
- C-07 usa `paciente` (FK y "paciente activo", RN-AG-08); C-09 agrega la guarda RN-PA-04; C-15 consume estos endpoints.
