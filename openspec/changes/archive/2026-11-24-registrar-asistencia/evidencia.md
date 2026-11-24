# Evidencia · C-11 registrar-asistencia

## Tests (tarea 3.1)

`.\mvnw.cmd verify` en `backend/` (2026-11-24) contra PostgreSQL `turnos_test` en un contenedor temporal `postgres:15`: **BUILD SUCCESS**, 80 tests unitarios y 197 de integración, sin fallas. `TurnoAsistenciaIT` corrió 19/19, `TurnoIT` 16/16 y `TurnoConcurrenciaIT` 10/10.

## Prueba manual contra el backend (tarea 3.2)

Corrida el 2026-11-24 ~08:50 (-11:00) contra el backend local iniciado con `.\mvnw.cmd spring-boot:run`, base `turnos` en el contenedor temporal `turnos-postgres-manual` (`postgres:15`, puerto 5432). Los turnos se insertaron directamente con `inicio` ya cumplido porque el alta por API prohíbe fechas pasadas (DD-12). El JWT se omitió en el registro; el resto de cada respuesta es textualmente lo devuelto por la API.

### Login

```bash
curl.exe -sS -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' --data-binary '{"email":"odontologo@example.com","password":"ClaveDePrueba123"}' -w "\nHTTP_STATUS:%{http_code}"
```

```json
{"token":"<JWT omitido>","tipo":"Bearer","expiraEn":"2026-11-25T03:50:39.683321800Z"}
HTTP_STATUS:200
```

### Datos previos

```sql
insert into paciente (nombre, apellido, dni) values ('Manual', 'Atendido C11', '09901101') returning id;  -- id 1
insert into paciente (nombre, apellido, dni) values ('Manual', 'Ausente C11', '09901102') returning id;  -- id 2
insert into turno (paciente_id, profesional_id, sillon_id, prestacion_id, inicio, fin, estado)
values (1, (select id from profesional order by id limit 1), (select id from sillon order by id limit 1),
        (select id from prestacion order by id limit 1), '2026-11-24 12:00:00-03', '2026-11-24 12:45:00-03', 'PROGRAMADO') returning id;  -- id 1
insert into turno (paciente_id, profesional_id, sillon_id, prestacion_id, inicio, fin, estado)
values (2, (select id from profesional order by id limit 1), (select id from sillon order by id limit 1),
        (select id from prestacion order by id limit 1), '2026-11-24 13:00:00-03', '2026-11-24 13:45:00-03', 'PROGRAMADO') returning id;  -- id 2
```

### Marcar `ATENDIDO` (turno 1)

```bash
curl.exe -sS -X POST http://localhost:8080/api/turnos/1/asistencia -H 'Authorization: Bearer <JWT>' -H 'Content-Type: application/json' --data-binary '{"estado":"ATENDIDO"}' -w "\nHTTP_STATUS:%{http_code}"
```

```json
{"id":1,"inicio":"2026-11-24T12:00:00-03:00","fin":"2026-11-24T12:45:00-03:00","estado":"ATENDIDO","duracionMinutos":45,"paciente":{"id":1,"nombre":"Manual","apellido":"Atendido C11"},"prestacion":{"id":1,"nombre":"Consulta/control"},"profesionalId":1,"sillonId":1,"observaciones":null,"version":1,"motivoCancelacion":null,"canceladoEn":null}
HTTP_STATUS:200
```

### Reintento sobre el turno 1 con `AUSENTE`

```bash
curl.exe -sS -X POST http://localhost:8080/api/turnos/1/asistencia -H 'Authorization: Bearer <JWT>' -H 'Content-Type: application/json' --data-binary '{"estado":"AUSENTE"}' -w "\nHTTP_STATUS:%{http_code}"
```

```json
{"type":"about:blank","title":"Conflict","status":409,"detail":"Solo se puede registrar asistencia de turnos programados.","instance":"/api/turnos/1/asistencia","codigo":"TRANSICION_INVALIDA"}
HTTP_STATUS:409
```

### `GET /api/turnos/1`

```bash
curl.exe -sS http://localhost:8080/api/turnos/1 -H 'Authorization: Bearer <JWT>' -w "\nHTTP_STATUS:%{http_code}"
```

```json
{"id":1,"inicio":"2026-11-24T12:00:00-03:00","fin":"2026-11-24T12:45:00-03:00","estado":"ATENDIDO","duracionMinutos":45,"paciente":{"id":1,"nombre":"Manual","apellido":"Atendido C11"},"prestacion":{"id":1,"nombre":"Consulta/control"},"profesionalId":1,"sillonId":1,"observaciones":null,"version":1,"motivoCancelacion":null,"canceladoEn":null}
HTTP_STATUS:200
```

### Marcar `AUSENTE` (turno 2)

```bash
curl.exe -sS -X POST http://localhost:8080/api/turnos/2/asistencia -H 'Authorization: Bearer <JWT>' -H 'Content-Type: application/json' --data-binary '{"estado":"AUSENTE"}' -w "\nHTTP_STATUS:%{http_code}"
```

```json
{"id":2,"inicio":"2026-11-24T13:00:00-03:00","fin":"2026-11-24T13:45:00-03:00","estado":"AUSENTE","duracionMinutos":45,"paciente":{"id":2,"nombre":"Manual","apellido":"Ausente C11"},"prestacion":{"id":1,"nombre":"Consulta/control"},"profesionalId":1,"sillonId":1,"observaciones":null,"version":1,"motivoCancelacion":null,"canceladoEn":null}
HTTP_STATUS:200
```

### Reintento sobre el turno 2 con `ATENDIDO`

```bash
curl.exe -sS -X POST http://localhost:8080/api/turnos/2/asistencia -H 'Authorization: Bearer <JWT>' -H 'Content-Type: application/json' --data-binary '{"estado":"ATENDIDO"}' -w "\nHTTP_STATUS:%{http_code}"
```

```json
{"type":"about:blank","title":"Conflict","status":409,"detail":"Solo se puede registrar asistencia de turnos programados.","instance":"/api/turnos/2/asistencia","codigo":"TRANSICION_INVALIDA"}
HTTP_STATUS:409
```

### `GET /api/turnos/2`

```bash
curl.exe -sS http://localhost:8080/api/turnos/2 -H 'Authorization: Bearer <JWT>' -w "\nHTTP_STATUS:%{http_code}"
```

```json
{"id":2,"inicio":"2026-11-24T13:00:00-03:00","fin":"2026-11-24T13:45:00-03:00","estado":"AUSENTE","duracionMinutos":45,"paciente":{"id":2,"nombre":"Manual","apellido":"Ausente C11"},"prestacion":{"id":1,"nombre":"Consulta/control"},"profesionalId":1,"sillonId":1,"observaciones":null,"version":1,"motivoCancelacion":null,"canceladoEn":null}
HTTP_STATUS:200
```

Conclusión: el contrato quedó confirmado contra el backend real: `200` con `TurnoResponse` y `version` 1 en el marcado, `409 TRANSICION_INVALIDA` en el reintento y `GET` devuelve el estado final. No se encontraron diferencias con `design.md`.
