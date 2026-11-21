# Flujos Principales

## Flujo 1: Login
**Disparador**: el odontólogo abre la web app. **Actor**: odontólogo.

1. Frontend envía `POST /api/auth/login` con email y contraseña.
2. Backend valida contra BCrypt y el contador de intentos (RN-AU-03).
3. Backend devuelve un JWT con vencimiento.
4. Frontend guarda el token en memoria y lo envía en `Authorization: Bearer`.

**Casos de error**:
- Credenciales inválidas → 401 con mensaje genérico.
- Bloqueo por intentos → 429 con tiempo de espera.

## Flujo 2: Crear turno sin solapamientos
**Disparador**: el odontólogo elige un horario libre en la agenda. **Actor**: odontólogo.

1. Frontend busca paciente (`GET /pacientes?q=`) y elige prestación; propone la duración.
2. Frontend envía `POST /api/turnos` con paciente, prestación, inicio y duración.
3. Servicio valida: paciente y prestación activos, inicio futuro, duración en rango.
4. Servicio calcula `fin` y busca turnos activos que se superpongan para el profesional y el sillón (`[inicio, fin)`).
5. Si no hay conflicto, guarda en estado `PROGRAMADO` dentro de una transacción.
6. PostgreSQL vuelve a verificar con las restricciones de exclusión.
7. Backend responde 201 con el turno.

```
Odontólogo → Frontend → API (TurnoService) → PostgreSQL
                         valida reglas
                         busca solapes ─────▶ SELECT ... &&
                         INSERT ─────────────▶ EXCLUDE gist
                         ◀───────────── ok / 23P01
           ◀── 201 / 409 TURNO_SOLAPADO
```

**Casos de error**:
- Solapamiento detectado por el servicio → 409 `TURNO_SOLAPADO` con el turno en conflicto.
- Violación de exclusión (`SQLSTATE 23P01`) por concurrencia → 409 `TURNO_SOLAPADO`.
- Inicio en el pasado → 422 `TURNO_EN_PASADO`.
- Paciente o prestación inactivos → 422.

## Flujo 3: Reprogramar turno
1. Frontend envía `PUT /api/turnos/{id}/reprogramacion` con nuevo inicio y duración.
2. Servicio verifica estado `PROGRAMADO` e inicio original futuro.
3. Revalida solapamiento excluyendo el propio turno.
4. Actualiza horario y reinicia la marca de recordatorio (RN-RE-05).

**Casos de error**: estado no válido → 409 `TRANSICION_INVALIDA`; solape → 409 `TURNO_SOLAPADO`; edición concurrente → 409 por bloqueo optimista.

## Flujo 4: Cancelar turno
1. Frontend envía `POST /api/turnos/{id}/cancelacion` con motivo opcional.
2. Servicio verifica estado `PROGRAMADO` e inicio futuro.
3. Compara la anticipación con `horas_cancelacion_tardia` y define `CANCELADO` o `CANCELADO_TARDIO`.
4. Guarda `cancelado_en`; el horario queda libre.

## Flujo 5: Registrar asistencia
1. Frontend envía `POST /api/turnos/{id}/asistencia` con `ATENDIDO` o `AUSENTE`.
2. Servicio verifica estado `PROGRAMADO` y que la hora actual sea mayor o igual al inicio.

## Flujo 6: Enviar recordatorios
**Disparador**: tarea programada cada 15 minutos. **Actor**: sistema.

1. Busca turnos `PROGRAMADO` con inicio entre ahora y ahora + `horas_anticipacion_recordatorio`, sin notificación `ENVIADA` y con menos de 3 intentos.
2. Descarta pacientes sin email o sin `acepta_recordatorios`.
3. Envía el email a través de la interfaz `EnviadorEmail` (implementación SMTP).
4. Registra la notificación como `ENVIADA` o `FALLIDA` con el error.

**Casos de error**: SMTP caído → `FALLIDA`, se reintenta en la próxima ejecución; turno cancelado entre la consulta y el envío → no se envía (se relee el estado).
