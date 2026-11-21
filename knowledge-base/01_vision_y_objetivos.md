# Visión y Objetivos

## Propósito del sistema

Dar al odontólogo independiente argentino una agenda digital confiable que impida turnos superpuestos, reduzca ausencias mediante recordatorios y le devuelva tiempo clínico.

Hoy el odontólogo independiente coordina su agenda con papel, WhatsApp o planillas. Eso produce dobles reservas, olvidos del paciente y tiempo perdido coordinando. La investigación competitiva ([informe](../discovery/informe-competitivo.md)) muestra que los sistemas del mercado apuntan mayormente a clínicas, y que ninguno de los 16 analizados demostró públicamente cómo garantiza la ausencia de solapamientos ante operaciones simultáneas. Este sistema hace de esa garantía su núcleo verificable.

Fuente: [discovery/discovery.md](../discovery/discovery.md).

## Objetivos por actor

| Actor | Objetivo principal | Objetivos secundarios |
|---|---|---|
| Odontólogo | Gestionar su agenda sin superposiciones | Encontrar pacientes rápido; ver el día y la semana; registrar ausencias y cancelaciones tardías |
| Paciente (no usa el sistema) | No olvidar su turno | Recibir el recordatorio en su email con anticipación |

## Alcance v1.0 (MVP)

- Login del único usuario (odontólogo) con contraseña y token.
- Catálogo de prestaciones con duración predeterminada.
- Alta, edición, búsqueda y baja lógica de pacientes con datos básicos (contacto y obra social).
- Creación de turnos sin solapamiento por profesional ni por sillón.
- Reprogramación y cancelación de turnos, con registro de cancelación tardía.
- Registro de asistencia: atendido o ausente.
- Agenda con vista diaria y semanal.
- Recordatorio automático por email antes del turno, con registro de envío.
- Configuración de las ventanas de cancelación tardía y de recordatorio.

## Fuera de alcance (v1.0)

- Reserva o solicitud online por el paciente; portal del paciente.
- Ficha clínica, anamnesis, evoluciones, odontograma, imágenes.
- Varios profesionales, varios sillones, sucursales, asistente con permisos propios.
- Sobreturnos autorizados.
- Horario de atención y bloqueos de agenda.
- WhatsApp (API o manual), SMS, Google Calendar.
- Cobros, señas, Mercado Pago, facturación ARCA, obras sociales con liquidaciones.
- Lista de espera y recuperación de huecos.
- Exportación completa con adjuntos; app móvil nativa; IA.

## Métricas de éxito

| Métrica | Meta para el MVP | Cómo se mide |
|---|---|---|
| Turnos superpuestos | 0 | Restricción en base de datos y tests de concurrencia |
| Escenarios de spec cubiertos por tests | 100 % | Cada escenario de `openspec/specs` tiene al menos un test automatizado |
| Recordatorios enviados a tiempo | ≥ 95 % de turnos con email y consentimiento | Registro de notificaciones |
| Tiempo para crear un turno | < 30 s con paciente existente | Prueba de uso en la demo |
