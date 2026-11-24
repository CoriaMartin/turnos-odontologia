# Proposal

## Why

Hoy un turno creado (C-07) solo se puede reprogramar (C-10): si el paciente avisa que no viene, el horario queda ocupado y no hay forma de registrar el aviso ni de distinguir una cancelación tardía (US-033, RN-CA-01 a RN-CA-04). Además la baja de un paciente (C-06) todavía no respeta RN-PA-04 y puede dejar turnos programados de un paciente inactivo. C-09 desbloquea C-17 (`ui-gestion-turnos`), cuyo propose ya asumió este contrato.

## What Changes

- `POST /api/turnos/{id}/cancelacion` con cuerpo opcional `{ "motivo": "..." }` (hasta 255 caracteres; vacío o solo espacios = sin motivo). **Sin `version`**. Responde 200 con el `TurnoResponse` del turno cancelado.
- El estado resultante es `CANCELADO_TARDIO` si faltan **menos** de `horas_cancelacion_tardia` (configuración del consultorio, por defecto 24) para el inicio; si no, `CANCELADO`. Exactamente en el límite = `CANCELADO` (RN-CA-04).
- Registra `cancelado_en` (hora del servidor) y el motivo; el horario queda libre en el momento (RN-AG-10, RN-CA-02): se puede crear otro turno en ese intervalo.
- Solo se cancela un turno `PROGRAMADO` cuyo inicio todavía no llegó; cualquier otro caso → 409 `TRANSICION_INVALIDA` sin cambios (RN-ES-02, RN-ES-04). Turno inexistente → 404 `TURNO_NO_ENCONTRADO`.
- Dos cancelaciones simultáneas del mismo turno: una responde 200 y la otra 409 `TRANSICION_INVALIDA`.
- `TurnoResponse` suma `motivoCancelacion` y `canceladoEn` (nulos si no se canceló). Cambio compatible.
- Guarda RN-PA-04 en `DELETE /api/pacientes/{id}`: si el paciente tiene turnos `PROGRAMADO` con inicio futuro, responde 409 `PACIENTE_CON_TURNOS_FUTUROS` y no lo da de baja.

Fuera de alcance: deshacer una cancelación, cancelar turnos en lote al dar de baja un paciente, aviso por email al paciente, evento de dominio de cancelación (C-13 relee el estado antes de enviar), endpoints de configuración (C-12) y la pantalla (C-17).

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- `turnos`: se agregan la cancelación de un turno (anticipada y tardía), la liberación del horario, el rechazo de transiciones inválidas y los datos de cancelación en la consulta.
- `pacientes`: la baja lógica se rechaza si el paciente tiene turnos programados futuros (RN-PA-04).

## Impact

- Backend `agenda/turnos` (entidad, servicio, repositorio, controlador, `TurnoResponse`) y `pacientes` (servicio y un puerto para consultar turnos futuros). Lee `ConfiguracionService` (ya existe desde C-04). Sin migraciones: `motivo_cancelacion` y `cancelado_en` ya existen en `turno` (V5).
- API: endpoint nuevo, dos campos nuevos en `TurnoResponse` y un 409 nuevo en la baja de paciente. C-15 (baja de paciente) y C-17 (cancelar) consumen estos contratos.
- Contrato acordado con el propose de C-17 (`ui-gestion-turnos`, design D2): cuerpo `{ "motivo" }` opcional, 200 con `TurnoResponse`, sin `version`.
