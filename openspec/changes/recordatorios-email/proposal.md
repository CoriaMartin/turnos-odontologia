## Why

Implementar C-13 para recordar al paciente sus turnos
programados mediante email, respetando el consentimiento,
la privacidad y la configuracion del consultorio.

## What Changes

- Crear la migracion V6__notificaciones.sql.
- Registrar notificaciones con unicidad por turno y tipo.
- Incorporar el puerto EnviadorEmail y su adaptador SMTP.
- Mantener MAIL_ENABLED=false por defecto (DD-13).
- Ejecutar recordatorios cada 15 minutos.
- Limitar los envios a pacientes con consentimiento (DD-14).
- Registrar resultados y limitar a tres intentos totales.
- Revalidar el turno antes de enviar.
- Reiniciar la marca al reprogramar.
- Exponer GET /api/turnos/{id}/notificaciones.
- Verificar todos los escenarios sin SMTP real.

## Capabilities

### New Capabilities

- `recordatorios-email`: seleccion, envio, registro,
  reintentos y consulta de recordatorios.

### Modified Capabilities

Ninguna regla existente de agenda cambia.

## Impact

- Backend: modulo de notificaciones, agenda y configuracion.
- PostgreSQL: migracion V6.
- API: nuevo endpoint autenticado.
- C-18: consulta del estado del recordatorio.
- Dependencias: C-07, C-10 y configuracion de C-12.
- Governance: ALTO.

## Fuera de alcance

Proveedor SMTP real, credenciales reales, WhatsApp,
datos clinicos y modificaciones del frontend.