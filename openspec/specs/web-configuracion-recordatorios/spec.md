# web-configuracion-recordatorios Specification

## Purpose

Define la pantalla de configuración de recordatorios que el odontólogo usa para ver y modificar las horas de cancelación tardía y de anticipación del recordatorio, y para verificar el estado del recordatorio en el detalle del turno. Hereda la configuración del consultorio (C-12) y la lógica de envío (C-13).

## Requirements

### Requirement: Pantalla de configuración

La pantalla SHALL mostrar un formulario con dos campos numéricos:
- Horas de cancelación tardía (por defecto 24).
- Horas de anticipación del recordatorio (por defecto 24).

Ambos campos SHALL aceptar solo números enteros mayores o iguales a 0 para cancelación y mayores a 0 para recordatorio. El campo de recordatorio SHALL rechazar 0.

#### Scenario: Pantalla carga con valores por defecto

- **WHEN** la pantalla se monta con sesión iniciada
- **THEN** el formulario muestra cancelación: 24 y recordatorio: 24, y los campos están válidos.

#### Scenario: Se guardan horas válidas

- **WHEN** el odontólogo modifica las horas y hace clic en "Guardar"
- **THEN** se envía `PUT /api/configuracion` con los nuevos valores y el formulario muestra `GUARDAR_EXITOSO` sin códigos técnicos.

#### Scenario: Se rechazan horas inválidas

- **WHEN** el odontólogo deja el campo de cancelación en -1 o el de recordatorio en 0
- **THEN** el guardado se rechaza y el formulario muestra `HORAS_INVALIDAS` con el motivo en español rioplatense, sin exponer códigos técnicos del backend.

### Requirement: Estado del recordatorio en el detalle del turno

El detalle del turno SHALL mostrar uno de los siguientes estados de recordatorio, según corresponda:
- `no aplica` — si el paciente no tiene email.
- `pendiente` — si el turno está programado y falta más de la ventana de envío.
- `enviado` — si el recordatorio ya fue enviado exitosamente.
- `fallido` — si el envío falló después de los intentos permitidos.
- `no consentido` — si el paciente tiene email pero `acepta_recordatorios` es false.

#### Scenario: Se muestra el estado según la situación del paciente

- **WHEN** se muestra el detalle de un turno y el paciente tiene email y acepta recordatorios
- **THEN** el estado muestra `pendiente` (o `enviado` si ya se envió).
- **WHEN** el paciente no tiene email
- **THEN** el estado muestra `no aplica`.
- **WHEN** el paciente tiene email pero no aceptó recordatorios
- **THEN** el estado muestra `no consentido`.

## Impact

- **Frontend**: `src/features/configuracion/ConfiguracionPage.tsx`, `src/features/configuracion/ConfiguracionPage.module.css`, `src/features/turnos/DetalleTurno.tsx` (estado del recordatorio).
- **Backend**: usa los endpoints ya existentes de C-12 (`GET /api/configuracion`, `PUT /api/configuracion`); no requiere nuevos endpoints.
- **Dependencias**: C-12 (configuración del consultorio), C-13 (recordatorios-email), C-14 (ui-login, para protección de rutas).
- **Governance**: BAJO.